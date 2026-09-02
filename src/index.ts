/**
 * src/index.ts — scratchpad for manually exercising the solutions.
 *
 * Run it with:  npm run dev
 *
 * Only the SYNCHRONOUS exercises (Module 1) run by default, so this stays fast
 * and works offline. Exercises 12-15 hit the live JSONPlaceholder API; see the
 * commented block at the bottom to try them.
 *
 * The ".js" extension on each import is correct even though the files on disk
 * are ".ts". Under "module": "nodenext" (../tsconfig.json) TypeScript wants the
 * path that will exist AFTER compilation and resolves the types back to .ts.
 * https://www.typescriptlang.org/docs/handbook/modules/reference.html#node16-nodenext
 */

import { formatName } from './exercise01.js';
import { transcribeDNA, InvalidNucleotideError } from './exercise02.js';
import { getInventoryValue } from './exercise03.js';
import { calculateArea } from './exercise04.js';
import { initializeConfig } from './exercise05.js';
import { Stack } from './exercise06.js';
import { calculateSubjectAverage } from './exercise07.js';
import { SimpleEventEmitter } from './exercise08.js';
import { extractAdmins } from './exercise09.js';
import { UserRegistry } from './exercise10.js';

// console.log(...data) writes a line to the terminal.
// https://developer.mozilla.org/en-US/docs/Web/API/console/log_static
console.log('--- 1. formatName ---');
console.log(formatName('John', 'Doe', 'Quincy')); // Doe, John Q.
console.log(formatName('John', 'Doe')); // Doe, John

console.log('\n--- 2. transcribeDNA ---');
console.log(transcribeDNA('GATTACA')); // CUAAUGU
try {
  transcribeDNA('ATCX');
} catch (error) {
  // `instanceof` tests whether an object was built from a given constructor.
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/instanceof
  if (error instanceof InvalidNucleotideError) {
    console.log('caught:', error.message);
  }
}

console.log('\n--- 3. getInventoryValue ---');
console.log(
  getInventoryValue([
    ['Apple', 10, 1.5],
    ['Banana', 5, 0.5], // quantity is not > 5, so it is skipped
    ['Cherry', 20, 2.0],
  ]),
); // 55

console.log('\n--- 4. calculateArea ---');
console.log(calculateArea({ kind: 'circle', radius: 10 }));
console.log(calculateArea({ kind: 'rectangle', width: 10, height: 5 }));
console.log(calculateArea({ kind: 'square', sideLength: 5 }));

console.log('\n--- 5. initializeConfig ---');
console.log(initializeConfig({ port: 9000 }));

console.log('\n--- 6. Stack ---');
const stack = new Stack<string>();
stack.push('first');
stack.push('second');
console.log('peek:', stack.peek(), '| size:', stack.size());
console.log('pop:', stack.pop(), '| pop:', stack.pop(), '| pop:', stack.pop());

console.log('\n--- 7. calculateSubjectAverage ---');
console.log('Math:', calculateSubjectAverage('Math'));
console.log('Science:', calculateSubjectAverage('Science'));
console.log('Underwater Basket Weaving:', calculateSubjectAverage('Nope'));

console.log('\n--- 8. SimpleEventEmitter ---');
const emitter = new SimpleEventEmitter();
emitter.on('launch', (name) => {
  console.log('launch handler got a string:', name);
});
emitter.on('shutdown', (code) => {
  console.log('shutdown handler got a number:', code);
});
emitter.emit('launch', 'Apollo');
emitter.emit('shutdown', 404);

console.log('\n--- 9. extractAdmins ---');
console.log(
  extractAdmins([
    { adminId: 'A1', permissions: ['root'] },
    { guestToken: 'G1', expiresAt: new Date() },
    { adminId: 'A2', permissions: ['read'] },
  ]),
);

console.log('\n--- 10. UserRegistry ---');
const registry = new UserRegistry();
const account = registry.registerUser({
  email: 'student@uncc.edu',
  passwordHash: 'SECRET',
  profile: {
    bio: 'Learning TypeScript',
    avatarUrl: 'http://example.com/a.png',
  },
});
const view = registry.getUserView(account.id);
console.log('stored record keys:', Object.keys(account));
console.log('public view:', view);
console.log('view is frozen:', Object.isFrozen(view));

// ---------------------------------------------------------------------------
// Module 2 (exercises 11-15) needs the network and returns Promises. Uncomment
// to try it — top-level `await` is allowed because this is an ES module.
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await#top_level_await
// ---------------------------------------------------------------------------
//
// import { logStatusToFile } from './exercise11.js';
// import { fetchUserEmails } from './exercise12.js';
// import { fetchTodoSafe } from './exercise13.js';
// import { fetchPostBatch } from './exercise14.js';
// import { processCommentsPipeline } from './exercise15.js';
//
// await logStatusToFile('data/logs.txt', 'Manual scratchpad run');
// console.log(await fetchUserEmails());
// console.log(await fetchTodoSafe(1), await fetchTodoSafe(9999));
// console.log(await fetchPostBatch([1, 2]));
// console.log(await processCommentsPipeline(1, 'data/comments_output.json'));
