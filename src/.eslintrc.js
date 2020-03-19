module.exports = {
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  extends: ['prettier', 'prettier/react', 'plugin:import/warnings'],
  plugins: ['prettier', 'import'],
  globals: {
    document: true,
    window: true,
    process: true,
    fetch: false,
  },
  rules: {
    'react/forbid-prop-types': 0,
    'react/jsx-filename-extension': 0,
    'react/react-in-jsx-scope': 0,
    'class-methods-use-this': 0,
    'no-unused-expressions': ['error', { allowTaggedTemplates: true }],
    'no-underscore-dangle': 0,
    'react/no-unused-prop-types': 0,
    'consistent-return': 0,
    'import/no-extraneous-dependencies': 0,
    'prettier/prettier': 'error',
    'react/destructuring-assignment': 0,
  },
};
