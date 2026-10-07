import { DataSourceManager, React } from "jimu-core";
import { MapViewManager, loadArcGISJSAPIModules } from "jimu-arcgis";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import EmbeddedAgriMap from "./embedded-agri-map";
import { setAgriAdminBordersVisible } from "../gis/agri-admin-boundary-layer";

interface FakeLayer {
  title: string;
  url: string;
  type: string;
  visible: boolean;
  opacity: number;
}

interface FakeMap {
  basemap: string | { id: string };
  load?: () => Promise<void>;
  allLayers?: { toArray: () => FakeLayer[] };
  ctorArgs: unknown;
}

interface FakeView {
  map: FakeMap;
  destroyed: boolean;
  zoom: number;
  center: unknown;
  constraints: { minZoom: number };
  ui: { remove: jest.Mock };
  when: jest.Mock<Promise<void>, []>;
  goTo: jest.Mock<Promise<void>, [unknown, unknown?]>;
  destroy: jest.Mock;
  resize: jest.Mock;
}

const state = {
  views: [] as FakeView[],
  maps: [] as FakeMap[],
  layers: [] as FakeLayer[],
  destroyJimu: jest.fn(),
  createJimu: jest.fn<Promise<{ id: string }>, [unknown]>(),
  loadModules: jest.fn(),
};

jest.mock("../assets/PlusLight.svg", () => "plus.svg", { virtual: true });
jest.mock("./assets/PlusLight.svg", () => "plus.svg", { virtual: true });
jest.mock("./assets/MinusLight.svg", () => "minus.svg", { virtual: true });
jest.mock("./assets/ExpandLight.svg", () => "expand.svg", { virtual: true });
jest.mock("./assets/CompressLight.svg", () => "compress.svg", { virtual: true });
jest.mock("./assets/basemap.svg", () => "basemap.svg", { virtual: true });
jest.mock("../gis/agri-admin-boundary-layer", () => ({
  readAgriAdminBordersVisible: jest.fn(() => true),
  setAgriAdminBordersVisible: jest.fn(async (): Promise<void> => undefined),
}));
jest.mock("../gis/feature-layer-data", () => ({
  looksLikeRegionYearLayerHaystack: (h: string) => h.includes("region-year"),
}));
jest.mock("jimu-core", () => ({
  ...jest.requireActual("jimu-core"),
  getAppStore: () => ({ getState: () => ({ portalUrl: "https://portal.test/" }) }),
  DataSourceManager: { getInstance: jest.fn() },
  DataSourceComponent: ({ onDataSourceCreated }: { onDataSourceCreated: (ds: object) => void }) => (
    <button type="button" data-testid="ds-component" onClick={() => onDataSourceCreated({ ready: async (): Promise<void> => undefined })} />
  ),
}));
jest.mock("jimu-arcgis", () => ({
  ...jest.requireActual("jimu-arcgis"),
  MapViewManager: { getInstance: jest.fn() },
  loadArcGISJSAPIModules: jest.fn(),
}));

const mockDsManager = DataSourceManager.getInstance as unknown as jest.Mock;
const mockViewManager = MapViewManager.getInstance as unknown as jest.Mock;
const mockLoad = loadArcGISJSAPIModules as unknown as jest.Mock;

class FakeMapCtor {
  basemap: string | { id: string };
  ctorArgs: unknown;
  load?: () => Promise<void>;
  allLayers?: { toArray: () => FakeLayer[] };
  constructor(args: { basemap?: string; portalItem?: unknown }) {
    this.ctorArgs = args;
    this.basemap = args.basemap ?? "none";
    if (args.portalItem) {
      this.load = async () => undefined;
      this.allLayers = { toArray: () => state.layers };
    }
    state.maps.push(this as unknown as FakeMap);
  }
}

