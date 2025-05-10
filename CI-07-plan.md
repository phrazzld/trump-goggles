# CI-07: Update CI for Test Coverage Reporting

## Task Summary
The task requires configuring the CI pipeline to execute test coverage checks and to output or upload the coverage report as an artifact.

## Current State
- The CI workflow in `.github/workflows/ci.yml` already runs `pnpm test:coverage` as the last step
- The coverage configuration in `vitest.config.js` specifies:
  - Coverage provider: v8
  - Reporters: text and html
  - Excludes: node_modules and test directories
- Coverage reports are generated locally but not currently uploaded as artifacts in the CI

## Implementation Plan

### 1. Update CI Workflow to Upload Coverage as Artifact
Add a step to upload the coverage report as an artifact after the test:coverage step:

```yaml
- name: Run tests with coverage
  run: pnpm test:coverage

- name: Upload Coverage Report
  uses: actions/upload-artifact@v3
  with:
    name: coverage-report
    path: coverage/
    retention-days: 14
```

This will:
1. Allow coverage reports to be accessed from the GitHub Actions interface
2. Keep reports for 14 days for later reference
3. Make it easy to view the coverage details without downloading the entire repository

### 2. Add Coverage Thresholds (Optional Enhancement)
Update the Vitest configuration to include coverage thresholds:

```javascript
coverage: {
  provider: 'v8',
  reporter: ['text', 'html', 'lcov'],
  exclude: ['**/node_modules/**', '**/test/**'],
  thresholds: {
    statements: 80,
    branches: 70,
    functions: 80,
    lines: 80
  }
}
```

This will:
1. Cause tests to fail if coverage falls below thresholds
2. Add lcov reporter for potential integration with other tools
3. Set reasonable thresholds based on the current state of the codebase

## Implementation Steps
1. Update the GitHub Actions workflow file to upload coverage reports as artifacts
2. Consider adding coverage thresholds to the Vitest configuration file
3. Test the changes by pushing a commit to trigger CI

## Verification Plan
1. Push a commit to trigger CI
2. Verify the coverage artifacts are uploaded and accessible
3. Check that coverage reports show the expected information

## Expected Outcome
- Coverage reports will be generated as part of the CI process
- Reports will be uploaded as artifacts and accessible from the GitHub Actions interface
- The CI process will continue to use the same coverage provider (v8) and exclude the same directories