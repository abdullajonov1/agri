import { AGRI_EVENTS } from "../shared/agri-events";
import { React } from "jimu-core";
import {
  fetchPolygonAvailableDates,
  fetchPolygonExportImageTiff,
  type VegetationIndiceType,
} from "../gis/agri-polygon-api-source";
import { agroV5Log } from "../shared/agri-debug-log";
import {
  getVegetationOverlayContext,
  VEGETATION_OVERLAY_APPLIED_EVENT,
} from "../gis/agri-vegetation-overlay-prefetch";

export type ImageStatus = "idle" | "loading" | "ready" | "error";
export interface MonthCursor { year: number; month: number }

type Setter<T> = React.Dispatch<React.SetStateAction<T>>;
type RefOf<T> = React.MutableRefObject<T>;

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
  return INDICES.includes(key as VegetationIndiceType)
    ? (key as VegetationIndiceType)
    : "ndvi";
}

export function readYmd(value: unknown): string | null {
  const text = String(value || "").trim().slice(0, 10);
  return /^(\d{4})-(\d{2})-(\d{2})$/.test(text) ? text : null;
}

export function readDates(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => readYmd(item)).filter((item): item is string => Boolean(item));
}

export function ymdParts(ymd: string): MonthCursor | null {
  const match = /^(\d{4})-(\d{2})-\d{2}$/.exec(ymd);
  if (!match) return null;
  return { year: Number(match[1]), month: Number(match[2]) };
}

export function monthCells(year: number, month: number): Array<string | null> {
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

export function shiftMonth(year: number, month: number, delta: number): MonthCursor {
  const date = new Date(year, month - 1 + delta, 1);
  return { year: date.getFullYear(), month: date.getMonth() + 1 };
}

export interface CompareEventsArgs {
  setOpen: Setter<boolean>;
  setUniqueid: Setter<string>;
  setRegionId: Setter<number | null>;
  setMapDate: Setter<string | null>;
  setPinnedDate: Setter<string | null>;
  setIndexKey: Setter<VegetationIndiceType>;
  setKnownDates: Setter<string[]>;
  setCursor: Setter<MonthCursor>;
  setImageUrl: Setter<string>;
  setImageStatus: Setter<ImageStatus>;
  mapDateRef: RefOf<string | null>;
  seededRef: RefOf<boolean>;
  userPickedRef: RefOf<boolean>;
  overlaySeededRef: RefOf<boolean>;
  uniqueidRef: RefOf<string>;
  indexDatesRef: RefOf<boolean>;
  onOpenChangeRef: RefOf<((open: boolean) => void) | undefined>;
  openRef: RefOf<boolean>;
}

export function useCompareDocumentEvents(args: CompareEventsArgs): void {
  const {
    setOpen, setUniqueid, setRegionId, setMapDate, setPinnedDate, setIndexKey,
    setKnownDates, setCursor, setImageUrl, setImageStatus,
    mapDateRef, seededRef, userPickedRef, overlaySeededRef, uniqueidRef,
    indexDatesRef, onOpenChangeRef, openRef,
  } = args;

  React.useEffect(() => {
    const clearField = (): void => {
      seededRef.current = false;
      userPickedRef.current = false;
      overlaySeededRef.current = false;
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
      document.dispatchEvent(new CustomEvent(AGRI_EVENTS.agriFieldCompareToggled, {
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
      if (!mentionsPolygon || !POLYGON_SOURCES.includes(source)) return;
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
      userPickedRef.current = false;
      overlaySeededRef.current = false;
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
    // The map overlay may draw a different date than the chart picked (the
    // chart date can have no scene). Follow the overlay once per polygon so
    // this panel shows the same image and reuses the same cached request.
    const onOverlayApplied = (event: Event): void => {
      const detail = readRecord(event);
      const appliedId = String(detail.uniqueid || "").replace(/[{}]/g, "").trim();
      const appliedDate = readYmd(detail.date);
      if (!appliedId || appliedId !== uniqueidRef.current || !appliedDate) return;
      if (userPickedRef.current || overlaySeededRef.current) return;
      overlaySeededRef.current = true;
      seededRef.current = true;
      if (detail.indexKey) setIndexKey(readIndex(detail.indexKey));
      setPinnedDate(appliedDate);
      const parts = ymdParts(appliedDate);
      if (parts) setCursor(parts);
    };
    const onIndicators = (event: Event): void => {
      if (readRecord(event).open !== true) return;
      setOpen(false);
      onOpenChangeRef.current?.(false);
    };
    document.addEventListener(AGRI_EVENTS.widgetSelectionChanged, onSelection);
    document.addEventListener(AGRI_EVENTS.graffDateIndexSelectionChanged, onDate);
    document.addEventListener(VEGETATION_OVERLAY_APPLIED_EVENT, onOverlayApplied);
    document.addEventListener(AGRI_EVENTS.agriIndicatorsDrawerToggled, onIndicators);
    document.addEventListener(AGRI_EVENTS.agriLandLayersToggled, onIndicators);
    return () => {
      document.removeEventListener(AGRI_EVENTS.widgetSelectionChanged, onSelection);
      document.removeEventListener(AGRI_EVENTS.graffDateIndexSelectionChanged, onDate);
      document.removeEventListener(VEGETATION_OVERLAY_APPLIED_EVENT, onOverlayApplied);
      document.removeEventListener(AGRI_EVENTS.agriIndicatorsDrawerToggled, onIndicators);
      document.removeEventListener(AGRI_EVENTS.agriLandLayersToggled, onIndicators);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps -- refs and state setters are stable; deps kept identical to the original component
  }, []);
}

export interface AvailableDatesArgs {
  uniqueid: string;
  regionId: number | null;
  mapDate: string | null;
  indexDatesRef: RefOf<boolean>;
  setKnownDates: Setter<string[]>;
}

export function useAvailableDates(args: AvailableDatesArgs): void {
  const { uniqueid, regionId, mapDate, indexDatesRef, setKnownDates } = args;
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
      .catch((error: unknown) => {
        agroV5Log("field-compare available dates failed", {
          uniqueid,
          regionId,
          year,
          error: error instanceof Error ? error.message : String(error),
        });
      });
    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps -- refs and state setters are stable; deps kept identical to the original component
  }, [uniqueid, regionId, mapDate]);
}

export interface CompareImageArgs {
  open: boolean;
  uniqueid: string;
  regionId: number | null;
  displayDate: string | null;
  indexKey: VegetationIndiceType;
  setImageUrl: Setter<string>;
  setImageStatus: Setter<ImageStatus>;
}

export function useCompareImage(args: CompareImageArgs): void {
  const { open, uniqueid, regionId, displayDate, indexKey, setImageUrl, setImageStatus } = args;
  React.useEffect(() => {
    if (!open || !uniqueid || regionId == null || !displayDate) {
      if (!open) return undefined;
      setImageUrl("");
      setImageStatus("idle");
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
  // eslint-disable-next-line react-hooks/exhaustive-deps -- refs and state setters are stable; deps kept identical to the original component
  }, [open, uniqueid, regionId, displayDate, indexKey]);
}
