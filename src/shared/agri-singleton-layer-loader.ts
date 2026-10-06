import { loadArcGISJSAPIModules } from "jimu-arcgis";
import type FeatureLayer from "esri/layers/FeatureLayer";
import type Field from "esri/layers/support/Field";
import { errorMessage } from "./agri-plain-object";

export interface AgriSingletonLayerHandle {
  layer: FeatureLayer;
  fields: string[];
}

interface EsriRequestErrorShape {
  httpStatus?: number;
  details?: { httpStatus?: number };
}

const readHttpStatus = (err: unknown): number | null => {
  if (err == null || typeof err !== "object") return null;
  const shaped = err as EsriRequestErrorShape;
  return shaped.details?.httpStatus ?? shaped.httpStatus ?? null;
};

type LayerLogFn = (phase: string, detail?: Record<string, unknown>) => void;

/**
 * Factory for cached singleton FeatureLayer/Table loaders used across
 * agri-table / vegetation / reserve / unused data sources.
 */
export function createSingletonLayerLoader(
  getUrl: () => string,
  logFn: LayerLogFn,
): () => Promise<AgriSingletonLayerHandle> {
  let layerPromise: Promise<AgriSingletonLayerHandle> | null = null;

  return async (): Promise<AgriSingletonLayerHandle> => {
    if (!layerPromise) {
      const url = getUrl();
      logFn("load:start", { url });
      layerPromise = (async () => {
        const [FeatureLayerCtor] = (await loadArcGISJSAPIModules([
          "esri/layers/FeatureLayer",
        ])) as [typeof FeatureLayer];
        const layer = new FeatureLayerCtor({ url });
        await layer.load();
        const fields: string[] = (layer.fields || []).map((f: Field) => f.name);
        logFn("load:success", {
          url,
          title: layer.title,
          fieldCount: fields.length,
          fields,
        });
        return { layer, fields };
      })().catch((err: unknown) => {
        layerPromise = null;
        logFn("load:FAILED", {
          url,
          error: errorMessage(err),
          status: readHttpStatus(err),
        });
        throw err;
      });
    }
    return layerPromise;
  };
}
