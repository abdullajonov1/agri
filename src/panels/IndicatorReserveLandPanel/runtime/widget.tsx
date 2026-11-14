// Reserve Land Indicator — standalone widget, independent of AgriIndicator10.
// Shows sum(maydon) from the current reserve-land inventory.
// All reserve-layer-compatible dashboard filters apply.

import { getAgriReserveLandLayer } from "../../../gis/agri-reserve-land-data-source";
import { withAgriAccessWhere } from "../../../gis/feature-layer-data";
import {
  escapeArcGIS,
  escapeLikeLiteral,
  eqAposSmart,
  normalizeApos,
} from "../../../data/agri-sql";
import { getTuriCropLookupKey } from "../../../shared/agri-crop-labels";
import { queryIndicatorOutStat } from "../../../data/agri-indicator-stats";
import { asStatisticDefinitions } from "../../../shared/agri-plain-object";
import type { AgriLabel } from "../../../shared/agri-i18n";
import { IndicatorStatBase } from "../../indicator-stat/IndicatorStatBase";

const LABEL: AgriLabel = {
  en: "Reserve land",
  ru: "Резервные земли",
  uz_lat: "Zaxira maydonlari",
  uz_cyr: "Захира майдонлари",
};
const UNIT: AgriLabel = { en: "ha", ru: "га", uz_lat: "ga", uz_cyr: "га" };
const YEAR_PATTERN = /\b(18|19|20)\d{2}\b/;

export default class AgriIndicatorReserveLand extends IndicatorStatBase {
  protected readonly label = LABEL;
  protected readonly unit = UNIT;
  // Do not query until the master filter (incl. yil) has been received once;
  // otherwise the unscoped sum flashes, then drops to 0 when an empty year arrives.
  protected readonly requiresMasterFilter = true;

  private _cropIdMapPromise: Promise<Map<string, string[]>> | null = null;

  protected loadLayer(): Promise<{ layer: unknown }> {
    return getAgriReserveLandLayer();
  }

  protected isYearKnown(): boolean {
    return YEAR_PATTERN.test(String(this.state.yil || ""));
  }

  protected normalizeTurlar(raw: unknown, fallback = ""): string[] {
    const values = Array.isArray(raw) ? raw : fallback ? [fallback] : [];
    return Array.from(
      new Set(
        values
          .map((value) => normalizeApos(String(value || "").trim()))
          .filter(Boolean),
      ),
    );
  }

  private readonly buildStringInClause = (field: string, values: string[]): string => {
    const normalized = Array.from(
      new Set(values.map((value) => String(value || "").trim()).filter(Boolean)),
    );
    if (!normalized.length) return "";
    if (normalized.length === 1) return eqAposSmart(field, normalized[0]);
    return `${field} IN (${normalized
      .map((value) => `'${escapeArcGIS(value)}'`)
      .join(",")})`;
  };

  private readonly extractYear = (raw: unknown): string =>
    String(raw ?? "").match(/\b(18|19|20)\d{2}\b/)?.[0] ??
    String(raw ?? "").replace(/[^\d]/g, "");

  private readonly makeCropKey = (raw: unknown): string =>
    getTuriCropLookupKey(raw);

  private readonly getCropIdMap = async (
    layer: __esri.FeatureLayer,
  ): Promise<Map<string, string[]>> => {
    if (!this._cropIdMapPromise) {
      this._cropIdMapPromise = (async () => {
        try {
          const q = layer.createQuery();
          q.where = "1=1";
          q.groupByFieldsForStatistics = ["turi", "crop_id"];
          q.outStatistics = asStatisticDefinitions([
            {
              statisticType: "count",
              onStatisticField: layer.objectIdField || "objectid",
              outStatisticFieldName: "cnt",
            },
          ]);
          q.returnGeometry = false;
          const response = await layer.queryFeatures(q);
          const rows = (response?.features || []).map((feature: __esri.Graphic) => ({
            turi: String(feature?.attributes?.turi || "").trim(),
            cropId: String(feature?.attributes?.crop_id || "").trim(),
          }));
          const idsByTuri = new Map<string, Set<string>>();
          for (const row of rows) {
            const key = this.makeCropKey(row.turi);
            const cropId = String(row.cropId || "").trim();
            if (!key || !cropId) continue;
            let ids = idsByTuri.get(key);
            if (!ids) {
              ids = new Set<string>();
              idsByTuri.set(key, ids);
            }
            ids.add(cropId);
          }
          const result = new Map<string, string[]>();
          idsByTuri.forEach((ids, key) => result.set(key, Array.from(ids)));
          return result;
        } catch {
          return new Map<string, string[]>();
        }
      })();
    }
    return this._cropIdMapPromise;
  };

  private readonly resolveCropIds = (
    turlar: string[],
    cropIdMap: Map<string, string[]>,
  ): string[] =>
    Array.from(
      new Set(
        turlar.flatMap(
          (turi) => cropIdMap.get(this.makeCropKey(turi)) || [],
        ),
      ),
    );

  private buildWhere(
    cropIds: string[],
    cropFilterRequested: boolean,
  ): string {
    const { yil, viloyat, tuman, uniqueid, lockedViloyat } = this.state;
    const clauses: string[] = [];

    const year = this.extractYear(yil);
    if (!year) return withAgriAccessWhere("1=0");
    clauses.push(`yil LIKE '${escapeLikeLiteral(year)}%'`);

    const effectiveViloyat = lockedViloyat || viloyat;
    if (effectiveViloyat) {
      clauses.push(eqAposSmart("viloyat", effectiveViloyat));
    }
    if (tuman) clauses.push(eqAposSmart("tuman", tuman));

    if (cropFilterRequested) {
      const cropIdClause = this.buildStringInClause("crop_id", cropIds);
      clauses.push(cropIdClause || "1=0");
    }

    if (uniqueid) clauses.push(eqAposSmart("uniqueid", uniqueid));

    return withAgriAccessWhere(clauses.join(" AND "));
  }

  protected async fetchValue(): Promise<void> {
    const { layer, connectionStatus, yil } = this.state;
    if (!layer || connectionStatus !== "connected") return;
    if (!this._hasMasterFilter) return;

    // Match Yield/Unused — never query the full table with an empty year.
    if (!String(yil || "").match(/\b(18|19|20)\d{2}\b/)) {
      this.setState({ value: null, loading: true, error: null });
      return;
    }

    const requestId = ++this._requestId;
    this.setState({ error: null, loading: true });

    try {
      const cropIdMap = await this.getCropIdMap(layer);
      if (!this._isMounted || requestId !== this._requestId) return;
      const cropIds = this.resolveCropIds(this.state.turlar, cropIdMap);
      const cropFilterRequested = this.state.turlar.length > 0;
      const where = this.buildWhere(cropIds, cropFilterRequested);

      // Reserve card treats missing aggregate as 0 ha (not "-").
      const raw = await queryIndicatorOutStat({
        layer,
        where,
        statisticType: "sum",
        onStatisticField: "maydon",
      });
      if (!this._isMounted || requestId !== this._requestId) return;

      this.setState({
        value: Number.isFinite(raw) ? raw : 0,
        loading: false,
        error: null,
      });
    } catch {
      if (!this._isMounted || requestId !== this._requestId) return;
      this.setState({ loading: false, value: null, error: null });
    }
  }
}
