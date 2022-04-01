/* eslint sort-keys-fix/sort-keys-fix: ["error", "asc", { natural: true }] -- This rule is ONLY for this .eslintrc.js file, not as a rule in our codebase. */
/* eslint-disable sort-keys-fix/sort-keys-fix -- Usually, our eslint comment pairs are enabling then disabling rules. Since we can only properly configure this by globally enabling it, we immediately disable it here (and reenable at the bottom), so we can have disable then enable pairs around objects. */

const testFiles = ["**/*.spec.*", "jest.setup.ts"];

/**
 * @type {import('eslint').Linter.Config}
 */
const config = {
  env: { es6: true },
  plugins: [
    "eslint-comments",
    "fp",
    "import",
    "lodash-fp",
    "node",
    "promise",
    "sort-keys-fix",
    "unicorn",
  ],
  extends: [
    "plugin:eslint-comments/recommended",
    "plugin:fp/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "plugin:lodash-fp/recommended",
    "plugin:node/recommended",
    "plugin:promise/recommended",
    "airbnb",
    "prettier",
  ],
  /* eslint-enable sort-keys-fix/sort-keys-fix -- Sorting rules */
  rules: {
    "eslint-comments/no-unused-disable": "error",
    "eslint-comments/require-description": [
      "error",
      { ignore: ["eslint-enable"] },
    ],
    "fp/no-mutation": [
      "error",
      {
        exceptions: [
          { object: "err", property: "name" }, // Intended usage of standard-error
          { property: "current" },
          { property: "displayName" },
        ],
      },
    ],
    "fp/no-nil": "off",
    "fp/no-rest-parameters": "off",
    "fp/no-throw": "off",
    "fp/no-unused-expression": "off",
    "func-style": ["error", "expression"],
    "import/extensions": [
      "error",
      "always",
      {
        js: "never",
        json: "always",
        ts: "never",
        tsx: "never",
      },
    ],
    "import/order": [
      "error",
      {
        alphabetize: { caseInsensitive: true, order: "asc" },
        groups: [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index",
          "type",
          "object",
        ],
        "newlines-between": "always",
      },
    ],
    "import/prefer-default-export": "off",
    "lodash-fp/consistent-compose": ["error", "flow"],
    "lodash-fp/no-extraneous-partials": "error",
    "lodash-fp/no-for-each": "error",
    "lodash-fp/preferred-alias": "error",
    "newline-before-return": "error",
    "no-console": "error",
    "no-nested-ternary": "off",
    "no-promise-executor-return": "off",
    "no-shadow": "off",
    "no-void": ["error", { allowAsStatement: true }],
    "node/no-missing-import": "off",
    "node/no-unpublished-import": "off",
    "node/no-unpublished-require": "off",
    "node/no-unsupported-features/es-syntax": "off",
    "promise/prefer-await-to-then": "error",
    "sort-imports": ["error", { ignoreDeclarationSort: true }],
    "unicorn/expiring-todo-comments": "error",
    "unicorn/prefer-ternary": "error",
  },
  /* eslint-disable sort-keys-fix/sort-keys-fix -- Sorting rules */
  overrides: [
    {
      files: ["**/*.js"],
      env: { commonjs: true, es6: false },
      /* eslint-enable sort-keys-fix/sort-keys-fix -- Sorting rules */
      rules: {
        "fp/no-mutation": ["error", { commonjs: true }],
        "global-require": "off",
      },
      /* eslint-disable sort-keys-fix/sort-keys-fix -- Sorting rules */
    },
    {
      files: ["**/*.ts", "**/*.tsx"],
      parser: "@typescript-eslint/parser",
      parserOptions: {
        project: ["./tsconfig.json"],
      },
      plugins: ["@typescript-eslint", "typescript-sort-keys"],
      extends: [
        "plugin:@typescript-eslint/recommended",
        "plugin:typescript-sort-keys/recommended",
      ],
      /* eslint-enable sort-keys-fix/sort-keys-fix -- Sorting rules */
      rules: {
        "@typescript-eslint/array-type": [
          "error",
          {
            default: "array",
            readonly: "array",
          },
        ],
        "@typescript-eslint/consistent-indexed-object-style": "error",
        "@typescript-eslint/consistent-type-assertions": [
          "error",
          { assertionStyle: "as", objectLiteralTypeAssertions: "never" },
        ],
        "@typescript-eslint/consistent-type-definitions": [
          "error",
          "interface",
        ],
        "@typescript-eslint/consistent-type-imports": "error",
        "@typescript-eslint/member-delimiter-style": "error",
        "@typescript-eslint/method-signature-style": "error",
        "@typescript-eslint/no-confusing-non-null-assertion": "error",
        "@typescript-eslint/no-empty-function": [
          "error",
          {
            allow: ["arrowFunctions", "functions", "methods"],
          },
        ],
        "@typescript-eslint/no-empty-interface": [
          "error",
          { allowSingleExtends: true },
        ],
        "@typescript-eslint/no-non-null-asserted-nullish-coalescing": "error",
        "@typescript-eslint/no-non-null-asserted-optional-chain": "error",
        "@typescript-eslint/no-non-null-assertion": "off",
        "@typescript-eslint/no-unused-vars": [
          "error",
          {
            args: "after-used",
            ignoreRestSiblings: true,
            vars: "all",
          },
        ],
        "@typescript-eslint/prefer-optional-chain": "error",
        "@typescript-eslint/prefer-ts-expect-error": "error",
        "@typescript-eslint/type-annotation-spacing": "error",
        "@typescript-eslint/unified-signatures": "error",
        // needed since mongodb's id field is _id
        "no-underscore-dangle": [
          "error",
          {
            allow: ["_id"],
            allowAfterSuper: false,
            allowAfterThis: false,
            allowAfterThisConstructor: false,
            allowFunctionParams: true,
            enforceInMethodNames: true,
          },
        ],
        "no-unused-vars": "off",
        "no-void": "off",
      },
      /* eslint-disable sort-keys-fix/sort-keys-fix -- Sorting rules */
    },
    {
      files: ["**/*.d.ts"],
      parser: "@typescript-eslint/parser",
      parserOptions: {
        project: ["./tsconfig.json"],
      },
      plugins: ["@typescript-eslint"],
      /* eslint-enable sort-keys-fix/sort-keys-fix -- Sorting rules */
      rules: {
        "@typescript-eslint/consistent-type-imports": [
          "error",
          { disallowTypeAnnotations: false },
        ],
      },
      /* eslint-disable sort-keys-fix/sort-keys-fix -- Sorting rules */
    },
    {
      files: [...testFiles, "./*.ts", "**/*.js"],
      /* eslint-enable sort-keys-fix/sort-keys-fix -- Sorting rules */
      rules: {
        "import/no-extraneous-dependencies": [
          "error",
          {
            bundledDependencies: false,
            devDependencies: true,
            optionalDependencies: false,
            peerDependencies: false,
          },
        ],
      },
      /* eslint-disable sort-keys-fix/sort-keys-fix -- Sorting rules */
    },
    {
      files: testFiles,
      env: { "jest/globals": true, jest: true },
      plugins: ["jest"],
      /* eslint-enable sort-keys-fix/sort-keys-fix -- Sorting rules */
      rules: {
        "@typescript-eslint/no-var-requires": "off", // jest.mock requires inline mocks, will be doing this constantly
        "@typescript-eslint/unbound-method": "off",
        "fp/no-events": "off",
        "fp/no-let": "off",
        "fp/no-mutation": "off",
        "global-require": "off", // jest.mock requires inline mocks, will be doing this constantly
        "jest/no-done-callback": "off",
        "jest/no-jest-import": "off", // Cypress and Jest collide and importing is more explicit
        "lodash-fp/no-for-each": "off",
      },
      /* eslint-disable sort-keys-fix/sort-keys-fix -- Sorting rules */
    },
    {
      files: [".eslintrc.js", ".eslintrc.strict.js"],
      /* eslint-enable sort-keys-fix/sort-keys-fix -- Sorting rules */
      rules: {
        // HACK The sort-keys-fix pairs sometimes have a technically unnecessary disable, but removing them cascades into other eslint errors. I couldn't disable no-unused-disable on specific comments or globally for this file via a comment. Might be related to these limitations: https://mysticatea.github.io/eslint-plugin-eslint-comments/rules/no-unused-disable.html#known-limitations
        "eslint-comments/no-unused-disable": "off",
      },
      /* eslint-disable sort-keys-fix/sort-keys-fix -- Sorting rules */
    },
    {
      files: ["**/*"],
      excludedFiles: [...testFiles, "./*", "**/*.d.*"],
      /* eslint-enable sort-keys-fix/sort-keys-fix -- Sorting rules */
      rules: {
        "import/no-unused-modules": [
          "error",
          {
            ignoreExports: ["src/index.ts"],
            missingExports: true,
            unusedExports: true,
          },
        ],
      },
      /* eslint-disable sort-keys-fix/sort-keys-fix -- Sorting rules */
    },
  ],
};
/* eslint-enable sort-keys-fix/sort-keys-fix */

module.exports = config;
