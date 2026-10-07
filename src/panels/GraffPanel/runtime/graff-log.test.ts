const mockAgroV5Log = jest.fn();
jest.mock("../../../gis/agri-debug-log", () => ({
  agroV5Log: (...args: unknown[]): void => {
    mockAgroV5Log(...args);
  },
}));

import { graffDebugCatch, graffLog } from "./graff-log";
import {
  GRAFF_INDEX_BUTTONS,
  GRAFF_INDEX_ORDER,
  isRepublicTimeseriesIndexField,
} from "./graff-graph-constants";

describe("graffLog", () => {
  beforeEach(() => mockAgroV5Log.mockClear());

  test("routes tuman-related phases to tuman topic", () => {
    graffLog("tableRow:click", { a: 1 });
    expect(mockAgroV5Log).toHaveBeenCalledWith("tableRow:click", { a: 1 }, "tuman");
    graffLog("spatial-query");
    expect(mockAgroV5Log).toHaveBeenLastCalledWith("spatial-query", undefined, "tuman");
  });

  test("other phases go to all", () => {
    graffLog("chart:render");
    expect(mockAgroV5Log).toHaveBeenCalledWith("chart:render", undefined, "all");
  });

  test("graffDebugCatch logs error message", () => {
    graffDebugCatch("x", new Error("oops"));
    expect(mockAgroV5Log).toHaveBeenCalledWith("x:ignored-error", { error: "oops" }, "all");
    graffDebugCatch("y", "str");
    expect(mockAgroV5Log).toHaveBeenLastCalledWith("y:ignored-error", { error: "str" }, "all");
  });
});

describe("graff graph constants", () => {
  test("order mirrors buttons", () => {
    expect(GRAFF_INDEX_ORDER).toEqual(GRAFF_INDEX_BUTTONS.map((b) => b.key));
  });
  test("isRepublicTimeseriesIndexField", () => {
    expect(isRepublicTimeseriesIndexField("ndvi")).toBe(true);
    expect(isRepublicTimeseriesIndexField("foo")).toBe(false);
  });
});
