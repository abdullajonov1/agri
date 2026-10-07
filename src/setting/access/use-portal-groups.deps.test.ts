import { renderHook, waitFor } from "@testing-library/react";
import { loadArcGISJSAPIModules } from "jimu-arcgis";
import { usePortalGroups } from "./use-portal-groups";
import type { AccessConfig } from "./access-model";

jest.mock("jimu-core", () => ({
  ...jest.requireActual("jimu-core"),
  getAppStore: () => ({ getState: () => ({ portalUrl: "https://portal.test" }) }),
}));
jest.mock("jimu-arcgis", () => ({
  ...jest.requireActual("jimu-arcgis"),
  loadArcGISJSAPIModules: jest.fn(),
}));

const mockLoad = jest.mocked(loadArcGISJSAPIModules);

type RequestFn = (url: string) => Promise<{ data: { title?: string; total?: number } }>;

const makeConfig = (fullAccessGroups: string[], ruleValue = "a", ruleGroups: string[] = []): AccessConfig => ({
  fullAccessGroups,
  rules: [
    {
      id: "f1",
      title: "Field",
      field: "viloyat",
      rules: [{ id: "r1", operator: "equal", value: ruleValue, groups: ruleGroups }],
    },
  ],
});

const requestedGroupIds = (request: jest.Mock<ReturnType<RequestFn>, Parameters<RequestFn>>): string[] =>
  request.mock.calls
    .map(([url]) => url)
    .filter((url) => !url.endsWith("/userList"))
    .map((url) => url.split("/").pop() || "")
    .sort();

describe("usePortalGroups effect dependencies", () => {
  let request: jest.Mock<ReturnType<RequestFn>, Parameters<RequestFn>>;

  beforeEach(() => {
    jest.clearAllMocks();
    request = jest.fn<ReturnType<RequestFn>, Parameters<RequestFn>>(async (url: string) =>
      url.endsWith("/userList") ? { data: { total: 1 } } : { data: { title: url.split("/").pop() } },
    );
    mockLoad.mockResolvedValue([request]);
  });

  test("does not re-run when config changes but the group ids stay the same", async () => {
    const { result, rerender } = renderHook(({ cfg }) => usePortalGroups(cfg), {
      initialProps: { cfg: makeConfig(["g2", "g1"]) },
    });
    await waitFor(() => expect(Object.keys(result.current.groupsInfo)).toHaveLength(2));
    expect(mockLoad).toHaveBeenCalledTimes(1);

    // New object, edited rule value, same ids in another order.
    rerender({ cfg: makeConfig(["g1", "g2"], "changed") });
    // Same ids contributed via a rule instead of the global list.
    rerender({ cfg: makeConfig(["g1"], "other", ["g2"]) });
    await waitFor(() => expect(result.current.groupsLoading).toBe(false));

    expect(mockLoad).toHaveBeenCalledTimes(1);
  });

  test("re-runs with the latest config when the group ids change", async () => {
    const { result, rerender } = renderHook(({ cfg }) => usePortalGroups(cfg), {
      initialProps: { cfg: makeConfig(["g1"]) },
    });
    await waitFor(() => expect(Object.keys(result.current.groupsInfo)).toEqual(["g1"]));
    expect(requestedGroupIds(request)).toEqual(["g1"]);
    request.mockClear();

    rerender({ cfg: makeConfig(["g1"], "a", ["g3"]) });
    await waitFor(() => expect(Object.keys(result.current.groupsInfo).sort()).toEqual(["g1", "g3"]));

    expect(mockLoad).toHaveBeenCalledTimes(2);
    expect(requestedGroupIds(request)).toEqual(["g1", "g3"]);
  });

  test("clears the info map when every group id is removed", async () => {
    const { result, rerender } = renderHook(({ cfg }) => usePortalGroups(cfg), {
      initialProps: { cfg: makeConfig(["g1"]) },
    });
    await waitFor(() => expect(Object.keys(result.current.groupsInfo)).toEqual(["g1"]));

    rerender({ cfg: makeConfig([]) });
    await waitFor(() => expect(result.current.groupsInfo).toEqual({}));
    expect(mockLoad).toHaveBeenCalledTimes(1);
  });
});
