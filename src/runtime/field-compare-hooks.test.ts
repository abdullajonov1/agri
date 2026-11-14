import { React } from "jimu-core";
import { renderHook, waitFor } from "@testing-library/react";
import {
  monthCells,
  readDates,
  readYmd,
  shiftMonth,
  ymdParts,
  useAvailableDates,
  useCompareImage,
} from "./field-compare-hooks";
import {
  fetchPolygonAvailableDates,
  fetchPolygonExportImageTiff,
} from "../gis/agri-polygon-api-source";

jest.mock("../gis/agri-polygon-api-source", () => ({
  fetchPolygonExportImageTiff: jest.fn(),
  fetchPolygonAvailableDates: jest.fn(),
}));

jest.mock("../shared/agri-debug-log", () => ({ agroV5Log: jest.fn() }));

jest.mock("../gis/agri-vegetation-overlay-prefetch", () => ({
  getVegetationOverlayContext: () => ({ regionId: 4, year: 2026, lastIndex: "ndvi" }),
  VEGETATION_OVERLAY_APPLIED_EVENT: "agriVegetationOverlayApplied",
}));

const fetchTiff = fetchPolygonExportImageTiff as jest.Mock;
const fetchDates = fetchPolygonAvailableDates as jest.Mock;

describe("field-compare helpers", () => {
  test("readYmd and readDates keep only valid dates", () => {
    expect(readYmd("2026-06-01T10:00")).toBe("2026-06-01");
    expect(readYmd("nope")).toBeNull();
    expect(readDates(["2026-06-01", "x", 5])).toEqual(["2026-06-01"]);
    expect(readDates("2026-06-01")).toEqual([]);
  });

  test("ymdParts, monthCells and shiftMonth work on month boundaries", () => {
    expect(ymdParts("2026-06-15")).toEqual({ year: 2026, month: 6 });
    expect(ymdParts("bad")).toBeNull();
    const cells = monthCells(2026, 6);
    expect(cells.filter(Boolean)).toHaveLength(30);
    expect(cells[cells.length - 1]).toBe("2026-06-30");
    expect(shiftMonth(2026, 1, -1)).toEqual({ year: 2025, month: 12 });
    expect(shiftMonth(2026, 12, 1)).toEqual({ year: 2027, month: 1 });
  });
});

type ImageStatus = "idle" | "loading" | "ready" | "error";

interface ImageArgs {
  open: boolean;
  uniqueid: string;
  regionId: number | null;
  displayDate: string | null;
  indexKey: "ndvi";
}

const renderImage = (args: ImageArgs) => renderHook(() => {
  const [imageUrl, setImageUrl] = React.useState("");
  const [imageStatus, setImageStatus] = React.useState<ImageStatus>("idle");
  useCompareImage({ ...args, setImageUrl, setImageStatus });
  return { imageUrl, imageStatus };
});

const renderDates = (indexDatesFlag: boolean, uniqueid = "abc") => renderHook(() => {
  const [knownDates, setKnownDates] = React.useState<string[]>([]);
  const indexDatesRef = React.useRef(indexDatesFlag);
  useAvailableDates({ uniqueid, regionId: 4, mapDate: null, indexDatesRef, setKnownDates });
  return { knownDates };
});

describe("useCompareImage", () => {
  const base: ImageArgs = { open: true, uniqueid: "abc", regionId: 4, displayDate: "2026-06-01", indexKey: "ndvi" };

  beforeEach(() => {
    fetchTiff.mockReset();
    fetchTiff.mockResolvedValue({ canvas: { toDataURL: () => "data:image/png;base64,abc" } });
  });

  test("fetches and exposes the image when open with a date", async () => {
    const { result } = renderImage(base);
    await waitFor(() => expect(result.current.imageStatus).toBe("ready"));
    expect(result.current.imageUrl).toBe("data:image/png;base64,abc");
    expect(fetchTiff).toHaveBeenCalledWith(expect.objectContaining({ rasterDate: "2026-06-01", stretch: "fixed" }));
  });

  test("does not fetch while closed", () => {
    const { result } = renderImage({ ...base, open: false });
    expect(fetchTiff).not.toHaveBeenCalled();
    expect(result.current.imageStatus).toBe("idle");
  });

  test("reports error status when the fetch fails", async () => {
    fetchTiff.mockRejectedValue(new Error("no raster"));
    const { result } = renderImage(base);
    await waitFor(() => expect(result.current.imageStatus).toBe("error"));
    expect(result.current.imageUrl).toBe("");
  });
});

describe("useAvailableDates", () => {
  beforeEach(() => {
    fetchDates.mockReset();
    fetchDates.mockResolvedValue(["2026-06-20", "2026-06-05"]);
  });

  test("loads sorted dates for the field", async () => {
    const { result } = renderDates(false);
    await waitFor(() => expect(result.current.knownDates).toEqual(["2026-06-05", "2026-06-20"]));
    expect(fetchDates).toHaveBeenCalledWith("abc", 4, 2026);
  });

  test("skips the fetch when the chart already advertised dates", () => {
    renderDates(true);
    expect(fetchDates).not.toHaveBeenCalled();
  });
});
