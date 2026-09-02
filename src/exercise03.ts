/**
 * Exercise 3 — Functional Inventory Metrics
 *
 * Spec:  ../README.md  ("Exercise 3: Functional Inventory Metrics")
 * Test:  ../tests/exercise03.test.ts
 *
 * Concepts: tuples, array methods (.map / .filter / .reduce), arrow functions.
 * Constraint: no `for`, `while`, or `forEach` — the whole calculation is a
 * chain of array transformations.
 */

/** Position of the quantity inside each inventory tuple. */
const QUANTITY_INDEX = 1;

/** Position of the price-per-unit inside each inventory tuple. */
const PRICE_INDEX = 2;

/** Items must have MORE than this many units on hand to be counted. */
const MINIMUM_QUANTITY = 5;

/**
 * Totals the dollar value of inventory items that still have stock worth
 * counting (quantity strictly greater than 5).
 *
 * Steps:
 *   1. `filter` — keep only rows whose quantity is greater than 5.
 *   2. `map`    — turn each surviving row into `quantity * pricePerUnit`.
 *   3. `reduce` — add those line totals together, starting from 0.
 *
 * @param inventory rows shaped as [itemName, quantity, pricePerUnit]
 * @returns the summed dollar value, or 0 when nothing qualifies
 */
export function getInventoryValue(
  // A TUPLE type is an array with a fixed length and a known type at each
  // position: here always [string, number, number].
  // https://www.typescriptlang.org/docs/handbook/2/objects.html#tuple-types
  inventory: Array<[string, number, number]>,
): number {
  return (
    inventory
      // Array.prototype.filter(callback) keeps the elements for which the
      // callback returns true.
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
      //
      // `(item) => …` is an ARROW FUNCTION: a compact function expression whose
      // single expression body is its return value.
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions
      .filter((item) => item[QUANTITY_INDEX] > MINIMUM_QUANTITY)
      // Array.prototype.map(callback) builds a new array of line totals.
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map
      .map((item) => item[QUANTITY_INDEX] * item[PRICE_INDEX])
      // Array.prototype.reduce(callback, initialValue) folds an array down to
      // one value. `runningTotal` carries the result forward between elements.
      // The `0` second argument is what makes an EMPTY array return 0 instead
      // of throwing.
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce
      .reduce((runningTotal, lineTotal) => runningTotal + lineTotal, 0)
  );
}
