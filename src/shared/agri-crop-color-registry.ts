/**
 * Crop colours as the pie chart actually painted them. Crops outside the
 * fixed colour map get a palette colour by slice position, so other charts
 * must read the pie's choice instead of recomputing it with their own index.
 */
import { getCropCanonicalKey, getCropColor } from "./agri-crop-labels";

const pieColors = new Map<string, string>();

const colorKey = (crop: unknown): string =>
  getCropCanonicalKey(crop) || String(crop ?? "").trim().toLowerCase();

export function rememberPieCropColor(crop: unknown, color: string): void {
  const key = colorKey(crop);
  if (key && color) pieColors.set(key, color);
}

export function getPieCropColor(crop: unknown): string {
  return pieColors.get(colorKey(crop)) || "";
}

/**
 * One colour per crop: the pie's colour when it showed that crop, otherwise
 * the shared crop colour, skipping colours already taken in this chart.
 */
export function resolveCropColors(crops: readonly unknown[]): string[] {
  const taken = new Set<string>();
  for (const crop of crops) {
    const color = getPieCropColor(crop);
    if (color) taken.add(color.toLowerCase());
  }
  let fallbackIndex = 0;
  return crops.map((crop) => {
    const pie = getPieCropColor(crop);
    if (pie) return pie;
    let color = getCropColor(crop, fallbackIndex);
    for (let tries = 0; tries < 15 && taken.has(color.toLowerCase()); tries += 1) {
      fallbackIndex += 1;
      color = getCropColor(crop, fallbackIndex);
    }
    fallbackIndex += 1;
    taken.add(color.toLowerCase());
    return color;
  });
}

/** Tests only. */
export function resetPieCropColors(): void {
  pieColors.clear();
}
