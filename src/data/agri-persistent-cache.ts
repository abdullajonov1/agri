/**
 * Browser-persisted cache for Agro_widgetV5 stats (survives page refresh).
 *
 * In-memory Maps alone reset on F5 — this layer keeps JSON values in
 * localStorage for up to 1 hour so Region/Pie/Indicator/Graff/VH can reuse
 * the last successful ArcGIS aggregates without re-querying.
 *
 * Do NOT store huge uniqueid lists or FeatureLayer instances here.
 */

import { getAppStore } from "jimu-core";
import { agroV5Log } from "../shared/agri-debug-log";

export const AGRI_PERSIST_TTL_MS = 60 * 60 * 1000; // 1 hour

const STORAGE_PREFIX = "agri_v5_pc:";
/** Soft budget — drop oldest entries when exceeded. */
const MAX_STORAGE_CHARS = 2_500_000;
const MAX_ENTRY_CHARS = 750_000;

/** Bump when the envelope shape changes; other versions read as a miss. */
const CACHE_SCHEMA_VERSION = 1;

type PersistEnvelope<T> = {
  v: number;
  expiresAt: number;
  savedAt: number;
  value: T;
};

/** Single console.warn site; text stays "[AgroV5] persistent cache <what>". */
function warnCache(what: string, err: unknown): void {
  // eslint-disable-next-line no-console
  console.warn(`[AgroV5] persistent cache ${what}`, err);
}

function errorDetail(err: unknown): Record<string, unknown> {
  return { error: err instanceof Error ? err.message : String(err) };
}

function storage(): Storage | null {
  try {
    if (typeof localStorage === "undefined") return null;
    return localStorage;
  } catch (err) {
    agroV5Log("persistent cache storage unavailable", errorDetail(err));
    return null;
  }
}

const ANON_USER = "anon";

/** Current Portal username (URI-encoded so it never contains ":"); never throws. */
function userSegment(): string {
  try {
    const username = getAppStore().getState().user?.username;
    return encodeURIComponent(username || ANON_USER);
  } catch (err) {
    agroV5Log("persistent cache user lookup failed", errorDetail(err));
    return ANON_USER;
  }
}

function fullKey(namespace: string, key: string): string {
  return `${STORAGE_PREFIX}${userSegment()}:${namespace}:${key}`;
}

/** True when a storage key belongs to the namespace, for any user. */
function isNamespaceKey(storageKey: string, namespace: string): boolean {
  if (!storageKey.startsWith(STORAGE_PREFIX)) return false;
  const rest = storageKey.slice(STORAGE_PREFIX.length);
  const sep = rest.indexOf(":");
  if (sep < 0) return false;
  return rest.slice(sep + 1).startsWith(`${namespace}:`);
}

function safeParse<T>(raw: string | null): PersistEnvelope<T> | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as PersistEnvelope<T>;
    if (!parsed || typeof parsed !== "object") return null;
    if (typeof parsed.expiresAt !== "number") return null;
    if (parsed.v !== CACHE_SCHEMA_VERSION) return null;
    return parsed;
  } catch (err) {
    agroV5Log("persistent cache parse failed", errorDetail(err));
    return null;
  }
}

/** Drop expired keys; if still over budget, drop oldest by savedAt. */
export function pruneAgriPersistentCache(now = Date.now()): void {
  const store = storage();
  if (!store) return;

  type Meta = { key: string; savedAt: number; size: number };
  const metas: Meta[] = [];
  let total = 0;

  for (let i = store.length - 1; i >= 0; i--) {
    const key = store.key(i);
    if (!key || !key.startsWith(STORAGE_PREFIX)) continue;
    const raw = store.getItem(key);
    if (!raw) continue;
    const env = safeParse<unknown>(raw);
    if (!env || env.expiresAt <= now) {
      try {
        store.removeItem(key);
      } catch (err) {
        warnCache("prune failed", err);
      }
      continue;
    }
    total += raw.length;
    metas.push({ key, savedAt: env.savedAt || 0, size: raw.length });
  }

  if (total <= MAX_STORAGE_CHARS) return;
  metas.sort((a, b) => a.savedAt - b.savedAt);
  for (const meta of metas) {
    if (total <= MAX_STORAGE_CHARS) break;
    try {
      store.removeItem(meta.key);
      total -= meta.size;
    } catch (err) {
      warnCache("prune failed", err);
    }
  }
}

