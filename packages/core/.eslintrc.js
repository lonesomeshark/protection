module.exports = {
  env: {
    browser: false,
    es2021: true,
    mocha: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  extends: [
    'standard',
    'plugin:prettier/recommended',
    // "plugin:node/recommended",
    // "airbnb-base",
    // "airbnb-typescript/base",
  ],
  plugins: ['@typescript-eslint'],
  parserOptions: {
    ecmaVersion: 12,
    // project: "./tsconfig.json",
  },
  overrides: [
    {
      files: ['hardhat.config.ts'],
      globals: { task: true },
    },
    {
      files: ['scripts/**'],
      rules: { 'no-process-exit': 'off' },
    },
    {
      files: ['hardhat.config.ts', 'scripts/**', 'test/**'],
      rules: {
        'no-lone-blocks': 'off',
        'node/no-unpublished-require': 'off',
        camelcase: 'off',
        'no-unused-vars': 'off',
      },
    },
  ],
};
