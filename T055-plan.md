# T055 Implementation Plan: Enable Strict TypeScript Checking for Test Files

## Overview

Enable strict TypeScript checking for all test files by fixing type violations and improving mock type safety while maintaining all existing test functionality.

## Implementation Steps

### Phase 1: Fix Type Export Issues (Low Risk)

**Files:** `test/types/dom.ts`, affected test files

1. **Export DOMWindow properly** from `test/types/dom.ts`
   - Add: `export type { DOMWindow } from 'jsdom';`
   - Keep existing `JSDOMWindow` export for compatibility
2. **Update import statements** in test files that import `DOMWindow`
   - Replace problematic imports with correct exports
   - Files: `test/content/content.test.ts`, `test/content/mutation-observer.test.ts`, etc.

### Phase 2: Fix Missing Mock Properties (Medium Risk)

**Files:** `test/mocks/browser-detect.mock.ts`, `test/browser/browser-detect.test.ts`

1. **Add missing FEATURES properties** to browser-detect mock
   - Add `FETCH: 'fetch'` and `WEB_COMPONENTS: 'webComponents'` to FEATURES object
2. **Update mock implementation** to handle new features
   - Ensure `hasFeature` mock supports new properties
   - Update feature support functions

### Phase 3: Fix Unused Variables/Types (Low Risk)

**Files:** Multiple test files with unused imports

1. **Remove genuinely unused imports**
   - `BrowserType`, `ManifestVersion` from browser-detect test
   - `MockedFunction` from browser-adapter test (if truly unused)
   - Various unused test fixtures
2. **Mark intentionally unused variables** with underscore prefix
   - Function parameters that are required but unused (e.g., `_observer`)

### Phase 4: Fix Mock Type Assertions (High Risk)

**Files:** `test/content/tooltip-manager-simplified.test.ts`, other files with mock casting

1. **Improve MockedTooltipUI interface** to properly match actual TooltipUI
   - Update interface to include all required Mock properties
   - Use proper Vitest mock typing: `MockedFunction<() => void>`
2. **Fix type assertions** throughout test files
   - Replace unsafe casts with proper typing
   - Use `vi.mocked()` helper where appropriate
3. **Fix global variable conflicts**
   - Resolve Logger/PerformanceUtils redeclaration issues
   - Use proper module augmentation or scoped declarations

### Phase 5: Fix Vitest Mock Typing Issues (Medium Risk)

**Files:** Multiple test files with mock functions

1. **Update mock function signatures** to use proper generics
   - Fix `vi.fn<[Args], Return>()` usage
   - Ensure mock return types match expected interfaces
2. **Fix generic type argument issues**
   - Resolve `Expected 0-1 type arguments, but got 2` errors
   - Update to current Vitest typing patterns

### Phase 6: Enable Strict Mode (Final)

**File:** `tsconfig.test.json`

1. **Update configuration** to enable strict checking
   - Set `"strict": true`
   - Enable all related strict mode flags
   - Remove temporary relaxed settings
2. **Final validation** that all tests pass

## Test Strategy

- **Incremental Testing**: Run tests after each phase to catch issues early
- **Targeted TypeScript Checking**: Use `npx tsc --noEmit --project tsconfig.test.json` to verify progress
- **Full Test Suite**: Ensure all 257 tests continue to pass throughout

## Risk Mitigation

- **Small Batches**: Implement changes in small, testable increments
- **Rollback Plan**: Each phase can be reverted independently if issues arise
- **Mock Preservation**: Maintain existing mock behavior while improving type safety
- **Test Behavior**: Preserve all existing test assertions and expectations

## Success Criteria

- [ ] All TypeScript strict mode violations resolved
- [ ] `tsconfig.test.json` has strict mode enabled
- [ ] All 257 tests continue to pass
- [ ] No TypeScript errors in test files
- [ ] Mock objects properly typed with Vitest interfaces
- [ ] Code follows DEVELOPMENT_PHILOSOPHY_APPENDIX_TYPESCRIPT.md standards

## Expected File Changes

- `test/types/dom.ts` - Add DOMWindow export
- `test/mocks/browser-detect.mock.ts` - Add missing FEATURES
- `tsconfig.test.json` - Enable strict mode
- `test/content/tooltip-manager-simplified.test.ts` - Fix mock assertions
- Multiple test files - Remove unused imports, fix mock typing
- Various integration test files - Fix global variable conflicts

## Implementation Notes

- Follow TypeScript appendix requirement for strict mode (`"strict": true`)
- Use explicit typing throughout (no `any` types)
- Leverage Vitest mock utilities properly (`vi.mocked`, `MockedFunction`)
- Maintain test readability while improving type safety
