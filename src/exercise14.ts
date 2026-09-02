/**
 * Exercise 14 — Concurrent Batch Aggregator
 *
 * Spec:  ../README.md  ("Exercise 14: Concurrent Batch Aggregator")
 * Test:  ../tests/exercise14.test.ts
 *
 * Concepts: concurrency control with `Promise.all`, parallel execution.
 *
 * Why this matters:
 *
 *   sequential (await inside a loop)     concurrent (Promise.all)
 *   ┌────┐                               ┌────┐
 *   │ #1 │──┐                            │ #1 │──┐
 *   └────┘  ▼                            ├────┤  │
 *         ┌────┐                         │ #2 │──┤  all in flight at once
 *         │ #2 │──┐                      ├────┤  │
 *         └────┘  ▼                      │ #3 │──┘
 *               ┌────┐                   └────┘  ▼
 *               │ #3 │                        done
 *               └────┘
 *   total time = sum of requests         total time ≈ the slowest request
 */

/** Base URL for the posts collection. */
const POSTS_ENDPOINT = 'https://jsonplaceholder.typicode.com/posts';

/** One blog post, trimmed to the fields this module models. */
export type PostItem = {
  id: number;
  title: string;
  body: string;
};

/**
 * Fetches many posts at once and returns them in the requested order.
 *
 * Steps:
 *   1. Map each id to a promise by STARTING its request immediately — nothing
 *      is awaited inside the map, so all requests leave together.
 *   2. Hand the array of promises to `Promise.all`.
 *   3. Await the single aggregate promise, which settles when every request
 *      has finished.
 *
 * @param postIds the post ids to retrieve
 * @returns a Promise resolving to the posts, in the same order as `postIds`
 * @throws {Error} if ANY request fails — Promise.all rejects on the first
 *         rejection (use Promise.allSettled when partial results are wanted)
 */
export async function fetchPostBatch(postIds: number[]): Promise<PostItem[]> {
  // Calling an async function starts its work and returns a promise right
  // away. Because `.map` does not await, the loop finishes in microseconds and
  // every request is already in flight.
  const pendingRequests = postIds.map(async (postId) => {
    const response = await fetch(`${POSTS_ENDPOINT}/${postId}`);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch post ${postId}: ${response.status} ${response.statusText}`,
      );
    }

    const payload = (await response.json()) as PostItem;

    return {
      id: payload.id,
      title: payload.title,
      body: payload.body,
    };
  });

  // Promise.all(iterable) resolves to an array of results in the SAME ORDER as
  // the input promises — order is by position, not by which finished first.
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all
  return Promise.all(pendingRequests);
}
