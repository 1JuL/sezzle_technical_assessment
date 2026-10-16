import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCalculator } from "../useCalculator";
import * as api from "../api";

describe("useCalculator hook", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("initializes with 0 and no error", () => {
    const { result } = renderHook(() => useCalculator());

    expect(result.current.display).toBe("0");
    expect(result.current.expression).toBe("");
    expect(result.current.error).toBeNull();
  });

  it("appends digits and formats multi-digit numbers", () => {
    const { result } = renderHook(() => useCalculator());

    act(() => {
      result.current.inputDigit("1");
      result.current.inputDigit("2");
      result.current.inputDigit("3");
    });

    expect(result.current.display).toBe("123");
  });

  it("handles decimal point entry correctly without duplicating", () => {
    const { result } = renderHook(() => useCalculator());

    act(() => {
      result.current.inputDigit("4");
      result.current.inputDecimal();
      result.current.inputDecimal(); // duplicate should be ignored
      result.current.inputDigit("5");
    });

    expect(result.current.display).toBe("4.5");
  });

  it("toggles sign properly", () => {
    const { result } = renderHook(() => useCalculator());

    act(() => {
      result.current.inputDigit("8");
    });
    expect(result.current.display).toBe("8");

    act(() => {
      result.current.toggleSign();
    });
    expect(result.current.display).toBe("-8");

    act(() => {
      result.current.toggleSign();
    });
    expect(result.current.display).toBe("8");
  });

  it("backspaces properly and returns to 0 when last digit is removed", () => {
    const { result } = renderHook(() => useCalculator());

    act(() => {
      result.current.inputDigit("9");
      result.current.inputDigit("5");
    });
    expect(result.current.display).toBe("95");

    act(() => {
      result.current.backspace();
    });
    expect(result.current.display).toBe("9");

    act(() => {
      result.current.backspace();
    });
    expect(result.current.display).toBe("0");
  });

  it("clears all state on clear()", () => {
    const { result } = renderHook(() => useCalculator());

    act(() => {
      result.current.inputDigit("9");
      result.current.performOperation("add");
      result.current.clear();
    });

    expect(result.current.display).toBe("0");
    expect(result.current.expression).toBe("");
    expect(result.current.operation).toBeNull();
  });

  it("performs square root calculation and updates display", async () => {
    vi.spyOn(api, "calculate").mockResolvedValue(9);
    const { result } = renderHook(() => useCalculator());

    act(() => {
      result.current.inputDigit("8");
      result.current.inputDigit("1");
    });

    await act(async () => {
      await result.current.performSqrt();
    });

    expect(api.calculate).toHaveBeenCalledWith("sqrt", 81);
    expect(result.current.display).toBe("9");
    expect(result.current.expression).toBe("√(81) =");
  });

  it("displays backend error directly when operation fails", async () => {
    vi.spyOn(api, "calculate").mockRejectedValue(new Error("Square root of a negative number"));
    const { result } = renderHook(() => useCalculator());

    act(() => {
      result.current.inputDigit("9");
      result.current.toggleSign(); // -9
    });

    await act(async () => {
      await result.current.performSqrt();
    });

    expect(result.current.error).toBe("Square root of a negative number");
    expect(result.current.display).toBe("Square root of a negative number");
  });
});

