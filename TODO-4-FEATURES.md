# TODO: New Features

This task focuses on adding new functionality to the extension.

## Feature Tasks
- [x] Add more nickname patterns
  - [x] Add 2025 upgrade pack with current politicians
  - [x] Update media organization nicknames
  - [x] Add COVID-related terms
- [x] Configure pre-commit hooks
  - [x] Setup linting and formatting checks
  - [x] Prevent commit of sensitive data and large files
  - [x] Enforce conventional commit format
- [x] Performance and Code Quality Improvements (Critical)
  - [x] Performance: Cache buildTrumpMap to avoid rebuilding for each text node
  - [x] Performance: Optimize convert function loop to reduce DOM operations
  - [x] Cleanup: Remove unused chrome.storage.sync.get call
  - [x] Testing: Add unit tests for content.js core logic
    - [x] Create buildTrumpMap function tests
    - [x] Create convert function tests with multiple patterns
    - [x] Test case-insensitivity and word boundaries
    - [x] Test overlapping/interacting patterns
  - [x] Enhancement: Support dynamic content loading with MutationObserver
- [x] Important Improvements
  - [x] Update package.json to use proper semantic versioning (2.0.0)
- [x] Recommended Improvements
  - [x] Refactor: Replace all var with const/let in content.js
  - [x] Refactor: Improve regex pattern organization
  - [x] Enhancement: Add logic to avoid replacements in editable fields
  - [x] Documentation: Add JSDoc comments to key functions
  - [x] Enhancement: Add error handling around DOM operations

## Dependencies
- Should be implemented after V3 migration and options page improvements

## Risk Assessment
- Medium risk: New features could affect performance or introduce bugs
- High risk: Without proper testing, performance optimizations may introduce subtle regressions
