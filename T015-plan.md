# T015 Implementation Plan

## Objective

Implement the actual method implementations for the legacy logger shim in `createLegacyShim` function.

## Current State Analysis

- `LegacyLoggerInterface` is defined
- `createLegacyShim` function exists but returns empty object
- Need to implement: `debug`, `info`, `warn`, `error` methods

## Implementation Approach

1. Read current `logger-adapter.ts` to understand existing structure
2. Implement each method in the returned shim object:
   - `debug(message: string, data?: any): void`
   - `info(message: string, data?: any): void`
   - `warn(message: string, data?: any): void`
   - `error(message: string, data?: any): void`
3. Each method will:
   - Call corresponding method on `structuredLogger`
   - Wrap `data` parameter in `{ legacy_data: data }` object if provided
   - Pass this as context to structured logger

## Code Pattern

```typescript
debug(message: string, data?: any): void {
  const context = data !== undefined ? { legacy_data: data } : undefined;
  structuredLogger.debug(message, context);
}
```

## Adherence to Philosophy

- Simple, explicit mapping
- No use of `any` except where required by legacy interface
- Clear, readable implementation
- Maintains backward compatibility
