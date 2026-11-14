import {
  ExportImageSupersededError,
  promoteExportImage,
  resetExportImageLane,
  scheduleExportImage,
  MAX_ACTIVE_EXPORT_REQUESTS,
} from "./export-image-lane";

type Deferred = { promise: Promise<string>; resolve: (v: string) => void };
const deferred = (): Deferred => {
  let resolve: (v: string) => void = () => undefined;
  const promise = new Promise<string>((r) => { resolve = r; });
  return { promise, resolve };
};
const flush = async (): Promise<void> => {
  for (let i = 0; i < 5; i++) await Promise.resolve();
};

describe("export image lane", () => {
  beforeEach(() => { resetExportImageLane(); });

  test("runs at most MAX_ACTIVE_EXPORT_REQUESTS tasks at once", async () => {
    // Arrange
    const gates = [deferred(), deferred(), deferred()];
    const started: number[] = [];
    // Act
    gates.forEach((g, i) => {
      void scheduleExportImage(`k${i}`, "high", () => { started.push(i); return g.promise; });
    });
    await flush();
    // Assert
    expect(MAX_ACTIVE_EXPORT_REQUESTS).toBe(2);
    expect(started).toEqual([0, 1]);
    gates[0].resolve("a");
    await flush();
    expect(started).toEqual([0, 1, 2]);
  });

  test("a high-priority request starts before queued low-priority ones", async () => {
    const busy = [deferred(), deferred()];
    const started: string[] = [];
    busy.forEach((g, i) => { void scheduleExportImage(`busy${i}`, "high", () => g.promise); });
    void scheduleExportImage("hover", "low", () => { started.push("hover"); return Promise.resolve("h"); });
    void scheduleExportImage("click", "high", () => { started.push("click"); return Promise.resolve("c"); });
    await flush();
    busy[0].resolve("x");
    await flush();
    expect(started[0]).toBe("click");
  });

  test("only the newest queued low-priority request is kept", async () => {
    const busy = [deferred(), deferred()];
    busy.forEach((g, i) => { void scheduleExportImage(`busy${i}`, "high", () => g.promise); });
    const older = scheduleExportImage("hover1", "low", () => Promise.resolve("1"));
    const newer = scheduleExportImage("hover2", "low", () => Promise.resolve("2"));
    await expect(older).rejects.toBeInstanceOf(ExportImageSupersededError);
    busy[0].resolve("x");
    await expect(newer).resolves.toBe("2");
  });

  test("promoting a queued low request moves it ahead of other work", async () => {
    const busy = [deferred(), deferred()];
    const started: string[] = [];
    busy.forEach((g, i) => { void scheduleExportImage(`busy${i}`, "high", () => g.promise); });
    void scheduleExportImage("other", "high", () => { started.push("other"); return Promise.resolve("o"); });
    void scheduleExportImage("hover", "low", () => { started.push("hover"); return Promise.resolve("h"); });
    promoteExportImage("hover");
    await flush();
    busy[0].resolve("x");
    busy[1].resolve("y");
    await flush();
    expect(started).toEqual(["other", "hover"]);
    // A promoted low request is never dropped by a later hover.
    void scheduleExportImage("hover2", "low", () => Promise.resolve("h2"));
    await flush();
    expect(started).toContain("hover");
  });

  test("hover prefetch holds at most one slot, so a click starts at once", async () => {
    const slowHover = deferred();
    const started: string[] = [];
    void scheduleExportImage("hover1", "low", () => { started.push("hover1"); return slowHover.promise; });
    void scheduleExportImage("hover2", "low", () => { started.push("hover2"); return Promise.resolve("h2"); });
    await flush();
    expect(started).toEqual(["hover1"]);
    void scheduleExportImage("click", "high", () => { started.push("click"); return Promise.resolve("c"); });
    await flush();
    // hover2 waits: hover1 still holds the only low-priority slot.
    expect(started).toEqual(["hover1", "click"]);
    slowHover.resolve("h1");
    await flush();
    expect(started).toEqual(["hover1", "click", "hover2"]);
  });

  test("a failing task frees its slot", async () => {
    const started: string[] = [];
    void scheduleExportImage("a", "high", () => Promise.reject(new Error("boom"))).catch(() => undefined);
    void scheduleExportImage("b", "high", () => Promise.reject(new Error("boom"))).catch(() => undefined);
    void scheduleExportImage("c", "high", () => { started.push("c"); return Promise.resolve("c"); });
    await flush();
    expect(started).toEqual(["c"]);
  });
});
