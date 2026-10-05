import type { GraffWidgetHost } from "../graff-host";
import type { AgriGraffWidgetState, RecordData } from "../widget";
import { isMapImageOwnedLayer } from "../../../../gis/feature-layer-data";
import { buildSpatialJoinWhere, queryAgriUniqueIdsForWhere } from "../../../../gis/agri-table-data-source";
import { graffRegionalFiltersChanged } from "../../../../data/agri-graff-date";
import type { VegetationIndiceType } from "../../../../gis/agri-polygon-api-source";
import { graffLog } from "../graff-log";

export const fetchFilterOptions = (host: GraffWidgetHost): Promise<void> => {
  if (host._filterOptionsPromise) return host._filterOptionsPromise;
  const run = host.fetchFilterOptionsOnce().finally(() => {
    if (host._filterOptionsPromise === run) host._filterOptionsPromise = null;
  });
  host._filterOptionsPromise = run;
  return run;
};

export const fetchFilterOptionsOnce = async (host: GraffWidgetHost): Promise<void> => {
  if (!host._isMounted) return;
  if (host.state.connectionStatus !== "connected") {

    return;
  }

  const configuredFields = host.getConfiguredFilterFields();
  if (configuredFields.length === 0) {
    host.setState({
      error:
        "Майдонлар танланмаган. Виджет созламаларида майдонларни танланг.",
      loading: false,
    });
    return;
  }

  // The default dashboard opens in graph mode. Table filter DISTINCT
  // values (one server query per configured field) and the first table
  // page are not used until the user opens "Jadval". Deferring them removes
  // the largest avoidable startup burst without changing map/chart data.
  if (host.state.viewMode === "graph") {
    host.setState({
      loadingFilters: false,
      loading: false,
      error: null,
      initialDataLoaded: true,
      loadingVegetation: !host.state.selecteduniqueid
        ? true
        : host.state.loadingVegetation,
    });
    if (host.initializationTimer) {
      clearTimeout(host.initializationTimer);
      host.initializationTimer = null;
    }
    if (!host.state.selecteduniqueid) host.fetchRegionalTimeseries();
    return;
  }

  try {
    host.setState({ loadingFilters: true });

    const { featureLayer } = host.state;
    if (!featureLayer) {
      host.setState({
        loadingFilters: false,
        error: "Маълумот манбаи мавжуд эмас",
      });
      return;
    }

    const results = await Promise.all(
      configuredFields.map((f) => host.getUniqueValues(f)),
    );

    if (!host._isMounted) return;

    const filterOptions = configuredFields.reduce(
      (acc, f, i) => {
        acc[f] = results[i] || [];
        return acc;
      },
      {} as Record<string, string[]>,
    );

    host.setState({
      filterOptions,
      loadingFilters: false,
      loading: false,
      error: null,
      initialDataLoaded: true,
    });

    if (host.initializationTimer) {
      clearTimeout(host.initializationTimer);
      host.initializationTimer = null;
    }

    host.fetchData();
    // The awaits above allow the user to switch from table to graph while
    // these requests are running. Widen the state again because TypeScript
    // still remembers the pre-await "table" narrowing from the early return.
    const currentState = host.state as AgriGraffWidgetState;
    if (currentState.viewMode === "graph" && !currentState.selecteduniqueid) {
      host.fetchRegionalTimeseries();
    }
  } catch (error: any) {
    if (!host._isMounted) return;

    host.setState({
      error: `Бошланғич маълумот юклана олмади: ${error.message || error}`,
      loadingFilters: false,
    });
  }
};

