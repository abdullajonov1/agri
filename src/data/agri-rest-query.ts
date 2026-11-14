import { loadArcGISJSAPIModules } from "jimu-arcgis";
import type { AgriRestQueryResponse } from "../gis/agri-layer-types";

const DEFAULT_ERROR_MESSAGE = "query error";

export interface RestQueryOptions {
  /** Request timeout in ms, chosen by the caller. */
  timeout: number;
  /** Message thrown when the service reports an error without one. */
  errorFallback?: string;
}

/**
 * One esri/request JSON call against a layer `/query` URL: loads the module,
 * sends `query` as-is, throws on a service-side error and returns the body.
 */
export async function queryRestJson(
  url: string,
  query: Record<string, unknown>,
  { timeout, errorFallback = DEFAULT_ERROR_MESSAGE }: RestQueryOptions,
): Promise<AgriRestQueryResponse> {
  const [esriRequest] = await loadArcGISJSAPIModules(["esri/request"]);
  const res = await esriRequest(url, { query, responseType: "json", timeout });
  const data: AgriRestQueryResponse | undefined = res?.data;
  if (data?.error) {
    throw new Error(String(data.error.message || errorFallback));
  }
  return data ?? {};
}
