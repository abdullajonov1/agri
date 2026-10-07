import { Immutable, type IMUseDataSource } from "jimu-core";
import type { AllWidgetSettingProps } from "jimu-for-builder";
import type { AgriPopupConfig, IMConfig } from "../../config";
import type { PopupSettingHost } from "../popup-setting-host";
import type { FieldInfo, State } from "../agri-popup-setting";
import * as h from "./popup-setting-handlers";

type Patch = Partial<State> | ((s: State) => Partial<State>);

interface HostStub {
  host: PopupSettingHost;
  onSettingChange: jest.Mock<void, [{ id: string; config: { agriPopup?: AgriPopupConfig } }]>;
  stateOf: () => State;
}

const baseState = (over: Partial<State> = {}): State => ({
  dss: null,
  titleField: "",
  zoomToSelection: true,
  showMapPopup: false,
  allFields: [],
  fieldsToShowLocal: [],
  fieldOrder: [],
  popupFieldMenuOpen: false,
  ...over,
});

const fields = (...names: string[]): FieldInfo[] => names.map((name) => ({ name, alias: name.toUpperCase(), type: "string" }));

const makeHost = (
  agri: AgriPopupConfig | undefined,
  state: Partial<State> = {},
  extra: Partial<PopupSettingHost> = {},
): HostStub => {
  const onSettingChange = jest.fn<void, [{ id: string; config: { agriPopup?: AgriPopupConfig } }]>();
  let current = baseState(state);
  const host = {
    props: {
      id: "w1",
      config: agri === undefined ? undefined : Immutable({ agriPopup: agri }),
      useDataSources: Immutable([]),
      onSettingChange,
    } as unknown as AllWidgetSettingProps<IMConfig>,
    get state() {
      return current;
    },
    setState: jest.fn((patch: Patch) => {
      current = { ...current, ...(typeof patch === "function" ? patch(current) : patch) };
    }),
    forceUpdate: jest.fn(),
    initializeDataSources: jest.fn(),
    cleanupDataSources: jest.fn(),
    placePopupFieldMenu: jest.fn(),
    detachPopupFieldMenuListeners: jest.fn(),
    onPopupFieldMenuOutside: jest.fn(),
    getUseDataSourceKey: (value: unknown) => JSON.stringify(value ?? null),
    popupFieldButtonRef: { current: null },
    popupFieldMenuRef: { current: null },
    popupFieldListRef: { current: null },
    popupMenuFrame: null,
  } as unknown as PopupSettingHost;

  Object.assign(host, {
    toPlainAgri: (v: unknown) => h.toPlainAgri(host, v),
    getAgriConfig: () => h.getAgriConfig(host),
    ensureDashboardConfig: () => h.ensureDashboardConfig(host),
    updateAgriConfig: (p: Partial<AgriPopupConfig>) => h.updateAgriConfig(host, p),
    commitPopupFields: (f: string[], o: string[]) => h.commitPopupFields(host, f, o),
    orderedPopupFieldNames: () => h.orderedPopupFieldNames(host),
    mergeFieldOrder: (fs: FieldInfo[], saved: string[]) => {
      const names = fs.map((f) => f.name);
      return [...saved.filter((n) => names.includes(n)), ...names.filter((n) => !saved.includes(n))];
    },
    ...extra,
  });
  return { host, onSettingChange, stateOf: () => current };
};

const lastAgri = (s: HostStub): AgriPopupConfig =>
  (s.onSettingChange.mock.calls.at(-1)?.[0].config.agriPopup ?? {}) as AgriPopupConfig;

const checked = (v: boolean) => ({ target: { checked: v } }) as never;

describe("config helpers", () => {
  test("toPlainAgri unwraps immutable, copies plain and tolerates empty", () => {
    const { host } = makeHost({});
    expect(h.toPlainAgri(host, undefined)).toEqual({});
    expect(h.toPlainAgri(host, Immutable({ titleField: "a" }))).toEqual({ titleField: "a" });
    const plain = { titleField: "b" };
    const copy = h.toPlainAgri(host, plain);
    expect(copy).toEqual(plain);
    expect(copy).not.toBe(plain);
  });

  test("ensureDashboardConfig returns stored config or a default with popup defaults", () => {
    const stored = makeHost({ titleField: "x" });
    expect(h.ensureDashboardConfig(stored.host)).toBe(stored.host.props.config);
    const fallback = h.ensureDashboardConfig(makeHost(undefined).host);
    expect(fallback.leftPanelWidthPercent).toBe(26);
    expect(fallback.agriPopup?.chartColor).toBe("#00a8e8");
  });

  test("updateAgriConfig merges patch and deep-merges settings", () => {
    const s = makeHost({ titleField: "t", settings: { zoomToSelection: true, showAttachments: true } });
    h.updateAgriConfig(s.host, { chartTitle: "c", settings: { showMapPopup: true } });
    expect(s.onSettingChange.mock.calls[0][0].id).toBe("w1");
    expect(lastAgri(s)).toMatchObject({
      titleField: "t",
      chartTitle: "c",
      settings: { zoomToSelection: true, showAttachments: true, showMapPopup: true },
    });
  });

  test("updateAgriConfig works with no stored config", () => {
    const s = makeHost(undefined);
    h.updateAgriConfig(s.host, { chartEnabled: true });
    expect(lastAgri(s).chartEnabled).toBe(true);
  });
});

