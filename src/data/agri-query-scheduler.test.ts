import { resetStatsQueryScheduler, withHeavyQuerySlot, withStatsQuerySlot } from "./agri-query-scheduler";

interface Deferred {
  promise: Promise<string>;
  resolve: (v: string) => void;
  reject: (e: Error) => void;
}

function deferred(): Deferred {
  let resolve: (v: string) => void = () => undefined;
  let reject: (e: Error) => void = () => undefined;
  const promise = new Promise<string>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

const flush = (): Promise<void> => new Promise((r) => setTimeout(r, 0));

beforeEach(() => resetStatsQueryScheduler());

describe("withStatsQuerySlot", () => {
  test("runs at most 2 tasks concurrently and drains queue in order", async () => {
    const ds = [deferred(), deferred(), deferred()];
    const started: number[] = [];
    const results = ds.map((d, i) =>
      withStatsQuerySlot(() => {
        started.push(i);
        return d.promise;
      }),
    );
    await flush();
    expect(started).toEqual([0, 1]);

    ds[0].resolve("a");
    await flush();
    expect(started).toEqual([0, 1, 2]);

    ds[1].resolve("b");
    ds[2].resolve("c");
    await expect(Promise.all(results)).resolves.toEqual(["a", "b", "c"]);
  });

  test("a rejected task releases its slot and propagates the error", async () => {
    const failing = deferred();
    const blocker = deferred();
    const p1 = withStatsQuerySlot(() => failing.promise);
    const p2 = withStatsQuerySlot(() => blocker.promise);
    const third = jest.fn(() => Promise.resolve("ok"));
    const p3 = withStatsQuerySlot(third);
    await flush();
    expect(third).not.toHaveBeenCalled();

    failing.reject(new Error("query failed"));
    await expect(p1).rejects.toThrow("query failed");
    await expect(p3).resolves.toBe("ok");
    blocker.resolve("done");
    await expect(p2).resolves.toBe("done");
  });
});

describe("withHeavyQuerySlot", () => {
  test("at most `limit` requests per service; other services run independently", async () => {
    const ds = Array.from({ length: 6 }, () => deferred());
    const started: string[] = [];
    const run = (lane: string, i: number) =>
      withHeavyQuerySlot(lane, () => {
        started.push(`${lane}${i}`);
        return ds[i].promise;
      }, 2);
    const results = [run("veg", 0), run("veg", 1), run("veg", 2), run("tbl", 3), run("tbl", 4), run("tbl", 5)];
    await flush();
    expect(started).toEqual(["veg0", "veg1", "tbl3", "tbl4"]);

    ds[1].resolve("b");
    await flush();
    expect(started).toEqual(["veg0", "veg1", "tbl3", "tbl4", "veg2"]);

    ds.forEach((d, i) => { d.resolve(String(i)); });
    await expect(Promise.all(results)).resolves.toEqual(["0", "b", "2", "3", "4", "5"]);
  });

  test("a failed request frees its slot", async () => {
    const failing = deferred();
    const p1 = withHeavyQuerySlot("veg", () => failing.promise, 1);
    const second = jest.fn(() => Promise.resolve("ok"));
    const p2 = withHeavyQuerySlot("veg", second, 1);
    await flush();
    expect(second).not.toHaveBeenCalled();
    failing.reject(new Error("timeout"));
    await expect(p1).rejects.toThrow("timeout");
    await expect(p2).resolves.toBe("ok");
    // Lane is free again.
    await expect(withHeavyQuerySlot("veg", () => Promise.resolve("again"), 1)).resolves.toBe("again");
  });
});
