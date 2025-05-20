# T048 Plan: Resolve Remaining TypeScript Errors

## Analysis

After reviewing the code, I've identified several TypeScript errors that need to be fixed:

1. In `test/browser/tooltip-browser-adapter.test.js`, the `MockElement` class claims to implement `HTMLElement` but doesn't match the interface requirements. The JSDoc comment `@implements {HTMLElement}` is causing TypeScript to check that the class implements all HTMLElement methods and properties, which it doesn't.

2. Performance-related code in `test/manual/performance-test-runner.js` uses a type that doesn't exist in the standard TypeScript DOM lib (`performance.memory`).

3. Several test mock objects need improved type annotations to match expected interfaces.

## Implementation Plan

### 1. Fix tooltip-browser-adapter.test.js

- Replace `@implements {HTMLElement}` with a more accurate description since MockElement is only a partial mock
- Add proper type annotations for window and document mocks
- Fix type casting or type declarations for functions and parameters

### 2. Fix performance-test-runner.js

- Add custom type declaration for the non-standard `performance.memory` API
- Add proper TypeScript ignore comments where appropriate, with explanations
- Improve type safety in event handling and DOM manipulation code

### 3. Fix HTMLElement interface implementation errors

- Create proper interface declarations for mock elements that don't need to implement the full HTMLElement interface
- Use partial interface implementations where appropriate
- Improve JSDoc annotations for mock objects

### 4. General improvements

- Add JSDoc type annotations to improve TypeScript type checking in JavaScript files
- Fix any other type errors found during implementation
- Ensure all changes maintain test functionality

## Expected Outcome

After implementation:
- TypeScript will compile without errors
- All tests will continue to pass
- Pre-commit hooks will succeed without the --no-verify flag
- The code will be more type-safe and better documented