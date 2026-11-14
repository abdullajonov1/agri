import { safeReportFileName } from "./report-filename";

describe("safeReportFileName", () => {
  test("keeps valid fermer name byte-identical", () => {
    expect(safeReportFileName(["Fermer_xisobot", "Chiroqchi tumani", 2025])).toBe(
      "Fermer_xisobot_Chiroqchi tumani_2025.xlsx",
    );
  });

  test("keeps valid tuman and viloyat names byte-identical", () => {
    expect(safeReportFileName(["Tuman_xisobot", "Toshkent viloyati", 2026])).toBe(
      "Tuman_xisobot_Toshkent viloyati_2026.xlsx",
    );
    expect(safeReportFileName(["Viloyat_xisobot", 2025])).toBe(
      "Viloyat_xisobot_2025.xlsx",
    );
  });

  test("replaces unsafe characters including in yil", () => {
    expect(safeReportFileName(["Viloyat_xisobot", '20/25:"x"'])).toBe(
      "Viloyat_xisobot_20_25__x_.xlsx",
    );
    expect(safeReportFileName(["Fermer_xisobot", "a/b", "..\\2025"])).toBe(
      "Fermer_xisobot_a_b_.._2025.xlsx",
    );
  });
});
