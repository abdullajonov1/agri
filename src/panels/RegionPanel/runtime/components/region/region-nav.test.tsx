jest.mock("jimu-core", () => ({ React: jest.requireActual("react") }));
jest.mock("jimu-arcgis", () => ({}));

import { render, screen } from "@testing-library/react";
import { React } from "jimu-core";
import type { RegionWidgetHost } from "../../region-host";
import type { RegionalDataItem } from "../../widget";
import { makeStubHost } from "../../__test-utils__/stub-host";
import {
  applyTooltipPosition,
  bindPointerTracking,
  clampCursorPosition,
  formatNumber,
  getClientPoint,
  handleBarPointerEnter,
  handleBarPointerMove,
  handleBarRowClick,
  handleBarRowPointerEnter,
  handleBarRowPointerMove,
  handleChartSurfaceMove,
  handleGlobalPointerMove,
  handleRegionSelectionClick,
  handleWidgetPointerLeave,
  hideCursorTooltip,
  navigateBack,
  renderCursorTooltipContent,
  unbindPointerTracking,
} from "./region-nav";

const click = (host: RegionWidgetHost, name: string): void =>
  handleRegionSelectionClick(host, { name });

const lastNotify = (host: RegionWidgetHost): unknown[] => {
  const calls = (host.notifyAgriFilter as jest.Mock).mock.calls;
  return calls[calls.length - 1] as unknown[];
};

describe("handleRegionSelectionClick", () => {
  it("ignores clicks while not connected or without a name", () => {
    const host = makeStubHost({ connectionStatus: "connecting" });
    click(host, "Andijon");
    handleRegionSelectionClick(makeStubHost(), {});
    expect(host.notifyAgriFilter).not.toHaveBeenCalled();
  });

  it("drills from viloyat list into tuman list and refetches", () => {
    const host = makeStubHost();
    click(host, "Andijon");
    expect(lastNotify(host)).toEqual([{ viloyat: "Andijon", tuman: "" }, 1]);
    expect(host.state.currentView).toBe("tuman");
    expect(host.state.selectedViloyatForDrillDown).toBe("Andijon");
    expect(host.fetchRegionalDataDeduped).toHaveBeenCalled();
  });

  it("selects a tuman inside a drilled viloyat", () => {
    const host = makeStubHost({ currentView: "tuman", selectedViloyatForDrillDown: "Andijon" });
    click(host, "Asaka");
    expect(lastNotify(host)).toEqual([{ viloyat: "Andijon", tuman: "Asaka" }, 1]);
    expect(host.state.selectedRegion).toBe("Asaka");
  });

  it("uses the payload row when recharts passes { payload }", () => {
    const host = makeStubHost({ currentView: "tuman", selectedViloyatForDrillDown: "A" });
    handleRegionSelectionClick(host, { payload: { name: "Asaka", maydon: 1 } });
    expect(host.state.selectedRegion).toBe("Asaka");
  });

  it("deselects a tuman but keeps the drilled viloyat", () => {
    const host = makeStubHost({
      currentView: "tuman",
      selectedViloyatForDrillDown: "Andijon",
      selectedRegion: "Asaka",
    });
    click(host, "Asaka");
    expect(host.state.selectedRegion).toBeNull();
    expect(lastNotify(host)).toEqual([{ tuman: "", viloyat: "Andijon" }, 1]);
  });

  it("deselecting in viloyat view clears the whole geography", () => {
    const host = makeStubHost({ selectedRegion: "Andijon" });
    click(host, "Andijon");
    expect(lastNotify(host)).toEqual([{ viloyat: "", tuman: "" }, 1]);
  });
});

