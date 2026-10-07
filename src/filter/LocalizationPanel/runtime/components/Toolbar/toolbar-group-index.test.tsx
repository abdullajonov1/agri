jest.mock("jimu-core", () => ({ React: jest.requireActual("react") }));
jest.mock("react-dom", () => {
  const actual = jest.requireActual<typeof import("react-dom")>("react-dom");
  return { __esModule: true, ...actual, default: actual };
});
jest.mock("lucide-react", () => {
  const icon = (name: string) => (props: { className?: string }) =>
    jest.requireActual<typeof import("react")>("react").createElement("svg", { "data-icon": name, className: props.className });
  return new Proxy({ __esModule: true }, { get: (target, key: string) => (key in target ? (target as Record<string, unknown>)[key] : icon(key)) });
});
jest.mock("../../../../../shared/getAccountDisplayInfo", () => ({
  getAccountDisplayInfo: jest.fn(() => ({ initial: "S", displayName: "Sam" })),
}));

import * as React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { getAccountDisplayInfo } from "../../../../../shared/getAccountDisplayInfo";
import { INDEX_INFO, IndexInfoDetail, IndexInfoMenu } from "./IndexInfoMenu";
import { ToolbarGroup, type ToolbarGroupProps } from "./ToolbarGroup";

type Lang = ToolbarGroupProps["language"];
const anchorRef = (): React.RefObject<HTMLDivElement> => ({ current: document.createElement("div") });
const emptyRef = (): React.RefObject<HTMLDivElement> => ({ current: null });

afterEach(cleanup);

describe("IndexInfoMenu", () => {
  const base = (over: Partial<React.ComponentProps<typeof IndexInfoMenu>> = {}): React.ComponentProps<typeof IndexInfoMenu> => ({
    openToolbarMenu: "indexInfo",
    selectedIndexInfoKey: null,
    language: "en",
    _indexInfoToolbarItemRef: anchorRef(),
    openIndexInfoDetail: jest.fn(),
    closeIndexInfoMenu: jest.fn(),
    ...over,
  });

  test("renders nothing when another menu is open or the anchor is missing", () => {
    const a = render(<IndexInfoMenu {...base({ openToolbarMenu: "yil" })} />);
    expect(a.container.innerHTML).toBe("");
    render(<IndexInfoMenu {...base({ _indexInfoToolbarItemRef: emptyRef() })} />);
    expect(screen.queryByRole("menu")).toBeNull();
  });

  test("lists every index and opens the detail on click and keyboard activation", () => {
    const props = base();
    render(<IndexInfoMenu {...props} />);
    expect(screen.getByRole("menu").getAttribute("aria-label")).toBe("About indices");
    expect(screen.getAllByRole("button")).toHaveLength(INDEX_INFO.length);
    fireEvent.click(screen.getByText(INDEX_INFO[0].key));
    expect(props.openIndexInfoDetail).toHaveBeenCalledWith(INDEX_INFO[0].key);
    const row = screen.getAllByRole("button")[1];
    fireEvent.keyDown(row, { key: "Enter" });
    fireEvent.keyDown(row, { key: " " });
    fireEvent.keyDown(row, { key: "a" });
    expect(props.openIndexInfoDetail).toHaveBeenCalledTimes(3);
    expect(props.openIndexInfoDetail).toHaveBeenLastCalledWith(INDEX_INFO[1].key);
  });

  test.each([
    ["en", "About indices"],
    ["ru", "Инфо про индексы"],
    ["uz_lat", "Indekslar haqida"],
    ["uz_cyr", "Индекслар ҳақида"],
  ] as Array<[Lang, string]>)("localises the header for %s", (language, label) => {
    render(<IndexInfoMenu {...base({ language })} />);
    expect(screen.getByRole("menu").getAttribute("aria-label")).toBe(label);
  });

  test("shows the detail page for a selected key and hides the list", () => {
    const props = base({ selectedIndexInfoKey: INDEX_INFO[0].key });
    render(<IndexInfoMenu {...props} />);
    expect(screen.getByRole("dialog").getAttribute("aria-label")).toBe(INDEX_INFO[0].key);
    expect(screen.queryByRole("menu")).toBeNull();
  });
});

