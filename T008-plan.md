# T008 Plan: Implement Automatic Caller Function Name Detection

## Task Classification

**Simple** - Single method implementation with stack trace parsing

## Objective

Implement logic within `StructuredLogger` to extract the calling function's name from the JavaScript call stack and store it in the `function_name` field of `LogEntry`.

## Technical Approach

### 1. Implementation Strategy

- Add private helper method `extractCallerFunctionName()` to StructuredLogger
- Parse `new Error().stack` to extract function name
- Update `createLogEntry()` to use detected function name instead of placeholder
- Implement graceful fallback for parsing failures

### 2. Stack Trace Parsing Logic

```typescript
private extractCallerFunctionName(): string {
  try {
    const stack = new Error().stack;
    if (!stack) return 'unknown-function';

    const lines = stack.split('\n');
    // Skip first 3 lines: Error, extractCallerFunctionName, createLogEntry
    const callerLine = lines[3] || '';

    // Extract function name using regex
    const match = callerLine.match(/at\s+([^\s]+)/);
    return match?.[1] || 'anonymous-function';
  } catch (error) {
    return 'parse-error';
  }
}
```

### 3. Error Handling Strategy

- Use try-catch to handle parsing errors
- Provide meaningful fallback values:
  - `'unknown-function'` when stack is unavailable
  - `'anonymous-function'` when function name cannot be parsed
  - `'parse-error'` when exception occurs
- Never throw exceptions from this method

### 4. Performance Considerations

- Creating `new Error()` has minimal performance impact
- Stack string parsing is fast
- No caching needed for this use case

### 5. Cross-Browser Compatibility

- Stack trace format varies between browsers
- Regex pattern should handle common formats:
  - Chrome: `at functionName (file:line:col)`
  - Firefox: `functionName@file:line:col`
  - Safari: `functionName@file:line:col`

## Implementation Steps

1. Add `extractCallerFunctionName()` private method
2. Update `createLogEntry()` to call the method
3. Replace placeholder with actual function name
4. Test with various function types (named, anonymous, arrow functions)

## Adherence to Philosophy

- **Simplicity:** Straightforward implementation with clear fallbacks
- **Error Handling:** Proper exception handling without propagation
- **Type Safety:** Strict typing with string return type
- **Performance:** Minimal overhead with efficient parsing

## Validation Criteria

1. Function names are correctly detected in normal cases
2. Graceful fallback for edge cases (anonymous functions, etc.)
3. No exceptions thrown from detection logic
4. All tests pass
5. TypeScript compilation succeeds

## Files to Modify

- `src/utils/structured-logger.ts`
