const mockLog = jest.fn<void, [string, Record<string, unknown> | undefined, string]>();

jest.mock("../../../gis/agri-debug-log", () => ({
  agroV5Log: (phase: string, detail: Record<string, unknown> | undefined, topic: string) =>
    mockLog(phase, detail, topic),
}));

import { regionLog } from "./region-log";

describe("regionLog", () => {
  test("routes district-related phases to the tuman topic", () => {
    regionLog("barClicked", { a: 1 });
    regionLog("load-Tuman-list");
    expect(mockLog).toHaveBeenNthCalledWith(1, "barClicked", { a: 1 }, "tuman");
    expect(mockLog).toHaveBeenNthCalledWith(2, "load-Tuman-list", undefined, "tuman");
  });

  test("routes other phases to the all topic", () => {
    regionLog("mount");
    expect(mockLog).toHaveBeenLastCalledWith("mount", undefined, "all");
  });
});
