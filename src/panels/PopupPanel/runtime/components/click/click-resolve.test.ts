import * as resolve from "./click-resolve";
import * as events from "./click-events";
import * as open from "./click-open";
import * as layers from "./click-layers";
import * as view from "./click-view";
import * as handlers from "../click-handlers";

jest.mock("../../../../../gis/feature-layer-data", () => ({}));
jest.mock("../../../../../gis/agri-table-data-source", () => ({ AGRI_TABLE_JOIN_FIELD: "uniqueid" }));
jest.mock("../../../../../gis/agri-vegetation-data-source", () => ({}));
jest.mock("../../../../../gis/agri-polygon-api-source", () => ({}));
jest.mock("../../../../../gis/agri-vegetation-overlay-prefetch", () => ({}));

describe("click-resolve / click-handlers barrels", () => {
  test("click-resolve re-exports the implementation modules by identity", () => {
    expect(resolve.attachMapClick).toBe(events.attachMapClick);
    expect(resolve.handleMasterFilterChanged).toBe(events.handleMasterFilterChanged);
    expect(resolve.broadcastPopupVisibility).toBe(events.broadcastPopupVisibility);
    expect(resolve.openPopupForUniqueid).toBe(open.openPopupForUniqueid);
    expect(resolve.resolveDisplayAttrs).toBe(open.resolveDisplayAttrs);
    expect(resolve.resolveClickLayers).toBe(layers.resolveClickLayers);
    expect(resolve.pickClickGraphic).toBe(layers.pickClickGraphic);
    expect(resolve.resolveClickFeatureAt).toBe(layers.resolveClickFeatureAt);
  });

  test("click-handlers exposes everything from click-resolve plus onViewClick", () => {
    for (const key of Object.keys(resolve)) {
      expect((handlers as Record<string, unknown>)[key]).toBe((resolve as Record<string, unknown>)[key]);
    }
    expect(handlers.onViewClick).toBe(view.onViewClick);
  });
});