export const getUniqueValues = async (host: GraffWidgetHost, fieldName: string): Promise<string[]> => {
  const featureLayer = host.state.featureLayer;
  if (featureLayer) {
    try {
      const query = featureLayer.createQuery();
      query.where = '1=1';
      query.outFields = [fieldName];
      query.returnGeometry = false;
      query.returnDistinctValues = true;
      query.orderByFields = [fieldName];
      query.num = 1000;
      const result = await featureLayer.queryFeatures(query);
      const values = (result?.features || [])
        .map((feature) => feature.attributes?.[fieldName])
        .filter((value) => value != null && value !== '');
      return [...new Set(values)].sort();
    } catch {
      return [];
    }
  }
  const { dataSource } = host.state;

  if (!dataSource) return [];

  try {
    const q = {
      where: "1=1",
      outFields: [fieldName],
      // Keep DISTINCT and ORDER BY on the same field. The jimu DataSource
      // can otherwise merge its default object-id ordering, which is invalid
      // for PostgreSQL/SDE DISTINCT queries.
      orderByFields: [fieldName],
      pageSize: 1000,
      returnDistinctValues: true,
    };

    const queryResult = await dataSource.query(q);

    if (!queryResult || !queryResult.records) {
      return [];
    }

    const values = queryResult.records
      .map((record) => record.getData()?.[fieldName])
      .filter((value) => value != null && value !== "");

    return [...new Set(values)].sort();
  } catch (error) {

    return [];
  }
};

