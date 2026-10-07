/**
 * Single HTTP entry point for non-esriRequest calls (api-agri, indicator API).
 *
 * Every request gets a timeout, an optional byte cap, status validation and a
 * typed error. Caller aborts are re-thrown untouched (name "AbortError") so
 * existing stale-request guards keep working; only our own timeout becomes an
 * AgriHttpError with kind "timeout".
 */

/** Explicit timeout for every esriRequest call in the widget. */
export const AGRI_ESRI_REQUEST_TIMEOUT_MS = 30000;

/** Attachment blobs (photos, PDFs) can be large on slow links. */
export const AGRI_ESRI_BLOB_TIMEOUT_MS = 120000;

/** Error bodies are cut to this length before they reach messages / UI state. */
export const AGRI_HTTP_ERROR_BODY_MAX_CHARS = 512;

export type AgriHttpErrorKind =
  | "http"
  | "timeout"
  | "network"
  | "parse"
  | "too-large";

export interface AgriHttpErrorDetails {
  kind: AgriHttpErrorKind;
  url: string;
  status?: number;
  statusText?: string;
  contentType?: string;
  responseText?: string;
  cause?: unknown;
}

export class AgriHttpError extends Error {
  readonly kind: AgriHttpErrorKind;
  readonly url: string;
  readonly status?: number;
  readonly statusText?: string;
  readonly contentType?: string;
  readonly responseText?: string;
  readonly cause?: unknown;

  constructor(message: string, details: AgriHttpErrorDetails) {
    super(message);
    this.name = "AgriHttpError";
    this.kind = details.kind;
    this.url = details.url;
    this.status = details.status;
    this.statusText = details.statusText;
    this.contentType = details.contentType;
    this.responseText = details.responseText;
    this.cause = details.cause;
  }
}

export interface AgriFetchOptions {
  /** Abort and throw kind "timeout" after this many ms (covers body read). */
  timeoutMs: number;
  /** Caller cancellation; aborting re-throws the native AbortError. */
  signal?: AbortSignal | null;
  /** Reject when content-length or the read body exceeds this many bytes. */
  maxBytes?: number;
  /** Extra fetch options (method, headers, mode, cache, credentials…). */
  init?: Omit<RequestInit, "signal">;
}

export const isAgriHttpError = (err: unknown): err is AgriHttpError =>
  err instanceof AgriHttpError;

export const isAgriHttpTimeout = (err: unknown): boolean =>
  isAgriHttpError(err) && err.kind === "timeout";

export const isAbortError = (err: unknown): boolean =>
  !!err &&
  typeof err === "object" &&
  (err as { name?: unknown }).name === "AbortError";

export function truncateResponseText(
  text: string,
  maxChars: number = AGRI_HTTP_ERROR_BODY_MAX_CHARS,
): string {
  const value = String(text ?? "");
  return value.length > maxChars ? `${value.slice(0, maxChars)}…` : value;
}

const createAbortError = (): Error => {
  const err = new Error("The operation was aborted.");
  err.name = "AbortError";
  return err;
};

const errorMessageOf = (err: unknown): string =>
  err instanceof Error ? err.message : String(err);

const readErrorBody = async (res: Response): Promise<string> => {
  try {
    return truncateResponseText(await res.text());
  } catch (bodyError: unknown) {
    return `<response body read failed: ${errorMessageOf(bodyError)}>`;
  }
};

const assertDeclaredSize = (res: Response, url: string, maxBytes?: number): void => {
  if (!maxBytes) return;
  const declared = Number(res.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > maxBytes) {
    throw new AgriHttpError(`Response too large (${declared} > ${maxBytes} bytes)`, {
      kind: "too-large",
      url,
      status: res.status,
    });
  }
};

const assertOk = async (res: Response, url: string): Promise<void> => {
  if (res.ok) return;
  const responseText = await readErrorBody(res);
  const statusText = res.statusText || "";
  throw new AgriHttpError(
    `HTTP ${res.status}${statusText ? ` ${statusText}` : ""}${responseText ? `: ${responseText}` : ""}`,
    {
      kind: "http",
      url,
      status: res.status,
      statusText,
      contentType: res.headers.get("content-type") || "",
      responseText,
    },
  );
};

/**
 * Runs fetch + `consume` under one timeout so a stalled body read is bounded
 * too. Non-2xx responses throw AgriHttpError before `consume` is called.
 */
async function runWithTimeout<T>(
  url: string,
  options: AgriFetchOptions,
  consume: (res: Response) => Promise<T>,
): Promise<T> {
  const callerSignal = options.signal || null;
  if (callerSignal?.aborted) throw createAbortError();

  const controller = new AbortController();
  let timedOut = false;
  const onCallerAbort = (): void => controller.abort();
  callerSignal?.addEventListener("abort", onCallerAbort);
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, options.timeoutMs);

  try {
    const res = await fetch(url, { ...(options.init || {}), signal: controller.signal });
    assertDeclaredSize(res, url, options.maxBytes);
    await assertOk(res, url);
    return await consume(res);
  } catch (err: unknown) {
    if (timedOut) {
      throw new AgriHttpError(`Request timed out after ${options.timeoutMs}ms`, {
        kind: "timeout",
        url,
        cause: err,
      });
    }
    if (isAgriHttpError(err) || isAbortError(err)) throw err;
    throw new AgriHttpError(`Network request failed: ${errorMessageOf(err)}`, {
      kind: "network",
      url,
      cause: err,
    });
  } finally {
    clearTimeout(timer);
    callerSignal?.removeEventListener("abort", onCallerAbort);
  }
}

/** Fetch with timeout + status check; the body is left unread for the caller. */
export function fetchWithTimeout(
  url: string,
  options: AgriFetchOptions,
): Promise<Response> {
  return runWithTimeout(url, options, (res) => Promise.resolve(res));
}

/** GET JSON with timeout, status check and parse guard. */
export function fetchJson(url: string, options: AgriFetchOptions): Promise<unknown> {
  return runWithTimeout(url, options, async (res) => {
    const text = await res.text();
    if (options.maxBytes && text.length > options.maxBytes) {
      throw new AgriHttpError(`Response too large (> ${options.maxBytes} bytes)`, {
        kind: "too-large",
        url,
        status: res.status,
      });
    }
    try {
      return JSON.parse(text) as unknown;
    } catch (parseError: unknown) {
      throw new AgriHttpError(`Invalid JSON response: ${errorMessageOf(parseError)}`, {
        kind: "parse",
        url,
        status: res.status,
        responseText: truncateResponseText(text),
        cause: parseError,
      });
    }
  });
}

/** Binary GET with timeout, status check and byte cap; keeps the Response for headers. */
export function fetchArrayBuffer(
  url: string,
  options: AgriFetchOptions,
): Promise<{ buffer: ArrayBuffer; response: Response }> {
  return runWithTimeout(url, options, async (res) => {
    const buffer = await res.arrayBuffer();
    if (options.maxBytes && buffer.byteLength > options.maxBytes) {
      throw new AgriHttpError(
        `Response too large (${buffer.byteLength} > ${options.maxBytes} bytes)`,
        { kind: "too-large", url, status: res.status },
      );
    }
    return { buffer, response: res };
  });
}
