import { escapeLikeLiteral } from "../../../../../data/agri-sql";
import { buildYearLikeClause } from "../../../../../controller/agri-where-builder";
import {
  getAgriTableDataLayer,
  queryAgriUniqueIdsForFarmerInn,
} from "../../../../../gis/agri-table-data-source";
import { React } from "jimu-core";
import { agriLog } from "../localization-log";
import type { LocalizationHost } from "../host";
import type { FilterState, GeoWidgetState, GraffSearchRecord } from "../../widget";

export const emitGraffTableSearchChanged = (
  host: LocalizationHost,
  query: string,
  options?: { preserveSelection?: boolean },
) => {
  document.dispatchEvent(
    new CustomEvent("agriGraff4TableSearchChanged", {
      detail: {
        source: "AgriLocalization",
        query: String(query || "").trim(),
        isFullSelection: false,
        preserveSelection: Boolean(options?.preserveSelection),
        timestamp: Date.now(),
      },
      bubbles: true,
    }),
  );
};

export const emitGraffTableSearchClear = (host: LocalizationHost, options?: {
  preserveSelection?: boolean;
}) => {
  host.emitGraffTableSearchChanged("", options);
};

export const emitGraffTableRowSelected = (host: LocalizationHost, record: GraffSearchRecord) => {
  document.dispatchEvent(
    new CustomEvent("agriGraff4TableRowSelected", {
      detail: {
        source: "AgriLocalization",
        record,
        timestamp: Date.now(),
      },
      bubbles: true,
    }),
  );
};

export const getGraffDisplayFields = (host: LocalizationHost): string[] => {
  // Search modal: INN (STIR) + fermer name
  return ["f_inn", "f_name"];
};

export const buildGraffSearchTextWhere = (
  host: LocalizationHost,
  raw: string,
  layer?: __esri.FeatureLayer,
): string => {
  const term = (raw || "").trim();
  if (!term) return "1=0";

  const fl = layer ?? host.state.featureLayer;
  const innField = fl
    ? host.findLayerFieldName(fl, "f_inn") || "f_inn"
    : "f_inn";
  const farmerField = fl
    ? host.findLayerFieldName(fl, "f_name") || "f_name"
    : "f_name";
  const escaped = escapeLikeLiteral(term);

  const innLike = `UPPER(${innField}) LIKE UPPER('%${escaped}%')`;
  const farmerLike = `UPPER(${farmerField}) LIKE UPPER('%${escaped}%')`;

  return `(${innLike} OR ${farmerLike})`;
};

/**
 * Graff search modal: year is required. When a viloyat (or tuman) is
 * selected, STIR search is scoped to the whole viloyat — not the active
 * district — so other tumans in that region still appear in the list.
 */
export const buildGraffSearchScopeWhere = (host: LocalizationHost): string => {
  const { yil } = host.state;
  if (!yil) return "1=0";

  const clauses: string[] = [];
  const yearClause = buildYearLikeClause(yil);
  if (yearClause) clauses.push(yearClause);

  const viloyatClause = host.buildViloyatRegionClause();
  if (viloyatClause) clauses.push(viloyatClause);

  return clauses.length ? clauses.join(" AND ") : "1=0";
};

export const getGraffSearchFieldLabel = (
  host: LocalizationHost,
  fieldName: string,
  language: FilterState["language"],
): string => {
  const lower = fieldName.toLowerCase();
  if (lower === "f_inn")
    return language === "en"
      ? "TIN"
      : language === "ru"
        ? "ИНН"
        : language === "uz_lat"
          ? "STIR"
          : "СТИР";
  if (lower === "uniqueid")
    return language === "en"
      ? "TIN"
      : language === "ru"
        ? "ИНН"
        : language === "uz_lat"
          ? "STIR"
          : "СТИР";
  if (lower === "tuman")
    return language === "en" ? "District" : language === "ru" ? "Район" : language === "uz_lat" ? "Tuman" : "Туман";
  if (lower === "f_name")
    return language === "en"
      ? "Farmer name"
      : language === "ru"
      ? "Название фермера"
      : language === "uz_lat"
        ? "Fermer nomi"
        : "Фермер номи";
  if (lower === "maydon")
    return language === "en"
      ? "Area"
      : language === "ru"
      ? "Площадь"
      : language === "uz_lat"
        ? "Maydon"
        : "Майдон";
  if (lower === "turi" || lower === "uzspace")
    return language === "en"
      ? "Crop type"
      : language === "ru"
      ? "Тип посева"
      : language === "uz_lat"
        ? "Ekin turi"
        : "Экин тури";
  if (lower === "vh") return language === "en" ? "VS" : language === "uz_lat" ? "VH" : "ВХ";
  return fieldName;
};

