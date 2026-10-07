import { Immutable, React } from "jimu-core";
import { fireEvent, render, screen } from "@testing-library/react";
import type { AllWidgetSettingProps } from "jimu-for-builder";
import type { IMConfig } from "../config";
import AgriAccessSettingPanel from "./agri-access-setting";

jest.mock("./agri-access-setting.css", () => ({}), { virtual: true });
jest.mock("./access/use-portal-groups", () => ({
  usePortalGroups: () => ({ groupsInfo: {}, groupsLoading: false }),
}));

function immutable<T>(value: T): T {
  return (Immutable as unknown as (input: T) => T)(value);
}

const makeProps = (onSettingChange = jest.fn()): AllWidgetSettingProps<IMConfig> =>
  ({
    id: "w1",
    config: immutable({
      accessConfig: {
        fullAccessGroups: ["gFull"],
        rules: [{ id: "f1", title: "Region", field: "viloyat", rules: [] }],
      },
    }),
    onSettingChange,
  }) as unknown as AllWidgetSettingProps<IMConfig>;

const openModal = (props = makeProps()) => {
  render(<AgriAccessSettingPanel {...props} />);
  fireEvent.click(screen.getByText("Настройка доступа / Access settings"));
  return props;
};

describe("AgriAccessSettingPanel", () => {
  test("renders the summary card with the modal closed", () => {
    render(<AgriAccessSettingPanel {...makeProps()} />);
    expect(screen.getByText("Data access / Доступ к данным")).toBeTruthy();
    expect(screen.queryByText("Access rules / Правила доступа")).toBeNull();
  });

  test("opens the modal on the full-access panel and closes on backdrop click", () => {
    const { container } = render(<AgriAccessSettingPanel {...makeProps()} />);
    fireEvent.click(screen.getByText("Настройка доступа / Access settings"));
    expect(screen.getByText("Access rules / Правила доступа")).toBeTruthy();
    expect(screen.getByText("Изменений нет")).toBeTruthy();
    // click inside the block must not close
    fireEvent.click(container.querySelector(".modalBlock") as Element);
    expect(container.querySelector(".modalArea")).not.toBeNull();
    fireEvent.click(container.querySelector(".modalArea") as Element);
    expect(container.querySelector(".modalArea")).toBeNull();
  });

  test("selecting a field shows its panel; selecting full access returns", () => {
    openModal();
    fireEvent.click(screen.getByText("Region"));
    expect(screen.getByText("Атрибут: viloyat", { exact: false })).toBeTruthy();
    expect(screen.getByText("Правила ещё не добавлены")).toBeTruthy();
    fireEvent.click(screen.getByText("Full access / Полный доступ"));
    expect(screen.queryByText("Правила ещё не добавлены")).toBeNull();
  });

  test("adding a full-access group marks changes; apply persists, cancel reverts", () => {
    const props = openModal();
    const apply = screen.getByText("Apply / Применить") as HTMLButtonElement;
    expect(apply.disabled).toBe(true);
    fireEvent.click(screen.getByText("+ Add group / Добавить группу"));
    fireEvent.change(screen.getByPlaceholderText("Группа"), { target: { value: "gNew" } });
    fireEvent.click(screen.getByText("Save / Сохранить"));
    expect(screen.getByText("Есть несохранённые изменения")).toBeTruthy();
    fireEvent.click(screen.getByText("Apply / Применить"));
    expect(props.onSettingChange).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Настройки применены")).toBeTruthy();

    fireEvent.click(screen.getByText("+ Add group / Добавить группу"));
    fireEvent.change(screen.getByPlaceholderText("Группа"), { target: { value: "gOther" } });
    fireEvent.click(screen.getByText("Save / Сохранить"));
    fireEvent.click(screen.getByText("Cancel / Отменить"));
    expect(screen.getByText("Изменения отменены")).toBeTruthy();
  });

  test("add-field button opens the add-field dialog", () => {
    openModal();
    fireEvent.click(screen.getByTitle("Add field / Добавить столбец"));
    expect(screen.getByText("Add field / Добавить столбец", { selector: ".dialogTitle" })).toBeTruthy();
  });

  test("export button is wired and import ignores an empty file list", () => {
    const createUrl = jest.fn(() => "blob:x");
    Object.assign(URL, { createObjectURL: createUrl, revokeObjectURL: jest.fn() });
    const click = jest.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
    const { container } = render(<AgriAccessSettingPanel {...makeProps()} />);
    fireEvent.click(screen.getByText("Настройка доступа / Access settings"));
    fireEvent.click(screen.getByText("Export / Скачать JSON"));
    expect(createUrl).toHaveBeenCalled();
    expect(click).toHaveBeenCalled();
    const input = container.querySelector("input[type=file]") as HTMLInputElement;
    fireEvent.change(input, { target: { files: [] } });
    click.mockRestore();
  });
});
