jest.mock("jimu-core", () => ({ React: jest.requireActual("react") }));

import { INDEX_INFO } from "./IndexInfoMenu";

describe("INDEX_INFO", () => {
  test("includes the NDRE entry with its accent color and formula", () => {
    // Arrange
    const ndre = INDEX_INFO.find((item) => item.key === "NDRE");

    // Act
    const color = ndre?.color;
    const formula = ndre?.formula;

    // Assert
    expect(ndre).toBeDefined();
    expect(color).toBe("#a39400");
    expect(formula).toBe("NDRE = (NIR − RedEdge) / (NIR + RedEdge)");
  });
});
