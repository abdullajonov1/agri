/**
 * Shared access to the agri_crop FeatureLayer (Crop Agro plan polygons).
 *
 * Used for Excel Crop Agro REJA columns and the Fermer report. Field names
 * differ from Agri_table_data: year/areaha/plant_name/region/district/…
 */
import { getAgriServiceUrls } from "../shared/agri-service-urls";
import {
  createSingletonLayerLoader,
  type AgriSingletonLayerHandle,
} from "../shared/agri-singleton-layer-loader";

/** Logger disabled — keep call sites without console noise. */
export function agriCropPlanLog(
  _phase: string,
  _detail?: Record<string, unknown>,
): void {
  /* no-op */
}

export function getAgriCropPlanUrl(): string {
  return getAgriServiceUrls().cropPlanUrl;
}

/** Loaded FeatureLayer + its field names. */
export type AgriCropPlanLayerHandle = AgriSingletonLayerHandle;

const getAgriCropPlanLayerCached = createSingletonLayerLoader(
  getAgriCropPlanUrl,
  agriCropPlanLog,
);

/**
 * Loads (once) the agri_crop FeatureLayer by URL. Cached as a singleton
 * promise so every widget shares the same loaded layer instance.
 */
export async function getAgriCropPlanLayer(): Promise<AgriCropPlanLayerHandle> {
  return getAgriCropPlanLayerCached();
}
