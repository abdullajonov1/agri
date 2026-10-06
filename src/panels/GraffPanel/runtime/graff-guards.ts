/**
 * Small type guards shared by the Graff runtime modules so they can read
 * thrown values, CustomEvent payloads and loosely-typed ArcGIS objects
 * without falling back to `any`.
 */
import { isMapImageOwnedLayer } from "../../../gis/feature-layer-data";

/** `err?.message` for an unknown thrown value (undefined when absent). */
export const thrownMessage = (err: unknown): string | undefined => {
  if (err == null || typeof err !== "object") return undefined;
  const message = (err as { message?: unknown }).message;
  return typeof message === "string" ? message : undefined;
};

/** `err?.name` for an unknown thrown value (undefined when absent). */
export const thrownName = (err: unknown): string | undefined => {
  if (err == null || typeof err !== "object") return undefined;
  const name = (err as { name?: unknown }).name;
  return typeof name === "string" ? name : undefined;
};

/** `String(err?.message || err)` — the log/state text used across Graff. */
export const describeThrown = (err: unknown): string =>
  thrownMessage(err) || String(err);

/** CustomEvent detail as a partial payload; `{}` for plain Events. */
export const eventDetail = <T extends object>(
  event: Event | null | undefined,
): Partial<T> => {
  const detail = (event as CustomEvent<unknown> | null | undefined)?.detail;
  return detail != null && typeof detail === "object"
    ? (detail as Partial<T>)
    : {};
};

/** Layer tagged with the REST URL we resolved for it (see search-handlers). */
export type AgriQueryableLayer = __esri.Layer & {
  url?: string;
  title?: string;
  fields?: __esri.Field[];
  __agriQueryableUrl?: string;
};

interface DefinitionExpressionSource {
  setDefinitionExpression?: (where: string) => void;
}

/** jimu data sources used here expose an optional setDefinitionExpression. */
export const setDataSourceDefinitionExpression = (
  dataSource: unknown,
  where: string,
): void => {
  if (dataSource == null || typeof dataSource !== "object") return;
  const target = dataSource as DefinitionExpressionSource;
  if (typeof target.setDefinitionExpression === "function") {
    target.setDefinitionExpression(where);
  }
};

/**
 * Apply one WHERE to the table FeatureLayer (unless it is a map-image
 * sublayer, which owns its own expression) and then to the data source.
 */
export const applyGraffDefinitionExpression = (
  featureLayer: __esri.FeatureLayer | null | undefined,
  dataSource: unknown,
  where: string,
): void => {
  if (featureLayer && !isMapImageOwnedLayer(featureLayer)) {
    featureLayer.definitionExpression = where;
  }
  setDataSourceDefinitionExpression(dataSource, where);
};
