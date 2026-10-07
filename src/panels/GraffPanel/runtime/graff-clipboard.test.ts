import { copyUniqueIdToClipboard } from "./graff-clipboard";

type ExecCommandHolder = { execCommand: (cmd: string) => boolean };

describe("copyUniqueIdToClipboard", () => {
  const original: unknown = (navigator as unknown as { clipboard?: unknown }).clipboard;

  const setClipboard = (value: unknown): void => {
    Object.defineProperty(navigator, "clipboard", { value, configurable: true });
  };

  afterEach(() => setClipboard(original));

  test("returns false for blank input", async () => {
    await expect(copyUniqueIdToClipboard("   ")).resolves.toBe(false);
  });

  test("uses navigator.clipboard when available", async () => {
    const writeText = jest.fn((): Promise<void> => Promise.resolve());
    setClipboard({ writeText });
    await expect(copyUniqueIdToClipboard(" abc ")).resolves.toBe(true);
    expect(writeText).toHaveBeenCalledWith("abc");
  });

  test("falls back to execCommand and removes textarea", async () => {
    setClipboard(undefined);
    const execCommand = jest.fn((): boolean => true);
    (document as unknown as ExecCommandHolder).execCommand = execCommand;
    await expect(copyUniqueIdToClipboard("id1")).resolves.toBe(true);
    expect(execCommand).toHaveBeenCalledWith("copy");
    expect(document.querySelector("textarea")).toBeNull();
  });

  test("returns false when clipboard throws", async () => {
    const writeText = jest.fn((): Promise<void> => Promise.reject(new Error("denied")));
    setClipboard({ writeText });
    await expect(copyUniqueIdToClipboard("id1")).resolves.toBe(false);
  });
});
