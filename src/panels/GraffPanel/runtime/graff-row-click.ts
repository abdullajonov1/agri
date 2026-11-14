import { AGRI_EVENTS } from "../../../shared/agri-events";
import { applyGraffDefinitionExpression, describeThrown, type AgriQueryableLayer } from "./graff-guards";
import { arcgisEaseInOut } from "../../../shared/agri-plain-object";
import type { TaggedLayer } from "./components/spatial-candidates";
import type { JimuMapView } from "jimu-arcgis";
import { ensureAgriServerIdentityToken, getDetachedQueryLayerForUrl, resolveQueryableServiceUrl } from "../../../gis/feature-layer-data";
import { AGRI_TABLE_JOIN_FIELD } from "../../../gis/agri-table-data-source";
import { buildUniqueidUpperEqualsWhere } from "../../../data/agri-uniqueid-sql";
import { clearMapSelectionGraphics, isLayerTreeVisible } from "./graff-map-utils";
import { copyUniqueIdToClipboard } from "./graff-clipboard";
import { graffDebugCatch, graffLog } from "./graff-log";
import type { RecordData } from "./widget";
import type { GraffMapInteractionHost } from "./graff-map-interaction";

/** Clears the selection when the clicked row is already the selected polygon. */
const clearRowSelection = async (
  host: GraffMapInteractionHost,
  activeMapView: JimuMapView,
  featureLayer: __esri.FeatureLayer,
): Promise<void> => {
  // Clear highlight graphics only
  clearMapSelectionGraphics(activeMapView.view);

  const restoreExtent = host._extentBeforeTableSelection;
  host._extentBeforeTableSelection = null;
  if (restoreExtent) {
    try {
      await activeMapView.view.goTo(restoreExtent, {
        duration: 700,
        easing: arcgisEaseInOut,
      });
    } catch {
      /* navigation interruption is harmless */
    }
  }

  // AgriLocalization owns the spatial zoom-out after the polygonMode=false
  // event below. The Graff data source can be a non-spatial table, so it
  // must not attempt queryExtent here.

  // Only clear the row selection / graph data - keep regional filters intact
  host.cancelVegetationImageOverlay();
  host._polygonSelectionOrigin = null;
  host._selectionCommittedAt = 0;
  host.setState(
    {
      selecteduniqueid: "",
      selectedNdviDate: null,
      selectedChartIndexKey: null,
      polygonAvailableDates: [],
      polygonImageError: null,
      vegetationError: null,
    },
    () => {
      // Restore normal regional filter when row selection is cleared.
      // MapImage-owned sublayers keep AgriLocalization tuman/turi DE.
      try {
        const baseWhere = host.buildWhereClause();
        applyGraffDefinitionExpression(featureLayer, host.state.dataSource, baseWhere || "1=0");
      } catch (err) {
        graffDebugCatch("tableRow:restoreDefinitionExpression", err);
      }
      try {
        document.dispatchEvent(
          new CustomEvent(AGRI_EVENTS.widgetSelectionChanged, {
            detail: {
              source: "AgriGraffWidget",
              polygonMode: false,
              timestamp: Date.now(),
            },
            bubbles: true,
          }),
        );
      } catch (err) {
        graffDebugCatch("tableRow:dispatchSelectionChanged", err);
      }
      if (host.state.viewMode === "graph") {
        host.fetchRegionalTimeseries();
      }
    },
  );
};

interface ResolvedRowGeometry {
  results: __esri.FeatureSet | null;
  candidateCount: number;
  uniqueWhere: string;
}

/**
 * Queries the spatial polygon layer(s) by uniqueid. Returns null when the
 * click became stale while awaiting.
 */