export const fetchData = async (host: GraffWidgetHost, opts?: { preservePage?: boolean }) => {
  if (!host._isMounted) return;
  if (host.state.connectionStatus !== "connected") {
    host._hasCompletedTableFetch = true;
    if (host.state.loading) host.setState({ loading: false });
    return;
  }
  // Table fetches only apply while the table view is active.
  if (host.state.viewMode !== "table") {
    if (host.state.loading) host.setState({ loading: false });
    return;
  }

  const preservePage = !!opts?.preservePage;
  const requestId = ++host._tableDataRequestId;
  const isStale = () =>
    !host._isMounted ||
    requestId !== host._tableDataRequestId ||
    host.state.viewMode !== "table";

  const configuredFields = host.getConfiguredFilterFields();
  if (configuredFields.length === 0) {
    host._hasCompletedTableFetch = true;
    host.setState({
      error:
        "Майдонлар танланмаган. Виджет созламаларида майдонларни танланг.",
      loading: false,
    });
    return;
  }

  // Default mode: do not fetch only when yil is missing — unless an active
  // farmer/ИНН search is driving the query, in which case results should
  // be found across all years so the list can show matching variants
  // before the user has narrowed anything down by year.
  const { yil, vh } = host.state.regionalFilters;
  const { searchText: activeSearchText, isSearchActive: hasSearchActive } =
    host.state;
  const hasActiveSearch =
    hasSearchActive && Boolean(activeSearchText?.trim());
  if (!yil && !hasActiveSearch) {
    host._hasCompletedTableFetch = false;
    await host.applyMapFilters();
    if (isStale()) return;

    host.setState({
      loading: false,
      error: null,
      records: [],
      currentPage: 1,
      totalRecordCount: 0,
    });

    return;
  }

  // VH join ids still resolving from Localization — keep spinner; do not
  // query with 1=0 (looks like "empty") or unscoped geography.
  if (String(vh || "").trim() && !Array.isArray(host.state.vhUniqueids)) {
    host._hasCompletedTableFetch = false;
    host.setState({
      loading: true,
      error: null,
      records: [],
    });
    return;
  }

  const page = preservePage
    ? Math.max(1, Number(host.state.currentPage) || 1)
    : 1;

  // Show loader immediately so UI never flashes "no data" during query.
  host._hasCompletedTableFetch = false;
  host.setState({
    loading: true,
    error: null,
    records: [],
    currentPage: page,
  });

  try {
    const { featureLayer } = host.state;
    if (!featureLayer) {
      if (isStale()) return;
      host._hasCompletedTableFetch = true;
      host.setState({
        loading: false,
        error: "Қатлам мавжуд эмас (AgriGraff4 featureLayer).",
      });
      return;
    }

    const whereClause = host.buildWhereClause();

    // Shared Agri_table layer: Localization may briefly leave a stale
    // definitionExpression (e.g. previous district= SOATO). Set DE first so
    // queryFeatures does not AND with a wrong geography filter.
    if (!isMapImageOwnedLayer(featureLayer)) {
      try {
        (featureLayer as any).definitionExpression = whereClause;
      } catch {
        /* non-fatal */
      }
    }

    const displayFields = host.getDisplayFields();
    const statusField = host.getStatusFieldNameForCurrentDate();
    const oidField = featureLayer.objectIdField || "objectid";
    const outFields = Array.from(
      new Set([
        ...configuredFields,
        ...displayFields,
        oidField,
        ...(statusField ? [statusField] : []),
      ]),
    );

    let totalCount = 0;
    try {
      const countQuery = featureLayer.createQuery();
      countQuery.where = whereClause;
      totalCount = Number(await featureLayer.queryFeatureCount(countQuery)) || 0;
    } catch {
      totalCount = 0;
    }
    if (isStale()) return;

    const totalPages = Math.max(1, Math.ceil(totalCount / host.RECORDS_PER_PAGE) || 1);
    const safePage = Math.min(page, totalPages);

    const q = featureLayer.createQuery();
    q.where = whereClause;
    q.outFields = outFields;
    q.returnGeometry = false;
    q.orderByFields = host.getTableOrderByFields();
    q.num = host.RECORDS_PER_PAGE;
    q.start = (safePage - 1) * host.RECORDS_PER_PAGE;

    const queryResult = await featureLayer.queryFeatures(q);
    if (isStale()) return;

    const features = queryResult?.features ?? [];
    let records: RecordData[] = features.map((ft) => {
      const a: any = ft.attributes || {};
      // Keep compatibility with existing code expecting `record.objectid`.
      return { ...a, objectid: a?.[oidField] ?? a?.objectid };
    });

    // Safety net: never display another district's rows under a named
    // tuman selection (stale DE / SOATO race).
    const selectedTuman = String(host.state.regionalFilters?.tuman || "").trim();
    if (selectedTuman && !/^\d+$/.test(host.normalizeApos(selectedTuman))) {
      const want = host.makeRegionDistrictKey(selectedTuman);
      const wantBase = want.replace(/\s+tumani$/i, "").trim();
      const before = records.length;
      records = records.filter((row) => {
        const got = host.makeRegionDistrictKey(
          String((row as any).tuman || ""),
        );
        if (!got) return true;
        const gotBase = got.replace(/\s+tumani$/i, "").trim();
        return (
          got === want ||
          gotBase === wantBase ||
          got === wantBase ||
          gotBase === want
        );
      });
      if (records.length !== before) {
        graffLog("fetchData:dropped-mismatched-tuman-rows", {
          selectedTuman,
          before,
          after: records.length,
          whereSample: whereClause.slice(0, 240),
        });
      }
    }

    host._hasCompletedTableFetch = true;
    graffLog("fetchData:result", {
      viloyat: host.state.regionalFilters?.viloyat || "",
      tuman: host.state.regionalFilters?.tuman || "",
      yil: host.state.regionalFilters?.yil || "",
      whereSample: whereClause.slice(0, 280),
      totalCount,
      page: safePage,
      rowCount: records.length,
      sampleTumans: records
        .slice(0, 5)
        .map((r) => String((r as any).tuman || "")),
      sampleUniqueids: records
        .slice(0, 3)
        .map((r) => String((r as any).uniqueid || "")),
    });
    host.setState(
      {
        records,
        loading: false,
        error: null,
        currentPage: safePage,
        totalRecordCount: totalCount,
      },
      () => {
        /* Only pending scroll (map/search/initial pick) may jump pages.
           Lasting selecteduniqueid must NOT force page back — otherwise
           pagination after table selection always snaps to the selected row. */
        const pending = String(host._pendingScrollUniqueid || "").trim();
        if (!pending) return;
        if (
          host.state.records.some((record) =>
            host.recordMatchesUniqueid(record, pending),
          )
        ) {
          host.scheduleScrollSelectedRowIntoCenter();
          host._pendingScrollUniqueid = null;
          return;
        }
        void host.ensureSelectedRowVisible(pending);
      },
    );
  } catch (error: any) {
    if (isStale()) return;

    host._hasCompletedTableFetch = true;
    host.setState({
      error: error.message || "Күтүлмаган хатолик юз берди",
      loading: false,
    });
  }
};

