/**
 * Helpers for reading untyped config / JSON values without `any`.
 * jimu-core config objects are seamless-immutable; `asMutable({ deep: true })`
 * turns them back into plain JS before we read fields.
 */

export type PlainRecord = Record<string, unknown>;

/** A seamless-immutable value (jimu-core config / props). */
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
  value != null &&
  typeof value === "object" &&
  typeof (value as Partial<AsMutableCapable>).asMutable === "function";

const hasToArray = (value: unknown): value is ToArrayCapable =>
  value != null &&
  typeof (value as Partial<ToArrayCapable>).toArray === "function";

/** Deep-unwrap a seamless-immutable value; other values pass through. */
export const toPlainValue = (value: unknown): unknown =>
  hasAsMutable(value) ? value.asMutable({ deep: true }) : value;

/** Typed variant of toPlainValue for callers that know the target shape. */
export const toPlainDeep = <T>(value: unknown): T =>
  hasAsMutable<T>(value) ? value.asMutable({ deep: true }) : (value as T);

/**
 * Plain array from an array, an immutable array (deep copy) or an object with
 * `toArray()`. Anything else (including falsy values) yields `[]`.
 */
export const toPlainArray = (value: unknown): unknown[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (hasAsMutable<unknown[]>(value)) return value.asMutable({ deep: true });
  if (hasToArray(value)) return value.toArray();
  return [];
};

export const isPlainRecord = (value: unknown): value is PlainRecord =>
  value != null && typeof value === "object" && !Array.isArray(value);

/** Unwrap immutables and return a record, or null when not an object. */
export const toPlainRecord = (value: unknown): PlainRecord | null => {
  const plain = toPlainValue(value);
  return isPlainRecord(plain) ? plain : null;
};

/** Message text from an unknown thrown value. */
export const errorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (isPlainRecord(error) && error.message != null) return String(error.message);
  return String(error);
};
