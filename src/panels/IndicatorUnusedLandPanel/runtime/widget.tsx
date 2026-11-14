// Unused Land Indicator — standalone widget, independent of AgriIndicator10.
// Shows sum(maydon) from Agri_unused_land, scoped by the same master yil/viloyat/tuman filters.

import { getAgriUnusedLandLayer } from "../../../gis/agri-unused-land-data-source";
import { buildTumanEqualsSql, eqAposSmart, normalizeApos } from "../../../data/agri-sql";
import {
  buildYearLikeClause,
  joinAndClauses,
} from "../../../controller/agri-where-builder";
import { buildTurlarSqlClause } from "../../../shared/agri-crop-labels";
import { combineAccessWhereIfFieldsExist } from "../../../shared/agri-access-config";
import { queryIndicatorOutStatNullable } from "../../../data/agri-indicator-stats";
import { normalizeTurlarListSql } from "../../../data/agri-turlar";
import type { AgriLabel } from "../../../shared/agri-i18n";
import { IndicatorStatBase } from "../../indicator-stat/IndicatorStatBase";

const LABEL: AgriLabel = {
  en: "Unused land",
  ru: "Неиспользуемые земли",
  uz_lat: "Foydalanilmagan yer",
  uz_cyr: "Фойдаланилмаган ер",
};
const UNIT: AgriLabel = { en: "ha", ru: "га", uz_lat: "ga", uz_cyr: "га" };

export default class AgriIndicatorUnusedLand extends IndicatorStatBase {
  protected readonly label = LABEL;
  protected readonly unit = UNIT;

  protected loadLayer(): Promise<{ layer: unknown }> {
    return getAgriUnusedLandLayer();
  }

  protected normalizeTurlar(raw: unknown, fallback = ""): string[] {
    return normalizeTurlarListSql(raw, fallback);
  }

  protected isLoaderSuppressed(): boolean {
    return this.schemaBlocksStats();
  }

  /** Exact schema field, matched case-insensitively. Null when the column is absent. */
  private layerField(name: string): { name: string; type: string } | null {
    const wanted = String(name || "").trim().toLowerCase();
    if (!wanted) return null;
    const fields: __esri.Field[] = Array.isArray(this.state.layer?.fields)
      ? this.state.layer.fields
      : [];
    for (const field of fields) {
      const fieldName = String(field?.name || "");
      if (fieldName.toLowerCase() === wanted) {
        return { name: fieldName, type: String(field?.type || "") };
      }
    }
    return null;
  }

  private yearStatField(): { name: string; type: string } | null {
    return this.layerField("yil") || this.layerField("year");
  }

  /**
   * No statistics request unless both the year column and maydon are on the
   * layer. Applies to every selected year (2026, 2027, …): the check is the
   * field name, not the year value.
   */
  private schemaBlocksStats(): boolean {
    if (this.state.connectionStatus !== "connected" || !this.state.layer) {
      return false;
    }
    return !this.yearStatField() || !this.layerField("maydon");
  }

  private yearClause(yearField: { name: string; type: string }, yil: string): string {
    const type = yearField.type.toLowerCase();
    const numeric =
      type === "small-integer" ||
      type === "integer" ||
      type === "single" ||
      type === "double" ||
      type === "long" ||
      type === "oid";
    const digits = String(yil || "").match(/\b(18|19|20)\d{2}\b/)?.[0] || "";
    if (numeric && digits) return `${yearField.name} = ${Number(digits)}`;
    return buildYearLikeClause(yil, { field: yearField.name });
  }

  private buildWhere(yearField: { name: string; type: string }): string | null {
    const { yil, viloyat, tuman, turlar, uniqueid, lockedViloyat } = this.state;
    const clauses: string[] = [];
    const yearSql = this.yearClause(yearField, yil);
    if (!yearSql) return null;
    clauses.push(yearSql);

    const viloyatField = this.layerField("viloyat");
    const effectiveViloyat = lockedViloyat || viloyat;
    if (effectiveViloyat && viloyatField) {
      const vilClause = eqAposSmart(viloyatField.name, effectiveViloyat);
      if (vilClause) clauses.push(vilClause);
    }

    const tumanRaw = String(tuman || "").trim();
    if (tumanRaw && /^\d+$/.test(normalizeApos(tumanRaw))) {
      const districtField = this.layerField("district");
      if (districtField) {
        clauses.push(
          `${districtField.name} = '${Number(normalizeApos(tumanRaw))}'`,
        );
      }
    } else if (tumanRaw) {
      const tumanField = this.layerField("tuman");
      if (tumanField) {
        const tumanClause = buildTumanEqualsSql(tumanField.name, tumanRaw);
        if (tumanClause && !/\bdistrict\b/i.test(tumanClause)) {
          clauses.push(tumanClause);
        }
      }
    }

    const turiField = this.layerField("turi");
    if (turiField && turlar.length) {
      const cropClause = buildTurlarSqlClause(turiField.name, turlar);
      if (cropClause) clauses.push(cropClause);
    }

    const uniqueField = this.layerField("uniqueid");
    if (uniqueid && uniqueField) {
      const idClause = eqAposSmart(uniqueField.name, uniqueid);
      if (idClause) clauses.push(idClause);
    }

    const fieldNames = (
      Array.isArray(this.state.layer?.fields)
        ? this.state.layer.fields
        : []
    ).map((field: __esri.Field) => String(field?.name || ""));
    return combineAccessWhereIfFieldsExist(joinAndClauses(clauses, "1=1"), fieldNames);
  }

  protected async fetchValue(): Promise<void> {
    const { layer, connectionStatus, yil } = this.state;
    if (!layer || connectionStatus !== "connected") return;

    const yearField = this.yearStatField();
    const areaField = this.layerField("maydon");
    if (!yearField || !areaField) {
      this._requestId += 1;
      this.setState({ value: null, loading: false, error: null });
      return;
    }

    if (!yil) {
      this.setState({ value: null, loading: true, error: null });
      return;
    }

    const requestId = ++this._requestId;
    this.setState({ error: null });
    if (this.state.value == null) {
      this.setState({ loading: true });
    }

    try {
      const where = this.buildWhere(yearField);
      if (!where) {
        this.setState({ value: null, loading: false, error: null });
        return;
      }

      const raw = await queryIndicatorOutStatNullable({
        layer,
        where,
        statisticType: "sum",
        onStatisticField: areaField.name,
      });
      if (!this._isMounted || requestId !== this._requestId) return;

      // null aggregate means no matching data; keep it distinct from a real zero.
      this.setState({
        value: raw != null && Number.isFinite(raw) ? raw : null,
        loading: false,
        error: null,
      });
    } catch {
      if (!this._isMounted || requestId !== this._requestId) return;
      this.setState({ loading: false, value: null, error: null });
    }
  }
}
