/**
 * scripts/private.ts
 *
 * Moves exercise files between your PRIVATE workspace and the graded `src/`
 * folder. Run it with the npm scripts in package.json:
 *
 *   npm run private:seed    copy starter files  src/  ->  private/src/
 *   npm run private:apply   promote your work   private/src/  ->  src/
 *
 * Why this exists: the test suite in tests/ imports from `../src/…`, so code
 * only counts once it lands in src/. You draft in private/ (git-ignored),
 * then apply when you want the tests to see it.
 */

// `import … from` is the ES module import statement. The names in braces are
// NAMED imports — they must match exports of the target module.
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import
// The `node:` prefix means "a Node built-in module", never a package on npm.
// https://nodejs.org/api/esm.html#node-imports
import { copyFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';

// path.join() glues path segments with the correct separator for the OS
// ("/" on Linux/macOS, "\" on Windows). Params: (...paths: string[]) => string
// https://nodejs.org/api/path.html#pathjoinpaths
import { join } from 'node:path';

// ---------------------------------------------------------------------------
// 1. Load .env into process.env
// ---------------------------------------------------------------------------

// try…catch runs the risky code, and jumps to catch instead of crashing if it
// throws. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch
try {
  // process.loadEnvFile(path?) parses a .env file and copies every KEY=VALUE
  // onto process.env. Param defaults to './.env'. Returns undefined. Throws if
  // the file is missing. https://nodejs.org/api/process.html#processloadenvfilepath
  process.loadEnvFile();
} catch {
  // A missing .env is fine — the defaults on the next lines take over.
  // A catch block with no `(err)` binding is "optional catch binding".
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch#optional_catch_binding
}

// process.env is an object of environment variables. Every value is
// `string | undefined`, which is why each read needs a fallback below.
// https://nodejs.org/api/process.html#processenv
//
// `??` is the nullish coalescing operator: use the left side unless it is
// null or undefined, then use the right side. (Unlike `||`, an empty string
// or 0 on the left is kept.)
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing
//
// `const` declares a block-scoped binding that cannot be reassigned.
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const
const PRIVATE_DIR = process.env.PRIVATE_DIR ?? 'private';
const SRC_DIR = process.env.SRC_DIR ?? 'src';

// Where your drafts live: e.g. "private/src".
const PRIVATE_SRC = join(PRIVATE_DIR, 'src');

// ---------------------------------------------------------------------------
// 2. Read the command the user typed
// ---------------------------------------------------------------------------

// A `type` alias names a shape. Here it is a UNION of two exact string values,
// so TypeScript rejects any other command at compile time.
// https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#union-types
type Command = 'seed' | 'apply';

// process.argv is the array of command-line words:
//   [0] path to node, [1] path to this script, [2+] your arguments.
// https://nodejs.org/api/process.html#processargv
const args = process.argv.slice(2);

// Array.prototype.includes(searchElement) returns true/false. Used here so
// `--force` can appear anywhere in the arguments.
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes
const force = args.includes('--force');

// args[0] is the command word. `as Command | undefined` is a type assertion:
// it tells TypeScript what to expect; the runtime check below does the real
// validation. https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#type-assertions
const command = args[0] as Command | undefined;

// ---------------------------------------------------------------------------
// 3. Helpers
// ---------------------------------------------------------------------------

/**
 * Lists the exercise .ts files inside a folder.
 * Steps: read the directory -> keep only exerciseNN.ts names -> sort them.
 */
function listExerciseFiles(dir: string): string[] {
  // fs.existsSync(path) returns true if the path exists. Synchronous, so no
  // await needed. https://nodejs.org/api/fs.html#fsexistssyncpath
  if (!existsSync(dir)) return [];

  // fs.readdirSync(path) returns an array of file/folder NAMES (not paths).
  // https://nodejs.org/api/fs.html#fsreaddirsyncpath-options
  return (
    readdirSync(dir)
      // Array.prototype.filter(callback) keeps items where the callback is true.
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
      //
      // RegExp.prototype.test(string) returns true if the pattern matches.
      // /^exercise\d{2}\.ts$/ reads as: start, "exercise", exactly two digits,
      // ".ts", end. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions
      .filter((name) => /^exercise\d{2}\.ts$/.test(name))
      // Array.prototype.sort() with no comparator sorts strings alphabetically,
      // which for zero-padded names is also numeric order.
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
      .sort()
  );
}

/**
 * Copies every exercise file from one folder to another.
 * Steps: make sure the destination exists -> for each file, skip or copy ->
 * print one line per file -> return how many were copied.
 */
function copyExercises(from: string, to: string, overwrite: boolean): number {
  // fs.mkdirSync(path, options). `recursive: true` creates missing parent
  // folders and does NOT throw if the folder already exists.
  // https://nodejs.org/api/fs.html#fsmkdirsyncpath-options
  mkdirSync(to, { recursive: true });

  // `let` declares a block-scoped binding that CAN be reassigned.
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let
  let copied = 0;

  // for…of iterates the values of an iterable (here, each filename).
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...of
  for (const name of listExerciseFiles(from)) {
    const source = join(from, name);
    const target = join(to, name);

    // Guard: never silently overwrite work unless --force was passed.
    if (existsSync(target) && !overwrite) {
      // Template literals use backticks; `${…}` inserts a value.
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
      console.log(
        `  skip     ${target} (already exists — use --force to replace)`,
      );
      // `continue` jumps to the next loop iteration.
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/continue
      continue;
    }

    // fs.copyFileSync(src, dest[, mode]) copies a file, overwriting dest by
    // default. https://nodejs.org/api/fs.html#fscopyfilesyncsrc-dest-mode
    copyFileSync(source, target);
    // console.log(...data) writes a line to stdout.
    // https://developer.mozilla.org/en-US/docs/Web/API/console/log_static
    console.log(`  copied   ${source} -> ${target}`);

    // `+=` adds and reassigns.
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Addition_assignment
    copied += 1;
  }

  return copied;
}

// ---------------------------------------------------------------------------
// 4. Run the requested command
// ---------------------------------------------------------------------------

// `switch` compares `command` against each `case` using strict equality (===).
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/switch
switch (command) {
  case 'seed': {
    console.log(`Seeding ${PRIVATE_SRC} from ${SRC_DIR}`);
    const n = copyExercises(SRC_DIR, PRIVATE_SRC, force);
    console.log(`Done. ${n} file(s) copied.`);
    // `break` stops the switch from falling through to the next case.
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/break
    break;
  }

  case 'apply': {
    console.log(`Applying ${PRIVATE_SRC} to ${SRC_DIR} (overwrites src/)`);
    // `true` here: applying is meant to overwrite the graded files.
    const n = copyExercises(PRIVATE_SRC, SRC_DIR, true);
    console.log(`Done. ${n} file(s) copied. Now run: npm test`);
    break;
  }

  // `default` runs when nothing matched — including no command at all.
  default: {
    console.error('Usage: npm run private:seed | npm run private:apply');
    console.error('Add -- --force to overwrite existing files when seeding.');
    // process.exitCode sets the exit status without killing the process
    // mid-write. Non-zero means "failed", which stops npm script chains.
    // https://nodejs.org/api/process.html#processexitcode_1
    process.exitCode = 1;
  }
}
