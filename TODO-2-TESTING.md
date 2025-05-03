# TODO: Automated Testing

This task focuses on adding automated testing to ensure extension functionality.

## Testing Tasks
- [x] Add automated testing
  - [x] Setup Vitest for unit testing
    - [x] Initialize pnpm project with package.json
    - [x] Install Vitest and related dependencies
    - [x] Configure Vitest for browser extension testing
    - [x] Enforce pnpm usage with appropriate configuration
  - [x] Create tests for content scripts
    - [x] Test text replacement functionality
    - [x] Test pattern matching
    - [x] Test regex patterns
  - [x] Create tests for background scripts
    - [x] Test options page opening functionality
  - [x] Setup GitHub Actions for CI testing
    - [x] Create .github/workflows directory
    - [x] Create CI workflow for running tests
    - [x] Configure linting with ESLint

## Completed Changes
1. Project Configuration:
   - Initialized pnpm project with package.json
   - Added Vitest and related dependencies for testing
   - Created vitest.config.js for test configuration
   - Added .npmrc to enforce pnpm usage
   - Configured ESLint with recommended rules

2. Testing Framework:
   - Created test directory structure
   - Added Chrome API mocks in setup.js
   - Implemented content script tests for text replacement
   - Implemented background script test for options page opening
   - Created ESLint configuration with Vitest plugin

3. CI/CD Setup:
   - Created GitHub Actions workflow in .github/workflows/ci.yml
   - Configured workflow to run on push and pull requests
   - Set up testing and linting in CI pipeline
   - Added Node.js matrix testing with multiple versions
   - Configured pnpm caching for faster CI runs

## Dependencies
- Can be started independently, builds on completed Manifest V3 migration

## Risk Assessment
- Low risk: Adding tests shouldn't affect production functionality

## Why Vitest Instead of Jest
- Faster execution and simpler configuration
- Better ESM support out of the box
- Compatible with Vite for future frontend tooling
- Simpler mocking capabilities for browser extensions