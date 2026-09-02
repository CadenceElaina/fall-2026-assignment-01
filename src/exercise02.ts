/**
 * Exercise 2 — DNA/RNA Transcription
 *
 * Spec:  ../README.md  ("Exercise 2: DNA/RNA Transcription")
 * Test:  ../tests/exercise02.test.ts
 *
 * Concepts: custom errors.
 *
 * Biology in one line: DNA is a sequence of four "letters" (nucleotides).
 * Transcription rewrites that sequence into RNA by swapping each letter for
 * its partner — A→U, T→A, C→G, G→C.
 */

/**
 * The four letters this function accepts, as a union of string LITERAL types.
 * A literal type allows exactly one value, so `Nucleotide` is "A" or "T" or
 * "C" or "G" and nothing else.
 * https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#literal-types
 */
type Nucleotide = 'A' | 'T' | 'C' | 'G';

/**
 * Thrown when the input contains a character that is not a DNA nucleotide.
 *
 * `extends Error` builds on the built-in Error class, so this behaves like any
 * other error (it has `.message`, a stack trace, and works with `instanceof`).
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error
 * https://www.typescriptlang.org/docs/handbook/2/classes.html#extends-clauses
 *
 * Exported so callers can tell THIS failure apart from any other:
 *   catch (err) { if (err instanceof InvalidNucleotideError) { … } }
 */
export class InvalidNucleotideError extends Error {
  /**
   * The offending character, kept on the error so callers can report it.
   *
   * `public readonly` in a constructor parameter is a TypeScript "parameter
   * property": it declares the field AND assigns it in one step.
   * https://www.typescriptlang.org/docs/handbook/2/classes.html#parameter-properties
   */
  public constructor(public readonly character: string) {
    // super(...) calls the parent (Error) constructor; required before `this`.
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/super
    super(
      `Invalid DNA nucleotide: "${character}". Expected one of A, T, C, G.`,
    );

    // Naming the error makes stack traces and test output readable.
    this.name = 'InvalidNucleotideError';
  }
}

/**
 * Lookup table from a DNA letter to its RNA partner.
 *
 * `Record<Keys, Value>` is a built-in utility type describing an object whose
 * keys are `Keys` and whose values are `Value`. Because the key type is the
 * `Nucleotide` union, TypeScript forces this table to cover all four letters —
 * forget one and the file will not compile.
 * https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type
 */
const TRANSCRIPTION_MAP: Record<Nucleotide, string> = {
  A: 'U',
  T: 'A',
  C: 'G',
  G: 'C',
};

/**
 * Type guard: narrows an arbitrary string down to a `Nucleotide`.
 *
 * The return type `character is Nucleotide` is a TYPE PREDICATE. When this
 * returns true, TypeScript treats the argument as a `Nucleotide` from then on.
 * https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates
 */
function isNucleotide(character: string): character is Nucleotide {
  // Object.hasOwn(obj, key) returns true when `obj` has that key as its own
  // property. Preferred over the older `in` / hasOwnProperty forms.
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwn
  return Object.hasOwn(TRANSCRIPTION_MAP, character);
}

/**
 * Transcribes a DNA sequence into its RNA complement.
 *
 * Steps:
 *   1. Split the input into single characters.
 *   2. For each character, verify it is one of A/T/C/G — if not, throw.
 *   3. Swap it for its RNA partner via the lookup table.
 *   4. Join the swapped letters back into one string.
 *
 * @param dna an upper-case DNA sequence, e.g. "GATTACA"
 * @returns the RNA complement, e.g. "CUAAUGU"
 * @throws {InvalidNucleotideError} on any character outside A, T, C, G
 */
export function transcribeDNA(dna: string): string {
  // String.prototype.split(separator) cuts a string into an array. Splitting on
  // "" yields one entry per character.
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/split
  return (
    dna
      .split('')
      // Array.prototype.map(callback) builds a NEW array from the return value
      // of the callback for each element.
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map
      .map((character) => {
        if (!isNucleotide(character)) {
          // `throw` aborts the function and hands the error to the nearest
          // catch block (or crashes the program if there is none).
          // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/throw
          throw new InvalidNucleotideError(character);
        }

        // Thanks to the type guard above, `character` is a `Nucleotide` here,
        // so this index access is fully type-checked.
        return TRANSCRIPTION_MAP[character];
      })
      // Array.prototype.join(separator) concatenates the elements. "" glues
      // them with nothing between.
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/join
      .join('')
  );
}
