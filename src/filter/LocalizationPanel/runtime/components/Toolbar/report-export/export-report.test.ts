import { resolveExportViloyat } from "./export-report";
import { reportPlaceKey, sameReportPlace, formatReportDate } from "./place-key";
import { reserveColumnKey } from "./query-stats";
import { fillReportWorkbook } from "./fill-workbook";
import { loadXlsxPopulate } from "../../../../../../vendor/xlsx-populate-shim";
import type { ReportDataBundle, ReportGeoRow } from "./types";

function geo(name: string): ReportGeoRow {
  return { name, key: reportPlaceKey(name) };
}

async function readBack(buffer: ArrayBuffer) {
  const X = await loadXlsxPopulate();
  return X.fromDataAsync(new Uint8Array(buffer)) as Promise<any>;
}

function mergesOf(sheet: any): string[] {
  return Object.keys(sheet._mergeCells || {}).sort();
}

async function workbookRels(buffer: ArrayBuffer): Promise<string> {
  const wb: any = await readBack(buffer);
  return wb._zip.file("xl/_rels/workbook.xml.rels").async("string");
}

describe("report-export helpers", () => {
  test("resolveExportViloyat prefers lock over free selection", () => {
    expect(resolveExportViloyat("Andijon", "Namangan")).toBe("Namangan");
    expect(resolveExportViloyat("Andijon", null)).toBe("Andijon");
    expect(resolveExportViloyat("", "")).toBe("");
  });

  test("reportPlaceKey matches template spellings and keeps cities apart", () => {
    expect(reportPlaceKey("Andijon viloyati")).toBe(reportPlaceKey("Andijon"));
    expect(sameReportPlace("Farg‘ona tumani", "Farg`ona tumani")).toBe(true);
    expect(sameReportPlace("Surxandaryo viloyati", "Surxondaryo viloyati")).toBe(true);
    expect(
      sameReportPlace("Qoraqalpog‘iston R.", "Qoraqalpog'iston Respublikasi"),
    ).toBe(true);
    expect(sameReportPlace("Shaxrixon tumani", "Shahrixon tumani")).toBe(true);
    expect(sameReportPlace("Toshkent shahri", "Toshkent viloyati")).toBe(false);
    expect(sameReportPlace("Andijon shahar", "Andijon tumani")).toBe(false);
    expect(sameReportPlace("Guliston", "Guliston tumani")).toBe(false);
    expect(sameReportPlace("Toshkent sh.", "Toshkent shahri")).toBe(true);
    for (const q of [
      "Qoraqalpog‘iston respublikas",
      "Qoraqalpog`iston Respublikasi",
      "Qoraqalpog‘iston R.",
      "Qoraqalpog'iston respublikasi",
    ]) {
      expect(reportPlaceKey(q)).toBe("qoraqalpogiston");
    }
  });

  test("reserve crop names land in the template columns", () => {
    expect(reserveColumnKey("Makkajo'xori")).toBe("makka");
    expect(reserveColumnKey("Bug'doy")).toBe("bugdoy");
    expect(reserveColumnKey("Qovun")).toBe("poliz");
    expect(reserveColumnKey("Vegetativ")).toBe("vegetativ");
  });

  test("formatReportDate is dd.mm.yyyy", () => {
    expect(formatReportDate(new Date(2026, 8, 24))).toBe("24.09.2026");
  });
});

