const mockReadToken = jest.fn<string | null, [{ allowGenericStorageKeys: boolean }]>();
const mockLoadModules = jest.fn<Promise<unknown[]>, [string[]]>();

jest.mock("jimu-arcgis", () => ({
  loadArcGISJSAPIModules: (mods: string[]) => mockLoadModules(mods),
}));
jest.mock("../agri-auth-token", () => ({
  readAgriAuthToken: (opts: { allowGenericStorageKeys: boolean }) => mockReadToken(opts),
}));

import type FeatureLayer from "esri/layers/FeatureLayer";
import type IdentityManager from "esri/identity/IdentityManager";
import { setAgriServiceUrls } from "../../shared/agri-service-urls";
import {
  getAgriDistrictBoundaryFallbackUrl,
  getAgriDistrictBoundaryUrl,
  getAgriRegionBoundaryUrl,
  getDetachedQueryLayer,
  getDistrictLayerUrlCandidates,
  loadBoundaryModules,
  registerServerToken,
} from "./boundary-modules";

afterEach(() => setAgriServiceUrls(undefined));

describe("boundary service urls", () => {
  test("default urls come from agri service config", () => {
    expect(getAgriRegionBoundaryUrl()).toMatch(/Hosted\/regions\/FeatureServer\/5$/);
    expect(getAgriDistrictBoundaryUrl()).toMatch(/Hosted\/district\/FeatureServer\/3$/);
    expect(getAgriDistrictBoundaryFallbackUrl()).toMatch(/Tuman_chegara\/FeatureServer\/0$/);
  });

  test("district candidates: fallback first, deduped", () => {
    expect(getDistrictLayerUrlCandidates()).toEqual([
      getAgriDistrictBoundaryFallbackUrl(),
      getAgriDistrictBoundaryUrl(),
    ]);
    setAgriServiceUrls({ adminDistrictsUrl: "https://x/d", adminDistrictsFallbackUrl: "https://x/d" });
    expect(getDistrictLayerUrlCandidates()).toEqual(["https://x/d"]);
  });
});

describe("registerServerToken", () => {
  test("does nothing without a token", () => {
    mockReadToken.mockReturnValue(null);
    const registerToken = jest.fn();
    registerServerToken({ registerToken } as unknown as typeof IdentityManager);
    expect(registerToken).not.toHaveBeenCalled();
  });

  test("registers token for server prefixes and portal, never using generic keys", () => {
    mockReadToken.mockReturnValue("tok");
    setAgriServiceUrls({ arcgisServer: "https://gis/server/", portalUrl: "https://gis/portal" });
    const registerToken = jest.fn().mockImplementationOnce(() => {
      throw new Error("bad prefix");
    });
    registerServerToken({ registerToken } as unknown as typeof IdentityManager);
    expect(mockReadToken).toHaveBeenCalledWith({ allowGenericStorageKeys: false });
    expect(registerToken.mock.calls.map((c) => (c[0] as { server: string }).server)).toEqual([
      "https://gis/server/rest/services",
      "https://gis/server/rest",
      "https://gis/server",
      "https://gis/portal/sharing/rest",
    ]);
  });
});

describe("loadBoundaryModules", () => {
  test("loads once and maps module order", async () => {
    mockLoadModules.mockResolvedValue(["FL", "GL", "G", "IM"]);
    const first = await loadBoundaryModules();
    const second = await loadBoundaryModules();
    expect(first).toBe(second);
    expect(first).toEqual({ FeatureLayer: "FL", GraphicsLayer: "GL", Graphic: "G", IdentityManager: "IM" });
    expect(mockLoadModules).toHaveBeenCalledTimes(1);
  });
});

describe("getDetachedQueryLayer", () => {
  const makeCls = (load: () => Promise<void>): { Cls: typeof FeatureLayer; ctor: jest.Mock } => {
    const ctor = jest.fn();
    class Fake {
      url: string;
      constructor(props: { url: string }) {
        ctor(props);
        this.url = props.url;
      }
      load(): Promise<void> {
        return load();
      }
    }
    return { Cls: Fake as unknown as typeof FeatureLayer, ctor };
  };

  test("rejects empty url", async () => {
    const { Cls } = makeCls(() => Promise.resolve());
    await expect(getDetachedQueryLayer(Cls, "  ")).rejects.toThrow("empty district layer url");
  });

  test("caches one layer per url", async () => {
    const { Cls, ctor } = makeCls(() => Promise.resolve());
    const a = await getDetachedQueryLayer(Cls, " https://ok/0 ");
    const b = await getDetachedQueryLayer(Cls, "https://ok/0");
    expect(a).toBe(b);
    expect(ctor).toHaveBeenCalledTimes(1);
    expect(ctor).toHaveBeenCalledWith({ url: "https://ok/0", outFields: ["*"] });
  });

  test("remembers failed urls and does not re-probe", async () => {
    const { Cls, ctor } = makeCls(() => Promise.reject("boom"));
    await expect(getDetachedQueryLayer(Cls, "https://bad/0")).rejects.toThrow("boom");
    await expect(getDetachedQueryLayer(Cls, "https://bad/0")).rejects.toThrow("previously failed");
    expect(ctor).toHaveBeenCalledTimes(1);
  });
});
