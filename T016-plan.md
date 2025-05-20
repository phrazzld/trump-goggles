# T016 Plan: Replace Console Logging with Structured Logger in New Modules

## Task Definition
- **Task ID:** T016
- **Title:** Replace console logging with structured Logger in new modules
- **Context:** PLAN.md, CR-05, Step 1-4

## Implementation Approach

The task requires replacing all direct console.* logging calls in the five newly converted modules with structured logging via the window.Logger interface. This will improve log consistency, enable better filtering, and support production debugging.

### Modules to Update
1. dom-modifier.ts
2. tooltip-ui.ts
3. tooltip-manager.ts
4. tooltip-browser-adapter.ts
5. performance-utils.ts

### Implementation Steps

1. **Research and Understand Logging Requirements**
   - Examine window.Logger interface to understand available methods and levels
   - Identify appropriate severity levels for different log types
   - Review current logging architecture

2. **Audit Current Console Usage**
   - Identify all console.log, console.warn, console.error, and console.debug calls in the five modules
   - Map each console call to an appropriate Logger method based on severity

3. **Replace Console Calls**
   - Replace all console.log calls with window.Logger.info or window.Logger.debug as appropriate
   - Replace all console.warn calls with window.Logger.warn
   - Replace all console.error calls with window.Logger.error
   - Ensure proper checks for logger existence before calling methods
   - Add appropriate context to each log for better debugging

4. **Add Fallback for Testing Environment**
   - Ensure logs work in test environments where window.Logger may not be available
   - Add null checks and fallbacks to prevent runtime errors

5. **Test Changes**
   - Run the test suite to ensure no logging-related errors
   - Manually verify logging works properly in the browser

### Logging Level Guidelines
- **DEBUG**: Verbose information useful during development
- **INFO**: General operational information
- **WARN**: Non-critical issues that might need attention
- **ERROR**: Failures and exceptions that affect functionality

### Example Implementation
```typescript
// Before
console.log("Processing element:", element);

// After
if (window.Logger && typeof window.Logger.info === 'function') {
  window.Logger.info("Processing element", { elementType: element.tagName });
} else {
  // Fallback for testing environments
  console.log("Processing element:", element);
}
```