# Todo

## ES Module Conversion

- [x] **T001 · Refactor · P0: convert dom-modifier.js to ES Module**

  - **Context:** PLAN.md, CR-01, Step 1 (dom-modifier.js)
  - **Action:**
    1. Modify `dom-modifier.js` to use ES Module `export` for its public API.
    2. Remove IIFE wrapper and any global namespace pollution from this file.
  - **Done‑when:**
    1. `dom-modifier.js` uses ES Module syntax.
    2. The module's exports are available for import.
  - **Depends‑on:** none

- [x] **T002 · Refactor · P0: convert tooltip-ui.js to ES Module**

  - **Context:** PLAN.md, CR-01, Step 1 (tooltip-ui.js)
  - **Action:**
    1. Modify `tooltip-ui.js` to use ES Module `export` for its public API.
    2. Remove IIFE wrapper and any global namespace pollution from this file.
  - **Done‑when:**
    1. `tooltip-ui.js` uses ES Module syntax.
    2. The module's exports are available for import.
  - **Depends‑on:** none

- [x] **T003 · Refactor · P0: convert tooltip-manager.js to ES Module**

  - **Context:** PLAN.md, CR-01, Step 1 (tooltip-manager.js)
  - **Action:**
    1. Modify `tooltip-manager.js` to use ES Module `export` for its public API.
    2. Remove IIFE wrapper and any global namespace pollution from this file.
  - **Done‑when:**
    1. `tooltip-manager.js` uses ES Module syntax.
    2. The module's exports are available for import.
  - **Depends‑on:** none

- [x] **T004 · Refactor · P0: convert tooltip-browser-adapter.js to ES Module**

  - **Context:** PLAN.md, CR-01, Step 1 (tooltip-browser-adapter.js)
  - **Action:**
    1. Modify `tooltip-browser-adapter.js` to use ES Module `export` for its public API.
    2. Remove IIFE wrapper and any global namespace pollution from this file.
  - **Done‑when:**
    1. `tooltip-browser-adapter.js` uses ES Module syntax.
    2. The module's exports are available for import.
  - **Depends‑on:** none

- [x] **T005 · Refactor · P0: convert performance-utils.js to ES Module**

  - **Context:** PLAN.md, CR-01, Step 1 (performance-utils.js)
  - **Action:**
    1. Modify `performance-utils.js` to use ES Module `export` for its public API.
    2. Remove IIFE wrapper and any global namespace pollution from this file.
  - **Done‑when:**
    1. `performance-utils.js` uses ES Module syntax.
    2. The module's exports are available for import.
  - **Depends‑on:** none

- [x] **T006 · Refactor · P0: update content-consolidated.js to import new ES Modules**
  - **Context:** PLAN.md, CR-01, Step 2
  - **Action:**
    1. Modify `content-consolidated.js` to use `import` statements for `dom-modifier`, `tooltip-ui`, `tooltip-manager`, `tooltip-browser-adapter`, and `performance-utils`.
    2. Remove any old global variable access patterns for these modules.
  - **Done‑when:**
    1. `content-consolidated.js` successfully imports the new ES Modules.
    2. The script initializes correctly using the imported modules.
  - **Depends‑on:** [T001, T002, T003, T004, T005]

## TypeScript Foundation & Build Configuration

- [x] **T007 · Chore · P0: configure bundler (webpack/rollup) for ES Module browser extension build**

  - **Context:** PLAN.md, CR-01, Step 3
  - **Action:**
    1. Select and configure a bundler (webpack or rollup) to process the new ES Modules.
    2. Ensure the bundler output is compatible with the browser extension environment (e.g., content scripts).
  - **Done‑when:**
    1. Bundler successfully processes ES Module imports/exports and generates an output bundle.
    2. Build process is documented for development and production.
  - **Depends‑on:** [T001, T002, T003, T004, T005]

- [x] **T008 · Chore · P0: update manifest files to use bundled output**

  - **Context:** PLAN.md, CR-01, Step 4
  - **Action:**
    1. Modify browser extension manifest files (e.g., `manifest.json`) to reference the new bundled output file(s) from T007.
    2. Remove references to individual or old bundled scripts.
  - **Done‑when:**
    1. Extension manifest correctly points to the new bundled script(s).
    2. Extension loads the bundled script(s) in the browser.
  - **Verification:**
    1. Load the extension unpacked in a browser; verify core functionality initializes.
  - **Depends‑on:** [T007]

