import { act, renderHook } from "@testing-library/react";
import { Immutable, React } from "jimu-core";
import type { AllWidgetSettingProps } from "jimu-for-builder";
import type { IMConfig } from "../../config";
import { GLOBAL_ACCESS_ID, type AccessConfig } from "./access-model";
import { useAccessSetting } from "./use-access-setting";
import * as io from "./access-io";

jest.mock("./use-portal-groups", () => ({
  usePortalGroups: () => ({ groupsInfo: {}, groupsLoading: false }),
}));
jest.mock("./access-io", () => ({
  ...jest.requireActual("./access-io"),
  copyTextToClipboard: jest.fn(),
  downloadAccessConfigJson: jest.fn(),
  resolveAccessImport: jest.fn(),
}));

function immutable<T>(value: T): T {
  return (Immutable as unknown as (input: T) => T)(value);
}

const mockCopy = io.copyTextToClipboard as jest.Mock<Promise<void>, [string]>;
const mockDownload = io.downloadAccessConfigJson as jest.Mock<void, [AccessConfig]>;
const mockResolve = io.resolveAccessImport as jest.Mock<AccessConfig | null, unknown[]>;

const initial: AccessConfig = {
  fullAccessGroups: ["gFull"],
  rules: [
    {
      id: "f1",
      title: "Region",
      field: "viloyat",
      rules: [{ id: "r1", operator: "equal", value: "Andijon", groups: ["gA", "gB"] }],
    },
  ],
} as unknown as AccessConfig;

const makeProps = (onSettingChange = jest.fn()): AllWidgetSettingProps<IMConfig> =>
  ({
    id: "w1",
    config: immutable({ accessConfig: initial }),
    onSettingChange,
  }) as unknown as AllWidgetSettingProps<IMConfig>;

const setup = (onSettingChange = jest.fn()) => {
  const props = makeProps(onSettingChange);
  const hook = renderHook(() => useAccessSetting(props));
  return { ...hook, onSettingChange };
};

