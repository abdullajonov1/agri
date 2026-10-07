jest.mock("../../../../gis/agri-debug-log", () => ({
  agroV5Log: jest.fn(),
}));

import { agroV5Log } from "../../../../gis/agri-debug-log";
import { agriLog, debugCatch } from "./localization-log";

const logMock = jest.mocked(agroV5Log);

describe("localization-log", () => {
  beforeEach(() => logMock.mockClear());

  test.each([
    ["zoom:district:start", "tuman"],
    ["broadcastFilterState:send", "tuman"],
    ["admin-boundary:x", "tuman"],
    ["cropRenderer:vh", "vh"],
    ["pie:update", "vh"],
    ["vegetation:query", "vh"],
    ["map:settle-repaint", "all"],
  ])("routes %s to topic %s", (phase, topic) => {
    agriLog(phase, { a: 1 });
    expect(logMock).toHaveBeenCalledWith(phase, { a: 1 }, topic);
  });

  test("debugCatch logs the error message", () => {
    debugCatch("phase", new Error("boom"));
    expect(logMock).toHaveBeenCalledWith("phase", { error: "boom" });
  });
});
