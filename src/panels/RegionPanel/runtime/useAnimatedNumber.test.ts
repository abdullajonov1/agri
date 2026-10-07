import { act, renderHook } from "@testing-library/react";
import { useAnimatedNumber } from "./useAnimatedNumber";

interface HookProps {
  target: number;
  enabled?: boolean;
}

describe("useAnimatedNumber", () => {
  let now = 0;
  let queue: FrameRequestCallback[] = [];

  beforeEach(() => {
    now = 0;
    queue = [];
    jest.spyOn(performance, "now").mockImplementation(() => now);
    jest.spyOn(window, "requestAnimationFrame").mockImplementation((cb: FrameRequestCallback) => {
      queue.push(cb);
      return queue.length;
    });
    jest.spyOn(window, "cancelAnimationFrame").mockImplementation(() => undefined);
  });

  afterEach(() => jest.restoreAllMocks());

  const flushFrame = (at: number): void => {
    now = at;
    const pending = queue;
    queue = [];
    act(() => pending.forEach((cb) => cb(at)));
  };

  test("starts at the initial target", () => {
    const { result } = renderHook(() => useAnimatedNumber(10));
    expect(result.current).toBe(10);
  });

  test("animates towards a new target and settles exactly", () => {
    const { result, rerender } = renderHook(({ target }: HookProps) => useAnimatedNumber(target, { duration: 100 }), {
      initialProps: { target: 0 },
    });
    rerender({ target: 100 });
    flushFrame(25);
    expect(result.current).toBeGreaterThan(0);
    expect(result.current).toBeLessThan(100);
    flushFrame(50);
    expect(result.current).toBeCloseTo(50, 5);
    flushFrame(200);
    expect(result.current).toBe(100);
    expect(queue).toHaveLength(0);
  });

  test("jumps immediately when disabled or target not finite", () => {
    const { result, rerender } = renderHook(
      ({ target, enabled }: HookProps) => useAnimatedNumber(target, { enabled }),
      { initialProps: { target: 1, enabled: false } },
    );
    rerender({ target: 42, enabled: false });
    expect(result.current).toBe(42);
    rerender({ target: Number.NaN, enabled: true });
    expect(result.current).toBeNaN();
  });

  test("ignores sub-precision changes", () => {
    const { result, rerender } = renderHook(({ target }: HookProps) => useAnimatedNumber(target), {
      initialProps: { target: 5 },
    });
    rerender({ target: 5.001 });
    expect(queue).toHaveLength(0);
    expect(result.current).toBe(5);
  });
});
