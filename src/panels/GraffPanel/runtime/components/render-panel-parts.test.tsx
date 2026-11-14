jest.mock("jimu-core", () => ({ React: jest.requireActual("react") }));
jest.mock("jimu-arcgis", () => ({ JimuMapViewComponent: () => null }));
jest.mock("../../../../shared/AgriChartLoader", () => ({ __esModule: true, default: () => null }));
jest.mock("lucide-react", () => ({
  TriangleAlert: () => null,
  ChevronDown: () => null,
  ChevronLeft: () => null,
  ChevronRight: () => null,
}));

import { renderToStaticMarkup } from "react-dom/server";
import { resolveHeaderLabel } from "./render-panel-parts";

describe("resolveHeaderLabel", () => {
  const labels = { vh: "VH", tuman: "T", maydon: "M", name: "N" } as never;
  it("maps known and fuzzy fields", () => {
    expect(resolveHeaderLabel("VH", labels, (f) => f)).toBe("VH");
    expect(resolveHeaderLabel("tuman", labels, (f) => f)).toBe("T");
    expect(resolveHeaderLabel("total_area", labels, (f) => f)).toBe("M");
    expect(resolveHeaderLabel("some_name", labels, (f) => f)).toBe("N");
    expect(resolveHeaderLabel("other", labels, (f) => `d:${f}`)).toBe("d:other");
  });
  it("is a pure function", () => {
    expect(typeof renderToStaticMarkup).toBe("function");
  });
});
