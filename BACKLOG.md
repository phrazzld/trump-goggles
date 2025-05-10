# BACKLOG

## Future Improvements

These tasks are out of scope for the current implementation but should be considered for future work:

- [ ] **FUT-01**: Introduce automated testing (unit tests for `buildTrumpMap`, integration tests for content script functionality)
- [ ] **FUT-02**: Convert JavaScript files to TypeScript for better type safety and tooling
- [ ] **FUT-03**: Implement a module bundler (Webpack/Rollup) to replace global function sharing
- [ ] **FUT-04**: Refine and expand type definitions in `types.d.ts`
- [ ] **FUT-05**: Adopt `webextension-polyfill` library for cross-browser compatibility

## Development Improvements

Items identified in code review for future implementation:

- [ ] **DEV-01**: Add explicit TypeScript checking to pre-commit hooks for more robust validation
- [ ] **DEV-02**: Include test files in TypeScript checking by removing them from exclude in tsconfig.json
- [ ] **DEV-03**: Improve immutability in the mapping objects using Object.freeze()
- [ ] **DEV-04**: Refine the console warning mechanism to avoid monkey-patching
- [ ] **DEV-05**: Add newlines to the end of all text files for consistent formatting
- [ ] **DEV-06**: Replace placeholder team/user names in CODEOWNERS with actual GitHub handles

## Maintenance Tasks

Periodic maintenance tasks to ensure project health:

- [ ] **MAINT-01**: Quarterly review of GitHub Actions versions (see CI-VERSIONING.md)
  - First scheduled review: August 2025
  - Review all actions in use against latest available versions
  - Update documentation after completing review