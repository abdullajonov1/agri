/** @jsx jsx */
import { jsx, React } from "jimu-core";
import {
  holdInactiveLandLayersHidden,
  isRepublicLandScope,
  syncAgriLandLayers,
  useAgriLandScope,
} from "../gis/agri-land-layers";
import { applyLandCropRenderer } from "../gis/agri-land-crop-renderer";
import { agroV5Log } from "../gis/agri-debug-log";
import {
  getAgriLandOverlay,
  toggleAgriLandOverlay,
  setAgriLandOverlay,
  useAgriLandOverlay,
  useReserveCropFilter,
  type AgriLandOverlay,
} from "../store/agri-land-overlay-store";

const messageOfError = (error: unknown): string =>
  error instanceof Error ? error.message : String(error ?? "");

export type LandLayersLanguage = "uz_lat" | "uz_cyr" | "ru" | "en";

interface Props {
  language: LandLayersLanguage;
  view: __esri.MapView | null;
  onOpenChange?: (open: boolean) => void;
}

const COPY: Record<LandLayersLanguage, { title: string; pickViloyat: string } & Record<AgriLandOverlay, string>> = {
  uz_lat: {
    title: "Yer qatlamlari",
    unused: "Foydalanilmagan yer",
    reserve: "Zaxira maydonlari",
    pickViloyat: "Avval viloyatni tanlang",
  },
  uz_cyr: {
    title: "Ер қатламлари",
    unused: "Фойдаланилмаган ер",
    reserve: "Захира майдонлари",
    pickViloyat: "Аввал вилоятни танланг",
  },
  ru: {
    title: "Слои земель",
    unused: "Неиспользуемые земли",
    reserve: "Резервные земли",
    pickViloyat: "Сначала выберите область",
  },
  en: {
    title: "Land layers",
    unused: "Unused land",
    reserve: "Reserve land",
    pickViloyat: "Choose a region first",
  },
};

/** Unused land is viloyat-only: in the republic view its switch is locked. */
const isLocked = (row: AgriLandOverlay, republic: boolean): boolean => row === "unused" && republic;

const ROWS: AgriLandOverlay[] = ["unused", "reserve"];

export default function MapLandLayersPanel(props: Props): JSX.Element {
  const { language, view } = props;
  const copy = COPY[language] || COPY.uz_lat;
  const [open, setOpen] = React.useState(false);
  const overlay = useAgriLandOverlay();
  const scope = useAgriLandScope();
  const cropFilter = useReserveCropFilter();
  const republic = isRepublicLandScope(scope);

  // Back to the republic view with unused land on: switch it off.
  React.useEffect(() => {
    if (overlay && isLocked(overlay, republic)) setAgriLandOverlay(null);
  }, [overlay, republic]);
  const onOpenChangeRef = React.useRef(props.onOpenChange);
  onOpenChangeRef.current = props.onOpenChange;

  // Land layers stay hidden (no fetch) until switched on, even WebMap copies.
  React.useEffect(() => {
    if (!view) return undefined;
    return holdInactiveLandLayersHidden(view, getAgriLandOverlay);
  }, [view]);

  React.useEffect(() => {
    if (!view) return;
    // Polygons take the crop colours of the pie / reserve chart.
    const colorByCrop = overlay
      ? (layer: __esri.FeatureLayer, isStale: () => boolean) =>
          applyLandCropRenderer(layer, overlay, scope, isStale)
      : undefined;
    // A failed load is dropped inside syncAgriLandLayers, so switching the
    // overlay off and on again (or the next scope change) retries it.
    void syncAgriLandLayers(view, overlay, scope, cropFilter?.where || "", colorByCrop).catch(
      (error: unknown) => {
        agroV5Log("land-layers:sync-failed", { overlay, message: messageOfError(error) }, "map");
      },
    );
  }, [view, overlay, scope, cropFilter]);

  React.useEffect(() => {
    const onFieldCompare = (event: Event): void => {
      if ((event as CustomEvent<{ open?: boolean }>).detail?.open !== true) return;
      setOpen(false);
    };
    document.addEventListener("agriFieldCompareToggled", onFieldCompare);
    return () => {
      document.removeEventListener("agriFieldCompareToggled", onFieldCompare);
      setAgriLandOverlay(null);
    };
  }, []);

  const toggle = (): void => {
    const next = !open;
    setOpen(next);
    if (next) {
      document.dispatchEvent(new CustomEvent("agriLandLayersToggled", {
        detail: { open: true },
        bubbles: true,
      }));
    }
    onOpenChangeRef.current?.(next);
  };

  return (
    <React.Fragment>
      <div className="agri-dashboard-land-control">
        <button
          type="button"
          className={`agri-dashboard-map-zoom-button agri-dashboard-land-button${open || overlay ? " is-active" : ""}`}
          aria-label={copy.title}
          aria-expanded={open}
          title={copy.title}
          onPointerDown={(event) => { event.stopPropagation(); }}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            toggle();
          }}
        >
          <svg className="agri-dashboard-map-control-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 3.5 3.5 8.2 12 13l8.5-4.8L12 3.5Z" fill="none" stroke="#111" strokeWidth="1.8" strokeLinejoin="round" />
            <path d="M3.5 12.2 12 17l8.5-4.8M3.5 16.2 12 21l8.5-4.8" fill="none" stroke="#111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
      <div
        className={`agri-dashboard-land-panel${open ? " is-open" : ""}`}
        role="group"
        aria-label={copy.title}
        aria-hidden={!open}
        onPointerDown={(event) => { event.stopPropagation(); }}
      >
        {ROWS.map((row) => {
          const locked = isLocked(row, republic);
          return (
            <div
              key={row}
              className={`agri-dashboard-land-row${locked ? " is-locked" : ""}`}
              title={locked ? copy.pickViloyat : undefined}
            >
              <span className="agri-dashboard-basemap-borders-label">{copy[row]}</span>
              <button
                type="button"
                role="switch"
                aria-checked={overlay === row}
                aria-label={copy[row]}
                title={locked ? copy.pickViloyat : undefined}
                disabled={locked}
                className={`agri-dashboard-basemap-borders-toggle${overlay === row ? " is-on" : ""}`}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  if (!locked) toggleAgriLandOverlay(row);
                }}
              >
                <span className="agri-dashboard-basemap-borders-thumb" />
              </button>
            </div>
          );
        })}
      </div>
    </React.Fragment>
  );
}
