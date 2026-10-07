const mockGetMainSession = jest.fn();
jest.mock("jimu-core", () => ({
  SessionManager: {
    getInstance: () => ({ getMainSession: () => mockGetMainSession() }),
  },
}));

import { readAgriAuthToken } from "./agri-auth-token";

describe("readAgriAuthToken", () => {
  beforeEach(() => {
    mockGetMainSession.mockReset();
    window.sessionStorage.clear();
    window.localStorage.clear();
  });

  test("prefers the live jimu session token (trimmed)", () => {
    mockGetMainSession.mockReturnValue({ token: "  sess-tok " });
    window.sessionStorage.setItem("exb_auth", JSON.stringify({ token: "other" }));
    expect(readAgriAuthToken({ allowGenericStorageKeys: false })).toBe("sess-tok");
  });

  test("falls back to exb_auth in sessionStorage then localStorage", () => {
    mockGetMainSession.mockReturnValue(null);
    window.localStorage.setItem("exb_auth", JSON.stringify({ token: " local " }));
    expect(readAgriAuthToken({ allowGenericStorageKeys: false })).toBe("local");
    window.sessionStorage.setItem("exb_auth", JSON.stringify({ token: "session" }));
    expect(readAgriAuthToken({ allowGenericStorageKeys: false })).toBe("session");
  });

  test("survives a throwing SessionManager", () => {
    mockGetMainSession.mockImplementation(() => {
      throw new Error("no session");
    });
    window.sessionStorage.setItem("exb_auth", JSON.stringify({ token: "t" }));
    expect(readAgriAuthToken({ allowGenericStorageKeys: false })).toBe("t");
  });

  test("ignores generic keys unless explicitly allowed", () => {
    mockGetMainSession.mockReturnValue(undefined);
    window.localStorage.setItem("authToken", "generic");
    expect(readAgriAuthToken({ allowGenericStorageKeys: false })).toBeNull();
    expect(readAgriAuthToken({ allowGenericStorageKeys: true })).toBe("generic");
  });

  test("ignores non-string exb_auth token", () => {
    mockGetMainSession.mockReturnValue(undefined);
    window.sessionStorage.setItem("exb_auth", JSON.stringify({ token: 42 }));
    expect(readAgriAuthToken({ allowGenericStorageKeys: false })).toBeNull();
  });

  test("malformed exb_auth JSON is treated as signed out", () => {
    mockGetMainSession.mockReturnValue(undefined);
    window.sessionStorage.setItem("exb_auth", "{not json");
    window.localStorage.setItem("token", "would-be-used");
    expect(readAgriAuthToken({ allowGenericStorageKeys: true })).toBeNull();
  });
});
