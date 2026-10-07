jest.mock("jimu-core", () => ({ React: jest.requireActual("react") }));
// Source uses `import ReactDOM from "react-dom"`; ts-jest emits no default
// interop, so expose the CJS module as `default` for createPortal.
jest.mock("react-dom", () => {
  const actual = jest.requireActual<typeof import("react-dom")>("react-dom");
  return { __esModule: true, ...actual, default: actual };
});
jest.mock("lucide-react", () => {
  const icon = (name: string) => (props: { className?: string }) =>
    jest.requireActual<typeof import("react")>("react").createElement("svg", { "data-icon": name, className: props.className });
  return { Bell: icon("bell"), Calendar: icon("calendar"), Info: icon("info"), ChevronDown: icon("chevron"), X: icon("x") };
});

import * as React from "react";
import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import type { VegetationRecentDayGroup } from "../../../../../gis/agri-vegetation-data-source";
import { LanguageMenu } from "./LanguageMenu";
import { YilMenu } from "./YilMenu";
import { NotificationsMenu, type NotificationsMenuProps } from "./NotificationsMenu";
import { BellIcon, CalendarIcon, InfoIcon, LanguageIcon, LogoutIcon, MoonIcon, SunIcon } from "./toolbar-icons";

const anchorRef = (): React.RefObject<HTMLDivElement> => ({ current: document.createElement("div") });
const emptyRef = (): React.RefObject<HTMLDivElement> => ({ current: null });

afterEach(cleanup);

describe("LanguageMenu", () => {
  test("renders nothing when closed or without anchor", () => {
    const apply = jest.fn();
    const { container } = render(
      <LanguageMenu openToolbarMenu="yil" language="en" _languageToolbarItemRef={anchorRef()} applyLanguage={apply} />,
    );
    expect(container.innerHTML).toBe("");
    render(<LanguageMenu openToolbarMenu="language" language="en" _languageToolbarItemRef={emptyRef()} applyLanguage={apply} />);
    expect(screen.queryByText("English")).toBeNull();
  });

  test("marks the active language and applies a choice", () => {
    const apply = jest.fn();
    render(<LanguageMenu openToolbarMenu="language" language="ru" _languageToolbarItemRef={anchorRef()} applyLanguage={apply} />);
    expect(screen.getByText("Русский").className).toContain("is-active");
    expect(screen.getByText("English").className).not.toContain("is-active");
    fireEvent.click(screen.getByText("Ўзбек"));
    expect(apply).toHaveBeenCalledWith("uz_cyr");
  });
});

describe("YilMenu", () => {
  test("renders nothing when closed", () => {
    const { container } = render(
      <YilMenu openToolbarMenu={null} yilOptions={["2025"]} yil="" language="en" _yilToolbarItemRef={anchorRef()} applyYil={jest.fn()} />,
    );
    expect(container.innerHTML).toBe("");
  });

  test.each([
    ["en", "Year"],
    ["ru", "Год"],
    ["uz_lat", "Yil"],
    ["uz_cyr", "Йил"],
  ] as const)("labels the menu in %s", (language, label) => {
    render(<YilMenu openToolbarMenu="yil" yilOptions={["2025"]} yil="" language={language} _yilToolbarItemRef={anchorRef()} applyYil={jest.fn()} />);
    expect(screen.getByRole("menu").getAttribute("aria-label")).toBe(label);
  });

  test("lists trimmed non-empty years and applies selection", () => {
    const apply = jest.fn();
    render(
      <YilMenu openToolbarMenu="yil" yilOptions={[" 2024 ", "", "2025"]} yil="2025" language="en" _yilToolbarItemRef={anchorRef()} applyYil={apply} />,
    );
    const buttons = screen.getAllByRole("button");
    expect(buttons.map((b) => b.textContent)).toEqual(["2024", "2025"]);
    expect(buttons[1].className).toContain("is-active");
    fireEvent.click(buttons[0]);
    expect(apply).toHaveBeenCalledWith("2024");
  });
});

