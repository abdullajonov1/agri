/**
 * Structural view of the map layers the Localization panel filters and paints.
 *
 * RegionYear entries mix FeatureLayers, MapImage Sublayers and their parent
 * MapImageLayers, so no single `__esri` class fits. Only the members this
 * panel actually reads or writes are declared; shared members come from the
 * gis AgriLayerLike so both modules agree on one layer shape.
 */
import type { AgriLayerLike } from "../../gis/agri-layer-types";

export interface AgriMapLayer extends AgriLayerLike {
  name?: string;
  geometryType?: string | null;
  renderer?: __esri.Renderer | null;
}

/** Attribute bag on a returned feature. */
export type FeatureAttributes = Record<string, unknown>;

/** Attributes of a query result feature, or an empty bag. */
export const featureAttributes = (
  feature: { attributes?: FeatureAttributes | null } | null | undefined,
): FeatureAttributes => feature?.attributes || {};

/** True for a non-null, non-blank attribute value. */
export const isPresentValue = (value: unknown): boolean =>
  value !== null && value !== undefined && String(value).trim() !== "";
