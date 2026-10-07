/**
 * Pure narrowing helpers for untyped values the popup receives (thrown
 * errors, jimu data sources, layer capability bags). No React / ArcGIS.
 */
import type { PopupDataSourceLike } from "./popup-types";

/** `err?.message` for any thrown value (undefined for null / undefined). */
export function readMessage(err: unknown): unknown {
  if (err === null || err === undefined) return undefined;
  return (err as { message?: unknown }).message;
}

/** `err?.message || fallback`, as a string. */
export function messageOr(err: unknown, fallback: string): string {
  const msg = readMessage(err);
  return msg ? String(msg) : fallback;
}

/** `err?.message || String(err)`. */
export function messageOrString(err: unknown): string {
  return messageOr(err, String(err));
}

/** View a jimu data source (or anything) through the members the popup probes. */
export function asDataSourceLike(ds: unknown): PopupDataSourceLike | null {
  if (!ds || (typeof ds !== "object" && typeof ds !== "function")) return null;
  return ds as PopupDataSourceLike;
}

interface AttachmentCapabilityBag {
  supportsAttachments?: unknown;
  capabilities?: {
    data?: { supportsAttachments?: unknown; supportsAttachment?: unknown } | null;
    operations?: { supportsAttachments?: unknown; supportsAttachment?: unknown } | null;
  } | null;
}

/**
 * Whether a layer advertises attachment support. Different JSAPI/EB builds
 * expose it slightly differently; unknown => false (avoids a red warning).
 */
export function readSupportsAttachments(layer: unknown): boolean {
  if (!layer) return false;
  const bag = layer as AttachmentCapabilityBag;

  // Common signals
  if (typeof bag.supportsAttachments === "boolean") return bag.supportsAttachments;

  const cap = bag.capabilities;
  const supported =
    cap?.data?.supportsAttachments ??
    cap?.data?.supportsAttachment ??
    cap?.operations?.supportsAttachments ??
    cap?.operations?.supportsAttachment;

  if (typeof supported === "boolean") return supported;

  // Unknown => assume false to avoid ugly warning
  return false;
}
