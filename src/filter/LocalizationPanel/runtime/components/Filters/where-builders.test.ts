jest.mock("../../../../../gis/agri-table-data-source", () => ({
  buildSpatialJoinWhere: (ids: string[]): string =>
    ids.length ? `uniqueid IN ('${ids.join("','")}')` : "1=0",
}));
jest.mock("../../../../../gis/feature-layer-data", () => ({
  withAgriAccessWhere: (where: string): string => where,
}));
jest.mock("../localization-log", () => ({
  agriLog: (): void => undefined,
  debugCatch: (): void => undefined,
}));

import {
  buildNdviDateClauseWithoutVh,
  buildNdviSpatialWhere,
  buildNdviStatusClauseForCurrentVh,
  buildTumanDistrictClause,
  buildUniqueIdClause,
  buildViloyatRegionClause,
  buildWhereClause,
} from "./where-builders";
import type { LocalizationHost } from "../host";
import { makeRegionDistrictKey, normalizeLocalizationApos } from "../../../../localization/geo-keys";

interface HostState {
  yil: string;
  viloyat: string;
  lockedViloyat: string | null;
  tuman: string;
  vh: string;
  ndviDate: string;
  polygonMode: boolean;
  selectedGraffUniqueid: string;
  selectedFarmerInn: string;
  featureLayer: { fields: Array<{ name: string }> } | null;
  featureLayers: Array<{ fields: Array<{ name: string }> }>;
}

function makeHost(state: Partial<HostState> = {}, config: Record<string, unknown> = {}): LocalizationHost {
  const fullState: HostState = {
    yil: "2025",
    viloyat: "",
    lockedViloyat: null,
    tuman: "",
    vh: "",
    ndviDate: "",
    polygonMode: false,
    selectedGraffUniqueid: "",
    selectedFarmerInn: "",
    featureLayer: null,
    featureLayers: [],
    ...state,
  };
  const helpers = {
    normalizeApos: normalizeLocalizationApos,
    makeRegionDistrictKey,
    eqAposSmart: (field: string, raw: string): string => `${field} = '${raw}'`,
  };
  const host = {
    state: fullState,
    props: { config },
    _viloyatToRegion: { buxoro: 3 },
    _tumanToDistrict: { "region:3|olot": 301 },
    _ndviDateFieldMap: {},
    _vhMapUniqueIds: null as string[] | null,
    normalizeApos: normalizeLocalizationApos,
    getAposHelpers: () => helpers,
    getGeoCodeHelpers: () => helpers,
    findLayerFieldName: (_layer: unknown, name: string): string | null =>
      name === "uniqueid" ? "UNIQUEID" : null,
    buildYearClauseForLayer: (): string => "yil = 2025",
    buildTurlarClause: (): string => "",
  } as Record<string, unknown>;
  host.buildViloyatRegionClause = (): string =>
    buildViloyatRegionClause(host as unknown as LocalizationHost);
  host.buildTumanDistrictClause = (): string =>
    buildTumanDistrictClause(host as unknown as LocalizationHost);
  host.buildUniqueIdClause = (raw: string, layer?: __esri.FeatureLayer): string =>
    buildUniqueIdClause(host as unknown as LocalizationHost, raw, layer);
  host.buildWhereClause = (includeVh?: boolean, includeTuri?: boolean): string =>
    buildWhereClause(host as unknown as LocalizationHost, includeVh, includeTuri);
  return host as unknown as LocalizationHost;
}

describe("where-builders", () => {
  test("buildUniqueIdClause uses layer field name when layer given", () => {
    const host = makeHost();
    expect(buildUniqueIdClause(host, "abc")).toBe("(uniqueid='abc' OR uniqueid='{abc}')");
    expect(buildUniqueIdClause(host, "abc", {} as __esri.FeatureLayer)).toContain("UNIQUEID='abc'");
  });

  test("buildViloyatRegionClause prefers locked viloyat", () => {
    expect(buildViloyatRegionClause(makeHost({ viloyat: "x", lockedViloyat: "Buxoro" }))).toBe(
      "region = '3'",
    );
    expect(buildViloyatRegionClause(makeHost())).toBe("");
  });

  test("buildTumanDistrictClause modes", () => {
    expect(buildTumanDistrictClause(makeHost())).toBe("");
    expect(buildTumanDistrictClause(makeHost({ tuman: "15" }))).toBe("district = '15'");
    expect(buildTumanDistrictClause(makeHost({ viloyat: "Buxoro", tuman: "Olot" }))).toBe(
      "district = '301'",
    );
    expect(buildTumanDistrictClause(makeHost({ viloyat: "Buxoro", tuman: "Jondor" }))).toContain(
      "tuman",
    );
  });

  test("NDVI clauses need a primary layer", () => {
    expect(buildNdviStatusClauseForCurrentVh(makeHost())).toBe("");
    expect(buildNdviDateClauseWithoutVh(makeHost())).toBe("");
  });

  test("NDVI clauses use config prefix and layer fields", () => {
    const layer = { fields: [{ name: "st_2025_09_01" }] };
    const host = makeHost(
      { featureLayers: [layer], ndviDate: "2025-09-01", vh: "4-Past" },
      { polygonStatusPrefix: "st_" },
    );
    expect(buildNdviStatusClauseForCurrentVh(host)).toBe("st_2025_09_01 = 'past'");
    expect(buildNdviDateClauseWithoutVh(host)).toBe("st_2025_09_01 IS NOT NULL");
    const defaultPrefix = makeHost({
      featureLayer: { fields: [{ name: "status_2025_09_01" }] },
      ndviDate: "2025-09-01",
    });
    expect(buildNdviDateClauseWithoutVh(defaultPrefix)).toBe("status_2025_09_01 IS NOT NULL");
  });

  test("buildWhereClause requires year", () => {
    expect(buildWhereClause(makeHost({ yil: "" }))).toBe("1=0");
  });

  test("buildWhereClause republic mode without viloyat filter", () => {
    expect(buildWhereClause(makeHost(), true, true, false)).toBe("yil LIKE '2025%'");
    expect(buildWhereClause(makeHost())).toBe("1=0");
  });

  test("buildWhereClause combines geography, polygon, farmer and layer year", () => {
    const host = makeHost({
      viloyat: "Buxoro",
      tuman: "Olot",
      polygonMode: true,
      selectedGraffUniqueid: "u1",
      selectedFarmerInn: "12'3",
    });
    expect(buildWhereClause(host, true, true, true, {} as __esri.FeatureLayer)).toBe(
      "yil = 2025 AND region = '3' AND district = '301' AND UPPER(f_inn)=UPPER('12''3') AND (UNIQUEID='u1' OR UNIQUEID='{u1}')",
    );
  });

  test("buildNdviSpatialWhere delegates to host.buildWhereClause without VH", () => {
    const host = makeHost({ viloyat: "Buxoro" });
    expect(buildNdviSpatialWhere(host)).toBe("yil LIKE '2025%' AND region = '3'");
  });
});