export const formatGraffSearchCellValue = (
  host: LocalizationHost,
  fieldName: string,
  rawValue: unknown,
): string => {
  if (rawValue == null || rawValue === "") return "—";
  if (typeof rawValue === "number" && Number.isFinite(rawValue)) {
    return fieldName.toLowerCase() === "maydon"
      ? rawValue.toLocaleString("ru-RU", { maximumFractionDigits: 2 }).replace(/[\u00a0\u202f]/g, " ").replace(/,/g, ".")
      : String(rawValue);
  }
  return String(rawValue);
};

export const runGraffAutoComplete = async (host: LocalizationHost, term: string) => {
  if (!host._isMounted) return;

  const requestId = ++host._graffAutoCompleteRequestId;
  const isCurrent = () =>
    host._isMounted && requestId === host._graffAutoCompleteRequestId;

  const trimmed = term.trim();
  if (!trimmed) {
    host.setState({
      graffSearchSuggestions: [],
      graffSearchShowSuggestions: false,
      graffSearchLoading: false,
    });
    return;
  }

  let fl = host.state.featureLayer;
  if (!fl) {
    try {
      const { layer } = await getAgriTableDataLayer();
      fl = layer;
    } catch (err) {
      agriLog("graffSearch:layer-unavailable", {
        error: String((err as any)?.message || err),
      });
      host.setState({
        graffSearchSuggestions: [],
        graffSearchShowSuggestions: true,
        graffSearchLoading: false,
      });
      return;
    }
  }

  try {
    const displayFields = host.getGraffDisplayFields();
    const scopeWhere = host.buildGraffSearchScopeWhere();
    const searchWhere = host.buildGraffSearchTextWhere(trimmed, fl);
    const q = fl.createQuery();
    const uidField =
      host.findLayerFieldName(fl, "uniqueid") || "uniqueid";
    const innField = host.findLayerFieldName(fl, "f_inn") || "f_inn";
    const farmerField = host.findLayerFieldName(fl, "f_name") || "f_name";
    const viloyatField =
      host.findLayerFieldName(fl, "viloyat") || "viloyat";
    const tumanField = host.findLayerFieldName(fl, "tuman") || "tuman";
    q.outFields = Array.from(
      new Set([
        ...displayFields,
        "objectid",
        uidField,
        innField,
        farmerField,
        viloyatField,
        tumanField,
      ]),
    );
    q.returnGeometry = false;
    q.num = 50;
    q.orderByFields = [`${innField} ASC`, `${farmerField} ASC`];
    q.where =
      scopeWhere && scopeWhere !== "1=1"
        ? `(${scopeWhere}) AND (${searchWhere})`
        : searchWhere;

    agriLog("graffSearch:query", {
      term: trimmed,
      where: q.where,
    });

    const fs = await fl.queryFeatures(q);
    const results: GraffSearchRecord[] = (fs?.features || [])
      .slice(0, 50)
      .map((feat) => {
        const attrs = { ...(feat.attributes || {}) } as GraffSearchRecord;
        if (!attrs.uniqueid && attrs[uidField] != null) {
          attrs.uniqueid = String(attrs[uidField]);
        }
        if (!attrs.f_inn && attrs[innField] != null) {
          attrs.f_inn = String(attrs[innField]);
        }
        if (!attrs.f_name && attrs[farmerField] != null) {
          attrs.f_name = String(attrs[farmerField]);
        }
        if (!attrs.viloyat && attrs[viloyatField] != null) {
          attrs.viloyat = String(attrs[viloyatField]);
        }
        if (!attrs.tuman && attrs[tumanField] != null) {
          attrs.tuman = String(attrs[tumanField]);
        }
        return attrs;
      })
      .filter((record) => record.f_inn || record.f_name);

    // One row per STIR + viloyat + tuman (avoid repeating every parcel).
    const seenGeo = new Set<string>();
    const deduped: GraffSearchRecord[] = [];
    for (const record of results) {
      const key = [
        String(record.f_inn || "").trim().toLowerCase(),
        String(record.viloyat || record.region || "")
          .trim()
          .toLowerCase(),
        String(record.tuman || record.district || "")
          .trim()
          .toLowerCase(),
      ].join("|");
      if (seenGeo.has(key)) continue;
      seenGeo.add(key);
      deduped.push(record);
    }

    agriLog("graffSearch:results", {
      count: deduped.length,
      rawCount: results.length,
    });

    if (isCurrent()) {
      host.setState({
        graffSearchSuggestions: deduped,
        graffSearchShowSuggestions: true,
        graffSearchLoading: false,
      });
    }
  } catch (err) {
    agriLog("graffSearch:failed", {
      error: String((err as any)?.message || err),
    });
    if (isCurrent()) {
      host.setState({
        graffSearchSuggestions: [],
        graffSearchShowSuggestions: true,
        graffSearchLoading: false,
      });
    }
  }
};

