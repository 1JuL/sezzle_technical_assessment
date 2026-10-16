import { useEffect } from "react";
import { useCalculator } from "./useCalculator";
import "./App.css";

type KeypadButton = {
  label: string;
  cls: string;
  name?: string;
  onClick: () => void;
  active?: boolean;
};

export default function App() {
  const {
    display,
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
  } = useCalculator();

  // Keyboard shortcut listener mapped to calculator actions
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      const { key } = event;

      if (key >= "0" && key <= "9") {
        event.preventDefault();
        inputDigit(key);
        return;
      }

      const keyActions: Record<string, () => void> = {
        ".": inputDecimal,
        ",": inputDecimal,
        "+": () => performOperation("add"),
        "-": () => performOperation("subtract"),
        "*": () => performOperation("multiply"),
        "/": () => performOperation("divide"),
        "^": () => performOperation("power"),
        "%": () => performOperation("percent"),
        Enter: calculateResult,
        "=": calculateResult,
        Backspace: backspace,
        Escape: clear,
        c: clear,
        C: clear,
      };

      const action = keyActions[key];
      if (action) {
        event.preventDefault();
        action();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [inputDigit, inputDecimal, performOperation, calculateResult, backspace, clear]);

  const buttons: KeypadButton[] = [
    { label: "AC", cls: "func", name: "Clear", onClick: clear },
    { label: "⌫", cls: "func", name: "Backspace", onClick: backspace },
    {
      label: "xʸ",
      cls: "func",
      name: "Power",
      onClick: () => performOperation("power"),
      active: operation === "power",
    },
    {
      label: "÷",
      cls: "op",
      name: "Divide",
      onClick: () => performOperation("divide"),
      active: operation === "divide",
    },

    { label: "√", cls: "func", name: "Square root", onClick: performSqrt },
    {
      label: "%",
      cls: "func",
      name: "Percent",
      onClick: () => performOperation("percent"),
      active: operation === "percent",
    },
    { label: "±", cls: "func", name: "Toggle sign", onClick: toggleSign },
    {
      label: "×",
      cls: "op",
      name: "Multiply",
      onClick: () => performOperation("multiply"),
      active: operation === "multiply",
    },

    { label: "7", cls: "num", onClick: () => inputDigit("7") },
    { label: "8", cls: "num", onClick: () => inputDigit("8") },
    { label: "9", cls: "num", onClick: () => inputDigit("9") },
    {
      label: "−",
      cls: "op",
      name: "Subtract",
      onClick: () => performOperation("subtract"),
      active: operation === "subtract",
    },

    { label: "4", cls: "num", onClick: () => inputDigit("4") },
    { label: "5", cls: "num", onClick: () => inputDigit("5") },
    { label: "6", cls: "num", onClick: () => inputDigit("6") },
    {
      label: "+",
      cls: "op",
      name: "Add",
      onClick: () => performOperation("add"),
      active: operation === "add",
    },

    { label: "1", cls: "num", onClick: () => inputDigit("1") },
    { label: "2", cls: "num", onClick: () => inputDigit("2") },
    { label: "3", cls: "num", onClick: () => inputDigit("3") },
    { label: "=", cls: "eq", name: "Equals", onClick: calculateResult },

    { label: "0", cls: "num zero", onClick: () => inputDigit("0") },
    { label: ".", cls: "num", name: "Decimal", onClick: inputDecimal },
  ];

  return (
    <div className="calculator-wrapper">
      <div className="calculator" role="region" aria-label="Calculator">
        <div className="display" aria-live="polite">
          <div className="display-expr" data-testid="calculator-expression">
            {expression || "\u00A0"}
          </div>
          <div
            className={`display-main ${error ? "has-error" : ""}`}
            data-testid="calculator-display"
            title={display}
          >
            {display}
          </div>
        </div>

        <div className="keypad">
          {buttons.map(({ label, cls, name, onClick, active }) => (
            <button
              key={label}
              type="button"
              className={`btn ${cls} ${active ? "active" : ""}`}
              onClick={onClick}
              disabled={label === "=" && isBusy}
              aria-label={name || label}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