describe("republic template", () => {
  const bundle: ReportDataBundle = {
    scope: { yil: "2025", viloyat: "" },
    geos: [
      geo("Andijon viloyati"),
      geo("Buxoro viloyati"),
      geo("Surxondaryo viloyati"),
      geo("Toshkent shahri"),
      geo("Toshkent viloyati"),
      geo("Qoraqalpog‘iston respublikas"),
    ],
    paxta: [
      { key: reportPlaceKey("Surxondaryo"), area: 300, asosiy: 300, lalmi: 0, reja: 0, ehtimoliy: 0 },
      { key: reportPlaceKey("Buxoro"), area: 100, asosiy: 100, lalmi: 0, reja: 0, ehtimoliy: 0 },
    ],
    galla: [
      { key: reportPlaceKey("Jizzax"), area: 50, asosiy: 40, lalmi: 10, reja: 0, ehtimoliy: 0 },
      {
        key: reportPlaceKey("Qoraqalpog‘iston respublikas"),
        area: 20,
        asosiy: 20,
        lalmi: 0,
        reja: 0,
        ehtimoliy: 0,
      },
    ],
    reserve: [
      {
        key: reportPlaceKey("Toshkent shahri"),
        kontur: 2,
        umumiy: 10,
        byCrop: { bugdoy: 1, makka: 2, mosh: 3 },
      },
    ],
    unused: [{ key: reportPlaceKey("Xorazm"), kontur: 3, maydon: 7 }],
  };

  test("values go to the template row of the same hudud, missing = 0", async () => {
    const withReja: ReportDataBundle = {
      ...bundle,
      paxta: [
        { key: reportPlaceKey("Surxondaryo"), area: 300, asosiy: 300, lalmi: 0, reja: 50, ehtimoliy: 0 },
        { key: reportPlaceKey("Buxoro"), area: 100, asosiy: 100, lalmi: 0, reja: 80, ehtimoliy: 0 },
      ],
      galla: [
        { key: reportPlaceKey("Jizzax"), area: 50, asosiy: 40, lalmi: 10, reja: 30, ehtimoliy: 15 },
        {
          key: reportPlaceKey("Qoraqalpog‘iston respublikas"),
          area: 20,
          asosiy: 20,
          lalmi: 0,
          reja: 0,
          ehtimoliy: 0,
        },
      ],
    };
    const { filename, buffer } = await fillReportWorkbook(withReja);
    expect(filename).toBe("Viloyat_xisobot_2025.xlsx");
    const wb = await readBack(buffer);
    expect(wb.sheets().map((s: any) => s.name())).toEqual([
      "Hudud g'alla",
      "Hudud paxta",
      "Zaxira hudud",
      "Foydalanilmagan yer hudud",
    ]);

    // Paxta keeps its own row order: Buxoro row 5, Surxandaryo row 6.
    const paxta = wb.sheet("Hudud paxta");
    expect(paxta.cell("B5").value()).toBe("Buxoro viloyati");
    expect(paxta.cell("C5").value()).toBe(100);
    expect(paxta.cell("D5").value()).toBe(80);
    expect(paxta.cell("E5").value()).toBe(20);
    expect(paxta.cell("F5").value()).toBeCloseTo(100 / 80);
    expect(paxta.cell("C6").value()).toBe(300);
    expect(paxta.cell("D6").value()).toBe(50);
    expect(paxta.cell("C7").value()).toBe(0);
    expect(paxta.cell("B18").value()).toBe("Jami:");
    expect(paxta.cell("C18").value()).toBe(400);
    expect(paxta.cell("D18").value()).toBe(130);
    expect(String(paxta.cell("E1").value())).toMatch(/^Sana: \d\d\.\d\d\.\d{4}$/);
    expect(String(paxta.cell("D3").value())).toContain("2025-yil");

    // G'alla: Jizzax row 9 — reja in C, farq = asosiy - reja.
    const galla = wb.sheet("Hudud g'alla");
    expect(galla.cell("A20").value()).toBeUndefined();
    expect(galla.cell("B9").value()).toBe("Jizzax viloyati");
    expect(galla.cell("C9").value()).toBe(30);
    expect(galla.cell("D9").value()).toBe(50);
    expect(galla.cell("E9").value()).toBe(40);
    expect(galla.cell("F9").value()).toBe(10);
    expect(galla.cell("G9").value()).toBe(15);
    expect(galla.cell("F6").value()).toBe(0);
    expect(galla.cell("H9").value()).toBe(10);
    expect(galla.cell("D13").value()).toBe(20);
    expect(galla.cell("A19").value()).toBe("Jami:");
    expect(galla.cell("D19").value()).toBe(70);

    // Zaxira: Toshkent shahri row 17, crops in their columns, no [1] links left.
    const zax = wb.sheet("Zaxira hudud");
    expect(zax.cell("B17").value()).toBe("Toshkent shahri");
    expect(zax.cell("C17").value()).toBe(2);
    expect(zax.cell("D17").value()).toBe(10);
    expect(zax.cell("E17").value()).toBe(6);
    expect(zax.cell("F17").value()).toBeCloseTo(0.6);
    expect(zax.cell("G17").value()).toBe(1);
    expect(zax.cell("K17").value()).toBe(2);
    expect(zax.cell("T17").value()).toBe(3);
    expect(zax.cell("C18").value()).toBe(0);
    expect(zax.cell("C6").formula()).toBeUndefined();
    expect(zax.cell("E20").value()).toBe(6);

    const unused = wb.sheet("Foydalanilmagan yer hudud");
    expect(unused.cell("B18").value()).toBe("Xorazm viloyati");
    expect(unused.cell("D18").value()).toBe(7);
    expect(unused.cell("D5").value()).toBe(0);
    expect(unused.cell("D19").value()).toBe(7);

    const rels = await workbookRels(buffer);
    expect(rels).not.toMatch(/externalLink|calcChain/);
  });

  test("layout (merges, styles) is untouched", async () => {
    const X = await loadXlsxPopulate();
    const { VILOYAT_XISOBOT_B64 } = await import("./templates-b64");
    const raw = Uint8Array.from(atob(VILOYAT_XISOBOT_B64), (c) => c.charCodeAt(0));
    const original: any = await X.fromDataAsync(raw);
    const { buffer } = await fillReportWorkbook(bundle);
    const filled = await readBack(buffer);
    for (const s of original.sheets()) {
      const f = filled.sheet(s.name());
      expect(mergesOf(f)).toEqual(mergesOf(s));
      for (const addr of ["A3", "B6", "C6", "D7", "F10", "A19", "C19"]) {
        expect(f.cell(addr)._node.attributes.s).toBe(s.cell(addr)._node.attributes.s);
      }
    }
  });
});

