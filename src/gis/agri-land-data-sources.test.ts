const mockLoad = jest.fn<Promise<unknown[]>, [string[]]>();
jest.mock("jimu-arcgis", () => ({
  loadArcGISJSAPIModules: (mods: string[]) => mockLoad(mods),
}));

import { getAgriReserveLandLayer, getAgriReserveLandUrl } from "./agri-reserve-land-data-source";
import { getAgriUnusedLandLayer, getAgriUnusedLandUrl } from "./agri-unused-land-data-source";

class FakeFeatureLayer {
  url: string;
  title = "Land";
  fields = [{ name: "uniqueid" }, { name: "yil" }];
  constructor(props: { url: string }) {
    this.url = props.url;
  }
  load(): Promise<void> {
    return Promise.resolve();
  }
}

describe("reserve / unused land data sources", () => {
  beforeEach(() => {
    mockLoad.mockReset().mockResolvedValue([FakeFeatureLayer]);
  });

  test("urls come from service config", () => {
    expect(getAgriReserveLandUrl()).toMatch(/Agri_reserve_land\/FeatureServer\/1$/);
    expect(getAgriUnusedLandUrl()).toMatch(/Agri_unused_land\/FeatureServer\/2$/);
  });

  test("each loader loads its own layer once and exposes field names", async () => {
    const reserve = await getAgriReserveLandLayer();
    const reserveAgain = await getAgriReserveLandLayer();
    const unused = await getAgriUnusedLandLayer();
    expect(reserveAgain).toBe(reserve);
    expect(reserve.fields).toEqual(["uniqueid", "yil"]);
    expect((reserve.layer as unknown as FakeFeatureLayer).url).toBe(getAgriReserveLandUrl());
    expect((unused.layer as unknown as FakeFeatureLayer).url).toBe(getAgriUnusedLandUrl());
    expect(mockLoad).toHaveBeenCalledTimes(2);
  });
});
