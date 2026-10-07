import { boundaryErrorText } from "./boundary-error";

type PreferenceModule = typeof import("./boundary-preference");

/** Fresh module instance so the in-memory cache starts uninitialized. */
function loadPreference(): PreferenceModule {
  let mod: PreferenceModule | undefined;
  jest.isolateModules(() => {
    mod = jest.requireActual<PreferenceModule>("./boundary-preference");
  });
  if (!mod) throw new Error("boundary-preference failed to load");
  return mod;
}

describe("admin borders visibility preference", () => {
  afterEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
  });

  test("defaults to visible when nothing is stored", () => {
    expect(loadPreference().readAgriAdminBordersVisible()).toBe(true);
  });

  test("reads a stored hidden preference", () => {
    localStorage.setItem("agri_admin_borders_visible", "false");
    expect(loadPreference().readAgriAdminBordersVisible()).toBe(false);
  });

  test("write persists and updates the cached value", () => {
    const pref = loadPreference();
    pref.writeAgriAdminBordersVisible(false);
    expect(localStorage.getItem(pref.AGRI_ADMIN_BORDERS_STORAGE_KEY)).toBe("0");
    expect(pref.readAgriAdminBordersVisible()).toBe(false);
    pref.writeAgriAdminBordersVisible(true);
    expect(localStorage.getItem(pref.AGRI_ADMIN_BORDERS_STORAGE_KEY)).toBe("1");
  });

  test("survives blocked storage", () => {
    jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    const pref = loadPreference();
    expect(pref.readAgriAdminBordersVisible()).toBe(true);
    pref.writeAgriAdminBordersVisible(false);
    expect(pref.readAgriAdminBordersVisible()).toBe(false);
  });
});

describe("boundaryErrorText", () => {
  test("uses message when present, else the value", () => {
    expect(boundaryErrorText(new Error("boom"))).toBe("boom");
    expect(boundaryErrorText({ message: "esri failed" })).toBe("esri failed");
    expect(boundaryErrorText("plain")).toBe("plain");
    expect(boundaryErrorText(null)).toBe("null");
    expect(boundaryErrorText(new Error(""))).toBe("Error");
  });
});
