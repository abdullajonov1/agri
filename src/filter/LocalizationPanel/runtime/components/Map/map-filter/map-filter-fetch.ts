import type { LocalizationHost } from "../../host";
import { dedupedQueryFeatureCount } from "../../../../../../data/agri-query-gateway";
import { debugCatch, agriLog } from "../../localization-log";

export const fetchDataWithCurrentState = async (host: LocalizationHost) => {
  if (!host._isMounted || host.state.connectionStatus !== "connected") return;
  const requestId = ++host._filterDataRequestId;
  const isCurrent = () => host._isMounted && requestId === host._filterDataRequestId;
  try {
    host.setState({ loading: true, error: null });

    const { featureLayers } = host.state;
    const layers = featureLayers?.length
      ? featureLayers
      : host.state.featureLayer
        ? [host.state.featureLayer]
        : [];
    if (!layers.length) {
      host.setState({ loading: false, error: "No feature layer available" });
      return;
    }

    const vhSelected = !!String(host.state.vh || "").trim();
    if (vhSelected && !Array.isArray(host._vhMapUniqueIds)) {
      if (isCurrent()) {
        host.setState({ loading: false });
      }
      return;
    }

    // Also ask the service for the true total count with this WHERE, independent of page limits.
    const includeVh = vhSelected && Array.isArray(host._vhMapUniqueIds);
    const perLayerCounts = await Promise.all(
      layers.map(async (featureLayer) => {
        const whereClause = host.buildWhereForLayer(featureLayer, includeVh);
        if (!whereClause || whereClause === "1=0") return 0;
        try {
          return await dedupedQueryFeatureCount(featureLayer, whereClause);
        } catch (err) {
          debugCatch("fetchData:count-failed", err);
          return 0;
        }
      }),
    );

    if (!isCurrent()) return;

    let totalCountFromService = perLayerCounts.reduce(
      (sum, value) => sum + value,
      0,
    );

    // DEBUG: log polygon counts for current yil / viloyat / tuman / turi selection
    const { yil, viloyat, tuman, turi } = host.state;
    const activeLayers = layers
      .filter((fl) => (fl.definitionExpression || "1=0") !== "1=0")
      .map((fl) =>
        ((fl as any)?.title || (fl as any)?.id || "layer").toString(),
      );

    agriLog("fetchDataWithCurrentState:count-complete", {
      requestId,
      totalCount: totalCountFromService,
      yil,
      viloyat,
      tuman,
    });
    const hasScopedFilter =
      !!String(host.getEffectiveViloyat() || "").trim() ||
      !!String(tuman || "").trim() ||
      !!String(turi || "").trim() ||
      host.getSelectedTurlar().length > 0 ||
      !!String(host.state.vh || "").trim();
    if (vhSelected) {
      const vhMapEmpty =
        Array.isArray(host._vhMapUniqueIds) &&
        host._vhMapUniqueIds.length === 0;
      host.setMapNoData(vhMapEmpty, "vegetation");
    } else {
      host.setMapNoData(
        hasScopedFilter && totalCountFromService === 0,
        "data",
      );
    }
    host.setState({
      records: [],
      totalRecordCount: totalCountFromService,
      loading: false,
      error: null,
    });
  } catch (e: any) {
    if (!isCurrent()) return;
    host.setState({
      error: e?.message || "Unexpected error",
      loading: false,
    });
  }
};
