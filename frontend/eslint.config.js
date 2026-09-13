import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'coverage', 'src/routeTree.gen.ts']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      // Mirrors the static security scan in tests/frontend-security.test.tsx so
      // violations surface in the editor as well as CI.
      '@typescript-eslint/no-explicit-any': 'error',
      'no-console': 'error',
    },
  },
  {
    // Tests and Node config run outside the browser and use the vitest globals.
    files: ['tests/**/*.{ts,tsx}', '**/*.test.{ts,tsx}', '*.config.{ts,js}'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
  {
    // TanStack file-based routes export a `Route` object beside the component;
    // that is the framework contract, and these modules are owned by the router's
    // own HMR, so Fast Refresh's single-export rule does not apply.
    files: ['src/routes/**/*.{ts,tsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
])
