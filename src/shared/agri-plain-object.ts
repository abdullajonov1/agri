/**
 * Helpers for reading untyped config / JSON values without `any`.
 * jimu-core config objects are seamless-immutable; `asMutable({ deep: true })`
 * turns them back into plain JS before we read fields.
 */

export type PlainRecord = Record<string, unknown>;

interface MutableConvertible {
  asMutable: (opts?: { deep?: boolean }) => unknown;
}

const hasAsMutable = (value: unknown): value is MutableConvertible =>
  value != null &&
  typeof value === "object" &&
  typeof (value as Partial<MutableConvertible>).asMutable === "function";

/** Deep-unwrap a seamless-immutable value; other values pass through. */
export const toPlainValue = (value: unknown): unknown =>
  hasAsMutable(value) ? value.asMutable({ deep: true }) : value;

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
