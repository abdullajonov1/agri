import type { PopupWidgetHost } from "../popup-host";
import { agriMapClickDebug } from "../../../../gis/agri-map-click-debug";
import { type default as FeatureLayer } from "esri/layers/FeatureLayer";
import type {
  AgriLayerLike,
  PopupFieldMeta,
} from "../popup-types";
import type { AgriFieldLike } from "../../../../gis/agri-layer-types";
import { asDataSourceLike } from "../popup-type-guards";
import { isEsriDateFieldType, formatDateSmart as formatDateSmartShared, formatPopupAttributeValue } from "../popup-format-helpers";
import { getAgriLayerMapKey } from "../../../../gis/feature-layer-data";
import { normalizeFieldAlias as normalizeFieldAliasShared, localizedPopupFieldLabel, localizedPopupVhValue } from "../popup-field-helpers";
import { getCropDisplayName } from "../../../../shared/agri-crop-labels";
import { translateAgriPlaceForDisplay } from "../../../../shared/agri-place-display";

export function isDateField(host: PopupWidgetHost, name: string): boolean {
  // Use the clicked layer if possible
  const clickedLayer = host.getClickedLayer();
  const fld = clickedLayer?.fields?.find((ff) => ff.name === name);
  return isEsriDateFieldType(fld?.type);
}

export function getClickedLayer(host: PopupWidgetHost): __esri.FeatureLayer | null {
  const key = host.state.lastClickedLayerKey;
  if (!key) return null;
  return (
    host.state.featureLayers.find(
      (L) =>
        getAgriLayerMapKey(L) === key ||
        String(L.url || L.id || "") === key,
    ) || null
  );
}

export const resolveFieldName = (host: PopupWidgetHost, key: string): string | null => {
  // Prefer DS schema for the LAST clicked ds (best for alias/jimuName)
  const dsId = host.state.lastClickedDsId;
  const ds = asDataSourceLike(
    dsId && host.state.dataSourcesById?.[dsId]
      ? host.state.dataSourcesById[dsId]
      : null,
  );

  try {
    const schema = ds?.getSchema?.();
    const fieldsObj = schema?.fields || {};
    if (fieldsObj[key]?.name) return fieldsObj[key].name;
    for (const k of Object.keys(fieldsObj)) {
      const f = fieldsObj[k];
      if (f?.name === key || f?.jimuName === key || k === key)
        { return f?.name || key; }
    }
  } catch (err) {
    // Schema unavailable — fall back to the clicked layer's fields below.
    agriMapClickDebug("resolveFieldName: data-source schema read failed", err);
  }

  // fallback to clicked layer fields
  const clickedLayer = host.getClickedLayer();
  const lf = clickedLayer?.fields?.find(
    (ff) => ff.name === key || ff.alias === key,
  );
  return lf?.name || null;
};

export function normalizeFieldAlias(host: PopupWidgetHost, field: PopupFieldMeta | null | undefined, fallbackName: string): string {
  return normalizeFieldAliasShared(field, fallbackName);
}

export function findFieldMetaOnLayer(host: PopupWidgetHost, layer: AgriLayerLike | null | undefined, fieldName: string): AgriFieldLike | null {
  const target = fieldName.toLowerCase();
  const fields: AgriFieldLike[] = Array.isArray(layer?.fields) ? layer.fields : [];
  return (
    fields.find(
      (f) => String(f?.name || "").toLowerCase() === target,
    ) || null
  );
}

export function resolveAliasFromLiveLayers(host: PopupWidgetHost, fieldName: string): string | null {
  const layers: __esri.FeatureLayer[] = [];
  const clicked = host.getClickedLayer();
  if (clicked) layers.push(clicked);
  for (const layer of host.state.featureLayers || []) {
    if (layer && !layers.includes(layer)) layers.push(layer);
  }

  for (const layer of layers) {
    const fld = host.findFieldMetaOnLayer(layer, fieldName);
    if (!fld) continue;
    const alias = host.normalizeFieldAlias(fld, fieldName);
    if (alias && alias.toLowerCase() !== fieldName.toLowerCase()) {
      return alias;
    }
  }
  return null;
}

