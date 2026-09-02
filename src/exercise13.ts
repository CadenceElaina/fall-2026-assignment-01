/**
 * Exercise 13 — Resilient Network Fetcher with Error Fallbacks
 *
 * Spec:  ../README.md  ("Exercise 13: Resilient Network Fetcher…")
 * Test:  ../tests/exercise13.test.ts
 *
 * Concepts: asynchronous exception handling, network error recovery.
 *
 * Two very different failures have to be handled here:
 *   - the request SUCCEEDS but the server answers 404 → `response.ok` is false
 *   - the request never completes (DNS failure, offline, timeout) → `fetch`
 *     itself rejects, which surfaces as a thrown error at the `await`
 * Both must produce `null` rather than crashing the caller.
 */

/** Base URL for the todos collection. */
const TODOS_ENDPOINT = 'https://jsonplaceholder.typicode.com/todos';

/** One task item as returned by the API. */
export type TodoItem = {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
};

/**
 * Fetches a single todo, returning `null` instead of throwing on any failure.
 *
 * Steps:
 *   1. Request the item by id inside a try block.
 *   2. Return `null` for any non-2xx status (e.g. an unknown id → 404).
 *   3. Parse the body and rebuild it as a clean `TodoItem`.
 *   4. Catch transport-level errors and return `null` for those too.
 *
 * @param todoId the numeric id to request
 * @returns the item, or `null` if it could not be retrieved
 */
export async function fetchTodoSafe(todoId: number): Promise<TodoItem | null> {
  // try…catch runs the risky code and jumps to `catch` instead of propagating
  // the error to the caller.
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch
  try {
    const response = await fetch(`${TODOS_ENDPOINT}/${todoId}`);

    // A 404 is a perfectly normal HTTP response, so fetch resolves happily.
    // Treating "not found" as an absent value is the whole point of the
    // `TodoItem | null` return type.
    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as TodoItem;

    // Rebuild explicitly so the returned object contains exactly the four
    // declared fields and nothing else.
    return {
      userId: payload.userId,
      id: payload.id,
      title: payload.title,
      completed: payload.completed,
    };
  } catch {
    // Optional catch binding: the `(error)` parameter can be omitted when the
    // error object is not needed.
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch#optional_catch_binding
    //
    // Reached when the network is unreachable or the body is not valid JSON.
    return null;
  }
}
