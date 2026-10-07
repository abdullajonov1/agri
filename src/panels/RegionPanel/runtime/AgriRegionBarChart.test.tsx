import { React } from "jimu-core";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { AgriRegionBarChart, type AgriRegionBarChartItem } from "./AgriRegionBarChart";
import { SortAscIcon, SortDescIcon } from "./SortIcons";

const DATA: AgriRegionBarChartItem[] = [
  { name: "Andijon", displayName: "Andijon viloyati", maydon: 50 },
  { name: "Buxoro", maydon: 0 },
];

interface Handlers {
  onRowClick: jest.Mock<void, [AgriRegionBarChartItem]>;
  onRowPointerEnter: jest.Mock;
  onRowPointerMove: jest.Mock;
}

const renderChart = (selectedRegion: string | null = null, handlers?: Partial<Handlers>) => {
  const h: Handlers = {
    onRowClick: jest.fn(),
    onRowPointerEnter: jest.fn(),
    onRowPointerMove: jest.fn(),
    ...handlers,
  };
  const utils = render(
    <AgriRegionBarChart
      data={DATA}
      chartAreaHeight={100}
      chartBarGap={4}
      chartTrackRightInset={8}
      nameColumnWidth={120}
      chartAxisMax={100}
      unitLabel="ga"
      selectedRegion={selectedRegion}
      viewKey="v1"
      formatNumber={(n: number) => String(n)}
      {...h}
    />,
  );
  return { ...utils, h };
};

describe("AgriRegionBarChart", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  test("renders a row per item with display names and values", () => {
    const { container } = renderChart();
    expect(screen.getByText("Andijon viloyati")).toBeTruthy();
    expect(screen.getByText("Buxoro")).toBeTruthy();
    expect(container.textContent).toContain("50 ga");
    const rows = container.querySelectorAll("button.agri-region-bar-chart__row");
    expect(rows).toHaveLength(2);
    expect((rows[0] as HTMLElement).style.height).toBe("48px");
  });

  test("marks selected and dimmed rows", () => {
    const { container } = renderChart("Andijon");
    const rows = container.querySelectorAll("button");
    expect(rows[0].className).toContain("--selected");
    expect(rows[1].className).toContain("--dimmed");
  });

  test("starts bars collapsed and runs the staggered grow timers", () => {
    const { container } = renderChart();
    const wrap = container.querySelector(".agri-region-bar-chart__fill-wrap") as HTMLElement;
    expect(wrap.style.width).toBe("0px");
    // jsdom's CSS parser rejects max(); only verify the timers run cleanly.
    act(() => {
      jest.runAllTimers();
    });
    expect(container.querySelectorAll(".agri-region-bar-chart__fill-wrap")).toHaveLength(2);
  });

  test("forwards click and pointer events with the item", () => {
    const { h } = renderChart();
    const row = screen.getByText("Buxoro").closest("button") as HTMLButtonElement;
    fireEvent.click(row);
    fireEvent.mouseEnter(row);
    fireEvent.mouseMove(row);
    expect(h.onRowClick).toHaveBeenCalledWith(DATA[1]);
    expect(h.onRowPointerEnter.mock.calls[0][0]).toBe(DATA[1]);
    expect(h.onRowPointerMove.mock.calls[0][0]).toBe(DATA[1]);
  });
});

describe("SortIcons", () => {
  test("render aria-hidden svg icons", () => {
    const { container } = render(
      <>
        <SortAscIcon />
        <SortDescIcon />
      </>,
    );
    const svgs = container.querySelectorAll("svg.agri-v11-regional-sort-icon");
    expect(svgs).toHaveLength(2);
    expect(svgs[0].getAttribute("aria-hidden")).toBe("true");
    expect(svgs[0].querySelectorAll("path")).toHaveLength(5);
  });
});
