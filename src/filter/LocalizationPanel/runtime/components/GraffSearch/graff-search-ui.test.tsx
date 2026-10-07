jest.mock("jimu-core", () => ({ React: jest.requireActual("react") }));
// Source uses `import ReactDOM from "react-dom"`; ts-jest emits no default
// interop, so expose the CJS module as `default` for createPortal.
jest.mock("react-dom", () => {
  const actual = jest.requireActual<typeof import("react-dom")>("react-dom");
  return { __esModule: true, ...actual, default: actual };
});

import * as React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { GraffSearchRecord } from "../../widget-state";
import { GraffSearchDropdown, type GraffSearchDropdownProps } from "./GraffSearchDropdown";
import { GraffSearchInput, SearchIcon, type GraffSearchInputProps } from "./GraffSearchInput";

afterEach(cleanup);

const wrapRef = (): React.RefObject<HTMLDivElement> => {
  const el = document.createElement("div");
  el.getBoundingClientRect = (): DOMRect =>
    ({ left: 20, right: 220, top: 0, bottom: 30, width: 200, height: 30, x: 20, y: 0, toJSON: () => ({}) }) as DOMRect;
  return { current: el };
};

describe("GraffSearchInput", () => {
  const props = (over: Partial<GraffSearchInputProps> = {}): GraffSearchInputProps => ({
    graffSearchText: "",
    language: "en",
    _graffSearchWrapRef: { current: null },
    handleGraffSearchInputChange: jest.fn(),
    handleGraffSearchFocus: jest.fn(),
    handleGraffSearchClear: jest.fn(),
    ...over,
  });

  test.each([
    ["en", "TIN or farmer name"],
    ["ru", "ИНН или название фермера"],
    ["uz_lat", "STIR yoki fermer nomi"],
    ["uz_cyr", "СТИР ёки фермер номи"],
  ] as const)("placeholder in %s", (language, placeholder) => {
    render(<GraffSearchInput {...props({ language })} />);
    expect(screen.getByPlaceholderText(placeholder)).toBeTruthy();
    expect(screen.queryByRole("button")).toBeNull();
  });

  test("wires change/focus and shows a localized clear button", () => {
    const p = props({ graffSearchText: "123", language: "ru" });
    render(<GraffSearchInput {...p} />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "1234" } });
    fireEvent.focus(input);
    expect(p.handleGraffSearchInputChange).toHaveBeenCalled();
    expect(p.handleGraffSearchFocus).toHaveBeenCalled();
    fireEvent.click(screen.getByLabelText("Очистить"));
    expect(p.handleGraffSearchClear).toHaveBeenCalled();
  });

  test.each([
    ["en", "Clear"],
    ["uz_lat", "Tozalash"],
    ["uz_cyr", "Тозалаш"],
  ] as const)("clear label in %s", (language, label) => {
    render(<GraffSearchInput {...props({ language, graffSearchText: "x" })} />);
    expect(screen.getByTitle(label)).toBeTruthy();
  });

  test("SearchIcon renders an svg", () => {
    const { container } = render(<SearchIcon />);
    expect(container.querySelector("svg.agri-search-svg")).not.toBeNull();
  });
});

describe("GraffSearchDropdown", () => {
  const props = (over: Partial<GraffSearchDropdownProps> = {}): GraffSearchDropdownProps => ({
    graffSearchShowSuggestions: true,
    graffSearchSuggestions: [],
    graffSearchLoading: false,
    graffSearchText: "12",
    language: "en",
    _graffSearchWrapRef: wrapRef(),
    getEffectiveViloyat: () => "Andijon",
    handleGraffSearchRowClick: jest.fn(),
    ...over,
  });

  test("renders nothing when hidden, blank or without anchor", () => {
    render(<GraffSearchDropdown {...props({ graffSearchShowSuggestions: false })} />);
    render(<GraffSearchDropdown {...props({ graffSearchText: "  " })} />);
    render(<GraffSearchDropdown {...props({ _graffSearchWrapRef: { current: null } })} />);
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  test.each([
    ["en", "Searching...", "No data found"],
    ["ru", "Поиск...", "Данные не найдены"],
    ["uz_lat", "Qidirilmoqda...", "Ma'lumot topilmadi"],
    ["uz_cyr", "Қидирилмоқда...", "Маълумот топилмади"],
  ] as const)("status labels in %s", (language, loading, empty) => {
    const { unmount } = render(<GraffSearchDropdown {...props({ language, graffSearchLoading: true })} />);
    expect(screen.getByText(loading)).toBeTruthy();
    unmount();
    render(<GraffSearchDropdown {...props({ language })} />);
    expect(screen.getByText(empty)).toBeTruthy();
  });

  test("lists suggestions with geography and handles row click", () => {
    const records: GraffSearchRecord[] = [
      { f_inn: "111", viloyat: "Buxoro", tuman: "Kogon" },
      { f_name: "Ali" },
      {},
    ];
    const p = props({ graffSearchSuggestions: records, language: "ru" });
    render(<GraffSearchDropdown {...p} />);
    const listbox = screen.getByRole("listbox");
    expect(listbox.style.width).toBe("200px");
    expect(screen.getByText("111")).toBeTruthy();
    expect(screen.getByText("Buxoro · Kogon")).toBeTruthy();
    expect(screen.getByText("Ali")).toBeTruthy();
    expect(screen.getAllByText("Andijon")).toHaveLength(2);
    expect(screen.getByText("—")).toBeTruthy();
    const options = screen.getAllByRole("option");
    expect(options[0].getAttribute("title")).toBe("Выбрать строку");
    fireEvent.mouseDown(options[0]);
    fireEvent.click(options[0]);
    expect(p.handleGraffSearchRowClick).toHaveBeenCalledWith(records[0]);
  });

  test.each([
    ["en", "Select row"],
    ["uz_lat", "Qatorni tanlash"],
    ["uz_cyr", "Қаторни танлаш"],
  ] as const)("row title in %s", (language, title) => {
    render(<GraffSearchDropdown {...props({ language, graffSearchSuggestions: [{ f_inn: "1" }], getEffectiveViloyat: () => "" })} />);
    expect(screen.getByRole("option").getAttribute("title")).toBe(title);
    expect(document.querySelector(".agri-v20-graff-search-suggestion-region")).toBeNull();
  });
});
