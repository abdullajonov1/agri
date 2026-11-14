/**
 * Unified filter adapter for Agro_widgetV5 dashboard panels.
 *
 * Panels MUST subscribe here (in-memory FilterStore) — do not add legacy
 * document listeners for yilChanged / regionChanged / categoryFilterChanged.
 * Localization still dispatches document CustomEvents for map / ExB hooks only.
 */
import { AGRI_EVENTS } from "../shared/agri-events";
import {
  getMasterFilterSnapshot,
  subscribeMasterFilter,
  type MasterFilterSnapshot,
} from "./agri-filter-store";

export type { MasterFilterSnapshot };

export type MasterFilterHandler = (event: Event) => void;

export type MasterFilterDetailHandler = (detail: MasterFilterSnapshot) => void;

function toFilterEvent(detail: MasterFilterSnapshot): CustomEvent {
  return new CustomEvent(AGRI_EVENTS.masterFilterChanged, { detail });
}

/**
 * Bind a panel to the shared filter store.
 * Returns unsubscribe — call in componentWillUnmount.
 */
export function bindMasterFilter(handler: MasterFilterHandler): () => void {
  const onSnapshot = (detail: MasterFilterSnapshot) => {
    handler(toFilterEvent(detail));
  };

  const unsub = subscribeMasterFilter(onSnapshot);

  const snapshot = getMasterFilterSnapshot();
  if (snapshot) {
    onSnapshot(snapshot);
  } else {
    document.dispatchEvent(new CustomEvent(AGRI_EVENTS.requestMasterFilterState));
  }

  return unsub;
}

/** Typed store subscription — preferred for new panel code. */
export function subscribeMasterFilterDetail(
  handler: MasterFilterDetailHandler,
): () => void {
  return subscribeMasterFilter(handler);
}
