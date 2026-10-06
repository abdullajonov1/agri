import type { IndicatorWidgetHost } from "../../indicator-host";
import { FILTER_FIELDS } from "../../indicator-constants";
import { formatIndicatorStatValue, canConsumeIndicatorDashboardPack } from "../../../../../data/agri-dashboard-pack-apply";
import { waitForDashboardPackReady, getDashboardPack } from "../../../../../store/agri-dashboard-store";
import { matchIndicatorDashboardPack } from "../../../../../data/agri-dashboard-pack-match";
import { queryIndicatorOutStatNullable } from "../../../../../data/agri-indicator-stats";
import { agriVhIndicatorLog } from "../../../../../gis/agri-debug-log";
import { canonicalIndicatorApiPlaces } from "./indicator-api-places";
import { requestIndicatorApiValue } from "./indicator-api-client";
import { isAbortError } from "../../../../../shared/agri-http";

const vhWhereSummary = (where: string) => ({
  whereLength: where.length,
  whereHead: where.slice(0, 220),
  inLiteralCount: (where.match(/'[^']*'/g) || []).length,
});

export const fetchApiData = async (host: IndicatorWidgetHost) => {
  if (!host._isMounted) return;
  if (!host.shouldFetchForViloyat()) {
    host.setState({
      loading: true,
      error: null,
      vegetationArea: null,
      totalArea: null,
      featureCount: 0,
    });
    return;
  }

  const requestId = ++host._requestId;
  let controller: AbortController | null = null;

  try {
    if (host._abortController) host._abortController.abort();
    controller = new AbortController();
    host._abortController = controller;
    const signal = controller.signal;

    host.setState({
      loading: host.state.vegetationArea == null,
      error: null,
    });

    const {
      selectedYil,
      selectedViloyat,
      selectedTuman,
      selectedYerToifas,
      selectedCropType,
    } = host.state;

    const endpoint = host.buildApiUrl();

    const baseParams = new URLSearchParams();
    if (selectedYil) baseParams.set("yil", selectedYil);
    if (selectedCropType)
      baseParams.set(
        "ekin_turi",
        host.normalizeUzbekForApi(selectedCropType),
      );
    // Vegetatsiya Holati (AgriBar) never filters this indicator — no
    // "vh" query param is sent regardless of the current bar selection.

    // ✅ CHANGED: API param default now 'turi'
    const ytfParamName = (
      host.props.config?.yerToifasParam || FILTER_FIELDS.TURI
    ).trim();
    if (selectedYerToifas)
      baseParams.set(
        ytfParamName,
        host.normalizeUzbekForApi(selectedYerToifas),
      );

    // One request. The selected filter label is the API place name.
    const place = canonicalIndicatorApiPlaces(selectedViloyat, selectedTuman);
    const qp = new URLSearchParams(baseParams.toString());
    if (place.tuman) qp.set("tuman", place.tuman);
    if (place.viloyat) qp.set("viloyat", place.viloyat);

    const url = `${endpoint}?${qp.toString()}`;

    // apiKey / useAuthentication were never declared on IMConfig — the
    // Bearer branch was unreachable schema drift. Do not resurrect a
    // browser-delivered secret here.
    const value = await requestIndicatorApiValue(
      url,
      signal,
      host.props.config?.responseField || "",
    );
    if (!host._isMounted || requestId !== host._requestId) return;

    const finalValue = value ?? 0;

    const rounded = formatIndicatorStatValue(
      finalValue,
      host.props.config?.decimalPlaces || 0,
    );

    if (!host._isMounted || requestId !== host._requestId) return;

    host.setState({
      vegetationArea: rounded,
      totalArea: rounded,
      loading: false,
      lastUpdate: new Date(),
      error: null,
    });
  } catch (err: unknown) {
    if (isAbortError(err)) return;
    if (!host._isMounted || requestId !== host._requestId) return;

    host.setState({
      error: (err instanceof Error && err.message) || "Failed to fetch data from API",
      loading: false,
    });
  } finally {
    // A late, superseded request must not drop the newer request's controller.
    if (host._abortController === controller) host._abortController = null;
  }
};
export const fetchData = async (host: IndicatorWidgetHost, _forceRefresh?: boolean) => {
  if (host.props.config?.useApiDataSource) return host.fetchApiData();

  if (!host.shouldFetchForViloyat()) {
    // Year not published yet — stay in loading, never paint "0"/"-".
    host.setState({
      loading: true,
      error: null,
      vegetationArea: null,
      totalArea: null,
      featureCount: 0,
    });
    return;
  }

  const vhActive = !!String(host.state.selectedVegetationStatus || "").trim();
  if (vhActive && !Array.isArray(host.state.vhUniqueids)) {
    agriVhIndicatorLog("3-kutish-id-yoq", {
      widgetId: host.props?.id,
      vh: host.state.selectedVegetationStatus,
    });
    host.setState({ loading: true, error: null });
    return;
  }

  if (host.props.config?.groupByField) {
    if (vhActive) {
      agriVhIndicatorLog("3-grouped-stats-yoli", { widgetId: host.props?.id });
    }
    return host.fetchGroupedStats();
  }

  if (host.state.connectionStatus !== "connected") {
    if (vhActive) {
      agriVhIndicatorLog("3-ulanmagan", {
        widgetId: host.props?.id,
        connectionStatus: host.state.connectionStatus,
      });
    }
    return;
  }

  const requestId = ++host._requestId;
  let controller: AbortController | null = null;

  try {
    if (host._abortController) host._abortController.abort();
    controller = new AbortController();
    host._abortController = controller;

    host.setState({
      loading: host.state.vegetationArea == null,
      error: null,
    });

    const fl = host._canonicalFeatureLayer || host.state.featureLayer;
    if (!fl) {
      host.setState({ loading: false, error: "No feature layer available" });
      return;
    }
    const oidField = fl.objectIdField || "objectid";

    const op = (host.props.config?.statOperation || "count") as
      | "count"
      | "sum"
      | "avg"
      | "min"
      | "max"
      | "first";
    const field = (host.props.config?.attributeField || "").trim();

    let where = host.buildWhereClause();

    if (host.props.config?.excludeZeroValues && field) {
      where += ` AND ${host.nz(field)}`;
    }

    if (vhActive) {
      agriVhIndicatorLog("3-sorov-tayyor", {
        widgetId: host.props?.id,
        vh: host.state.selectedVegetationStatus,
        op,
        field,
        layerUrl: fl?.url,
        vhUniqueidsCount: host.state.vhUniqueids?.length ?? null,
        joinExpandedCount: host._vhJoinExpanded?.length ?? null,
        joinUsesExpanded:
          host._vhJoinSource === host.state.vhUniqueids &&
          !!host._vhJoinExpanded,
        ...vhWhereSummary(where),
      });
    }

    // Shared DashboardPack hit — default sum(maydon), no VH / uniqueid.
    if (
      canConsumeIndicatorDashboardPack({
        op,
        field,
        selectedVegetationStatus: host.state.selectedVegetationStatus,
        selectedUniqueid: host.state.selectedUniqueid,
      })
    ) {
      await waitForDashboardPackReady(2500);
      if (!host._isMounted || requestId !== host._requestId) return;
      const indicatorPack = matchIndicatorDashboardPack(getDashboardPack(), {
        where,
        hasVh: false,
        attributeField: "maydon",
      });
      if (indicatorPack) {
        const totalVal = formatIndicatorStatValue(
          indicatorPack.value,
          host.props.config?.decimalPlaces || 0,
        );
        if (!host._isMounted || requestId !== host._requestId) return;
        host.setState({
          vegetationArea: totalVal,
          totalArea: totalVal,
          loading: false,
          lastUpdate: new Date(),
          error: null,
        });
        return;
      }
    }

    if (op === "first") {
      const q = fl.createQuery();
      q.where = where;
      q.outFields = [field];
      q.orderByFields = [`${field} ASC`];
      q.returnGeometry = false;
      q.num = 1;

      const res = await fl.queryFeatures(q);
      if (!host._isMounted || requestId !== host._requestId) return;
      const v = Number(res?.features?.[0]?.attributes?.[field] ?? 0);
      const val = formatIndicatorStatValue(
        v,
        host.props.config?.decimalPlaces || 0,
      );

      if (!host._isMounted || requestId !== host._requestId) return;

      host.setState({
        vegetationArea: val,
        totalArea: val,
        featureCount: res?.features?.length || 0,
        loading: false,
        lastUpdate: new Date(),
        error: null,
      });
      return;
    }

    const statMap: Record<
      "count" | "sum" | "avg" | "min" | "max",
      __esri.StatisticDefinition["statisticType"]
    > = {
      count: "count",
      sum: "sum",
      avg: "avg",
      min: "min",
      max: "max",
    };

    if (op !== "count" && !field) {
      host.setState({
        loading: false,
        error: "Select attribute field for this aggregation",
      });
      return;
    }

    const onField = op === "count" ? oidField : field;

    // In Agri3, overall "sum" should reflect totals across regional layers.
    // If regional layers exist, use them (excluding republic layer to avoid overlap).
    if (op === "sum") {
      const allLayers = (host.state.featureLayers || []).filter(Boolean);
      const selectedVil = (host.state.selectedViloyat || "").trim();
      const selectedTum = (host.state.selectedTuman || "").trim();

      let layersForSum: __esri.FeatureLayer[] = [];
      let whereForSum = where;

      if (selectedVil) {
        // Prefer a routed regional layer when multi-layer setups exist,
        // but always keep viloyat/tuman in WHERE — Agri_table_data is a
        // single table for all regions (legacy "drop viloyat predicate"
        // only worked with per-region layers).
        const routed =
          host.getFeatureLayerForViloyat(selectedVil, allLayers) || fl;
        layersForSum = [routed];
        whereForSum = host.buildWhereClause(true);
        if (host.props.config?.excludeZeroValues && field) {
          whereForSum += ` AND ${host.nz(field)}`;
        }
      } else {
        // Republic overview: Agri_table_data is one national table — summing
        // every non-republic layer duplicates the same FeatureServer query.
        const sameUrlAsCanonical = (layer: __esri.FeatureLayer) => {
          const a = String(layer?.url || "").replace(/\/+$/, "");
          const b = String(fl?.url || "").replace(/\/+$/, "");
          return !!a && !!b && a === b;
        };
        const nonRepublicLayers = allLayers.filter(
          (l) => !host.isRepublicLayer(l),
        );
        const distinctLayerUrls = new Set(
          nonRepublicLayers
            .map((l) => String(l?.url || "").replace(/\/+$/, ""))
            .filter(Boolean),
        );
        if (
          !nonRepublicLayers.length ||
          distinctLayerUrls.size <= 1 ||
          nonRepublicLayers.every(sameUrlAsCanonical)
        ) {
          layersForSum = [fl];
        } else {
          layersForSum = nonRepublicLayers;
        }
      }

      let totalRaw = 0;

      const layerResults: Array<Record<string, unknown>> = [];
      for (const layer of layersForSum) {
        const layerFields = (layer.fields || []).map((f) =>
          (f?.name || "").toLowerCase(),
        );
        if (!layerFields.includes(onField.toLowerCase())) {
          layerResults.push({
            url: layer?.url,
            skipped: `maydon yo'q: ${onField}`,
          });
          continue;
        }

        const t0 = Date.now();
        const rawLayer =
          (await queryIndicatorOutStatNullable({
            layer,
            where: whereForSum,
            statisticType: "sum",
            onStatisticField: onField,
          })) ?? null;
        if (!host._isMounted || requestId !== host._requestId) return;
        layerResults.push({
          url: layer?.url,
          raw: rawLayer,
          noRows: rawLayer == null,
          ms: Date.now() - t0,
        });
        totalRaw += Number(rawLayer) || 0;
      }

      if (vhActive) {
        agriVhIndicatorLog("4-natija-sum", {
          widgetId: host.props?.id,
          vh: host.state.selectedVegetationStatus,
          selectedViloyat: selectedVil,
          selectedTuman: selectedTum,
          layerCount: layersForSum.length,
          layerResults,
          totalRaw,
          ...vhWhereSummary(whereForSum),
        });
      }

      const totalVal = formatIndicatorStatValue(
        totalRaw,
        host.props.config?.decimalPlaces || 0,
      );

      if (!host._isMounted || requestId !== host._requestId) return;

      host.setState({
        vegetationArea: totalVal,
        totalArea: totalVal,
        loading: false,
        lastUpdate: new Date(),
        error: null,
      });
      return;
    }

    

    const q = fl.createQuery();
    q.where = where;
    q.outStatistics = [
      {
        onStatisticField: onField,
        statisticType: statMap[op],
        outStatisticFieldName: "agg",
      },
    ];
    q.returnGeometry = false;

    const stats = await fl.queryFeatures(q);
    if (!host._isMounted || requestId !== host._requestId) return;
    const raw = Number(stats?.features?.[0]?.attributes?.agg ?? 0);
    if (vhActive) {
      agriVhIndicatorLog("4-natija", {
        widgetId: host.props?.id,
        vh: host.state.selectedVegetationStatus,
        op,
        raw,
        featureCount: stats?.features?.length ?? 0,
        ...vhWhereSummary(where),
      });
    }
    const val = formatIndicatorStatValue(
      raw,
      host.props.config?.decimalPlaces || 0,
    );

    if (!host._isMounted || requestId !== host._requestId) return;

    host.setState({
      vegetationArea: val,
      totalArea: val,
      loading: false,
      lastUpdate: new Date(),
      error: null,
    });
  } catch (e) {
    const err = e as { name?: string; message?: string; details?: unknown } | null | undefined;
    if (vhActive) {
      agriVhIndicatorLog("4-XATO", {
        widgetId: host.props?.id,
        vh: host.state.selectedVegetationStatus,
        name: err?.name,
        message: String(err?.message || e),
        details: err?.details,
        stale: !host._isMounted || requestId !== host._requestId,
      });
    }
    if (err?.name === "AbortError") {
      if (!host._isMounted || requestId !== host._requestId) return;
      host.setState({ loading: false });
      return;
    }

    if (!host._isMounted || requestId !== host._requestId) return;
    host.setState({ loading: false, error: err?.message || "Query failed" });
  } finally {
    if (host._abortController === controller) host._abortController = null;
  }
};
