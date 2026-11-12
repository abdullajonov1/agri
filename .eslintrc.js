/**
 * Widget-level ESLint overrides on top of client/.eslintrc.js ("love").
 *
 * This widget is written in the Prettier style (double quotes, semicolons,
 * trailing commas), so the pure-formatting rules of the root config are off
 * here: they reported ~95k style-only errors and buried the real findings.
 * Rules that catch bugs (hooks, unused vars, promises, types) stay on.
 */
module.exports = {
  rules: {
    "@typescript-eslint/semi": "off",
    "@typescript-eslint/quotes": "off",
    "@typescript-eslint/comma-dangle": "off",
    "@typescript-eslint/member-delimiter-style": "off",
    "@typescript-eslint/indent": "off",
    "@typescript-eslint/space-before-function-paren": "off",
    "@typescript-eslint/brace-style": "off",
    "@typescript-eslint/lines-between-class-members": "off",
    "@typescript-eslint/consistent-indexed-object-style": "off",
    "@typescript-eslint/consistent-type-definitions": "off",
    "@typescript-eslint/method-signature-style": "off",
    "@typescript-eslint/array-type": "off",
    "multiline-ternary": "off",
    "object-property-newline": "off",
    "quote-props": "off",
    "padded-blocks": "off",
    "eol-last": "off",
    "no-multiple-empty-lines": "off",
    "operator-linebreak": "off",
    "generator-star-spacing": "off",
    // Unsound here: the client tsconfig has strictNullChecks off, so a
    // `boolean | undefined` looks like `boolean` and the autofix would turn
    // `x === false` into `!x` (true for undefined too).
    "@typescript-eslint/no-unnecessary-boolean-literal-compare": "off",
    // ESLint type-checks with the root tsconfig, not tsconfig.check.json: it
    // calls casts like `querySelector(...) as HTMLElement` unnecessary and its
    // autofix broke the widget's tsc. tsc is the authority on assertions.
    "@typescript-eslint/no-unnecessary-type-assertion": "off",
    // Same cause: `reduce<T>(fn, {})` does not type-check with the es6 lib
    // the client uses, while `reduce(fn, {} as T)` does.
    "@typescript-eslint/prefer-reduce-type-parameter": "off",
    // Service field names (raster_date) and locale keys (uz_lat) are snake_case.
    "@typescript-eslint/naming-convention": "off",
  },
  overrides: [
    {
      files: ["*.test.ts", "*.test.tsx", "**/__test-utils__/**"],
      rules: {
        // jest.fn() members are referenced unbound on purpose in expectations.
        "@typescript-eslint/unbound-method": "off",
        // Tests stub read-only getters with defineProperty({ set }).
        "accessor-pairs": "off",
        // jest.mock() must come before the imports it replaces.
        "import/first": "off",
        // Deferred promises in tests name their callbacks after what they settle.
        "promise/param-names": "off",
        // Empty stub classes stand in for esri constructors.
        "@typescript-eslint/no-extraneous-class": "off",
        "@typescript-eslint/no-non-null-assertion": "off",
        "@typescript-eslint/no-confusing-void-expression": "off",
        // `typeof import("./x")` types jest.requireActual / jest.mock results.
        "@typescript-eslint/consistent-type-imports": ["error", { disallowTypeAnnotations: false }],
        // Fixtures carry the non-breaking spaces Intl.NumberFormat emits.
        "no-irregular-whitespace": "off",
      },
    },
  ],
};