describe("navigateBack", () => {
  it("does nothing when not connected", () => {
    const host = makeStubHost({ connectionStatus: "idle" });
    navigateBack(host);
    expect(host.notifyAgriFilter).not.toHaveBeenCalled();
  });

  it("goes to the locked viloyat tuman list when locked", () => {
    const host = makeStubHost({ lockedViloyat: "Locked", currentView: "tuman" });
    navigateBack(host);
    expect(lastNotify(host)).toEqual([{ tuman: "", polygonMode: false, uniqueid: "" }, 1]);
    expect(host.state.selectedViloyatForDrillDown).toBe("Locked");
    expect(host.state.currentView).toBe("tuman");
    expect(host.fetchRegionalDataDeduped).toHaveBeenCalled();
  });

  it("returns from a drilled viloyat to the viloyat list", () => {
    const host = makeStubHost({
      currentView: "tuman",
      selectedViloyatForDrillDown: "Andijon",
      currentFilters: {
        yil: "2024",
        viloyat: "Andijon",
        tuman: "Asaka",
        turi: "",
        turlar: [],
        vh: "",
        vhUniqueids: null,
        filterPieByVh: false,
      },
    });
    host._pendingBackToViloyatHighlight = "x";
    navigateBack(host);
    expect(host.state.currentView).toBe("viloyat");
    expect(host.state.selectedViloyatForDrillDown).toBeNull();
    expect(host.state.currentFilters.viloyat).toBe("");
    expect(host.state.currentFilters.yil).toBe("2024");
    expect(host._pendingBackToViloyatHighlight).toBeNull();
    expect(lastNotify(host)[0]).toEqual({ viloyat: "", tuman: "", polygonMode: false, uniqueid: "" });
  });

  it("performs a full clear from the top-level view", () => {
    const host = makeStubHost({
      currentFilters: {
        yil: "2024",
        viloyat: "",
        tuman: "",
        turi: "Bugdoy",
        turlar: ["Bugdoy"],
        vh: "good",
        vhUniqueids: ["1"],
        filterPieByVh: false,
      },
    });
    navigateBack(host);
    expect(lastNotify(host)[0]).toEqual({
      viloyat: "",
      tuman: "",
      turi: "",
      vh: "",
      polygonMode: false,
      uniqueid: "",
    });
    expect(host.state.currentFilters.turlar).toEqual([]);
    expect(host.state.currentFilters.vhUniqueids).toBeNull();
    expect(host.fetchRegionalDataDeduped).toHaveBeenCalled();
  });
});

describe("formatNumber", () => {
  const host = makeStubHost();
  it("returns a dash for null and non-finite values", () => {
    expect(formatNumber(host, null)).toBe("-");
    expect(formatNumber(host, undefined)).toBe("-");
    expect(formatNumber(host, Number.NaN)).toBe("-");
  });
  it("formats with the requested decimals", () => {
    expect(formatNumber(host, 1.5, 2).replace(/\s/g, "")).toBe("1,50");
    expect(formatNumber(host, 1234).replace(/\s/g, "")).toBe("1234");
  });
});

describe("tooltip geometry", () => {
  const makeSurface = (): HTMLDivElement => {
    const el = document.createElement("div");
    jest.spyOn(el, "getBoundingClientRect").mockReturnValue({
      left: 100,
      top: 50,
      right: 500,
      bottom: 350,
      width: 400,
      height: 300,
      x: 100,
      y: 50,
      toJSON: () => ({}),
    });
    Object.defineProperty(el, "clientWidth", { value: 400 });
    Object.defineProperty(el, "clientHeight", { value: 300 });
    return el;
  };

  it("returns the origin without a surface", () => {
    expect(clampCursorPosition(makeStubHost(), 10, 10)).toEqual({ x: 0, y: 0 });
  });

  it("offsets from the cursor and flips near the right/bottom edges", () => {
    const host = makeStubHost();
    host._rootRef = { current: makeSurface() };
    expect(clampCursorPosition(host, 150, 100)).toEqual({ x: 66, y: 64 });
    const flipped = clampCursorPosition(host, 480, 340);
    expect(flipped.x).toBeLessThan(400 - 148);
    expect(flipped.y).toBeLessThanOrEqual(300 - 58 - 10);
  });

  it("applies position with important inline styles", () => {
    const host = makeStubHost();
    applyTooltipPosition(host, 1, 2);
    const node = document.createElement("div");
    host._cursorTooltipRef = { current: node };
    applyTooltipPosition(host, 12, 34);
    expect(node.style.left).toBe("12px");
    expect(node.style.getPropertyPriority("top")).toBe("important");
    expect(node.style.transform).toBe("none");
  });

  it("reads client coordinates from a nativeEvent or plain event", () => {
    const host = makeStubHost();
    expect(getClientPoint(host, null, { nativeEvent: { clientX: 3, clientY: 4 } })).toEqual({ x: 3, y: 4 });
    expect(getClientPoint(host, "str", { clientX: 7, clientY: 8 })).toEqual({ x: 7, y: 8 });
    expect(getClientPoint(host, { clientX: Number.NaN, clientY: 1 })).toEqual({ x: 0, y: 0 });
  });
});

