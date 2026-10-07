jest.mock("jimu-core", () => ({
  getAppStore: () => ({ getState: (): Record<string, never> => ({}) }),
}));

import { copyTextToClipboard, resolveAccessImport, type ImportDialogs } from "./access-io";
import type { AccessConfig, PortalGroupInfo } from "./access-model";

const current: AccessConfig = { fullAccessGroups: [], rules: [] };
const validJson = JSON.stringify({ fullAccessGroups: ["grp1"], rules: [] });

type MockDialogs = ImportDialogs & { alert: jest.Mock; confirm: jest.Mock };

const makeDialogs = (confirmAnswers: boolean[] = []): MockDialogs => {
  const answers = [...confirmAnswers];
  return {
    alert: jest.fn(),
    confirm: jest.fn(() => answers.shift() ?? false),
  };
};

describe("resolveAccessImport", () => {
  test("alerts on malformed JSON", () => {
    const dialogs = makeDialogs();
    expect(resolveAccessImport("{", current, {}, dialogs)).toBeNull();
    expect(dialogs.alert).toHaveBeenCalledWith("Неверная структура JSON");
  });

  test("alerts with validation errors", () => {
    const dialogs = makeDialogs();
    expect(resolveAccessImport("[]", current, {}, dialogs)).toBeNull();
    expect(String(dialogs.alert.mock.calls[0][0])).toContain("invalid access config");
  });

  test("returns the config after the diff is confirmed", () => {
    const dialogs = makeDialogs([true]);
    const result = resolveAccessImport(validJson, current, {}, dialogs);
    expect(result).toEqual({ fullAccessGroups: ["grp1"], rules: [] });
    expect(dialogs.confirm).toHaveBeenCalledTimes(1);
  });

  test("returns null when the diff is declined", () => {
    expect(resolveAccessImport(validJson, current, {}, makeDialogs([false]))).toBeNull();
  });

  test("warns about unknown group ids when portal groups are known", () => {
    const known: Record<string, PortalGroupInfo> = {
      other: { id: "other", title: "Other", usersCount: 1 },
    };
    const declined = makeDialogs([false]);
    expect(resolveAccessImport(validJson, current, known, declined)).toBeNull();
    expect(String(declined.confirm.mock.calls[0][0])).toContain("grp1");

    const accepted = makeDialogs([true, true]);
    expect(resolveAccessImport(validJson, current, known, accepted)).not.toBeNull();
    expect(accepted.confirm).toHaveBeenCalledTimes(2);
  });
});

describe("copyTextToClipboard", () => {
  const originalClipboard = navigator.clipboard;

  afterEach(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: originalClipboard,
      configurable: true,
    });
  });

  test("uses the async clipboard API when available", async () => {
    const writeText = jest.fn(() => Promise.resolve());
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });
    await copyTextToClipboard("abc");
    expect(writeText).toHaveBeenCalledWith("abc");
  });

  test("falls back to execCommand and removes the temp textarea", async () => {
    Object.defineProperty(navigator, "clipboard", { value: undefined, configurable: true });
    const execCommand = jest.fn(() => true);
    Object.defineProperty(document, "execCommand", { value: execCommand, configurable: true });
    await copyTextToClipboard("xyz");
    expect(execCommand).toHaveBeenCalledWith("copy");
    expect(document.querySelectorAll("textarea")).toHaveLength(0);
  });
});
