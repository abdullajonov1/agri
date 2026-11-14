// Reserve land by crop type — shown in the Graff slot while the reserve overlay is on.

import { React } from "jimu-core";
import { TriangleAlert } from "lucide-react";
import AgriChartLoader from "../../../shared/AgriChartLoader";
import { agriNoDataLabel } from "../../../shared/agriNoDataLabel";
import { getCropDisplayName } from "../../../shared/agri-crop-labels";
import { resolveCropColors } from "../../../shared/agri-crop-color-registry";
import { useAgriLandScope } from "../../../gis/agri-land-layers";
import {
  detectIsDarkTheme,
  normalizeLanguage,
  resolveInitialLanguage,
  type AgriLanguage,
} from "../../../shared/agri-language";
import { bindMasterFilter } from "../../../data/agri-filter-bus";
import { messageOf, panelEventDetail, readThemeIsDark } from "../../panel-filter-detail";
import { queryReserveCropRows, type ReserveCropRow } from "./reserve-crop-data";
import { setReserveCropFilter, useReserveCropFilter } from "../../../store/agri-land-overlay-store";
import "./ReserveCrop.css";

const TITLE: Record<AgriLanguage, string> = {
  uz_lat: "Zaxira maydonlari",
  uz_cyr: "Захира майдонлари",
  ru: "Резервные земли",
  en: "Reserve land",
};

const formatArea = (value: unknown): string =>
  new Intl.NumberFormat("ru-RU").format(Math.ceil(Number(value) || 0));

const formatShare = (share: number): string => {
  const pct = share * 100;
  if (pct > 0 && pct < 0.1) return "<0.1%";
  return `${pct < 10 ? pct.toFixed(1) : Math.round(pct)}%`;
};

const BAR_STAGGER_MS = 60;

interface ReserveBarDatum {
  key: string;
  label: string;
  value: number;
  /** value / largest value: the largest bar always reaches the top. */
  fill: number;
  /** value / sum of all crops. */
  share: number;
  color: string;
  /** WHERE that narrows the map's reserve layer to this crop ("" = none). */
  where: string;
}

type CssVars = React.CSSProperties & Record<`--${string}`, string | number>;

/** Small ring showing the crop's share of all reserve land. */
function ShareRing(props: { share: number }): JSX.Element {
  const r = 6;
  const circumference = 2 * Math.PI * r;
  const arc = Math.max(0, Math.min(1, props.share)) * circumference;
  return (
    <svg className="agri-reserve-crop-ring" viewBox="0 0 16 16" aria-hidden="true">
      <circle className="agri-reserve-crop-ring-track" cx="8" cy="8" r={r} />
      <circle
        className="agri-reserve-crop-ring-arc"
        cx="8"
        cy="8"
        r={r}
        strokeDasharray={`${arc} ${circumference}`}
      />
    </svg>
  );
}

function ReserveColumn(props: {
  item: ReserveBarDatum;
  index: number;
  unit: string;
  selected: boolean;
  dimmed: boolean;
  onSelect: (item: ReserveBarDatum) => void;
}): JSX.Element {
  const { item, index, unit, selected, dimmed, onSelect } = props;
  const style: CssVars = {
    "--bar-color": item.color,
    "--bar-fill": `${(item.fill * 100).toFixed(3)}%`,
    "--bar-delay": `${index * BAR_STAGGER_MS}ms`,
  };
  const valueText = `${formatArea(item.value)} ${unit}`;
  const shareText = formatShare(item.share);
  const className = [
    "agri-reserve-crop-col",
    selected ? "is-selected" : "",
    dimmed ? "is-dimmed" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={className}
      role="listitem"
      aria-pressed={selected}
      aria-label={`${item.label}: ${valueText}, ${shareText}`}
      disabled={!item.where}
      data-fill={item.fill}
      style={style}
      onClick={() => { onSelect(item); }}
    >
      {/* Value, name and share sit on one line-up across all columns, like VH. */}
      <span className="agri-reserve-crop-head">
        <span className="agri-reserve-crop-value">
          {formatArea(item.value)}
          <small>{" "}{unit}</small>
        </span>
        <span className="agri-reserve-crop-label" title={item.label}>{item.label}</span>
        <span className="agri-reserve-crop-share">
          <ShareRing share={item.share} />
          {shareText}
        </span>
      </span>
      <span className="agri-reserve-crop-plot" aria-hidden="true">
        <span className="agri-reserve-crop-track">
          <span className="agri-reserve-crop-bar" />
        </span>
      </span>
    </button>
  );
}