describe("useAccessSetting", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(window, "alert").mockImplementation((): void => undefined);
  });
  afterEach(() => jest.restoreAllMocks());

  test("starts on the global panel with the stored config and no changes", () => {
    const { result } = setup();
    expect(result.current.selectedId).toBe(GLOBAL_ACCESS_ID);
    expect(result.current.selectedField).toBeNull();
    expect(result.current.config.fullAccessGroups).toEqual(["gFull"]);
    expect(result.current.hasUnsavedChanges).toBe(false);
  });

  test("selecting a field exposes it and clears selections", () => {
    const { result } = setup();
    act(() => result.current.toggleRuleSelect("r1"));
    expect(result.current.selectedRuleIds).toEqual(["r1"]);
    act(() => result.current.selectLeftItem("f1"));
    expect(result.current.selectedField?.title).toBe("Region");
    expect(result.current.selectedRuleIds).toEqual([]);
    act(() => result.current.toggleRuleSelect("r1"));
    act(() => result.current.toggleRuleSelect("r1"));
    expect(result.current.selectedRuleIds).toEqual([]);
  });

  test("add field requires title and field, then selects the new field", () => {
    const { result } = setup();
    act(() => result.current.openAddField());
    expect(result.current.dialog?.type).toBe("addField");
    act(() => result.current.saveField());
    expect(result.current.config.rules).toHaveLength(1);
    act(() => {
      result.current.setFormTitle("  Rayon ");
      result.current.setFormField(" tuman ");
    });
    act(() => result.current.ruleForm.setRuleValue("X"));
    act(() => result.current.saveField());
    expect(result.current.config.rules).toHaveLength(2);
    const added = result.current.config.rules[1];
    expect(added).toMatchObject({ title: "Rayon", field: "tuman" });
    expect(added.rules).toHaveLength(1);
    expect(result.current.selectedId).toBe(added.id);
    expect(result.current.dialog).toBeNull();
    expect(result.current.hasUnsavedChanges).toBe(true);
  });

  test("edit field updates title and attribute; delete field falls back to global", () => {
    const { result } = setup();
    act(() => result.current.openEditField());
    expect(result.current.dialog).toBeNull();
    act(() => result.current.selectLeftItem("f1"));
    act(() => result.current.openEditField());
    expect(result.current.formTitle).toBe("Region");
    act(() => result.current.setFormTitle("Viloyat"));
    act(() => result.current.saveField());
    expect(result.current.config.rules[0].title).toBe("Viloyat");
    act(() => result.current.deleteField());
    expect(result.current.config.rules).toHaveLength(0);
    expect(result.current.selectedId).toBe(GLOBAL_ACCESS_ID);
  });

  test("add rule alerts when the form is empty, otherwise appends", () => {
    const { result } = setup();
    act(() => result.current.selectLeftItem("f1"));
    act(() => result.current.openAddRule());
    act(() => result.current.saveRule());
    expect(window.alert).toHaveBeenCalled();
    expect(result.current.config.rules[0].rules).toHaveLength(1);
    act(() => result.current.ruleForm.setRuleValue("Buxoro"));
    act(() => result.current.saveRule());
    expect(result.current.config.rules[0].rules).toHaveLength(2);
    expect(result.current.dialog).toBeNull();
  });

  test("edit rule replaces the condition and keeps groups", () => {
    const { result } = setup();
    act(() => result.current.selectLeftItem("f1"));
    act(() => result.current.openEditRule(result.current.config.rules[0].rules[0]));
    expect(result.current.dialog?.type).toBe("editRule");
    act(() => result.current.ruleForm.setRuleValue("Namangan"));
    act(() => result.current.saveRule());
    const rule = result.current.config.rules[0].rules[0];
    expect(rule).toMatchObject({ id: "r1", value: "Namangan" });
    expect(rule.groups).toEqual(["gA", "gB"]);
  });

  test("delete rule and bulk delete selected rules", () => {
    const { result } = setup();
    act(() => result.current.selectLeftItem("f1"));
    act(() => result.current.deleteSelectedRules());
    expect(result.current.config.rules[0].rules).toHaveLength(1);
    act(() => result.current.setDialog({ type: "deleteRule", payload: { ruleId: "r1" } }));
    act(() => result.current.deleteRule());
    expect(result.current.config.rules[0].rules).toHaveLength(0);

    const second = setup();
    act(() => second.result.current.selectLeftItem("f1"));
    act(() => second.result.current.toggleRuleSelect("r1"));
    act(() => second.result.current.deleteSelectedRules());
    expect(second.result.current.config.rules[0].rules).toHaveLength(0);
    expect(second.result.current.selectedRuleIds).toEqual([]);
  });

  test("group add, edit and delete inside a rule", () => {
    const { result } = setup();
    act(() => result.current.selectLeftItem("f1"));
    act(() => result.current.openAddGroup("r1"));
    act(() => result.current.saveGroup());
    expect(result.current.config.rules[0].rules[0].groups).toEqual(["gA", "gB"]);
    act(() => result.current.setFormGroup(" gC "));
    act(() => result.current.saveGroup());
    expect(result.current.config.rules[0].rules[0].groups).toEqual(["gA", "gB", "gC"]);
    act(() => result.current.openEditGroup("r1", 0, "gA"));
    expect(result.current.formGroup).toBe("gA");
    act(() => result.current.setFormGroup("gZ"));
    act(() => result.current.saveGroup());
    expect(result.current.config.rules[0].rules[0].groups[0]).toBe("gZ");
    act(() => result.current.setDialog({ type: "deleteGroup", payload: { ruleId: "r1", groupIndex: 0 } }));
    act(() => result.current.deleteGroup());
    expect(result.current.config.rules[0].rules[0].groups).toEqual(["gB", "gC"]);
  });

  test("selected group keys are deleted from rules and from global groups", () => {
    const { result } = setup();
    act(() => result.current.deleteSelectedGroups());
    act(() => result.current.toggleGroupSelect("global_0"));
    act(() => result.current.deleteSelectedGroups());
    expect(result.current.config.fullAccessGroups).toEqual([]);
    expect(result.current.selectedGroupKeys).toEqual([]);

    act(() => result.current.selectLeftItem("f1"));
    const key = result.current.selectedField ? `r1_0` : "";
    act(() => result.current.toggleGroupSelect(key));
    act(() => result.current.deleteSelectedGroups());
    expect(result.current.config.rules[0].rules[0].groups).toEqual(["gB"]);
  });

  test("global group add, edit, delete", () => {
    const { result } = setup();
    act(() => result.current.openAddGlobalGroup());
    act(() => result.current.saveGlobalGroup());
    expect(result.current.config.fullAccessGroups).toEqual(["gFull"]);
    act(() => result.current.setFormGroup("gNew"));
    act(() => result.current.saveGlobalGroup());
    expect(result.current.config.fullAccessGroups).toEqual(["gFull", "gNew"]);
    act(() => result.current.openEditGlobalGroup(0, "gFull"));
    act(() => result.current.setFormGroup("gEdited"));
    act(() => result.current.saveGlobalGroup());
    expect(result.current.config.fullAccessGroups[0]).toBe("gEdited");
    act(() => result.current.setDialog({ type: "deleteGlobalGroup", payload: { groupIndex: 0 } }));
    act(() => result.current.deleteGlobalGroup());
    expect(result.current.config.fullAccessGroups).toEqual(["gNew"]);
  });

  test("download passes the draft config to the exporter", () => {
    const { result } = setup();
    act(() => result.current.downloadJson());
    expect(mockDownload).toHaveBeenCalledWith(result.current.config);
  });

  test("copyGroupId shows a success or failure notice", async () => {
    const { result } = setup();
    mockCopy.mockResolvedValueOnce(undefined);
    await act(async () => result.current.copyGroupId("g1"));
    expect(result.current.notice).toBe("ID скопирован");
    mockCopy.mockRejectedValueOnce(new Error("no"));
    await act(async () => result.current.copyGroupId("g1"));
    expect(result.current.notice).toBe("Не удалось скопировать ID");
  });

  test("applyConfig writes accessConfig through onSettingChange", () => {
    const { result, onSettingChange } = setup();
    act(() => result.current.openAddGlobalGroup());
    act(() => result.current.setFormGroup("gNew"));
    act(() => result.current.saveGlobalGroup());
    expect(result.current.hasUnsavedChanges).toBe(true);
    act(() => result.current.applyConfig());
    expect(onSettingChange).toHaveBeenCalledTimes(1);
    const arg = onSettingChange.mock.calls[0][0] as { id: string; config: { accessConfig: AccessConfig } };
    expect(arg.id).toBe("w1");
    expect(arg.config.accessConfig.fullAccessGroups).toEqual(["gFull", "gNew"]);
    expect(result.current.hasUnsavedChanges).toBe(false);
    expect(result.current.notice).toBe("Настройки применены");
  });

  test("cancelConfigChanges restores the saved config and closes dialogs", () => {
    const { result } = setup();
    act(() => result.current.selectLeftItem("f1"));
    act(() => result.current.setDialog({ type: "deleteField" }));
    act(() => result.current.deleteField());
    expect(result.current.config.rules).toHaveLength(0);
    act(() => result.current.cancelConfigChanges());
    expect(result.current.config.rules).toHaveLength(1);
    expect(result.current.selectedId).toBe(GLOBAL_ACCESS_ID);
    expect(result.current.dialog).toBeNull();
    expect(result.current.notice).toBe("Изменения отменены");
  });

  describe("uploadJson", () => {
    const upload = (file: File | undefined, result: ReturnType<typeof setup>["result"]) => {
      const target = { files: file ? [file] : undefined, value: "x" };
      act(() => {
        result.current.uploadJson({ target } as unknown as React.ChangeEvent<HTMLInputElement>);
      });
      return target;
    };

    test("ignores empty selection", () => {
      const { result } = setup();
      upload(undefined, result);
      expect(mockResolve).not.toHaveBeenCalled();
    });

    test("applies an accepted import and resets the input", async () => {
      const imported = { fullAccessGroups: ["imp"], rules: [] } as AccessConfig;
      mockResolve.mockReturnValueOnce(imported);
      const { result } = setup();
      const target = upload(new File(["{}"], "a.json"), result);
      expect(target.value).toBe("");
      await act(async () => {
        await new Promise((r) => setTimeout(r, 30));
      });
      expect(result.current.config).toEqual(imported);
      expect(result.current.hasUnsavedChanges).toBe(true);
    });

    test("keeps the config when the import is rejected", async () => {
      mockResolve.mockReturnValueOnce(null);
      const { result } = setup();
      upload(new File(["{}"], "a.json"), result);
      await act(async () => {
        await new Promise((r) => setTimeout(r, 30));
      });
      expect(result.current.config.fullAccessGroups).toEqual(["gFull"]);
    });
  });
});
