import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import App from "../App";
import * as api from "../api";

describe("App Integration Tests", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders calculator with 0 display and buttons", () => {
    render(<App />);

    const display = screen.getByTestId("calculator-display");
    expect(display.textContent).toBe("0");

    expect(screen.getByRole("button", { name: "Clear" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Equals" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Add" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Divide" })).toBeDefined();
  });

  it("performs full calculation flow (7 + 5 = 12) via API", async () => {
    vi.spyOn(api, "calculate").mockResolvedValue(12);
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "7" }));
    fireEvent.click(screen.getByRole("button", { name: "Add" }));
    fireEvent.click(screen.getByRole("button", { name: "5" }));
    fireEvent.click(screen.getByRole("button", { name: "Equals" }));

    expect(api.calculate).toHaveBeenCalledWith("add", 7, 5);

    await waitFor(() => {
      const display = screen.getByTestId("calculator-display");
      expect(display.textContent).toBe("12");
    });
  });

  it("shows backend error directly in display on division by zero", async () => {
    vi.spyOn(api, "calculate").mockRejectedValue(new Error("Division by zero"));
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "8" }));
    fireEvent.click(screen.getByRole("button", { name: "Divide" }));
    fireEvent.click(screen.getByRole("button", { name: "0" }));
    fireEvent.click(screen.getByRole("button", { name: "Equals" }));

    expect(api.calculate).toHaveBeenCalledWith("divide", 8, 0);

    // Backend error message should be displayed directly in the calculator screen
    await waitFor(() => {
      const display = screen.getByTestId("calculator-display");
      expect(display.textContent).toBe("Division by zero");
      expect(display.className).toContain("has-error");
    });
  });

  it("handles keyboard events cleanly without if-else chain", async () => {
    vi.spyOn(api, "calculate").mockResolvedValue(40);
    render(<App />);

    // Type '8'
    fireEvent.keyDown(window, { key: "8" });
    expect(screen.getByTestId("calculator-display").textContent).toBe("8");

    // Type '*' (multiply)
    fireEvent.keyDown(window, { key: "*" });

    // Type '5'
    fireEvent.keyDown(window, { key: "5" });
    expect(screen.getByTestId("calculator-display").textContent).toBe("5");

    // Press 'Enter'
    fireEvent.keyDown(window, { key: "Enter" });

    expect(api.calculate).toHaveBeenCalledWith("multiply", 8, 5);
    await waitFor(() => {
      expect(screen.getByTestId("calculator-display").textContent).toBe("40");
    });
  });

  it("clears display and error when AC is pressed or Escape is typed", async () => {
    vi.spyOn(api, "calculate").mockRejectedValue(new Error("Unknown error"));
    render(<App />);

    // Trigger error
    fireEvent.click(screen.getByRole("button", { name: "9" }));
    fireEvent.click(screen.getByRole("button", { name: "Divide" }));
    fireEvent.click(screen.getByRole("button", { name: "0" }));
    fireEvent.click(screen.getByRole("button", { name: "Equals" }));

    await waitFor(() => {
      expect(screen.getByTestId("calculator-display").textContent).toBe("Unknown error");
    });

    // Press Escape on keyboard to clear
    fireEvent.keyDown(window, { key: "Escape" });

    // Should reset display to 0
    expect(screen.getByTestId("calculator-display").textContent).toBe("0");
    expect(screen.getByTestId("calculator-display").className).not.toContain("has-error");
  });
});

