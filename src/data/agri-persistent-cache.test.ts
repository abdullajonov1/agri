import {
  AGRI_PERSIST_TTL_MS,
  clearAgriPersistentNamespace,
  getAgriPersistentCache,
  pruneAgriPersistentCache,
  rememberAsync,
  removeAgriPersistentCache,
  setAgriPersistentCache,
} from "./agri-persistent-cache";

const PREFIX = "agri_v5_pc:";

describe("agri-persistent-cache", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
  });

  test("round-trips a JSON value under a namespaced key", () => {
    expect(setAgriPersistentCache("stats", "k1", { a: 1 })).toBe(true);
    expect(localStorage.getItem(`${PREFIX}stats:k1`)).not.toBeNull();
    expect(getAgriPersistentCache("stats", "k1")).toEqual({ a: 1 });
  });

  test("returns null and evicts an expired entry", () => {
    const now = 1_000_000;
    jest.spyOn(Date, "now").mockReturnValue(now);
    setAgriPersistentCache("stats", "old", 5, 10);
    jest.spyOn(Date, "now").mockReturnValue(now + 11);
    expect(getAgriPersistentCache("stats", "old")).toBeNull();
    expect(localStorage.getItem(`${PREFIX}stats:old`)).toBeNull();
  });

  test("defaults to a one-hour TTL", () => {
    const now = 5_000;
    jest.spyOn(Date, "now").mockReturnValue(now);
    setAgriPersistentCache("stats", "k", 1);
    const env = JSON.parse(localStorage.getItem(`${PREFIX}stats:k`) || "{}");
    expect(env.expiresAt).toBe(now + AGRI_PERSIST_TTL_MS);
  });

  test("ignores corrupt JSON and envelopes without expiresAt", () => {
    localStorage.setItem(`${PREFIX}stats:bad`, "{not json");
    localStorage.setItem(`${PREFIX}stats:shape`, JSON.stringify({ value: 1 }));
    expect(getAgriPersistentCache("stats", "bad")).toBeNull();
    expect(getAgriPersistentCache("stats", "shape")).toBeNull();
  });

  test("refuses empty keys and oversized entries", () => {
    expect(setAgriPersistentCache("stats", "", 1)).toBe(false);
    expect(getAgriPersistentCache("stats", "")).toBeNull();
    expect(setAgriPersistentCache("stats", "big", "x".repeat(800_000))).toBe(
      false,
    );
  });

  test("refuses values JSON cannot serialise", () => {
    const cyclic: Record<string, unknown> = {};
    cyclic.self = cyclic;
    expect(setAgriPersistentCache("stats", "cyc", cyclic)).toBe(false);
  });

  test("prune drops expired keys and leaves foreign keys alone", () => {
    localStorage.setItem("other-app", "keep");
    localStorage.setItem(
      `${PREFIX}stats:gone`,
      JSON.stringify({ expiresAt: 1, savedAt: 0, value: 1 }),
    );
    pruneAgriPersistentCache(10);
    expect(localStorage.getItem(`${PREFIX}stats:gone`)).toBeNull();
    expect(localStorage.getItem("other-app")).toBe("keep");
  });

  test("prune evicts oldest entries when over the storage budget", () => {
    const big = "y".repeat(700_000);
    const far = Date.now() + 1e9;
    for (let i = 0; i < 4; i++) {
      localStorage.setItem(
        `${PREFIX}stats:e${i}`,
        JSON.stringify({ expiresAt: far, savedAt: i, value: big }),
      );
    }
    pruneAgriPersistentCache();
    expect(localStorage.getItem(`${PREFIX}stats:e0`)).toBeNull();
    expect(localStorage.getItem(`${PREFIX}stats:e3`)).not.toBeNull();
  });

  test("remove and namespace clear only touch their own keys", () => {
    setAgriPersistentCache("a", "1", 1);
    setAgriPersistentCache("a", "2", 2);
    setAgriPersistentCache("b", "1", 3);
    removeAgriPersistentCache("a", "1");
    expect(getAgriPersistentCache("a", "1")).toBeNull();
    clearAgriPersistentNamespace("a");
    expect(getAgriPersistentCache("a", "2")).toBeNull();
    expect(getAgriPersistentCache("b", "1")).toBe(3);
  });

  describe("rememberAsync", () => {
    test("runs the factory once and persists the result", async () => {
      const memory = new Map<string, Promise<number>>();
      const factory = jest.fn(async () => 7);
      const a = rememberAsync({ memory, namespace: "r", key: "k", factory });
      const b = rememberAsync({ memory, namespace: "r", key: "k", factory });
      await expect(Promise.all([a, b])).resolves.toEqual([7, 7]);
      expect(factory).toHaveBeenCalledTimes(1);
      expect(getAgriPersistentCache("r", "k")).toBe(7);
    });

    test("warms memory from storage without calling the factory", async () => {
      setAgriPersistentCache("r", "warm", 9);
      const memory = new Map<string, Promise<number>>();
      const factory = jest.fn(async () => 1);
      await expect(
        rememberAsync({ memory, namespace: "r", key: "warm", factory }),
      ).resolves.toBe(9);
      expect(factory).not.toHaveBeenCalled();
    });

    test("drops the memory entry when the factory rejects", async () => {
      const memory = new Map<string, Promise<number>>();
      const factory = jest.fn(async (): Promise<number> => {
        throw new Error("boom");
      });
      await expect(
        rememberAsync({ memory, namespace: "r", key: "fail", factory }),
      ).rejects.toThrow("boom");
      expect(memory.has("fail")).toBe(false);
    });

    test("ttlMs 0 skips persistence", async () => {
      const memory = new Map<string, Promise<number>>();
      await rememberAsync({
        memory,
        namespace: "r",
        key: "nopersist",
        factory: async () => 3,
        ttlMs: 0,
      });
      expect(getAgriPersistentCache("r", "nopersist")).toBeNull();
    });
  });
});
