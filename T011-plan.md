# T011 Plan: Implement createCorrelationId Method in LoggerContext

## Task Classification

**Simple** - Single method addition with UUID generation logic

## Objective

Implement `createCorrelationId(): string` method in LoggerContext class to generate and return valid UUID v4 strings for correlation ID tracking.

## Technical Approach

### 1. Implementation Strategy

- Add public method `createCorrelationId()` to existing LoggerContext class
- Use modern browser `crypto.randomUUID()` with fallback for older environments
- Ensure generated IDs comply with RFC 4122 UUID v4 specification
- Handle potential errors gracefully with fallback implementation

### 2. UUID Generation Logic

```typescript
public createCorrelationId(): string {
  try {
    // Use modern browser API if available
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }

    // Fallback implementation for older browsers
    return this.generateUUIDFallback();
  } catch (error) {
    // Ultimate fallback for any errors
    return this.generateUUIDFallback();
  }
}

private generateUUIDFallback(): string {
  // RFC 4122 compliant UUID v4 implementation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
```

### 3. Browser Compatibility

- Primary: `crypto.randomUUID()` (Chrome 92+, Firefox 95+, Safari 15.4+)
- Fallback: Custom RFC 4122 implementation using Math.random()
- Covers all target browsers for browser extension

### 4. Error Handling Strategy

- Use try-catch around crypto API calls
- Graceful fallback to manual implementation
- No exceptions thrown from public method
- Always returns a valid UUID string

## Implementation Steps

1. Add `createCorrelationId()` public method to LoggerContext
2. Add `generateUUIDFallback()` private helper method
3. Implement crypto API detection and fallback logic
4. Add JSDoc documentation for new methods
5. Update TODO comment about correlationStack usage

## Adherence to Philosophy

- **Simplicity:** Straightforward UUID generation with clear fallback
- **Browser Compatibility:** Support for all modern and legacy browsers
- **Error Handling:** Robust fallback strategy prevents failures
- **Type Safety:** Strict TypeScript return types

## Validation Criteria

1. Method returns valid UUID v4 format strings
2. Works in both modern and legacy browser environments
3. No exceptions thrown from the method
4. TypeScript compilation succeeds
5. All tests pass

## Files to Modify

- `src/utils/logger-context.ts`
