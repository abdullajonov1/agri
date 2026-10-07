/**
 * Pure helpers for grouped indicator statistics (no ArcGIS / React deps).
 * Shared by fetchGroupedStats and fetchGroupedFirst so ordering, labelling
 * and the displayed bucket stay identical between the two paths.
 */

export type IndicatorGroupKey = string | number | null;

export interface IndicatorGroupRow {
  key: IndicatorGroupKey;
  value: number;
}

export interface IndicatorGroupResult extends IndicatorGroupRow {
  label: string;
}

export interface IndicatorEnumCategory {
  label: string;
  value: string | number | null;
}

export type IndicatorAggregateOp = "count" | "sum" | "avg" | "min" | "max";

/** Normalise a raw attribute value into a group key (null stays null). */
export const toGroupKey = (value: unknown): IndicatorGroupKey => {
  if (value == null) return null;
  if (typeof value === "number" || typeof value === "string") return value;
  return String(value);
};

/** Null bucket first, then natural (numeric-aware) string order. */
export const compareGroupKeys = (
  a: IndicatorGroupKey,
  b: IndicatorGroupKey,
): number => {
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
  return String(a).localeCompare(String(b), undefined, { numeric: true });
};

/** Sorted, labelled copy of the rows; `noValueLabel` captions the null bucket. */
export const labelGroupRows = (
  rows: readonly IndicatorGroupRow[],
  noValueLabel: string,
): IndicatorGroupResult[] =>
  [...rows]
    .sort((a, b) => compareGroupKeys(a.key, b.key))
    .map((row) => ({
      key: row.key,
      label: row.key == null ? noValueLabel : String(row.key),
      value: row.value,
    }));

/**
 * ENUM category mode: one result per configured category (in config order),
 * summing every row whose key matches the category value as a string.
 */
export const mapRowsToEnumCategories = (
  rows: readonly IndicatorGroupRow[],
  categories: readonly IndicatorEnumCategory[],
): IndicatorGroupResult[] => {
  const totals = new Map<string | null, number>();
  rows.forEach((row) => {
    const key = row.key == null ? null : String(row.key);
    totals.set(key, (totals.get(key) || 0) + row.value);
  });
  return categories.map((category) => {
    const key = category.value == null ? null : String(category.value);
    return {
      key: category.value,
      label: category.label,
      value: Number(totals.get(key) || 0),
    };
  });
};

/** Sum of result values, skipping NaN. */
export const sumGroupValues = (results: readonly IndicatorGroupRow[]): number =>
  results.reduce((sum, row) => sum + (isNaN(row.value) ? 0 : row.value), 0);

/**
 * Value shown on the card: the configured bucket when `displayKey` is set
 * (null selects the "no value" bucket), otherwise the total.
 */
export const resolveDisplayGroupValue = (
  results: readonly IndicatorGroupRow[],
  displayKey: IndicatorGroupKey | undefined,
  total: number,
): number => {
  if (displayKey === undefined) return total;
  return (
    results.find(
      (row) =>
        (row.key == null && displayKey == null) ||
        String(row.key) === String(displayKey),
    )?.value ?? 0
  );
};

/**
 * "first" operation: keep the first value seen per group key (features are
 * requested ordered by the group field). Non-finite values become 0.
 */
export const firstValuePerGroup = (
  attributeRows: ReadonlyArray<Record<string, unknown> | null | undefined>,
  groupField: string,
  valueField: string,
): IndicatorGroupRow[] => {
  const firstByKey = new Map<IndicatorGroupKey, number>();
  for (const attributes of attributeRows) {
    if (!attributes) continue;
    const key = toGroupKey(attributes[groupField]);
    if (!firstByKey.has(key)) firstByKey.set(key, Number(attributes[valueField]));
  }
  return Array.from(firstByKey.entries()).map(([key, value]) => ({
    key,
    value: Number.isFinite(value) ? value : 0,
  }));
};
