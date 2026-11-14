import {
  AGRI_PERSIST_TTL_MS,
  AgriCacheClearError,
  clearAgriPersistentCache,
  clearAgriPersistentNamespace,
  getAgriPersistentCache,
  pruneAgriPersistentCache,
  rememberAsync,
  removeAgriPersistentCache,
  setAgriPersistentCache,
} from "./agri-persistent-cache";

import { agroV5Log } from "../gis/agri-debug-log";

jest.mock("../gis/agri-debug-log", () => ({ agroV5Log: jest.fn() }));

const mockState: { user?: { username?: string } | null; throws?: boolean } = {};
jest.mock(
  "jimu-core",
  () => ({
    getAppStore: () => {
      if (mockState.throws) throw new Error("no store");
      return { getState: () => ({ user: mockState.user }) };
    },
  }),
  { virtual: true },
);

const PREFIX = "agri_v5_pc:alice:";

describe("agri-persistent-cache", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    (agroV5Log as jest.Mock).mockClear();
    localStorage.clear();
    mockState.user = { username: "alice" };
    mockState.throws = false;
  });

  describe("per-user scoping", () => {
    test("a different user never reads another user's entries", () => {
      setAgriPersistentCache("stats", "k", 1);
      mockState.user = { username: "bob" };
      expect(getAgriPersistentCache("stats", "k")).toBeNull();
      setAgriPersistentCache("stats", "k", 2);
      expect(localStorage.getItem("agri_v5_pc:bob:stats:k")).not.toBeNull();
      mockState.user = { username: "alice" };
      expect(getAgriPersistentCache("stats", "k")).toBe(1);
    });

    test("falls back to anon when no user or the store throws", () => {
      mockState.user = null;
      setAgriPersistentCache("stats", "k", 1);
      expect(localStorage.getItem("agri_v5_pc:anon:stats:k")).not.toBeNull();
      mockState.throws = true;
      expect(getAgriPersistentCache("stats", "k")).toBe(1);
    });

    test("clearNamespace clears that namespace for every user", () => {
      setAgriPersistentCache("a", "1", 1);
      setAgriPersistentCache("b", "1", 2);
      mockState.user = { username: "bob" };
      setAgriPersistentCache("a", "1", 3);
      clearAgriPersistentNamespace("a");
      expect(localStorage.getItem("agri_v5_pc:alice:a:1")).toBeNull();
      expect(localStorage.getItem("agri_v5_pc:bob:a:1")).toBeNull();
      expect(localStorage.getItem("agri_v5_pc:alice:b:1")).not.toBeNull();
    });

    test("clearAgriPersistentCache removes all users' keys", () => {
      setAgriPersistentCache("a", "1", 1);
      mockState.user = { username: "bob" };
      setAgriPersistentCache("a", "1", 3);
      clearAgriPersistentCache();
      expect(localStorage.length).toBe(0);
    });
  });

  describe("schema version and per-key clear", () => {
    test("writes the schema version into the envelope", () => {
      setAgriPersistentCache("stats", "k", 1);
      const env = JSON.parse(localStorage.getItem(`${PREFIX}stats:k`) || "{}");
      expect(env.v).toBe(1);
    });

    test("treats missing or different version as a miss", () => {
      const far = Date.now() + 1e9;
      localStorage.setItem(
        `${PREFIX}stats:old`,
        JSON.stringify({ expiresAt: far, savedAt: 1, value: 1 }),
      );
      localStorage.setItem(
        `${PREFIX}stats:next`,
        JSON.stringify({ v: 2, expiresAt: far, savedAt: 1, value: 1 }),
      );
      expect(getAgriPersistentCache("stats", "old")).toBeNull();
      expect(getAgriPersistentCache("stats", "next")).toBeNull();
    });

    test("prune drops entries with a missing or different version", () => {
      const far = Date.now() + 1e9;
      localStorage.setItem(
        `${PREFIX}stats:old`,
        JSON.stringify({ expiresAt: far, savedAt: 1, value: 1 }),
      );
      setAgriPersistentCache("stats", "ok", 2);
      pruneAgriPersistentCache();
      expect(localStorage.getItem(`${PREFIX}stats:old`)).toBeNull();
      expect(getAgriPersistentCache("stats", "ok")).toBe(2);
    });

    test("clear continues after a failure and throws one aggregate error", () => {
      setAgriPersistentCache("a", "1", 1);
      setAgriPersistentCache("a", "2", 2);
      setAgriPersistentCache("a", "3", 3);
      const real = Storage.prototype.removeItem;
      jest
        .spyOn(Storage.prototype, "removeItem")
        .mockImplementation(function (this: Storage, k: string) {
          if (k.endsWith(":a:1")) throw new Error("denied");
          real.call(this, k);
        });
      let thrown: unknown;
      try {
        clearAgriPersistentCache();
      } catch (err) {
        thrown = err;
      }
      expect(thrown).toBeInstanceOf(AgriCacheClearError);
      expect((thrown as AgriCacheClearError).message).toMatch(/1 of 3/);
      expect((thrown as AgriCacheClearError).errors).toHaveLength(1);
      expect(localStorage.getItem(`${PREFIX}a:2`)).toBeNull();
      expect(localStorage.getItem(`${PREFIX}a:3`)).toBeNull();
    });
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
      JSON.stringify({ v: 1, expiresAt: 1, savedAt: 0, value: 1 }),
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
        JSON.stringify({ v: 1, expiresAt: far, savedAt: i, value: big }),
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

  describe("failure logging", () => {
    test("logs corrupt JSON and still returns null", () => {
      localStorage.setItem(`${PREFIX}stats:bad`, "{not json");
      expect(getAgriPersistentCache("stats", "bad")).toBeNull();
      expect(agroV5Log).toHaveBeenCalledWith(
        "persistent cache parse failed",
        expect.any(Object),
      );
    });

    test("logs a throwing getItem and returns null", () => {
      jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
        throw new Error("denied");
      });
      expect(getAgriPersistentCache("stats", "k")).toBeNull();
      expect(agroV5Log).toHaveBeenCalledWith(
        "persistent cache read failed",
        expect.any(Object),
      );
    });

    test("logs unavailable storage and returns null/false", () => {
      jest.spyOn(window, "localStorage", "get").mockImplementation(() => {
        throw new Error("blocked");
      });
      expect(getAgriPersistentCache("stats", "k")).toBeNull();
      expect(setAgriPersistentCache("stats", "k", 1)).toBe(false);
      expect(agroV5Log).toHaveBeenCalledWith(
        "persistent cache storage unavailable",
        expect.any(Object),
      );
    });

    test("warns with the same text and returns false when writes fail", () => {
      const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
      jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new Error("quota");
      });
      expect(setAgriPersistentCache("stats", "k", 1)).toBe(false);
      expect(warn).toHaveBeenCalledWith(
        "[AgroV5] persistent cache write failed",
        expect.any(Error),
      );
      expect(agroV5Log).toHaveBeenCalledWith(
        "persistent cache write failed",
        expect.any(Object),
      );
    });

    test("warns with the same text when remove fails", () => {
      const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
      jest.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
        throw new Error("nope");
      });
      removeAgriPersistentCache("stats", "k");
      expect(warn).toHaveBeenCalledWith(
        "[AgroV5] persistent cache remove failed",
        expect.any(Error),
      );
    });
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
