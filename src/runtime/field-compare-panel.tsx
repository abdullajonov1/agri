/** @jsx jsx */
import { jsx, React } from "jimu-core";
import { type VegetationIndiceType } from "../gis/agri-polygon-api-source";
import {
  useAvailableDates,
  useCompareDocumentEvents,
  useCompareImage,
  type ImageStatus,
  type MonthCursor,
} from "./field-compare-hooks";
import FieldCompareCalendar from "./field-compare-calendar";

export type CompareLanguage = "uz_lat" | "uz_cyr" | "ru" | "en";

interface Props {
  language: CompareLanguage;
  onOpenChange?: (open: boolean) => void;
}

export interface Copy {
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

export default function FieldComparePanel(props: Props): JSX.Element {
  const copy = COPY[props.language] || COPY.uz_lat;
  const [open, setOpen] = React.useState(false);
  const [uniqueid, setUniqueid] = React.useState("");
  const [regionId, setRegionId] = React.useState<number | null>(null);
  const [mapDate, setMapDate] = React.useState<string | null>(null);
  const [pinnedDate, setPinnedDate] = React.useState<string | null>(null);
  const [indexKey, setIndexKey] = React.useState<VegetationIndiceType>("ndvi");
  const [knownDates, setKnownDates] = React.useState<string[]>([]);
  const [cursor, setCursor] = React.useState<MonthCursor>(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  });
  const [imageUrl, setImageUrl] = React.useState("");
  const [imageStatus, setImageStatus] = React.useState<ImageStatus>("idle");
  const displayDate = pinnedDate;
  const known = React.useMemo(() => new Set(knownDates), [knownDates]);
  const mapDateRef = React.useRef<string | null>(null);
  const seededRef = React.useRef(false);
  /** True once the user picked a day in this panel's own calendar. */
  const userPickedRef = React.useRef(false);
  /** True once this polygon's map overlay told us which date/index it drew. */
  const overlaySeededRef = React.useRef(false);
  const uniqueidRef = React.useRef("");
  const indexDatesRef = React.useRef(false);
  const onOpenChangeRef = React.useRef(props.onOpenChange);
  const openRef = React.useRef(false);
  uniqueidRef.current = uniqueid;
  onOpenChangeRef.current = props.onOpenChange;
  openRef.current = open;

  useCompareDocumentEvents({
    setOpen, setUniqueid, setRegionId, setMapDate, setPinnedDate, setIndexKey,
    setKnownDates, setCursor, setImageUrl, setImageStatus,
    mapDateRef, seededRef, userPickedRef, overlaySeededRef, uniqueidRef,
    indexDatesRef, onOpenChangeRef, openRef,
  });
  useAvailableDates({ uniqueid, regionId, mapDate, indexDatesRef, setKnownDates });
  useCompareImage({ open, uniqueid, regionId, displayDate, indexKey, setImageUrl, setImageStatus });

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

  return (
    <React.Fragment>
    <div className="agri-dashboard-compare-control">
      <button
        type="button"
        className={`agri-dashboard-map-zoom-button agri-dashboard-compare-button${open ? " is-active" : ""}`}
        aria-label={copy.open}
        aria-expanded={open}
        title={copy.open}
        onPointerDown={(event) => { event.stopPropagation(); }}
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
        onPointerDown={(event) => { event.stopPropagation(); }}
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
        <FieldCompareCalendar
          copy={copy}
          cursor={cursor}
          setCursor={setCursor}
          known={known}
          displayDate={displayDate}
          pinnedDate={pinnedDate}
          mapDate={mapDate}
          seededRef={seededRef}
          userPickedRef={userPickedRef}
          setPinnedDate={setPinnedDate}
        />
      </div>
    </React.Fragment>
  );
}