- [x] **T009 · Refactor · P0: rename new module .js files to .ts**

  - **Context:** PLAN.md, CR-02, Step 1
  - **Action:**
    1. Rename `dom-modifier.js` to `dom-modifier.ts`.
    2. Rename `tooltip-ui.js` to `tooltip-ui.ts`.
    3. Rename `tooltip-manager.js` to `tooltip-manager.ts`.
    4. Rename `tooltip-browser-adapter.js` to `tooltip-browser-adapter.ts`.
    5. Rename `performance-utils.js` to `performance-utils.ts`.
  - **Done‑when:**
    1. All five specified module files have the `.ts` extension.
    2. Import paths in `content-consolidated.js` (T006) and other places are updated if necessary.
  - **Depends‑on:** [T001, T002, T003, T004, T005, T006]

- [x] **T010 · Refactor · P0: add explicit TypeScript type annotations to new modules**

  - **Context:** PLAN.md, CR-02, Step 2
  - **Action:**
    1. Add explicit type annotations to all functions, parameters, and return types in the newly converted TypeScript modules.
    2. Use interfaces from `types.d.ts` where appropriate.
  - **Done‑when:**
    1. Each module has complete type coverage with no implicit `any` types.
    2. TypeScript compiler runs without type errors.
  - **Depends‑on:** [T009]

- [x] **T011 · Chore · P0: configure TypeScript for strict mode in tsconfig.json**

  - **Context:** PLAN.md, CR-02, Step 4
  - **Action:**
    1. Update or create `tsconfig.json` with `strict: true` setting.
    2. Configure appropriate module resolution and target settings for browser extension environment.
  - **Done‑when:**
    1. `tsconfig.json` has strict mode enabled.
    2. TypeScript compilation succeeds for all modules.
  - **Depends‑on:** [T009]

- [x] **T012 · Chore · P0: update build process to handle TypeScript compilation**
  - **Context:** PLAN.md, CR-02, Step 5
  - **Action:**
    1. Update the bundler configuration from T007 to handle TypeScript files.
    2. Ensure TypeScript compilation is integrated into the build pipeline.
  - **Done‑when:**
    1. Build process successfully compiles TypeScript files.
    2. Generated output is functionally equivalent to pre-TypeScript version.
  - **Depends‑on:** [T007, T011]

## TypeScript Strict Mode Fixes

- [x] **T041 · Fix · P1: fix missing return values in performance-utils.ts**

  - **Context:** TypeScript strict mode errors detected after T011
  - **Action:**
    1. Fix `error TS7030: Not all code paths return a value` at line 28
    2. Fix `error TS7030: Not all code paths return a value` at line 70
  - **Done‑when:**
    1. All code paths in affected functions return appropriate values
    2. TypeScript compiler no longer reports TS7030 errors for this file
  - **Depends‑on:** [T011]

- [x] **T042 · Fix · P2: remove unused declarations in tooltip-browser-adapter.ts**

  - **Context:** TypeScript strict mode errors detected after T011
  - **Action:**
    1. Remove or use unused `VisibilityEvent` interface at line 41
    2. Remove or use unused `tooltipId` parameter at line 305
    3. Remove or use unused `showCallback` parameter at line 306
  - **Done‑when:**
    1. No TS6196 or TS6133 errors remain in this file
    2. All parameters and declarations are either used or removed
  - **Depends‑on:** [T011]

## Test Infrastructure Updates

- [x] **T013 · Test · P0: refactor tests to import actual modules instead of re-implementations**

  - **Context:** PLAN.md, CR-03, Step 1-2
  - **Action:**
    1. Update all test files to import the actual ES Modules.
    2. Remove mock/re-implemented versions of modules from within test files.
  - **Done‑when:**
    1. Tests import and test actual production code.
    2. No module re-implementations remain in test files.
  - **Depends‑on:** [T006]

- [x] **T014 · Test · P0: update test setup to handle ES Modules and TypeScript**
  - **Context:** PLAN.md, CR-03, Step 3
  - **Action:**
    1. Configure test runner to handle ES Module imports.
    2. Ensure test runner can process TypeScript files if needed.
  - **Done‑when:**
    1. Tests run successfully with ES Module imports.
    2. Test coverage remains equivalent or better.
  - **Depends‑on:** [T013]

## TypeScript Error Fixes

- [x] **T043 · Fix · P0: fix TypeScript errors in test files**

  - **Context:** TypeScript strict mode errors in test files blocking commits
  - **Action:**
    1. Fix type errors in test/setup.ts (globals, imports, vitest types)
    2. Add proper type definitions for test utilities
    3. Fix mock implementations to match expected interfaces
  - **Done‑when:**
    1. All test files pass TypeScript type checking
    2. Pre-commit hooks pass without --no-verify
  - **Depends‑on:** [T014]

- [x] **T044 · Fix · P0: add missing type definitions for dependencies**

  - **Context:** Missing type definitions for jsdom and other test dependencies
  - **Action:**
    1. Install @types/jsdom type definitions
    2. Add any other missing type definitions
    3. Update tsconfig to properly include test types
  - **Done‑when:**
    1. No missing type definition errors
    2. All imports have proper types
  - **Depends‑on:** [T014]

