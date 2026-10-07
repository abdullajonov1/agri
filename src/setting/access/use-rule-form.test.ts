import { act, renderHook } from "@testing-library/react";
import { useRuleForm } from "./use-rule-form";
import { useAccessNotice } from "./use-access-notice";
import type { AccessRule } from "./access-model";

describe("useRuleForm", () => {
  test("starts empty with the equal operator and no valid rule", () => {
    const { result } = renderHook(() => useRuleForm());
    expect(result.current.ruleOperator).toBe("equal");
    expect(result.current.ruleValues).toEqual([]);
    expect(result.current.getRuleFromForm()).toBeNull();
  });

  test("builds an equal rule from the value", () => {
    const { result } = renderHook(() => useRuleForm());
    act(() => result.current.setRuleValue("Andijon"));
    const rule = result.current.getRuleFromForm();
    expect(rule).toMatchObject({ operator: "equal", value: "Andijon" });
  });

  test("manages the include list: add (trimmed), update, remove", () => {
    const { result } = renderHook(() => useRuleForm());
    act(() => result.current.setRuleOperator("include"));
    act(() => result.current.setNewListValue("   "));
    act(() => result.current.addValueToInList());
    expect(result.current.ruleValues).toEqual([]);

    act(() => result.current.setNewListValue(" a "));
    act(() => result.current.addValueToInList());
    act(() => result.current.setNewListValue("b"));
    act(() => result.current.addValueToInList());
    expect(result.current.ruleValues).toEqual(["a", "b"]);
    expect(result.current.newListValue).toBe("");

    act(() => result.current.updateValueInList(1, "c"));
    act(() => result.current.removeValueFromInList(0));
    expect(result.current.ruleValues).toEqual(["c"]);
    expect(result.current.getRuleFromForm()).toMatchObject({ operator: "include", values: ["c"] });
  });

  test("fillRuleForm loads a rule and resetRuleForm clears it", () => {
    const { result } = renderHook(() => useRuleForm());
    const rule: AccessRule = { id: "r1", operator: "range", from: "1", to: "9", groups: [] } as AccessRule;
    act(() => result.current.fillRuleForm(rule));
    expect(result.current.ruleOperator).toBe("range");
    expect(result.current.ruleFrom).toBe("1");
    expect(result.current.ruleTo).toBe("9");
    expect(result.current.ruleValue).toBe("");
    act(() => result.current.setRuleTo("10"));
    expect(result.current.getRuleFromForm()).toMatchObject({ operator: "range", from: "1", to: "10" });

    act(() => result.current.resetRuleForm());
    expect(result.current.ruleOperator).toBe("equal");
    expect(result.current.ruleFrom).toBe("");
  });
});

describe("useAccessNotice", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  test("shows a notice then hides it after the delay; re-show restarts the timer", () => {
    const { result, unmount } = renderHook(() => useAccessNotice());
    expect(result.current.notice).toBeNull();
    act(() => result.current.showNotice("Saved"));
    expect(result.current.notice).toBe("Saved");
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    act(() => result.current.showNotice("Again"));
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(result.current.notice).toBe("Again");
    act(() => {
      jest.advanceTimersByTime(900);
    });
    expect(result.current.notice).toBeNull();
    act(() => result.current.showNotice("pending"));
    unmount();
    expect(jest.getTimerCount()).toBe(0);
  });
});
