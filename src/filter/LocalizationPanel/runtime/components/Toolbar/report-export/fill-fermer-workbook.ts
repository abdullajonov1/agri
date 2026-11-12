/**
 * Fill the farmer-level "Fermer xisobot" template (one tuman).
 * Row 1 is the header; row 2's styles are copied to every data row.
 */
import { loadXlsxPopulate } from "../../../../../../vendor/xlsx-populate-shim";
import {
  b64ToUint8,
  getStyleId,
  rowHeight,
  setRowHeight,
  setStyleId,
  setVal,
  workbookBuffer,
} from "./fill-workbook";
import { getCropDisplayName } from "../../../../../../shared/agri-crop-labels";
import { FERMER_XISOBOT_B64 } from "./templates-b64";
import type { FarmerRow, ReportScope } from "./types";

const FIRST_ROW = 2;
const COLS = 8;
/** Last row that carries sample data / decoration in the template. */
const TEMPLATE_LAST_ROW = 9;

function innValue(inn: string): string | number {
  return /^\d{1,15}$/.test(inn) ? Number(inn) : inn;
}

export async function fillFermerWorkbook(
  scope: ReportScope,
  rows: FarmerRow[],
): Promise<{ filename: string; buffer: ArrayBuffer }> {
  const XlsxPopulate = await loadXlsxPopulate();
  const wb = await XlsxPopulate.fromDataAsync(b64ToUint8(FERMER_XISOBOT_B64));
  const sheet = wb.sheets()[0];

  const styles = Array.from({ length: COLS }, (_, i) => getStyleId(sheet, FIRST_ROW, i + 1));
  const height = rowHeight(sheet, FIRST_ROW);
  const lastRow = FIRST_ROW + rows.length - 1;

  rows.forEach((row, i) => {
    const r = FIRST_ROW + i;
    styles.forEach((s, c) => { setStyleId(sheet, r, c + 1, s); });
    setRowHeight(sheet, r, height);
    const values = [
      i + 1,
      row.viloyat,
      row.tuman,
      row.name,
      innValue(row.inn),
      getCropDisplayName(row.turi, "uz_lat") || row.turi,
      Math.round(row.hosildorlik * 100) / 100,
      row.maydon,
    ];
    values.forEach((v, c) => { setVal(sheet, r, c + 1, v); });
  });

  for (let r = Math.max(lastRow + 1, FIRST_ROW); r <= TEMPLATE_LAST_ROW; r++) {
    for (let c = 1; c <= COLS; c++) {
      setVal(sheet, r, c, undefined);
      setStyleId(sheet, r, c, undefined);
    }
  }

  const buffer = await workbookBuffer(wb);
  const safe = (s: string) => s.replace(/[\\/:*?"<>|]/g, "_");
  return {
    filename: `Fermer_xisobot_${safe(String(scope.tuman || ""))}_${scope.yil}.xlsx`,
    buffer,
  };
}
