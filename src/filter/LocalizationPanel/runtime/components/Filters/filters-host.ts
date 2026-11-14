import type { LocalizationHost } from "../host";

export type FiltersHost = Pick<
  LocalizationHost,
  "_ndviDateFieldMap" | "_tumanToDistrict" | "_vhMapUniqueIds" | "_viloyatToRegion" | "buildTumanDistrictClause" | "buildTurlarClause" | "buildUniqueIdClause" | "buildViloyatRegionClause" | "buildWhereClause" | "buildYearClauseForLayer" | "findLayerFieldName" | "getAposHelpers" | "getGeoCodeHelpers" | "normalizeApos" | "props" | "state"
>;
