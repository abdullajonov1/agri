/**
 * Shared shapes for one admin-boundary sync pass (single tuman or viloyat
 * overview), so the per-level drawing code can live in its own module.
 */
import type FeatureLayer from "esri/layers/FeatureLayer";
import type GraphicsLayer from "esri/layers/GraphicsLayer";
import type Extent from "esri/geometry/Extent";
import type EsriMap from "esri/Map";
import type { AdminBoundaryView, BoundaryModules } from "./boundary-modules";
import type { AgriAdminBoundarySelection } from "./boundary-where";

export interface AgriAdminBoundarySyncResult {
  extent: Extent | null;
  level: "district" | "region" | "none";
}

export interface BoundarySyncContext {
  view: AdminBoundaryView;
  map: EsriMap;
  modules: BoundaryModules;
  regionOutline: GraphicsLayer;
  districtOutline: GraphicsLayer;
  regionQueryLayer: FeatureLayer;
  bordersVisible: boolean;
  selection: AgriAdminBoundarySelection;
  /** Canonical viloyat label ("" when none). */
  viloyat: string;
  /** Trimmed tuman selection ("" when none). */
  tuman: string;
  parentCod: number | null;
  districtCode: string | null;
}
