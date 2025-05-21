# T025 Implementation Plan: Address @ts-ignore comments in TypeScript files

## Background
The codebase contains several `@ts-ignore` comments in TypeScript files that are used to suppress TypeScript errors. These comments should be addressed by properly typing the code to ensure type safety and maintainability.

## Files to Modify

### Primary Focus: TypeScript Files
1. **tooltip-manager.ts**: Contains 7 `@ts-ignore` comments related to:
   - `document.querySelectorAll` type recognition
   - `performanceUtils.Configs` access in multiple locations

### Secondary Files (JavaScript with TypeScript checking)
These files also contain `@ts-ignore` comments but are not converted to TypeScript yet:
- browser-detect.js (6 occurrences)
- logger.js (7 occurrences)
- error-handler.js (6 occurrences)
- browser-adapter.js (3 occurrences)
- mutation-observer.js (7 occurrences)
- trump-mappings.js (1 occurrence)

## Analysis of `@ts-ignore` Comments in tooltip-manager.ts

1. **`document.querySelectorAll` issue (Line 167)**:
   ```typescript
   // @ts-ignore: TypeScript doesn't recognize that document.querySelectorAll is always available
   const describedElements = document.querySelectorAll(`[aria-describedby="${tooltipId}"]`);
   ```
   - **Issue**: TypeScript doesn't recognize that `document.querySelectorAll` is guaranteed to be available
   - **Solution**: Add a proper type guard or assertion to ensure TypeScript knows the method exists

2. **`performanceUtils.Configs` issues (Lines 203, 352, 425, 510, 519, 528)**:
   ```typescript
   // @ts-ignore: TypeScript doesn't recognize PerformanceUtilsInterface.Configs
   performanceUtils.Configs.input || { delay: 32 }
   ```
   - **Issue**: Missing interface definition for `Configs` in the `PerformanceUtilsInterface`
   - **Solution**: Update the `types.d.ts` file to include `Configs` in the `PerformanceUtilsInterface`

## Implementation Approach

1. **Update PerformanceUtilsInterface in types.d.ts**:
   - Add `Configs` property to the interface with proper typing for each configuration object
   - Define all the configuration options (scroll, input, keyboard, mutation)

2. **Fix document.querySelectorAll issue in tooltip-manager.ts**:
   - Add a proper type assertion or type guard to ensure TypeScript knows this method exists
   - Alternative: Update the DOM extensions in types.d.ts to include proper typing for querySelectorAll

3. **Test the changes**:
   - Ensure TypeScript compilation succeeds
   - Run tests to verify functionality

## Success Criteria
1. All `@ts-ignore` comments in tooltip-manager.ts are removed
2. TypeScript compilation succeeds without errors
3. Functionality remains unchanged
4. Tests continue to pass

## Steps to Implement
1. Update the PerformanceUtilsInterface in types.d.ts
2. Fix the document.querySelectorAll type issue in tooltip-manager.ts
3. Remove all @ts-ignore comments and verify compilation
4. Run tests to ensure functionality is preserved
5. Update TODO.md to mark task as completed