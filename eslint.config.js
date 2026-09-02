import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { defineConfig } from 'eslint/config';
import eslintConfigPrettier from 'eslint-config-prettier';

export default defineConfig([
  // A config object containing ONLY `ignores` sets GLOBAL ignores: these paths
  // are skipped by every other config block below.
  // https://eslint.org/docs/latest/use/configure/ignore
  // private/ is a personal scratch area, so lint output stays focused on the
  // files that actually get submitted.
  { ignores: ['private/**', 'dist/**'] },
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    plugins: { js },
    extends: ['js/recommended'],
    languageOptions: { globals: globals.node },
  },
  tseslint.configs.recommended,
  eslintConfigPrettier,
]);
