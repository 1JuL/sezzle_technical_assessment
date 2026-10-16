const { calculate, CalcError, OPERATIONS } = require("../services/calculator");

function getHealth(req, res) {
  res.json({ status: "ok" });
}

function getOperations(req, res) {
  res.json({ operations: OPERATIONS });
}

// Accepts operation, a, and optional b in request body, or operation from route parameters (e.g. /api/calculate or /api/:operation).
function postCalculate(req, res, next) {
  try {
    const body = req.body ?? {};
    const operation = req.params.operation || body.operation;
    const { a, b } = body;

    const result = calculate(operation, a, b);
    res.json({ result });
  } catch (err) {
    if (err instanceof CalcError) {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
}

module.exports = {
  getHealth,
  getOperations,
  postCalculate,
};