describe("pointer tracking", () => {
  it("binds once and unbinds the window listener", () => {
    const add = jest.spyOn(window, "addEventListener");
    const remove = jest.spyOn(window, "removeEventListener");
    const host = makeStubHost();
    bindPointerTracking(host);
    bindPointerTracking(host);
    expect(add.mock.calls.filter((c) => c[0] === "mousemove")).toHaveLength(1);
    expect(host._pointerTracking).toBe(true);
    unbindPointerTracking(host);
    unbindPointerTracking(host);
    expect(remove.mock.calls.filter((c) => c[0] === "mousemove")).toHaveLength(1);
    expect(host._pointerTracking).toBe(false);
    add.mockRestore();
    remove.mockRestore();
  });

  it("hideCursorTooltip clears a visible tooltip only", () => {
    const hidden = makeStubHost();
    hideCursorTooltip(hidden);
    expect(hidden.unbindPointerTracking).toHaveBeenCalled();
    expect(hidden.setState).not.toHaveBeenCalled();

    const item: RegionalDataItem = { name: "A", maydon: 1 };
    const shown = makeStubHost({ cursorTooltip: { visible: true, data: item } });
    hideCursorTooltip(shown);
    expect(shown.state.cursorTooltip).toEqual({ visible: false, data: null });
    handleWidgetPointerLeave(shown);
    expect(shown.hideCursorTooltip).toHaveBeenCalledTimes(1);
  });

  it("handleGlobalPointerMove repositions inside the surface and hides outside", () => {
    const item: RegionalDataItem = { name: "A", maydon: 1 };
    const surface = document.createElement("div");
    jest.spyOn(surface, "getBoundingClientRect").mockReturnValue({
      left: 0, top: 0, right: 100, bottom: 100, width: 100, height: 100, x: 0, y: 0, toJSON: () => ({}),
    });
    const host = makeStubHost({ cursorTooltip: { visible: true, data: item } });
    handleGlobalPointerMove(makeStubHost(), new MouseEvent("mousemove"));
    host._rootRef = { current: surface };
    (host.clampCursorPosition as jest.Mock).mockReturnValue({ x: 5, y: 6 });
    handleGlobalPointerMove(host, new MouseEvent("mousemove", { clientX: 10, clientY: 10 }));
    expect(host.applyTooltipPosition).toHaveBeenCalledWith(5, 6);
    handleGlobalPointerMove(host, new MouseEvent("mousemove", { clientX: 500, clientY: 10 }));
    expect(host.hideCursorTooltip).toHaveBeenCalled();
    host._rootRef = { current: null };
    handleGlobalPointerMove(host, new MouseEvent("mousemove"));
  });
});

