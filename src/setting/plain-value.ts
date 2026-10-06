/**
 * Helpers for reading seamless-immutable values coming from jimu-core config
 * and props without reaching for `any`. They only inspect duck-typed methods.
 */

export interface AsMutableCapable<T = unknown> {
  asMutable: (options?: { deep?: boolean }) => T;
}

interface ToArrayCapable {
  toArray: () => unknown[];
}

/** True when the value exposes seamless-immutable's `asMutable()` method. */
export const hasAsMutable = <T = unknown>(
  value: unknown,
): value is AsMutableCapable<T> =>
  typeof (value as Partial<AsMutableCapable> | null | undefined)?.asMutable ===
  "function";

const hasToArray = (value: unknown): value is ToArrayCapable =>
  typeof (value as Partial<ToArrayCapable> | null | undefined)?.toArray ===
  "function";

/**
 * Deep-mutable copy for immutable values; non-immutable values are returned
 * unchanged.
 */
export const toPlainDeep = <T>(value: unknown): T =>
  hasAsMutable<T>(value) ? value.asMutable({ deep: true }) : (value as T);

/**
 * Plain array from an array, an immutable array (deep copy) or an object with
 * `toArray()`. Anything else (including falsy values) yields `[]`.
 */
export const toPlainArray = (value: unknown): unknown[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (hasAsMutable<unknown[]>(value)) {
    return value.asMutable({ deep: true });
  }
  if (hasToArray(value)) {
    return value.toArray();
  }
  return [];
};
