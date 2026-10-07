import { resetStatsQueryScheduler, withStatsQuerySlot } from "./agri-query-scheduler";

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
