import { buildReportDataBundle } from "./build-bundle";
import { fillFermerWorkbook } from "./fill-fermer-workbook";
import { fillReportWorkbook } from "./fill-workbook";
import { queryFarmerRows } from "./query-stats";
import type { ReportExportResult, ReportScope } from "./types";

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => { URL.revokeObjectURL(url); }, 1500);
}

async function buildFile(scope: ReportScope): Promise<{ filename: string; buffer: ArrayBuffer }> {
  if (scope.viloyat && scope.tuman) {
    const yil = String(scope.yil || "").trim();
    if (!yil) throw new Error("Yil tanlanmagan");
    const normalized: ReportScope = { yil, viloyat: scope.viloyat, tuman: scope.tuman };
    const rows = await queryFarmerRows(normalized);
    if (!rows.length) throw new Error("Tanlangan tuman uchun fermer ma’lumotlari topilmadi");
    return fillFermerWorkbook(normalized, rows);
  }
  const bundle = await buildReportDataBundle(scope);
  if (!bundle.geos.length) {
    throw new Error(
      scope.viloyat
        ? "Tanlangan viloyat uchun tumanlar topilmadi"
        : "Hududlar ro‘yxati bo‘sh",
    );
  }
  return fillReportWorkbook(bundle);
}

/**
 * Build and download the agri Excel report for the current Localization scope.
 * Empty viloyat → republic template; selected viloyat → district template;
 * selected tuman → farmer (Fermer) template.
 */
export async function exportAgriReport(
  scope: ReportScope,
  opts?: { download?: boolean },
): Promise<ReportExportResult> {
  const { filename, buffer } = await buildFile(scope);
  const blob = new Blob([new Uint8Array(buffer)], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  if (opts?.download !== false) {
    triggerDownload(blob, filename);
  }
  return { filename, blob };
}

/** Effective viloyat for export: lock wins over free selection. */
export function resolveExportViloyat(
  viloyat: string | null | undefined,
  lockedViloyat: string | null | undefined,
): string {
  return String(lockedViloyat || viloyat || "").trim();
}
