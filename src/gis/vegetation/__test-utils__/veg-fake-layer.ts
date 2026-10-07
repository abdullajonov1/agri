/**
 * Test helpers for src/gis/vegetation: a fake agri_vegetation_indices layer
 * plus a stand-in for createSingletonLayerLoader so tests can swap the layer.
 *
 * Usage in a test file:
 *   jest.mock("../../shared/agri-singleton-layer-loader", () =>
 *     jest.requireActual("./__test-utils__/veg-fake-layer").singletonLoaderModuleMock(),
 *   );
 */
import type { AgriSingletonLayerHandle } from "../../../shared/agri-singleton-layer-loader";
import type { AgriQueryableLayer } from "../../../types/agri-layer";

export type FakeQuery = {
  where?: string;
  outFields?: string[];
  groupByFieldsForStatistics?: string[];
  outStatistics?: Array<Record<string, unknown>>;
  orderByFields?: string[];
  returnGeometry?: boolean;
  returnDistinctValues?: boolean;
  returnCountOnly?: boolean;
  num?: number;
  start?: number;
  resultRecordCount?: number;
  resultOffset?: number;
};

export type FakeAttrs = Record<string, unknown>;

export interface FakeResponse {
  rows: FakeAttrs[];
  exceededTransferLimit?: boolean;
}

export type FakeResponder = (
  query: FakeQuery,
) => FakeAttrs[] | FakeResponse | Promise<FakeAttrs[] | FakeResponse>;

export interface FakeVegLayer extends AgriQueryableLayer {
  url: string;
  objectIdField: string;
  maxRecordCount?: number;
  /** Every query object handed to queryFeatures, in call order. */
  executed: FakeQuery[];
  queryFeatures: jest.Mock<Promise<__esri.FeatureSet>, [FakeQuery]>;
  queryFeatureCount?: jest.Mock<Promise<number>, [FakeQuery]>;
}

export function makeFakeVegLayer(
  respond: FakeResponder,
  opts: {
    url?: string;
    objectIdField?: string;
    maxRecordCount?: number;
    queryFeatureCount?: (q: FakeQuery) => Promise<number>;
  } = {},
): FakeVegLayer {
  const executed: FakeQuery[] = [];
  const queryFeatures = jest.fn(async (query: FakeQuery) => {
    executed.push({ ...query });
    const res = await respond(query);
    const rows = Array.isArray(res) ? res : res.rows;
    const exceeded = Array.isArray(res) ? false : Boolean(res.exceededTransferLimit);
    return {
      features: rows.map((attributes) => ({ attributes })),
      exceededTransferLimit: exceeded,
    } as unknown as __esri.FeatureSet;
  });
  const layer: FakeVegLayer = {
    url: opts.url ?? "https://example.test/agri_vegetation_indices/FeatureServer/1",
    objectIdField: opts.objectIdField ?? "objectid",
    maxRecordCount: opts.maxRecordCount,
    executed,
    createQuery: () => ({}) as unknown as __esri.Query,
    queryFeatures: queryFeatures as FakeVegLayer["queryFeatures"],
  };
  if (opts.queryFeatureCount) {
    layer.queryFeatureCount = jest.fn(opts.queryFeatureCount);
  }
  return layer;
}

/** Mutable slot read by the mocked singleton loader. */
export const vegLayerSlot: { handle: AgriSingletonLayerHandle | null } = {
  handle: null,
};

export function setVegLayer(layer: FakeVegLayer, fields: string[]): void {
  vegLayerSlot.handle = {
    layer: layer as unknown as AgriSingletonLayerHandle["layer"],
    fields,
  };
}

export function singletonLoaderModuleMock(): {
  createSingletonLayerLoader: () => () => Promise<AgriSingletonLayerHandle>;
} {
  return {
    createSingletonLayerLoader: () => async () => {
      if (!vegLayerSlot.handle) throw new Error("no fake vegetation layer set");
      return vegLayerSlot.handle;
    },
  };
}

export const DEFAULT_VEG_FIELDS = [
  "objectid",
  "uniqueid",
  "region",
  "district",
  "crop_id",
  "raster_date",
  "processed_at",
  "ndvi",
  "ndvi_status",
  "px_all",
];
