export const CROP_COLOR_MAP: Record<string, string> = {
  "bug'doy": "#D9A300",
  bugdoy: "#D9A300",
  paxta: "#E8E1D1",
  makka: "#7CB342",
  sholi: "#26A69A",
  mosh: "#8E44AD",
  beda: "#43A047",
  ozuqa: "#8BC34A",
  loviya: "#6A5ACD",
  poliz: "#F26B38",
  tariq: "#C58F00",
  "bog'": "#1B5E20",
  bog: "#1B5E20",
  "yeryong'oq": "#8D6E63",
  yeryongoq: "#8D6E63",
  sabzi: "#E65100",
  kungaboqar: "#FDD835",
  baliqxovuz: "#0288D1",
  "baliq hovuz": "#0288D1",
  boshqa: "#78909C",
};

// Fallback palette (for unknown categories)
/** Thin grey edge so light/white slices (e.g. paxta) stay visible on light UI */
export const PIE_SLICE_EDGE = {
  borderColor: "rgba(100, 116, 139, 0.55)",
  borderWidth: 1,
};

export const FALLBACK_COLORS = [
  "#1E7AE6",
  "#202124",
  "#6C6FD5",
  "#56AEDA",
  "#F6A11A",
  "#FF4E46",
  "#8B95A7",
  "#7B61FF",
  "#2AA1FF",
  "#00C389",
  "#D97706",
  "#EF4444",
  "#0EA5E9",
  "#4F46E5",
  "#334155",
];

export function adjustHexColor(hex: string, amount: number): string {
  const normalized = hex.replace("#", "").trim();
  if (!normalized) return hex;

  const expand =
    normalized.length === 3
      ? normalized
          .split("")
          .map((ch) => ch + ch)
          .join("")
      : normalized;

  if (expand.length !== 6) return hex;

  const clamp = (value: number) => Math.max(0, Math.min(255, Math.round(value)));
  const channels = [0, 2, 4].map((offset) =>
    clamp(parseInt(expand.slice(offset, offset + 2), 16) + amount),
  );

  return `#${channels
    .map((channel) => channel.toString(16).padStart(2, "0"))
    .join("")}`;
}

export const APOSTROPHE_VARIANTS = ["'", "'", "'", "ʻ", "ʼ", "`"];
