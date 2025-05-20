# T047 Implementation Plan: Fix window object type errors in tooltip-ui.ts

## Problem Analysis

The issue is that TypeScript is showing errors for accessing global properties on the `window` object, specifically:
- `window.Logger`
- `window.TooltipBrowserAdapter`

These properties are defined in the global types.d.ts file, but TypeScript is not recognizing them correctly in tooltip-ui.ts. Currently, there's a `@ts-ignore` comment at the top of the file to suppress these errors, but this solution isn't ideal.

## Current State

1. The tooltip-ui.ts file uses `window.Logger` and `window.TooltipBrowserAdapter` throughout the code.
2. A `@ts-ignore` directive is used at the top of the file to suppress TypeScript errors.
3. The types for these objects are correctly defined in types.d.ts:
   - `LoggerInterface` for `window.Logger`
   - `TooltipBrowserAdapterInterface` for `window.TooltipBrowserAdapter`
4. Other TypeScript files (like dom-modifier.ts) have successfully addressed this issue.

## Solution Approach

1. **Add Reference Path**: Add a TypeScript reference directive at the top of the file to point to types.d.ts
2. **Remove @ts-ignore**: Remove the existing @ts-ignore comment
3. **Use Consistent Checks**: Ensure all checks for `window.Logger` and `window.TooltipBrowserAdapter` are consistent
4. **Verify Types**: Ensure the code properly respects the typing of the interfaces

## Implementation Steps

1. Add `/// <reference path="./types.d.ts" />` at the top of tooltip-ui.ts
2. Remove the existing @ts-ignore comment
3. Run TypeScript compiler to check for any remaining type issues
4. Address any further type issues that might arise
5. Ensure the implementation follows the patterns used in dom-modifier.ts and other files
6. Run tests to verify the changes don't affect functionality

## Expected Outcome

1. tooltip-ui.ts passes TypeScript type checking without errors
2. No @ts-ignore comments are needed
3. The code remains functionally identical
4. Type safety is improved throughout the file