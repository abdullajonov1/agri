import type { PopupWidgetHost } from "../../popup-host";
import { agriMapClickDebug, agriMapClickWarn } from "../../../../../gis/agri-map-click-debug";
import { AGRI_TABLE_JOIN_FIELD } from "../../../../../gis/agri-table-data-source";
import { resolveRegionIdFromAttributes, resolveCropIdFromAttributes } from "../../../../../gis/agri-polygon-api-source";
import { prefetchVegetationOverlayForUniqueid } from "../../../../../gis/agri-vegetation-overlay-prefetch";
import { getQueryableLayer, getAgriLayerMapKey, isMapImageOwnedLayer, isMapImageGroupSublayer, safeLoadMapLayer } from "../../../../../gis/feature-layer-data";
import type { PopupAttributes } from "../../popup-types";
import { messageOr, messageOrString } from "../../popup-type-guards";

export const onViewClick = async (host: PopupWidgetHost, ev: __esri.ViewClickEvent) => {
  try {
    document.dispatchEvent(
      new CustomEvent("agriPolygonMapClickPhase", {
        detail: { phase: "click-start", timestamp: Date.now() },
      }),
    );
  } catch {
    /* best-effort filter guard */
  }
  // Captured BEFORE any awaits below — this widget's attribute-resolution
  // chain (resolveClickLayers/resolveClickFeatureAt/query/resolveDisplayAttrs)
  // can take noticeably longer than AgriGraff10's own, more direct map-click
  // handling of the same click. If the user clicks a second polygon before
  // this chain finishes, the stale result must not win — clickedAt lets
  // AgriGraff10 detect and drop it.
  const clickStartedAt = Date.now();
  const clickGeneration = ++host._clickGeneration;
  agriMapClickDebug("click:received", {
    clickGeneration,
    x: ev.x,
    y: ev.y,
    mapPoint: ev.mapPoint
      ? {
          x: ev.mapPoint.x,
          y: ev.mapPoint.y,
          wkid: ev.mapPoint.spatialReference?.wkid || null,
        }
      : null,
  });
  const isStale = () =>
    !host._isMounted || clickGeneration !== host._clickGeneration;
  let popupOpenedForThisClick = false;
  const jmv = host.state.jimuMapView;
  const view = jmv?.view;
  if (!view || !jmv) {
    agriMapClickWarn("onViewClick SKIP: no view/jmv");
    return;
  }

  const layers = await host.resolveClickLayers(view, jmv);
  if (isStale()) return;
  agriMapClickDebug("onViewClick start", {
    screen: { x: ev.x, y: ev.y },
    layerCount: layers.length,
    layers: layers.map((l) => ({
      id: l.id,
      title: l.title,
      url: l.url,
    })),
  });

  const clickScreenPoint = { x: ev.x, y: ev.y };
  const hitResult = await host.resolveClickFeatureAt(ev, view, layers);
  if (isStale()) return;

  try {
    document.dispatchEvent(
      new CustomEvent("agriPolygonMapClickPhase", {
        detail: { phase: "after-hit-test", timestamp: Date.now() },
      }),
    );
  } catch {
    /* best-effort filter guard */
  }

  if (!hitResult) {
    // Empty map click while a field popup is open = deselect and return to
    // the district/region extent saved before the field zoom.
    if (host.state.showPopup || host.state.loading) {
      agriMapClickDebug("onViewClick: click outside — close popup + restore extent");
      host.closePopup({ restoreExtent: true, notifyDeselect: true });
    } else {
      agriMapClickDebug("onViewClick: click outside field polygons — ignored");
    }
    return;
  }

  const { graphic: g, queryHitLayer } = hitResult;

  // Kick TIFF ASAP from hitTest attributes — do not wait for FeatureServer
  // OID query (that used to sit hundreds of ms–seconds on the critical path).
  const hitAttrs: PopupAttributes = g.attributes || {};
  const hitUniqueRaw = host.findAttributeValueCaseInsensitive(
    hitAttrs,
    AGRI_TABLE_JOIN_FIELD,
  );
  const hitUniqueId =
    hitUniqueRaw != null && String(hitUniqueRaw).trim() !== ""
      ? String(hitUniqueRaw).trim()
      : "";
  const hitCleanKey = hitUniqueId.replace(/[{}]/g, "").trim();
  let overlayKickedFromHit = false;
  let zoomedFromHit = false;
  const zoomToSelection =
    host.props.config?.settings?.zoomToSelection !== false;

  // Zoom to the clicked field immediately from hitTest geometry — waiting
  // for FeatureServer OID query made zoom feel broken / very late.
  if (zoomToSelection && g.geometry && !isStale()) {
    try {
      if (!host._extentBeforeSelection && view.extent?.clone) {
        host._extentBeforeSelection = view.extent.clone();
      }
      const target =
        g.geometry.extent?.expand?.(1.15) || g.geometry;
      zoomedFromHit = true;
      agriMapClickDebug("zoom:start-hit", {
        uniqueid: hitCleanKey || null,
        geometryType: g.geometry.type,
        durationMs: 500,
      });
      void view
        .goTo({ target }, { duration: 500, easing: "ease-in-out" })
        .then(
          () =>
            agriMapClickDebug("zoom:complete-hit", {
              uniqueid: hitCleanKey || null,
              scale: view.scale,
            }),
          (error: unknown) =>
            agriMapClickWarn("zoom:failed-hit", {
              uniqueid: hitCleanKey || null,
              error: messageOrString(error),
            }),
        );
    } catch {
      zoomedFromHit = false;
    }
  }
  if (g.geometry) {
    try {
      host.highlightPolygon(g.geometry);
    } catch {
      /* OID path may re-highlight */
    }
  }

  if (hitCleanKey) {
    const activeKeyEarly = String(host._activeInspectedUniqueid || "")
      .replace(/[{}]/g, "")
      .trim();
    if (activeKeyEarly && activeKeyEarly === hitCleanKey) {
      if (host.state.popupMinimized) {
        agriMapClickDebug("selection:expand-minimized-same-field", {
          uniqueid: hitCleanKey,
          source: "hit-attrs",
        });
        host.expandPopup();
        return;
      }
      agriMapClickDebug("selection:toggle-off-same-field", {
        uniqueid: hitCleanKey,
        source: "hit-attrs",
      });
      host.clearHighlight();
      host._activeInspectedUniqueid = null;
      host.closePopup({ restoreExtent: true, notifyDeselect: true });
      return;
    }
    const regionFromHit = resolveRegionIdFromAttributes(hitAttrs);
    host._activeInspectedUniqueid = hitCleanKey;
    overlayKickedFromHit = true;
    agriMapClickDebug("selection:broadcast-hit", {
      uniqueid: hitUniqueId,
      source: "AgriPopup",
      polygonMode: true,
      regionId: regionFromHit,
      destinations: ["AgriLocalization", "AgriGraff10"],
    });
    host.notifyGraffPolygonSelection(
      hitUniqueId,
      true,
      clickStartedAt,
      regionFromHit,
    );
    prefetchVegetationOverlayForUniqueid(hitUniqueId, {
      cropId: resolveCropIdFromAttributes(hitAttrs),
      regionId: regionFromHit ?? undefined,
    });
  }

  try {
    host.setState({
      loading: true,
      error: null,
      clickScreenPoint,
      loadingAttachments: true,
      attachments: [],
      attachmentsExpanded: true,
    });

    agriMapClickDebug("field polygon hit", {
      layerId: g.layer?.id,
      geometry: g.geometry?.type || null,
      attrKeys: g.attributes
        ? Object.keys(g.attributes).slice(0, 8)
        : [],
      overlayKickedFromHit,
    });

    // queryFeatures results have no graphic.layer — use the layer we queried
    const clickedLayer = (
      queryHitLayer
        ? host.toLiveMapLayer(queryHitLayer, view.map) || queryHitLayer
        : host.toLiveMapLayer(
            getQueryableLayer(g.layer) || g.layer,
            view.map,
          )
    ) as __esri.FeatureLayer;
    if (!clickedLayer) {
      agriMapClickWarn("no live layer for hit graphic");
      if (!isStale()) host.setState({ loading: false, showPopup: false });
      return;
    }
    const layerKey =
      getAgriLayerMapKey(clickedLayer) ||
      String(clickedLayer?.url || clickedLayer?.id || "");
    const dsId = host.state.layerKeyToDsId?.[layerKey] || null;
    agriMapClickDebug("layer:resolved", {
      title: clickedLayer.title,
      id: clickedLayer.id,
      url: clickedLayer.url || null,
      layerKey,
      dataSourceId: dsId,
      definitionExpression: clickedLayer.definitionExpression || null,
    });

    const oidField =
      clickedLayer.objectIdField ||
      clickedLayer.fields?.find((fld) => fld.type === "oid")?.name ||
      null;

    if (!oidField) {
      if (!isStale()) {
        host.setState({
          loading: false,
          error: host.tr("error.objectIdFieldMissing"),
          showPopup: false,
          loadingAttachments: false,
          attachments: [],
        });
        host.clearHighlight();
      }
      return;
    }

    const oid = g.attributes?.[oidField];
    if (oid == null) {
      if (!isStale()) {
        host.setState({
          loading: false,
          error: host.tr("error.objectIdMissing", { field: oidField }),
          showPopup: false,
          loadingAttachments: false,
          attachments: [],
        });
        host.clearHighlight();
      }
      return;
    }

    const outFields = host.getOutFields(clickedLayer, oidField);

    const f = await host.queryFeatureByObjectIdCached(
      clickedLayer,
      oidField,
      oid,
      outFields,
    );
    if (isStale()) return;
    if (!f) {
      host.setState({
        loading: false,
        error: host.tr("error.featureByObjectIdMissing"),
        showPopup: false,
        loadingAttachments: false,
        attachments: [],
      });
      host.clearHighlight();
      return;
    }

    if (f.geometry) host.highlightPolygon(f.geometry);

    const earlyUniqueId =
      host.findAttributeValueCaseInsensitive(
        f.attributes,
        AGRI_TABLE_JOIN_FIELD,
      ) ?? null;
    const earlyCleanKey = String(earlyUniqueId || "")
      .replace(/[{}]/g, "")
      .trim();
    const activeKey = String(host._activeInspectedUniqueid || "")
      .replace(/[{}]/g, "")
      .trim();
    /*
     * Same already-active field (incl. table selection) clicked on map →
     * deactivate without zooming in again. Graff restores the pre-select extent.
     * If the panel was only minimized, expand it instead of deselecting.
     * (Hit-attrs path above already handled this when uniqueid was on the graphic.)
     */
    if (
      !overlayKickedFromHit &&
      activeKey &&
      earlyCleanKey &&
      activeKey === earlyCleanKey
    ) {
      if (host.state.popupMinimized) {
        agriMapClickDebug("selection:expand-minimized-same-field", {
          uniqueid: earlyCleanKey,
        });
        host.expandPopup();
        return;
      }
      agriMapClickDebug("selection:toggle-off-same-field", {
        uniqueid: earlyCleanKey,
      });
      host.clearHighlight();
      host._activeInspectedUniqueid = null;
      host.closePopup({ restoreExtent: true, notifyDeselect: true });
      return;
    }

    // Kick Graff overlay only if hitTest attrs lacked uniqueid (OID query
    // was the first place we saw it). Avoid double notify/walk.
    if (
      !overlayKickedFromHit &&
      earlyUniqueId != null &&
      String(earlyUniqueId).trim() !== ""
    ) {
      const earlyNotifyId = String(earlyUniqueId).trim();
      const attrs: PopupAttributes = f.attributes;
      const regionFromPoly = resolveRegionIdFromAttributes(attrs);
      host._activeInspectedUniqueid = earlyCleanKey;
      agriMapClickDebug("selection:broadcast-early", {
        uniqueid: earlyNotifyId,
        source: "AgriPopup",
        polygonMode: true,
        regionId: regionFromPoly,
        destinations: ["AgriLocalization", "AgriGraff10"],
      });
      host.notifyGraffPolygonSelection(
        earlyNotifyId,
        true,
        clickStartedAt,
        regionFromPoly,
      );
      prefetchVegetationOverlayForUniqueid(earlyNotifyId, {
        cropId: resolveCropIdFromAttributes(attrs),
        regionId: regionFromPoly ?? undefined,
      });
    }

    const indicesUnique =
      earlyCleanKey ||
      hitCleanKey ||
      String(host._activeInspectedUniqueid || "").replace(/[{}]/g, "").trim();
    if (indicesUnique) {
      // Defer FeatureServer series so export-image gets bandwidth first.
      window.setTimeout(() => {
        if (!host._isMounted) return;
        const active = String(host._activeInspectedUniqueid || "")
          .replace(/[{}]/g, "")
          .trim();
        if (active !== indicesUnique) return;
        void host.fetchLatestVegetationIndices(
          earlyUniqueId
            ? String(earlyUniqueId).trim()
            : hitUniqueId || indicesUnique,
        );
      }, 650);
    }

    const zoomToEarly =
      !zoomedFromHit &&
      host.props.config?.settings?.zoomToSelection !== false;
    if (zoomToEarly && f.geometry && !isStale()) {
      try {
        if (!host._extentBeforeSelection && view.extent?.clone) {
          host._extentBeforeSelection = view.extent.clone();
        }
        const target =
          f.geometry.extent?.expand?.(1.15) || f.geometry;
        agriMapClickDebug("zoom:start-early", {
          uniqueid: earlyCleanKey || null,
          geometryType: f.geometry.type,
          durationMs: 500,
        });
        void view
          .goTo({ target }, { duration: 500, easing: "ease-in-out" })
          .then(
            () =>
              agriMapClickDebug("zoom:complete", {
                uniqueid: earlyCleanKey || null,
                scale: view.scale,
              }),
            (error: unknown) =>
              agriMapClickWarn("zoom:failed", {
                uniqueid: earlyCleanKey || null,
                error: messageOrString(error),
              }),
          );
      } catch {
        /* zoom is cosmetic — never block opening the popup */
      }
    } else if (zoomedFromHit) {
      agriMapClickDebug("zoom:skip-oid-already-hit", {
        uniqueid: earlyCleanKey || hitCleanKey || null,
      });
    }

    try {
      const loadStatus = String(clickedLayer.loadStatus || "").toLowerCase();
      const isLoaded = Boolean(clickedLayer.loaded) || loadStatus === "loaded";
      // Loading a live MapImage-owned sublayer rehydrates it and can clear
      // the runtime tuman definitionExpression (other-district flash). The
      // detached client from queryFeatureByObjectIdCached is already loaded
      // and provides the same field metadata.
      if (
        !isLoaded &&
        !isMapImageOwnedLayer(clickedLayer) &&
        !isMapImageGroupSublayer(clickedLayer)
      ) {
        agriMapClickDebug("layer:load-required", {
          title: clickedLayer.title,
          loadStatus: loadStatus || null,
          definitionExpression:
            clickedLayer.definitionExpression || null,
        });
        await safeLoadMapLayer(clickedLayer);
      } else {
        agriMapClickDebug("layer:load-skip-already-loaded", {
          title: clickedLayer.title,
          loadStatus: loadStatus || "loaded",
          definitionExpression:
            clickedLayer.definitionExpression || null,
        });
      }
    } catch {
      /* fresh field aliases from live layer */
    }
    if (isStale()) return;

    const shouldPin = host.state.pinToCorner;
    const popupPosition = shouldPin
      ? host.calculatePinnedPosition(view)
      : host.calculatePopupPosition(clickScreenPoint, view);

    // Agri_table_data has no geometry — the polygon layer only drives
    // map-click/highlight/zoom; the fields the popup shows come from the
    // external table, joined by uniqueid.
    const displayAttrs = await host.resolveDisplayAttrs(f.attributes);
    if (isStale()) return;

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

    agriMapClickDebug("popup OPEN", {
      oid,
      oidField,
      layerKey,
      attributeKeys: actualFields.slice(0, 12),
      popupPosition,
    });

    // Open the popup BEFORE goTo — awaiting zoom first left a long window
    // where a twin/shared click path could fail and wipe showPopup.
    host.setState({
      loading: false,

      // ✅ store which layer/ds was clicked (for alias resolving)
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
    popupOpenedForThisClick = true;

    const clickedUniqueId =
      host.findAttributeValueCaseInsensitive(
        displayAttrs,
        AGRI_TABLE_JOIN_FIELD,
      ) ??
      host.findAttributeValueCaseInsensitive(
        f.attributes,
        AGRI_TABLE_JOIN_FIELD,
      );
    if (clickedUniqueId != null && String(clickedUniqueId).trim() !== "") {
      const cleanUniqueId = String(clickedUniqueId).trim();
      host._activeInspectedUniqueid = cleanUniqueId.replace(/[{}]/g, "").trim();
      // Early broadcast already ran when polygon attrs had uniqueid; only
      // notify again if the table join is the first place we saw it.
      if (!earlyCleanKey || earlyCleanKey !== host._activeInspectedUniqueid) {
        const regionFromPoly = resolveRegionIdFromAttributes(
          displayAttrs || f.attributes,
        );
        agriMapClickDebug("selection:broadcast", {
          uniqueid: cleanUniqueId,
          source: "AgriPopup",
          polygonMode: true,
          regionId: regionFromPoly,
          destinations: ["AgriLocalization", "AgriGraff10"],
        });
        host.notifyGraffPolygonSelection(
          cleanUniqueId,
          true,
          clickStartedAt,
          regionFromPoly,
        );
        void host.fetchLatestVegetationIndices(cleanUniqueId);
      }
    } else {
      host.setState({
        loadingLatestIndices: false,
        latestIndexDate: null,
        latestIndexValues: null,
      });
    }

    // Zoom already started early (before Agri_table join) when geometry exists.

    // Attachments are best-effort — never let a media fetch wipe an open popup
    // (that was the "vegetation updates but popup only sticks on 2nd/3rd click"
    // failure: notifyGraff ran, then loadAttachments threw → catch closed UI
    // and restoreExtentBeforeSelection made the map look like other fields).
    if (host.props.config?.settings?.showAttachments !== false) {
      try {
        // Query attachments on the detached client too — queryAttachments
        // on a live MapImage sublayer can rehydrate it (same DE-clearing
        // path as queryFeatures) and it often lacks the API anyway.
        const clickedUrl = String(clickedLayer.url || "").trim();
        const attachmentLayer =
          (clickedUrl && host._queryOnlyLayers.get(clickedUrl)) ||
          clickedLayer;
        await host.loadAttachmentsForOid(attachmentLayer, Number(oid));
      } catch (attachErr: unknown) {
        agriMapClickWarn("attachments failed (popup kept open)", {
          message: messageOrString(attachErr),
        });
        if (!isStale()) {
          host.setState({ loadingAttachments: false, attachments: [] });
        }
      }
    } else if (!isStale()) {
      host.setState({ loadingAttachments: false, attachments: [] });
    }
    if (isStale()) return;

    if (host.state.pinToCorner) {
      host.schedulePopupLayoutAfterContent();
    } else if (host.isDashboardEmbedded()) {
      host.schedulePopupLayoutAfterContent();
    }
  } catch (e: unknown) {
    // Never let a superseded twin/shared click clear a newer popup.
    if (isStale()) return;
    // If we already opened the popup for THIS click, keep it — surface error only.
    if (popupOpenedForThisClick) {
      host.setState({
        loading: false,
        error: host.tr("error.unexpected", {
          message: messageOr(e, "Unknown error"),
        }),
        loadingAttachments: false,
      });
      return;
    }
    host.setState({
      loading: false,
      error: host.tr("error.unexpected", {
        message: messageOr(e, "Unknown error"),
      }),
      showPopup: false,
      loadingAttachments: false,
      attachments: [],
    });
    host.clearHighlight();
    host.notifyGraffPolygonSelection("", false);
    host.restoreExtentBeforeSelection();
  }
};
