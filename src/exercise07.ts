/**
 * Exercise 7 — Gradebook Parser
 *
 * Spec:  ../README.md  ("Exercise 7: Gradebook Parser")
 * Test:  ../tests/exercise07.test.ts
 * Data:  ../data/gradebook.json
 *
 * Concepts: structural typing, index signatures, synchronous file I/O.
 */

// The `node:` prefix guarantees a Node BUILT-IN module rather than an npm
// package of the same name. https://nodejs.org/api/esm.html#node-imports
//
// fs.readFileSync(path, options) reads a whole file and BLOCKS until it is
// done — the synchronous API required by the Module 1 rules.
// https://nodejs.org/api/fs.html#fsreadfilesyncpath-options
import { readFileSync } from 'node:fs';

/**
 * The shape of ../data/gradebook.json.
 *
 * An INDEX SIGNATURE (`[key: string]: Value`) describes an object whose keys
 * are not known ahead of time — here, arbitrary student names, each mapping to
 * an object of arbitrary subject names mapping to numeric scores.
 * https://www.typescriptlang.org/docs/handbook/2/objects.html#index-signatures
 */
export type Gradebook = {
  [studentName: string]: {
    [subject: string]: number;
  };
};

/**
 * Absolute location of the data file.
 *
 * `import.meta.url` is the URL of THIS module. Resolving the data path against
 * it means the function works no matter which directory the process was
 * started from — safer than a bare relative path, which depends on the current
 * working directory.
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import.meta
 * https://developer.mozilla.org/en-US/docs/Web/API/URL/URL
 */
const GRADEBOOK_PATH = new URL('../data/gradebook.json', import.meta.url);

/**
 * Averages one subject's scores across every student who took it.
 *
 * Steps:
 *   1. Read the JSON file from disk synchronously, as UTF-8 text.
 *   2. Parse the text into the `Gradebook` shape.
 *   3. Take every student's record and keep only those containing the subject.
 *   4. Pull out that subject's score from each surviving record.
 *   5. Return 0 when nobody took the subject; otherwise sum ÷ count.
 *
 * @param subject the subject name to average, e.g. "Math"
 * @returns the mean score, or 0 when no student has that subject
 */
export function calculateSubjectAverage(subject: string): number {
  // The 'utf-8' encoding argument makes readFileSync return a string; without
  // it you get a raw Buffer of bytes.
  const fileContents = readFileSync(GRADEBOOK_PATH, 'utf-8');

  // JSON.parse(text) turns JSON text into JavaScript values. It returns `any`,
  // so the `as Gradebook` assertion states the shape we expect. TypeScript
  // cannot verify a file it has not read — this is the boundary where a
  // real-world app would validate the data at runtime.
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse
  const gradebook = JSON.parse(fileContents) as Gradebook;

  // Object.values(obj) returns an array of the object's own values — here, one
  // record of subject→score per student. The student NAMES are not needed.
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/values
  const scores = Object.values(gradebook)
    // Not every student takes every subject, so drop the records that have no
    // numeric entry for it. `typeof value === 'number'` also rejects a missing
    // key, which reads back as `undefined`.
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof
    .filter((studentRecord) => typeof studentRecord[subject] === 'number')
    .map((studentRecord) => studentRecord[subject]);

  // Guard against division by zero for an unknown subject.
  if (scores.length === 0) {
    return 0;
  }

  const total = scores.reduce((runningTotal, score) => runningTotal + score, 0);

  return total / scores.length;
}
