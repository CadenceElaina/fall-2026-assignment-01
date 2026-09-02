/**
 * Exercise 10 — The Secure Entity Registry
 *
 * Spec:  ../README.md  ("Exercise 10: The Secure Entity Registry")
 * Test:  ../tests/exercise10.test.ts
 *
 * Concepts: readonly properties, mapped utility types (`Pick`, `Omit`), and
 * object mutation safety.
 *
 * The security idea: the registry stores a full account including a password
 * hash, but anything handed OUT is a trimmed, frozen projection. Callers
 * cannot read the secret, and cannot mutate what they receive.
 */

// crypto.randomUUID() returns a random RFC 4122 UUID string, e.g.
// "36b8f84d-df4e-4d49-b662-bcde71a8764f". Good enough as a unique record id.
// https://nodejs.org/api/crypto.html#cryptorandomuuidoptions
import { randomUUID } from 'node:crypto';

/** The free-text, publicly visible part of an account. */
export type UserProfile = {
  bio: string;
  avatarUrl: string;
};

/** A complete stored account, secrets included. */
export type UserAccount = {
  id: string;
  createdAt: Date;
  email: string;
  passwordHash: string;
  profile: UserProfile;
};

/**
 * An in-memory datastore of user accounts.
 */
export class UserRegistry {
  /**
   * The records, keyed by id.
   *
   * `Map` is the built-in keyed collection. Unlike a plain object it has real
   * `.get`/`.set`/`.has` methods and no inherited keys to collide with.
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
   */
  private readonly accountsById = new Map<string, UserAccount>();

  /**
   * Creates and stores a new account.
   *
   * Steps:
   *   1. Copy the caller's fields into a fresh object.
   *   2. Copy the nested `profile` separately, so later changes to the
   *      caller's object cannot reach into the stored record.
   *   3. Generate the `id` and `createdAt` the caller is not allowed to set.
   *   4. Save it in the map and return the COMPLETE record.
   *
   * `Omit<T, Keys>` is a utility type producing `T` minus the named keys, so
   * the parameter is "everything except the two fields we generate".
   * https://www.typescriptlang.org/docs/handbook/utility-types.html#omittype-keys
   *
   * @param data email, passwordHash, and profile
   * @returns the stored account, including its generated id and timestamp
   */
  public registerUser(
    data: Omit<UserAccount, 'id' | 'createdAt'>,
  ): UserAccount {
    const account: UserAccount = {
      // Spread the caller's fields first, then overwrite the generated ones so
      // they always win regardless of what was passed in.
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax#spread_in_object_literals
      ...data,

      // Defensive copy of the nested object. Object spread is SHALLOW, so
      // without this line the stored record would share one `profile` object
      // with the caller and either side could silently mutate the other.
      profile: { ...data.profile },

      id: randomUUID(),

      // `new Date()` with no arguments captures the current moment.
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/Date
      createdAt: new Date(),
    };

    // Map.prototype.set(key, value) stores an entry.
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/set
    this.accountsById.set(account.id, account);

    return account;
  }

  /**
   * Returns a safe, immutable public view of an account.
   *
   * Steps:
   *   1. Look the account up by id.
   *   2. Return `undefined` when there is no such account.
   *   3. Build a projection holding only id, email, and profile — the
   *      `passwordHash` never leaves the registry.
   *   4. Freeze the projection (and its nested profile copy) so the caller
   *      cannot modify it.
   *
   * `Pick<T, Keys>` keeps only the named keys; `Readonly<T>` marks every
   * property as non-assignable at compile time.
   * https://www.typescriptlang.org/docs/handbook/utility-types.html#picktype-keys
   * https://www.typescriptlang.org/docs/handbook/utility-types.html#readonlytype
   *
   * @param id the account id returned by registerUser
   * @returns a frozen projection, or `undefined` if the id is unknown
   */
  public getUserView(
    id: string,
  ): Readonly<Pick<UserAccount, 'id' | 'email' | 'profile'>> | undefined {
    // Map.prototype.get(key) returns the value, or undefined if absent.
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/get
    const account = this.accountsById.get(id);

    if (account === undefined) {
      return undefined;
    }

    // Object.freeze(obj) makes an object non-extensible and all of its own
    // properties non-writable — the RUNTIME half of immutability, where
    // `Readonly<T>` is only the compile-time half.
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze
    //
    // freeze is SHALLOW, so the nested profile is copied and frozen too;
    // otherwise `view.profile.bio = '…'` would still mutate the stored record.
    return Object.freeze({
      id: account.id,
      email: account.email,
      profile: Object.freeze({ ...account.profile }),
    });
  }
}