describe("toggle / change handlers", () => {
  test("chart handlers write the matching key", () => {
    const s = makeHost({});
    h.onChartEnabledToggle(s.host, checked(true));
    expect(lastAgri(s).chartEnabled).toBe(true);
    h.onChartTypeChange(s.host, { target: { value: "line" } } as never);
    expect(lastAgri(s).chartType).toBe("line");
    h.onChartTitleChange(s.host, "T");
    expect(lastAgri(s).chartTitle).toBe("T");
    h.onChartColorChange(s.host, "#fff");
    expect(lastAgri(s).chartColor).toBe("#fff");
    h.onChartFieldsMultiSelect(s.host, {} as never, "a", ["a", 2]);
    expect(lastAgri(s).chartFields).toEqual(["a", "2"]);
  });

  test("behavior toggles update local state and config settings", () => {
    const s = makeHost({ settings: { showAttachments: true } });
    h.onZoomToggle(s.host, checked(false));
    expect(s.stateOf().zoomToSelection).toBe(false);
    expect(lastAgri(s).settings).toMatchObject({ zoomToSelection: false, showAttachments: true });
    h.onPopupToggle(s.host, checked(true));
    expect(s.stateOf().showMapPopup).toBe(true);
    expect(lastAgri(s).settings?.showMapPopup).toBe(true);
    h.onAttachmentsToggle(s.host, checked(false));
    expect(lastAgri(s).settings?.showAttachments).toBe(false);
    h.onAttachmentsToggle(s.host, undefined as never);
    expect(lastAgri(s).settings?.showAttachments).toBe(false);
  });

  test("formatFieldLabel delegates to the label formatter", () => {
    const { host } = makeHost({});
    expect(h.formatFieldLabel(host, { name: "n", alias: "Alias", type: "string" })).toContain("n");
  });
});

describe("field selection and ordering", () => {
  test("orderedPopupFieldNames honours saved order and appends new fields", () => {
    const s = makeHost({}, { allFields: fields("a", "b", "c"), fieldOrder: ["c", "a"] });
    expect(h.orderedPopupFieldNames(s.host)).toEqual(["c", "a", "b"]);
  });

  test("togglePopupField selects in display order and deselects", () => {
    const s = makeHost({}, { allFields: fields("a", "b", "c"), fieldOrder: ["c", "a", "b"], fieldsToShowLocal: ["a"] });
    h.togglePopupField(s.host, "c");
    expect(s.stateOf().fieldsToShowLocal).toEqual(["c", "a"]);
    expect(lastAgri(s).fieldsToShow).toEqual(["c", "a"]);
    expect(lastAgri(s).fieldOrder).toEqual(["c", "a", "b"]);
    h.togglePopupField(s.host, "a");
    expect(s.stateOf().fieldsToShowLocal).toEqual(["c"]);
  });

  test("reorderPopupOptions moves an item and keeps only selected fields", () => {
    const s = makeHost({}, { allFields: fields("a", "b", "c"), fieldOrder: ["a", "b", "c"], fieldsToShowLocal: ["a", "c"] });
    h.reorderPopupOptions(s.host, 0, 2);
    expect(s.stateOf().fieldOrder).toEqual(["b", "c", "a"]);
    expect(s.stateOf().fieldsToShowLocal).toEqual(["c", "a"]);
  });

  test("reorderPopupOptions ignores invalid moves", () => {
    const s = makeHost({}, { allFields: fields("a", "b"), fieldOrder: ["a", "b"] });
    h.reorderPopupOptions(s.host, 5, 0);
    expect(s.onSettingChange).not.toHaveBeenCalled();
  });
});

