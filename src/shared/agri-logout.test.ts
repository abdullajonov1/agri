jest.mock("jimu-core", () => ({
  getAppStore: () => ({
    getState: (): {
      portalUrl: string;
      clientId: string;
      user: null;
    } => ({
      portalUrl: "https://sgm.uzspace.uz/portal",
      clientId: "experienceBuilder",
      user: null,
    }),
  }),
  loadArcGISJSAPIModules: () => Promise.reject(new Error("no identity")),
  SessionManager: {
    getInstance: (): {
      getMainSession: () => null;
      signOut: () => void;
    } => ({
      getMainSession: (): null => null,
      signOut: (): void => {
        throw new Error("signOut failed");
      },
    }),
  },
}));

import { logoutFromAccount } from "./agri-logout";

describe("logoutFromAccount", () => {
  test("warns when local cleanup throws and still starts portal sign-out", async () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => undefined);
    const replace = jest.fn();
    jest.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
      throw new Error("storage blocked");
    });

    await logoutFromAccount(replace);

    const warnings = warn.mock.calls.map((call) => String(call[0]));
    expect(warnings.some((line) => line.includes("[AgriLogout]"))).toBe(true);
    const failures = warn.mock.calls[0]?.[1] as string[];
    expect(failures).toEqual(
      expect.arrayContaining([
        "IdentityManager.destroyCredentials",
        "localStorage.removeItem",
        "SessionManager.signOut",
      ]),
    );
    expect(replace).toHaveBeenCalled();
    expect(String(replace.mock.calls[0][0])).toContain("/oauth2/signout");

    warn.mockRestore();
    jest.restoreAllMocks();
  });

  test("clears cached agri stats but keeps unrelated keys", async () => {
    jest.spyOn(console, "warn").mockImplementation(() => undefined);
    localStorage.setItem("agri_v5_pc:region:2025", '{"value":1}');
    localStorage.setItem("agri_v5_pc:veg-recent-days:x", '{"value":2}');
    localStorage.setItem("unrelated_pref", "keep");

    await logoutFromAccount(jest.fn());

    expect(localStorage.getItem("agri_v5_pc:region:2025")).toBeNull();
    expect(localStorage.getItem("agri_v5_pc:veg-recent-days:x")).toBeNull();
    expect(localStorage.getItem("unrelated_pref")).toBe("keep");

    localStorage.clear();
    jest.restoreAllMocks();
  });
});
