import vitestPlugin from 'eslint-plugin-vitest';
import jestDomPlugin from 'eslint-plugin-jest-dom';

export default [
  {
    ignores: [
      'node_modules/**', 
      'coverage/**',
      '.vitest/**',
      // Temporarily ignore existing files while we focus on testing
      'content.js',
      'background.js'
    ],
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...vitestPlugin.environments.env.globals,
        chrome: 'readonly',
        vi: 'readonly',
      },
    },
    plugins: {
      vitest: vitestPlugin,
      'jest-dom': jestDomPlugin,
    },
    rules: {
      'indent': ['error', 2],
      'linebreak-style': ['error', 'unix'],
      'quotes': ['error', 'single', { 'avoidEscape': true }],
      'semi': ['error', 'always'],
      'no-unused-vars': ['warn'],
      'vitest/expect-expect': 'error',
      'vitest/no-disabled-tests': 'warn',
    },
  },
  {
    files: ['test/**/*.js'],
    rules: {
      'vitest/expect-expect': 'error',
    },
  },
];