const resolveRowGeometry = async (
  host: GraffMapInteractionHost,
  record: RecordData,
  uniqueid: string | undefined,
  isStaleClick: () => boolean,
): Promise<ResolvedRowGeometry | null> => {
  let results: __esri.FeatureSet | null = null;
  await ensureAgriServerIdentityToken();
  const spatialLayersForHighlight = host.getTableSpatialQueryCandidates();
  graffLog("tableRow:spatial-candidates", {
    count: spatialLayersForHighlight.length,
    layers: spatialLayersForHighlight.map((layer: TaggedLayer) => ({
      title: layer?.title || null,
      url:
        layer?.__agriQueryableUrl ||
        resolveQueryableServiceUrl(layer) ||
        layer?.url ||
        null,
      visible: isLayerTreeVisible(layer),
    })),
  });

  const uniqueWhere = record.uniqueid
    ? buildUniqueidUpperEqualsWhere(
        String(record.uniqueid),
        AGRI_TABLE_JOIN_FIELD,
      )
    : "";

  for (const spatialLayer of spatialLayersForHighlight) {
    if (isStaleClick()) return null;
    const url =
      String((spatialLayer as AgriQueryableLayer)?.__agriQueryableUrl || "").trim() ||
      resolveQueryableServiceUrl(spatialLayer);
    if (!url) continue;

    let detached: __esri.FeatureLayer | null | undefined =
      host._detachedSpatialQueryLayers.get(url);
    if (!detached) {
      try {
        detached = await getDetachedQueryLayerForUrl(url);
        if (detached) host._detachedSpatialQueryLayers.set(url, detached);
      } catch (err) {
        graffLog("tableRow:detached-FAILED", {
          url,
          error: describeThrown(err),
        });
        detached = null;
      }
    }
    // Never query the live MapImage sublayer - it rehydrates and can
    // clear the district definitionExpression (other districts flash).
    if (!detached) {
      graffLog("tableRow:skip-no-detached", {
        url,
        title: spatialLayer?.title || null,
      });
      continue;
    }
    if (isStaleClick()) return null;

    if (uniqueWhere && uniqueWhere !== "1=0") {
      const q = detached.createQuery();
      q.outFields = ["*"];
      q.returnGeometry = true;
      q.num = 1;
      q.where = uniqueWhere;
      try {
        results = await detached.queryFeatures(q);
      } catch (err) {
        graffLog("tableRow:query-FAILED", {
          url,
          where: uniqueWhere,
          error: describeThrown(err),
        });
        results = null;
      }
    }

    if (results?.features?.length) {
      graffLog("tableRow:geometry-found", {
        uniqueid: uniqueid || null,
        layer: spatialLayer?.title || null,
        url,
      });
      break;
    }
  }

  return { results, candidateCount: spatialLayersForHighlight.length, uniqueWhere };
};

/** Highlights + zooms to the resolved feature (or logs when none was found). */
const highlightResolvedFeature = (
  host: GraffMapInteractionHost,
  activeMapView: JimuMapView,
  uniqueid: string | undefined,
  resolved: ResolvedRowGeometry,
): void => {
  const { results, candidateCount, uniqueWhere } = resolved;
  if (results?.features?.length) {
    const feature = results.features[0];
    if (!host._extentBeforeTableSelection && activeMapView.view.extent?.clone) {
      host._extentBeforeTableSelection = activeMapView.view.extent.clone();
    }
    // Same cyan outline-only highlight + zoom as AgriPopup map-click.
    // Do not await goTo - overlay fetch must start immediately.
    void host.highlightFeature(feature, activeMapView);
  } else {
    graffLog("tableRow:geometry-NOT-found", {
      uniqueid: uniqueid || null,
      candidateCount,
      where: uniqueWhere || null,
    });
  }
};

