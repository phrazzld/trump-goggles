# T009 Plan: Implement Error Serialization for error_details in StructuredLogger

## Task Classification

**Simple** - Single method enhancement with error object detection and serialization

## Objective

Modify `StructuredLogger.error()` to detect Error objects in context and serialize them into the `error_details` field of LogEntry with `type`, `message`, and `stack` properties.

## Technical Approach

### 1. Implementation Strategy

- Add private helper method `serializeError()` to extract Error object properties
- Enhance `createLogEntry()` to detect Error objects in context and populate `error_details`
- Support convention: `logger.error("message", { error: new Error("test") })`
- Maintain backward compatibility for existing error() usage

### 2. Error Detection Logic

```typescript
private serializeError(context?: Record<string, unknown>): LogEntry['error_details'] | undefined {
  if (!context) return undefined;

  // Look for Error objects in context
  const errorObj = Object.values(context).find(value => value instanceof Error);
  if (!errorObj) return undefined;

  return {
    type: errorObj.constructor.name,
    message: errorObj.message,
    stack: errorObj.stack,
  };
}
```

### 3. Integration Approach

- Modify `createLogEntry()` to call `serializeError()` for error level logs
- Only populate `error_details` when Error objects are found
- Preserve existing context data alongside error_details

### 4. Error Handling Strategy

- Use try-catch around error serialization to prevent logging failures
- Graceful fallback if Error object properties are inaccessible
- Never throw exceptions from logging methods

## Implementation Steps

1. Add `serializeError()` private method to StructuredLogger
2. Modify `createLogEntry()` to use error serialization for error level
3. Test with various Error types and edge cases
4. Ensure TypeScript compliance and proper typing

## Adherence to Philosophy

- **Simplicity:** Straightforward error detection with clear logic
- **Type Safety:** Proper TypeScript interfaces and error handling
- **Modularity:** Self-contained error serialization logic
- **Error Handling:** No exceptions thrown from logging methods

## Validation Criteria

1. Error objects in context are correctly serialized to error_details
2. Non-error levels do not populate error_details
3. Missing Error objects do not cause failures
4. All tests pass and TypeScript compiles cleanly

## Files to Modify

- `src/utils/structured-logger.ts`
