/**
 * Runtime type guards that replace `as unknown as` double casts at library
 * boundaries (jimu-core store/props, ArcGIS autocast values).
 */
import type { IMUseDataSource } from "jimu-core";

type UnknownRecord = Record<string, unknown>;

const isObject = (value: unknown): value is UnknownRecord =>
  value != null && typeof value === "object";

/** A jimu use-data-source object (plain or immutable): has a string id. */
export const isUseDataSourceLike = (value: unknown): value is IMUseDataSource =>
  isObject(value) && typeof value.dataSourceId === "string";

/** A plain renderer JSON the layer setter autocasts: has a string `type`. */
export const isRendererJson = (value: unknown): value is __esri.Renderer =>
  isObject(value) && typeof value.type === "string";

/** A collection that emits `change` and returns a removable handle. */
export interface ChangeEmitter {
  on: (name: "change", callback: () => void) => { remove: () => void };
}

export const hasChangeEmitter = (value: unknown): value is ChangeEmitter =>
  isObject(value) && typeof value.on === "function";

/** `portalUrl` of the app store state, when it is a non-empty string. */
export const readStatePortalUrl = (state: unknown): string | undefined => {
  if (!isObject(state)) return undefined;
  const { portalUrl } = state;
  return typeof portalUrl === "string" && portalUrl ? portalUrl : undefined;
};