describe("bar pointer handlers", () => {
  const item: RegionalDataItem = { name: "A", maydon: 2 };
  const evt = {} as React.MouseEvent<Element, MouseEvent>;

  it("shows the tooltip with the payload row and positions it after state flush", () => {
    const host = makeStubHost();
    (host.getClientPoint as jest.Mock).mockReturnValue({ x: 1, y: 2 });
    (host.clampCursorPosition as jest.Mock).mockReturnValue({ x: 9, y: 8 });
    handleBarPointerEnter(host, { payload: item }, 0, evt);
    expect(host.bindPointerTracking).toHaveBeenCalled();
    expect(host.state.cursorTooltip).toEqual({ visible: true, data: item });
    expect(host.applyTooltipPosition).toHaveBeenCalledWith(9, 8);
  });

  it("moves the tooltip only while visible and with a real point", () => {
    const hidden = makeStubHost();
    handleBarPointerMove(hidden, item, 0, evt);
    expect(hidden.getClientPoint).not.toHaveBeenCalled();

    const host = makeStubHost({ cursorTooltip: { visible: true, data: item } });
    (host.getClientPoint as jest.Mock).mockReturnValueOnce({ x: 0, y: 0 }).mockReturnValue({ x: 4, y: 5 });
    (host.clampCursorPosition as jest.Mock).mockReturnValue({ x: 1, y: 1 });
    handleBarPointerMove(host, item, 0, evt);
    expect(host.applyTooltipPosition).not.toHaveBeenCalled();
    handleBarPointerMove(host, item, 0, evt);
    expect(host.applyTooltipPosition).toHaveBeenCalledWith(1, 1);
  });

  it("moves the tooltip on chart surface moves", () => {
    const host = makeStubHost({ cursorTooltip: { visible: true, data: item } });
    (host.getClientPoint as jest.Mock).mockReturnValue({ x: 4, y: 5 });
    (host.clampCursorPosition as jest.Mock).mockReturnValue({ x: 2, y: 3 });
    const e = { nativeEvent: {} } as React.MouseEvent<HTMLDivElement>;
    handleChartSurfaceMove(host, e);
    expect(host.applyTooltipPosition).toHaveBeenCalledWith(2, 3);
    (host.getClientPoint as jest.Mock).mockReturnValue({ x: 0, y: 0 });
    (host.applyTooltipPosition as jest.Mock).mockClear();
    handleChartSurfaceMove(host, e);
    handleChartSurfaceMove(makeStubHost(), e);
    expect(host.applyTooltipPosition).not.toHaveBeenCalled();
  });

  it("row handlers delegate to the bar handlers", () => {
    const host = makeStubHost();
    const be = {} as React.MouseEvent<HTMLButtonElement>;
    handleBarRowClick(host, item);
    expect(host.handleRegionSelectionClick).toHaveBeenCalledWith({ payload: item });
    handleBarRowPointerEnter(host, item, be);
    expect(host.handleBarPointerEnter).toHaveBeenCalledWith(item, 0, be);
    handleBarRowPointerMove(host, item, be);
    expect(host.handleBarPointerMove).toHaveBeenCalledWith(item, 0, be);
  });
});

describe("renderCursorTooltipContent", () => {
  const item: RegionalDataItem & { displayName?: string } = {
    name: "Andijon",
    displayName: "Andijon viloyati",
    maydon: 1000,
    percentage: 12.34,
  };

  it.each([
    ["en", "Value:", "Percentage:", "ha"],
    ["ru", "Значение:", "Процент:", "га"],
    ["uz_lat", "Qiymat:", "Foiz:", "ga"],
    ["uz_cyr", "Қиймат:", "Фоиз:", "га"],
  ] as const)("localises for %s", (language, value, pct, unit) => {
    const host = makeStubHost({ language }, { formatNumber: (n: number) => `N${n}` });
    render(<div>{renderCursorTooltipContent(host, item)}</div>);
    expect(screen.getByText(value)).toBeTruthy();
    expect(screen.getByText(pct)).toBeTruthy();
    expect(screen.getByText(`N1000 ${unit}`)).toBeTruthy();
    expect(screen.getByText("12.3%")).toBeTruthy();
    expect(screen.getByText("Andijon viloyati")).toBeTruthy();
  });

  it("falls back to name and 0% when displayName/percentage are missing", () => {
    const host = makeStubHost({}, { formatNumber: (n: number) => String(n) });
    render(<div>{renderCursorTooltipContent(host, { name: "Buxoro", maydon: 1 })}</div>);
    expect(screen.getByText("Buxoro")).toBeTruthy();
    expect(screen.getByText("0.0%")).toBeTruthy();
  });
});