export const handleGraffSearchInputChange = (
  host: LocalizationHost,
  event: React.ChangeEvent<HTMLInputElement>,
) => {
  const nextValue = String(event?.target?.value ?? "");
  const trimmed = nextValue.trim();
  const selectedInn = String(host.state.selectedFarmerInn || "").trim();
  const leavingCommittedSelection =
    !!selectedInn && trimmed !== selectedInn;

  if (leavingCommittedSelection) {
    // Editing away from a committed STIR restores prior geography first.
    const restore = host._preFarmerSearchGeo;
    host._preFarmerSearchGeo = null;
    host._farmerMapUniqueIds = null;
    host.setState(
      {
        graffSearchText: nextValue,
        selectedFarmerInn: "",
        viloyat:
          restore != null
            ? String(restore.viloyat || "")
            : host.state.viloyat,
        tuman:
          restore != null ? String(restore.tuman || "") : host.state.tuman,
      },
      () => {
        host.emitGraffTableSearchClear();
        if (host.state.connectionStatus === "connected") {
          const v = String(host.state.viloyat || "");
          const t = String(host.state.tuman || "");
          const zoomRequest = !v
            ? ({ mode: "home", reason: "reset" } as const)
            : t
              ? ({ mode: "selection", reason: "district" } as const)
              : ({ mode: "selection", reason: "region" } as const);
          host.broadcastFilterState();
          void host.applyMapFiltersOptimized(zoomRequest);
        }
      },
    );
  } else {
    host.setState({ graffSearchText: nextValue });
  }

  if (host._graffSearchDebounceTimer) {
    clearTimeout(host._graffSearchDebounceTimer);
  }

  if (!trimmed) {
    // Emptying the input after a committed STIR selection restores prior geo.
    // (Already handled above when leavingCommittedSelection cleared farmer.)
    if (!leavingCommittedSelection && host._preFarmerSearchGeo) {
      host.clearFarmerSearchAndRestoreGeo();
    } else {
      host.setState({
        graffSearchSuggestions: [],
        graffSearchShowSuggestions: false,
        graffSearchLoading: false,
      });
    }
    return;
  }

  // Year is enough — republic-wide STIR search is allowed without viloyat.
  if (!host.state.yil) {
    host.setState({
      graffSearchSuggestions: [],
      graffSearchShowSuggestions: false,
      graffSearchLoading: false,
    });
    return;
  }

  host.setState({
    graffSearchShowSuggestions: true,
    graffSearchLoading: true,
  });

  // Typing only drives the dropdown suggestions — do NOT filter Jadval /
  // zoom the map until the user picks a row from that list.
  host._graffSearchDebounceTimer = setTimeout(() => {
    host.runGraffAutoComplete(trimmed);
  }, 300);
};

export const handleGraffSearchFocus = (host: LocalizationHost): void => {
  const trimmed = String(host.state.graffSearchText || "").trim();
  if (!trimmed || !host.state.yil) return;

  // Click-away only hides the list; keep suggestions and reopen on focus.
  if (host.state.graffSearchSuggestions.length > 0) {
    host.setState({ graffSearchShowSuggestions: true });
    return;
  }

  host.setState({
    graffSearchShowSuggestions: true,
    graffSearchLoading: true,
  });
  void host.runGraffAutoComplete(trimmed);
};

/**
 * Clear STIR selection and restore the geography that was active before
 * the farmer search row was chosen (republic / viloyat / tuman).
 */
export const clearFarmerSearchAndRestoreGeo = (host: LocalizationHost): void => {
  if (host._graffSearchDebounceTimer) {
    clearTimeout(host._graffSearchDebounceTimer);
    host._graffSearchDebounceTimer = null;
  }

  const hadFarmer = !!String(host.state.selectedFarmerInn || "").trim();
  const restore = host._preFarmerSearchGeo;
  host._preFarmerSearchGeo = null;
  host._farmerMapUniqueIds = null;

  const nextViloyat =
    restore != null ? String(restore.viloyat || "") : host.state.viloyat;
  const nextTuman =
    restore != null ? String(restore.tuman || "") : host.state.tuman;
  const geoChanged =
    hadFarmer &&
    restore != null &&
    (String(host.state.viloyat || "") !== nextViloyat ||
      String(host.state.tuman || "") !== nextTuman);

  host._farmerSearchApplying = true;
  host.setState(
    {
      graffSearchText: "",
      graffSearchSuggestions: [],
      graffSearchShowSuggestions: false,
      graffSearchLoading: false,
      selectedFarmerInn: "",
      polygonMode: false,
      selectedGraffUniqueid: "",
      selectedGraffUniqueidClickedAt: undefined,
      viloyat: nextViloyat,
      tuman: nextTuman,
    },
    () => {
      host.emitGraffTableSearchClear();
      if (host.state.connectionStatus !== "connected") {
        host._farmerSearchApplying = false;
        return;
      }
      if (!hadFarmer && !geoChanged) {
        host._farmerSearchApplying = false;
        return;
      }

      const zoomRequest =
        !nextViloyat
          ? ({ mode: "home", reason: "reset" } as const)
          : nextTuman
            ? ({ mode: "selection", reason: "district" } as const)
            : ({ mode: "selection", reason: "region" } as const);

      host.broadcastFilterState();
      void host.applyMapFiltersOptimized(zoomRequest).finally(() => {
        host._farmerSearchApplying = false;
      });
      void host.fetchDataWithCurrentState();
    },
  );
};

