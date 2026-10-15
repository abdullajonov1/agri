/** @jsx jsx */
import { jsx, React } from "jimu-core";
import {
  fetchPolygonAvailableDates,
  fetchPolygonExportImageTiff,
  type VegetationIndiceType,
} from "../gis/agri-polygon-api-source";
import { getVegetationOverlayContext } from "../gis/agri-vegetation-overlay-prefetch";

export type CompareLanguage = "uz_lat" | "uz_cyr" | "ru" | "en";

interface Props {
  language: CompareLanguage;
  onOpenChange?: (open: boolean) => void;
}

interface Copy {
  open: string;
  title: string;
  pickField: string;
  loading: string;
  missing: string;
  mapDate: string;
  legend: string;
  prev: string;
  next: string;
  weekdays: string[];
  months: string[];
}

const COPY: Record<CompareLanguage, Copy> = {
  uz_lat: {
    open: "Maydon rasmini solishtirish",
    title: "Sana bo‘yicha solishtirish",
    pickField: "Xaritadan maydon tanlang",
    loading: "Rasm yuklanmoqda",
    missing: "Rasm mavjud emas",
    mapDate: "Xarita sanasi",
    legend: "Indeks mavjud bo‘lgan sana",
    prev: "Oldingi oy",
    next: "Keyingi oy",
    weekdays: ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"],
    months: ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"],
  },
  uz_cyr: {
    open: "Майдон расмини солиштириш",
    title: "Сана бўйича солиштириш",
    pickField: "Харитадан майдон танланг",
    loading: "Расм юкланмоқда",
    missing: "Расм мавжуд эмас",
    mapDate: "Харита санаси",
    legend: "Индекс мавжуд бўлган сана",
    prev: "Олдинги ой",
    next: "Кейинги ой",
    weekdays: ["Ду", "Се", "Чо", "Па", "Жу", "Ша", "Як"],
    months: ["Январ", "Феврал", "Март", "Апрел", "Май", "Июн", "Июл", "Август", "Сентабр", "Октабр", "Ноябр", "Декабр"],
  },
  ru: {
    open: "Сравнить снимок поля",
    title: "Сравнение по дате",
    pickField: "Выберите поле на карте",
    loading: "Снимок загружается",
    missing: "Снимок отсутствует",
    mapDate: "Дата карты",
    legend: "Дата, где есть индекс",
    prev: "Предыдущий месяц",
    next: "Следующий месяц",
    weekdays: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
    months: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
  },
  en: {
    open: "Compare field image",
    title: "Compare by date",
    pickField: "Select a field on the map",
    loading: "Loading image",
    missing: "No image available",
    mapDate: "Map date",
    legend: "Date with an index",
    prev: "Previous month",
    next: "Next month",
    weekdays: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
    months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  },
};

const INDICES: readonly VegetationIndiceType[] = ["ndvi", "savi", "rvi", "ci", "evi", "ndre", "ndwi"];
const POLYGON_SOURCES = ["AgriPopup", "AgriGraffWidget", "AgriGraff10", "AgriFilter"];

function readRecord(event: Event): Record<string, unknown> {
  const detail = (event as CustomEvent<unknown>).detail;
  if (!detail || typeof detail !== "object") return {};
  return detail as Record<string, unknown>;
}

function readRegion(value: unknown): number | null {
  const region = Number(value);
  return Number.isFinite(region) ? region : null;
}

function readIndex(value: unknown): VegetationIndiceType {
  const key = String(value || "").trim().toLowerCase();
  return INDICES.indexOf(key as VegetationIndiceType) >= 0
    ? (key as VegetationIndiceType)
    : "ndvi";
}

function readYmd(value: unknown): string | null {
  const text = String(value || "").trim().slice(0, 10);
  return /^(\d{4})-(\d{2})-(\d{2})$/.test(text) ? text : null;
}

function readDates(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => readYmd(item)).filter((item): item is string => Boolean(item));
}

function ymdParts(ymd: string): { year: number; month: number } | null {
  const match = /^(\d{4})-(\d{2})-\d{2}$/.exec(ymd);
  if (!match) return null;
  return { year: Number(match[1]), month: Number(match[2]) };
}

function monthCells(year: number, month: number): Array<string | null> {
  const first = new Date(year, month - 1, 1);
  const lead = (first.getDay() + 6) % 7;
  const count = new Date(year, month, 0).getDate();
  const cells: Array<string | null> = [];
  for (let index = 0; index < lead; index += 1) cells.push(null);
  for (let day = 1; day <= count; day += 1) {
    cells.push(`${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`);
  }
  return cells;
}

function shiftMonth(year: number, month: number, delta: number): { year: number; month: number } {
  const date = new Date(year, month - 1 + delta, 1);
  return { year: date.getFullYear(), month: date.getMonth() + 1 };
}

