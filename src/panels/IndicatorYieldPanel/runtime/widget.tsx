// Average Yield Indicator — standalone widget, independent of AgriIndicator10.
// Shows avg(yld) from Agri_table_data, scoped by the same master yil/viloyat/tuman filters.

import { getAgriTableDataLayer } from "../../../gis/agri-table-data-source";
import { eqAposSmart } from "../../../data/agri-sql";
import { buildIndicatorStatsWhere } from "../../../controller/agri-where-builder";
import { queryIndicatorOutStatNullable } from "../../../data/agri-indicator-stats";
import { normalizeTurlarListSql } from "../../../data/agri-turlar";
import type { AgriLabel } from "../../../shared/agri-i18n";
import { IndicatorStatBase } from "../../indicator-stat/IndicatorStatBase";

const LABEL: AgriLabel = {
  en: "Average yield",
  ru: "Средняя урожайность",
  uz_lat: "O'rtacha hosildorlik",
  uz_cyr: "Ўртача ҳосилдорлик",
};

export default class AgriIndicatorYield extends IndicatorStatBase {
  protected readonly label = LABEL;

  protected loadLayer(): Promise<{ layer: unknown }> {
    return getAgriTableDataLayer();
  }

  protected normalizeTurlar(raw: unknown, fallback = ""): string[] {
    return normalizeTurlarListSql(raw, fallback);
  }

  private buildWhere(): string {
    const { yil, viloyat, tuman, turlar, uniqueid, lockedViloyat } = this.state;
    if (!yil) return "1=0";

    let where = buildIndicatorStatsWhere(
      {
        yil,
        viloyat: lockedViloyat || viloyat || "",
        tuman: tuman || "",
        turlar: turlar || [],
      },
      { includeViloyat: true },
    );

    if (uniqueid) {
      where = `(${where}) AND (${eqAposSmart("uniqueid", uniqueid)})`;
    }

    return where;
  }

  protected async fetchValue(): Promise<void> {
    const { layer, connectionStatus, yil } = this.state;
    if (!layer || connectionStatus !== "connected") return;

    if (!yil) {
      this.setState({ value: null, loading: true, error: null });
      return;
    }

    const requestId = ++this._requestId;
    // Keep previous value visible while refreshing — no spinner flash.
    this.setState({ error: null });

    try {
      const where = this.buildWhere();

      // Only show blocking loader when we have nothing to display yet.
      if (this.state.value == null) {
        this.setState({ loading: true });
      }

      const raw = await queryIndicatorOutStatNullable({
        layer,
        where,
        statisticType: "avg",
        onStatisticField: "yld",
      });
      if (!this._isMounted || requestId !== this._requestId) return;

      this.setState({
        value: raw != null && Number.isFinite(raw) ? raw : null,
        loading: false,
        error: null,
      });
    } catch {
      if (!this._isMounted || requestId !== this._requestId) return;
      // Soft-empty on query failure — never flash a warning on first paint.
      this.setState({ loading: false, value: null, error: null });
    }
  }
}
