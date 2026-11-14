/**
 * Fill report Excel templates with live numbers.
 * Uses xlsx-populate so merges, column widths, colors and number formats stay intact.
 * Only cell values are written; district sheets copy the template row style when
 * the viloyat has more/fewer tumans than the Andijon sample.
 */
import {
  loadXlsxPopulate,
  type PopulateSheet,
  type PopulateWorkbook,
} from "../../../../../../vendor/xlsx-populate-shim";
import {
  RESERVE_CROP_COLUMNS_TUMAN,
  RESERVE_CROP_COLUMNS_VILOYAT,
} from "./query-stats";
import {
  formatReportDate,
  reportPlaceKey,
  reportPlaceKeyAlts,
  shortViloyatLabel,
  viloyatTitleName,
} from "./place-key";
import { TUMAN_XISOBOT_B64, VILOYAT_XISOBOT_B64 } from "./templates-b64";
import type {
  CropAreaRow,
  ReportDataBundle,
  ReportGeoRow,
  ReserveAreaRow,
  UnusedAreaRow,
} from "./types";

/** Region name baked into the district template titles. */
const TEMPLATE_VILOYAT = "Andijon viloyati";

export function b64ToUint8(b64: string): Uint8Array {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function cellVal(sheet: PopulateSheet, row: number, col: number): unknown {
  try {
    return sheet.cell(row, col).value();
  } catch {
    return undefined;
  }
}

export function setVal(
  sheet: PopulateSheet,
  row: number,
  col: number,
  value: string | number | null | undefined,
): void {
  const cell = sheet.cell(row, col);
  if (value === null || value === undefined || value === "") {
    cell.value(undefined);
    return;
  }
  cell.value(typeof value === "number" && !Number.isFinite(value) ? 0 : value);
}

/** xlsx-populate keeps the parsed XML on private `_node` fields. */
interface XmlNode {
  name?: string;
  attributes?: Record<string, unknown>;
  children?: unknown[];
}
type WithXmlNode = { _node?: XmlNode };
interface PopulateWorkbookInternals extends WithXmlNode {
  _relationships?: WithXmlNode;
  _contentTypes?: WithXmlNode;
  _zip?: { remove?: (path: string) => void };
}

const xmlNodeOf = (value: unknown): XmlNode | undefined => (value as WithXmlNode | null)?._node;

export function getStyleId(sheet: PopulateSheet, row: number, col: number): unknown {
  return xmlNodeOf(sheet.cell(row, col))?.attributes?.s;
}

export function setStyleId(
  sheet: PopulateSheet,
  row: number,
  col: number,
  styleId: unknown,
): void {
  const node = xmlNodeOf(sheet.cell(row, col));
  if (!node?.attributes) return;
  if (styleId === undefined || styleId === null) delete node.attributes.s;
  else node.attributes.s = styleId;
}

export function rowHeight(sheet: PopulateSheet, row: number): number | undefined {
  return sheet.row(row).height() as number | undefined;
}

export function setRowHeight(
  sheet: PopulateSheet,
  row: number,
  height: number | undefined,
): void {
  sheet.row(row).height(height);
}

function isJamiLabel(v: unknown): boolean {
  return String(v ?? "")
    .trim()
    .toLowerCase()
    .startsWith("jami");
}

function pct(part: number, whole: number): number {
  return whole > 0 ? part / whole : 0;
}

type TableLayout = {
  /** First data row (T/r = 1). */
  first: number;
  /** "Jami" total row. */
  jami: number;
  maxCol: number;
};

function findLayout(sheet: PopulateSheet): TableLayout | null {
  const used = sheet.usedRange();
  const maxRow = used ? used.endCell().rowNumber() : 40;
  const maxCol = used ? used.endCell().columnNumber() : 20;
  let first = -1;
  for (let r = 1; r <= maxRow; r++) {
    if (first < 0 && typeof cellVal(sheet, r, 1) === "number") first = r;
    if (first > 0 && [1, 2, 3].some((c) => isJamiLabel(cellVal(sheet, r, c)))) {
      return { first, jami: r, maxCol };
    }
  }
  return null;
}

type MergeRef = { c1: string; r1: number; c2: string; r2: number };

function parseMerge(address: string): MergeRef | null {
  const m = /^([A-Z]+)(\d+):([A-Z]+)(\d+)$/.exec(address);
  if (!m) return null;
  return { c1: m[1], r1: Number(m[2]), c2: m[3], r2: Number(m[4]) };
}

/**
 * Grow/shrink the data block to `needed` rows. New rows copy the template data
 * row style; the Jami row (label, style, height, merges) moves to the new end;
 * vertical merges over the data block (Hudud column) stretch with it.
 */
function resizeDataRows(
  sheet: PopulateSheet,
  layout: TableLayout,
  needed: number,
): TableLayout {
  const { first, jami, maxCol } = layout;
  const slots = jami - first;
  if (needed === slots || needed < 1) return layout;

  const newJami = first + needed;
  const sourceRow = slots > 1 ? first + 1 : first;
  const dataStyles: unknown[] = [];
  const jamiStyles: unknown[] = [];
  const jamiValues: unknown[] = [];
  for (let c = 1; c <= maxCol; c++) {
    dataStyles[c] = getStyleId(sheet, sourceRow, c);
    jamiStyles[c] = getStyleId(sheet, jami, c);
    const v = cellVal(sheet, jami, c);
    jamiValues[c] = typeof v === "string" ? v : undefined;
  }
  const dataHeight = rowHeight(sheet, sourceRow);
  const jamiHeight = rowHeight(sheet, jami);

  const mergeMap = ((sheet as { _mergeCells?: Record<string, unknown> })._mergeCells || {});
  const merges = Object.keys(mergeMap)
    .map((a) => ({ address: a, ref: parseMerge(a) }))
    .filter((m): m is { address: string; ref: MergeRef } => Boolean(m.ref));
  for (const m of merges) {
    const { r1, r2 } = m.ref;
    const isJamiMerge = r1 === jami && r2 === jami;
    const isDataMerge = r1 >= first && r1 < jami && r2 > r1 && r2 <= jami - 1;
    if (isJamiMerge || isDataMerge) sheet.merged(m.address, false);
  }

  const lastRow = Math.max(jami, newJami);
  for (let r = first; r <= lastRow; r++) {
    if (r < newJami) {
      if (r >= jami) {
        for (let c = 1; c <= maxCol; c++) {
          setVal(sheet, r, c, undefined);
          setStyleId(sheet, r, c, dataStyles[c]);
        }
        setRowHeight(sheet, r, dataHeight);
      }
    } else if (r === newJami) {
      for (let c = 1; c <= maxCol; c++) {
        setVal(sheet, r, c, jamiValues[c] as string | undefined);
        setStyleId(sheet, r, c, jamiStyles[c]);
      }
      setRowHeight(sheet, r, jamiHeight);
    } else {
      for (let c = 1; c <= maxCol; c++) {
        setVal(sheet, r, c, undefined);
        setStyleId(sheet, r, c, undefined);
      }
      setRowHeight(sheet, r, undefined);
    }
  }

  for (const m of merges) {
    const { c1, r1, c2, r2 } = m.ref;
    if (r1 === jami && r2 === jami) {
      sheet.merged(`${c1}${newJami}:${c2}${newJami}`, true);
    } else if (r1 >= first && r1 < jami && r2 > r1 && r2 <= jami - 1) {
      const end = newJami - 1;
      if (end > r1) sheet.merged(`${c1}${r1}:${c2}${end}`, true);
    }
  }

  return { first, jami: newJami, maxCol };
}

/** Replace every string leaf in a value (plain or rich text node tree). */
function patchText(
  sheet: PopulateSheet,
  row: number,
  col: number,
  fn: (s: string) => string,
): void {
  const v = cellVal(sheet, row, col);
  if (typeof v === "string") {
    const next = fn(v);
    if (next !== v) setVal(sheet, row, col, next);
    return;
  }
  const walk = (value: unknown): void => {
    const node = value as XmlNode | null;
    if (!node || !Array.isArray(node.children)) return;
    node.children = node.children.map((ch: unknown) =>
      typeof ch === "string" ? fn(ch) : (walk(ch), ch),
    );
  };
  if (v && typeof v === "object") walk(v);
}

/** Header rows: date, year, and (district) the viloyat name in titles. */
function patchHeader(
  sheet: PopulateSheet,
  layout: TableLayout,
  opts: { dateText: string; year: string; viloyat: string },
): void {
  const title = opts.viloyat ? viloyatTitleName(opts.viloyat) : "";
  for (let r = 1; r < layout.first; r++) {
    for (let c = 1; c <= layout.maxCol; c++) {
      patchText(sheet, r, c, (s) => {
        let next = s;
        if (next.startsWith("Sana:")) next = `Sana: ${opts.dateText}`;
        if (opts.year) next = next.replace(/\d{4}-yil/g, `${opts.year}-yil`);
        if (title) next = next.split(TEMPLATE_VILOYAT).join(title);
        return next;
      });
    }
  }
}

function readTemplateRows(
  sheet: PopulateSheet,
  layout: TableLayout,
  nameCol: number,
): ReportGeoRow[] {
  const rows: ReportGeoRow[] = [];
  for (let r = layout.first; r < layout.jami; r++) {
    const name = String(cellVal(sheet, r, nameCol) ?? "").trim();
    rows.push({ name, key: reportPlaceKey(name) });
  }
  return rows;
}

/**
 * Row order for a sheet.
 * Republic: every template row stays in its place (matched by name); a geo the
 * template lacks is appended only when it has data on this sheet.
 * District: template rows that belong to the selected viloyat keep their order,
 * the rest of the viloyat's tumans follow; foreign template rows are dropped.
 */
function planRows(
  templateRows: ReportGeoRow[],
  geos: ReportGeoRow[],
  isDistrict: boolean,
  hasData: (key: string) => boolean,
): ReportGeoRow[] {
  const geoByKey = new Map(geos.map((g) => [g.key, g]));
  const out: ReportGeoRow[] = [];
  const seen = new Set<string>();
  for (const t of templateRows) {
    if (!t.key || seen.has(t.key)) continue;
    const geo = geoByKey.get(t.key);
    if (isDistrict && !geo) continue;
    seen.add(t.key);
    out.push(isDistrict && geo ? geo : t);
  }
  for (const g of geos) {
    if (seen.has(g.key)) continue;
    if (!isDistrict && !hasData(g.key)) continue;
    seen.add(g.key);
    out.push(g);
  }
  return out;
}

type TableSpec = {
  nameCol: number;
  /** Column of the first numeric value written by `values`. */
  valueCol: number;
  values: (key: string) => number[];
  /** Recompute ratio / difference cells for the Jami row from column sums. */
  totals: (sums: number[]) => number[];
  hasData: (key: string) => boolean;
  /** Vertical "Hudud" cell written on the first data row (district sheets). */
  regionCol?: number;
};

function fillTable(
  sheet: PopulateSheet,
  bundle: ReportDataBundle,
  spec: TableSpec,
  header: { dateText: string; year: string },
): void {
  let layout = findLayout(sheet);
  if (!layout) return;
  const isDistrict = Boolean(bundle.scope.viloyat);
  patchHeader(sheet, layout, { ...header, viloyat: bundle.scope.viloyat });

  const rows = planRows(
    readTemplateRows(sheet, layout, spec.nameCol),
    bundle.geos,
    isDistrict,
    spec.hasData,
  );
  layout = resizeDataRows(sheet, layout, rows.length);

  // "Shirin" vs "Shirin shahri": use the other spelling's data only when no
  // planned row already owns that key (never borrow a tuman's numbers).
  const planned = new Set(rows.map((r) => r.key));
  const dataKey = (key: string): string => {
    if (spec.hasData(key)) return key;
    for (const alt of reportPlaceKeyAlts(key)) {
      if (!planned.has(alt) && spec.hasData(alt)) return alt;
    }
    return key;
  };

  let sums: number[] = [];
  rows.forEach((row, i) => {
    const r = layout.first + i;
    const values = spec.values(dataKey(row.key));
    if (!sums.length) sums = values.map(() => 0);
    setVal(sheet, r, 1, i + 1);
    if (spec.regionCol) {
      setVal(
        sheet,
        r,
        spec.regionCol,
        i === 0 ? shortViloyatLabel(bundle.scope.viloyat) : undefined,
      );
    }
    setVal(sheet, r, spec.nameCol, row.name);
    values.forEach((v, idx) => {
      sums[idx] += v;
      setVal(sheet, r, spec.valueCol + idx, v);
    });
  });

  spec.totals(sums).forEach((v, idx) => {
    setVal(sheet, layout.jami, spec.valueCol + idx, v);
  });
}

function byKey<T extends { key: string }>(rows: T[]): Map<string, T> {
  const map = new Map<string, T>();
  for (const row of rows) {
    const key = reportPlaceKey(row.key) || row.key;
    const prev = map.get(key);
    if (!prev) map.set(key, row);
  }
  return map;
}

const EMPTY_CROP: CropAreaRow = {
  key: "",
  area: 0,
  asosiy: 0,
  lalmi: 0,
  reja: 0,
  ehtimoliy: 0,
};
const EMPTY_RESERVE: ReserveAreaRow = { key: "", kontur: 0, umumiy: 0, byCrop: {} };
const EMPTY_UNUSED: UnusedAreaRow = { key: "", kontur: 0, maydon: 0 };

function paxtaSpec(rows: CropAreaRow[], nameCol: number): TableSpec {
  const map = byKey(rows);
  const get = (k: string) => map.get(k) || EMPTY_CROP;
  return {
    nameCol,
    valueCol: 3,
    hasData: (k) => get(k).area > 0 || get(k).reja > 0,
    // C monitoring, D reja, E farq (C-D), F holat (C/D)
    values: (k) => {
      const row = get(k);
      const mon = row.area;
      const reja = row.reja || 0;
      return [mon, reja, mon - reja, pct(mon, reja)];
    },
    totals: ([mon = 0, reja = 0]) => [mon, reja, mon - reja, pct(mon, reja)],
  };
}

function gallaViloyatSpec(rows: CropAreaRow[]): TableSpec {
  const map = byKey(rows);
  const get = (k: string) => map.get(k) || EMPTY_CROP;
  return {
    nameCol: 2,
    valueCol: 3,
    hasData: (k) => get(k).area > 0 || get(k).reja > 0 || get(k).ehtimoliy > 0,
    // C reja, D jami, E asosiy, F lalmi, G ehtimoliy (ozuqa), H farq (E-C), I holat (E/C)
    values: (k) => {
      const row = get(k);
      const reja = row.reja || 0;
      return [
        reja,
        row.area,
        row.asosiy,
        row.lalmi,
        row.ehtimoliy || 0,
        row.asosiy - reja,
        pct(row.asosiy, reja),
      ];
    },
    totals: ([reja = 0, jami = 0, asosiy = 0, lalmi = 0, eht = 0]) => [
      reja,
      jami,
      asosiy,
      lalmi,
      eht,
      asosiy - reja,
      pct(asosiy, reja),
    ],
  };
}

function gallaTumanSpec(rows: CropAreaRow[]): TableSpec {
  const map = byKey(rows);
  const get = (k: string) => map.get(k) || EMPTY_CROP;
  return {
    nameCol: 2,
    valueCol: 3,
    hasData: (k) => get(k).area > 0 || get(k).reja > 0 || get(k).ehtimoliy > 0,
    // C reja, D monitoring, E ehtimoliy (ozuqa), F farq (D-C), G holat (D/C)
    values: (k) => {
      const row = get(k);
      const mon = row.area;
      const reja = row.reja || 0;
      return [reja, mon, row.ehtimoliy || 0, mon - reja, pct(mon, reja)];
    },
    totals: ([reja = 0, mon = 0, eht = 0]) => [
      reja,
      mon,
      eht,
      mon - reja,
      pct(mon, reja),
    ],
  };
}

function zaxiraSpec(
  rows: ReserveAreaRow[],
  crops: readonly string[],
  nameCol: number,
  regionCol?: number,
): TableSpec {
  const map = byKey(rows);
  const get = (k: string) => map.get(k) || EMPTY_RESERVE;
  return {
    nameCol,
    valueCol: nameCol + 1,
    regionCol,
    hasData: (k) => get(k).kontur > 0 || get(k).umumiy > 0,
    // kontur, umumiy, ishlatilgan (ekinlar yig'indisi), %, ekinlar…
    values: (k) => {
      const row = get(k);
      const cropVals = crops.map((c) => row.byCrop[c] || 0);
      const used = cropVals.reduce((a, b) => a + b, 0);
      return [row.kontur, row.umumiy, used, pct(used, row.umumiy), ...cropVals];
    },
    totals: (s) => {
      const out = s.slice();
      out[3] = pct(s[2] || 0, s[1] || 0);
      return out;
    },
  };
}

function unusedSpec(
  rows: UnusedAreaRow[],
  nameCol: number,
  regionCol?: number,
): TableSpec {
  const map = byKey(rows);
  const get = (k: string) => map.get(k) || EMPTY_UNUSED;
  return {
    nameCol,
    valueCol: nameCol + 1,
    regionCol,
    hasData: (k) => get(k).kontur > 0 || get(k).maydon > 0,
    values: (k) => [get(k).kontur, get(k).maydon],
    totals: (s) => s.slice(),
  };
}

function sheetByName(wb: PopulateWorkbook, ...names: string[]): PopulateSheet | null {
  for (const s of wb.sheets()) {
    if (names.includes(s.name())) return s;
  }
  return null;
}

/**
 * The republic Zaxira sheet was built from another workbook ([1]…); those
 * formulas are overwritten with values, so the link would only trigger Excel's
 * "update links" prompt. xlsx-populate deletes calcChain.xml but leaves its
 * relationship, which Excel reports as a corrupt file.
 */
export function dropOrphanParts(wb: PopulateWorkbook): void {
  const w = wb as unknown as PopulateWorkbookInternals;
  const asNode = (n: unknown): XmlNode | undefined => n as XmlNode | undefined;
  const isExternal = (raw: unknown): boolean => {
    const n = asNode(raw);
    return /externalLink|calcChain/.test(
      String(
        n?.attributes?.Type ||
          n?.attributes?.ContentType ||
          n?.attributes?.PartName ||
          "",
      ),
    );
  };
  if (Array.isArray(w._node?.children)) {
    w._node.children = w._node.children.filter(
      (n) => asNode(n)?.name !== "externalReferences",
    );
  }
  if (Array.isArray(w._relationships?._node?.children)) {
    w._relationships._node.children = w._relationships._node.children.filter(
      (n) => !isExternal(n),
    );
  }
  if (Array.isArray(w._contentTypes?._node?.children)) {
    w._contentTypes._node.children = w._contentTypes._node.children.filter(
      (n) => !isExternal(n),
    );
  }
  if (w._zip?.remove) {
    w._zip.remove("xl/externalLinks");
  }
}

export async function workbookBuffer(wb: PopulateWorkbook): Promise<ArrayBuffer> {
  dropOrphanParts(wb);
  const out = await wb.outputAsync("uint8array");
  if (out instanceof ArrayBuffer) return out;
  if (out && typeof (out as Uint8Array).byteLength === "number") {
    const u8 = out as Uint8Array;
    return u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength) as ArrayBuffer;
  }
  throw new Error("Excel write failed");
}