export default function FieldComparePanel(props: Props): JSX.Element {
  const copy = COPY[props.language] || COPY.uz_lat;
  const [open, setOpen] = React.useState(false);
  const [uniqueid, setUniqueid] = React.useState("");
  const [regionId, setRegionId] = React.useState<number | null>(null);
  const [mapDate, setMapDate] = React.useState<string | null>(null);
  const [pinnedDate, setPinnedDate] = React.useState<string | null>(null);
  const [indexKey, setIndexKey] = React.useState<VegetationIndiceType>("ndvi");
  const [knownDates, setKnownDates] = React.useState<string[]>([]);
  const [cursor, setCursor] = React.useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  });
  const [imageUrl, setImageUrl] = React.useState("");
  const [imageStatus, setImageStatus] = React.useState<"idle" | "loading" | "ready" | "error">("idle");
  const displayDate = pinnedDate;
  const known = React.useMemo(() => new Set(knownDates), [knownDates]);
  const mapDateRef = React.useRef<string | null>(null);
  const seededRef = React.useRef(false);
  const uniqueidRef = React.useRef("");
  const indexDatesRef = React.useRef(false);
  const onOpenChangeRef = React.useRef(props.onOpenChange);
  const openRef = React.useRef(false);
  uniqueidRef.current = uniqueid;
  onOpenChangeRef.current = props.onOpenChange;
  openRef.current = open;

  React.useEffect(() => {
    const clearField = (): void => {
      seededRef.current = false;
      mapDateRef.current = null;
      indexDatesRef.current = false;
      uniqueidRef.current = "";
      setUniqueid("");
      setMapDate(null);
      setPinnedDate(null);
      setKnownDates([]);
      setImageUrl("");
      setImageStatus("idle");
    };
    const reveal = (): void => {
      if (openRef.current) return;
      openRef.current = true;
      setOpen(true);
      document.dispatchEvent(new CustomEvent("agriFieldCompareToggled", {
        detail: { open: true },
        bubbles: true,
      }));
      onOpenChangeRef.current?.(true);
    };
    const onSelection = (event: Event): void => {
      const detail = readRecord(event);
      const mentionsPolygon = Object.prototype.hasOwnProperty.call(detail, "polygonMode")
        || Object.prototype.hasOwnProperty.call(detail, "uniqueid");
      const source = String(detail.source || "");
      if (!mentionsPolygon || POLYGON_SOURCES.indexOf(source) < 0) return;
      const nextId = String(detail.uniqueid || "").replace(/[{}]/g, "").trim();
      if (detail.polygonMode !== true || !nextId) {
        clearField();
        return;
      }
      const context = getVegetationOverlayContext();
      const region = readRegion(detail.regionId) ?? readRegion(context.regionId);
      if (nextId === uniqueidRef.current) {
        if (region != null) setRegionId(region);
        reveal();
        return;
      }
      seededRef.current = false;
      indexDatesRef.current = false;
      uniqueidRef.current = nextId;
      setKnownDates([]);
      setUniqueid(nextId);
      setRegionId(region);
      setPinnedDate(null);
      setImageUrl("");
      reveal();
    };
    const onDate = (event: Event): void => {
      const detail = readRecord(event);
      const nextDate = readYmd(detail.date);
      if (nextDate) mapDateRef.current = nextDate;
      setMapDate(nextDate);
      setRegionId((current) => current ?? readRegion(getVegetationOverlayContext().regionId));
      const advertised = readDates(detail.availableDates);
      if (advertised.length && uniqueidRef.current) {
        indexDatesRef.current = true;
        setKnownDates(advertised.slice().sort());
      }
      // The graph date moves the map. The popup keeps the date it was
      // seeded with when the field was selected, until its own calendar changes it.
      if (!seededRef.current && nextDate && uniqueidRef.current) {
        seededRef.current = true;
        if (detail.indexKey) setIndexKey(readIndex(detail.indexKey));
        setPinnedDate(nextDate);
        const parts = ymdParts(nextDate);
        if (parts) setCursor(parts);
      }
    };
    const onIndicators = (event: Event): void => {
      if (readRecord(event).open !== true) return;
      setOpen(false);
      onOpenChangeRef.current?.(false);
    };
    document.addEventListener("widgetSelectionChanged", onSelection);
    document.addEventListener("graffDateIndexSelectionChanged", onDate);
    document.addEventListener("agriIndicatorsDrawerToggled", onIndicators);
    return () => {
      document.removeEventListener("widgetSelectionChanged", onSelection);
      document.removeEventListener("graffDateIndexSelectionChanged", onDate);
      document.removeEventListener("agriIndicatorsDrawerToggled", onIndicators);
    };
  }, []);

  React.useEffect(() => {
    if (!uniqueid || regionId == null) return undefined;
    const year = ymdParts(mapDate || "")?.year ?? getVegetationOverlayContext().year;
    if (year == null || indexDatesRef.current) return undefined;
    let cancelled = false;
    void fetchPolygonAvailableDates(uniqueid, regionId, year)
      .then((dates) => {
        if (cancelled || indexDatesRef.current) return;
        setKnownDates(readDates(dates).slice().sort());
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [uniqueid, regionId, mapDate]);

  React.useEffect(() => {
    if (!open || !uniqueid || regionId == null || !displayDate) {
      if (!open) return undefined;
      setImageUrl("");
      setImageStatus(uniqueid ? "idle" : "idle");
      return undefined;
    }
    let cancelled = false;
    setImageStatus("loading");
    void fetchPolygonExportImageTiff({
      uniqueid,
      regionId,
      rasterDate: displayDate,
      indiceType: indexKey,
      stretch: "fixed",
    })
      .then((result) => {
        if (cancelled) return;
        setImageUrl(result.canvas.toDataURL("image/png"));
        setImageStatus("ready");
      })
      .catch(() => {
        if (cancelled) return;
        setImageUrl("");
        setImageStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [open, uniqueid, regionId, displayDate, indexKey]);

  const toggle = (): void => {
    setOpen((current) => {
      const next = !current;
      if (next) {
        document.dispatchEvent(new CustomEvent("agriFieldCompareToggled", {
          detail: { open: true },
          bubbles: true,
        }));
      }
      onOpenChangeRef.current?.(next);
      return next;
    });
  };

  const cells = monthCells(cursor.year, cursor.month);

  return (
    <React.Fragment>
    <div className="agri-dashboard-compare-control">
      <button
        type="button"
        className={`agri-dashboard-map-zoom-button agri-dashboard-compare-button${open ? " is-active" : ""}`}
        aria-label={copy.open}
        aria-expanded={open}
        title={copy.open}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          toggle();
        }}
      >
        <svg className="agri-dashboard-map-control-icon" viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3.5" y="5" width="17" height="15" rx="2" fill="none" stroke="#111" strokeWidth="1.8" />
          <path d="M3.5 9.5h17M8 3.5v3M16 3.5v3" fill="none" stroke="#111" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>
    </div>
      <div
        className={`agri-dashboard-compare-panel${open ? " is-open" : ""}`}
        role="dialog"
        aria-label={copy.title}
        aria-hidden={!open}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <div className="agri-dashboard-compare-title">{copy.title}</div>
        <div className="agri-dashboard-compare-stage">
          {!uniqueid ? <p>{copy.pickField}</p> : null}
          {uniqueid && imageStatus === "loading" ? (
            <div className="agri-dashboard-spinner-wrap" role="status" aria-label={copy.loading}>
              <span className="agri-dashboard-spinner" />
            </div>
          ) : null}
          {uniqueid && imageStatus === "error" ? <p>{copy.missing}</p> : null}
          {imageUrl && imageStatus !== "loading" ? <img src={imageUrl} alt="" /> : null}
          {displayDate ? <strong>{displayDate}</strong> : null}
        </div>
        <div className="agri-dashboard-compare-calendar">
          <div className="agri-dashboard-compare-month">
            <button
              type="button"
              aria-label={copy.prev}
              onClick={() => setCursor((current) => shiftMonth(current.year, current.month, -1))}
            >
              ‹
            </button>
            <span>{copy.months[cursor.month - 1]} {cursor.year}</span>
            <button
              type="button"
              aria-label={copy.next}
              onClick={() => setCursor((current) => shiftMonth(current.year, current.month, 1))}
            >
              ›
            </button>
          </div>
          <div className="agri-dashboard-compare-weekdays">
            {copy.weekdays.map((day) => <span key={day}>{day}</span>)}
          </div>
          <div className="agri-dashboard-compare-days">
            {cells.map((ymd, index) => {
              if (!ymd) return <span key={`empty-${index}`} />;
              const hasScene = known.has(ymd);
              const selected = ymd === displayDate;
              const isMap = ymd === mapDate;
              const className = [
                "agri-dashboard-compare-day",
                hasScene ? "has-scene" : "",
                selected ? "is-selected" : "",
                isMap && !selected ? "is-map" : "",
              ].filter(Boolean).join(" ");
              return (
                <button
                  key={ymd}
                  type="button"
                  className={className}
                  data-date={ymd}
                  disabled={!hasScene}
                  aria-pressed={selected}
                  onClick={() => {
                    if (!hasScene) return;
                    seededRef.current = true;
                    setPinnedDate(ymd);
                  }}
                >
                  {Number(ymd.slice(-2))}
                </button>
              );
            })}
          </div>
          <div className="agri-dashboard-compare-legend">
            <i />
            <span>{copy.legend}</span>
            {pinnedDate && mapDate && pinnedDate !== mapDate ? (
              <button
                type="button"
                onClick={() => {
                  if (!mapDate) return;
                  seededRef.current = true;
                  setPinnedDate(mapDate);
                  const parts = ymdParts(mapDate);
                  if (parts) setCursor(parts);
                }}
              >
                {copy.mapDate}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}
