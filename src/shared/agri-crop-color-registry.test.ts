import { getCropColor } from "./agri-crop-labels";
import {
  getPieCropColor,
  rememberPieCropColor,
  resetPieCropColors,
  resolveCropColors,
} from "./agri-crop-color-registry";

describe("agri crop colour registry", () => {
  beforeEach(() => resetPieCropColors());

  it("returns the colour the pie painted, across spellings of one crop", () => {
    rememberPieCropColor("Paxta", "#123456");
    expect(getPieCropColor("paxta")).toBe("#123456");
    expect(resolveCropColors(["paxta"])).toEqual(["#123456"]);
  });

  it("falls back to the shared crop colour when the pie has not shown the crop", () => {
    expect(resolveCropColors(["Paxta"])).toEqual([getCropColor("Paxta", 0)]);
  });

  it("does not hand a pie colour to a different unknown crop", () => {
    const first = getCropColor("Noma'lum ekin A", 0);
    rememberPieCropColor("Noma'lum ekin B", first);
    const [a, b] = resolveCropColors(["Noma'lum ekin A", "Noma'lum ekin B"]);
    expect(b).toBe(first);
    expect(a).not.toBe(first);
  });
});
