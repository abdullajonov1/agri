import { React } from "jimu-core";
import { act, render, waitFor } from "@testing-library/react";
import { IndexInfoMenuLazy } from "./IndexInfoMenuLazy";
import type { IndexInfoMenuProps } from "./IndexInfoMenu";

const makeProps = (over: Partial<IndexInfoMenuProps> = {}): IndexInfoMenuProps => {
  const el = document.createElement("div");
  document.body.appendChild(el);
  return {
    openToolbarMenu: null,
    selectedIndexInfoKey: null,
    language: "en",
    closeIndexInfoMenu: jest.fn(),
    openIndexInfoDetail: jest.fn(),
    _indexInfoToolbarItemRef: { current: el },
    ...over,
  } as IndexInfoMenuProps;
};

describe("IndexInfoMenuLazy", () => {
  it("renders nothing while the menu is closed", () => {
    const { container } = render(<IndexInfoMenuLazy {...makeProps()} />);
    expect(container.innerHTML).toBe("");
  });

  it("renders the menu content once opened and the module resolves", async () => {
    render(<IndexInfoMenuLazy {...makeProps({ openToolbarMenu: "indexInfo" })} />);
    await waitFor(() => {
      expect(document.body.querySelector(".agri-v20-index-info-menu")).not.toBeNull();
    });
    await act(async () => { await Promise.resolve(); });
    expect(document.body.querySelectorAll(".agri-v20-index-info-row").length).toBeGreaterThan(0);
  });
});
