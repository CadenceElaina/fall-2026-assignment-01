/**
 * Exercise 12 — Network Fetcher & Data Mapping
 *
 * Spec:  ../README.md  ("Exercise 12: Network Fetcher & Data Mapping")
 * Test:  ../tests/exercise12.test.ts
 *
 * Concepts: network I/O with `fetch`, JSON parsing, type modeling.
 *
 * NOTE: this hits the live JSONPlaceholder API, so the test needs internet.
 */

/** The public endpoint holding sample user profiles. */
const USERS_ENDPOINT = 'https://jsonplaceholder.typicode.com/users';

/**
 * The slice of the remote payload this module cares about.
 *
 * The API actually returns more fields (address, phone, company…). Modeling
 * only what is used keeps the contract honest and small.
 */
export type RemoteUser = {
  id: number;
  name: string;
  email: string;
};

/**
 * Downloads the user list and returns just their email addresses.
 *
 * Steps:
 *   1. `fetch` the endpoint and wait for the response headers.
 *   2. Reject anything that is not a success status.
 *   3. Read and parse the JSON body.
 *   4. Map the raw payload into strictly typed `RemoteUser` records.
 *   5. Map those records down to the email strings.
 *
 * @returns a Promise resolving to every user's email address
 * @throws {Error} when the endpoint answers with a non-2xx status
 */
export async function fetchUserEmails(): Promise<string[]> {
  // fetch(url) performs an HTTP request and resolves with a Response as soon
  // as the headers arrive — the body has not been read yet at this point.
  // Built into Node since v18; no library required.
  // https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch
  const response = await fetch(USERS_ENDPOINT);

  // Response.ok is true only for statuses 200-299. fetch does NOT throw on
  // 404 or 500 — it resolves normally — so this check has to be explicit.
  // https://developer.mozilla.org/en-US/docs/Web/API/Response/ok
  if (!response.ok) {
    throw new Error(
      `Failed to fetch users: ${response.status} ${response.statusText}`,
    );
  }

  // Response.json() reads the body to completion and parses it as JSON. It
  // returns a Promise, hence the second `await`.
  // https://developer.mozilla.org/en-US/docs/Web/API/Response/json
  const payload = (await response.json()) as RemoteUser[];

  // Explicitly rebuild each record instead of passing the raw objects through.
  // This drops the fields we never declared, so what leaves this function
  // really does match `RemoteUser`.
  const users: RemoteUser[] = payload.map((entry) => ({
    id: entry.id,
    name: entry.name,
    email: entry.email,
  }));

  return users.map((user) => user.email);
}
