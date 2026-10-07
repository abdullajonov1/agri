import { Immutable, React, type UseDataSource } from "jimu-core";
import { act, fireEvent, render, screen } from "@testing-library/react";
import type { AllWidgetSettingProps } from "jimu-for-builder";
import type { IMConfig } from "../config";
import Setting from "./setting";

interface SelectorProps {
  onChange: (next: UseDataSource[]) => void;
  useDataSources: { asMutable?: () => unknown[] } | unknown[];
  isMultiple?: boolean;
}

const selectors: SelectorProps[] = [];

jest.mock("jimu-ui/advanced/data-source-selector", () => ({
  DataSourceSelector: (props: SelectorProps) => {
    selectors.push(props);
    return <div data-testid={props.isMultiple ? "feature-selector" : "webmap-selector"} />;
  },
}));
jest.mock("jimu-ui", () => ({
  ...jest.requireActual("jimu-ui"),
  Label: ({ children }: { children: React.ReactNode }) => <label>{children}</label>,
  NumericInput: ({ value, onAcceptValue }: { value: number; onAcceptValue: (v: number) => void }) => (
    <input data-testid={`num-${value}`} defaultValue={value} onBlur={(e) => onAcceptValue(Number(e.target.value))} />
  ),
  TextInput: ({
    value,
    placeholder,
    onChange,
    onAcceptValue,
    onBlur,
  }: {
    value: string;
    placeholder?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onAcceptValue?: (v: string) => void;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  }) => (
    <input
      defaultValue={value}
      placeholder={placeholder}
      onChange={(e) => {
        onChange?.(e);
        onAcceptValue?.(e.target.value);
      }}
      onBlur={onBlur}
    />
  ),
  Switch: ({ checked, onChange }: { checked: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
    <input type="checkbox" role="switch" checked={checked} onChange={onChange} />
  ),
}));
jest.mock("./agri-popup-setting", () => ({ __esModule: true, default: () => <div>popup-panel</div> }));
jest.mock("./agri-access-setting", () => ({ __esModule: true, default: () => <div>access-panel</div> }));

type Change = { id: string; config?: { [k: string]: unknown }; useDataSources?: UseDataSource[] };

function immutable<T>(value: T): T {
  return (Immutable as unknown as (input: T) => T)(value);
}

const ds = (id: string): UseDataSource => ({ dataSourceId: id, mainDataSourceId: id }) as unknown as UseDataSource;

const setup = (config: Record<string, unknown> | undefined, useDataSources: UseDataSource[] = []) => {
  const onSettingChange = jest.fn<void, [Change]>();
  const props = {
    id: "w1",
    config: config ? immutable(config) : undefined,
    useDataSources: immutable(useDataSources),
    onSettingChange,
  } as unknown as AllWidgetSettingProps<IMConfig>;
  render(<Setting {...props} />);
  return onSettingChange;
};

describe("Setting", () => {
  beforeEach(() => {
    selectors.length = 0;
  });

  test("renders defaults when there is no stored config", () => {
    setup(undefined);
    expect(screen.getByText("AgriDashboard")).toBeTruthy();
    expect(screen.getByText("popup-panel")).toBeTruthy();
    expect(screen.getByText("access-panel")).toBeTruthy();
    expect(screen.getByTestId("num-26")).toBeTruthy();
    expect(screen.getByTestId("num-38")).toBeTruthy();
    expect(screen.getAllByPlaceholderText(/^https?:\/\//).length).toBeGreaterThan(5);
  });

  test("layout inputs merge their value into the config", () => {
    const onChange = setup({ leftPanelWidthPercent: 30, bottomRowFraction: 40, other: "keep" });
    const input = screen.getByTestId("num-30") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "33" } });
    fireEvent.blur(input);
    const call = onChange.mock.calls[0][0];
    expect(call.id).toBe("w1");
    expect(call.config).toMatchObject({ leftPanelWidthPercent: 33, bottomRowFraction: 40, other: "keep" });
    fireEvent.blur(screen.getByTestId("num-40"));
    expect(onChange.mock.calls[1][0].config).toMatchObject({ bottomRowFraction: 40 });
  });

  test("service URL override is stored trimmed and removed when cleared", () => {
    const onChange = setup({ serviceUrls: { portalUrl: "https://p.test", arcgisServer: "https://a.test" } });
    const input = screen.getByDisplayValue("https://p.test") as HTMLInputElement;
    fireEvent.blur(input, { target: { value: "  https://new.test  " } });
    const stored = onChange.mock.calls[0][0].config?.serviceUrls as Record<string, string>;
    expect(stored).toMatchObject({ portalUrl: "https://new.test", arcgisServer: "https://a.test" });
    fireEvent.change(input, { target: { value: "" } });
    const cleared = onChange.mock.calls.at(-1)?.[0].config?.serviceUrls as Record<string, string>;
    expect(cleared.portalUrl).toBeUndefined();
    expect(cleared.arcgisServer).toBe("https://a.test");
  });

  test("removing the last service URL clears serviceUrls entirely", () => {
    const onChange = setup({ serviceUrls: { portalUrl: "https://p.test" } });
    fireEvent.change(screen.getByDisplayValue("https://p.test"), { target: { value: "" } });
    expect(onChange.mock.calls[0][0].config?.serviceUrls).toBeUndefined();
  });

  test("indicator fields update the nested indicator config", () => {
    const onChange = setup({ indicator: { label: "L", unitLabel: "u" } });
    fireEvent.change(screen.getByDisplayValue("L"), { target: { value: "Label2" } });
    expect(onChange.mock.calls[0][0].config?.indicator).toMatchObject({ label: "Label2", unitLabel: "u" });
    fireEvent.change(screen.getByPlaceholderText(/apisoil/), { target: { value: "https://e" } });
    expect(onChange.mock.calls[1][0].config?.indicator).toMatchObject({ apiEndpoint: "https://e" });
    fireEvent.change(screen.getByDisplayValue("total"), { target: { value: "sum" } });
    expect(onChange.mock.calls[2][0].config?.indicator).toMatchObject({ responseField: "sum" });
    fireEvent.change(screen.getByDisplayValue("u"), { target: { value: "ha" } });
    expect(onChange.mock.calls[3][0].config?.indicator).toMatchObject({ unitLabel: "ha" });
    fireEvent.click(screen.getByRole("switch"));
    expect(onChange.mock.calls[4][0].config?.indicator).toMatchObject({ useApiDataSource: false });
  });

  test("indicator update works when the config has no indicator yet", () => {
    const onChange = setup({});
    fireEvent.change(screen.getByDisplayValue("Ekin maydonlari"), { target: { value: "X" } });
    expect(onChange.mock.calls[0][0].config?.indicator).toMatchObject({ label: "X" });
  });

  test("feature layer selection keeps the already-selected web map source", () => {
    const onChange = setup({ webMapDataSourceId: "wm" }, [ds("wm"), ds("fl1")]);
    const featureSelector = selectors.find((s) => s.isMultiple) as SelectorProps;
    act(() => featureSelector.onChange([ds("fl2")]));
    const call = onChange.mock.calls[0][0];
    expect(call.useDataSources?.map((d) => d.dataSourceId)).toEqual(["fl2", "wm"]);
  });

  test("web map selection replaces the previous web map and records its id", () => {
    const onChange = setup({ webMapDataSourceId: "wmOld" }, [ds("wmOld"), ds("fl1")]);
    const webMapSelector = selectors.find((s) => !s.isMultiple) as SelectorProps;
    act(() => webMapSelector.onChange([ds("wmNew")]));
    const call = onChange.mock.calls[0][0];
    expect(call.useDataSources?.map((d) => d.dataSourceId)).toEqual(["fl1", "wmNew"]);
    expect(call.config?.webMapDataSourceId).toBe("wmNew");
    act(() => webMapSelector.onChange([]));
    expect(onChange.mock.calls[1][0].config?.webMapDataSourceId).toBe("");
  });

  test("map-settings request for this widget scrolls and highlights, others are ignored", () => {
    jest.useFakeTimers();
    const scroll = jest.fn();
    Element.prototype.scrollIntoView = scroll;
    const { container } = render(
      <Setting {...({ id: "w1", config: undefined, useDataSources: immutable([]), onSettingChange: jest.fn() } as unknown as AllWidgetSettingProps<IMConfig>)} />,
    );
    window.dispatchEvent(new CustomEvent("agri-main:map-settings-request", { detail: { widgetId: "other" } }));
    expect(scroll).not.toHaveBeenCalled();
    window.dispatchEvent(new CustomEvent("agri-main:map-settings-request", { detail: { widgetId: "w1" } }));
    expect(scroll).toHaveBeenCalledWith({ behavior: "smooth", block: "start" });
    expect(container.querySelector(".agri-map-settings-active")).not.toBeNull();
    act(() => {
      jest.advanceTimersByTime(1200);
    });
    expect(container.querySelector(".agri-map-settings-active")).toBeNull();
    jest.useRealTimers();
  });

  test("unmounting removes the request listener", () => {
    const scroll = jest.fn();
    Element.prototype.scrollIntoView = scroll;
    const { unmount } = render(
      <Setting {...({ id: "w1", config: undefined, useDataSources: immutable([]), onSettingChange: jest.fn() } as unknown as AllWidgetSettingProps<IMConfig>)} />,
    );
    unmount();
    window.dispatchEvent(new CustomEvent("agri-main:map-settings-request", { detail: { widgetId: "w1" } }));
    expect(scroll).not.toHaveBeenCalled();
  });
});
