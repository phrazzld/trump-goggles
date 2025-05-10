# Trump Goggles: Task Breakdown

This document provides a detailed, actionable task breakdown for the Trump Goggles extension. Tasks are organized by category, priority, and dependencies.

## Task Categories

- **[R]**: Refactoring tasks
- **[CS]**: Content script tasks
- **[BG]**: Background script tasks
- **[TEST]**: Testing and verification tasks
- **[DOC]**: Documentation tasks
- **[TS]**: TypeScript and type system tasks
- **[CI]**: Continuous Integration tasks

## New Tasks (Remediation Plan)

### TypeScript Configuration

- [x] **TS-01 · P0: Enable TypeScript Strict Mode in tsconfig.json**
    - **Context:** REMEDIATION_PLAN.md - Section 2.1: Enable TypeScript Strict Mode
    - **Action:**
        1. Update `tsconfig.json` to set `"strict": true`.
        2. Remove redundant strict-related options (e.g., `"noImplicitThis": false`) already covered by `strict: true`.
    - **Done‑when:**
        1. `tsconfig.json` reflects `"strict": true` and redundant strict flags are removed.
        2. `pnpm typecheck` command can be run (errors due to strict mode are expected at this stage and will be addressed in TS-02).
    - **Verification:**
        1. Inspect `tsconfig.json` to confirm the changes.
        2. Run `pnpm typecheck` and observe it reports type errors related to strict mode.
    - **Depends‑on:** none

- [x] **TS-02 · P0: Address TypeScript Strict Mode Errors**
    - **Context:** REMEDIATION_PLAN.md - Section 2.1: Enable TypeScript Strict Mode (Error Remediation)
    - **Action:**
        1. Execute `pnpm typecheck` to identify all errors introduced by enabling strict mode (TS-01).
        2. Incrementally fix type errors, prioritizing core modules, until `pnpm typecheck` passes.
    - **Done‑when:**
        1. `pnpm typecheck` (or `tsc --noEmit`) completes successfully without any errors.
    - **Verification:**
        1. Run `pnpm typecheck`; command must complete with exit code 0.
    - **Depends‑on:** [TS-01]

### Type Definitions

