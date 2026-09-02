/**
 * Exercise 15 — The Asynchronous Data Pipeline
 *
 * Spec:  ../README.md  ("Exercise 15: The Asynchronous Data Pipeline")
 * Test:  ../tests/exercise15.test.ts
 *
 * Concepts: compound async flows, data transformation, serialization.
 *
 * The pipeline, end to end:
 *
 *   fetch comments ──► map to CommentSummary ──► drop .org emails
 *        │                                              │
 *        │                                              ▼
 *        │                                    JSON.stringify
 *        │                                              │
 *        ▼                                              ▼
 *   (network)                                    write to outputPath
 *                                                       │
 *                                                       ▼
 *                                                return kept count
 */

// writeFile REPLACES a file's contents (unlike appendFile in exercise11.ts).
// https://nodejs.org/api/fs.html#fspromiseswritefilefile-data-options
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

/** Base URL for the posts collection. */
const POSTS_ENDPOINT = 'https://jsonplaceholder.typicode.com/posts';

/** Email domains ending with this suffix are excluded from the output. */
const EXCLUDED_EMAIL_SUFFIX = '.org';

/**
 * One comment as the API sends it — the raw wire shape, kept private to this
 * module because callers never see it.
 */
type RawComment = {
  postId: number;
  id: number;
  name: string;
  email: string;
  body: string;
};

/**
 * The trimmed record this pipeline produces and saves.
 * Note there is no `body` or `name`: the projection is the point.
 */
export type CommentSummary = {
  postId: number;
  id: number;
  commenterEmail: string;
};

/**
 * Fetches a post's comments, filters and reshapes them, saves them to disk,
 * and reports how many survived.
 *
 * Steps:
 *   1. Fetch every comment belonging to `targetPostId`.
 *   2. Fail loudly on a bad HTTP status — unlike exercise13.ts, a broken
 *      pipeline should not quietly write an empty file.
 *   3. Map the raw payload into `CommentSummary` records, trimming the email.
 *   4. Filter out anyone whose email domain ends in ".org".
 *   5. Serialize the survivors to pretty-printed JSON and write them to disk.
 *   6. Return the number of records saved.
 *
 * @param targetPostId which post's comments to process
 * @param outputPath   file to write the JSON results into
 * @returns a Promise resolving to the count of records written
 * @throws {Error} when the comments cannot be fetched
 */
export async function processCommentsPipeline(
  targetPostId: number,
  outputPath: string,
): Promise<number> {
  // --- 1. Ingest ----------------------------------------------------------
  const response = await fetch(`${POSTS_ENDPOINT}/${targetPostId}/comments`);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch comments for post ${targetPostId}: ` +
        `${response.status} ${response.statusText}`,
    );
  }

  const rawComments = (await response.json()) as RawComment[];

  // --- 2. Transform -------------------------------------------------------
  const summaries: CommentSummary[] = rawComments.map((comment) => ({
    postId: comment.postId,
    id: comment.id,
    // String.prototype.trim() removes leading and trailing whitespace.
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/trim
    commenterEmail: comment.email.trim(),
  }));

  // --- 3. Validate / filter ----------------------------------------------
  const acceptedSummaries = summaries.filter(
    // String.prototype.endsWith(searchString) returns true when the string
    // finishes with that text. Lower-casing first makes the check
    // case-insensitive, since domains are not case-sensitive.
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/endsWith
    (summary) =>
      !summary.commenterEmail.toLowerCase().endsWith(EXCLUDED_EMAIL_SUFFIX),
  );

  // --- 4. Serialize and store --------------------------------------------
  await mkdir(dirname(outputPath), { recursive: true });

  // JSON.stringify(value, replacer, space) converts a value to JSON text. The
  // `null` replacer means "keep every property"; the `2` indents with two
  // spaces so the saved file is readable.
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
  const serialized = JSON.stringify(acceptedSummaries, null, 2);

  await writeFile(outputPath, serialized, 'utf-8');

  // --- 5. Report ----------------------------------------------------------
  return acceptedSummaries.length;
}
