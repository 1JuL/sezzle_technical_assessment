class CalcError extends Error {
  constructor(message) {
    super(message);
    this.name = "CalcError";
  }
}

const binary = {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,
  multiply: (a, b) => a * b,
  divide: (a, b) => {
    if (b === 0) throw new CalcError("Division by zero");
    return a / b;
  },
  power: (a, b) => a ** b,
  percent: (a, b) => (a / 100) * b, // a% of b
};

const unary = {
  sqrt: (a) => {
    if (a < 0) throw new CalcError("Square root of a negative number");
    return Math.sqrt(a);
  },
};

const OPERATIONS = [...Object.keys(binary), ...Object.keys(unary)];

const isNum = (v) => typeof v === "number" && Number.isFinite(v);

function calculate(operation, a, b) {
  if (typeof operation !== "string" || !OPERATIONS.includes(operation)) {
    throw new CalcError(`Unknown operation. Supported: ${OPERATIONS.join(", ")}`);
  }
  if (!isNum(a)) throw new CalcError("'a' must be a finite number");

  let result;
  if (operation in unary) {
    result = unary[operation](a);
  } else {
    if (!isNum(b)) throw new CalcError("'b' must be a finite number");
    result = binary[operation](a, b);
  }
  if (!Number.isFinite(result)) throw new CalcError("Result is not a finite number");
  return result;
}

module.exports = {
  CalcError,
  calculate,
  OPERATIONS,
  binary,
  unary,
};
