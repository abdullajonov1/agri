import { React } from "jimu-core";
import { fireEvent, render, screen } from "@testing-library/react";
import { AccessFieldPanel } from "./AccessFieldPanel";
import { AccessDialog } from "./AccessDialog";
import type { AccessFieldRule, DialogState } from "./access-model";
import type { AccessSettingController } from "./use-access-setting";

const field: AccessFieldRule = {
  id: "f1",
  title: "Region",
  field: "viloyat",
  rules: [
    { id: "r1", operator: "equal", value: "Andijon", groups: ["gA"] },
    { id: "r2", operator: "equal", value: "Buxoro", groups: [] },
  ],
} as unknown as AccessFieldRule;

jest.mock("./AccessRuleForm", () => ({
  AccessRuleForm: () => <div>rule-form-stub</div>,
}));

type Ctl = AccessSettingController;

const makeCtl = (over: Partial<Record<keyof Ctl, unknown>> = {}): Ctl =>
  ({
    config: { fullAccessGroups: [], rules: [field] },
    selectedRuleIds: [],
    selectedGroupKeys: [],
    groupsInfo: {},
    groupsLoading: false,
    selectedField: field,
    ruleForm: {},
    formTitle: "T",
    formField: "F",
    formGroup: "G",
    dialog: null,
    copyGroupId: jest.fn(async () => undefined),
    toggleRuleSelect: jest.fn(),
    toggleGroupSelect: jest.fn(),
    openAddGroup: jest.fn(),
    openEditRule: jest.fn(),
    openEditGroup: jest.fn(),
    openEditField: jest.fn(),
    openAddRule: jest.fn(),
    deleteSelectedRules: jest.fn(),
    deleteSelectedGroups: jest.fn(),
    setDialog: jest.fn(),
    setFormTitle: jest.fn(),
    setFormField: jest.fn(),
    setFormGroup: jest.fn(),
    saveField: jest.fn(),
    saveRule: jest.fn(),
    saveGroup: jest.fn(),
    saveGlobalGroup: jest.fn(),
    deleteField: jest.fn(),
    deleteRule: jest.fn(),
    deleteGroup: jest.fn(),
    deleteGlobalGroup: jest.fn(),
    ...over,
  }) as unknown as Ctl;

describe("AccessFieldPanel", () => {
  test("renders title, attribute, WHERE of each rule and the empty-groups hint", () => {
    render(<AccessFieldPanel ctl={makeCtl()} field={field} />);
    expect(screen.getByText("Region")).toBeTruthy();
    expect(screen.getByText("Атрибут: viloyat")).toBeTruthy();
    expect(screen.getByText("viloyat = 'Andijon'")).toBeTruthy();
    expect(screen.getByText("Группы не добавлены")).toBeTruthy();
  });

  test("shows the empty state when the field has no rules", () => {
    render(<AccessFieldPanel ctl={makeCtl()} field={{ ...field, rules: [] }} />);
    expect(screen.getByText("Правила ещё не добавлены")).toBeTruthy();
  });

  test("routes rule and header actions to the controller", () => {
    const ctl = makeCtl({ selectedRuleIds: ["r1"] });
    render(<AccessFieldPanel ctl={ctl} field={field} />);
    expect(screen.getByText("Выбрано правил: 1")).toBeTruthy();
    fireEvent.click(screen.getAllByText("+ группа")[0]);
    expect(ctl.openAddGroup).toHaveBeenCalledWith("r1");
    fireEvent.click(screen.getAllByRole("checkbox")[0]);
    expect(ctl.toggleRuleSelect).toHaveBeenCalledWith("r1");
    fireEvent.click(screen.getByText("Delete selected / Удалить выбранные"));
    expect(ctl.deleteSelectedRules).toHaveBeenCalled();
    fireEvent.click(screen.getByText("+ Add rule / Добавить правило"));
    expect(ctl.openAddRule).toHaveBeenCalled();
    fireEvent.click(screen.getAllByText("×")[0]);
    expect(ctl.setDialog).toHaveBeenCalledWith({ type: "deleteField" });
    fireEvent.click(screen.getAllByText("×")[1]);
    expect(ctl.setDialog).toHaveBeenCalledWith({ type: "deleteRule", payload: { ruleId: "r1" } });
    fireEvent.click(screen.getAllByText("✎")[1]);
    expect(ctl.openEditRule).toHaveBeenCalledWith(field.rules[0]);
    fireEvent.click(screen.getAllByText("✎")[0]);
    expect(ctl.openEditField).toHaveBeenCalled();
  });

  test("group rows inside a rule route edit and delete with indexes", () => {
    const ctl = makeCtl();
    render(<AccessFieldPanel ctl={ctl} field={field} />);
    fireEvent.click(screen.getAllByText("✎")[2]);
    expect(ctl.openEditGroup).toHaveBeenCalledWith("r1", 0, "gA");
    fireEvent.click(screen.getAllByText("×")[2]);
    expect(ctl.setDialog).toHaveBeenCalledWith({
      type: "deleteGroup",
      payload: { ruleId: "r1", groupIndex: 0 },
    });
  });
});

