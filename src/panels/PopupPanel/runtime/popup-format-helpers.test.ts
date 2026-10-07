import {
  findAttributeValueCaseInsensitive,
  formatChartTick,
  formatChartTooltipValue,
  formatDateSmart,
  formatPopupAttributeValue,
  isEsriDateFieldType,
  niceChartMax,
} from "./popup-format-helpers";

describe("popup-format-helpers", () => {
  test("findAttributeValueCaseInsensitive", () => {
    expect(findAttributeValueCaseInsensitive(null, "a")).toBeNull();
    expect(findAttributeValueCaseInsensitive({ MayDon: 5 }, "maydon")).toBe(5);
    expect(findAttributeValueCaseInsensitive({ a: 1 }, "b")).toBeNull();
  });

  test("formatDateSmart handles Date, seconds/ms numbers, numeric and ISO strings", () => {
    const d = new Date(2024, 0, 2, 3, 4);
    expect(formatDateSmart(d)).toBe(d.toLocaleString());
    const ms = d.getTime();
    const fromMs = formatDateSmart(ms);
    expect(formatDateSmart(Math.floor(ms / 1000))).toBe(fromMs);
    expect(formatDateSmart(String(ms))).toBe(fromMs);
    expect(formatDateSmart("2024-01-02T03:04:00")).toBe(fromMs);
    expect(formatDateSmart("not a date")).toBe("not a date");
    expect(formatDateSmart(null)).toBe("null");
    expect(formatDateSmart(1e20)).toBe("100000000000000000000");
  });

  test("niceChartMax rounds up to 1/2/5/10 magnitudes", () => {
    expect(niceChartMax(0)).toBe(1);
    expect(niceChartMax(-3)).toBe(1);
    expect(niceChartMax(Number.NaN)).toBe(1);
    expect(niceChartMax(0.9)).toBe(1);
    expect(niceChartMax(1.5)).toBe(2);
    expect(niceChartMax(4)).toBe(5);
    expect(niceChartMax(7)).toBe(10);
    expect(niceChartMax(90)).toBe(100);
  });

  test("formatChartTick", () => {
    expect(formatChartTick(Number.NaN)).toBe("");
    expect(formatChartTick(1234.6)).toBe("1235");
    expect(formatChartTick(150.4)).toBe("150");
    expect(formatChartTick(7)).toBe("7");
    expect(formatChartTick(0.25)).toBe("0.3");
  });

  test("formatChartTooltipValue uses space thousands and dot decimals", () => {
    expect(formatChartTooltipValue(Number.POSITIVE_INFINITY)).toBe("");
    expect(formatChartTooltipValue(1234567)).toBe("1 234 567");
    expect(formatChartTooltipValue(1234.56)).toBe("1 234.6");
  });

  test("isEsriDateFieldType", () => {
    expect(isEsriDateFieldType("date")).toBe(true);
    expect(isEsriDateFieldType("timestamp-offset")).toBe(true);
    expect(isEsriDateFieldType("date-only")).toBe(true);
    expect(isEsriDateFieldType("time-only")).toBe(true);
    expect(isEsriDateFieldType("string")).toBe(false);
    expect(isEsriDateFieldType(undefined)).toBe(false);
  });

  test("formatPopupAttributeValue covers empty, dates, numbers, arrays, objects", () => {
    const formatDate = jest.fn((v: unknown) => `D(${String(v)})`);
    const plain = { isDateField: false, formatDate };
    expect(formatPopupAttributeValue(null, plain)).toBe("—");
    expect(formatPopupAttributeValue("", plain)).toBe("—");
    expect(formatPopupAttributeValue(5, { isDateField: true, formatDate })).toBe("D(5)");
    expect(formatPopupAttributeValue(1700000000000, plain)).toBe("D(1700000000000)");
    expect(formatPopupAttributeValue("1700000000", plain)).toBe("D(1700000000)");
    expect(formatPopupAttributeValue(1234.5, plain)).toBe("1 234.5");
    expect(formatPopupAttributeValue([1, 2], plain)).toBe("1, 2");
    expect(formatPopupAttributeValue({ a: 1 }, plain)).toBe('{"a":1}');
    expect(formatPopupAttributeValue("text", plain)).toBe("text");
  });
});
