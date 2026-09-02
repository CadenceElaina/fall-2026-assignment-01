/**
 * Exercise 9 — User Roles Type Guard
 *
 * Spec:  ../README.md  ("Exercise 9: User Roles Type Guard")
 * Test:  ../tests/exercise09.test.ts
 *
 * Concepts: custom type guards (the `is` operator) and collection filtering.
 *
 * Unlike Exercise 4, these two types share NO common discriminant property, so
 * narrowing has to be done by checking for a property that only one of them
 * has. That check is wrapped in a reusable type guard.
 */

/** A privileged account, identified by an admin id and a permission list. */
export type AdminUser = {
  adminId: string;
  permissions: string[];
};

/** A temporary account, identified by a token that expires. */
export type GuestUser = {
  guestToken: string;
  // `Date` is the built-in date/time object.
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
  expiresAt: Date;
};

/**
 * Type guard: is this user an admin?
 *
 * The return type `user is AdminUser` is a TYPE PREDICATE. At runtime this
 * function just returns a boolean; the predicate is the extra promise to the
 * compiler that a `true` result means the argument really is an `AdminUser`,
 * so callers get narrowing for free.
 * https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates
 *
 * @param user either kind of user
 * @returns true when the value carries an `adminId`
 */
export function isAdmin(user: AdminUser | GuestUser): user is AdminUser {
  // The `in` operator tests whether a property name exists on an object. It is
  // the standard way to narrow a union whose members have different shapes.
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/in
  // https://www.typescriptlang.org/docs/handbook/2/narrowing.html#the-in-operator-narrowing
  return 'adminId' in user;
}

/**
 * Pulls only the admins out of a mixed list of users.
 *
 * Steps:
 *   1. Run `.filter()` over the mixed array.
 *   2. Pass `isAdmin` directly as the predicate.
 *   3. Because `isAdmin` is a type guard, TypeScript picks the `filter`
 *      overload that returns `AdminUser[]` — no cast, no `any`.
 *
 * @param users a list mixing admins and guests
 * @returns a new array containing only the admins
 */
export function extractAdmins(
  users: Array<AdminUser | GuestUser>,
): AdminUser[] {
  // Array.prototype.filter has a dedicated overload for type-guard predicates:
  //   filter<S extends T>(predicate: (value: T, …) => value is S): S[]
  // which is what narrows the element type of the result here.
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
  return users.filter(isAdmin);
}