describe("IndexInfoDetail", () => {
  const detail = (over: Partial<React.ComponentProps<typeof IndexInfoDetail>> = {}): React.ComponentProps<typeof IndexInfoDetail> => ({
    openToolbarMenu: "indexInfo",
    selectedIndexInfoKey: INDEX_INFO[0].key,
    language: "en",
    closeIndexInfoMenu: jest.fn(),
    ...over,
  });

  test("renders nothing for a closed menu, no key, or an unknown key", () => {
    for (const over of [{ openToolbarMenu: null }, { selectedIndexInfoKey: null }, { selectedIndexInfoKey: "NOPE" }] as Array<Partial<React.ComponentProps<typeof IndexInfoDetail>>>) {
      const { container } = render(<IndexInfoDetail {...detail(over)} />);
      expect(container.innerHTML).toBe("");
    }
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  test("shows summary, formula and details; closes via backdrop and button but not card click", () => {
    const props = detail();
    render(<IndexInfoDetail {...props} />);
    const item = INDEX_INFO[0];
    expect(screen.getByText(item.formula)).toBeTruthy();
    expect(screen.getByText("Formula")).toBeTruthy();
    expect(screen.getByText(item.en || item.uz_lat)).toBeTruthy();
    fireEvent.click(screen.getByRole("dialog"));
    expect(props.closeIndexInfoMenu).not.toHaveBeenCalled();
    fireEvent.click(screen.getByLabelText("Close"));
    expect(props.closeIndexInfoMenu).toHaveBeenCalledTimes(1);
    const backdrop = screen.getByRole("dialog").parentElement as HTMLElement;
    fireEvent.click(backdrop);
    expect(props.closeIndexInfoMenu).toHaveBeenCalledTimes(2);
  });

  test.each([
    ["ru", "Формула"],
    ["uz_lat", "Formula"],
    ["uz_cyr", "Формула"],
  ] as Array<[Lang, string]>)("uses the localised formula label for %s", (language, label) => {
    render(<IndexInfoDetail {...detail({ language })} />);
    expect(screen.getByText(label)).toBeTruthy();
    expect(screen.getByText(INDEX_INFO[0][language])).toBeTruthy();
  });
});

describe("ToolbarGroup", () => {
  const props = (over: Partial<ToolbarGroupProps> = {}): ToolbarGroupProps => ({
    openToolbarMenu: null,
    language: "en",
    isDarkTheme: false,
    connectionStatus: "connected",
    showProfileMenu: false,
    _notificationsToolbarItemRef: emptyRef(),
    _indexInfoToolbarItemRef: emptyRef(),
    _yilToolbarItemRef: emptyRef(),
    _languageToolbarItemRef: emptyRef(),
    toggleToolbarMenu: jest.fn(),
    applyThemeByValue: jest.fn(),
    toggleProfileMenu: jest.fn(),
    closeProfileMenu: jest.fn(),
    handleLogout: jest.fn(),
    ...over,
  });

  test("toggles each toolbar menu from its button", () => {
    const p = props();
    render(<ToolbarGroup {...p} />);
    fireEvent.click(screen.getByLabelText("Notifications"));
    fireEvent.click(screen.getByLabelText("About indices"));
    fireEvent.click(screen.getByLabelText("Year"));
    fireEvent.click(screen.getByLabelText("Language"));
    expect(m(p.toggleToolbarMenu).mock.calls.map((c) => c[0])).toEqual(["notifications", "indexInfo", "yil", "language"]);
  });

  test("marks the active menu as pressed", () => {
    render(<ToolbarGroup {...props({ openToolbarMenu: "yil" })} />);
    expect(screen.getByLabelText("Year").getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByLabelText("Language").getAttribute("aria-pressed")).toBe("false");
    expect(screen.getByLabelText("Year").className).toContain("is-active");
  });

  test("theme switch flips light and dark", () => {
    const light = props();
    const { unmount } = render(<ToolbarGroup {...light} />);
    fireEvent.click(screen.getByRole("switch"));
    expect(light.applyThemeByValue).toHaveBeenCalledWith("dark");
    expect(screen.getByRole("switch").getAttribute("aria-checked")).toBe("false");
    unmount();
    const dark = props({ isDarkTheme: true });
    render(<ToolbarGroup {...dark} />);
    fireEvent.click(screen.getByRole("switch"));
    expect(dark.applyThemeByValue).toHaveBeenCalledWith("light");
  });

  test("profile button shows the account initial and is disabled until connected", () => {
    const p = props({ connectionStatus: "connecting" });
    render(<ToolbarGroup {...p} />);
    const btn = screen.getByLabelText("Log out") as HTMLButtonElement;
    expect(btn.textContent).toBe("S");
    expect(btn.disabled).toBe(true);
    cleanup();
    const q = props();
    render(<ToolbarGroup {...q} />);
    fireEvent.click(screen.getByLabelText("Log out"));
    expect(q.toggleProfileMenu).toHaveBeenCalled();
  });

  test("open profile menu offers logout and closes via backdrop", () => {
    const p = props({ showProfileMenu: true, isDarkTheme: true });
    render(<ToolbarGroup {...p} />);
    expect(screen.getByText("Sam")).toBeTruthy();
    fireEvent.click(screen.getByRole("menuitem"));
    expect(p.handleLogout).toHaveBeenCalled();
    const backdrop = document.querySelector(".agri-v20-profile-backdrop") as HTMLElement;
    fireEvent.click(backdrop);
    expect(p.closeProfileMenu).toHaveBeenCalled();
    expect(document.querySelector(".dark-theme")).not.toBeNull();
  });

  test("falls back to the logout label when there is no display name", () => {
    (getAccountDisplayInfo as jest.Mock).mockReturnValueOnce({ initial: "?", displayName: "" }).mockReturnValue({ initial: "?", displayName: "" });
    render(<ToolbarGroup {...props({ showProfileMenu: true })} />);
    expect(document.querySelector(".agri-v20-profile-name")?.textContent).toBe("Log out");
  });

  test.each([
    ["ru", "Год", "Язык", "Выйти"],
    ["uz_lat", "Yil", "Til", "Chiqish"],
    ["uz_cyr", "Йил", "Тил", "Чиқиш"],
  ] as Array<[Lang, string, string, string]>)("localises labels for %s", (language, yil, lang, out) => {
    render(<ToolbarGroup {...props({ language })} />);
    expect(screen.getByLabelText(yil)).toBeTruthy();
    expect(screen.getByLabelText(lang)).toBeTruthy();
    expect(screen.getByLabelText(out)).toBeTruthy();
  });
});

function m(fn: unknown): jest.Mock {
  return fn as jest.Mock;
}
