jest.mock("jimu-core", () => ({ React: jest.requireActual("react") }));
jest.mock("react-dom", () => {
  const actual: Record<string, unknown> = jest.requireActual("react-dom");
  return { __esModule: true, ...actual, default: actual };
});
jest.mock("../../../../../shared/AgriChartLoader", () => ({ __esModule: true, default: () => null }));
jest.mock("../../../../../gis/agri-vegetation-overlay-prefetch", () => ({
  setVegetationOverlayContext: (): void => undefined,
}));
jest.mock("../../../../../data/agri-graff-date", () => ({ extractGraffYearToken: (): string => "" }));
jest.mock("lucide-react", () => ({ Table: () => null, ChartLine: () => null }));

import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import * as url from "url";
import { renderToStaticMarkup } from "react-dom/server";
import type { GraffWidgetHost } from "../../graff-host";
import { renderGraphHeader, renderGraphLegend } from "./graph-view";

const THEME_SCRIPT =
  "var t=new URLSearchParams(location.search).get('theme')==='light'?'light':'dark';" +
  "document.documentElement.dataset.theme=t;" +
  "document.addEventListener('DOMContentLoaded',function(){document.body.style.background=t==='light'?'#ffffff':'#1f2230';});";

describe("graph legend render harness", () => {
  it("renders the real legend into a themed harness page", () => {
    // Arrange
    const host = {
      state: {
        selectedIndices: ["ndvi", "ndre"],
        language: "uz_lat",
        regionalFilters: { vh: "3-O'rta" },
        selecteduniqueid: null,
      },
      isRegionalInteractionEnabled: () => true,
      handleToggleAllIndices: () => undefined,
      handleIndexChange: () => undefined,
      renderGraphLegend: () => renderGraphLegend(host),
      renderViewModeToggle: () => null,
    } as unknown as GraffWidgetHost;
    const cssHref = url.pathToFileURL(path.resolve(__dirname, "../../AgriGraff.css")).href;

    // Act
    const legend = renderToStaticMarkup(renderGraphLegend(host));
    const header = renderToStaticMarkup(renderGraphHeader(host));
    const block = (cls: string): string =>
      `<div class="${cls}" style="width:100%"><div class="graff-index-top">${legend}</div>${header}</div>`;
    const html =
      `<!doctype html><html><head><meta charset="utf-8">` +
      `<meta name="viewport" content="width=device-width, initial-scale=1">` +
      `<link rel="stylesheet" href="${cssHref}">` +
      `<script>${THEME_SCRIPT}</script></head><body><div class="kadastr-status-card">` +
      block("vegetation-graph-container") +
      block("vegetation-graph-container is-narrow") +
      "</div>" +
      `</body></html>`;
    const outPath = path.join(process.env.AGRI_HARNESS_OUT || os.tmpdir(), "graff-legend.html");
    fs.writeFileSync(outPath, html, "utf8");
    console.log(outPath);

    // Assert
    // 6 indices (NDRE hidden for now) + the "all" toggle.
    expect(legend.match(/class="index-btn-h(?: active)?"/g)).toHaveLength(7);
    expect(header.match(/class="index-btn-h(?: active)?"/g)).toHaveLength(7);
    expect(header).toContain("graff-index-top-note");
    expect(header).toContain("VH filtri");
    expect(legend).not.toContain("NDRE");
    expect(legend).not.toContain("--legend-color:#a39400");
  });
});
