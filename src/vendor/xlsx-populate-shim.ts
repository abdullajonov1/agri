/**
 * Lazy xlsx-populate — keeps Excel template styles/merges intact.
 * Loaded only when the user clicks the Excel toolbar button.
 */

export type PopulateSheet = {
  name: () => string;
  cell: (row: number | string, col?: number) => {
    value: (v?: unknown) => unknown;
    style: (name: string, value?: unknown) => unknown;
  };
  usedRange: () => { endCell: () => { rowNumber: () => number; columnNumber: () => number } } | undefined;
  row: (n: number) => {
    hidden: (v?: boolean) => unknown;
    height: (v?: number) => unknown;
  };
  merged: (address: string, merge?: boolean) => unknown;
};

export type PopulateWorkbook = {
  sheets: () => PopulateSheet[];
  sheet: (name: string | number) => PopulateSheet;
  outputAsync: (type?: string) => Promise<ArrayBuffer | Uint8Array | Blob>;
};

export type XlsxPopulateModule = {
  fromDataAsync: (data: ArrayBuffer | Uint8Array) => Promise<PopulateWorkbook>;
};

let cached: Promise<XlsxPopulateModule> | null = null;

export function loadXlsxPopulate(): Promise<XlsxPopulateModule> {
  if (!cached) {
    cached = import("./xlsx-populate.browser.js").then((raw: unknown) => {
      const mod = raw as { default?: unknown; XlsxPopulate?: unknown } | null;
      const X = (mod && (mod.default || mod.XlsxPopulate || mod)) as XlsxPopulateModule;
      if (!X || typeof X.fromDataAsync !== "function") {
        throw new Error("xlsx-populate failed to load");
      }
      return X;
    });
    // A failed chunk load (network blip) must not break every later export.
    cached.catch(() => {
      cached = null;
    });
  }
  return cached;
}
