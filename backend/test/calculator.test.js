const { test, describe } = require('node:test');
const assert = require('node:assert');
const { calculate, CalcError } = require('../services/calculator');

describe('calculate', () => {
  const binaryCases = [
    ['add', 2, 3, 5],
    ['subtract', 2, 3, -1],
    ['multiply', 4, 2.5, 10],
    ['divide', 9, 3, 3],
    ['power', 2, 10, 1024],
    ['percent', 20, 150, 30],
  ];

  for (const [op, a, b, expected] of binaryCases) {
    test(`${op}(${a}, ${b}) = ${expected}`, () => {
      assert.strictEqual(calculate(op, a, b), expected);
    });
  }

  test('computes sqrt without b', () => {
    assert.strictEqual(calculate('sqrt', 16), 4);
  });

  const failureCases = [
    ['divide by zero', () => calculate('divide', 1, 0)],
    ['sqrt of negative', () => calculate('sqrt', -1)],
    ['unknown operation', () => calculate('mod', 1, 2)],
    ['missing operation', () => calculate(undefined, 1, 2)],
    ['string operand', () => calculate('add', '1', 2)],
    ['NaN operand', () => calculate('add', NaN, 2)],
    ['missing b', () => calculate('add', 1)],
    ['overflow', () => calculate('power', 10, 1000)],
    ['NaN result', () => calculate('power', -8, 0.5)],
  ];

  for (const [name, fn] of failureCases) {
    test(`rejects ${name}`, () => {
      assert.throws(fn, (err) => err instanceof CalcError);
    });
  }
});

