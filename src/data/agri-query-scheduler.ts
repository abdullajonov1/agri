/**
 * Limits concurrent ArcGIS statistics queries from dashboard panels.
 * Prevents startup filter changes from opening 5+ parallel groupBy requests.
 */

const MAX_CONCURRENT_STATS_QUERIES = 2;

let activeSlots = 0;
/** Bumped on reset so releases from pre-reset tasks cannot touch the new state. */
let generation = 0;

interface Waiter {
  grant: () => void;
  reject: (error: Error) => void;
}

const waitQueue: Waiter[] = [];

function createResetError(): Error {
  return new Error("Query scheduler reset");
}

function releaseSlot(taskGeneration: number): void {
  if (taskGeneration !== generation) return;
  activeSlots = Math.max(0, activeSlots - 1);
  const next = waitQueue.shift();
  if (next) next.grant();
}

function acquireSlot(): Promise<void> {
  if (activeSlots < MAX_CONCURRENT_STATS_QUERIES) {
    activeSlots += 1;
    return Promise.resolve();
  }
  return new Promise<void>((resolve, reject) => {
    waitQueue.push({
      grant: () => {
        activeSlots += 1;
        resolve();
      },
      reject,
    });
  });
}

/** Run a stats query when a scheduler slot is available. */
export async function withStatsQuerySlot<T>(
  task: () => Promise<T>,
): Promise<T> {
  const taskGeneration = generation;
  await acquireSlot();
  try {
    return await task();
  } finally {
    releaseSlot(taskGeneration);
  }
}

/** Test / hot-reload helper. Queued waiters are rejected, not dropped. */
export function resetStatsQueryScheduler(): void {
  generation += 1;
  activeSlots = 0;
  const error = createResetError();
  waitQueue.splice(0).forEach((waiter) => { waiter.reject(error); });
  heavyLanes.forEach((lane) => {
    lane.queue.splice(0).forEach((waiter) => { waiter.reject(error); });
  });
  heavyLanes.clear();
}

/**
 * Heavy scans (the republic VH grouped scan, the Agri_table area download):
 * at most this many requests in flight per service. Both scans used to send
 * 16 uniqueid slices at once each; together with the per-region retry the
 * server ran out of service instances ("Wait timeout for the request
 * exceeded"), every request hit the 60 s client timeout, the VH bar never
 * finished and so never reached the persistent cache (2026-11-05).
 */
export const MAX_HEAVY_QUERIES_PER_SERVICE = 4;

interface HeavyLane {
  active: number;
  queue: Waiter[];
}

const heavyLanes = new Map<string, HeavyLane>();

/**
 * Run one request of a heavy scan when its service (`laneKey`, e.g. the
 * layer URL) has a free slot. Wrap single requests, not whole loops, so a
 * slot is never held while waiting for another one.
 */
export async function withHeavyQuerySlot<T>(
  laneKey: string,
  task: () => Promise<T>,
  limit: number = MAX_HEAVY_QUERIES_PER_SERVICE,
): Promise<T> {
  const key = String(laneKey || "default");
  let lane = heavyLanes.get(key);
  if (!lane) {
    lane = { active: 0, queue: [] };
    heavyLanes.set(key, lane);
  }
  const current = lane;
  if (current.active < Math.max(1, limit)) {
    current.active += 1;
  } else {
    await new Promise<void>((resolve, reject) => {
      current.queue.push({ grant: resolve, reject });
    });
  }
  try {
    return await task();
  } finally {
    const next = current.queue.shift();
    // Hand the slot straight to the next waiter; free it only when none wait.
    if (next) next.grant();
    else current.active = Math.max(0, current.active - 1);
  }
}
