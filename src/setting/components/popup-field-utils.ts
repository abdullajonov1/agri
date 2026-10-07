/**
 * Pure helpers for the polygon-popup settings panel: field extraction from
 * schemas/layers, field ordering and popup menu placement. No React/ArcGIS.
 */
import type { FieldInfo } from "../agri-popup-setting";
import { hasAsMutable } from "../plain-value";

export interface PopupMenuFrame {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
}

/** Field entry of a jimu data-source schema (keyed by jimuName). */
export interface SchemaFieldLike {
  name?: string;
  jimuName?: string;
  alias?: string;
  displayName?: string;
  type?: string;
  esriType?: string;
}

interface LayerFieldLike {
  name?: unknown;
  alias?: unknown;
  type?: unknown;
}

interface DataSourceRefLike {
  dataSourceId?: unknown;
}

const MENU_EDGE_GAP_PX = 8;
const MENU_MIN_SPACE_BELOW_PX = 160;
const MENU_MIN_HEIGHT_PX = 120;
const MENU_MAX_HEIGHT_PX = 280;
const MENU_OFFSET_PX = 2;

/** Fixed-position frame for the field menu: opens upward when space below is tight. */
export const computePopupMenuFrame = (
  rect: Pick<DOMRect, "top" | "bottom" | "left" | "width">,
  viewportHeight: number,
): PopupMenuFrame => {
  const spaceBelow = viewportHeight - rect.bottom - MENU_EDGE_GAP_PX;
  const spaceAbove = rect.top - MENU_EDGE_GAP_PX;
  const openUp = spaceBelow < MENU_MIN_SPACE_BELOW_PX && spaceAbove > spaceBelow;
  const maxHeight = Math.max(
    MENU_MIN_HEIGHT_PX,
    Math.min(MENU_MAX_HEIGHT_PX, openUp ? spaceAbove : spaceBelow),
  );
  return {
    top: openUp
      ? Math.max(MENU_EDGE_GAP_PX, rect.top - maxHeight - MENU_OFFSET_PX)
      : rect.bottom + MENU_OFFSET_PX,
    left: rect.left,
    width: rect.width,
    maxHeight,
  };
};

export const isSameMenuFrame = (
  prev: PopupMenuFrame | null | undefined,
  next: PopupMenuFrame,
): boolean =>
  !!prev &&
  prev.top === next.top &&
  prev.left === next.left &&
  prev.width === next.width &&
  prev.maxHeight === next.maxHeight;

/** Stable key of a useDataSources list (sorted, de-falsied data source ids). */
export const dataSourceKeyOf = (value: unknown): string => {
  const list: unknown[] = Array.isArray(value)
    ? value
    : hasAsMutable<unknown[]>(value)
      ? value.asMutable()
      : [];
  return (list as DataSourceRefLike[])
    .map((source) => String(source?.dataSourceId || ""))
    .filter(Boolean)
    .sort()
    .join("|");
};

export const fieldsFromSchemaFields = (
  fieldsObj: Record<string, SchemaFieldLike | undefined>,
): FieldInfo[] => {
  return Object.keys(fieldsObj || {}).map((key) => {
    const f = fieldsObj[key];
    return {
      name: f?.name || f?.jimuName || key,
      alias: f?.alias || f?.displayName || f?.name || key,
      type: f?.type || f?.esriType || "unknown",
    };
  });
};

export const fieldsFromLayerFields = (layer: unknown): FieldInfo[] => {
  const rawFields = (layer as { fields?: unknown } | null | undefined)?.fields;
  const raw: unknown[] = Array.isArray(rawFields) ? rawFields : [];
  return raw
    .map((item): FieldInfo | null => {
      const f = item as LayerFieldLike | null | undefined;
      const name = String(f?.name || "").trim();
      if (!name) return null;
      return {
        name,
        alias: String(f?.alias || f?.name || name),
        type: String(f?.type || "unknown"),
      };
    })
    .filter(Boolean);
};

/** True when `next` should replace `prev` (prev has no real alias, next does). */
export const shouldReplaceField = (prev: FieldInfo, next: FieldInfo): boolean => {
  const prevDefault = !prev.alias || prev.alias === prev.name;
  const nextBetter = !!next.alias && next.alias !== next.name;
  return prevDefault && nextBetter;
};

/** Saved order first (only known names), then the remaining field names. */
export const mergeFieldNameOrder = (fields: FieldInfo[], saved: string[]): string[] => {
  const names = fields.map((field) => field.name);
  const known = new Set(names);
  const base = (saved || []).filter((name) => known.has(name));
  const rest = names.filter((name) => !base.includes(name));
  return [...base, ...rest];
};

export const formatFieldInfoLabel = (f: FieldInfo): string => {
  const alias = String(f.alias || "").trim();
  const name = String(f.name || "").trim();
  if (alias && alias.toLowerCase() !== name.toLowerCase()) {
    return `${alias} (${name})`;
  }
  return alias || name;
};

/** Moves one entry; returns null when the move is a no-op or out of range. */
export const moveListItem = (
  order: string[],
  from: number,
  to: number,
): string[] | null => {
  if (
    from === to ||
    from < 0 ||
    to < 0 ||
    from >= order.length ||
    to >= order.length
  ) {
    return null;
  }
  const next = [...order];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
};
