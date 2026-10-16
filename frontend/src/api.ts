export type Operation = "add" | "subtract" | "multiply" | "divide" | "power" | "percent" | "sqrt";

export async function calculate(operation: Operation, a: number, b?: number): Promise<number> {
  const res = await fetch("/api/calculate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ operation, a, b }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }

  return data.result;
}
