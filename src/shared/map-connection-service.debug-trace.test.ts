import { agroV5Log } from "../gis/agri-debug-log";
import { resolveJimuMapView } from "./map-connection-service";

jest.mock("../gis/agri-debug-log", () => ({ agroV5Log: jest.fn() }));
jest.mock(
  "jimu-arcgis",
  () => ({
    MapViewManager: {
      getInstance: () => {
        throw new Error("no manager");
      },
    },
  }),
  { virtual: true },
);

test("traces the failure and returns null when MapViewManager throws", () => {
  expect(resolveJimuMapView("w1")).toBeNull();
  expect(agroV5Log).toHaveBeenCalledWith("mapConnection:resolve-view-failed", {
    mapWidgetId: "w1",
    error: "no manager",
  });
});
