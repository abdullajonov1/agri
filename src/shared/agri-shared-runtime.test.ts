interface MockUser {
  firstName?: string;
  lastName?: string;
  fullName?: string;
  username?: string;
  email?: string;
}

interface FakeJmv {
  id: string;
  view: { ready?: boolean } | null;
}

interface FakeGroup {
  getActiveJimuMapView?: () => FakeJmv | null;
  getAllJimuMapViews?: () => FakeJmv[];
}

let mockUser: MockUser | null = null;
let mockStoreThrows = false;
let mockGroup: FakeGroup | null = null;
const loadModulesMock = jest.fn();

jest.mock("jimu-core", () => ({
  getAppStore: () => ({
    getState: (): { user: MockUser | null } => {
      if (mockStoreThrows) throw new Error("no store");
      return { user: mockUser };
    },
  }),
}));

jest.mock("jimu-arcgis", () => ({
  loadArcGISJSAPIModules: (mods: string[]): Promise<unknown> => loadModulesMock(mods),
  MapViewManager: {
    getInstance: (): { getJimuMapViewGroup: (id: string) => FakeGroup | null } => ({
      getJimuMapViewGroup: (): FakeGroup | null => {
        if (mockGroup === null) throw new Error("no group");
        return mockGroup;
      },
    }),
  },
}));

import { getAccountDisplayInfo } from "./getAccountDisplayInfo";
import { isMapViewReady, resolveJimuMapView } from "./map-connection-service";
import { createSingletonLayerLoader } from "./agri-singleton-layer-loader";
import type { JimuMapView } from "jimu-arcgis";

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  mockUser = null;
  mockStoreThrows = false;
  mockGroup = null;
  loadModulesMock.mockReset();
});

describe("getAccountDisplayInfo", () => {
  test("prefers exb_auth email from localStorage, then sessionStorage", () => {
    localStorage.setItem("exb_auth", JSON.stringify({ email: " ali@x.uz " }));
    sessionStorage.setItem("exb_auth", JSON.stringify({ email: "vali@x.uz" }));
    expect(getAccountDisplayInfo()).toEqual({ displayName: "ali@x.uz", initial: "A" });
    localStorage.clear();
    expect(getAccountDisplayInfo()).toEqual({ displayName: "vali@x.uz", initial: "V" });
  });

  test("invalid exb_auth JSON falls through to user state", () => {
    localStorage.setItem("exb_auth", "{not json");
    mockUser = { firstName: "olim", lastName: "Karimov" };
    expect(getAccountDisplayInfo()).toEqual({ displayName: "olim Karimov", initial: "O" });
  });

  test("user state fallbacks: fullName, username, email", () => {
    mockUser = { fullName: "Full Name" };
    expect(getAccountDisplayInfo().displayName).toBe("Full Name");
    mockUser = { fullName: "  ", username: "user1" };
    expect(getAccountDisplayInfo().displayName).toBe("user1");
    mockUser = { email: "e@x.uz" };
    expect(getAccountDisplayInfo().displayName).toBe("e@x.uz");
  });

  test("no info or throwing store -> anonymous 'U'", () => {
    mockUser = {};
    expect(getAccountDisplayInfo()).toEqual({ displayName: "", initial: "U" });
    mockStoreThrows = true;
    expect(getAccountDisplayInfo()).toEqual({ displayName: "", initial: "U" });
  });
});

describe("resolveJimuMapView / isMapViewReady", () => {
  test("empty id -> null", () => {
    expect(resolveJimuMapView("  ")).toBeNull();
  });

  test("returns active view when it has a view", () => {
    const active: FakeJmv = { id: "a", view: { ready: true } };
    mockGroup = { getActiveJimuMapView: () => active };
    expect(resolveJimuMapView("map1")).toBe(active);
  });

  test("falls back to first view-bearing JMV in the group", () => {
    const second: FakeJmv = { id: "b", view: {} };
    mockGroup = {
      getActiveJimuMapView: () => ({ id: "a", view: null }),
      getAllJimuMapViews: () => [{ id: "x", view: null }, second],
    };
    expect(resolveJimuMapView("map1")).toBe(second);
  });

  test("no views -> null; manager error -> null", () => {
    mockGroup = {};
    expect(resolveJimuMapView("map1")).toBeNull();
    mockGroup = null;
    expect(resolveJimuMapView("map1")).toBeNull();
  });

  test("isMapViewReady requires view.ready === true", () => {
    expect(isMapViewReady(null)).toBe(false);
    expect(isMapViewReady({ view: { ready: false } } as unknown as JimuMapView)).toBe(false);
    expect(isMapViewReady({ view: { ready: true } } as unknown as JimuMapView)).toBe(true);
  });
});

describe("createSingletonLayerLoader", () => {
  interface FakeLayerInit {
    url: string;
  }

  function featureLayerCtor(loadImpl: () => Promise<void>): jest.Mock {
    return jest.fn().mockImplementation((init: FakeLayerInit) => ({
      url: init.url,
      title: "T",
      fields: [{ name: "a" }, { name: "b" }],
      load: jest.fn(loadImpl),
    }));
  }

  test("loads once, reports field names and logs success", async () => {
    const Ctor = featureLayerCtor(() => Promise.resolve());
    loadModulesMock.mockResolvedValue([Ctor]);
    const log = jest.fn();
    const load = createSingletonLayerLoader(() => "https://svc/0", log);

    const [a, b] = await Promise.all([load(), load()]);
    expect(a).toBe(b);
    expect(a.fields).toEqual(["a", "b"]);
    expect(Ctor).toHaveBeenCalledTimes(1);
    expect(Ctor).toHaveBeenCalledWith({ url: "https://svc/0" });
    expect(log).toHaveBeenCalledWith("load:start", { url: "https://svc/0" });
    expect(log).toHaveBeenCalledWith("load:success", expect.objectContaining({ fieldCount: 2 }));
  });

  test("failure logs http status, rethrows, and allows retry", async () => {
    const err = Object.assign(new Error("Forbidden"), { details: { httpStatus: 403 } });
    const failing = featureLayerCtor(() => Promise.reject(err));
    const ok = featureLayerCtor(() => Promise.resolve());
    loadModulesMock.mockResolvedValueOnce([failing]).mockResolvedValueOnce([ok]);
    const log = jest.fn();
    const load = createSingletonLayerLoader(() => "u", log);

    await expect(load()).rejects.toBe(err);
    expect(log).toHaveBeenCalledWith("load:FAILED", { url: "u", error: "Forbidden", status: 403 });
    await expect(load()).resolves.toEqual(expect.objectContaining({ fields: ["a", "b"] }));
  });

  test("non-object errors report null status", async () => {
    loadModulesMock.mockRejectedValue("boom");
    const log = jest.fn();
    const load = createSingletonLayerLoader(() => "u", log);
    await expect(load()).rejects.toBe("boom");
    expect(log).toHaveBeenCalledWith("load:FAILED", expect.objectContaining({ status: null }));
  });

  test("top-level httpStatus is used when details are missing", async () => {
    loadModulesMock.mockRejectedValue({ httpStatus: 500 });
    const log = jest.fn();
    await expect(createSingletonLayerLoader(() => "u", log)()).rejects.toEqual({ httpStatus: 500 });
    expect(log).toHaveBeenCalledWith("load:FAILED", expect.objectContaining({ status: 500 }));
  });
});
