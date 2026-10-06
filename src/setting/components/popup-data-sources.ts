/**
 * Data-source lifecycle + field discovery for the polygon-popup settings panel.
 * Functions take the panel instance (PopupSettingHost) as first argument.
 */
import type { DataSource, IMUseDataSource } from "jimu-core";
import { getQueryableLayer } from "../../gis/feature-layer-data";
import type { FieldInfo } from "../agri-popup-setting";
import type { PopupSettingHost } from "../popup-setting-host";
import {
  dataSourceKeyOf,
  fieldsFromLayerFields,
  fieldsFromSchemaFields,
  mergeFieldNameOrder,
  shouldReplaceField,
  type SchemaFieldLike,
} from "./popup-field-utils";

/** Layer shape read while discovering popup fields. */
export interface FieldBearingLayer {
  fields?: unknown[];
  loaded?: boolean;
  load?: () => Promise<unknown>;
}

/** Optional accessors a jimu data source may expose for its layer(s). */
interface LayerSourceLike {
  layer?: unknown;
  getLayer?: () => unknown;
  getJimuLayer?: () => unknown;
  getMainLayer?: () => unknown;
  getChildDataSources?: () => unknown;
}

interface SchemaLike {
  fields?: Record<string, SchemaFieldLike>;
}

interface SchemaSourceLike {
  fetchSchema?: () => Promise<SchemaLike | undefined>;
  getSchema?: () => SchemaLike | undefined;
}

type QueryableLayerInput = Parameters<typeof getQueryableLayer>[0];

export const initializeDataSources = async (host: PopupSettingHost) => {
  if (host.props.useDataSources?.length) {
    const all = host.props.useDataSources.asMutable() as IMUseDataSource[];
    const webMapId = String(host.props.config?.webMapDataSourceId || "");
    const candidates = all.filter(
      (source) => String(source?.dataSourceId || "") !== webMapId,
    );
    const key = host.getUseDataSourceKey(candidates);
    if (key === host.lastUseDataSourceKey && host.state.dss?.length) return;
    host.lastUseDataSourceKey = key;
    // Region/year polygon layers share the same schema. One representative
    // feature source is enough for popup field configuration; walking all
    // 20-30 sources blocks Builder while every service/schema is loaded.
    await host.createDataSources(candidates.slice(0, 1));
  } else {
    host.lastUseDataSourceKey = "";
    host.releaseOwnedDataSources();
    host.setState({ dss: null, allFields: [] });
  }
};

export function getUseDataSourceKey(_host: PopupSettingHost, value: unknown): string {
  return dataSourceKeyOf(value);
}

export const releaseOwnedDataSources = (host: PopupSettingHost) => {
  for (const id of host.ownedDataSourceIds) {
    try {
      host.dsMgr.destroyDataSource(id);
    } catch {
      // Best-effort cleanup: the data source may already be destroyed by Builder.
    }
  }
  host.ownedDataSourceIds = [];
};

export const cleanupDataSources = (host: PopupSettingHost) => {
  host.releaseOwnedDataSources();
};

export const createDataSources = async (host: PopupSettingHost, useList: IMUseDataSource[]) => {
  host.releaseOwnedDataSources();
  const dsArr: DataSource[] = [];
  for (const uds of useList) {
    const dsId = String(uds?.dataSourceId || "");
    if (!dsId) continue;

    let ds = host.dsMgr.getDataSource(dsId) as DataSource | null;
    let owned = false;
    if (!ds) {
      try {
        ds = await host.dsMgr.createDataSourceByUseDataSource(uds);
        owned = !!ds;
      } catch {
        // Unavailable source: skip it; remaining sources still provide fields.
      }
    }

    if (ds) {
      dsArr.push(ds);
      if (owned) host.ownedDataSourceIds.push(dsId);
    }
  }
  host.setState({ dss: dsArr }, () => {
    void host.extractFieldsFromDs();
  });
};