export async function fillReportWorkbook(bundle: ReportDataBundle): Promise<{
  filename: string;
  buffer: ArrayBuffer;
}> {
  const XlsxPopulate = await loadXlsxPopulate();
  const isDistrict = Boolean(bundle.scope.viloyat);
  const b64 = isDistrict ? TUMAN_XISOBOT_B64 : VILOYAT_XISOBOT_B64;
  const wb = await XlsxPopulate.fromDataAsync(b64ToUint8(b64));
  const header = { dateText: formatReportDate(), year: bundle.scope.yil };

  const fill = (sheet: PopulateSheet | null, spec: TableSpec) => {
    if (sheet) fillTable(sheet, bundle, spec, header);
  };

  if (isDistrict) {
    fill(sheetByName(wb, "Tuman paxta"), paxtaSpec(bundle.paxta, 2));
    fill(
      sheetByName(wb, "Tuman g'alla", "Tuman g‘alla"),
      gallaTumanSpec(bundle.galla),
    );
    fill(
      sheetByName(wb, "Zaxira tuman"),
      zaxiraSpec(bundle.reserve, RESERVE_CROP_COLUMNS_TUMAN, 3, 2),
    );
    fill(
      sheetByName(wb, "Foydalanilmagan yer tuman"),
      unusedSpec(bundle.unused, 3, 2),
    );
  } else {
    fill(
      sheetByName(wb, "Hudud g'alla", "Hudud g‘alla"),
      gallaViloyatSpec(bundle.galla),
    );
    fill(sheetByName(wb, "Hudud paxta"), paxtaSpec(bundle.paxta, 2));
    fill(
      sheetByName(wb, "Zaxira hudud"),
      zaxiraSpec(bundle.reserve, RESERVE_CROP_COLUMNS_VILOYAT, 2),
    );
    fill(sheetByName(wb, "Foydalanilmagan yer hudud"), unusedSpec(bundle.unused, 2));
  }
  const buffer = await workbookBuffer(wb);

  const safeVil = (bundle.scope.viloyat || "Respublika").replace(
    /[\\/:*?"<>|]/g,
    "_",
  );
  const filename = isDistrict
    ? `Tuman_xisobot_${safeVil}_${bundle.scope.yil}.xlsx`
    : `Viloyat_xisobot_${bundle.scope.yil}.xlsx`;
  return { filename, buffer };
}
