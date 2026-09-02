/**
 * Exercise 1 — The Nullable Name Formatter
 *
 * Spec:  ../README.md  ("Exercise 1: The Nullable Name Formatter")
 * Test:  ../tests/exercise01.test.ts
 *
 * Concepts: basic types, union types, strict null checks.
 */

/**
 * Builds a display name in "Last, First M." form.
 *
 * Steps:
 *   1. Decide whether a usable middle name was supplied. "Usable" means it is
 *      not `undefined` (argument omitted), not `null`, and not the empty
 *      string — all three must collapse to the short form.
 *   2. If usable, take its first character, upper-case it, and append a period.
 *   3. Return "Last, First M." when a middle initial exists, "Last, First"
 *      otherwise.
 *
 * @param firstName  given name, e.g. "John"
 * @param lastName   family name, e.g. "Doe"
 * @param middleName optional middle name; may be omitted, `null`, or ""
 * @returns "Doe, John Q." or "Doe, John"
 */
export function formatName(
  firstName: string,
  lastName: string,
  // A `?` marks the parameter OPTIONAL, which adds `undefined` to its type.
  // https://www.typescriptlang.org/docs/handbook/2/functions.html#optional-parameters
  // `string | null` is a UNION type: the value is one of these members.
  // Under "strict": true (see ../tsconfig.json) `null` is NOT silently allowed
  // in a `string`, so it has to be spelled out here.
  // https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#union-types
  middleName?: string | null,
): string {
  // Truthiness check: `undefined`, `null` and "" are all FALSY, so this single
  // condition covers all three "no middle name" cases at once.
  // https://developer.mozilla.org/en-US/docs/Glossary/Falsy
  //
  // Inside this block TypeScript NARROWS `middleName` from
  // `string | null | undefined` down to `string`, which is why `.charAt` below
  // compiles without a null check.
  // https://www.typescriptlang.org/docs/handbook/2/narrowing.html
  if (middleName) {
    // String.prototype.charAt(index) returns the character at `index` as a
    // one-character string ("" if the index is out of range).
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/charAt
    //
    // String.prototype.toUpperCase() returns an upper-cased copy. Strings are
    // immutable in JavaScript, so this never changes the original.
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/toUpperCase
    const middleInitial = middleName.charAt(0).toUpperCase();

    // Template literal: backticks, with `${…}` splicing values into the text.
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
    return `${lastName}, ${firstName} ${middleInitial}.`;
  }

  return `${lastName}, ${firstName}`;
}