export const fieldsFromSchemaObject = (
  _host: PopupSettingHost,
  fieldsObj: Record<string, SchemaFieldLike | undefined>,
): FieldInfo[] => fieldsFromSchemaFields(fieldsObj);

export const fieldsFromLayer = (_host: PopupSettingHost, layer: unknown): FieldInfo[] =>
  fieldsFromLayerFields(layer);

const ensureLayerLoaded = async (layer: FieldBearingLayer): Promise<void> => {
  try {
    if (typeof layer.load === "function" && !layer.loaded) {
      await layer.load();
    }
  } catch {
    // Load failure leaves `fields` empty; the next candidate is tried instead.
  }
};

export const resolveLayerFromDataSource = async (
  host: PopupSettingHost,
  dsInput: unknown,
): Promise<FieldBearingLayer | null> => {
  if (!dsInput) return null;
  const ds = dsInput as LayerSourceLike;

  const candidates = [
    ds?.layer,
    typeof ds?.getLayer === "function" ? ds.getLayer() : null,
    typeof ds?.getJimuLayer === "function" ? ds.getJimuLayer() : null,
    typeof ds?.getMainLayer === "function" ? ds.getMainLayer() : null,
  ].filter(Boolean);

  for (const candidate of candidates) {
    const layer = (getQueryableLayer(candidate as QueryableLayerInput) ||
      candidate) as FieldBearingLayer;
    if (!layer) continue;
    await ensureLayerLoaded(layer);
    if (Array.isArray(layer.fields) && layer.fields.length > 0) {
      return layer;
    }
  }

  const children =
    typeof ds?.getChildDataSources === "function"
      ? ds.getChildDataSources()
      : [];
  if (Array.isArray(children)) {
    for (const child of children) {
      const childLayer = await host.resolveLayerFromDataSource(child);
      if (childLayer?.fields?.length) return childLayer;
    }
  }

  return null;
};

export const extractFieldsFromDs = async (host: PopupSettingHost) => {
  const token = ++host.fieldsExtractToken;
  const dss = host.state.dss;
  if (!dss || dss.length === 0) {
    host.setState({ allFields: [] });
    return;
  }

  const merged = new Map<string, FieldInfo>();
  const addFields = (fields: FieldInfo[]) => {
    for (const field of fields) {
      if (!field?.name) continue;
      const prev = merged.get(field.name);
      if (!prev || shouldReplaceField(prev, field)) {
        merged.set(field.name, field);
      }
    }
  };

  for (const ds of dss) {
    const schemaSource = ds as unknown as SchemaSourceLike;

    try {
      if (typeof schemaSource.fetchSchema === "function") {
        const schema = await schemaSource.fetchSchema();
        if (token !== host.fieldsExtractToken) return;
        addFields(host.fieldsFromSchemaObject(schema?.fields || {}));
      }
    } catch {
      // Schema fetch is optional; cached schema and layer fields are used next.
    }

    const cached = schemaSource.getSchema?.();
    if (cached?.fields) {
      addFields(host.fieldsFromSchemaObject(cached.fields));
    }

    try {
      const layer = await host.resolveLayerFromDataSource(ds);
      if (token !== host.fieldsExtractToken) return;
      addFields(host.fieldsFromLayer(layer));
    } catch {
      // Layer resolution is optional; schema fields above are kept.
    }
  }

  if (token !== host.fieldsExtractToken) return;
  const allFields = Array.from(merged.values());
  host.setState((s) => ({
    allFields,
    fieldOrder: host.mergeFieldOrder(
      allFields,
      s.fieldOrder.length ? s.fieldOrder : host.getAgriConfig().fieldOrder || []
    ),
  }));
};

export function mergeFieldOrder(_host: PopupSettingHost, fields: FieldInfo[], saved: string[]): string[] {
  return mergeFieldNameOrder(fields, saved);
}
