module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "plugin:@typescript-eslint/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["tsconfig.json", "tsconfig.dev.json"],
    sourceType: "module",
  },
  ignorePatterns: [
    "/lib/**/*", // Ignore built files.
  ],
  plugins: [
    "@typescript-eslint",
    "import",
  ],
  rules: {
    "camelcase": 0,
    "no-multiple-empty-lines": 0,
    "prefer-promise-reject-errors": 0,
    "no-multi-spaces": 0,
    "operator-linebreak": 0,
    "brace-style": 0,
    "require-jsdoc": 0,
    "space-before-function-paren": 0,
    "quotes": "off",
    '@typescript-eslint/ban-types': 0,
    'prefer-const': 0,
    'no-var': 0,
    '@typescript-eslint/no-var-requires': 0,
    '@typescript-eslint/no-namespace': 0,
    'linebreak-style': 0,
    'max-len': 0,
    'indent': 0,
    'semi': 0,
    'eol-last': 0,
    'curly': 0,
    'no-mixed-spaces-and-tabs':0,
    'spaced-comment': 0,
    'comma-dangle': 0,
    'object-curly-spacing': 0,
    'no-trailing-spaces': 0,
    'keyword-spacing': 0,
    'guard-for-in': 0,
    'padded-blocks': 0,
    "eslint.enable": 0,
    "import/no-unresolved": 0,
  }, 
  "parserOptions": {
    "extraFileExtensions:": [".json"]
  }
};
