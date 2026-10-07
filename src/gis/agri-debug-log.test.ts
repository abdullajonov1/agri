import { agriTumanLog, agriVhIndicatorLog, agroV5Log } from "./agri-debug-log";

type FlagBag = Record<string, unknown>;
const flags = globalThis as unknown as FlagBag;
const FLAG_NAMES = [
  "__AGRO_V5_DEBUG",
  "__AGRO_V5_VH_DEBUG",
  "__AGRO_V5_TUMAN_DEBUG",
  "__AGRO_V5_VH_INDICATOR_DEBUG",
];

describe("agroV5Log", () => {
  let logSpy: jest.SpyInstance;

  beforeEach(() => {
    logSpy = jest.spyOn(console, "log").mockImplementation(() => undefined);
  });

  afterEach(() => {
    logSpy.mockRestore();
    for (const name of FLAG_NAMES) delete flags[name];
  });

  test("is silent by default for the 'all' topic", () => {
    agroV5Log("phase", { a: 1 });
    expect(logSpy).not.toHaveBeenCalled();
  });

  test("logs with default prefix when global flag is on", () => {
    flags.__AGRO_V5_DEBUG = true;
    agroV5Log("phase", { a: 1 });
    expect(logSpy).toHaveBeenCalledWith("[AgroV5] phase", { a: 1 });
  });

  test("passes an empty detail object when detail is omitted", () => {
    flags.__AGRO_V5_DEBUG = true;
    agroV5Log("bare");
    expect(logSpy).toHaveBeenCalledWith("[AgroV5] bare", {});
  });

  test("VH flag enables vh and agriVh topics only", () => {
    flags.__AGRO_V5_VH_DEBUG = true;
    agroV5Log("v", undefined, "vh");
    agroV5Log("q", undefined, "agriVh");
    agroV5Log("m", undefined, "map");
    expect(logSpy).toHaveBeenCalledTimes(2);
    expect(logSpy).toHaveBeenNthCalledWith(2, "[AgriVH] q", {});
  });

  test("non-boolean flag values are ignored", () => {
    flags.__AGRO_V5_DEBUG = "true";
    agroV5Log("x");
    expect(logSpy).not.toHaveBeenCalled();
  });

  test("tuman logs are on by default and can be turned off", () => {
    agriTumanLog("t", { id: 1 });
    expect(logSpy).toHaveBeenCalledWith("[AgroV5 tuman] t", { id: 1 });
    logSpy.mockClear();
    flags.__AGRO_V5_TUMAN_DEBUG = false;
    agriTumanLog("t");
    expect(logSpy).not.toHaveBeenCalled();
  });

  test("vhIndicator logs are on by default and can be turned off", () => {
    agriVhIndicatorLog("i");
    expect(logSpy).toHaveBeenCalledWith("[AgroV5 VH-indikator] i", {});
    logSpy.mockClear();
    flags.__AGRO_V5_VH_INDICATOR_DEBUG = false;
    agriVhIndicatorLog("i");
    expect(logSpy).not.toHaveBeenCalled();
  });

  test("swallows console errors", () => {
    flags.__AGRO_V5_DEBUG = true;
    logSpy.mockImplementation(() => {
      throw new Error("boom");
    });
    expect(() => agroV5Log("x", undefined, "notify")).not.toThrow();
  });
});
