import { getPortalGroupInfo, type EsriRequestFunction } from "./portal-groups";

const PORTAL = "https://example.test/portal";

describe("getPortalGroupInfo", () => {
  test("returns title and member total", async () => {
    const request: EsriRequestFunction = jest.fn(async (url: string) =>
      url.endsWith("/userList")
        ? { data: { total: 7 } }
        : { data: { title: "Group A" } }
    );
    const info = await getPortalGroupInfo(request, PORTAL, "id 1");
    expect(info).toEqual({ id: "id 1", title: "Group A", usersCount: 7 });
    expect(request).toHaveBeenCalledWith(
      `${PORTAL}/sharing/rest/community/groups/id%201`,
      expect.objectContaining({ query: { f: "json" }, responseType: "json" }),
    );
  });

  test("keeps the group when the member list fails", async () => {
    const request: EsriRequestFunction = jest.fn(async (url: string) => {
      if (url.endsWith("/userList")) throw new Error("denied");
      return { data: {} };
    });
    expect(await getPortalGroupInfo(request, PORTAL, "g")).toEqual({
      id: "g",
      title: "Без названия",
      usersCount: null,
    });
  });

  test("ignores a member list error payload", async () => {
    const request: EsriRequestFunction = jest.fn(async (url: string) =>
      url.endsWith("/userList")
        ? { data: { error: { message: "x" }, total: 3 } }
        : { data: { title: "T" } }
    );
    expect((await getPortalGroupInfo(request, PORTAL, "g")).usersCount).toBeNull();
  });

  test("marks the group unavailable on a group error", async () => {
    const request: EsriRequestFunction = jest.fn(async () => ({
      data: { error: { message: "missing" } },
    }));
    expect(await getPortalGroupInfo(request, PORTAL, "g")).toEqual({
      id: "g",
      title: "Название недоступно",
      usersCount: null,
      isUnavailable: true,
    });
  });
});
