import { React } from "jimu-core";
import { fireEvent, render, screen } from "@testing-library/react";
import { AccessGroupIdentity, AccessGroupRow } from "./AccessGroupRow";
import { AccessRuleForm } from "./AccessRuleForm";
import { AccessGlobalPanel, SelectedGroupsBar } from "./AccessGlobalPanel";
import { useRuleForm } from "./use-rule-form";
import type { AccessFieldRule, PortalGroupInfo } from "./access-model";
import type { AccessSettingController } from "./use-access-setting";

describe("AccessGroupIdentity / AccessGroupRow", () => {
  const info: PortalGroupInfo = { id: "g1", title: "Admins", usersCount: 3 };

  test("shows loading state, title fallback and member count", () => {
    const copy = jest.fn(async () => undefined);
    const { rerender } = render(
      <AccessGroupIdentity groupId="g1" groupInfo={undefined} groupsLoading onCopyGroupId={copy} />,
    );
    expect(screen.getByText("Загрузка…")).toBeTruthy();
    rerender(<AccessGroupIdentity groupId="g1" groupInfo={undefined} groupsLoading={false} onCopyGroupId={copy} />);
    expect(screen.getByText("Название недоступно")).toBeTruthy();
    rerender(<AccessGroupIdentity groupId="g1" groupInfo={info} groupsLoading={false} onCopyGroupId={copy} />);
    expect(screen.getByText("Admins")).toBeTruthy();
    expect(screen.getByText("Пользователей: 3")).toBeTruthy();
    fireEvent.click(screen.getByTitle("Скопировать ID"));
    expect(copy).toHaveBeenCalledWith("g1");
  });

  test("row wires select, edit and delete callbacks", () => {
    const handlers = { onToggleSelect: jest.fn(), onEdit: jest.fn(), onDelete: jest.fn() };
    const { container } = render(
      <AccessGroupRow
        groupId="g1"
        groupInfo={info}
        groupsLoading={false}
        onCopyGroupId={jest.fn(async () => undefined)}
        isSelected
        {...handlers}
      />,
    );
    expect(container.querySelector(".groupRow")?.className).toContain("selectedGroup");
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByText("✎"));
    fireEvent.click(screen.getByText("×"));
    expect(handlers.onToggleSelect).toHaveBeenCalled();
    expect(handlers.onEdit).toHaveBeenCalled();
    expect(handlers.onDelete).toHaveBeenCalled();
  });
});

describe("AccessRuleForm", () => {
  const field = { id: "f1", title: "Region", field: "viloyat", rules: [] } as unknown as AccessFieldRule;

  const Harness = ({ selected }: { selected: AccessFieldRule | null }) => {
    const form = useRuleForm();
    return <AccessRuleForm form={form} selectedField={selected} />;
  };

  test("equal operator: typing a value updates the WHERE preview", () => {
    render(<Harness selected={field} />);
    expect(screen.getByText("viloyat ...")).toBeTruthy();
    fireEvent.change(screen.getByPlaceholderText("Значение"), { target: { value: "Andijon" } });
    expect(screen.getByText("viloyat = 'Andijon'")).toBeTruthy();
  });

  test("range operator shows from/to inputs", () => {
    render(<Harness selected={field} />);
    fireEvent.click(screen.getByText("Range"));
    expect(screen.getByText("Range").className).toBe("active");
    fireEvent.change(screen.getByPlaceholderText("От"), { target: { value: "1" } });
    fireEvent.change(screen.getByPlaceholderText("До"), { target: { value: "5" } });
    expect(screen.getByText("viloyat BETWEEN 1 AND 5")).toBeTruthy();
  });

  test("include operator manages a value list", () => {
    render(<Harness selected={field} />);
    fireEvent.click(screen.getByText("Include"));
    expect(screen.getByText("Список пуст")).toBeTruthy();
    fireEvent.change(screen.getByPlaceholderText("Значение"), { target: { value: "a" } });
    fireEvent.click(screen.getByText("Добавить"));
    expect(screen.queryByText("Список пуст")).toBeNull();
    const inputs = screen.getAllByPlaceholderText("Значение");
    fireEvent.change(inputs[1], { target: { value: "b" } });
    expect(screen.getByText("viloyat IN ('b')")).toBeTruthy();
    fireEvent.click(screen.getByText("×"));
    expect(screen.getByText("Список пуст")).toBeTruthy();
  });

  test("hides the preview without a selected field", () => {
    render(<Harness selected={null} />);
    fireEvent.click(screen.getByText("Like"));
    expect(screen.queryByText("Итоговое условие:")).toBeNull();
  });
});

describe("AccessGlobalPanel", () => {
  const makeCtl = (groups: string[], selected: string[] = []): AccessSettingController =>
    ({
      config: { fullAccessGroups: groups, rules: [] },
      selectedGroupKeys: selected,
      groupsInfo: {},
      groupsLoading: false,
      copyGroupId: jest.fn(async () => undefined),
      toggleGroupSelect: jest.fn(),
      openEditGlobalGroup: jest.fn(),
      openAddGlobalGroup: jest.fn(),
      deleteSelectedGroups: jest.fn(),
      setDialog: jest.fn(),
    }) as unknown as AccessSettingController;

  test("shows empty state and add button", () => {
    const ctl = makeCtl([]);
    render(<AccessGlobalPanel ctl={ctl} />);
    expect(screen.getByText("Группы полного доступа ещё не добавлены")).toBeTruthy();
    fireEvent.click(screen.getByText("+ Add group / Добавить группу"));
    expect(ctl.openAddGlobalGroup).toHaveBeenCalled();
  });

  test("renders group rows and routes row actions", () => {
    const ctl = makeCtl(["gA", "gB"], ["global_1"]);
    render(<AccessGlobalPanel ctl={ctl} />);
    expect(screen.getByText("Выбрано групп: 1")).toBeTruthy();
    fireEvent.click(screen.getAllByText("✎")[1]);
    expect(ctl.openEditGlobalGroup).toHaveBeenCalledWith(1, "gB");
    fireEvent.click(screen.getAllByText("×")[0]);
    expect(ctl.setDialog).toHaveBeenCalledWith({ type: "deleteGlobalGroup", payload: { groupIndex: 0 } });
    fireEvent.click(screen.getAllByRole("checkbox")[0]);
    expect(ctl.toggleGroupSelect).toHaveBeenCalledWith("global_0");
    fireEvent.click(screen.getByText("Delete selected / Удалить выбранные"));
    expect(ctl.deleteSelectedGroups).toHaveBeenCalled();
  });

  test("SelectedGroupsBar renders nothing without selection", () => {
    const { container } = render(<SelectedGroupsBar ctl={makeCtl(["g"])} />);
    expect(container.innerHTML).toBe("");
  });
});
