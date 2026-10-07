import { Immutable, React } from "jimu-core";
import { act, createEvent, fireEvent, render, screen } from "@testing-library/react";
import type { AllWidgetSettingProps } from "jimu-for-builder";
import type { IMConfig } from "../config";
import AgriPopupSettingPanel, { type FieldInfo } from "./agri-popup-setting";

interface MultiProps {
  placeholder: string;
  onClickItem: (e: React.MouseEvent, v: string | number, all: Array<string | number>) => void;
  displayByValues: (v: Array<string | number>) => string;
  items: Array<{ value: string; label: string }>;
  values: Array<string | number>;
}

jest.mock("jimu-ui", () => ({
  ...jest.requireActual("jimu-ui"),
  Switch: ({ checked, onChange }: { checked: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
    <input type="checkbox" role="switch" checked={!!checked} onChange={onChange} />
  ),
  Select: ({ value, onChange, children }: { value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; children: React.ReactNode }) => (
    <select aria-label="chart-type" value={value} onChange={onChange}>
      {children}
    </select>
  ),
  Option: ({ value, children }: { value: string; children: React.ReactNode }) => <option value={value}>{children}</option>,
  TextInput: ({ value, onChange, placeholder }: { value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string }) => (
    <input value={value} onChange={onChange} placeholder={placeholder} />
  ),
  MultiSelect: (props: MultiProps) => (
    <div data-testid="multi">
      <span>{props.displayByValues(props.values)}</span>
      <button type="button" onClick={(e) => props.onClickItem(e, "b", ["a", "b"])}>
        pick-b
      </button>
      <span>{props.items.map((i) => i.label).join("|")}</span>
    </div>
  ),
}));
jest.mock("jimu-ui/basic/color-picker", () => ({
  ColorPicker: ({ color, onChange }: { color: string; onChange: (c: string) => void }) => (
    <button type="button" onClick={() => onChange("#123456")}>
      color:{color}
    </button>
  ),
}));
jest.mock("./components/popup-data-sources", () => ({
  ...jest.requireActual("./components/popup-data-sources"),
  initializeDataSources: jest.fn(async (): Promise<void> => undefined),
  cleanupDataSources: jest.fn(),
}));

const allFields: FieldInfo[] = [
  { name: "a", alias: "Alpha", type: "string" },
  { name: "b", alias: "Beta", type: "string" },
  { name: "c", alias: "Gamma", type: "string" },
];

type Change = { config: { agriPopup: Record<string, unknown> } };

function immutable<T>(value: T): T {
  return (Immutable as unknown as (input: T) => T)(value);
}

const mount = (agri: Record<string, unknown>, withDs = true) => {
  const onSettingChange = jest.fn<void, [Change]>();
  const props = {
    id: "w1",
    config: immutable({ agriPopup: agri }),
    useDataSources: immutable(withDs ? [{ dataSourceId: "ds" }] : []),
    onSettingChange,
  } as unknown as AllWidgetSettingProps<IMConfig>;
  const ref = React.createRef<AgriPopupSettingPanel>();
  const utils = render(<AgriPopupSettingPanel ref={ref} {...props} />);
  const panel = ref.current as AgriPopupSettingPanel;
  return { ...utils, panel, onSettingChange, props };
};

const lastAgri = (fn: jest.Mock<void, [Change]>): Record<string, unknown> => fn.mock.calls.at(-1)?.[0].config.agriPopup ?? {};

describe("AgriPopupSettingPanel", () => {
  test("initial state is derived from the stored popup config", () => {
    const { panel } = mount({
      titleField: "t",
      fieldsToShow: ["a"],
      fieldOrder: ["b", "a"],
      settings: { zoomToSelection: false, showMapPopup: true },
    });
    expect(panel.state).toMatchObject({
      titleField: "t",
      fieldsToShowLocal: ["a"],
      fieldOrder: ["b", "a"],
      zoomToSelection: false,
      showMapPopup: true,
    });
  });

  test("hides field and chart sections without connected data sources", () => {
    mount({}, false);
    expect(screen.queryByText("Fields to Display")).toBeNull();
    expect(screen.queryByText(/Chart$/)).toBeNull();
    expect(screen.getByText("Behavior")).toBeTruthy();
  });

  test("behavior switches write zoom / popup / attachments settings", () => {
    const { onSettingChange } = mount({ settings: { showAttachments: true } });
    const switches = screen.getAllByRole("switch") as HTMLInputElement[];
    // order: chart, zoom, map popup, attachments
    fireEvent.click(switches[1]);
    expect((lastAgri(onSettingChange).settings as Record<string, unknown>).zoomToSelection).toBe(false);
    fireEvent.click(switches[2]);
    expect((lastAgri(onSettingChange).settings as Record<string, unknown>).showMapPopup).toBe(true);
    fireEvent.click(switches[3]);
    expect((lastAgri(onSettingChange).settings as Record<string, unknown>).showAttachments).toBe(false);
  });

  test("chart controls appear when enabled and write their values", () => {
    const { onSettingChange, panel } = mount({ chartEnabled: true, chartType: "bar", chartTitle: "Old", chartColor: "#abcdef" });
    act(() => panel.setState({ allFields }));
    fireEvent.change(screen.getByLabelText("chart-type"), { target: { value: "line" } });
    expect(lastAgri(onSettingChange).chartType).toBe("line");
    fireEvent.change(screen.getByDisplayValue("Old"), { target: { value: "New" } });
    expect(lastAgri(onSettingChange).chartTitle).toBe("New");
    fireEvent.click(screen.getByText("color:#abcdef"));
    expect(lastAgri(onSettingChange).chartColor).toBe("#123456");
    fireEvent.click(screen.getByText("pick-b"));
    expect(lastAgri(onSettingChange).chartFields).toEqual(["a", "b"]);
    expect(screen.getByText("Chart uchun maydonlarni tanlang...")).toBeTruthy();
    fireEvent.click(screen.getAllByRole("switch")[0]);
    expect(lastAgri(onSettingChange).chartEnabled).toBe(false);
  });

  test("multi-select shows a counted label summary for chart fields", () => {
    const { panel } = mount({ chartEnabled: true, chartFields: ["a", "zz"] });
    act(() => panel.setState({ allFields }));
    expect(screen.getByText(/2 tanlangan:/)).toBeTruthy();
  });

  test("field picker summary, menu portal, toggle and drag reorder", () => {
    const { panel, onSettingChange } = mount({ fieldsToShow: ["a"], fieldOrder: ["a", "b", "c"] });
    act(() => panel.setState({ allFields }));
    const button = screen.getByText(/1 tanlangan: /);
    expect(button.textContent).toContain("Alpha");
    (button as HTMLButtonElement).getBoundingClientRect = () => ({ top: 10, bottom: 40, left: 0, width: 220 }) as DOMRect;

    fireEvent.click(button);
    expect(panel.state.popupFieldMenuOpen).toBe(true);
    const items = document.body.querySelectorAll("li");
    expect(items).toHaveLength(3);

    fireEvent.click(items[1].querySelector("input") as HTMLInputElement);
    expect(lastAgri(onSettingChange).fieldsToShow).toEqual(["a", "b"]);

    const dt = { effectAllowed: "", dropEffect: "", setData: jest.fn() };
    fireEvent.dragStart(items[0], { dataTransfer: dt });
    expect(panel.popupFieldDragFrom).toBe(0);
    const over = createEvent.dragOver(items[2], { dataTransfer: dt });
    fireEvent(items[2], over);
    expect(over.defaultPrevented).toBe(true);
    fireEvent.drop(items[2], { dataTransfer: dt });
    expect(lastAgri(onSettingChange).fieldOrder).toEqual(["b", "c", "a"]);
    expect(panel.popupFieldDragFrom).toBeNull();

    fireEvent.drop(items[2], { dataTransfer: dt });
    expect(onSettingChange).toHaveBeenCalledTimes(2);
    fireEvent.dragStart(items[0], { dataTransfer: dt });
    fireEvent.dragEnd(items[0]);
    expect(panel.popupFieldDragFrom).toBeNull();

    fireEvent.mouseDown(document.body);
    expect(panel.state.popupFieldMenuOpen).toBe(false);
  });

  test("empty field selection shows the prompt", () => {
    mount({ fieldsToShow: [] });
    expect(screen.getByText("Maydonlarni tanlang...")).toBeTruthy();
  });

  test("unmount cleans up data sources", () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { cleanupDataSources } = jest.requireMock("./components/popup-data-sources") as { cleanupDataSources: jest.Mock };
    const { unmount } = mount({});
    unmount();
    expect(cleanupDataSources).toHaveBeenCalled();
  });
});