/** Screen-reader twin of the chart (values never live in colour alone). */
function ReserveTable(props: { data: ReserveBarDatum[]; unit: string; caption: string }): JSX.Element {
  return (
    <table className="agri-reserve-crop-sr">
      <caption>{props.caption}</caption>
      <tbody>
        {props.data.map((item) => (
          <tr key={item.key}>
            <th scope="row">{item.label}</th>
            <td>{`${formatArea(item.value)} ${props.unit}`}</td>
            <td>{formatShare(item.share)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/**
 * Which ends of a sideways-scrolling row still hide columns. Drives the edge
 * fades, so a narrow card shows there is more to scroll to.
 */
function useScrollEdges(
  ref: React.RefObject<HTMLElement>,
  deps: readonly unknown[],
): { start: boolean; end: boolean } {
  const [edges, setEdges] = React.useState({ start: false, end: false });
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const update = (): void => {
      const max = el.scrollWidth - el.clientWidth;
      const next = { start: el.scrollLeft > 1, end: max - el.scrollLeft > 1 };
      setEdges((prev) => (prev.start === next.start && prev.end === next.end ? prev : next));
    };
    // A vertical mouse wheel scrolls the row sideways while it overflows.
    // Native listener: React's onWheel is passive and cannot preventDefault.
    const onWheel = (event: WheelEvent): void => {
      if (el.scrollWidth <= el.clientWidth) return;
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      const before = el.scrollLeft;
      el.scrollLeft += event.deltaY;
      // Swallow it only when the row moved; at either end the page scrolls.
      if (el.scrollLeft !== before) event.preventDefault();
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    el.addEventListener("wheel", onWheel, { passive: false });
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(update) : null;
    observer?.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      el.removeEventListener("wheel", onWheel);
      observer?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return edges;
}

export default function ReserveCropPanel(props: { active: boolean }): JSX.Element {
  const { active } = props;
  const scope = useAgriLandScope();
  const [rows, setRows] = React.useState<ReserveCropRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [language, setLanguage] = React.useState<AgriLanguage>(resolveInitialLanguage);
  const [isDark, setIsDark] = React.useState(detectIsDarkTheme);

  React.useEffect(() => {
    if (!active || !scope.yil) return undefined;
    let cancelled = false;
    setLoading(true);
    setError("");
    queryReserveCropRows(scope)
      .then((next) => {
        if (cancelled) return;
        setRows(next);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setRows([]);
        setError(messageOf(err) || agriNoDataLabel(language));
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // `language` only words the error text; it must not re-run the query.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, scope]);

  React.useEffect(() => {
    const applyLanguage = (raw: string | undefined): void => {
      if (raw) setLanguage(normalizeLanguage(raw));
    };
    const onLanguage = (event: Event): void => {
      const detail = panelEventDetail(event);
      applyLanguage(detail.lang ?? detail.language ?? detail.code);
    };
    const onTheme = (event: Event): void => {
      setIsDark(readThemeIsDark(panelEventDetail(event)) ?? detectIsDarkTheme());
    };
    const unbind = bindMasterFilter((event) => {
      applyLanguage(panelEventDetail(event).filters?.language);
    });
    document.addEventListener("languageChanged", onLanguage);
    document.addEventListener("agriV11ThemeToggled", onTheme);
    return () => {
      unbind();
      document.removeEventListener("languageChanged", onLanguage);
      document.removeEventListener("agriV11ThemeToggled", onTheme);
    };
  }, []);

  const data = React.useMemo<ReserveBarDatum[]>(() => {
    const max = rows.reduce((acc, row) => Math.max(acc, row.maydon), 0);
    const sum = rows.reduce((acc, row) => acc + row.maydon, 0);
    const colors = resolveCropColors(rows.map((row) => row.crop));
    return rows.map((row, index) => ({
      key: row.crop,
      label: getCropDisplayName(row.crop, language),
      value: row.maydon,
      fill: max > 0 ? row.maydon / max : 0,
      share: sum > 0 ? row.maydon / sum : 0,
      color: colors[index],
      where: row.where || "",
    }));
  }, [rows, language]);
  const unit = language === "en" ? "ha" : language === "uz_lat" ? "ga" : "га";

  // Click a column → the map's reserve layer shows only that crop; again → all.
  const cropFilter = useReserveCropFilter();
  const selectedKey = cropFilter?.key ?? null;
  const onSelect = React.useCallback(
    (item: ReserveBarDatum): void => {
      if (!item.where) return;
      setReserveCropFilter(selectedKey === item.key ? null : { key: item.key, where: item.where });
    },
    [selectedKey],
  );

  // New data (scope change): keep the pick if the crop is still there, with
  // its new WHERE; drop it otherwise.
  React.useEffect(() => {
    if (loading || !selectedKey) return;
    const hit = data.find((item) => item.key === selectedKey);
    setReserveCropFilter(hit?.where ? { key: hit.key, where: hit.where } : null);
  }, [data, loading, selectedKey]);

  const gridRef = React.useRef<HTMLDivElement>(null);
  const edges = useScrollEdges(gridRef, [data, loading, error]);

  return (
    <div className={`agri-reserve-crop-card ${isDark ? "dark-theme" : "light-theme"}`}>
      <div className="agri-reserve-crop-title">{TITLE[language]}</div>
      <div className="agri-reserve-crop-body">
        {!scope.yil || (loading && !data.length) ? (
          <AgriChartLoader />
        ) : error ? (
          <div className="agri-reserve-crop-empty" role="alert">
            <TriangleAlert className="agri-empty-state-icon" strokeWidth={1.7} aria-hidden="true" />
            <p>{error}</p>
          </div>
        ) : !data.length ? (
          <div className="agri-reserve-crop-empty">
            <TriangleAlert className="agri-empty-state-icon" strokeWidth={1.7} aria-hidden="true" />
            <h3>{agriNoDataLabel(language)}</h3>
          </div>
        ) : (
          <React.Fragment>
            {/* A refetch keeps the previous bars, dimmed, instead of flashing a loader. */}
            <div
              ref={gridRef}
              className={[
                "agri-reserve-crop-grid",
                loading ? "is-refreshing" : "",
                selectedKey ? "has-selection" : "",
                edges.start ? "has-more-start" : "",
                edges.end ? "has-more-end" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              role="list"
              aria-label={TITLE[language]}
              aria-busy={loading}
              // Every crop gets a column; past the card width the row scrolls sideways
              // instead of squeezing names into ellipses. Column bounds scale with
              // the card (container units in ReserveCrop.css).
              style={{
                gridTemplateColumns: `repeat(${data.length}, minmax(var(--reserve-col-min), var(--reserve-col-max)))`,
              }}
            >
              {data.map((item, index) => (
                <ReserveColumn
                  key={item.key}
                  item={item}
                  index={index}
                  unit={unit}
                  selected={item.key === selectedKey}
                  dimmed={!!selectedKey && item.key !== selectedKey}
                  onSelect={onSelect}
                />
              ))}
            </div>
            <ReserveTable data={data} unit={unit} caption={TITLE[language]} />
          </React.Fragment>
        )}
      </div>
    </div>
  );
}
