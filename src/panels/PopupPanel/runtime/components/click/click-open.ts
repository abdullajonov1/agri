/**
 * Open the popup for a uniqueid (table / Graff selection path) and resolve the
 * attributes it displays (Agri table join, latest vegetation indices).
 */
import type { PopupWidgetHost } from "../../popup-host";
import type { PopupAttributes } from "../../popup-types";
import { messageOrString } from "../../popup-type-guards";
import { AGRI_TABLE_JOIN_FIELD, queryAgriRecordByUniqueId } from "../../../../../gis/agri-table-data-source";
import { escapeArcGIS } from "../../../../../data/agri-sql";
import { getAgriLayerMapKey } from "../../../../../gis/feature-layer-data";
import { agriMapClickDebug, agriMapClickWarn } from "../../../../../gis/agri-map-click-debug";
import { findAttributeValueCaseInsensitive as findAttributeValueCaseInsensitiveShared } from "../../popup-format-helpers";
import { queryVegetationSeriesForUniqueId, formatArcgisDateToYmd } from "../../../../../gis/agri-vegetation-data-source";
import { VEG_INDEX_FIELDS as popupVegIndexFields } from "../../popup-constants";

/**
 * Open (or refresh) the field popup for a polygon uniqueid — used when
 * selection comes from the table/Graff path (map click already opens itself).
 */