class FakeViewCtor {
  map: FakeMap;
  destroyed = false;
  zoom = 6;
  center = { x: 1 };
  constraints = { minZoom: 5 };
  ui = { remove: jest.fn() };
  when = jest.fn(async (): Promise<void> => undefined);
  goTo = jest.fn(async (_target: unknown, _opts?: unknown): Promise<void> => undefined);
  destroy = jest.fn();
  resize = jest.fn();
  constructor(args: { map: FakeMap }) {
    this.map = args.map;
    state.views.push(this as unknown as FakeView);
  }
}

interface Callbacks {
  onViewReady: jest.Mock;
  onLoadingChange: jest.Mock;
  onError: jest.Mock;
}

const mount = (props: Partial<React.ComponentProps<typeof EmbeddedAgriMap>> = {}) => {
  const cb: Callbacks = { onViewReady: jest.fn(), onLoadingChange: jest.fn(), onError: jest.fn() };
  const utils = render(
    <div className="agri-dashboard-map-slot">
      <EmbeddedAgriMap mapWidgetId="w1-embedded-map" {...cb} {...props} />
    </div>,
  );
  return { ...utils, ...cb };
};

const readyView = async (cb: Callbacks): Promise<FakeView> => {
  await waitFor(() => expect(cb.onViewReady).toHaveBeenCalled());
  return state.views[state.views.length - 1];
};

