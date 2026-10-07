/**
 * Widget-local lint rules: the same limits scripts/check-quality.mjs enforces,
 * surfaced in the editor. `root: true` keeps the client-wide "love" style
 * config out (it reports ~47k quote/semicolon issues here), and no type-aware
 * program is needed, so linting is fast.
 *
 * Run from client/: npx eslint your-extensions/widgets/agri-main/src --ext .ts,.tsx
 */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: { jsx: true }
  },
  env: { browser: true, es6: true },
  plugins: ['@typescript-eslint', 'react-hooks'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/ban-ts-comment': ['error', { 'ts-expect-error': 'allow-with-description' }],
    'no-empty': ['error', { allowEmptyCatch: false }],
    'no-console': ['error', { allow: ['warn', 'error'] }],
    'max-lines': ['error', { max: 800, skipBlankLines: false, skipComments: false }],
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn'
  },
  overrides: [
    {
      files: ['**/*.test.ts', '**/*.test.tsx', '**/__test-utils__/**'],
      env: { jest: true },
      rules: { 'max-lines': 'off' }
    }
  ]
}