- [x] **T045 · Fix · P1: fix TypeScript errors in production code**

  - **Context:** TypeScript errors in scripts and other production code
  - **Action:**
    1. Fix implicit any types in check-package-manager.js
    2. Address type errors in other JavaScript files
    3. Add proper type annotations where needed
  - **Done‑when:**
    1. All production code passes TypeScript checks
    2. No implicit any errors
  - **Depends‑on:** [T011]

- [x] **T046 · Fix · P0: fix TypeScript errors in JavaScript test files**

- [x] **T047 · Fix · P2: fix window object type errors in tooltip-ui.ts**

  - **Context:** TypeScript errors related to window object access for globals
  - **Action:**
    1. Address type errors in tooltip-ui.ts related to window.Logger and window.TooltipBrowserAdapter
    2. Fix the type checking approach without suppressing errors
    3. Create a proper solution that works with the project's types.d.ts
  - **Done‑when:**
    1. tooltip-ui.ts passes TypeScript type checking
    2. No TS2339 property does not exist errors
    3. No need for ts-ignore comments
  - **Depends‑on:** [T015]

  - **Context:** TypeScript errors in JavaScript test files (.js) when checkJs is enabled
  - **Action:**
    1. Add JSDoc type annotations to test files
    2. Fix implicit any errors in test functions
    3. Address type mismatches in test mocks
  - **Done‑when:**
    1. All JS test files pass TypeScript checking
    2. No implicit any errors in test files
  - **Depends‑on:** [T043]

## High Priority Fixes

- [x] **T015 · Fix · P0: modify TooltipUI to use TooltipBrowserAdapter for styling**

  - **Context:** PLAN.md, CR-04, Step 1-3
  - **Action:**
    1. Update `applyTooltipStyles` to delegate to browser adapter.
    2. Update `addAccessibilityStyles` to use adapter methods.
    3. Remove hardcoded styles from TooltipUI.
  - **Done‑when:**
    1. TooltipUI delegates styling responsibilities to TooltipBrowserAdapter.
    2. Proper separation of concerns is maintained.
  - **Depends‑on:** [T002, T004]

- [x] **T016 · Fix · P0: replace console logging with structured Logger in new modules**

  - **Context:** PLAN.md, CR-05, Step 1-4
  - **Action:**
    1. Review all `console.*` calls in the five new modules.
    2. Replace with appropriate `window.Logger` calls.
    3. Use correct severity levels (DEBUG, INFO, WARN, ERROR).
  - **Done‑when:**
    1. No direct console logging remains in production code.
    2. All logging uses the structured Logger system.
  - **Depends‑on:** [T001, T002, T003, T004, T005]

- [x] **T017 · Fix · P1: fix event handler removal in TooltipManager**

  - **Context:** PLAN.md, CR-06, Step 1-3
  - **Action:**
    1. Store exact function references used with addEventListener.
    2. Use stored references for removeEventListener.
    3. Handle throttled and bound functions correctly.
  - **Done‑when:**
    1. Event listeners are properly cleaned up on dispose.
    2. No memory leaks from retained event handlers.
  - **Verification:**
    1. Add tests for proper cleanup.
  - **Depends‑on:** [T003]

- [x] **T018 · Fix · P1: remove ineffective element caching from TooltipManager**

  - **Context:** PLAN.md, CR-07, Step 1-2
  - **Action:**
    1. Remove `elementCache` from TooltipManager.
    2. Simplify the code by removing unused caching logic.
  - **Done‑when:**
    1. No element caching remains in TooltipManager.
    2. Code is simplified and tests pass.
  - **Depends‑on:** [T003]

- [x] **T019 · Fix · P1: set production logging level to INFO**
  - **Context:** PLAN.md, CR-08, Step 1
  - **Action:**
    1. Change `minLevel` to `window.Logger.LEVELS.INFO` in production mode in `content-consolidated.js`.
  - **Done‑when:**
    1. INFO level logs are visible in production.
    2. Operational logs provide useful diagnostics.
  - **Depends‑on:** none

## Medium Priority Improvements

- [x] **T020 · Fix · P2: review and secure originalText handling for XSS**

  - **Context:** PLAN.md, CR-09, Step 1-4
  - **Action:**
    1. Audit how `originalText` is sourced and used.
    2. Ensure textContent (not innerHTML) is used for display.
    3. Add sanitization for log output if needed.
  - **Done‑when:**
    1. No XSS vulnerabilities exist in originalText handling.
    2. Security considerations are documented.
  - **Depends‑on:** [T001]

- [x] **T021 · Refactor · P2: remove unused ElementCache and DOMBatch from performance-utils**

  - **Context:** PLAN.md, CR-10, Step 1-3
  - **Action:**
    1. Delete ElementCache and DOMBatch from performance-utils.
    2. Update type definitions to remove these unused utilities.
  - **Done‑when:**
    1. No dead code remains in performance-utils.
    2. Type definitions are updated accordingly.
  - **Depends‑on:** [T005]

