# CI Failure Analysis - Round 4

## Issue Overview
After fixing the Node.js version requirements, the CI workflow is now failing with an ESLint configuration error:

```
ESLint couldn't find an eslint.config.(js|mjs|cjs) file.

From ESLint v9.0.0, the default configuration file is now eslint.config.js.
If you are using a .eslintrc.* file, please follow the migration guide
to update your configuration file to the new format:

https://eslint.org/docs/latest/use/configure/migration-guide
```

## Root Cause Analysis
We're using ESLint v9, which requires a new configuration format. ESLint v9 no longer uses `.eslintrc.json` and instead requires an `eslint.config.js` file.

## Fix Recommendations

1. Create an `eslint.config.js` file in the new format:

```javascript
import vitestPlugin from 'eslint-plugin-vitest';

export default [
  {
    ignores: ['node_modules/**', 'coverage/**'],
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...vitestPlugin.environments.env.globals,
      },
    },
    plugins: {
      vitest: vitestPlugin,
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
```

2. Remove the old `.eslintrc.json` file since it's no longer used.

## Implementation Plan
1. Create the new `eslint.config.js` file with the updated configuration
2. Remove the old `.eslintrc.json` file
3. Commit and push the changes
4. Re-run the GitHub Actions workflow
5. Verify that the CI passes successfully

This change adapts our ESLint configuration to the new format required by ESLint v9.