/** Commits the new row selection: overlay reset, timestamps, setState. */
const commitRowSelection = (
  host: GraffMapInteractionHost,
  featureLayer: __esri.FeatureLayer,
  uniqueid: string | undefined,
): void => {
  // A different polygon is now selected - any raster overlay/date
  // selection from the previous one no longer applies.
  host.cancelVegetationImageOverlay();
  host.beginVegetationImageSurfaceLoading();
  // Row-click selection is authoritative "now" - mark it so a
  // late-arriving stale external (AgriPopup) notification for an
  // earlier map click can't silently override it afterwards.
  host._lastAppliedPolygonClickedAt = Date.now();

  host._polygonSelectionOrigin = "table";
  host._selectionCommittedAt = Date.now();
  host.setState(
    {
      loading: false,
      selecteduniqueid: uniqueid,
      // Stay on the table when the user picks a row here; map highlight/
      // zoom still run above. Chart opens only via the Graph toggle
      // (or via AgriPopup map-click -> syncExternalPolygonSelection).
      error: null,
      vegetationError: null,
      selectedNdviDate: null,
      selectedChartIndexKey: null,
      polygonAvailableDates: [],
      polygonImageError: null,
    },
    () => {
      // Keep only the selected row polygon visible on the map layer.
      // MapImage-owned sublayers keep AgriLocalization tuman/turi DE -
      // rewriting them forces an export that flashes other districts.
      try {
        const baseWhere = host.buildWhereClause();
        const uniqueClause = host.builduniqueidWhere(
          String(uniqueid || ""),
          "uniqueid",
        );
        const selectedWhere =
          baseWhere && baseWhere !== "1=0"
            ? `(${baseWhere}) AND ${uniqueClause}`
            : uniqueClause;
        applyGraffDefinitionExpression(featureLayer, host.state.dataSource, selectedWhere || "1=0");
      } catch (err) {
        graffDebugCatch("tableRow:selectedDefinitionExpression", err);
      }

      try {
        document.dispatchEvent(
          new CustomEvent(AGRI_EVENTS.widgetSelectionChanged, {
            detail: {
              source: "AgriGraffWidget",
              polygonMode: true,
              uniqueid: uniqueid || "",
              timestamp: Date.now(),
            },
            bubbles: true,
          }),
        );
      } catch (err) {
        graffDebugCatch("tableRow:dispatchSelectionChanged", err);
      }

      // Chart series + season-aware raster walk (single flight). Do not also
      // call kickOptimistic here - that stacked a second 400 cascade.
      host.fetchVegetationData();
      void host.ensureSelectedRowVisible(uniqueid);
    },
  );
};

export const handleGraffRowClick = async (host: GraffMapInteractionHost, record: RecordData) => {
  graffLog("tableRow:click", {
    uniqueid: record?.uniqueid || null,
    objectid: record?.objectid ?? null,
    recordTuman: String(record?.tuman || ""),
    recordViloyat: String(record?.viloyat || ""),
    filterViloyat: host.state.regionalFilters?.viloyat || "",
    filterTuman: host.state.regionalFilters?.tuman || "",
    interactionEnabled: host.isRegionalInteractionEnabled(),
    hasFeatureLayer: !!host.state.featureLayer,
    hasMapView: !!host.state.activeMapView,
    spatialCandidateCount: host.getTableSpatialQueryCandidates().length,
  });
  if (!host.isRegionalInteractionEnabled()) {
    graffLog("tableRow:click:BLOCKED-no-interaction", {
      viloyat: host.state.regionalFilters?.viloyat || "",
      tuman: host.state.regionalFilters?.tuman || "",
    });
    return;
  }

  const { featureLayer, activeMapView, selecteduniqueid } = host.state;

  if (record?.uniqueid) {
    void copyUniqueIdToClipboard(String(record.uniqueid));
  }

  if (!record || !featureLayer || !activeMapView) {
    graffLog("tableRow:click:BLOCKED-missing-layer-or-map", {
      hasRecord: !!record,
      hasFeatureLayer: !!featureLayer,
      hasMapView: !!activeMapView,
    });
    return;
  }

  const uniqueid = record.uniqueid || record.objectid?.toString();

  // Toggle behavior: if the same polygon is already selected, clear selection instead.
  const currentClean = (selecteduniqueid || "").replace(/[{}]/g, "");
  const nextClean = (uniqueid || "").toString().replace(/[{}]/g, "");
  if (currentClean && nextClean && currentClean === nextClean) {
    await clearRowSelection(host, activeMapView, featureLayer);
    return;
  }

  try {
    host.setState({ loading: true }); // selecteduniqueid is set only after the query

    // Agri_table_data has no geometry - highlight/zoom must query the
    // spatial polygon layer(s), joined by uniqueid, not the external table.
    const clickGeneration = ++host._tableRowClickGeneration;
    const isStaleClick = () =>
      !host._isMounted || clickGeneration !== host._tableRowClickGeneration;

    const resolved = await resolveRowGeometry(host, record, uniqueid, isStaleClick);
    if (!resolved || isStaleClick()) return;

    highlightResolvedFeature(host, activeMapView, uniqueid, resolved);
    commitRowSelection(host, featureLayer, uniqueid);
  } catch (err) {
    host.setState({
      loading: false,
      error: "Объектни танлаш амалга ошмади",
    });
  }
};