describe("EmbeddedAgriMap", () => {
  beforeEach(() => {
    state.views = [];
    state.maps = [];
    state.layers = [];
    state.destroyJimu.mockReset();
    state.createJimu.mockReset();
    state.createJimu.mockResolvedValue({ id: "jv1" });
    mockLoad.mockReset();
    mockLoad.mockResolvedValue([FakeMapCtor, FakeMapCtor, FakeViewCtor, class { constructor(public args: unknown) {} }]);
    mockViewManager.mockReturnValue({ createJimuMapView: state.createJimu, destroyJimuMapView: state.destroyJimu });
    mockDsManager.mockReturnValue({ getDataSource: jest.fn((): null => null) });
    window.localStorage.clear();
    document.documentElement.className = "";
    jest.mocked(setAgriAdminBordersVisible).mockClear();
  });

  test("renders localized controls and falls back to Uzbek Latin", () => {
    mount();
    expect(screen.getByLabelText("Yaqinlashtirish")).toBeTruthy();
    expect(screen.getByLabelText("Uzoqlashtirish")).toBeTruthy();
    expect(screen.getByLabelText("To'liq ekranga o'tish")).toBeTruthy();
  });

  test("reads the language from storage and reacts to languageChanged events", () => {
    window.localStorage.setItem("agri_app_lang", "ru");
    mount();
    expect(screen.getByLabelText("Приблизить")).toBeTruthy();
    act(() => {
      document.dispatchEvent(new CustomEvent("languageChanged", { detail: { lang: "en" } }));
    });
    expect(screen.getByLabelText("Zoom in")).toBeTruthy();
    act(() => {
      document.dispatchEvent(new CustomEvent("languageChanged", { detail: { code: "uz_cyr" } }));
    });
    expect(screen.getByLabelText("Яқинлаштириш")).toBeTruthy();
  });

  test("builds a basemap-only map and reports readiness", async () => {
    const cb = mount();
    const view = await readyView(cb);
    expect(cb.onLoadingChange).toHaveBeenNthCalledWith(1, true);
    expect(cb.onLoadingChange).toHaveBeenLastCalledWith(false);
    expect(view.map.basemap).toBe("dark-gray-vector");
    expect(state.createJimu).toHaveBeenCalledWith(
      expect.objectContaining({ mapWidgetId: "w1-embedded-map", view, isEnablePopup: false }),
    );
    expect(cb.onViewReady).toHaveBeenCalledWith({ id: "jv1" });
    expect(view.goTo).toHaveBeenCalled();
  });

  test("unmount destroys the JimuMapView and the view", async () => {
    const cb = mount();
    const view = await readyView(cb);
    cb.unmount();
    expect(state.destroyJimu).toHaveBeenCalledWith("jv1");
    expect(view.destroy).toHaveBeenCalled();
  });

  test("with a web map data source it loads the portal item and hides region-year layers", async () => {
    state.layers = [
      { title: "region-year 2023", url: "", type: "feature", visible: true, opacity: 0.4 },
      { title: "Group", url: "region-year", type: "group", visible: true, opacity: 1 },
      { title: "Roads", url: "", type: "feature", visible: true, opacity: 1 },
    ];
    mockDsManager.mockReturnValue({
      getDataSource: jest.fn(() => ({ itemId: "item1", portalUrl: "https://p.test/", ready: async (): Promise<void> => undefined })),
    });
    const cb = mount({ webMapDataSourceId: "wm" });
    await readyView(cb);
    const map = state.maps[0];
    expect(map.ctorArgs).toEqual({ portalItem: { id: "item1", portal: { url: "https://p.test" } } });
    expect(state.layers.map((l) => l.visible)).toEqual([false, true, true]);
    expect(state.layers[0].opacity).toBe(1);
  });

  test("does not start when the root data source is not available yet", async () => {
    const cb = mount({ webMapDataSourceId: "missing" });
    await act(async () => undefined);
    expect(state.views).toHaveLength(0);
    expect(cb.onViewReady).not.toHaveBeenCalled();
    // the hidden DataSourceComponent supplies the source once created
    mockDsManager.mockReturnValue({ getDataSource: jest.fn((): null => null) });
    fireEvent.click(screen.getByTestId("ds-component"));
    await readyView(cb);
    expect(state.views).toHaveLength(1);
  });

  test("reports API failures through onError with the error message", async () => {
    mockLoad.mockRejectedValueOnce(new Error("esri down"));
    const cb = mount();
    await waitFor(() => expect(cb.onError).toHaveBeenCalledWith("esri down"));
    expect(cb.onLoadingChange).toHaveBeenLastCalledWith(false);
  });

  test("non-Error failures use the default Uzbek message", async () => {
    mockLoad.mockRejectedValueOnce("nope");
    const cb = mount();
    await waitFor(() => expect(cb.onError).toHaveBeenCalledWith("Xaritani yuklab bo'lmadi"));
  });

  test("zoom buttons animate the view by one level", async () => {
    const cb = mount();
    const view = await readyView(cb);
    fireEvent.click(screen.getByLabelText("Yaqinlashtirish"));
    expect(view.goTo).toHaveBeenLastCalledWith(
      { center: view.center, zoom: 7 },
      expect.objectContaining({ animate: true }),
    );
    fireEvent.click(screen.getByLabelText("Uzoqlashtirish"));
    expect(view.goTo).toHaveBeenLastCalledWith({ center: view.center, zoom: 5 }, expect.anything());
    view.zoom = 5;
    fireEvent.click(screen.getByLabelText("Uzoqlashtirish"));
    expect(view.goTo).toHaveBeenLastCalledWith({ center: view.center, zoom: 5 }, expect.anything());
  });

  test("zoom does nothing before the view exists", () => {
    mockLoad.mockReturnValue(new Promise(() => undefined));
    mount();
    fireEvent.click(screen.getByLabelText("Yaqinlashtirish"));
    expect(state.views).toHaveLength(0);
  });

  test("basemap menu selects a basemap and toggles borders", async () => {
    const cb = mount();
    const view = await readyView(cb);
    fireEvent.click(screen.getByLabelText("Xarita turini tanlash"));
    expect(document.documentElement.classList.contains("agri-basemap-menu-open")).toBe(true);
    expect(screen.getByText("Asosiy xaritalar")).toBeTruthy();
    expect(screen.getByText("Qorong'u").getAttribute("aria-checked")).toBe("true");
    fireEvent.click(screen.getByText("Sun'iy yo'ldosh"));
    expect(view.map.basemap).toBe("satellite");
    expect(screen.queryByText("Asosiy xaritalar")).toBeNull();
    expect(document.documentElement.classList.contains("agri-basemap-menu-open")).toBe(false);

    fireEvent.click(screen.getByLabelText("Xarita turini tanlash"));
    fireEvent.click(screen.getByRole("switch"));
    expect(setAgriAdminBordersVisible).toHaveBeenCalledWith(view, false);
  });

  test("theme and region filter events switch the automatic basemap", async () => {
    const cb = mount();
    const view = await readyView(cb);
    act(() => {
      document.dispatchEvent(new CustomEvent("agriV11ThemeToggled", { detail: { isDarkTheme: false } }));
    });
    await waitFor(() => expect(view.map.basemap).toBe("gray-vector"));
    act(() => {
      document.dispatchEvent(new CustomEvent("agriV11ThemeToggled", { detail: { theme: "dark" } }));
    });
    await waitFor(() => expect(view.map.basemap).toBe("dark-gray-vector"));
    act(() => {
      document.dispatchEvent(new CustomEvent("masterFilterChanged", { detail: { filters: { viloyat: "Andijon" } } }));
    });
    await waitFor(() => expect(view.map.basemap).toBe("satellite"));
    act(() => {
      document.dispatchEvent(new CustomEvent("masterFilterChanged", { detail: { filters: {}, scope: { lockedViloyat: "" } } }));
    });
    await waitFor(() => expect(view.map.basemap).toBe("dark-gray-vector"));
  });

  test("initial theme comes from storage", async () => {
    window.localStorage.setItem("agri_v11_app_theme", "light");
    const cb = mount();
    const view = await readyView(cb);
    expect(view.map.basemap).toBe("gray-vector");
  });

  test("fullscreen button requests fullscreen on the map slot and exits when active", async () => {
    const request = jest.fn(async (): Promise<void> => undefined);
    const exit = jest.fn(async (): Promise<void> => undefined);
    Element.prototype.requestFullscreen = request;
    document.exitFullscreen = exit;
    const { container } = mount();
    fireEvent.click(screen.getByLabelText("To'liq ekranga o'tish"));
    await waitFor(() => expect(request).toHaveBeenCalled());
    const slot = container.querySelector(".agri-dashboard-map-slot") as HTMLElement;
    Object.defineProperty(document, "fullscreenElement", { configurable: true, get: () => slot });
    act(() => {
      document.dispatchEvent(new Event("fullscreenchange"));
    });
    expect(screen.getByLabelText("To'liq ekrandan chiqish").getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(screen.getByLabelText("To'liq ekrandan chiqish"));
    await waitFor(() => expect(exit).toHaveBeenCalled());
    Object.defineProperty(document, "fullscreenElement", { configurable: true, get: () => null });
  });

  test("a rejected fullscreen request is swallowed", async () => {
    Element.prototype.requestFullscreen = jest.fn(async () => {
      throw new Error("blocked");
    });
    mount();
    fireEvent.click(screen.getByLabelText("To'liq ekranga o'tish"));
    await act(async () => undefined);
    expect(screen.getByLabelText("To'liq ekranga o'tish")).toBeTruthy();
  });

  test("pressing the map asks settings to highlight this widget", () => {
    const listener = jest.fn();
    window.addEventListener("agri-main:map-settings-request", listener);
    const { container } = mount();
    fireEvent.pointerDown(container.querySelector(".agri-dashboard-embedded-map") as Element);
    const event = listener.mock.calls[0][0] as CustomEvent<{ widgetId: string }>;
    expect(event.detail.widgetId).toBe("w1");
    window.removeEventListener("agri-main:map-settings-request", listener);
  });

  test("feature layer root ids are used when no web map is configured", async () => {
    const getDataSource = jest.fn(() => ({ ready: async (): Promise<void> => undefined }));
    mockDsManager.mockReturnValue({ getDataSource });
    const cb = mount({ featureUseDataSources: [{ dataSourceId: "root-layer1" } as never] });
    await readyView(cb);
    expect(getDataSource).toHaveBeenCalledWith("root");
  });
});
