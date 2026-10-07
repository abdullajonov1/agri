/**
 * Small plain-object fakes for ArcGIS layers used by feature-layer tests.
 * Only the members the helpers under test actually read are populated.
 */
import type Query from "esri/rest/support/Query";
import type FeatureSet from "esri/rest/support/FeatureSet";
import type {
  AgriCollectionLike,
  AgriFieldLike,
  AgriLayerLike,
} from "../../agri-layer-types";

/** Mutable query object handed out by fake `createQuery()`. */
export type FakeQuery = Record<string, unknown>;

export function asQuery(q: FakeQuery): Query {
  return q as unknown as Query;
}

export function asFeatureSet(value: {
  features?: Array<{ attributes?: Record<string, unknown> }>;
  exceededTransferLimit?: boolean;
}): FeatureSet {
  return value as unknown as FeatureSet;
}

export function collection<T>(items: T[]): AgriCollectionLike<T> {
  return { length: items.length, items, toArray: () => items };
}

export function fields(
  ...defs: Array<[name: string, type?: string]>
): AgriFieldLike[] {
  return defs.map(([name, type]) => (type ? { name, type } : { name }));
}

let urlCounter = 0;

/** Unique MapServer URL so module-level caches never collide between tests. */
export function uniqueLayerUrl(tag = "layer"): string {
  urlCounter += 1;
  return `https://example.test/arcgis/rest/services/${tag}_${urlCounter}/MapServer/0`;
}

export function makeLayer(overrides: Partial<AgriLayerLike> = {}): AgriLayerLike {
  return { declaredClass: "test.Layer", ...overrides };
}
