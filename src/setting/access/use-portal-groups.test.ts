import { act, renderHook, waitFor } from "@testing-library/react";
import { getAppStore } from "jimu-core";
import { loadArcGISJSAPIModules } from "jimu-arcgis";
import { usePortalGroups } from "./use-portal-groups";
import type { AccessConfig } from "./access-model";

jest.mock("jimu-core", () => ({
  ...jest.requireActual("jimu-core"),
  getAppStore: jest.fn(),
}));
jest.mock("jimu-arcgis", () => ({
  ...jest.requireActual("jimu-arcgis"),
  loadArcGISJSAPIModules: jest.fn(),
}));

const mockGetAppStore = getAppStore as unknown as jest.Mock<{ getState: () => { portalUrl?: string } }, []>;
const mockLoad = loadArcGISJSAPIModules as unknown as jest.Mock<Promise<unknown[]>, [string[]]>;

const config = (groups: string[]): AccessConfig => ({ fullAccessGroups: groups, rules: [] });

describe("usePortalGroups", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAppStore.mockReturnValue({ getState: () => ({ portalUrl: "https://portal.test" }) });
  });

  test("returns an empty map and does not load when the config has no groups", async () => {
    const { result } = renderHook(() => usePortalGroups(config([])));
    await waitFor(() => expect(result.current.groupsLoading).toBe(false));
    expect(result.current.groupsInfo).toEqual({});
    expect(mockLoad).not.toHaveBeenCalled();
  });

  test("skips loading when the portal url is unknown", async () => {
    mockGetAppStore.mockReturnValue({ getState: () => ({}) });
    const { result } = renderHook(() => usePortalGroups(config(["g1"])));
    await act(async () => undefined);
    expect(mockLoad).not.toHaveBeenCalled();
    expect(result.current.groupsLoading).toBe(false);
  });

  test("loads title and member count for each referenced group", async () => {
    const request = jest.fn(async (url: string) =>
      url.endsWith("/userList") ? { data: { total: 5 } } : { data: { title: `T-${url.split("/").pop()}` } },
    );
    mockLoad.mockResolvedValue([request]);
    const { result } = renderHook(() => usePortalGroups(config(["g1", "g2"])));
    await waitFor(() => expect(Object.keys(result.current.groupsInfo)).toHaveLength(2));
    expect(result.current.groupsInfo.g1.title).toBe("T-g1");
    expect(result.current.groupsLoading).toBe(false);
    expect(mockLoad).toHaveBeenCalledWith(["esri/request"]);
  });

  test("drops results that arrive after unmount", async () => {
    let release: (v: unknown[]) => void = () => undefined;
    mockLoad.mockReturnValue(new Promise<unknown[]>((r) => { release = r; }));
    const { result, unmount } = renderHook(() => usePortalGroups(config(["g1"])));
    await waitFor(() => expect(result.current.groupsLoading).toBe(true));
    unmount();
    await act(async () => {
      release([jest.fn(async () => ({ data: { title: "x" } }))]);
    });
    expect(result.current.groupsInfo).toEqual({});
  });
});
