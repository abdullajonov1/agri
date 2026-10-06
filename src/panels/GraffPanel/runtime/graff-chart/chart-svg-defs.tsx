/**
 * SVG <defs> (gradients + glow filters) for the Graff vegetation chart.
 */
import { React } from "jimu-core";
import type { GraffLineSeries } from "./chart-types";

const renderSoftGlowFilter = (
  id: string,
  extent: { offset: string; size: string },
  stdDeviation: string,
  alphaValues: string,
) => (
  <filter
    id={id}
    x={extent.offset}
    y={extent.offset}
    width={extent.size}
    height={extent.size}
    filterUnits="objectBoundingBox"
    colorInterpolationFilters="sRGB"
  >
    <feGaussianBlur
      in="SourceGraphic"
      stdDeviation={stdDeviation}
      result="blur"
    />
    <feColorMatrix
      in="blur"
      type="matrix"
      values={alphaValues}
      result="soft"
    />
    <feMerge>
      <feMergeNode in="soft" />
    </feMerge>
  </filter>
);

const LINE_GLOW_MATRIX = `1 0 0 0 0
                          0 1 0 0 0
                          0 0 1 0 0
                          0 0 0 0.55 0`;
const DOT_GLOW_MATRIX = `1 0 0 0 0
                          0 1 0 0 0
                          0 0 1 0 0
                          0 0 0 0.6 0`;

export const renderChartDefs = (lineSeries: GraffLineSeries[]) => (
  <defs>
    <filter id="toolinfoShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow
        dx="0"
        dy="0"
        stdDeviation="0"
        floodColor="none"
        floodOpacity="0"
      />
    </filter>
    <linearGradient id="minMaxFill" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style={{ stopColor: "#94a3b8", stopOpacity: 0.16 }} />
      <stop offset="100%" style={{ stopColor: "#94a3b8", stopOpacity: 0.02 }} />
    </linearGradient>
    {lineSeries.map((series) => (
      <linearGradient
        key={`area-gradient-${series.key}`}
        id={`areaFill-${series.key}`}
        x1="0%"
        y1="0%"
        x2="0%"
        y2="100%"
      >
        <stop
          offset="0%"
          style={{ stopColor: series.color, stopOpacity: 0.26 }}
        />
        <stop
          offset="100%"
          style={{ stopColor: series.color, stopOpacity: 0.03 }}
        />
      </linearGradient>
    ))}
    {/* Soft glow only — expanded region avoids clipped “border” artifacts */}
    {renderSoftGlowFilter(
      "lineGlow",
      { offset: "-80%", size: "260%" },
      "2.8",
      LINE_GLOW_MATRIX,
    )}
    {renderSoftGlowFilter(
      "dotGlow",
      { offset: "-120%", size: "340%" },
      "2.4",
      DOT_GLOW_MATRIX,
    )}
  </defs>
);
