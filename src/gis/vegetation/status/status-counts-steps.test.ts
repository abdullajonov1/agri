import {
  buildStatusCountsWhere,
  resolveUniqueIdField,
  readAttribute,
  addVote,
  assignStatuses,
  type VoteMap,
} from "./status-counts-steps";

describe("status-counts-steps", () => {
  describe("buildStatusCountsWhere", () => {
    it("builds date, region, district and crop clauses", () => {
      const where = buildStatusCountsWhere({
        date: "2024-05-01",
        region: 5,
        district: 12,
        cropIds: ["1", "2", " "],
        cropId: "1",
      });
      expect(where).toContain("region='5'");
      expect(where).toContain("district='12'");
      expect(where).toContain("crop_id IN ('1','2')");
    });

    it("uses equality for a single crop", () => {
      const where = buildStatusCountsWhere({ date: "2024-05-01", cropId: "7" });
      expect(where).toContain("crop_id='7'");
    });

    it("returns null for an explicitly empty uniqueIds list", () => {
      expect(
        buildStatusCountsWhere({ date: "2024-05-01", uniqueIds: [] }),
      ).toBeNull();
    });
  });

  describe("resolveUniqueIdField", () => {
    it("prefers uniqueid over globalid", () => {
      expect(resolveUniqueIdField(["GlobalID", "UniqueID"])).toBe("UniqueID");
    });
    it("returns undefined when absent", () => {
      expect(resolveUniqueIdField(["a"])).toBeUndefined();
    });
  });

  it("readAttribute falls back to lower and upper case keys", () => {
    expect(readAttribute({ abc: 1 }, "ABC")).toBe(1);
    expect(readAttribute({ ABC: 2 }, "abc")).toBe(2);
  });

  it("addVote accumulates rows and max px per status", () => {
    const map: VoteMap = new Map();
    addVote(map, "X1", "good", 2, 5);
    addVote(map, "x1", "good", 1, 9);
    const vote = map.get("x1")?.statuses.get("good");
    expect(vote).toEqual({ rowCount: 3, pxAll: 9 });
    expect(map.get("x1")?.rawUniqueId).toBe("X1");
  });

  it("assignStatuses picks the majority status per id", () => {
    const map: VoteMap = new Map();
    addVote(map, "a", "low", 1, 1);
    addVote(map, "a", "high", 3, 1);
    addVote(map, "b", "low", 1, 4);
    const result = assignStatuses(map);
    expect(result.statusPairCount).toBe(3);
    expect(result.assignedIdsByStatus.get("high")).toEqual(["a"]);
    expect(result.byStatus.get("low")).toEqual({ count: 1, pxAll: 4 });
  });
});
