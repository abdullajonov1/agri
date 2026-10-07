jest.mock("../../../../../../data/agri-query-gateway", () => ({
  dedupedQueryFeatureCount: jest.fn(),
}));

import { dedupedQueryFeatureCount } from "../../../../../../data/agri-query-gateway";
import { makeFakeHost } from "../../__test-utils__/fake-host";
import { fetchDataWithCurrentState } from "./map-filter-fetch";

const countMock = dedupedQueryFeatureCount as jest.Mock;
const layer = (def = "x=1", title = "L"): __esri.FeatureLayer =>
  ({ definitionExpression: def, title }) as unknown as __esri.FeatureLayer;

describe("fetchDataWithCurrentState", () => {
  beforeEach(() => countMock.mockReset());

  it("does nothing when unmounted or not connected", async () => {
    const h = makeFakeHost({ _isMounted: false, state: { connectionStatus: "connected" } });
    await fetchDataWithCurrentState(h);
    expect(h.setState).not.toHaveBeenCalled();
    const h2 = makeFakeHost({ state: { connectionStatus: "connecting" } });
    await fetchDataWithCurrentState(h2);
    expect(h2.setState).not.toHaveBeenCalled();
  });

  it("reports an error when there are no layers", async () => {
    const h = makeFakeHost({ state: { connectionStatus: "connected", featureLayers: [], featureLayer: null } });
    await fetchDataWithCurrentState(h);
    expect(h.state.error).toBe("No feature layer available");
    expect(h.state.loading).toBe(false);
  });

  it("stops loading when VH is selected but ids are not resolved", async () => {
    const h = makeFakeHost({
      _vhMapUniqueIds: null,
      state: { connectionStatus: "connected", featureLayers: [layer()], vh: "good" },
    });
    await fetchDataWithCurrentState(h);
    expect(h.state.loading).toBe(false);
    expect(countMock).not.toHaveBeenCalled();
  });

  it("sums counts across layers, skipping empty and 1=0 WHEREs, and stores total", async () => {
    countMock.mockResolvedValue(5);
    const where = ["a=1", "", "1=0"];
    const h = makeFakeHost({
      buildWhereForLayer: jest.fn(() => where.shift() ?? ""),
      setMapNoData: jest.fn(),
      state: { connectionStatus: "connected", featureLayers: [layer(), layer(), layer("1=0")] },
    });
    await fetchDataWithCurrentState(h);
    expect(countMock).toHaveBeenCalledTimes(1);
    expect(h.state.totalRecordCount).toBe(5);
    expect(h.state.records).toEqual([]);
    expect(h.setMapNoData).toHaveBeenCalledWith(false, "data");
  });

  it("flags no-data when scoped filter has zero rows; tolerates count failure", async () => {
    countMock.mockRejectedValue(new Error("boom"));
    const h = makeFakeHost({
      buildWhereForLayer: jest.fn(() => "a=1"),
      setMapNoData: jest.fn(),
      getEffectiveViloyat: jest.fn(() => "Andijon"),
      state: { connectionStatus: "connected", featureLayer: layer() },
    });
    await fetchDataWithCurrentState(h);
    expect(h.state.totalRecordCount).toBe(0);
    expect(h.setMapNoData).toHaveBeenCalledWith(true, "data");
  });

  it("uses vegetation no-data when VH ids are empty", async () => {
    countMock.mockResolvedValue(3);
    const h = makeFakeHost({
      _vhMapUniqueIds: [],
      buildWhereForLayer: jest.fn(() => "a=1"),
      setMapNoData: jest.fn(),
      state: { connectionStatus: "connected", featureLayers: [layer()], vh: "bad" },
    });
    await fetchDataWithCurrentState(h);
    expect(h.setMapNoData).toHaveBeenCalledWith(true, "vegetation");
  });

  it("discards results when a newer request supersedes", async () => {
    let resolve: (n: number) => void = () => undefined;
    countMock.mockReturnValue(new Promise<number>((r) => { resolve = r; }));
    const h = makeFakeHost({
      buildWhereForLayer: jest.fn(() => "a=1"),
      setMapNoData: jest.fn(),
      state: { connectionStatus: "connected", featureLayers: [layer()] },
    });
    const p = fetchDataWithCurrentState(h);
    h._filterDataRequestId += 1;
    resolve(9);
    await p;
    expect(h.setMapNoData).not.toHaveBeenCalled();
    expect(h.state.totalRecordCount).not.toBe(9);
  });

  it("sets error message when something throws", async () => {
    const h = makeFakeHost({
      buildWhereForLayer: jest.fn(() => { throw new Error("bad where"); }),
      state: { connectionStatus: "connected", featureLayers: [layer()] },
    });
    await fetchDataWithCurrentState(h);
    expect(h.state.error).toBe("bad where");
    expect(h.state.loading).toBe(false);
  });
});