describe("NotificationsMenu", () => {
  const DAYS: VegetationRecentDayGroup[] = [
    { date: "2025-06-01", totalFields: 12, regions: [{ regionCode: "1703", fieldCount: 12 }] } as VegetationRecentDayGroup,
  ];

  const baseProps = (over: Partial<NotificationsMenuProps> = {}): NotificationsMenuProps => ({
    openToolbarMenu: "notifications",
    language: "en",
    notificationDays: [],
    notificationLoading: false,
    notificationError: null,
    notificationCanScrollDown: false,
    _notificationsToolbarItemRef: anchorRef(),
    _notificationBodyRef: { current: null },
    onNotificationBodyScroll: jest.fn(),
    formatNotificationDate: (d: string) => `D:${d}`,
    formatFieldCount: (n: number) => `N:${n}`,
    resolveRegionNotificationName: (c: string) => `R:${c}`,
    onClose: jest.fn(),
    ...over,
  });

  test("renders nothing when closed or anchor missing", () => {
    const { container } = render(<NotificationsMenu {...baseProps({ openToolbarMenu: "yil" })} />);
    expect(container.innerHTML).toBe("");
    render(<NotificationsMenu {...baseProps({ _notificationsToolbarItemRef: emptyRef() })} />);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  test.each([
    ["en", "New fields (last 5 days)", "Loading…", "No recent data"],
    ["ru", "Новые поля (последние 5 дней)", "Загрузка…", "Нет новых данных"],
    ["uz_lat", "Yangi maydonlar (oxirgi 5 kun)", "Yuklanmoqda…", "Yangi ma'lumot yo'q"],
    ["uz_cyr", "Янги майдонлар (охирги 5 кун)", "Юкланмоқда…", "Янги маълумот йўқ"],
  ] as const)("localized header/loading/empty in %s", (language, header, loading, empty) => {
    const { unmount } = render(<NotificationsMenu {...baseProps({ language, notificationLoading: true })} />);
    expect(screen.getByRole("dialog").getAttribute("aria-label")).toBe(header);
    expect(screen.getByText(loading)).toBeTruthy();
    unmount();
    render(<NotificationsMenu {...baseProps({ language })} />);
    expect(screen.getByText(empty)).toBeTruthy();
  });

  test("shows error text", () => {
    render(<NotificationsMenu {...baseProps({ notificationError: "Failed" })} />);
    expect(screen.getByText("Failed")).toBeTruthy();
  });

  test("renders days with formatted counts and scroll cue; close works", () => {
    const props = baseProps({ notificationDays: DAYS, notificationCanScrollDown: true, language: "ru" });
    render(<NotificationsMenu {...props} />);
    expect(screen.getByText("D:2025-06-01")).toBeTruthy();
    expect(screen.getByText("R:1703")).toBeTruthy();
    expect(screen.getByText("N:12 полей")).toBeTruthy();
    expect(document.querySelector(".agri-v20-notifications-scroll-cue")).not.toBeNull();
    fireEvent.scroll(document.querySelector(".agri-v20-notifications-body") as Element);
    expect(props.onNotificationBodyScroll).toHaveBeenCalled();
    fireEvent.click(screen.getByLabelText("Close"));
    expect(props.onClose).toHaveBeenCalled();
  });

  test("hides scroll cue when not scrollable", () => {
    render(<NotificationsMenu {...baseProps({ notificationDays: DAYS })} />);
    expect(document.querySelector(".agri-v20-notifications-scroll-cue")).toBeNull();
  });
});

describe("toolbar-icons", () => {
  test("render expected markup", () => {
    const { container } = render(
      <div>
        <CalendarIcon />
        <InfoIcon />
        <BellIcon />
        <SunIcon className="sun" />
        <MoonIcon size={20} />
        <LogoutIcon />
        <LanguageIcon active isLight />
        <LanguageIcon active={false} isLight={false} />
      </div>,
    );
    expect(container.querySelectorAll("[data-icon]")).toHaveLength(3);
    expect(container.querySelector("svg.sun")?.getAttribute("width")).toBe("14");
    expect(container.querySelector("svg[width='20']")).not.toBeNull();
    expect(container.querySelector(".agri-logout-svg")).not.toBeNull();
    const langIcons = container.querySelectorAll(".agri-language-toolbar-icon");
    expect(langIcons[0].className).toContain("theme-light");
    expect(langIcons[0].className).toContain("is-active");
    expect(langIcons[1].className).toContain("theme-dark");
    expect(langIcons[1].className).not.toContain("is-active");
    expect(langIcons[0].querySelectorAll("img")).toHaveLength(3);
  });
});
