/**
 * Read the signed-in ExB/Portal token for registering against the agri
 * ArcGIS Server (detached FeatureLayer queries, admin borders).
 *
 * Order: live jimu session → `exb_auth` JSON in session/local storage →
 * (only when `allowGenericStorageKeys`) generic `token`-style keys.
 */
import { SessionManager } from "jimu-core";

const GENERIC_TOKEN_KEYS = ["token", "authToken", "arcgis_token", "arcgisToken"];

export interface ReadAgriTokenOptions {
  /**
   * Also accept generic storage keys like `token` / `authToken`.
   * Admin borders keep this off: generic keys could hold an unrelated app
   * secret that would then be forwarded to ArcGIS Server.
   */
  allowGenericStorageKeys: boolean;
}

function readSessionToken(): string {
  try {
    return String(SessionManager.getInstance().getMainSession()?.token || "").trim();
  } catch {
    // No jimu session yet (anonymous / still signing in) — fall back to storage.
    return "";
  }
}

function readExbAuthToken(storage: Storage): string {
  const exbRaw = storage.getItem("exb_auth");
  if (!exbRaw) return "";
  const parsed = JSON.parse(exbRaw) as { token?: unknown } | null;
  return typeof parsed?.token === "string" ? parsed.token.trim() : "";
}

export function readAgriAuthToken(options: ReadAgriTokenOptions): string | null {
  const fromSession = readSessionToken();
  if (fromSession) return fromSession;
  if (typeof window === "undefined") return null;
  try {
    for (const storage of [window.sessionStorage, window.localStorage]) {
      const exbToken = readExbAuthToken(storage);
      if (exbToken) return exbToken;
      if (!options.allowGenericStorageKeys) continue;
      for (const key of GENERIC_TOKEN_KEYS) {
        const value = storage.getItem(key)?.trim();
        if (value) return value;
      }
    }
  } catch {
    // Blocked storage or malformed exb_auth JSON — treat as signed out.
    return null;
  }
  return null;
}
