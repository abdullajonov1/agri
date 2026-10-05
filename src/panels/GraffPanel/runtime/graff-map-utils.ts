/**
 * Pure map helpers for GraffPanel (no widget state).
 */
import Color from "esri/Color";
import SimpleFillSymbol from "esri/symbols/SimpleFillSymbol";
import SimpleLineSymbol from "esri/symbols/SimpleLineSymbol";
import SimpleMarkerSymbol from "esri/symbols/SimpleMarkerSymbol";

/**
 * Builder data-source resolution may expose only a subset of regional map
 * services. Include queryable sublayers from the live map itself so a row
 * selected for any viloyat (and optionally tuman) can always resolve its
 * polygon geometry. Prefer the current viloyat + year leaf (.../MapServer/N).
 */
export const isAgriSpatialLayerUrl = (url: string): boolean => {
  if (!url) return false;
  const lower = url.toLowerCase();
  // Accept only internal agri services; exclude World Imagery / basemap layers
  const knownExternal = [
    "arcgisonline.com",
    "basemaps.arcgis.com",
    "tiles.arcgis.com",
  ];
  if (knownExternal.some((h) => lower.includes(h))) return false;
  // Must contain "agri" in the path (agri_sirdarya, Agri_table_data, etc.)
  return lower.includes("agri");
};

export const isLayerTreeVisible = (layer: any): boolean => {
  if (!layer) return false;
  const seen = new Set<any>();
  let current: any = layer;
  while (current && !seen.has(current)) {
    seen.add(current);
    if (current.visible === false) return false;
    current = current.parent || current.layer || null;
  }
  return true;
};

/** Clear Graff view.graphics and AgriPopup's highlight layer so both selection paths stay in sync. */
export const clearMapSelectionGraphics = (
  view?: __esri.MapView | __esri.SceneView | null,
) => {
  try {
    view?.graphics?.removeAll?.();
  } catch {
    /* ignore */
  }
  try {
    const layer = view?.map?.findLayerById?.(
      "agri-polygon-highlight",
    ) as __esri.GraphicsLayer | null | undefined;
    layer?.removeAll?.();
  } catch {
    /* ignore */
  }
};

/** Bright cyan core with a wider translucent halo for selection visibility. */
export const buildSelectionSymbol = (
  geomType: string | undefined,
  halo = false,
) => {
  if (geomType === "polygon") {
    return new SimpleFillSymbol({
      color: new Color([0, 0, 0, 0]),
      outline: new SimpleLineSymbol({
        color: new Color(
          halo ? [0, 229, 255, 0.32] : [128, 245, 255, 1],
        ),
        width: halo ? 9 : 3,
        style: "solid",
      }),
    });
  }
  if (geomType === "polyline") {
    return new SimpleLineSymbol({
      color: new Color(
        halo ? [0, 229, 255, 0.32] : [128, 245, 255, 1],
      ),
      width: halo ? 10 : 4,
    });
  }
  return new SimpleMarkerSymbol({
    color: new Color(
      halo ? [0, 229, 255, 0.22] : [0, 229, 255, 0.95],
    ),
    size: halo ? 22 : 14,
    outline: new SimpleLineSymbol({
      color: new Color([255, 255, 255, halo ? 0.3 : 1]),
      width: halo ? 5 : 2,
    }),
  });
};
