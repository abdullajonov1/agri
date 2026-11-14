/**
 * One-shot dashboard bootstrap: reference mappings shared by Localization,
 * Graff, Pie, and map filter resolution. Does not replace per-filter stats.
 * Resolved mappings persist for 1 hour across refresh.
 */
import {
  queryAgriRegionDistrictMappings,
  queryAgriTuriCropMappings,
  type AgriRegionDistrictMappingRow,
  type AgriTuriCropMappingRow,
} from "../gis/agri-table-data-source";
import {
  getAccessWhereHash,
  onAccessWhereChange,
} from "../shared/agri-access-config";
import {
  AGRI_PERSIST_TTL_MS,
  getAgriPersistentCache,
  removeAgriPersistentCache,
  setAgriPersistentCache,
} from "./agri-persistent-cache";

export interface AgriDashboardBootstrap {
  regionDistrictRows: AgriRegionDistrictMappingRow[];
  turiCropRows: AgriTuriCropMappingRow[];
}

const BOOTSTRAP_NS = "bootstrap";
/** Bump when mapping semantics change (majority-vote district codes, counts). */
const BOOTSTRAP_KEY_PREFIX = "mappings-v3";

/** Persisted key includes the access WHERE hash (mappings bake access in). */
export function getAgriBootstrapKey(): string {
  return `${BOOTSTRAP_KEY_PREFIX}-${getAccessWhereHash()}`;
}

let bootstrapPromise: Promise<AgriDashboardBootstrap> | null = null;

export function getAgriDashboardBootstrap(): Promise<AgriDashboardBootstrap> {
  if (!bootstrapPromise) {
    const bootstrapKey = getAgriBootstrapKey();
    const persisted = getAgriPersistentCache<AgriDashboardBootstrap>(
      BOOTSTRAP_NS,
      bootstrapKey,
    );
    if (
      persisted &&
      Array.isArray(persisted.regionDistrictRows) &&
      Array.isArray(persisted.turiCropRows)
    ) {
      bootstrapPromise = Promise.resolve(persisted);
      return bootstrapPromise;
    }

    bootstrapPromise = Promise.all([
      queryAgriRegionDistrictMappings(),
      queryAgriTuriCropMappings(),
    ])
      .then(([regionDistrictRows, turiCropRows]) => {
        const payload: AgriDashboardBootstrap = {
          regionDistrictRows,
          turiCropRows,
        };
        setAgriPersistentCache(
          BOOTSTRAP_NS,
          bootstrapKey,
          payload,
          AGRI_PERSIST_TTL_MS,
        );
        return payload;
      })
      .catch((err) => {
        bootstrapPromise = null;
        throw err;
      });
  }
  return bootstrapPromise;
}

export function clearAgriDashboardBootstrapCache(): void {
  bootstrapPromise = null;
  removeAgriPersistentCache(BOOTSTRAP_NS, getAgriBootstrapKey());
}

// Guarded: tests may mock the access module without the listener registry.
if (typeof onAccessWhereChange === "function") {
  onAccessWhereChange(() => {
    bootstrapPromise = null;
  });
}
