const mockDecode = jest.fn();
jest.mock("./tiff-decode", () => {
  mockDecode();
  return { decodeExportImageTiff: jest.fn() };
});

import * as source from "../agri-polygon-api-source";

describe("lazy tiff-decode", () => {
  it("does not load tiff-decode when the source module is imported", () => {
    expect(mockDecode).not.toHaveBeenCalled();
  });

  it("does not re-export the decoder from the public entry point", () => {
    expect("decodeExportImageTiff" in source).toBe(false);
  });
});
