/**
 * Exercise 11 — Async Log Writer
 *
 * Spec:  ../README.md  ("Exercise 11: Async Log Writer")
 * Test:  ../tests/exercise11.test.ts
 *
 * Concepts: promises, promise return types, non-blocking I/O.
 *
 * Module 1 used `fs.readFileSync`, which BLOCKS: nothing else in the program
 * runs until the disk answers. The promise-based API instead hands control
 * back to the event loop while the disk works, and resumes at the `await`.
 * https://nodejs.org/api/fs.html#promises-api
 */

// `appendFile` adds to the end of a file (creating it if missing) rather than
// replacing it — the test writes three messages and expects three lines.
// https://nodejs.org/api/fs.html#fspromisesappendfilepath-data-options
//
// `mkdir` with { recursive: true } creates missing parent folders and does not
// throw when they already exist.
// https://nodejs.org/api/fs.html#fspromisesmkdirpath-options
import { appendFile, mkdir } from 'node:fs/promises';

// path.dirname(p) returns the directory portion of a path.
// https://nodejs.org/api/path.html#pathdirnamepath
import { dirname } from 'node:path';

/**
 * Appends one timestamped status line to a log file.
 *
 * Steps:
 *   1. Make sure the containing folder exists.
 *   2. Stamp the message with the current time in ISO 8601 format.
 *   3. Append the line (with a trailing newline) without blocking the event
 *      loop.
 *
 * `async` makes a function return a Promise automatically; `await` pauses
 * INSIDE the function until a promise settles, while the rest of the program
 * keeps running.
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await
 *
 * @param filePath      where to write, e.g. "data/logs.txt"
 * @param statusMessage the human-readable message to record
 * @returns a Promise that resolves once the bytes are handed to the OS.
 *          `Promise<void>` = "resolves, but with no useful value".
 */
export async function logStatusToFile(
  filePath: string,
  statusMessage: string,
): Promise<void> {
  await mkdir(dirname(filePath), { recursive: true });

  // Date.prototype.toISOString() formats as "2026-09-02T14:53:21.000Z" — the
  // ISO 8601 standard: always UTC, always the same width, and sortable as
  // plain text, which is why logs use it.
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString
  const timestamp = new Date().toISOString();

  // "\n" is the newline escape sequence; it ends this record so the next
  // append starts on its own line.
  const logLine = `${statusMessage} ${timestamp}\n`;

  await appendFile(filePath, logLine, 'utf-8');
}
