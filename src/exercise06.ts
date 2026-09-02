/**
 * Exercise 6 — Generic Stack Data Structure
 *
 * Spec:  ../README.md  ("Exercise 6: Generic Stack Data Structure")
 * Test:  ../tests/exercise06.test.ts
 *
 * Concepts: generics and classes.
 *
 * A STACK is Last-In, First-Out (LIFO) — like a stack of plates, you can only
 * take the one you put down most recently.
 */

/**
 * A type-safe LIFO stack.
 *
 * `<T>` is a TYPE PARAMETER: a placeholder filled in at the call site, so one
 * implementation serves every element type. `new Stack<number>()` produces a
 * stack whose `pop()` returns `number | undefined`, with no casting anywhere.
 * https://www.typescriptlang.org/docs/handbook/2/generics.html
 */
export class Stack<T> {
  /**
   * The backing storage.
   *
   * `private` means "only reachable from inside this class" (enforced by the
   * TypeScript compiler). `readonly` means the BINDING cannot be reassigned —
   * the array itself is still mutable, which is what push/pop need.
   * https://www.typescriptlang.org/docs/handbook/2/classes.html#member-visibility
   * https://www.typescriptlang.org/docs/handbook/2/classes.html#readonly
   *
   * (JavaScript's own `#items` syntax gives privacy at RUNTIME too; `private`
   * is the TypeScript-level equivalent used here.)
   */
  private readonly items: T[] = [];

  /**
   * Adds an item to the top of the stack.
   *
   * @param item the value to store
   * @returns nothing — `void` is the type of "returns no useful value"
   */
  public push(item: T): void {
    // Array.prototype.push(...items) appends to the END of the array and
    // returns the new length. The end of the array is the top of the stack.
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/push
    this.items.push(item);
  }

  /**
   * Removes and returns the top item.
   *
   * @returns the most recently pushed item, or `undefined` if empty
   */
  public pop(): T | undefined {
    // Array.prototype.pop() removes the LAST element and returns it, or
    // returns undefined when the array is empty — which is exactly the
    // `T | undefined` contract.
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/pop
    return this.items.pop();
  }

  /**
   * Looks at the top item WITHOUT removing it.
   *
   * @returns the most recently pushed item, or `undefined` if empty
   */
  public peek(): T | undefined {
    // Array.prototype.at(index) accepts negative indices counting from the
    // end, so at(-1) is the last element. It is typed `T | undefined`, which
    // makes the empty case explicit instead of a silent out-of-range read.
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/at
    return this.items.at(-1);
  }

  /**
   * @returns how many items are currently stored
   */
  public size(): number {
    // Array.prototype.length is the element count.
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/length
    return this.items.length;
  }
}