export const openPopupForUniqueid = async (host: PopupWidgetHost, uniqueid: string, opts?: { zoom?: boolean; notifySelection?: boolean }): Promise<void> => {
  const clean = String(uniqueid || "")
    .replace(/[{}]/g, "")
    .trim();
  if (!clean || !host._isMounted) return;

  const active = String(host._activeInspectedUniqueid || "")
    .replace(/[{}]/g, "")
    .trim();
  if (host.state.showPopup && active === clean && host.state.selectedAttrs) {
    if (host.state.popupMinimized) {
      host.expandPopup();
    } else {
      host.broadcastPopupVisibility(true);
    }
    return;
  }

  const jmv = host.state.jimuMapView;
  const view = jmv?.view;
  if (!view || !jmv) return;

  const clickGeneration = ++host._clickGeneration;
  const isStale = () =>
    !host._isMounted || clickGeneration !== host._clickGeneration;

  host.setState({
    loading: true,
    error: null,
    loadingAttachments: true,
    attachments: [],
    attachmentsExpanded: true,
  });

  try {
    const layers = await host.resolveClickLayers(view, jmv);
    if (isStale()) return;

    let feature: __esri.Graphic | null = null;
    let clickedLayer: __esri.FeatureLayer | null = null;

    for (const layer of layers) {
      if (!host.isAgriculturalFieldLayer(layer)) continue;
      if (!host.isLayerEffectivelyVisible(layer, view)) continue;
      const detached = await host.getDetachedQueryLayer(layer);
      if (isStale()) return;
      const queryTarget = detached || layer;
      const variants = [clean, `{${clean}}`];
      for (const v of variants) {
        const q = queryTarget.createQuery();
        q.outFields = ["*"];
        q.returnGeometry = true;
        q.num = 1;
        q.where = `${AGRI_TABLE_JOIN_FIELD}='${escapeArcGIS(v)}'`;
        try {
          const res = await queryTarget.queryFeatures(q);
          if (res.features?.[0]) {
            feature = res.features[0];
            clickedLayer = layer;
            break;
          }
        } catch {
          /* try next variant / layer */
        }
      }
      if (feature) break;
    }

    if (!feature || !clickedLayer || isStale()) {
      if (!isStale()) {
        host.setState({
          loading: false,
          loadingAttachments: false,
          attachments: [],
        });
      }
      return;
    }

    const liveLayer =
      (host.toLiveMapLayer(clickedLayer, view.map) ||
        clickedLayer) as __esri.FeatureLayer;
    const layerKey =
      getAgriLayerMapKey(liveLayer) ||
      String(liveLayer?.url || liveLayer?.id || "");
    const dsId = host.state.layerKeyToDsId?.[layerKey] || null;
    const oidField =
      liveLayer.objectIdField ||
      liveLayer.fields?.find((fld) => fld.type === "oid")?.name ||
      null;
    if (!oidField) {
      if (!isStale()) {
        host.setState({
          loading: false,
          loadingAttachments: false,
          showPopup: false,
        });
      }
      return;
    }

    const oid = feature.attributes?.[oidField];
    if (oid == null) {
      if (!isStale()) {
        host.setState({
          loading: false,
          loadingAttachments: false,
          showPopup: false,
        });
      }
      return;
    }

    const outFields = host.getOutFields(liveLayer, oidField);
    const f =
      (await host.queryFeatureByObjectIdCached(
        liveLayer,
        oidField,
        oid,
        outFields,
      )) || feature;
    if (isStale()) return;

    if (f.geometry) host.highlightPolygon(f.geometry);

    const displayAttrs = await host.resolveDisplayAttrs(f.attributes);
    if (isStale()) return;

    const shouldPin = host.state.pinToCorner;
    const popupPosition = shouldPin
      ? host.calculatePinnedPosition(view)
      : host.state.popupPosition || host.calculatePinnedPosition(view);

    const configuredFields = host.props.config?.fieldsToShow || [];
    const actualFields = Object.keys(displayAttrs);
    const missingFields = configuredFields.filter(
      (field) => !actualFields.includes(field),
    );
    const fieldsWithData = configuredFields.filter(
      (name) =>
        displayAttrs.hasOwnProperty(name) &&
        displayAttrs[name] != null &&
        displayAttrs[name] !== "",
    );

    host._activeInspectedUniqueid = clean;
    host.setState({
      loading: false,
      lastClickedDsId: dsId,
      lastClickedLayerKey: layerKey,
      selectedAttrs: displayAttrs,
      selectedOID: Number(oid),
      objectIdField: oidField,
      showPopup: true,
      popupMinimized: false,
      chartExpanded: shouldPin,
      chartHoverIndex: null,
      popupPosition,
      error:
        missingFields.length > 0
          ? host.tr("error.configuredFieldMissing", {
              fields: missingFields.join(", "),
            })
          : fieldsWithData.length === 0 && configuredFields.length > 0
            ? host.tr("error.noDataForConfiguredFields")
            : null,
    });

    if (opts?.notifySelection) {
      host.notifyGraffPolygonSelection(clean, true, Date.now());
    }
    void host.fetchLatestVegetationIndices(clean);

    if (opts?.zoom !== false && f.geometry && !isStale()) {
      try {
        if (!host._extentBeforeSelection && view.extent?.clone) {
          host._extentBeforeSelection = view.extent.clone();
        }
        const target =
          f.geometry.extent?.expand?.(1.08) || f.geometry;
        void view.goTo(
          { target },
          { duration: 650, easing: "ease-in-out" },
        );
      } catch {
        /* zoom is cosmetic — the popup is already open */
      }
    }

    if (host.props.config?.settings?.showAttachments !== false) {
      try {
        const clickedUrl = String(liveLayer.url || "").trim();
        const attachmentLayer =
          (clickedUrl && host._queryOnlyLayers.get(clickedUrl)) || liveLayer;
        await host.loadAttachmentsForOid(attachmentLayer, Number(oid));
      } catch {
        if (!isStale()) {
          host.setState({ loadingAttachments: false, attachments: [] });
        }
      }
    } else if (!isStale()) {
      host.setState({ loadingAttachments: false, attachments: [] });
    }

    if (!isStale()) {
      host.schedulePopupLayoutAfterContent();
    }
  } catch (e: unknown) {
    if (!isStale()) {
      host.setState({
        loading: false,
        loadingAttachments: false,
        error: messageOrString(e),
      });
    }
  }
};
/** Case-insensitive attribute lookup — the polygon layer's join field casing is not guaranteed. */
export function findAttributeValueCaseInsensitive(host: PopupWidgetHost, attributes: PopupAttributes | null | undefined, fieldName: string): unknown {
  return findAttributeValueCaseInsensitiveShared(attributes, fieldName);
}
/**
 * Latest-day vegetation index values for the selected polygon, shown in
 * the popup. Reuses queryVegetationSeriesForUniqueId (queries the
 * agri_vegetation_indices ArcGIS table directly, same source AgriGraff10's
 * chart uses) rather than the api-agri export-image/available-dates REST
 * endpoints — those are for fetching a rendered raster for a specific
 * chosen date, which is unnecessary here; we only need the scalar index
 * values for whichever date is most recent, and the table already has
 * ndvi/savi/rvi/ci/evi/ndwi as plain fields per (uniqueid, raster_date).
 */
