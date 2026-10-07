/**
 * Administrative boundary outlines for Agro_widgetV5 map.
 *
 * Regions:  Hosted/regions/FeatureServer/5
 * Districts: Hosted/district/FeatureServer/3
 *
 * Outlines are drawn on GraphicsLayers from a one-shot JSON query.
 * Putting the Hosted FeatureLayer on the map makes the JS API fire
 * quantized PBF tile queries (f=pbf, resultType=tile) — those 400/500
 * on detailed polygons such as Farg'ona (parent_cod = 1730).
 *
 * Admin outline layers (Hosted/regions, Tuman_chegara) use soato/name fields,
 * not Agri_table `viloyat`. Client access WHERE must NOT be applied here —
 * Localization already scopes selection via lockedViloyat / regionCode.
 * See combineAccessWhereIfFieldsExist in agri-access-config.ts.
 *
 * This file is the stable entry point; the implementation lives in
 * ./admin-boundary/ (fields, WHERE building, graphics, queries, sync).
 */
export {
  AGRI_REGION_BOUNDARY_LAYER_ID,
  AGRI_DISTRICT_BOUNDARY_LAYER_ID,
  AGRI_DISTRICT_LABEL_LAYER_ID,
  AGRI_DISTRICT_FS_LAYER_ID,
} from "./admin-boundary/boundary-graphics";
export {
  AGRI_ADMIN_BORDERS_STORAGE_KEY,
  readAgriAdminBordersVisible,
  writeAgriAdminBordersVisible,
} from "./admin-boundary/boundary-preference";
export {
  getAgriRegionBoundaryUrl,
  getAgriDistrictBoundaryUrl,
  getAgriDistrictBoundaryFallbackUrl,
} from "./admin-boundary/boundary-modules";
export type { AgriAdminBoundarySelection } from "./admin-boundary/boundary-where";
export type { AgriAdminBoundarySyncResult } from "./admin-boundary/boundary-sync-context";
export {
  queryAgriAdminBoundaryExtentOnly,
  syncAgriAdminBoundaries,
  setAgriAdminBordersVisible,
  clearAgriAdminBoundaries,
} from "./admin-boundary/boundary-sync";
