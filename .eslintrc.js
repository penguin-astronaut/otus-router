module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  parser: "@typescript-eslint/parser",
  extends: [
    "airbnb-base",
    "plugin:@typescript-eslint/recommended",
    "eslint-config-prettier",
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "module",
  },
  rules: {
    "no-underscore-dangle": "off",
    "class-methods-use-this": "off",
    "import/prefer-default-export": "off",
    "import/no-unresolved": "off",
    "import/extensions": ["warn", "never"],
    "no-shadow": "off",
    "@typescript-eslint/no-shadow": ["error"],
    "no-param-reassign": "off",
    "@typescript-eslint/no-var-requires": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "no-unused-expressions": "off",
    "no-console": "off",
  },
};