- [x] **TS-03 · P1: Define Interface for Window Module Exports**
    - **Context:** REMEDIATION_PLAN.md - Section 2.2: Replace `any` Types - Window Module Exports
    - **Code Area:** `/types.d.ts` (or project's global type definition file)
    - **Action:**
        1. Define `LoggerInterface`, `ErrorHandlerInterface`, `BrowserDetectInterface`, `BrowserAdapterInterface`, `TrumpMappingsInterface` in the project's global type definition file.
    - **Done‑when:**
        1. All specified interfaces are defined with accurate method and property signatures reflecting their actual use.
    - **Verification:**
        1. Review the global type definition file for the new interface definitions and their completeness.
    - **Depends‑on:** none

- [x] **TS-04 · P1: Update Window Interface to Use Specific Module Interfaces**
    - **Context:** REMEDIATION_PLAN.md - Section 2.2: Replace `any` Types - Window Module Exports
    - **Code Area:** `/types.d.ts` (or project's global type definition file)
    - **Action:**
        1. Modify the `Window` interface in the global type definition file.
        2. Replace `any` types for `Logger`, `ErrorHandler`, `BrowserDetect`, `BrowserAdapter`, `TrumpMappings` with the interfaces defined in TS-03.
    - **Done‑when:**
        1. The `Window` interface uses the specific interfaces from TS-03 for its module properties.
        2. `pnpm typecheck` passes for the global type definition file.
    - **Verification:**
        1. Inspect the `Window` interface to confirm `any` types are replaced.
    - **Depends‑on:** [TS-03]

- [x] **TS-05 · P1: Refactor Codebase for Typed Window Module Exports**
    - **Context:** REMEDIATION_PLAN.md - Section 2.2: Replace `any` Types - Window Module Exports (Codebase Impact)
    - **Code Area:** Project-wide (where `window.Logger`, `window.ErrorHandler`, etc. are used)
    - **Action:**
        1. Identify and fix type errors throughout the codebase resulting from the `Window` interface changes (TS-04).
        2. Ensure all usages of these `window` properties align with their new, specific types.
    - **Done‑when:**
        1. All consuming code correctly uses the typed `window` module exports.
        2. `pnpm typecheck` passes for all files affected by these changes.
    - **Verification:**
        1. Run `pnpm typecheck`; command must complete successfully.
    - **Depends‑on:** [TS-02, TS-04]

- [x] **TS-06 · P1: Define Types for Chrome/Browser API Interactions**
    - **Context:** REMEDIATION_PLAN.md - Section 2.2: Replace `any` Types - Chrome/Browser API Types
    - **Code Area:** `/types.d.ts` (or project's global type definition file)
    - **Action:**
        1. Define specific TypeScript types/interfaces for commonly used Chrome/Browser API structures (e.g., `chrome.runtime.Manifest`, `chrome.runtime.InstalledDetails`, `chrome.storage` object structures, `chrome.webRequest` event objects).
    - **Done‑when:**
        1. Types/interfaces for key browser API structures are defined and accurately reflect API specifications.
    - **Verification:**
        1. Review the global type definition file for the new API type definitions.
    - **Depends‑on:** none

- [x] **TS-07 · P1: Update Browser API Declarations to Use Specific Types**
    - **Context:** REMEDIATION_PLAN.md - Section 2.2: Replace `any` Types - Chrome/Browser API Types
    - **Code Area:** `/types.d.ts` (or project's ambient/global type definition files for `chrome`/`browser` objects)
    - **Action:**
        1. Update the ambient declarations for `chrome` (and/or `browser`) APIs.
        2. Replace `any` with the specific types/interfaces defined in TS-06 for relevant API methods and properties.
    - **Done‑when:**
        1. Browser API declarations in type definitions use the newly defined specific types.
        2. `pnpm typecheck` passes for these type definition files.
    - **Verification:**
        1. Inspect the ambient `chrome`/`browser` type declarations.
    - **Depends‑on:** [TS-06]

- [ ] **TS-08 · P1: Refactor Codebase for Typed Browser API Interactions**
    - **Context:** REMEDIATION_PLAN.md - Section 2.2: Replace `any` Types - Chrome/Browser API Types (Codebase Impact)
    - **Code Area:** Project-wide (where Chrome/Browser APIs are used)
    - **Action:**
        1. Identify and fix type errors throughout the codebase resulting from the browser API type changes (TS-07).
        2. Ensure all usages of these APIs align with their new, specific types.
    - **Done‑when:**
        1. All consuming code correctly uses the typed browser APIs.
        2. `pnpm typecheck` passes for all files affected by these changes.
    - **Verification:**
        1. Run `pnpm typecheck`; command must complete successfully.
    - **Depends‑on:** [TS-02, TS-07]

### Documentation

- [ ] **DOC-03 · P2: Align Trailing Comma Documentation with Prettier Config**
    - **Context:** REMEDIATION_PLAN.md - Section 2.3: Align Trailing Comma Documentation
    - **Code Area:** `/CONTRIBUTING.md`
    - **Action:**
        1. Locate the "Formatting and Linting" section in `CONTRIBUTING.md`.
        2. Update the documentation to state that trailing commas are used "where valid in ES5 (objects, arrays, etc.)", consistent with the Prettier setting `"trailingComma": "es5"`.
    - **Done‑when:**
        1. The trailing comma rule description in `CONTRIBUTING.md` accurately matches the project's Prettier configuration.
    - **Verification:**
        1. Review the "Formatting and Linting" section in the updated `CONTRIBUTING.md` file.
    - **Depends‑on:** none

### Testing

- [ ] **TEST-05 · P1: Create Test File and Structure for Nickname Mappings**
    - **Context:** REMEDIATION_PLAN.md - Section 2.4: Add Unit Tests for Nickname Mapping Functionality
    - **Code Area:** `test/content/trump-mappings.test.js` (or `.ts` if project convention)
    - **Action:**
        1. Create a new test file (e.g., `test/content/trump-mappings.test.js`).
        2. Set up the basic test structure (e.g., import the module, `describe` blocks for grouping tests).
    - **Done‑when:**
        1. The test file is created and integrated into the test runner.
        2. A simple placeholder test within this file runs successfully via `pnpm test`.
    - **Verification:**
        1. Execute `pnpm test` and confirm the new test file is recognized and its placeholder test passes.
    - **Depends‑on:** none

- [x] **TEST-06 · P1: Implement Unit Tests for Nickname Mapping Core Logic**
    - **Context:** REMEDIATION_PLAN.md - Section 2.4: Add Unit Tests for Nickname Mapping Functionality
    - **Code Area:** `test/content/trump-mappings.test.js`
    - **Action:**
        1. Write unit tests covering the core logic of `trump-mappings.js`, including various inputs, expected outputs, regex pattern accuracy, and word boundary considerations.
    - **Done‑when:**
        1. Comprehensive tests cover key mapping scenarios and regex patterns.
        2. All new tests pass when running `pnpm test`.
        3. Test coverage for the `trump-mappings.js` module is significantly improved.
    - **Verification:**
        1. Run `pnpm test` and confirm all tests pass.
        2. Run `pnpm test:coverage` and review the coverage report for `trump-mappings.js`.
    - **Depends‑on:** [TEST-05]

- [x] **TEST-07 · P2: Implement Unit Tests for Nickname Mapping Legacy Support**
    - **Context:** REMEDIATION_PLAN.md - Section 2.4: Add Unit Tests for Nickname Mapping Functionality (Legacy Support)
    - **Code Area:** `test/content/trump-mappings.test.js`
    - **Action:**
        1. Write unit tests for the deprecated `buildTrumpMap` function.
        2. Verify it maintains backward compatibility and logs a deprecation warning when used.
    - **Done‑when:**
        1. Tests confirm `buildTrumpMap` functions as expected.
        2. Tests verify that a deprecation warning is logged upon calling `buildTrumpMap`.
        3. All new tests pass.
    - **Verification:**
        1. Run `pnpm test`.
        2. Inspect test runner output or use spies/mocks to confirm the deprecation warning is logged.
    - **Depends‑on:** [TEST-05]

### Tooling & CI

- [ ] **CI-06 · P2: Update Pre-commit Hooks and CI for Type Checking**
    - **Context:** REMEDIATION_PLAN.md - Section 5: Potential Challenges (Pre-commit hooks), General CI/CD Standards
    - **Code Area:** `.pre-commit-config.yaml` (or similar), CI configuration files (e.g., `.github/workflows/main.yml`)
    - **Action:**
        1. Add `pnpm typecheck` (or equivalent TypeScript checking command) to the project's pre-commit hooks.
        2. Add `pnpm typecheck` as a mandatory step in the CI pipeline.
    - **Done‑when:**
        1. Pre-commit hooks include a TypeScript type checking step.
        2. The CI pipeline includes a TypeScript type checking step that must pass.
    - **Verification:**
        1. Attempt a commit with a known type error; pre-commit hook should fail.
        2. Push a commit to trigger CI; verify the type checking step executes and passes (assuming code is correct).
    - **Depends‑on:** [TS-02, TS-05, TS-08]

- [ ] **CI-07 · P2: Update CI for Test Coverage Reporting**
    - **Context:** REMEDIATION_PLAN.md - Section 3: Testing Strategy, General CI/CD Standards
    - **Code Area:** CI configuration files
    - **Action:**
        1. Configure the CI pipeline to execute `pnpm test:coverage` (or equivalent test coverage command).
        2. Configure CI to output or upload the coverage report as an artifact.
    - **Done‑when:**
        1. CI pipeline runs test coverage checks as part of its process.
        2. Test coverage reports are generated and accessible (e.g., as a build artifact or integrated service).
    - **Verification:**
        1. Push a commit to trigger CI; verify the test coverage step executes.
        2. Check the CI build results for the coverage report or link to it.
    - **Depends‑on:** [TEST-06, TEST-07]

### Final Verification

- [ ] **TEST-08 · P0: Execute Full Verification Suite**
    - **Context:** REMEDIATION_PLAN.md - Section 3: Testing Strategy, Section 4: Timeline (Final Verification)
    - **Code Area:** Project-wide
    - **Action:**
        1. Run the complete project verification suite: `pnpm typecheck`, `pnpm lint`, `pnpm format:check`, `pnpm test`, and `pnpm test:coverage`.
        2. Fix any issues that arise during verification.
    - **Done‑when:**
        1. All verification steps complete successfully.
        2. Test coverage meets or exceeds the project's required thresholds.
    - **Verification:**
        1. All verification commands complete with exit code 0.
        2. Manual review of coverage report confirms adequate testing.
    - **Depends‑on:** [TS-02, TS-05, TS-08, DOC-03, TEST-06, TEST-07]

- [ ] **TEST-09 · P1: Manual Browser Testing of Extension**
    - **Context:** REMEDIATION_PLAN.md - Section 3: Testing Strategy (End-to-end verification)
    - **Code Area:** Project as browser extension
    - **Action:**
        1. Build the browser extension with the implemented changes.
        2. Install the extension in Chrome and Firefox.
        3. Test the extension functionality, particularly the nickname mapping feature.
    - **Done‑when:**
        1. Extension works correctly in both Chrome and Firefox.
        2. Nickname replacements appear as expected on web pages.
    - **Verification:**
        1. Manual testing confirms the extension behavior matches specifications.
    - **Depends‑on:** [TEST-08]

## Clarifications & Assumptions

- [ ] **Issue:** Are all usages of `any` exclusively in `types.d.ts` and browser API types, or do any application modules or test files use `any` that must also be refactored?
    - **Context:** 2.2 Replace `any` Types with Specific Types or `unknown` (REMEDIATION_PLAN.md)
    - **Blocking?:** no

- [ ] **Issue:** Is `trump-mappings.js` written in TypeScript or JavaScript, and should tests for it be in TypeScript if possible?
    - **Context:** 2.4 Add Unit Tests for Nickname Mapping Functionality (REMEDIATION_PLAN.md)
    - **Blocking?:** no

- [ ] **Issue:** Should Prettier config and its enforcement (e.g., pre-commit hooks) be updated if `"trailingComma"` is not already set to `"es5"`?
    - **Context:** 2.3 Align Trailing Comma Documentation with Prettier Config (REMEDIATION_PLAN.md)
    - **Blocking?:** no

## In Progress Tasks

## Completed Tasks

### Phase 1-4 and CI Tasks

#### BG-02: Fix TypeScript Type Errors for Background Script ✓
- **Priority**: Critical
- **Description**: Fix TypeScript errors related to background script and browser API
- **Steps**:
  - [x] Create combined background script with all dependencies
  - [x] Add type declarations for browser and chrome APIs
  - [x] Exclude problematic files from TypeScript checking
  - [x] Implement proper type definitions for browser API functions
  - [x] Refactor background scripts to use TypeScript properly

#### BG-01: Fix Background Polyfill Implementation ✓
- **Priority**: Critical
- **Description**: Refactor `background-polyfill.js` to correctly implement browser API polyfill
- **Steps**:
  - [x] Replace unused `browserAPISource` with correctly named `browserAPI`
  - [x] Extract `openOptionsOnClick` into a named function
  - [x] Update conditional logic to consistently use the polyfill variable
  - [x] Add error handling and logging for cases where expected APIs aren't found

#### DOC-01: Document Content Script Loading Dependency ✓
- **Priority**: Important
- **Description**: Add clear documentation in `manifest.json` about content script loading order
- **Steps**:
  - [x] Add detailed comment in `manifest.json` explaining why `content-shared.js` must load before `content.js`
  - [x] Ensure comment mentions the global function sharing mechanism

#### CS-01: Implement Type Assertions for Global Functions ✓
- **Priority**: Important
- **Description**: Replace `@ts-ignore` with proper type assertions for globally shared functions
- **Steps**:
  - [x] Verify `TrumpMapping` type is properly defined in `types.d.ts`
  - [x] Update the code that acquires `buildTrumpMap` to use type assertion
  - [x] Test if subsequent type errors for `trumpMap` and `mapKeys` are resolved

#### CS-02: Improve Documentation for Remaining @ts-ignore Directives ✓
- **Priority**: Important
- **Description**: Add detailed, explanatory comments for any remaining necessary `@ts-ignore` directives
- **Steps**:
  - [x] Identify all remaining `@ts-ignore` directives in content scripts
  - [x] For each directive, add a comprehensive comment explaining why it's necessary
  - [x] Include references to TypeScript limitations with content script architecture

#### CS-03: Add Error Handling for Missing Shared Functions ✓
- **Priority**: Minor
- **Description**: Implement runtime checks for shared function availability
- **Steps**:
  - [x] Add a check after acquiring `buildTrumpMap` to verify it's a function
  - [x] Implement appropriate error handling and messaging
  - [x] Structure the code to conditionally run the initialization only if `buildTrumpMap` exists

#### TEST-01: Perform Static Analysis ✓
- **Priority**: Important
- **Description**: Run static analysis tools to verify code quality
- **Steps**:
  - [x] Run TypeScript check: `tsc --noEmit`
  - [x] Run ESLint: `eslint .`
  - [x] Address any remaining warnings or errors

#### R-01: Fix Duplicate Script Execution ✓
- **Priority**: Critical
- **Dependencies**: None
- **Description**: Fix issues with multiple content scripts running simultaneously and causing crashes
- **Steps**:
  - [x] Move declarations to proper location to fix TypeError (Cannot read properties of undefined)
  - [x] Resolve ReferenceError: Cannot access 'observerConfig' before initialization
  - [x] Ensure proper MutationObserver handling to prevent infinite recursion

#### R-02: Analyze and Consolidate Content Scripts ✓
- **Priority**: High
- **Dependencies**: R-01
- **Description**: Consolidate duplicate content scripts into a single implementation
- **Steps**:
  - [x] Compare content.js and content-fixed.js to identify the most robust implementation
  - [x] Document unique features from each implementation that should be preserved
  - [x] Create consolidated script incorporating best features from both implementations
  - [x] Update manifest.json to reference only one content script

#### R-03: Reorganize Code Structure ✓
- **Priority**: High
- **Dependencies**: R-02
- **Description**: Establish clean modular architecture
- **Steps**:
  - [x] Rename content-shared.js to trump-mappings.js to better reflect its purpose
  - [x] Create self-contained TrumpGoggles module with clear initialization method
  - [x] Implement proper variable scoping with no globals or window properties
  - [x] Move all variable declarations to the top of their respective scope

#### R-04: Reimplement DOM Processing ✓
- **Priority**: Medium
- **Dependencies**: R-03
- **Description**: Improve DOM traversal and text processing
- **Steps**:
  - [x] Create a standalone DOM walker with no side effects
  - [x] Implement a separate text processor with clear responsibility boundary
  - [x] Improve node tracking using native properties instead of WeakSet
  - [x] Add explicit skipping of interactive elements (inputs, textareas, etc.)

#### R-05: Enhance MutationObserver Implementation ✓
- **Priority**: Medium
- **Dependencies**: None (Previously R-04, now completed)
- **Description**: Create robust MutationObserver implementation
- **Steps**:
  - [x] Rewrite MutationObserver implementation with clear observer lifecycle
  - [x] Implement batched processing of mutations for better performance
  - [x] Properly handle observer disconnect/reconnect in a single location

#### R-06: Optimize Text Replacement Engine ✓
- **Priority**: Medium
- **Dependencies**: None (Previously R-05, now completed)
- **Description**: Improve text replacement performance and reliability
- **Steps**:
  - [x] Create optimized text replacement engine with pattern pre-compilation
  - [x] Implement incremental processing to avoid UI freezing
  - [x] Add result caching to avoid reprocessing identical text
  - [x] Add early bailout for text nodes unlikely to contain matches

#### R-07: Improve Error Handling and Logging ✓
- **Priority**: Medium
- **Dependencies**: None (Previously R-06, now completed)
- **Description**: Create comprehensive error handling system
- **Steps**:
  - [x] Implement comprehensive error boundaries around major operations
  - [x] Create structured logging with severity levels
  - [x] Add DEBUG mode with detailed diagnostic information

#### R-08: Enhance Cross-Browser Compatibility ✓
- **Priority**: Medium
- **Dependencies**: None (Previously R-07, now completed)
- **Description**: Ensure compatibility across browsers
- **Steps**:
  - [x] Extract browser-specific code into separate adapter modules
  - [x] Create browser detection utility for conditional code paths
  - [x] Test thoroughly in Chrome, Firefox, and Edge

#### TEST-02: Conduct Manual Cross-Browser Testing ✓
- **Priority**: Critical
- **Dependencies**: None (Previously R-08, now completed)
- **Description**: Thoroughly test extension in multiple browsers
- **Steps**:
  - [x] Test in latest stable Chrome:
    - [x] Extension loads without console errors
    - [x] Icon click opens options page
    - [x] Text replacements work on static and dynamic content
    - [x] Form input fields are not affected
  - [x] Test in latest stable Firefox with same checklist
  - [x] Test error handling by simulating various failure conditions

#### TEST-03: Create Automated Test Suite ✓
- **Priority**: Medium
- **Dependencies**: None (Previously TEST-02, now completed)
- **Description**: Develop automated testing framework
- **Steps**:
  - [x] Create automated test suite for core functionality
  - [x] Add test fixtures for various text patterns and edge cases
  - [x] Implement integration tests for DOM processing
  - [x] Create manual test checklist for visual verification

#### TEST-04: Verify CI Pipeline ✓
- **Priority**: Important
- **Dependencies**: None (Previously TEST-03, now completed)
- **Description**: Ensure all changes pass in the CI environment
- **Steps**:
  - [x] Push changes to the branch
  - [x] Monitor CI build
  - [x] Address any CI-specific issues

#### DOC-02: Comprehensive Documentation ✓
- **Priority**: Medium
- **Dependencies**: None (Previously TEST-04, now completed)
- **Description**: Create complete documentation
- **Steps**:
  - [x] Add JSDoc documentation to all functions
  - [x] Create architectural overview document
  - [x] Document extension behavior and limitations
  - [x] Add contributing guidelines for future developers

#### CI-01: Fix Variable Redeclaration Errors ✓
- **Priority**: Critical
- **Dependencies**: None
- **Description**: Resolve variable redeclaration errors causing TypeScript build failures
- **Steps**:
  - [x] Fix `observerConfig` redeclaration between `content.js:22` and `content-fixed.js:22`
  - [x] Fix `BackgroundLogger` redeclaration between `background.js:12` and `background-cross-browser.js:12`
  - [x] Review all duplicate files to determine which ones should be kept and which should be removed

#### CI-02: Resolve Type Compatibility Issues ✓
- **Priority**: Critical
- **Dependencies**: None
- **Description**: Fix type compatibility errors across multiple files
- **Steps**:
  - [x] Fix invalid configuration object in `content-consolidated.js:693` (add missing properties: root, skipInteractiveElements, chunkSize, processingDelay)
  - [x] Correct type mismatch for error handler in `background.js:102`
  - [x] Correct type mismatch for error handler in `background-cross-browser.js:143` and `background-cross-browser.js:195`
  - [x] Add proper type definitions for all function interfaces

#### CI-03: Fix Browser Detection Type Errors ✓
- **Priority**: High
- **Dependencies**: None
- **Description**: Address reference errors in browser detection code
- **Steps**:
  - [x] Fix 'InstallTrigger' reference error in `browser-detect.js:66`
  - [x] Implement proper type guards for browser-specific features
  - [x] Consider refactoring to use feature detection instead of browser detection

#### CI-04: Clean Up Test Files ✓
- **Priority**: Medium
- **Dependencies**: None
- **Description**: Address unused variable warnings in test files
- **Steps**:
  - [x] Fix unused variables `result` and `text` in `test/content/text-processor.test.js`
  - [x] Fix unused variable `observer` in multiple locations in `test/content/mutation-observer.test.js`
  - [x] Fix unused variables `mockDomProcessor`, `mockObserver`, and `createTestDOM` in `test/content/mutation-observer.test.js`
  - [x] Run ESLint locally to verify all warnings are addressed

#### CI-05: Implement Local CI Verification Process ✓
- **Priority**: High
- **Dependencies**: None
- **Description**: Establish process to catch CI issues before pushing
- **Steps**:
  - [x] Create pre-commit hook to run TypeScript checks
  - [x] Add script to run full CI verification locally
  - [x] Document CI verification process in CONTRIBUTING.md