export const handleGraffSearchClear = (host: LocalizationHost) => {
  host.clearFarmerSearchAndRestoreGeo();
};

export const handleGraffSearchRowClick = (host: LocalizationHost, record: GraffSearchRecord) => {
  const inn = String(record.f_inn || "").trim();
  const name = String(record.f_name || "").trim();
  const label = inn || name;
  if (!label) return;

  const recordViloyat = String(record.viloyat || record.region || "").trim();
  const recordTuman = String(record.tuman || record.district || "").trim();
  const hadViloyat = !!host.getEffectiveViloyat();

  // Remember prior geography once per STIR session so X restores it.
  if (!host._preFarmerSearchGeo) {
    host._preFarmerSearchGeo = {
      viloyat: String(host.state.viloyat || ""),
      tuman: String(host.state.tuman || ""),
    };
  }

  // Prefer exact STIR; name-only rows still filter via search text on Graff.
  const updates: Partial<GeoWidgetState> = {
    graffSearchText: label,
    graffSearchSuggestions: [],
    graffSearchShowSuggestions: false,
    graffSearchLoading: false,
    selectedFarmerInn: inn,
    polygonMode: false,
    selectedGraffUniqueid: "",
    selectedGraffUniqueidClickedAt: undefined,
  };

  // Republic search: lock geography to the row so MapImage + VH can load.
  // Tuman-scoped UI still searches viloyat-wide — move to the row's district
  // when the user picks a result from another tuman.
  if (!hadViloyat && recordViloyat) {
    updates.viloyat = recordViloyat;
    if (recordTuman) updates.tuman = recordTuman;
  } else if (hadViloyat && recordTuman) {
    updates.tuman = recordTuman;
  }

  host._farmerSearchApplying = true;
  host.setState(updates as any, () => {
    host.emitGraffTableSearchChanged(inn || name);
    if (inn) {
      void host.applyFarmerSearchSelection(inn);
    } else {
      host._farmerMapUniqueIds = null;
      host._farmerSearchApplying = false;
      host.broadcastFilterState();
      void host.applyMapFiltersOptimized({
        mode: "selection",
        reason: "ndvi",
      });
    }
  });
};

/**
 * Resolve STIR → uniqueids, then refresh pie / VH / map zoom to those fields.
 */
export const applyFarmerSearchSelection = async (host: LocalizationHost, inn: string): Promise<void> => {
  if (!host._isMounted) return;
  const cleanInn = String(inn || "").trim();
  if (!cleanInn) {
    host._farmerMapUniqueIds = null;
    return;
  }

  host._farmerSearchApplying = true;
  try {
    const scopeParts: string[] = [];
    const yearClause = buildYearLikeClause(host.state.yil);
    if (yearClause) scopeParts.push(yearClause);
    const vilClause = host.buildViloyatRegionClause();
    if (vilClause) scopeParts.push(vilClause);
    if (host.state.tuman) {
      const tumanClause = host.buildTumanDistrictClause();
      if (tumanClause) scopeParts.push(tumanClause);
    }
    const scopeWhere = scopeParts.join(" AND ");
    const ids = await queryAgriUniqueIdsForFarmerInn(cleanInn, scopeWhere);
    if (!host._isMounted) return;
    if (String(host.state.selectedFarmerInn || "").trim() !== cleanInn) return;
    host._farmerMapUniqueIds = ids;

    agriLog("farmerSearch:applied", {
      inn: cleanInn,
      uniqueidCount: ids.length,
      viloyat: host.getEffectiveViloyat(),
      tuman: host.state.tuman,
    });

    host.broadcastFilterState();
    await host.applyMapFiltersOptimized({
      mode: "selection",
      reason: "ndvi",
    });
    await host.fetchDataWithCurrentState();
  } catch (error: any) {
    agriLog("farmerSearch:FAILED", {
      inn: cleanInn,
      error: String(error?.message || error),
    });
    host._farmerMapUniqueIds = [];
    host.broadcastFilterState();
  } finally {
    host._farmerSearchApplying = false;
  }
};
