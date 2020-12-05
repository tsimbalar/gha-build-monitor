module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.json'],
  },

  plugins: ['@typescript-eslint', 'prettier'],
  extends: [
    'eslint:all',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'prettier',
    'prettier/@typescript-eslint',
  ],
  rules: {
    'new-cap': ['error', { capIsNew: false }],
    'max-lines-per-function': 'off',
    '@typescript-eslint/require-await': 'off',
    'class-methods-use-this': 'off',
    'sort-keys': 'off',
    'multiline-comment-style': 'off',
    'max-lines': 'off',
    'max-statements': 'off',
    'func-style': 'off',
    'one-var': 'off',
    'capitalized-comments': 'off',
    'no-undefined': 'off',
  },
};
