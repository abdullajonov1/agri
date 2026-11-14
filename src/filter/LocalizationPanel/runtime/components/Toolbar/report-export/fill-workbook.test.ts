import { setVal } from "./fill-workbook";

type SetValSheet = Parameters<typeof setVal>[0];

function writeValue(value: string | number | null | undefined): unknown {
  const written: unknown[] = [];
  const sheet = {
    cell: () => ({ value: (v: unknown) => written.push(v) }),
  } as unknown as SetValSheet;
  setVal(sheet, 1, 1, value);
  return written[0];
}

describe("setVal formula injection guard", () => {
  it.each(["=SUM(A1)", "+1+1", "-12", "@cmd", "\tfoo", "\rfoo"])(
    "prefixes an apostrophe to %j",
    (input) => {
      expect(writeValue(input)).toBe(`'${input}`);
    },
  );

  it("leaves numbers, including negatives, unchanged", () => {
    expect(writeValue(-12)).toBe(-12);
    expect(writeValue(5.5)).toBe(5.5);
  });

  it("leaves normal strings unchanged", () => {
    expect(writeValue("Andijon")).toBe("Andijon");
  });

  it("clears empty values", () => {
    expect(writeValue("")).toBeUndefined();
    expect(writeValue(null)).toBeUndefined();
  });
});