- [x] **T022 · Fix · P2: standardize on data-tg-processed for marking processed elements**

  - **Context:** PLAN.md, CR-11, Step 1-3
  - **Action:**
    1. Use `data-tg-processed="true"` consistently.
    2. Update DOMModifier and mutation observer logic.
    3. Remove `_trumpGogglesProcessed` property.
  - **Done‑when:**
    1. Single consistent method for marking processed elements.
    2. Tests verify the new marking approach.
  - **Depends‑on:** [T001]

- [x] **T023 · Fix · P2: store cleanup function as private variable in TooltipManager**
  - **Context:** PLAN.md, CR-12, Step 1-3
  - **Action:**
    1. Store cleanup function as private module variable.
    2. Remove from global window object.
    3. Update dispose method to use private variable.
  - **Done‑when:**
    1. No global pollution from cleanup function.
    2. Cleanup function is properly scoped.
  - **Depends‑on:** [T003]

## Low Priority Cleanup

- [x] **T048 · Fix · P1: resolve remaining TypeScript errors**

  - **Context:** Pre-existing TypeScript errors in test files after T043-T047
  - **Action:**
    1. Fix TypeScript errors in test/browser/tooltip-browser-adapter.test.js
    2. Fix errors related to test mocks implementing HTMLElement interface
    3. Fix test/manual/performance-test-runner.js TypeScript errors
  - **Done‑when:**
    1. Key TypeScript errors in tooltip-browser-adapter.test.js and performance-test-runner.js are fixed
    2. Test files run successfully
  - **Depends‑on:** none

- [ ] **T049 · Fix · P1: fix all remaining TypeScript errors**

  - **Context:** Additional TypeScript errors still exist after T048
  - **Action:**
    1. Fix interface compatibility issues in browser-detect.js, error-handler.js, and logger.js
    2. Fix import path issues with .ts extensions
    3. Fix implicit any types in test files
    4. Fix remaining type errors in performance-test-runner.js
  - **Done‑when:**
    1. All TypeScript errors are resolved
    2. Pre-commit hooks pass without --no-verify
  - **Depends‑on:** [T048]

- [ ] **T024 · Cleanup · P3: remove Clinton/Hillary specific debug logs**

  - **Context:** PLAN.md, CR-13
  - **Action:**
    1. Remove overly specific debug logging for "Clinton/Hillary" terms.
    2. Implement generic debug flag if pattern-specific logging is needed.
  - **Done‑when:**
    1. No specific debug logs remain for particular terms.
    2. Debug logging is generalized if needed.
  - **Depends‑on:** none

- [ ] **T025 · Cleanup · P3: address @ts-ignore comments in TypeScript files**

  - **Context:** PLAN.md, CR-14
  - **Action:**
    1. Review all `@ts-ignore` comments in newly converted TypeScript files.
    2. Address underlying type issues to eliminate suppressions.
  - **Done‑when:**
    1. Minimal or no `@ts-ignore` comments remain.
    2. Type issues are properly resolved.
  - **Depends‑on:** [T010]

- [ ] **T026 · Docs · P3: restore AUTHORS.md file**

  - **Context:** PLAN.md, CR-15
  - **Action:**
    1. Restore the deleted `AUTHORS.md` file.
    2. Update with current contributors if needed.
  - **Done‑when:**
    1. AUTHORS.md exists in the repository.
    2. Content is up to date.
  - **Depends‑on:** none

- [ ] **T027 · Docs · P3: restore cross-browser-compatibility-report.md file**

  - **Context:** PLAN.md, CR-16
  - **Action:**
    1. Restore the deleted `cross-browser-compatibility-report.md` file.
    2. Update with TooltipBrowserAdapter considerations if relevant.
  - **Done‑when:**
    1. Report file exists in the repository.
    2. Content reflects current cross-browser approach.
  - **Depends‑on:** none

- [ ] **T028 · Fix · P3: add newline to end of PLAN.md**

  - **Context:** PLAN.md, CR-17
  - **Action:**
    1. Add a newline character to the end of `PLAN.md`.
  - **Done‑when:**
    1. PLAN.md ends with a newline character.
  - **Depends‑on:** none

- [ ] **T029 · Fix · P0: fix TypeScript errors in tooltip-browser-adapter.js**
  - **Context:** TypeScript errors blocking CI pipeline
  - **Action:**
    1. Fix 'testElement.style' possibly undefined errors in tooltip-browser-adapter.js.
    2. Ensure proper type safety for DOM element operations.
  - **Done‑when:**
    1. tooltip-browser-adapter.js passes TypeScript type checking.
    2. Pre-commit hooks pass successfully.
  - **Depends‑on:** none
