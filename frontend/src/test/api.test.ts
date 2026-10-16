import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { calculate } from "../api";

describe("API Client: calculate()", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("sends calculation request to /api/calculate and returns result", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ result: 42 }),
    } as Response);

    const result = await calculate("add", 20, 22);

    expect(result).toBe(42);
    expect(globalThis.fetch).toHaveBeenCalledWith("/api/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ operation: "add", a: 20, b: 22 }),
    });
  });

  it("throws backend error message on 400 Bad Request", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: "Division by zero" }),
    } as Response);

    await expect(calculate("divide", 10, 0)).rejects.toThrow("Division by zero");
  });

  it("handles unary operations (e.g. sqrt) with undefined 'b'", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ result: 8 }),
    } as Response);

    const result = await calculate("sqrt", 64);

    expect(result).toBe(8);
    expect(globalThis.fetch).toHaveBeenCalledWith("/api/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ operation: "sqrt", a: 64, b: undefined }),
    });
  });

  it("handles malformed JSON / fallback status message when error body is absent", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error("Invalid JSON");
      },
    } as unknown as Response);

    await expect(calculate("add", 1, 2)).rejects.toThrow("Request failed with status 500");
  });
});

