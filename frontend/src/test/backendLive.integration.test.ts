import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { Server } from "node:http";
import app from "../../../backend/app.js";
import { calculate } from "../api";

describe("Frontend <-> Backend End-to-End API Integration", () => {
  let server: Server;
  let serverUrl: string;
  const originalFetch = globalThis.fetch;

  beforeAll(async () => {
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const address = server.address();
        const port = typeof address === "object" && address ? address.port : 3000;
        serverUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });

    // Route fetch calls to the live backend server address
    globalThis.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === "string" ? `${serverUrl}${input}` : input;
      return originalFetch(url, init);
    };
  });

  afterAll(async () => {
    globalThis.fetch = originalFetch;
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it("calculates addition through live backend", async () => {
    const result = await calculate("add", 100, 250);
    expect(result).toBe(350);
  });

  it("calculates power through live backend", async () => {
    const result = await calculate("power", 2, 8);
    expect(result).toBe(256);
  });

  it("calculates square root through live backend", async () => {
    const result = await calculate("sqrt", 144);
    expect(result).toBe(12);
  });

  it("returns division by zero error from live backend", async () => {
    await expect(calculate("divide", 50, 0)).rejects.toThrow("Division by zero");
  });

  it("returns negative square root error from live backend", async () => {
    await expect(calculate("sqrt", -16)).rejects.toThrow("Square root of a negative number");
  });
});
