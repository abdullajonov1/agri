const mockEsriRequest = jest.fn();

jest.mock("jimu-arcgis", () => ({
  loadArcGISJSAPIModules: (names: string[]) =>
    Promise.resolve(
      names.map((name) => {
        if (name === "esri/request") return mockEsriRequest;
        throw new Error(`unexpected module ${name}`);
      }),
    ),
}));

import { queryRestJson } from "./agri-rest-query";

describe("queryRestJson", () => {
  beforeEach(() => mockEsriRequest.mockReset());

  test("sends json request options with the caller timeout and returns data", async () => {
    const data = { features: [{ attributes: { a: 1 } }] };
    mockEsriRequest.mockResolvedValue({ data });

    const result = await queryRestJson("https://x/query", { f: "json", where: "1=1" }, { timeout: 1234 });

    expect(result).toBe(data);
    expect(mockEsriRequest).toHaveBeenCalledWith("https://x/query", {
      query: { f: "json", where: "1=1" },
      responseType: "json",
      timeout: 1234,
    });
  });

  test("throws the service error message", async () => {
    mockEsriRequest.mockResolvedValue({ data: { error: { message: "boom" } } });
    await expect(queryRestJson("u", {}, { timeout: 1 })).rejects.toThrow("boom");
  });

  test("falls back to the default and custom messages when the error has none", async () => {
    mockEsriRequest.mockResolvedValue({ data: { error: {} } });
    await expect(queryRestJson("u", {}, { timeout: 1 })).rejects.toThrow("query error");
    await expect(
      queryRestJson("u", {}, { timeout: 1, errorFallback: "Query error" }),
    ).rejects.toThrow("Query error");
  });

  test("returns an empty object when the response has no data", async () => {
    mockEsriRequest.mockResolvedValue(undefined);
    await expect(queryRestJson("u", {}, { timeout: 1 })).resolves.toEqual({});
  });
});
