import { VEG_INDEX_FIELDS } from "./popup-constants";

describe("VEG_INDEX_FIELDS", () => {
  test("has 6 keys without ndre", () => {
    expect(VEG_INDEX_FIELDS).toHaveLength(6);
    expect(VEG_INDEX_FIELDS).not.toContain("ndre");
  });
});
