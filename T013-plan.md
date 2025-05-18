# T013 Plan: Refactor Tests to Import Actual Modules

## Overview
This task involves updating test files to import actual ES modules instead of using mock re-implementations. The goal is to test the real production code while maintaining the testing philosophy of avoiding internal mocking.

## Current State Analysis

### Test File Patterns
1. Tests are currently using mock implementations defined within test files
2. Mock implementations replicate the interface but not the actual implementation
3. Tests use JSDOM for DOM environment
4. Global mocks are set up in `test/setup.js`

### Module Structure  
- Production modules now use ES module exports (e.g., `export const TooltipUI`)
- Modules are TypeScript files with proper type definitions
- Each module exports a const object implementing an interface

### Affected Test Files
Primary files that need updating:
- `test/content/dom-modifier.test.js`
- `test/content/tooltip-ui.test.js`
- `test/content/tooltip-manager.test.js`
- `test/browser/tooltip-browser-adapter.test.js`
- `test/content/text-processor.test.js`
- `test/content/mutation-observer.test.js`
- Related integration tests

## Implementation Strategy

### 1. Test Environment Setup
- Update `vitest.config.js` to handle TypeScript ES modules
- Configure module resolution for `.ts` files
- Ensure proper aliasing/path mapping if needed

### 2. Module Import Pattern
Replace mock implementations with actual imports:
```javascript
// Before:
const TooltipUI = { /* mock implementation */ };

// After:
import { TooltipUI } from '../../tooltip-ui.ts';
```

### 3. Global Dependencies
Many modules rely on global objects (`window.Logger`, `window.PerformanceUtils`). These need to be properly mocked in test setup:
- Keep mocking external dependencies (Logger, PerformanceUtils) in setup
- Ensure globals are available before module imports

### 4. Test Adjustments
- Remove duplicate constant definitions
- Remove mock method implementations
- Adjust assertions to match actual behavior
- Handle any async behavior from real modules

### 5. File-by-File Approach

#### Phase 1: Core Modules
1. `dom-modifier.test.js` - Import from `dom-modifier.ts`
2. `tooltip-ui.test.js` - Import from `tooltip-ui.ts`
3. `tooltip-manager.test.js` - Import from `tooltip-manager.ts`
4. `tooltip-browser-adapter.test.js` - Import from `tooltip-browser-adapter.ts`

#### Phase 2: Utility Modules
5. `text-processor.test.js` - Import from `text-processor.js`
6. `mutation-observer.test.js` - Import from `mutation-observer.js`

#### Phase 3: Integration Tests
7. Update integration tests to use real modules
8. Verify end-to-end functionality

## Risk Mitigation

### Potential Issues
1. Module load order - globals must be set before imports
2. TypeScript compilation in tests
3. Circular dependencies
4. Different behavior between mock and real implementations

### Solutions
1. Use dynamic imports where necessary
2. Configure vitest to handle TypeScript
3. Refactor any circular dependencies found
4. Add transitional tests comparing mock vs real behavior

## Validation Steps

1. Run each test file individually after changes
2. Verify test coverage remains the same or improves
3. Check for any failing tests that reveal bugs in production code
4. Run full test suite
5. Verify CI pipeline passes

## Success Criteria

1. All tests import actual ES modules
2. No mock re-implementations remain in test files
3. Test coverage maintained or improved
4. All tests pass
5. CI pipeline green