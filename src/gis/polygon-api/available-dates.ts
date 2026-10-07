/**
 * GET /v1/polygon/{uniqueid}/available-dates
 * Confirmed response shape: { uniqueid, region, year, count, dates: [] }
 * In-flight + short TTL cache so Popup prefetch + Graff share one GET.
 */
import { fetchJson } from "../../shared/agri-http";
import {
  agriPolygonApiLog,
  AVAILABLE_DATES_MAX_BYTES,
  AVAILABLE_DATES_TIMEOUT_MS,
  getAgriPolygonApiBaseUrl,
  type PolygonAvailableDatesResponse,
} from "./config";

const availableDatesInFlight = new Map<string, Promise<string[]>>();
const availableDatesCache = new Map<string, { dates: string[]; at: number }>();
const AVAILABLE_DATES_TTL_MS = 60_000;
const AVAILABLE_DATES_CACHE_MAX = 64;
const YMD_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Keep only well-formed YYYY-MM-DD strings from an untrusted payload. */
export function parseAvailableDatesPayload(json: unknown): string[] {
  if (!json || typeof json !== "object") return [];
  const dates = (json as Partial<PolygonAvailableDatesResponse>).dates;
  if (!Array.isArray(dates)) return [];
  return dates.filter((d): d is string => typeof d === "string" && YMD_RE.test(d));
}

export async function fetchPolygonAvailableDates(
  uniqueid: string,
  regionId: number,
  year: number,
): Promise<string[]> {
  const id = String(uniqueid || "").replace(/[{}]/g, "").trim();
  const key = `${id}|${regionId}|${year}`;
  const cached = availableDatesCache.get(key);
  if (cached && Date.now() - cached.at < AVAILABLE_DATES_TTL_MS) {
    return cached.dates.slice();
  }
  let pending = availableDatesInFlight.get(key);
  if (!pending) {
    pending = fetchPolygonAvailableDatesUncached(id, regionId, year)
      .then((dates) => {
        availableDatesCache.set(key, { dates, at: Date.now() });
        while (availableDatesCache.size > AVAILABLE_DATES_CACHE_MAX) {
          const oldest = availableDatesCache.keys().next().value;
          if (oldest == null) break;
          availableDatesCache.delete(oldest);
        }
        return dates;
      })
      .finally(() => {
        availableDatesInFlight.delete(key);
      });
    availableDatesInFlight.set(key, pending);
  }
  return pending;
}

async function fetchPolygonAvailableDatesUncached(
  uniqueid: string,
  regionId: number,
  year: number,
): Promise<string[]> {
  const url =
    `${getAgriPolygonApiBaseUrl()}/v1/polygon/${encodeURIComponent(uniqueid)}/available-dates` +
    `?region_id=${encodeURIComponent(String(regionId))}&year=${encodeURIComponent(String(year))}`;
  agriPolygonApiLog("available-dates:request", { url, uniqueid, regionId, year });

  try {
    const json = await fetchJson(url, {
      timeoutMs: AVAILABLE_DATES_TIMEOUT_MS,
      maxBytes: AVAILABLE_DATES_MAX_BYTES,
      init: { headers: { accept: "application/json" } },
    });
    const dates = parseAvailableDatesPayload(json);
    agriPolygonApiLog("available-dates:response", { uniqueid, count: dates.length, dates });
    return dates;
  } catch (err: unknown) {
    agriPolygonApiLog("available-dates:FAILED", { url, error: String(err) });
    throw err;
  }
}
