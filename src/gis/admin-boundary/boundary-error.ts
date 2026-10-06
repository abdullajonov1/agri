/**
 * Log text for a thrown value: its `message` when truthy, else the value
 * itself. ArcGIS rejects with `esri/core/Error`, which is not always an
 * `instanceof Error`, so read `message` off any object.
 */
export function boundaryErrorText(err: unknown): string {
  const message =
    err != null && typeof err === "object"
      ? (err as { message?: unknown }).message
      : undefined;
  return String(message || err);
}
