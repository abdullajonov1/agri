import { agriMapClickDebug, agriMapClickWarn } from "../../../../../gis/agri-map-click-debug";
import { AGRI_TABLE_JOIN_FIELD } from "../../../../../gis/agri-table-data-source";
import { resolveRegionIdFromAttributes } from "../../../../../gis/agri-polygon-api-source";
import { messageOr, messageOrString } from "../../popup-type-guards";
import type { ClickTarget } from "./click-view-target";
import { cleanKey, type ClickContext, type ClickFeature, type ClickProgress } from "./click-view-shared";
import type { EarlyIdentity } from "./click-view-early";

type DisplayAttrs = Awaited<ReturnType<ClickContext["host"]["resolveDisplayAttrs"]>>;

const resolveFieldsError = (ctx: ClickContext, displayAttrs: DisplayAttrs): string | null => {
  const { host } = ctx;
  const configuredFields = host.props.config?.fieldsToShow || [];
  const actualFields = Object.keys(displayAttrs);
  const missingFields = configuredFields.filter((field) => !actualFields.includes(field));
  const fieldsWithData = configuredFields.filter(
    (name) =>
      Object.prototype.hasOwnProperty.call(displayAttrs, name) &&
      displayAttrs[name] != null &&
      displayAttrs[name] !== "",
  );
  if (missingFields.length > 0) {
    return host.tr("error.configuredFieldMissing", { fields: missingFields.join(", ") });
  }
  if (fieldsWithData.length === 0 && configuredFields.length > 0) {
    return host.tr("error.noDataForConfiguredFields");
  }
  return null;
};

/** Resolves display attrs and opens the popup; null when superseded. */
export const openPopupForClick = async (
  ctx: ClickContext,
  f: ClickFeature,
  target: ClickTarget,
  progress: ClickProgress,
): Promise<DisplayAttrs | null> => {
  const { host, view, clickScreenPoint } = ctx;
  const shouldPin = host.state.pinToCorner;
  const popupPosition = shouldPin
    ? host.calculatePinnedPosition(view)
    : host.calculatePopupPosition(clickScreenPoint, view);

  // Agri_table_data has no geometry — the polygon layer only drives
  // map-click/highlight/zoom; the popup fields come from the external table.
  const displayAttrs = await host.resolveDisplayAttrs(f.attributes);
  if (ctx.isStale()) return null;

  agriMapClickDebug("popup OPEN", {
    oid: target.oid,
    oidField: target.oidField,
    layerKey: target.layerKey,
    attributeKeys: Object.keys(displayAttrs).slice(0, 12),
    popupPosition,
  });

  // Open the popup BEFORE goTo completes.
  host.setState({
    loading: false,
    // store which layer/ds was clicked (for alias resolving)
    lastClickedDsId: target.dsId,
    lastClickedLayerKey: target.layerKey,
    selectedAttrs: displayAttrs,
    selectedOID: Number(target.oid),
    objectIdField: target.oidField,
    showPopup: true,
    popupMinimized: false,
    chartExpanded: shouldPin,
    chartHoverIndex: null,
    popupPosition,
    error: resolveFieldsError(ctx, displayAttrs),
  });
  progress.popupOpened = true;
  return displayAttrs;
};

export const syncSelectionAfterOpen = (
  ctx: ClickContext,
  f: ClickFeature,
  displayAttrs: DisplayAttrs,
  early: EarlyIdentity,
): void => {
  const { host } = ctx;
  const clickedUniqueId =
    host.findAttributeValueCaseInsensitive(displayAttrs, AGRI_TABLE_JOIN_FIELD) ??
    host.findAttributeValueCaseInsensitive(f.attributes, AGRI_TABLE_JOIN_FIELD);
  if (clickedUniqueId == null || String(clickedUniqueId).trim() === "") {
    host.setState({
      loadingLatestIndices: false,
      latestIndexDate: null,
      latestIndexValues: null,
    });
    return;
  }
  const cleanUniqueId = String(clickedUniqueId).trim();
  host._activeInspectedUniqueid = cleanKey(cleanUniqueId);
  // Early broadcast already ran when polygon attrs had uniqueid; only
  // notify again if the table join is the first place we saw it.
  if (early.earlyCleanKey && early.earlyCleanKey === host._activeInspectedUniqueid) return;
  const regionFromPoly = resolveRegionIdFromAttributes(displayAttrs || f.attributes);
  agriMapClickDebug("selection:broadcast", {
    uniqueid: cleanUniqueId,
    source: "AgriPopup",
    polygonMode: true,
    regionId: regionFromPoly,
    destinations: ["AgriLocalization", "AgriGraff10"],
  });
  host.notifyGraffPolygonSelection(cleanUniqueId, true, ctx.clickStartedAt, regionFromPoly);
  void host.fetchLatestVegetationIndices(cleanUniqueId);
};

/** Attachments are best-effort — never let a media fetch wipe an open popup. */
export const loadClickAttachments = async (
  ctx: ClickContext,
  target: ClickTarget,
): Promise<void> => {
  const { host } = ctx;
  if (host.props.config?.settings?.showAttachments === false) {
    if (!ctx.isStale()) host.setState({ loadingAttachments: false, attachments: [] });
    return;
  }
  try {
    // Query attachments on the detached client too — queryAttachments on a
    // live MapImage sublayer can rehydrate it and often lacks the API anyway.
    const { clickedLayer } = target;
    const clickedUrl = String(clickedLayer.url || "").trim();
    const attachmentLayer =
      (clickedUrl && host._queryOnlyLayers.get(clickedUrl)) || clickedLayer;
    await host.loadAttachmentsForOid(attachmentLayer, Number(target.oid));
  } catch (attachErr: unknown) {
    agriMapClickWarn("attachments failed (popup kept open)", {
      message: messageOrString(attachErr),
    });
    if (!ctx.isStale()) host.setState({ loadingAttachments: false, attachments: [] });
  }
};

export const scheduleLayoutIfNeeded = (ctx: ClickContext): void => {
  const { host } = ctx;
  if (host.state.pinToCorner || host.isDashboardEmbedded()) {
    host.schedulePopupLayoutAfterContent();
  }
};

export const handleClickError = (
  ctx: ClickContext,
  e: unknown,
  progress: ClickProgress,
): void => {
  const { host } = ctx;
  // Never let a superseded twin/shared click clear a newer popup.
  if (ctx.isStale()) return;
  const error = host.tr("error.unexpected", { message: messageOr(e, "Unknown error") });
  // If we already opened the popup for THIS click, keep it — surface error only.
  if (progress.popupOpened) {
    host.setState({ loading: false, error, loadingAttachments: false });
    return;
  }
  host.setState({
    loading: false,
    error,
    showPopup: false,
    loadingAttachments: false,
    attachments: [],
  });
  host.clearHighlight();
  host.notifyGraffPolygonSelection("", false);
  host.restoreExtentBeforeSelection();
};
