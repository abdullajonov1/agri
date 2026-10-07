import { makeIndicatorHost } from "../../__test-utils__/indicator-host-stub";
import { buildApiUrl, buildWhereClause } from "./indicator-where";

describe("buildWhereClause (VH path)", () => {
  test("returns 1=0 while VH uniqueids are pending or empty", () => {
    const pending = makeIndicatorHost({ selectedVegetationStatus: "good", vhUniqueids: null });
    expect(buildWhereClause(pending.host)).toBe("1=0");
    const empty = makeIndicatorHost({ selectedVegetationStatus: "good", vhUniqueids: [] });
    expect(buildWhereClause(empty.host)).toBe("1=0");
  });

  test("scopes by year, join ids, crop, uniqueid and config filter", () => {
    const { host } = makeIndicatorHost(
      {
        selectedVegetationStatus: "good",
        vhUniqueids: ["{ABC}"],
        selectedYil: "Yil 2024",
        selectedViloyat: "Andijon",
        selectedCropType: "paxta",
        selectedUniqueid: "u1",
      },
      { filterExpression: "x > 1" },
      { buildTurlarClause: () => "turi IN ('a')" },
    );
    const where = buildWhereClause(host);
    expect(where).toContain("yil LIKE '2024%'");
    expect(where).not.toContain("viloyat=");
    expect(where).toContain("turi IN ('a')");
    expect(where).toContain("'ABC'");
    expect(where).toContain("ekin='paxta'");
    expect(where).toContain("uniqueid='u1'");
    expect(where).toContain("(x > 1)");
  });

  test("uses expanded join ids when cached for the same source", () => {
    const ids = ["a1"];
    const { host } = makeIndicatorHost({ selectedVegetationStatus: "s", vhUniqueids: ids });
    host._vhJoinSource = ids;
    host._vhJoinExpanded = ["expanded-id"];
    expect(buildWhereClause(host)).toContain("expanded-id");
  });

  test("non-digit year falls back to a contains LIKE", () => {
    const { host } = makeIndicatorHost({
      selectedVegetationStatus: "s",
      vhUniqueids: ["a"],
      selectedYil: "abc",
    });
    expect(buildWhereClause(host)).toContain("yil LIKE '%abc%'");
  });
});

describe("buildWhereClause (stats path)", () => {
  test("adds extras and config filter around the base where", () => {
    const { host } = makeIndicatorHost(
      { selectedYil: "2024", selectedViloyat: "Andijon", selectedCropType: "paxta" },
      { filterExpression: "a=1" },
    );
    const where = buildWhereClause(host);
    expect(where).toContain("viloyat='Andijon'");
    expect(where).toContain("ekin='paxta'");
    expect(where).toContain("(a=1)");
  });

  test("omits viloyat when includeViloyat is false and ignores 1=1 config", () => {
    const { host } = makeIndicatorHost(
      { selectedYil: "2024", selectedViloyat: "Andijon" },
      { filterExpression: "1=1" },
    );
    const where = buildWhereClause(host, false);
    expect(where).not.toContain("viloyat=");
    expect(where).not.toContain("(1=1)");
  });
});

describe("buildApiUrl", () => {
  test("throws when no endpoint configured", () => {
    const { host } = makeIndicatorHost();
    expect(() => buildApiUrl(host)).toThrow(/Missing API endpoint/);
  });

  test("strips query string and substitutes placeholders", () => {
    const { host } = makeIndicatorHost(
      { selectedYil: "2024", selectedViloyat: "Andijon", selectedYerToifas: "ekin" },
      { apiUrl: " https://x/api/{yil}/{viloyat}/{turi}/{tur}/{vh}/{ekin_turi}/{tuman}?a=1 " },
    );
    expect(buildApiUrl(host)).toBe("https://x/api/2024/Andijon/ekin/ekin///");
  });
});
