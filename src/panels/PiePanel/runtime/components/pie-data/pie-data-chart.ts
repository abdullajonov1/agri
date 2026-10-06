import type { PieWidgetHost } from "../../pie-host";
import { toPieSliceData, type PieEChartsOption } from "../../echarts-setup";
import { toPlainRecord } from "../../../../../shared/agri-plain-object";
import { FALLBACK_COLORS as pieFallbackColors } from "../../pie-colors";
import { queryAgriRegionDistrictMappings } from "../../../../../gis/agri-table-data-source";

export const updatePieChart = (host: PieWidgetHost, reason: "data" | "selection" = "data") => {
  const chart = host.ensurePieChart();
  if (!chart) return;

  const {
    selectedCategories,
    viloyat,
    lockedViloyat,
  } = host.state;
  const pieInteractive = !!(lockedViloyat || viloyat || "").trim();
  const chartData = host.getChartDataForPie();
  const normalizedSelections = selectedCategories.map((selected) =>
    host.normalizeName(selected),
  );
  const hasSelectedSlice = normalizedSelections.length > 0;
  const sliceBorder = host.getSliceBorderColor();
  const visibleSliceCount = chartData.filter(
    (item) => (Number(item.value) || 0) > 0,
  ).length;
  const isDataUpdate = host._pieHasRendered && reason === "data";
  const isSelectionUpdate = reason === "selection" && host._pieHasRendered;
  const isSingleSlice =
    isDataUpdate || isSelectionUpdate ? false : visibleSliceCount === 1;
  const segmentBorderWidth = isSingleSlice ? 0 : visibleSliceCount > 8 ? 1 : 2;
  const segmentBorderRadius = isSingleSlice
    ? 0
    : visibleSliceCount > 10
      ? 4
      : visibleSliceCount > 6
        ? 6
        : 10;

  const isIpad = host.isIpadLayout();
  const option: PieEChartsOption = {
    animation: !isSelectionUpdate,
    ...(isSelectionUpdate
      ? {
          animationDuration: 0,
          animationDurationUpdate: 0,
        }
      : isDataUpdate
        ? {
            animationDurationUpdate: 280,
            animationEasingUpdate: "cubicInOut",
          }
        : {
            animationDuration: 500,
            animationEasing: "cubicOut",
          }),
    color: pieFallbackColors,
    tooltip: {
      trigger: "item",
      show: isIpad && pieInteractive,
      triggerOn: "click",
      confine: true,
      appendToBody: true,
      formatter: (params: unknown) => {
        const record = toPlainRecord(params);
        const name = String(
          record?.name || toPieSliceData(record?.data).name || "",
        ).trim();
        return name || "";
      },
      backgroundColor: host.state.isDarkTheme ? "#1f2030" : "#ffffff",
      borderColor: host.state.isDarkTheme
        ? "rgba(126, 214, 255, 0.22)"
        : "rgba(15, 23, 42, 0.12)",
      borderWidth: 1,
      padding: [8, 12],
      textStyle: {
        color: host.state.isDarkTheme ? "#e9f8ff" : "#0f172a",
        fontSize: 13,
        fontWeight: 700,
        fontFamily: "Geologica, ui-sans-serif, system-ui, sans-serif",
      },
      extraCssText:
        "border-radius:12px;box-shadow:0 8px 24px rgba(15,23,42,0.16);",
    },
    legend: {
      show: false,
    },
    title: { show: false },
    series: [
      {
        id: "agri-pie-donut",
        name: "Access From",
        type: "pie",
        silent: !pieInteractive,
        selectedMode: false,
        selectedOffset: hasSelectedSlice ? 6 : 0,
        startAngle: 90,
        padAngle: 0,
        radius: ["56%", "88%"],
        center: ["50%", "50%"],
        avoidLabelOverlap: true,
        minAngle: 0,
        z: 2,
        ...(isSelectionUpdate
          ? {
              animationTypeUpdate: "transition",
              animationDurationUpdate: 0,
              animationDelayUpdate: 0,
            }
          : isDataUpdate
            ? {
                animationTypeUpdate: "transition",
                animationDurationUpdate: 280,
                animationEasingUpdate: "cubicInOut",
                animationDelayUpdate: 0,
              }
            : {
                animationType: "scale",
                animationDuration: 500,
                animationEasing: "cubicOut",
                animationDelay: (index: number) => index * 40,
              }),
        cursor: pieInteractive ? "pointer" : "default",
        itemStyle: {
          borderRadius: segmentBorderRadius,
          borderColor: sliceBorder,
          borderWidth: segmentBorderWidth,
        },
        label: {
          show: false,
        },
        emphasis: {
          scale: !hasSelectedSlice,
          scaleSize: 2,
          focus: "none",
          itemStyle: {
            borderColor: sliceBorder,
            borderWidth: segmentBorderWidth,
            shadowBlur: 0,
            shadowOffsetY: 0,
            shadowColor: "transparent",
          },
          label: {
            show: false,
          },
        },
        blur: {
          itemStyle: {
            opacity: 1,
          },
        },
        labelLine: {
          show: false,
        },
        data: chartData.map((item, index) => {
          const baseColor = host.getCropColor(item.rawKey || item.name, index);
          const itemKey = host.normalizeName(item.rawKey || item.name || "");
          const isSelected = normalizedSelections.includes(itemKey);
          const hasValue = (Number(item.value) || 0) > 0;
          const isDimmed = hasSelectedSlice && !isSelected;
          return {
            id: `crop-${itemKey || index}`,
            value: item.value,
            name: item.name,
            rawKey: item.rawKey,
            percentage: item.percentage,
            selected: isSelected && hasValue,
            itemStyle: {
              color: baseColor,
              opacity: !hasValue ? 0 : isDimmed ? 0.28 : 1,
              borderColor: sliceBorder,
              borderWidth: hasValue ? segmentBorderWidth : 0,
              borderRadius: segmentBorderRadius,
            },
          };
        }),
      },
    ],
  };

  chart.setOption(
    option,
    isSelectionUpdate
      ? { notMerge: false, lazyUpdate: false }
      : isDataUpdate
        ? { notMerge: false, replaceMerge: ["series"], lazyUpdate: false }
        : { notMerge: true, lazyUpdate: false },
  );
  if (chartData.some((item) => (Number(item.value) || 0) > 0)) {
    host._pieHasRendered = true;
  }
  host.schedulePieChartResize();
};
export const handleSliceClick = (host: PieWidgetHost, data: { rawKey?: string; name?: string }, index: number): void => {
  const canSlice =
    !!(host.state.lockedViloyat || host.state.viloyat || "").trim();
  if (!canSlice) return;

  const selectedCategoryName = String(data.rawKey || data.name || "").trim();
  if (!selectedCategoryName) return;
  const selectedKey = host.normalizeName(selectedCategoryName);
  const isSelected = host.state.selectedCategories.some(
    (category) => host.normalizeName(category) === selectedKey,
  );
  const nextSelections = isSelected
    ? host.state.selectedCategories.filter(
        (category) => host.normalizeName(category) !== selectedKey,
      )
    : [...host.state.selectedCategories, selectedCategoryName];
  const singleSelection = nextSelections.length === 1 ? nextSelections[0] : "";
  const turiNames = host.cropIdsToTuriNames(nextSelections);
  const singleTuriName = turiNames.length === 1 ? turiNames[0] : "";

  host.setState(
    {
      activeSlice: isSelected ? null : index,
      selectedCategory: singleSelection || null,
      selectedCategories: nextSelections,
      turi: singleSelection,
      turlar: nextSelections,
    },
    () => {
      document.dispatchEvent(
        new CustomEvent("widgetSelectionChanged", {
          detail: {
            turi: singleTuriName,
            turlar: turiNames,
            polygonMode: false,
            source: "AgriPie",
            timestamp: Date.now(),
          },
          bubbles: true,
        }),
      );

      // iPad has no legend — keep the slice name visible via tooltip after click.
      if (host.isIpadLayout() && host._pieChart) {
        window.requestAnimationFrame(() => {
          host._pieChart?.dispatchAction({
            type: "showTip",
            seriesIndex: 0,
            dataIndex: index,
          });
        });
      }
    },
  );
};
export const applyCategoryFilter = async (host: PieWidgetHost): Promise<void> => {
  const { selectedCategories, yil, viloyat, tuman } = host.state;
  const turiNames = host.cropIdsToTuriNames(selectedCategories);

  document.dispatchEvent(
    new CustomEvent("categoryFilterChanged", {
      detail: {
        yil,
        viloyat,
        tuman,
        category: turiNames.length === 1 ? turiNames[0] : "",
        turi: turiNames.length === 1 ? turiNames[0] : "",
        turlar: turiNames,
        source: "AgriPie",
        timestamp: Date.now(),
      },
      bubbles: true,
    }),
  );
};
export function resolveNdviDateForVhPie(host: PieWidgetHost): string {
  const explicit = String(host.state.ndviDate || "").trim();
  if (explicit) return explicit;
  const field = String(host.state.barCategoryField || "");
  const match = field.match(/status_(\d{4})_(\d{2})_(\d{2})/i);
  if (match) return `${match[1]}-${match[2]}-${match[3]}`;
  return "";
}
export async function resolveRegionDistrictForPie(host: PieWidgetHost): Promise<{
    region?: number;
    district?: number;
  }> {
  const viloyat = host.normalizeName(
    host.state.viloyat || host.state.lockedViloyat || "",
  );
  const tuman = host.normalizeName(host.state.tuman || "");
  if (!viloyat) return {};

  const rows = await queryAgriRegionDistrictMappings();
  const vKey = host.makeViloyatKey(viloyat);
  const tKey = tuman ? host.makeViloyatKey(tuman) : "";
  let region: number | undefined;
  let regionVotes = 0;
  let district: number | undefined;
  let districtVotes = 0;
  for (const row of rows) {
    if (host.makeViloyatKey(row.viloyat) !== vKey) continue;
    const vote =
      row.count != null && Number.isFinite(row.count) && row.count > 0
        ? Number(row.count)
        : 1;
    if (region == null || vote > regionVotes) {
      region = row.region;
      regionVotes = vote;
    }
    if (tKey && host.makeViloyatKey(row.tuman) === tKey) {
      if (district == null || vote > districtVotes) {
        district = row.district;
        districtVotes = vote;
      }
    }
  }
  return { region, district: tuman ? district : undefined };
}
