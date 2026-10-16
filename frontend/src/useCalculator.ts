import { useState, useCallback } from "react";
import { calculate, type Operation } from "./api";

export const OPERATION_SYMBOLS: Record<Operation, string> = {
  add: "+",
  subtract: "−",
  multiply: "×",
  divide: "÷",
  power: "^",
  percent: "% of",
  sqrt: "√",
};

const formatNumber = (n: number) =>
  Number.isFinite(n) ? Number(n.toPrecision(12)).toString() : "Error";

export function useCalculator() {
  const [display, setDisplay] = useState("0");
  const [previousOperand, setPreviousOperand] = useState<number | null>(null);
  const [operation, setOperation] = useState<Operation | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [expression, setExpression] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const clear = useCallback(() => {
    setDisplay("0");
    setPreviousOperand(null);
    setOperation(null);
    setWaitingForOperand(false);
    setExpression("");
    setError(null);
  }, []);

  const inputDigit = useCallback(
    (d: string) => {
      if (isBusy) return;
      setError(null);
      if (waitingForOperand) {
        setDisplay(d);
        setWaitingForOperand(false);
      } else {
        setDisplay((prev) => (prev === "0" ? d : prev + d));
      }
    },
    [waitingForOperand, isBusy],
  );

  const inputDecimal = useCallback(() => {
    if (isBusy) return;
    setError(null);
    if (waitingForOperand) {
      setDisplay("0.");
      setWaitingForOperand(false);
    } else {
      setDisplay((prev) => (prev.includes(".") ? prev : prev + "."));
    }
  }, [waitingForOperand, isBusy]);

  const backspace = useCallback(() => {
    if (waitingForOperand || isBusy) return;
    setError(null);
    setDisplay((prev) => {
      const isNegativeSingleDigit = prev.length === 2 && prev.startsWith("-");
      return prev.length <= 1 || isNegativeSingleDigit ? "0" : prev.slice(0, -1);
    });
  }, [waitingForOperand, isBusy]);

  const toggleSign = useCallback(() => {
    if (isBusy) return;
    setError(null);
    setDisplay((prev) => {
      if (prev === "0" || prev === "0.") return prev;
      return prev.startsWith("-") ? prev.slice(1) : "-" + prev;
    });
  }, [isBusy]);

  // Unified API caller handling busy state and backend error messages
  const runApi = async (op: Operation, a: number, b?: number) => {
    setIsBusy(true);
    setError(null);
    try {
      const result = b !== undefined ? await calculate(op, a, b) : await calculate(op, a);
      return formatNumber(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
      return null;
    } finally {
      setIsBusy(false);
    }
  };

  const performSqrt = useCallback(async () => {
    if (isBusy) return;
    setExpression(`√(${display})`);
    const res = await runApi("sqrt", Number(display));
    if (res !== null) {
      setDisplay(res);
      setExpression(`√(${display}) =`);
      setPreviousOperand(null);
      setOperation(null);
      setWaitingForOperand(true);
    }
  }, [display, isBusy]);

  const performOperation = useCallback(
    async (nextOp: Operation) => {
      if (isBusy) return;
      setError(null);
      const currentNumber = Number(display);

      if (operation && previousOperand !== null && !waitingForOperand) {
        const res = await runApi(operation, previousOperand, currentNumber);
        if (res === null) return;
        setDisplay(res);
        setPreviousOperand(Number(res));
        setExpression(`${res} ${OPERATION_SYMBOLS[nextOp]}`);
      } else {
        setPreviousOperand(currentNumber);
        setExpression(`${display} ${OPERATION_SYMBOLS[nextOp]}`);
      }

      setOperation(nextOp);
      setWaitingForOperand(true);
    },
    [display, operation, previousOperand, waitingForOperand, isBusy],
  );

  const calculateResult = useCallback(async () => {
    if (isBusy || !operation || previousOperand === null) return;
    const currentNumber = Number(display);
    setExpression(`${formatNumber(previousOperand)} ${OPERATION_SYMBOLS[operation]} ${display} =`);

    const res = await runApi(operation, previousOperand, currentNumber);
    if (res !== null) {
      setDisplay(res);
      setPreviousOperand(null);
      setOperation(null);
      setWaitingForOperand(true);
    }
  }, [isBusy, operation, previousOperand, display]);

  return {
    display: error ?? display,
    rawDisplay: display,
    expression,
    error,
    operation,
    isBusy,
    inputDigit,
    inputDecimal,
    backspace,
    toggleSign,
    clear,
    performSqrt,
    performOperation,
    calculateResult,
  };
}
