/**
 * Request lane for export-image.
 *
 * The image API slows down sharply when it clips several rasters at once,
 * and the browser opens at most 6 connections to one host. Hover prefetch
 * used to fire an export-image for every field the cursor rested on, so the
 * request for the field the user actually clicked waited behind them
 * (seconds of server time each). This lane:
 *   - runs at most MAX_ACTIVE_EXPORT_REQUESTS requests at once;
 *   - starts "high" work (selection, chart, overlay, compare panel) first;
 *   - keeps only the newest queued "low" (hover prefetch) request.
 */

export type ExportImagePriority = "high" | "low";

/** Concurrent export-image requests the page may have in flight. */
export const MAX_ACTIVE_EXPORT_REQUESTS = 2;
/** Queued hover prefetches kept; older ones are dropped. */
const MAX_QUEUED_LOW = 1;

/** Rejection for a queued low-priority request replaced by a newer one. */
export class ExportImageSupersededError extends Error {
  constructor() {
    super("Export-image prefetch superseded by a newer request.");
    this.name = "ExportImageSupersededError";
  }
}

interface LaneJob {
  key: string;
  start: () => void;
  drop: () => void;
}

let active = 0;
let highQueue: readonly LaneJob[] = [];
let lowQueue: readonly LaneJob[] = [];

const pump = (): void => {
  while (active < MAX_ACTIVE_EXPORT_REQUESTS) {
    const next = highQueue[0] ?? lowQueue[0];
    if (!next) return;
    if (highQueue[0] === next) highQueue = highQueue.slice(1);
    else lowQueue = lowQueue.slice(1);
    active += 1;
    next.start();
  }
};

const enqueueLow = (job: LaneJob): void => {
  const kept = [...lowQueue, job];
  const overflow = kept.length - MAX_QUEUED_LOW;
  const dropped = overflow > 0 ? kept.slice(0, overflow) : [];
  lowQueue = overflow > 0 ? kept.slice(overflow) : kept;
  dropped.forEach((d) => { d.drop(); });
};

/** Run `task` through the lane; resolves/rejects with the task's result. */
export function scheduleExportImage<T>(
  key: string,
  priority: ExportImagePriority,
  task: () => Promise<T>,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const job: LaneJob = {
      key,
      start: () => {
        task()
          .then(resolve, reject)
          .finally(() => {
            active = Math.max(0, active - 1);
            pump();
          });
      },
      drop: () => { reject(new ExportImageSupersededError()); },
    };
    if (priority === "high") highQueue = [...highQueue, job];
    else enqueueLow(job);
    pump();
  });
}

/** A queued hover prefetch that is now needed for real moves to the high queue. */
export function promoteExportImage(key: string): void {
  const job = lowQueue.find((j) => j.key === key);
  if (!job) return;
  lowQueue = lowQueue.filter((j) => j !== job);
  highQueue = [...highQueue, job];
  pump();
}

/** Test helper: forget all queued work and counters. */
export function resetExportImageLane(): void {
  active = 0;
  highQueue = [];
  lowQueue = [];
}