export const fetchLatestVegetationIndices = async (host: PopupWidgetHost, uniqueId: string): Promise<void> => {
  const id = String(uniqueId || "").trim();
  if (!id) {
    host.setState({
      loadingLatestIndices: false,
      latestIndexDate: null,
      latestIndexValues: null,
    });
    return;
  }

  const requestId = ++host._latestIndicesRequestId;
  agriMapClickDebug("vegetation:request", {
    uniqueid: id,
    source: "agri_vegetation_indices/FeatureServer/1",
    requestId,
  });
  host.setState({
    loadingLatestIndices: true,
  });

  try {
    const rows = await queryVegetationSeriesForUniqueId(id);
    if (!host._isMounted || requestId !== host._latestIndicesRequestId) return;

    if (!rows.length) {
      host.setState({
        loadingLatestIndices: false,
        latestIndexDate: null,
        latestIndexValues: null,
      });
      return;
    }

    // Rows come back ordered by raster_date ASC — the last one is the
    // most recent processed date for this polygon.
    const latest: PopupAttributes = rows[rows.length - 1];
    const date = formatArcgisDateToYmd(latest.raster_date);
    const values: Record<string, number> = {};
    for (const field of popupVegIndexFields) {
      const v = Number(latest[field]);
      if (Number.isFinite(v)) values[field] = v;
    }
    agriMapClickDebug("vegetation:response", {
      uniqueid: id,
      requestId,
      rowCount: rows.length,
      latestDate: date,
      values,
    });

    host.setState({
      loadingLatestIndices: false,
      latestIndexDate: date,
      latestIndexValues: Object.keys(values).length ? values : null,
    });
  } catch {
    if (!host._isMounted || requestId !== host._latestIndicesRequestId) return;
    host.setState({
      loadingLatestIndices: false,
      latestIndexDate: null,
      latestIndexValues: null,
    });
  }
};
/**
 * Agri_table_data is an external Table (no geometry) — the map click still
 * resolves the polygon feature for highlight/zoom, but the displayed
 * attributes come from Agri_table_data, joined by uniqueid.
 */
export async function resolveDisplayAttrs(host: PopupWidgetHost, polygonAttributes: PopupAttributes | null | undefined): Promise<PopupAttributes> {
  const joinValue = host.findAttributeValueCaseInsensitive(
    polygonAttributes,
    AGRI_TABLE_JOIN_FIELD,
  );
  if (joinValue == null || String(joinValue).trim() === "") {
    agriMapClickWarn("agri-table-join:SKIP-no-uniqueid", {
      polygonAttributeKeys: Object.keys(polygonAttributes || {}),
    });
    return polygonAttributes || {};
  }
  try {
    agriMapClickDebug("agri-table-join:request", {
      uniqueid: String(joinValue),
      source: "Agri_table_data/FeatureServer/2",
    });
    const agriRecord = await queryAgriRecordByUniqueId(String(joinValue));
    agriMapClickDebug("agri-table-join:response", {
      uniqueid: String(joinValue),
      found: Boolean(agriRecord),
      attributeKeys: Object.keys(agriRecord || {}),
    });
    if (agriRecord) {
      // Keep polygon-only values (for example st_area(shape)) while allowing
      // the joined Agri table to provide/override the popup's business data.
      return { ...(polygonAttributes || {}), ...agriRecord };
    }
  } catch (e) {
    agriMapClickWarn("Agri_table_data lookup failed", {
      uniqueId: joinValue,
      error: messageOrString(e),
    });
  }
  return polygonAttributes || {};
}
