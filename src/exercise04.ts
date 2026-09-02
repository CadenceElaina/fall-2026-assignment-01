/**
 * Exercise 4 — Shape Area Calculator
 *
 * Spec:  ../README.md  ("Exercise 4: Shape Area Calculator")
 * Test:  ../tests/exercise04.test.ts
 *
 * Concepts: discriminated unions and type narrowing.
 *
 * The idea: give every member of a union the same property name (`kind`) with
 * a different literal value. Checking that one property tells TypeScript
 * exactly which member it is holding — that property is the DISCRIMINANT.
 * https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions
 */

/** A circle, described by the distance from its centre to its edge. */
export type Circle = {
  // `'circle'` here is a string LITERAL type, not the general `string` type:
  // this property can only ever hold that exact value.
  // https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#literal-types
  kind: 'circle';
  radius: number;
};

/** A rectangle, described by two different side lengths. */
export type Rectangle = {
  kind: 'rectangle';
  width: number;
  height: number;
};

/** A square, described by one side length. */
export type Square = {
  kind: 'square';
  sideLength: number;
};

/**
 * Every shape this module understands.
 * `|` is the union operator: a `Shape` is exactly one of these three.
 * https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#union-types
 */
export type Shape = Circle | Rectangle | Square;

/**
 * Computes the area of any supported shape.
 *
 * Steps:
 *   1. Switch on the `kind` discriminant.
 *   2. In each branch TypeScript has narrowed `shape` to one member, so the
 *      branch can read the fields that only that member has.
 *   3. The `default` branch proves at COMPILE time that every member was
 *      handled (see the `never` note below).
 *
 * @param shape a circle, rectangle, or square
 * @returns the area in square units
 */
export function calculateArea(shape: Shape): number {
  // `switch` compares with strict equality (===) against each case.
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/switch
  switch (shape.kind) {
    case 'circle':
      // Math.PI is the ratio of a circle's circumference to its diameter.
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/PI
      //
      // `**` is the exponentiation operator: radius ** 2 is radius squared.
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Exponentiation
      return Math.PI * shape.radius ** 2;

    case 'rectangle':
      return shape.width * shape.height;

    case 'square':
      return shape.sideLength ** 2;

    default: {
      // EXHAUSTIVENESS CHECK. Once the three cases above are handled, the only
      // type left for `shape` is `never` — the type with no possible values.
      // If someone later adds a fourth member to `Shape` and forgets a case,
      // that member is no longer assignable to `never` and this line becomes a
      // compile error, pointing straight at the omission.
      // https://www.typescriptlang.org/docs/handbook/2/narrowing.html#exhaustiveness-checking
      const unreachable: never = shape;
      throw new Error(`Unsupported shape: ${JSON.stringify(unreachable)}`);
    }
  }
}