export function getAgriPersistentCache<T>(
  namespace: string,
  key: string,
): T | null {
  const store = storage();
  if (!store || !key) return null;
  const fk = fullKey(namespace, key);
  try {
    const env = safeParse<T>(store.getItem(fk));
    if (!env) return null;
    if (env.expiresAt <= Date.now()) {
      store.removeItem(fk);
      return null;
    }
    return env.value as T;
  } catch (err) {
    agroV5Log("persistent cache read failed", errorDetail(err));
    return null;
  }
}

export function setAgriPersistentCache<T>(
  namespace: string,
  key: string,
  value: T,
  ttlMs: number = AGRI_PERSIST_TTL_MS,
): boolean {
  const store = storage();
  if (!store || !key) return false;
  const fk = fullKey(namespace, key);
  const now = Date.now();
  const envelope: PersistEnvelope<T> = {
    v: CACHE_SCHEMA_VERSION,
    expiresAt: now + Math.max(0, ttlMs),
    savedAt: now,
    value,
  };
  let raw: string;
  try {
    raw = JSON.stringify(envelope);
  } catch (err) {
    agroV5Log("persistent cache serialise failed", errorDetail(err));
    return false;
  }
  if (raw.length > MAX_ENTRY_CHARS) return false;
  try {
    store.setItem(fk, raw);
    pruneAgriPersistentCache(now);
    return true;
  } catch (firstErr) {
    agroV5Log("persistent cache write retry", errorDetail(firstErr));
    // Quota — prune and retry once.
    try {
      pruneAgriPersistentCache(now);
      store.setItem(fk, raw);
      return true;
    } catch (err) {
      warnCache("write failed", err);
      agroV5Log("persistent cache write failed", errorDetail(err));
      return false;
    }
  }
}

export function removeAgriPersistentCache(
  namespace: string,
  key: string,
): void {
  const store = storage();
  if (!store || !key) return;
  try {
    store.removeItem(fullKey(namespace, key));
  } catch (err) {
    warnCache("remove failed", err);
  }
}

export function clearAgriPersistentNamespace(namespace: string): void {
  const store = storage();
  if (!store) return;
  for (let i = store.length - 1; i >= 0; i--) {
    const key = store.key(i);
    if (!key || !isNamespaceKey(key, namespace)) continue;
    try {
      store.removeItem(key);
    } catch (err) {
      warnCache("namespace clear failed", err);
    }
  }
}

/** Thrown by clearAgriPersistentCache when some keys could not be removed. */
export class AgriCacheClearError extends Error {
  readonly errors: readonly unknown[];

  constructor(errors: readonly unknown[], message: string) {
    super(message);
    this.name = "AgriCacheClearError";
    this.errors = errors;
  }
}

/**
 * Drops every persisted stat entry. Called on logout so the next user of a
 * shared PC never sees the previous user's aggregates. Storage errors are
 * thrown so the caller can record the incomplete cleanup.
 */
export function clearAgriPersistentCache(): void {
  const store = storage();
  if (!store) return;
  const keys: string[] = [];
  for (let i = 0; i < store.length; i++) {
    const key = store.key(i);
    if (key && key.startsWith(STORAGE_PREFIX)) keys.push(key);
  }
  const errors: unknown[] = [];
  for (const key of keys) {
    try {
      store.removeItem(key);
    } catch (err) {
      errors.push(err);
    }
  }
  if (errors.length > 0) {
    throw new AgriCacheClearError(
      errors,
      `persistent cache clear failed for ${errors.length} of ${keys.length} keys`,
    );
  }
}

/**
 * Promise-map helper: memory hit → return; else persistent hit → warm memory;
 * else run factory, persist resolved JSON value.
 */
export function rememberAsync<T>(opts: {
  memory: Map<string, Promise<T>>;
  namespace: string;
  key: string;
  factory: () => Promise<T>;
  ttlMs?: number;
  /** When true, delete memory entry on reject (default true). */
  dropMemoryOnError?: boolean;
}): Promise<T> {
  const { memory, namespace, key, factory } = opts;
  const existing = memory.get(key);
  if (existing) return existing;

  const persisted = getAgriPersistentCache<T>(namespace, key);
  if (persisted != null) {
    const warmed = Promise.resolve(persisted);
    memory.set(key, warmed);
    return warmed;
  }

  const request = factory()
    .then((value) => {
      if (opts.ttlMs !== 0) {
        setAgriPersistentCache(namespace, key, value, opts.ttlMs);
      }
      return value;
    })
    .catch((err) => {
      if (opts.dropMemoryOnError !== false && memory.get(key) === request) {
        memory.delete(key);
      }
      throw err;
    });

  memory.set(key, request);
  return request;
}
