/** Shared vegetation index legend config for Graff graph/table views. */
export type GraffIndexKey = "ndvi" | "savi" | "rvi" | "ci" | "evi" | "ndwi" | "ndre";

export interface GraffIndexButton {
  key: GraffIndexKey;
  label: string;
  color: string;
}

const ALL_GRAFF_INDEX_BUTTONS: readonly GraffIndexButton[] = [
  { key: "ndvi", label: "NDVI", color: "#00d084" },
  { key: "savi", label: "SAVI", color: "#7aa5ff" },
  { key: "rvi", label: "RVI", color: "#ffb347" },
  { key: "ci", label: "CI", color: "#c78bff" },
  { key: "evi", label: "EVI", color: "#ff4d8d" },
  { key: "ndwi", label: "NDWI", color: "#2ec4f1" },
  { key: "ndre", label: "NDRE", color: "#a39400" },
];

/** Indices temporarily hidden from the chart (remove a key to show it again). */
const HIDDEN_GRAFF_INDICES: ReadonlySet<GraffIndexKey> = new Set<GraffIndexKey>(["ndre"]);

export const GRAFF_INDEX_BUTTONS: GraffIndexButton[] = ALL_GRAFF_INDEX_BUTTONS.filter(
  (item) => !HIDDEN_GRAFF_INDICES.has(item.key),
);

export const GRAFF_INDEX_ORDER: GraffIndexKey[] = GRAFF_INDEX_BUTTONS.map(
  (item) => item.key,
);

/** Republic regional timeseries AVG field allow-list. */
export const REPUBLIC_TIMESERIES_INDEX_FIELDS = [
  "ndvi",
  "savi",
  "evi",
  "rvi",
  "ci",
  "ndwi",
  "ndre",
] as const;

export type RepublicTimeseriesIndexField =
  (typeof REPUBLIC_TIMESERIES_INDEX_FIELDS)[number];

export function isRepublicTimeseriesIndexField(
  value: string,
): value is RepublicTimeseriesIndexField {
  return (REPUBLIC_TIMESERIES_INDEX_FIELDS as readonly string[]).includes(
    value,
  );
}