// ✅ Apply WHERE to both FeatureLayer and DataSource
export async function applyMapFilters(host: GraffWidgetHost): Promise<void> {
  const { featureLayer, dataSource, spatialClickLayers } = host.state;
  if (!featureLayer && !dataSource) return;

  const vhPending =
    !!String(host.state.regionalFilters?.vh || "").trim() &&
    !Array.isArray(host.state.vhUniqueids);
  if (vhPending) return;

  const where = host.buildWhereClause();

  try {
    // Keep layer definitionExpression consistent with the resolved (selected) viloyat layer.
    // NEVER for MapImage-owned sublayers: their tuman/turi definitionExpression is
    // owned by AgriLocalization's syncRegionYearLayerVisibility — overwriting it
    // forces a fresh export that briefly paints every district's fields.
    if (featureLayer && !isMapImageOwnedLayer(featureLayer)) {
      (featureLayer as any).definitionExpression = where;
    }

    (dataSource as any)?.setDefinitionExpression?.(where);
  } catch (e) {
    // non-fatal
  }

  // Agri_table_data has no geometry — mirror the same filter onto the
  // spatial polygon layer(s) actually rendered on the map, joined by uniqueid.
  //
  // Republic-wide (no viloyat picked yet) is excluded here on purpose:
  // queryAgriUniqueIdsForWhere pages through every matching row (up to 200
  // pages of 2000) to build the mirror IN-clause, and a bare "yil LIKE ..."
  // WHERE with no region scope can match the entire dataset for that year —
  // hundreds of sequential requests fired the moment the widget mounts,
  // which is exactly what was locking up the page on load. Matches the
  // same guard AgriLocalization already applies via buildWhereForLayer().
  if (spatialClickLayers?.length && host.state.regionalFilters.viloyat) {
    try {
      const spatialWhere =
        where === "" || where === "1=1"
          ? "1=1"
          : where === "1=0"
            ? "1=0"
            : buildSpatialJoinWhere(await queryAgriUniqueIdsForWhere(where));
      spatialClickLayers.forEach((sl) => {
        // Region-year MapImage sublayers are owned by AgriLocalization's
        // syncRegionYearLayerVisibility (tuman/turi text DE). A uniqueid
        // IN (...) rewrite blows past MapServer layerDefs length and
        // shows every district again on the next export / field click.
        if (isMapImageOwnedLayer(sl)) return;
        if (sl.definitionExpression !== spatialWhere) {
          sl.definitionExpression = spatialWhere;
        }
      });
    } catch {
      /* map visual sync is best-effort; data-side filtering is unaffected */
    }
  }
}

export const handleFilterChange = async (host: GraffWidgetHost, field: string, value: string) => {
  if (!host._isMounted || host.state.connectionStatus !== "connected") return;

  host.setState(
    (prevState) => ({
      localFilters: {
        ...prevState.localFilters,
        [field]: value,
      },
      loading: true,
    }),
    () => {
      host.throttledFetchData();
    },
  );
};

export const handleResetFilters = async (host: GraffWidgetHost) => {
  if (!host._isMounted || host.state.connectionStatus !== "connected") return;

  const fields = host.getConfiguredFilterFields();
  const blank = fields.reduce(
    (acc, f) => {
      acc[f] = "";
      return acc;
    },
    {} as Record<string, string>,
  );

  // ✅ include vh
  const blankRegional = {
    viloyat: "",
    tuman: "",
    yil: "",
    uzspace: "",
    vh: "",
  };

  host._allowClearOnce = true;

  host.setState(
    {
      localFilters: blank,
      externalFilters: blank,
      regionalFilters: blankRegional,
      vhUniqueids: null,
      loading: true,
      records: [],
      currentPage: 1,
      isProcessingExternalUpdate: false,
    },
    () => {
      host.applyMapFilters();
      host.throttledFetchData();
    },
  );
};

export function filtersChanged(host: GraffWidgetHost, a: AgriGraffWidgetState["regionalFilters"], b: AgriGraffWidgetState["regionalFilters"]) {
  return graffRegionalFiltersChanged(a, b);
}