describe("AccessDialog", () => {
  const withDialog = (dialog: DialogState): Ctl => makeCtl({ dialog });

  test("renders nothing when closed", () => {
    const { container } = render(<AccessDialog ctl={withDialog(null)} />);
    expect(container.innerHTML).toBe("");
  });

  test("add-field dialog edits title/field and saves, with first-rule block", () => {
    const ctl = withDialog({ type: "addField" });
    render(<AccessDialog ctl={ctl} />);
    expect(screen.getByText("Первое правило")).toBeTruthy();
    expect(screen.getByText("rule-form-stub")).toBeTruthy();
    fireEvent.change(screen.getByPlaceholderText("Название"), { target: { value: "N" } });
    fireEvent.change(screen.getByPlaceholderText("Поле"), { target: { value: "P" } });
    expect(ctl.setFormTitle).toHaveBeenCalledWith("N");
    expect(ctl.setFormField).toHaveBeenCalledWith("P");
    fireEvent.click(screen.getByText("Save / Сохранить"));
    expect(ctl.saveField).toHaveBeenCalled();
    fireEvent.click(screen.getByText("Cancel / Отмена"));
    expect(ctl.setDialog).toHaveBeenCalledWith(null);
  });

  test("edit-field dialog omits the first-rule block", () => {
    render(<AccessDialog ctl={withDialog({ type: "editField" })} />);
    expect(screen.getByText("Edit field / Редактировать столбец")).toBeTruthy();
    expect(screen.queryByText("Первое правило")).toBeNull();
  });

  test.each([
    ["addRule", "Add rule / Добавить правило"],
    ["editRule", "Edit rule / Редактировать правило"],
  ] as const)("%s dialog title and save", (type, title) => {
    const ctl = withDialog({ type });
    render(<AccessDialog ctl={ctl} />);
    expect(screen.getByText(title)).toBeTruthy();
    fireEvent.click(screen.getByText("Save / Сохранить"));
    expect(ctl.saveRule).toHaveBeenCalled();
  });

  test.each([
    ["addGroup", "Добавить группу", "saveGroup"],
    ["editGroup", "Редактировать группу", "saveGroup"],
    ["addGlobalGroup", "Add full-access group / Добавить группу полного доступа", "saveGlobalGroup"],
    ["editGlobalGroup", "Edit full-access group / Редактировать группу полного доступа", "saveGlobalGroup"],
  ] as const)("%s dialog edits the group value and saves", (type, title, saver) => {
    const ctl = withDialog({ type });
    render(<AccessDialog ctl={ctl} />);
    expect(screen.getByText(title)).toBeTruthy();
    fireEvent.change(screen.getByPlaceholderText("Группа"), { target: { value: "gz" } });
    expect(ctl.setFormGroup).toHaveBeenCalledWith("gz");
    fireEvent.click(screen.getByText("Save / Сохранить"));
    expect(ctl[saver]).toHaveBeenCalled();
  });

  test.each([
    ["deleteField", "deleteField"],
    ["deleteRule", "deleteRule"],
    ["deleteGroup", "deleteGroup"],
    ["deleteGlobalGroup", "deleteGlobalGroup"],
  ] as const)("%s confirmation calls the delete handler or cancels", (type, handler) => {
    const ctl = withDialog({ type });
    render(<AccessDialog ctl={ctl} />);
    fireEvent.click(screen.getByText("Delete / Удалить"));
    expect(ctl[handler]).toHaveBeenCalled();
    fireEvent.click(screen.getByText("Cancel / Отмена"));
    expect(ctl.setDialog).toHaveBeenCalledWith(null);
  });
});
