# T043: Fix TypeScript Errors in Test Files - Implementation Plan

## Task Summary

Fix TypeScript strict mode errors in test files that are blocking commits. The main issues involve type mismatches with globals, missing type definitions, implicit any types, and browser API type incompatibilities.

## Technical Approach

### 1. Install Missing Type Dependencies

- Install @types/jsdom to fix the immediate TypeScript error about missing jsdom types
- Verify other type dependencies match our runtime dependencies

### 2. Fix Global Type Declarations in test/types.d.ts

- Properly declare vitest globals (vi, describe, it, beforeEach, etc.)
- Create comprehensive chrome and browser namespace types
- Declare custom global test utilities
- Fix the vi type declaration to use Vitest's actual types

### 3. Update test/setup.ts

- Import vitest globals properly
- Fix type errors for mock implementations
- Properly type the localStorage mock
- Ensure global assignments have correct types

### 4. Update Mock Type Definitions

- Ensure test/mocks/\*.ts export types match their usage
- Fix mockReturnValue issues by using proper Vitest mock types
- Make sure browser API mocks match real API shapes

### 5. Fix Test File Imports

- Update test files to use proper TypeScript imports
- Ensure mock imports have correct types

## Implementation Steps

1. **Install Missing Dependencies**

   ```bash
   pnpm add -D @types/jsdom
   ```

2. **Update test/types.d.ts**

   - Import Vitest types properly
   - Declare comprehensive global types
   - Remove outdated vi declaration

3. **Update test/setup.ts**

   - Add proper import statements for vitest
   - Fix global type assignments
   - Type the mock implementations correctly

4. **Fix Mock Files**

   - Update export types in mocks/\*.ts
   - Ensure they export interfaces/types for their mock objects

5. **Update tsconfig.test.json**
   - Ensure it properly extends base config
   - Add necessary type roots

## Testing Strategy

1. Run `pnpm typecheck` to verify all type errors are resolved
2. Run `pnpm test` to ensure tests still pass after type fixes
3. Run pre-commit hooks to verify they pass without --no-verify
4. Test in both Chrome and Firefox mock environments

## Risk Mitigation

1. **Type Safety**: Ensure we don't use any `any` types as escape hatches
2. **Test Functionality**: Verify tests still work after type fixes
3. **Mock Accuracy**: Ensure mocks still accurately represent browser APIs
4. **Backward Compatibility**: Don't break existing test functionality

## Success Criteria

1. All TypeScript errors in test files are resolved
2. `pnpm typecheck` passes without errors
3. Pre-commit hooks pass without needing --no-verify
4. All existing tests continue to pass
5. No use of `any` types or `@ts-ignore` comments
