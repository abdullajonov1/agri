/**
 * Which land overlay the map control has switched on. One at a time: turning
 * one on replaces the other. Only "reserve" drives the dashboard widgets;
 * "unused" changes nothing but the map.
 */
import { React } from "jimu-core";

export type AgriLandOverlay = "reserve" | "unused";

type Listener = (overlay: AgriLandOverlay | null) => void;

let activeOverlay: AgriLandOverlay | null = null;
const listeners = new Set<Listener>();

export function getAgriLandOverlay(): AgriLandOverlay | null {
  return activeOverlay;
}

export function setAgriLandOverlay(next: AgriLandOverlay | null): void {
  if (next === activeOverlay) return;
  activeOverlay = next;
  // A crop picked on the reserve chart only means something while reserve is on.
  if (next !== "reserve") setReserveCropFilter(null);
  listeners.forEach((listener) => listener(next));
}

/**
 * Crop clicked on the reserve chart: the reserve land layer on the map is
 * narrowed to it. `where` is built against the reserve layer's own fields.
 */
export interface ReserveCropFilter {
  key: string;
  where: string;
}

type CropListener = (filter: ReserveCropFilter | null) => void;

let reserveCropFilter: ReserveCropFilter | null = null;
const cropListeners = new Set<CropListener>();

export function getReserveCropFilter(): ReserveCropFilter | null {
  return reserveCropFilter;
}

export function setReserveCropFilter(next: ReserveCropFilter | null): void {
  if (next?.key === reserveCropFilter?.key && next?.where === reserveCropFilter?.where) return;
  reserveCropFilter = next;
  cropListeners.forEach((listener) => listener(next));
}

export function subscribeReserveCropFilter(listener: CropListener): () => void {
  cropListeners.add(listener);
  return () => {
    cropListeners.delete(listener);
  };
}

export function useReserveCropFilter(): ReserveCropFilter | null {
  const [filter, setFilter] = React.useState(getReserveCropFilter);
  React.useEffect(() => {
    setFilter(getReserveCropFilter());
    return subscribeReserveCropFilter(setFilter);
  }, []);
  return filter;
}

/** Toggle switch semantics: on → off, otherwise this overlay replaces the other. */
export function toggleAgriLandOverlay(overlay: AgriLandOverlay): void {
  setAgriLandOverlay(activeOverlay === overlay ? null : overlay);
}

export function subscribeAgriLandOverlay(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useAgriLandOverlay(): AgriLandOverlay | null {
  const [overlay, setOverlay] = React.useState(getAgriLandOverlay);
  React.useEffect(() => {
    setOverlay(getAgriLandOverlay());
    return subscribeAgriLandOverlay(setOverlay);
  }, []);
  return overlay;
}