describe("field menu", () => {
  test("placePopupFieldMenu does nothing without a button", () => {
    const s = makeHost({}, { popupFieldMenuOpen: true });
    h.placePopupFieldMenu(s.host);
    expect(s.host.popupMenuFrame).toBeNull();
  });

  test("placePopupFieldMenu stores a frame once and re-renders only while open", () => {
    const s = makeHost({}, { popupFieldMenuOpen: true });
    const button = document.createElement("button");
    button.getBoundingClientRect = () => ({ top: 10, bottom: 40, left: 5, width: 200 }) as DOMRect;
    (s.host.popupFieldButtonRef as { current: HTMLButtonElement | null }).current = button;
    h.placePopupFieldMenu(s.host);
    expect(s.host.popupMenuFrame).toMatchObject({ left: 5, width: 200 });
    expect(s.host.forceUpdate).toHaveBeenCalledTimes(1);
    h.placePopupFieldMenu(s.host);
    expect(s.host.forceUpdate).toHaveBeenCalledTimes(1);
  });

  test("outside mousedown closes the menu, inside clicks do not", () => {
    const s = makeHost({}, { popupFieldMenuOpen: true });
    const root = document.createElement("div");
    const inside = document.createElement("span");
    root.appendChild(inside);
    (s.host.popupFieldMenuRef as { current: HTMLDivElement | null }).current = root;
    h.onPopupFieldMenuOutside(s.host, { target: inside } as unknown as MouseEvent);
    expect(s.stateOf().popupFieldMenuOpen).toBe(true);
    h.onPopupFieldMenuOutside(s.host, { target: document.body } as unknown as MouseEvent);
    expect(s.stateOf().popupFieldMenuOpen).toBe(false);
    const closed = makeHost({}, { popupFieldMenuOpen: false });
    h.onPopupFieldMenuOutside(closed.host, { target: document.body } as unknown as MouseEvent);
    expect(closed.host.setState).not.toHaveBeenCalled();
  });

  test("detach removes scroll and resize listeners", () => {
    const s = makeHost({});
    const remove = jest.spyOn(window, "removeEventListener");
    h.detachPopupFieldMenuListeners(s.host);
    expect(remove).toHaveBeenCalledWith("scroll", s.host.placePopupFieldMenu, true);
    expect(remove).toHaveBeenCalledWith("resize", s.host.placePopupFieldMenu);
    remove.mockRestore();
  });
});

describe("lifecycle", () => {
  test("mount initializes data sources and listens for outside clicks; unmount cleans up", () => {
    const s = makeHost({});
    const add = jest.spyOn(document, "addEventListener");
    const remove = jest.spyOn(document, "removeEventListener");
    h.componentDidMount(s.host);
    expect(s.host.initializeDataSources).toHaveBeenCalled();
    expect(add).toHaveBeenCalledWith("mousedown", s.host.onPopupFieldMenuOutside);
    h.componentWillUnmount(s.host);
    expect(remove).toHaveBeenCalledWith("mousedown", s.host.onPopupFieldMenuOutside);
    expect(s.host.cleanupDataSources).toHaveBeenCalled();
    expect(s.host.detachPopupFieldMenuListeners).toHaveBeenCalled();
    add.mockRestore();
    remove.mockRestore();
  });

  test("update re-initializes data sources only when the key changes", () => {
    const s = makeHost({});
    const prev = { ...s.host.props, useDataSources: Immutable([{ dataSourceId: "x" } as unknown as IMUseDataSource]) } as unknown as AllWidgetSettingProps<IMConfig>;
    h.componentDidUpdate(s.host, prev, s.stateOf());
    expect(s.host.initializeDataSources).toHaveBeenCalledTimes(1);
    h.componentDidUpdate(s.host, s.host.props, s.stateOf());
    expect(s.host.initializeDataSources).toHaveBeenCalledTimes(1);
  });

  test("update syncs local state from a changed config", () => {
    const s = makeHost(
      { fieldsToShow: ["a"], fieldOrder: ["b", "a"], settings: { zoomToSelection: false, showMapPopup: true } },
      { fieldsToShowLocal: [], fieldOrder: [] },
    );
    const prev = { ...s.host.props, config: Immutable({}) } as unknown as AllWidgetSettingProps<IMConfig>;
    h.componentDidUpdate(s.host, prev, s.stateOf());
    expect(s.stateOf()).toMatchObject({
      fieldsToShowLocal: ["a"],
      fieldOrder: ["b", "a"],
      zoomToSelection: false,
      showMapPopup: true,
    });
  });

  test("update keeps the local order when the config has none", () => {
    const s = makeHost({ fieldsToShow: [] }, { fieldOrder: ["z"] });
    const prev = { ...s.host.props, config: Immutable({}) } as unknown as AllWidgetSettingProps<IMConfig>;
    h.componentDidUpdate(s.host, prev, s.stateOf());
    expect(s.stateOf().fieldOrder).toEqual(["z"]);
  });

  test("opening the menu positions it and attaches listeners; closing detaches", () => {
    const s = makeHost({}, { popupFieldMenuOpen: true });
    const add = jest.spyOn(window, "addEventListener");
    h.componentDidUpdate(s.host, s.host.props, baseState({ popupFieldMenuOpen: false }));
    expect(s.host.placePopupFieldMenu).toHaveBeenCalled();
    expect(add).toHaveBeenCalledWith("scroll", s.host.placePopupFieldMenu, true);
    expect(add).toHaveBeenCalledWith("resize", s.host.placePopupFieldMenu);
    add.mockRestore();
    const closed = makeHost({}, { popupFieldMenuOpen: false });
    h.componentDidUpdate(closed.host, closed.host.props, baseState({ popupFieldMenuOpen: true }));
    expect(closed.host.detachPopupFieldMenuListeners).toHaveBeenCalled();
  });
});
