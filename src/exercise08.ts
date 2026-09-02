/**
 * Exercise 8 — The Dynamic Event Emitter
 *
 * Spec:  ../README.md  ("Exercise 8: The Dynamic Event Emitter")
 * Test:  ../tests/exercise08.test.ts
 *
 * Concepts: the `keyof` operator, lookup types (`T[K]`), and mapped types.
 *
 * An EVENT EMITTER lets one part of a program announce that something happened
 * ("emit") while other parts register callbacks to hear about it ("on"). The
 * type-safety goal here: a `launch` handler must receive a string, a
 * `shutdown` handler must receive a number, and the compiler enforces it.
 */

/**
 * The schema of supported events: event name → type of the data it carries.
 */
export type EventMap = {
  launch: string;
  shutdown: number;
};

/**
 * A type-safe event broadcaster.
 *
 * `T extends EventMap` CONSTRAINS the type parameter: callers may supply their
 * own richer event schema, but it must at least satisfy EventMap.
 * https://www.typescriptlang.org/docs/handbook/2/generics.html#generic-constraints
 *
 * `= EventMap` is a type-parameter DEFAULT, which is what lets the test write
 * `new SimpleEventEmitter()` with no explicit type argument.
 * https://www.typescriptlang.org/docs/handbook/2/generics.html#generic-parameter-defaults
 */
export class SimpleEventEmitter<T extends EventMap = EventMap> {
  /**
   * Registered callbacks, grouped by event name.
   *
   * This is a MAPPED TYPE: `[K in keyof T]` walks every key of `T` and builds
   * a property for each one. The `?` makes each property optional, since an
   * event has no entry until something subscribes to it.
   * https://www.typescriptlang.org/docs/handbook/2/mapped-types.html
   *
   * `T[K]` is an INDEXED ACCESS (lookup) type: "the type stored at key K".
   * For K = 'launch' that is `string`, for K = 'shutdown' it is `number`.
   * https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html
   */
  private readonly listeners: {
    [K in keyof T]?: Array<(data: T[K]) => void>;
  } = {};

  /**
   * Subscribes a callback to an event.
   *
   * Steps:
   *   1. Look up the existing callback list for this event.
   *   2. Fall back to a fresh empty array the first time the event is seen.
   *   3. Append the new callback and store the list back.
   *
   * `K extends keyof T` means the method is generic over ONE specific event
   * name. `keyof T` is the union of T's keys — for EventMap that is
   * `'launch' | 'shutdown'`, so a typo like `on('lunch', …)` will not compile.
   * https://www.typescriptlang.org/docs/handbook/2/keyof-types.html
   *
   * @param eventName which event to listen for
   * @param callback  receives the payload typed as `T[K]`
   */
  public on<K extends keyof T>(
    eventName: K,
    callback: (data: T[K]) => void,
  ): void {
    // `??` is nullish coalescing: use the left value unless it is null or
    // undefined. Here it supplies the empty array for a first subscriber.
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing
    const callbacksForEvent = this.listeners[eventName] ?? [];

    callbacksForEvent.push(callback);

    this.listeners[eventName] = callbacksForEvent;
  }

  /**
   * Broadcasts an event to every subscribed callback.
   *
   * Steps:
   *   1. Look up the callbacks for this event.
   *   2. If there are none, do nothing (optional chaining short-circuits).
   *   3. Otherwise call each one with the payload.
   *
   * @param eventName which event fired
   * @param data      the payload, whose type is pinned to `T[K]`
   */
  public emit<K extends keyof T>(eventName: K, data: T[K]): void {
    // `?.` is optional chaining: if the left side is null or undefined the
    // whole expression evaluates to undefined instead of throwing.
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining
    //
    // Array.prototype.forEach(callback) runs the callback once per element.
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach
    this.listeners[eventName]?.forEach((callback) => {
      callback(data);
    });
  }
}
