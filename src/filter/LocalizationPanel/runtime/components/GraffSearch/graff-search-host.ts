import type { LocalizationHost } from "../host";

export type GraffSearchHost = Pick<
  LocalizationHost,
  "_farmerMapUniqueIds" | "_farmerSearchApplying" | "_graffAutoCompleteRequestId" | "_graffSearchDebounceTimer" | "_isMounted" | "_preFarmerSearchGeo" | "applyFarmerSearchSelection" | "applyMapFiltersOptimized" | "broadcastFilterState" | "buildGraffSearchScopeWhere" | "buildGraffSearchTextWhere" | "buildTumanDistrictClause" | "buildViloyatRegionClause" | "clearFarmerSearchAndRestoreGeo" | "emitGraffTableSearchChanged" | "emitGraffTableSearchClear" | "fetchDataWithCurrentState" | "findLayerFieldName" | "getEffectiveViloyat" | "getGraffDisplayFields" | "runGraffAutoComplete" | "setState" | "state"
>;