describe("district template", () => {
  test("city named without 'shahri' still gets the layer's city data", async () => {
    const bundle: ReportDataBundle = {
      scope: { yil: "2026", viloyat: "Sirdaryo viloyati" },
      geos: [geo("Shirin"), geo("Sirdaryo tumani")],
      paxta: [
        { key: reportPlaceKey("Shirin shahri"), area: 5, asosiy: 5, lalmi: 0, reja: 0, ehtimoliy: 0 },
        { key: reportPlaceKey("Sirdaryo tumani"), area: 7, asosiy: 7, lalmi: 0, reja: 0, ehtimoliy: 0 },
      ],
      galla: [],
      reserve: [],
      unused: [],
    };
    const wb = await readBack((await fillReportWorkbook(bundle)).buffer);
    const paxta = wb.sheet("Tuman paxta");
    expect(paxta.cell("B6").value()).toBe("Shirin");
    expect(paxta.cell("C6").value()).toBe(5);
    expect(paxta.cell("C7").value()).toBe(7);
    expect(paxta.cell("C8").value()).toBe(12);
  });

  test("Andijon keeps template order; extra rows of other viloyat drop", async () => {
    const bundle: ReportDataBundle = {
      scope: { yil: "2026", viloyat: "Andijon viloyati" },
      geos: [geo("Asaka tumani"), geo("Andijon shahar"), geo("Andijon tumani")],
      paxta: [{ key: reportPlaceKey("Asaka tumani"), area: 9, asosiy: 9, lalmi: 0, reja: 0, ehtimoliy: 0 }],
      galla: [],
      reserve: [],
      unused: [],
    };
    const { buffer } = await fillReportWorkbook(bundle);
    const wb = await readBack(buffer);
    const paxta = wb.sheet("Tuman paxta");
    expect(paxta.cell("B6").value()).toBe("Andijon shahar");
    expect(paxta.cell("B7").value()).toBe("Andijon tumani");
    expect(paxta.cell("B8").value()).toBe("Asaka tumani");
    expect(paxta.cell("C8").value()).toBe(9);
    expect(paxta.cell("C6").value()).toBe(0);
    expect(paxta.cell("A9").value()).toBe("Jami:");
    expect(paxta.cell("C9").value()).toBe(9);
    expect(paxta.cell("A10").value()).toBeUndefined();
    expect(mergesOf(paxta)).toContain("A9:B9");
    expect(mergesOf(paxta)).not.toContain("A22:B22");
  });

  test("other viloyat: title renamed, rows grow with template style", async () => {
    const names = Array.from({ length: 20 }, (_, i) => `Tuman${i + 1} tumani`);
    const bundle: ReportDataBundle = {
      scope: { yil: "2026", viloyat: "Toshkent viloyati" },
      geos: names.map(geo),
      paxta: [],
      galla: [],
      reserve: [
        {
          key: reportPlaceKey("Tuman20 tumani"),
          kontur: 4,
          umumiy: 8,
          byCrop: { vegetativ: 2 },
        },
      ],
      unused: [],
    };
    const { filename, buffer } = await fillReportWorkbook(bundle);
    expect(filename).toBe("Tuman_xisobot_Toshkent viloyati_2026.xlsx");
    const wb = await readBack(buffer);

    const zax = wb.sheet("Zaxira tuman");
    expect(String(zax.cell("A2").value())).toMatch(/^Toshkent viloyati hududida/);
    expect(zax.cell("B6").value()).toBe("Toshkent");
    expect(zax.cell("C25").value()).toBe("Tuman20 tumani");
    expect(zax.cell("D25").value()).toBe(4);
    expect(zax.cell("F25").value()).toBe(2);
    expect(zax.cell("G25").value()).toBe(0.25);
    expect(zax.cell("M25").value()).toBe(2);
    expect(zax.cell("A26").value()).toBe("Jami");
    expect(zax.cell("D26").value()).toBe(4);
    expect(mergesOf(zax)).toEqual(
      expect.arrayContaining(["B6:B25", "A26:C26"]),
    );
    expect(zax.cell("D25")._node.attributes.s).toBe(zax.cell("D8")._node.attributes.s);

    const galla = wb.sheet("Tuman g'alla");
    expect(String(galla.cell("A2").value())).toMatch(/^Toshkent viloyatida g/);
    expect(galla.cell("A25").value()).toBe("Jami:");

    const unused = wb.sheet("Foydalanilmagan yer tuman");
    expect(String(unused.cell("A2").value())).toMatch(/^Toshkent viloyati hududida/);
    expect(unused.cell("E5").value()).toBe(0);
    expect(unused.cell("A25").value()).toBe("Jami");

    expect(await workbookRels(buffer)).not.toMatch(/calcChain/);
  });
});
