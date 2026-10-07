import {
  AREA_FIELD_PREFERRED_PIE,
  findAreaFieldByPreferredNames,
  findAreaFieldNumeric,
} from "./agri-area-field";

interface TestField {
  name: string;
  type: string;
}

function layer(fields: TestField[] | undefined): __esri.FeatureLayer {
  return { fields } as unknown as __esri.FeatureLayer;
}

describe("findAreaFieldByPreferredNames", () => {
  test("no fields -> null", () => {
    expect(findAreaFieldByPreferredNames(layer([]))).toBeNull();
    expect(findAreaFieldByPreferredNames(layer(undefined))).toBeNull();
  });

  test("exact preferred match wins (case-insensitive, original casing)", () => {
    expect(
      findAreaFieldByPreferredNames(
        layer([
          { name: "total_area_x", type: "double" },
          { name: "Area_HA", type: "double" },
        ]),
      ),
    ).toBe("Area_HA");
  });

  test("first preferred exact beats later exact", () => {
    expect(
      findAreaFieldByPreferredNames(
        layer([
          { name: "area", type: "double" },
          { name: "MAYDON", type: "double" },
        ]),
      ),
    ).toBe("MAYDON");
  });

  test("falls back to substring match", () => {
    expect(
      findAreaFieldByPreferredNames(layer([{ name: "plot_hectares_total", type: "double" }])),
    ).toBe("plot_hectares_total");
  });

  test("pie list supports Cyrillic га", () => {
    expect(
      findAreaFieldByPreferredNames(layer([{ name: "Майдон_га", type: "double" }]), AREA_FIELD_PREFERRED_PIE),
    ).toBe("Майдон_га");
  });

  test("returns null when nothing matches (with or without maydon fallback)", () => {
    const l = layer([{ name: "name", type: "string" }]);
    expect(findAreaFieldByPreferredNames(l)).toBeNull();
    expect(findAreaFieldByPreferredNames(l, ["x"], { finalMaydonFallback: false })).toBeNull();
  });

  test("final maydon fallback when custom preferred list misses", () => {
    const l = layer([{ name: "Maydon", type: "double" }]);
    expect(findAreaFieldByPreferredNames(l, ["zzz"])).toBe("Maydon");
    expect(findAreaFieldByPreferredNames(l, ["zzz"], { finalMaydonFallback: false })).toBeNull();
  });
});

describe("findAreaFieldNumeric", () => {
  test("no fields -> null", () => {
    expect(findAreaFieldNumeric(layer(undefined))).toBeNull();
  });

  test("config override wins when numeric", () => {
    const l = layer([
      { name: "maydon", type: "double" },
      { name: "MyArea", type: "integer" },
    ]);
    expect(findAreaFieldNumeric(l, { configField: "myarea" })).toBe("MyArea");
  });

  test("non-numeric config override is ignored", () => {
    const l = layer([
      { name: "maydon", type: "double" },
      { name: "MyArea", type: "string" },
    ]);
    expect(findAreaFieldNumeric(l, { configField: "MyArea" })).toBe("maydon");
  });

  test("candidate must be numeric; regex fallback otherwise", () => {
    const l = layer([
      { name: "maydon", type: "string" },
      { name: "Shape__Area", type: "double" },
    ]);
    expect(findAreaFieldNumeric(l)).toBe("Shape__Area");

    const l2 = layer([
      { name: "maydon", type: "string" },
      { name: "plot_ha_value", type: "single" },
    ]);
    expect(findAreaFieldNumeric(l2)).toBe("plot_ha_value");
  });

  test("no numeric area-like field -> null", () => {
    expect(
      findAreaFieldNumeric(
        layer([
          { name: "area", type: "string" },
          { name: "count", type: "integer" },
        ]),
      ),
    ).toBeNull();
  });
});
