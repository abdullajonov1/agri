/**
 * Client for the api-agri.sgm.uzspace.uz REST API — per-polygon vegetation
 * index available dates and colored raster exports.
 *
 * Separate from agri-vegetation-data-source.ts (which queries the raw
 * ArcGIS agri_vegetation_indices Table directly): that table has scalar
 * index values per (uniqueid, raster_date), fine for charts and the
 * region-wide status bar, but no pixel data. This API is used specifically
 * for the single-selected-polygon case in AgriGraff10, where we need an
 * actual rendered, georeferenced raster image to overlay on the map.
 *
 * Public entry point — implementation lives in ./polygon-api/*.
 */
export * from "./polygon-api/config";
export * from "./polygon-api/available-dates";
export * from "./polygon-api/index-color";
export * from "./polygon-api/export-image-errors";
export * from "./polygon-api/export-image-knowledge";
export * from "./polygon-api/export-date-pick";
export * from "./polygon-api/tiff-decode";
export * from "./polygon-api/export-image";