export function resolveAliasFromDataSourceSchema(host: PopupWidgetHost, fieldName: string, ds: unknown): string | null {
  if (!ds) return null;
  try {
    const fieldsObj = asDataSourceLike(ds)?.getSchema?.()?.fields || {};
    const target = fieldName.toLowerCase();
    for (const key of Object.keys(fieldsObj)) {
      const f = fieldsObj[key];
      const fname = String(f?.name || f?.jimuName || key || "");
      if (
        fname.toLowerCase() !== target &&
        key.toLowerCase() !== target &&
        String(f?.jimuName || "").toLowerCase() !== target
      ) {
        continue;
      }
      const alias = host.normalizeFieldAlias(f, fieldName);
      if (alias && alias.toLowerCase() !== fieldName.toLowerCase()) {
        return alias;
      }
    }
  } catch {
    /* schema unavailable — caller tries the next alias source */
  }
  return null;
}

export function getFieldAlias(host: PopupWidgetHost, name: string): string {
  const custom = host.props.config?.labels?.[name];
  if (custom) return custom;

  const realName = host.resolveFieldName(name) || name;
  const localized =
    localizedPopupFieldLabel(realName, host.state.currentLang) ||
    localizedPopupFieldLabel(name, host.state.currentLang);
  if (localized) return localized;

  // Unknown fields keep the service alias.
  const fromLayer = host.resolveAliasFromLiveLayers(realName);
  if (fromLayer) return fromLayer;

  const dsId = host.state.lastClickedDsId;
  const ds =
    dsId && host.state.dataSourcesById?.[dsId]
      ? host.state.dataSourcesById[dsId]
      : null;
  const fromDs = host.resolveAliasFromDataSourceSchema(realName, ds);
  if (fromDs) return fromDs;

  for (const layerDs of Object.values(host.state.dataSourcesById || {})) {
    const alias = host.resolveAliasFromDataSourceSchema(realName, layerDs);
    if (alias) return alias;
  }

  const clickedLayer = host.getClickedLayer();
  const layerFld = clickedLayer
    ? host.findFieldMetaOnLayer(clickedLayer, realName)
    : null;
  const layerAlias = String(layerFld?.alias || "").trim();
  if (
    layerAlias &&
    layerAlias.toLowerCase() !== realName.toLowerCase() &&
    layerAlias.toLowerCase() !== String(name).toLowerCase()
  ) {
    return layerAlias;
  }

  return (
    localizedPopupFieldLabel(realName, host.state.currentLang) ||
    localizedPopupFieldLabel(name, host.state.currentLang) ||
    realName
  );
}

export function formatDateSmart(host: PopupWidgetHost, raw: unknown): string {
  return formatDateSmartShared(raw);
}

export function formatValue(host: PopupWidgetHost, name: string, raw: unknown): string {
  const formatted = formatPopupAttributeValue(raw, {
    isDateField: host.isDateField(name),
    formatDate: (value) => host.formatDateSmart(value),
  });
  const key = String(host.resolveFieldName(name) || name)
    .trim()
    .toLowerCase();
  const lang = host.state.currentLang;
  if (key === "turi" || key === "crop" || key === "uzspace") {
    const crop = getCropDisplayName(raw, lang);
    if (crop) return crop;
  }
  if (key === "viloyat") {
    return translateAgriPlaceForDisplay(String(raw ?? ""), lang, "region");
  }
  if (key === "tuman") {
    return translateAgriPlaceForDisplay(String(raw ?? ""), lang, "district");
  }
  if (key === "vh" || key === "ndvi_status") {
    return localizedPopupVhValue(raw, lang) || formatted;
  }
  return formatted;
}

export function getOutFields(host: PopupWidgetHost, layer: FeatureLayer, oidField: string): string[] {
  // keep your debugging behavior
  return ["*"];
}
