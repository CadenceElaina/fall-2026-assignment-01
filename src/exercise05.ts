/**
 * Exercise 5 — The Config Merger
 *
 * Spec:  ../README.md  ("Exercise 5: The Config Merger")
 * Test:  ../tests/exercise05.test.ts
 *
 * Concepts: intersection types (`&`) and the `Partial<T>` utility type.
 */

/** Where the app talks to the network. */
export type NetworkConfig = {
  serverUrl: string;
  port: number;
};

/** Which deployment the app believes it is running in, and how long to wait. */
export type EnvironmentConfig = {
  // A union of literals, so `environment` cannot be an arbitrary string —
  // a typo like 'prd' is a compile error.
  environment: 'dev' | 'prod';
  timeout: number;
};

/**
 * The full configuration: every field of BOTH types above.
 *
 * `&` is the INTERSECTION operator. Where `|` means "one or the other",
 * `&` means "all of these at once".
 * https://www.typescriptlang.org/docs/handbook/2/objects.html#intersection-types
 */
export type AppConfig = NetworkConfig & EnvironmentConfig;

/**
 * Fallback values used for any field the caller does not override.
 * Declared once at module scope so there is a single source of truth.
 */
const DEFAULT_CONFIG: AppConfig = {
  serverUrl: 'http://localhost',
  port: 8080,
  environment: 'dev',
  timeout: 3000,
};

/**
 * Produces a complete configuration from a partial set of user overrides.
 *
 * Steps:
 *   1. Spread the defaults into a brand-new object (never mutate the shared
 *      DEFAULT_CONFIG — later calls must still see the original values).
 *   2. Spread the overrides on top; later keys win, so any field the caller
 *      supplied replaces the default.
 *
 * Note on a sharp edge: an explicitly passed `undefined`
 * (`initializeConfig({ port: undefined })`) WOULD overwrite the default with
 * `undefined`, because object spread copies a key that is present regardless
 * of its value. `Partial<T>` permits that call, so a production version would
 * filter undefined values out first. The spec does not ask for it, so this
 * keeps the simple spread.
 *
 * @param userOverrides any subset of AppConfig fields
 * @returns a fully populated AppConfig
 */
export function initializeConfig(
  // `Partial<T>` is a built-in utility type that makes every property of `T`
  // optional, which is exactly "a subset of the settings".
  // https://www.typescriptlang.org/docs/handbook/utility-types.html#partialtype
  userOverrides: Partial<AppConfig>,
): AppConfig {
  // Object spread (`...`) copies an object's own enumerable properties into a
  // new object literal. Order matters: the RIGHTMOST value for a duplicate key
  // is the one that survives.
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax#spread_in_object_literals
  return { ...DEFAULT_CONFIG, ...userOverrides };
}
