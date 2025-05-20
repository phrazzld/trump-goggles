# T021: Remove unused ElementCache and DOMBatch from performance-utils

## Analysis

The task is to remove the unused `ElementCache` and `DOMBatch` utilities from `performance-utils.ts`. 

These utilities were designed to improve performance but are not being used in the actual application code:
- `ElementCache`: A caching mechanism to avoid repeated DOM queries
- `DOMBatch`: A batching utility to minimize layout thrashing by grouping DOM reads and writes

A grep search confirms neither utility is being used in the application code, only in tests where they are mocked.

## Implementation Plan

1. Remove the `ElementCache` implementation (lines 172-240 in performance-utils.ts)
2. Remove the `DOMBatch` implementation (lines 246-319 in performance-utils.ts)
3. Remove exports of these utilities from the `PerformanceUtils` object (lines 349-350)
4. Update the `performance-utils.d.ts` type declaration file to remove these interfaces (lines 27-42)
5. Confirm that all tests still pass despite the removal

## Verification Strategy

- Run the test suite to verify that the removal of unused code doesn't break existing functionality
- Check for any TypeScript errors that might arise from removing the types

## Expected Outcome

- Reduced code size and complexity in the `performance-utils.ts` module
- Simpler type definitions in `performance-utils.d.ts`
- All tests continue to pass with the mock implementations