import type { GraffWidgetHost } from "../graff-host";
import { buildUniqueidPlainOrBracedWhere } from "../../../../data/agri-uniqueid-sql";

export const scrollSelectedRowIntoCenter = (host: GraffWidgetHost): void => {
  const container = host.tableContainerRef.current;
  if (!container) return;
  const selectedId = host.normalizeUniqueidKey(
    host._pendingScrollUniqueid || host.state.selecteduniqueid || "",
  );
  let row = container.querySelector(
    "tr.kadastr-table-row.selected-row",
  ) as HTMLElement | null;
  if (!row && selectedId) {
    const rows = Array.from(
      container.querySelectorAll("tr.kadastr-table-row[data-uniqueid]"),
    ) as HTMLElement[];
    row =
      rows.find(
        (el) =>
          host.normalizeUniqueidKey(el.getAttribute("data-uniqueid") || "") ===
          selectedId,
      ) || null;
  }
  if (!row) return;
  try {
    row.scrollIntoView({
      block: "center",
      behavior: "smooth",
      inline: "nearest",
    });
  } catch {
    const rowTop = row.offsetTop;
    const nextTop = Math.max(
      0,
      rowTop + row.offsetHeight / 2 - container.clientHeight / 2,
    );
    container.scrollTo({ top: nextTop, behavior: "smooth" });
  }
};

export const scheduleScrollSelectedRowIntoCenter = (host: GraffWidgetHost): void => {
  if (typeof window === "undefined") return;
  const run = () => {
    if (!host._isMounted) return;
    host.scrollSelectedRowIntoCenter();
  };
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(run);
  });
  // Table may still be painting after page swap / loader hide.
  window.setTimeout(run, 80);
  window.setTimeout(run, 220);
};

export const buildUniqueidWhere = (host: GraffWidgetHost, uniqueid: string): string =>
  buildUniqueidPlainOrBracedWhere(uniqueid);

/** Count rows that sort before the selected feature (same order as the table). */
export async function resolveTablePageForUniqueid(host: GraffWidgetHost, uniqueid: string): Promise<number | null> {
  const layer = host.state.featureLayer;
  if (!layer || !uniqueid) return null;

  const whereClause = host.buildWhereClause();
  const oidField = layer.objectIdField || "objectid";
  const idWhere = host.buildUniqueidWhere(uniqueid);

  try {
    if (typeof layer.load === "function") {
      try {
        await layer.load();
      } catch {
        /* continue */
      }
    }

    const findQ = layer.createQuery();
    findQ.where = `(${whereClause}) AND (${idWhere})`;
    findQ.outFields = [oidField, "uniqueid"];
    const maydonField = host.getMaydonSortFieldName();
    if (maydonField && host.state.tableSort?.column === "maydon") {
      findQ.outFields = [...(findQ.outFields as string[]), maydonField];
    }
    findQ.returnGeometry = false;
    findQ.num = 1;
    let found = (await layer.queryFeatures(findQ))?.features?.[0];

    // Fallback: id exists but outside current filters — still try unfiltered
    // lookup only to confirm the id; page resolve needs filtered set.
    if (!found) {
      findQ.where = idWhere;
      found = (await layer.queryFeatures(findQ))?.features?.[0];
      if (!found) return null;
      // Re-check inside filtered where by objectid.
      const oidProbe = Number(
        found.attributes?.[oidField] ?? found.attributes?.objectid,
      );
      if (!Number.isFinite(oidProbe)) return null;
      const inFilterQ = layer.createQuery();
      inFilterQ.where = `(${whereClause}) AND (${oidField} = ${oidProbe})`;
      inFilterQ.returnGeometry = false;
      inFilterQ.num = 1;
      const inFilter = (await layer.queryFeatures(inFilterQ))?.features?.[0];
      if (!inFilter) return null;
      found = inFilter;
    }

    const attrs = found.attributes || {};
    const oid = Number(attrs[oidField] ?? attrs.objectid);
    if (!Number.isFinite(oid)) return null;

    let beforeWhere = `(${whereClause}) AND (${oidField} < ${oid})`;
    if (host.state.tableSort?.column === "maydon" && maydonField) {
      const maydonNum = Number(attrs[maydonField]);
      if (Number.isFinite(maydonNum)) {
        const cmp = host.state.tableSort.order === "desc" ? ">" : "<";
        beforeWhere =
          `(${whereClause}) AND (` +
          `${maydonField} ${cmp} ${maydonNum} OR (` +
          `${maydonField} = ${maydonNum} AND ${oidField} < ${oid}))`;
      }
    }

    const beforeCount = await layer.queryFeatureCount({
      where: beforeWhere,
    } as any);
    if (beforeCount == null || !Number.isFinite(Number(beforeCount))) {
      return null;
    }
    return Math.floor(Number(beforeCount) / host.RECORDS_PER_PAGE) + 1;
  } catch {
    return null;
  }
}

/**
 * Ensure the selected polygon's row is on the current page and scrolled
 * into the middle of the table viewport (map pick or table pick).
 */
export const ensureSelectedRowVisible = async (host: GraffWidgetHost, uniqueid?: string | null): Promise<void> => {
  const id = String(uniqueid || host.state.selecteduniqueid || "").trim();
  if (!id) return;
  host._pendingScrollUniqueid = id;

  if (host.state.viewMode !== "table") {
    return;
  }

  const token = ++host._selectionPageResolveToken;

  const onCurrentPage = host.state.records.some((record) =>
    host.recordMatchesUniqueid(record, id),
  );
  if (onCurrentPage) {
    host.scheduleScrollSelectedRowIntoCenter();
    host._pendingScrollUniqueid = null;
    return;
  }

  // Wait out an in-flight table fetch before resolving the page.
  if (host.state.loading) return;

  const targetPage = await host.resolveTablePageForUniqueid(id);
  if (!host._isMounted || token !== host._selectionPageResolveToken) return;
  if (targetPage == null) {
    // Still try to scroll if the row somehow rendered.
    host.scheduleScrollSelectedRowIntoCenter();
    return;
  }

  if (targetPage === host.state.currentPage) {
    host.scheduleScrollSelectedRowIntoCenter();
    host._pendingScrollUniqueid = null;
    return;
  }

  host.setState({ currentPage: targetPage, loading: true }, () => {
    void host.fetchData({ preservePage: true });
  });
};

export const goToTablePage = (host: GraffWidgetHost, page: number): void => {
  const totalPages = Math.max(
    1,
    Math.ceil(host.state.totalRecordCount / host.RECORDS_PER_PAGE),
  );
  const next = Math.min(Math.max(1, page), totalPages);
  if (next === host.state.currentPage && host.state.records.length) return;
  /* User-driven paging: cancel any "snap to selected row" in flight. */
  host._pendingScrollUniqueid = null;
  host._selectionPageResolveToken += 1;
  host.setState({ currentPage: next, loading: true }, () => {
    void host.fetchData({ preservePage: true });
  });
};