export const handleGeoFilterChanged = (host: GraffWidgetHost, event: CustomEvent) => {
  if (!host._isMounted) return;
  const d = event?.detail || {};
  if (d.source !== "GeoFilter") return;

  const next = {
    viloyat: host.normalizeApos(d.viloyat ?? d.massivNom ?? ""),
    tuman: host.normalizeApos(d.tuman ?? d.tumanNomi ?? ""),
    yil: d.yil != null ? String(d.yil) : d.year != null ? String(d.year) : "",
    uzspace: host.normalizeApos(d.uzspace ?? d.category ?? ""),
    vh: host.normalizeApos(d.vh ?? ""), // ✅ accept vh if provided
  };

  if (host.filtersChanged(host.state.regionalFilters, next)) {
    const returningToRepublic =
      !String(next.viloyat || "").trim() &&
      !!String(host.state.regionalFilters.viloyat || "").trim();
    host.setState(
      {
        regionalFilters: next,
        vhUniqueids: null, // GeoFilter has no VH id list — table waits pending while vh set
        selectedIndices: returningToRepublic
          ? (["ndvi"] as VegetationIndiceType[])
          : host.state.selectedIndices,
        records: [],
        currentPage: 1,
        loading: true,
      },
      () => {
        host.throttledFetchData();
      },
    );
  }
};

export const handleResetAll = (host: GraffWidgetHost) => {
  const cleared = { viloyat: "", tuman: "", yil: "", uzspace: "", vh: "" };
  if (host.filtersChanged(host.state.regionalFilters, cleared)) {
    const hadViloyat = !!String(host.state.regionalFilters.viloyat || "").trim();
    host.setState(
      {
        regionalFilters: cleared,
        vhUniqueids: null,
        selectedIndices: hadViloyat
          ? (["ndvi"] as VegetationIndiceType[])
          : host.state.selectedIndices,
      },
      host.refetchDebounced,
    );
  }
};

export const refetchDebounced = (host: GraffWidgetHost) => {
  if (host._debounceTimer) clearTimeout(host._debounceTimer);
  host._debounceTimer = setTimeout(() => host.refetchNow(), 150);
};

export const refetchNow = (host: GraffWidgetHost) => {
  if (!host._isMounted || host.state.connectionStatus !== "connected") return;
  host.setState({ loading: true }, () => {
    host.fetchData();
  });
};

export function buildApiUrlWithFilters(host: GraffWidgetHost, baseUrl: string): string {
  const p = new URLSearchParams();
  const { regionalFilters } = host.state;

  if (regionalFilters.viloyat) p.set("viloyat", regionalFilters.viloyat);
  if (regionalFilters.tuman) p.set("tuman", regionalFilters.tuman);
  if (regionalFilters.yil) p.set("yil", regionalFilters.yil);
  if (regionalFilters.uzspace) p.set("uzspace", regionalFilters.uzspace);
  if (regionalFilters.vh) p.set("vh", regionalFilters.vh); // ✅

  const qs = p.toString();
  return qs ? `${baseUrl}?${qs}` : baseUrl;
}

/** ✅ Category field resolver (prefer "turi" first) */
export function getCategoryFieldName(host: GraffWidgetHost): string | null {
  const fl = host.state.featureLayer;
  if (!fl || !fl.fields) return null;

  const candidates = [
    "turi", // ✅ prefer this
    "tur",
    "toifa",
    "yer_toifa",
    "yertoifa",
    "uzspace",
    "land_category",
    "land_type",
    "category",
    "type",
    "class",
  ];

  const lower = fl.fields.map((f) => f.name.toLowerCase());
  for (const c of candidates) {
    const i = lower.indexOf(c.toLowerCase());
    if (i !== -1) return fl.fields[i].name;
  }
  return null;
}

/** ✅ VH field resolver */
export function getVhFieldName(host: GraffWidgetHost): string | null {
  const fl = host.state.featureLayer;
  if (!fl || !fl.fields) return null;

  const candidates = ["vh", "VH", "Vh"];

  const lower = fl.fields.map((f) => f.name.toLowerCase());
  for (const c of candidates) {
    const i = lower.indexOf(c.toLowerCase());
    if (i !== -1) return fl.fields[i].name;
  }
  return null;
}

/** Polygon join field for VH uniqueid IN (...) clause (e.g. uniqueid); must match AgriFilter polygonJoinField */
export function getPolygonJoinFieldName(host: GraffWidgetHost): string {
  const fl = host.state.featureLayer;
  if (!fl?.fields?.length) return "uniqueid";
  const lower = fl.fields.map((f) => f.name.toLowerCase());
  const idx = lower.indexOf("uniqueid");
  return idx !== -1 ? fl.fields[idx].name : "uniqueid";
}
