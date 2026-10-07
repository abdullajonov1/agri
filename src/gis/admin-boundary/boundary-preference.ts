/**
 * "Show admin borders" preference — cached in memory, persisted to
 * localStorage so the toggle survives a reload.
 */
export const AGRI_ADMIN_BORDERS_STORAGE_KEY = "agri_admin_borders_visible";

let bordersVisiblePreferenceInitialized = false;
let bordersVisiblePreference = true;

export function readAgriAdminBordersVisible(): boolean {
  if (bordersVisiblePreferenceInitialized) return bordersVisiblePreference;
  bordersVisiblePreferenceInitialized = true;
  try {
    const raw = localStorage.getItem(AGRI_ADMIN_BORDERS_STORAGE_KEY);
    if (raw === "0" || raw === "false") bordersVisiblePreference = false;
    else if (raw === "1" || raw === "true") bordersVisiblePreference = true;
  } catch {
    /* storage blocked (private mode / sandbox) — keep the default (visible) */
  }
  return bordersVisiblePreference;
}

export function writeAgriAdminBordersVisible(visible: boolean): void {
  bordersVisiblePreference = visible;
  bordersVisiblePreferenceInitialized = true;
  try {
    localStorage.setItem(AGRI_ADMIN_BORDERS_STORAGE_KEY, visible ? "1" : "0");
  } catch {
    /* storage blocked or full — the in-memory preference still applies */
  }
}
