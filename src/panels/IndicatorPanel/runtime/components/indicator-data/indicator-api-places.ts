/**
 * One viloyat/tuman pair for the indicator REST API.
 * The filter already holds the selected label. Suffix and apostrophe
 * cartesian retries are not generated here (that fan-out reached 432 calls).
 */
export function normalizeUzbekPlaceForApi(value: string): string {
  if (!value) return "";
  let out = value.trim();
  out = out.replace(/[\u02BB\u02BC\u2019\u2018\u2032\u2035`´ˊˋ]/g, "'");
  out = out
    .replace(/o['\u02BB\u02BC\u2019\u2018`´ˊˋ]/gi, "o'")
    .replace(/g['\u02BB\u02BC\u2019\u2018`´ˊˋ]/gi, "g'");
  return out.replace(/\s+/g, " ");
}

export function canonicalIndicatorApiPlaces(
  viloyat: string,
  tuman: string,
): { viloyat: string; tuman: string } {
  const vil = String(viloyat ?? "").trim();
  const tum = String(tuman ?? "").trim();
  return {
    viloyat: vil ? normalizeUzbekPlaceForApi(vil) : "",
    tuman: tum ? normalizeUzbekPlaceForApi(tum) : "",
  };
}
