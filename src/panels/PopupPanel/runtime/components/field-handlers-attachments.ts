import type { PopupWidgetHost } from "../popup-host";
import esriRequest from "esri/request";
import { type default as FeatureLayer } from "esri/layers/FeatureLayer";
import type { AttachmentItem } from "../popup-types";
import { readMessage } from "../popup-type-guards";
import { AGRI_ESRI_BLOB_TIMEOUT_MS } from "../../../../shared/agri-http";

const isBlob = (value: unknown): value is Blob => value instanceof Blob;

export async function fetchAttachmentPreview(host: PopupWidgetHost, url: string): Promise<Blob> {
  const resp = await esriRequest(url, {
    responseType: "blob",
    query: {},
    timeout: AGRI_ESRI_BLOB_TIMEOUT_MS,
  });
  if (isBlob(resp?.data)) return resp.data;
  if (isBlob(resp)) return resp;
  throw new TypeError("Attachment preview response is not a Blob");
}

export function revokeAllAttachmentUrls(host: PopupWidgetHost) {
  try {
    const atts = host.state.attachments || [];
    atts.forEach((a) => {
      if (a.previewObjectUrl) URL.revokeObjectURL(a.previewObjectUrl);
    });
  } catch {
    // Best-effort cleanup: a failed revoke only leaks a blob URL until unload.
  }
}

export function isImageContentType(host: PopupWidgetHost, ct?: string) {
  if (!ct) return false;
  return /^image\//i.test(ct);
}

export function bytesToSize(host: PopupWidgetHost, n?: number): string {
  if (!n && n !== 0) return "";
  if (n === 0) return "0 B";
  const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(n) / Math.log(k));
  return `${(n / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

export async function loadAttachmentsForOid(host: PopupWidgetHost, layer: FeatureLayer, oid: number) {
  // ✅ If layer doesn’t support attachments -> silently show none (NO warning)
  if (!host.layerSupportsAttachments(layer)) {
    if (!host._isMounted) return;
    host.revokeAllAttachmentUrls();
    host.setState({
      loadingAttachments: false,
      attachments: [],
      attachmentsError: null,
      attachmentsExpanded: true, // keep area visible if you want "No attachments"
    });
    return;
  }

  try {
    host.revokeAllAttachmentUrls();
    host.setState({
      loadingAttachments: true,
      attachments: [],
      attachmentsError: null,
    });

    const result = await layer.queryAttachments({ objectIds: [oid] });
    const list: __esri.AttachmentInfo[] = result?.[oid] || [];

    const items: AttachmentItem[] = list.map((att) => ({
      id: att.id,
      name: att.name,
      size: att.size,
      contentType: att.contentType,
      url: att.url,
    }));

    const withPreviews: AttachmentItem[] = [];
    for (const it of items) {
      if (it.url && host.isImageContentType(it.contentType)) {
        try {
          const blob = await host.fetchAttachmentPreview(it.url);
          it.previewObjectUrl = URL.createObjectURL(blob);
        } catch {
          // ignore preview failures
        }
      }
      withPreviews.push(it);
    }

    if (!host._isMounted) return;
    host.setState({
      attachments: withPreviews,
      loadingAttachments: false,
      attachmentsError: null,
      attachmentsExpanded: true,
    });
  } catch (err: unknown) {
    // ✅ If server says attachments not supported/enabled -> SILENT (no red warning)
    const msg = String(readMessage(err) || err || "").toLowerCase();
    const isNotSupported =
      msg.includes("doesn't support attachments") ||
      msg.includes("does not support attachments") ||
      msg.includes("attachments are not enabled") ||
      msg.includes("attachments disabled") ||
      (msg.includes("not supported") && msg.includes("attachment"));

    if (!host._isMounted) return;

    if (isNotSupported) {
      host.setState({
        loadingAttachments: false,
        attachments: [],
        attachmentsError: null,
        attachmentsExpanded: true,
      });
      return;
    }

    host.setState({
      loadingAttachments: false,
      attachments: [],
      attachmentsError: String(readMessage(err) || err || "Attachments failed"),
      attachmentsExpanded: true,
    });
  }
}
