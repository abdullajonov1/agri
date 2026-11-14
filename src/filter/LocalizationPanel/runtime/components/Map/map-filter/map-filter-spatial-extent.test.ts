jest.mock("../../../../../localization/map-shown-extent", () => ({
  canQuerySpatialFeatureExtent: jest.fn(),
  readSpatialFeatureExtentWhere: jest.fn(),
  appendSpatialFeatureExtent: jest.fn(),
}));
jest.mock("../../../../../../gis/feature-layer-data", () => ({
  isMapImageOwnedLayer: jest.fn(),
  safeLoadMapLayer: jest.fn(),
}));
jest.mock("../../../../../../shared/agri-debug-log", () => ({
  agroV5Log: jest.fn(),
}));

import * as shown from "../../../../../localization/map-shown-extent";
import * as fld from "../../../../../../gis/feature-layer-data";
import { agroV5Log } from "../../../../../../shared/agri-debug-log";
import { queryMergedSpatialExtent } from "./map-filter-spatial-extent";

const m = (f: unknown) => f as jest.Mock<unknown, unknown[]>;
const layer = (extent: unknown, id = "L") =>
  ({
    id,
    load: jest.fn(),
    createQuery: () => ({}),
    queryExtent: jest.fn().mockResolvedValue({ extent }),
  }) as never;

describe("queryMergedSpatialExtent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    m(fld.isMapImageOwnedLayer).mockReturnValue(false);
    m(shown.canQuerySpatialFeatureExtent).mockReturnValue(true);
    m(shown.readSpatialFeatureExtentWhere).mockReturnValue("1=1");
    m(shown.appendSpatialFeatureExtent).mockImplementation(
      (acc: unknown, next: unknown) => next ?? acc,
    );
  });

  it("skips MapImage-owned, unqueryable and where-less layers", async () => {
    const a = layer("A");
    const b = layer("B");
    const c = layer("C");
    m(fld.isMapImageOwnedLayer).mockImplementation((l: unknown) => l === a);
    m(shown.canQuerySpatialFeatureExtent).mockImplementation((l: unknown) => l !== b);
    m(shown.readSpatialFeatureExtentWhere).mockReturnValue(null);
    const out = await queryMergedSpatialExtent([a, b, c], () => false);
    expect(out).toEqual({ extent: null, stale: false });
    expect((a as { queryExtent: jest.Mock }).queryExtent).not.toHaveBeenCalled();
  });

  it("merges extents with the where clause", async () => {
    const a = layer("A");
    const out = await queryMergedSpatialExtent([a], () => false);
    expect(out).toEqual({ extent: "A", stale: false });
    expect((a as { queryExtent: jest.Mock }).queryExtent).toHaveBeenCalledWith({ where: "1=1" });
  });

  it("reports stale after the query resolves", async () => {
    const out = await queryMergedSpatialExtent([layer("A")], () => true);
    expect(out.stale).toBe(true);
  });

  it("logs and continues when a layer fails", async () => {
    const bad = layer("A", "bad");
    (bad as { queryExtent: jest.Mock }).queryExtent.mockRejectedValue(new Error("boom"));
    const good = layer("B");
    const out = await queryMergedSpatialExtent([bad, good], () => false);
    expect(out.extent).toBe("B");
    expect(agroV5Log).toHaveBeenCalledWith(
      "map-filter spatial layer extent failed",
      { layerId: "bad", error: "boom" },
      "map",
    );
  });
});
