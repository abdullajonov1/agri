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
import { renderToStaticMarkup } from "react-dom/server";
import { ToolbarGroup, type ToolbarGroupProps } from "./ToolbarGroup";

type Lang = ToolbarGroupProps["language"];

const ref = (): React.RefObject<HTMLDivElement> => ({ current: null });

const render = (language: Lang): string =>
  renderToStaticMarkup(
    <ToolbarGroup
      openToolbarMenu={null}
      language={language}
      isDarkTheme={false}
      connectionStatus="connected"
      showProfileMenu={false}
      _notificationsToolbarItemRef={ref()}
      _indexInfoToolbarItemRef={ref()}
      _yilToolbarItemRef={ref()}
      _languageToolbarItemRef={ref()}
      toggleToolbarMenu={jest.fn()}
      applyThemeByValue={jest.fn()}
      toggleProfileMenu={jest.fn()}
      closeProfileMenu={jest.fn()}
      handleLogout={jest.fn()}
    />,
  );

const labelsOf = (html: string): string[] =>
  Array.from(html.matchAll(/aria-label="([^"]*)"/g), (m) => m[1]);
const tooltipsOf = (html: string): string[] =>
  Array.from(html.matchAll(/data-tooltip="([^"]*)"/g), (m) => m[1]);

// Order in markup: excel, notifications, indexInfo, yil, language, theme, logout
const EXPECTED: Record<string, string[]> = {
  en: ["Download Excel report", "Notifications", "About indices", "Year", "Language", "Theme", "Log out"],
  ru: ["Скачать Excel-отчёт", "Уведомления", "Инфо про индексы", "Год", "Язык", "Тема", "Выйти"],
  uz_lat: ["Excel hisobotni yuklash", "Bildirishnomalar", "Indekslar haqida", "Yil", "Til", "Tema", "Chiqish"],
  uz_cyr: ["Excel ҳисоботни юклаш", "Билдиришномалар", "Индекслар ҳақида", "Йил", "Тил", "Тема", "Чиқиш"],
};

describe("ToolbarGroup labels", () => {
  test.each(Object.keys(EXPECTED))("renders exact aria-label and tooltip texts in %s", (language) => {
    // Arrange
    const html = render(language as Lang);

    // Act
    const labels = labelsOf(html);
    const tooltips = tooltipsOf(html);

    // Assert
    expect(labels).toEqual(EXPECTED[language]);
    expect(tooltips).toEqual(EXPECTED[language]);
  });
});
