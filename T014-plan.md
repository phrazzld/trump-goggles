# T014 Plan: Implement createLegacyShim Function in logger-adapter.ts

## Task Classification

**Simple** - Single file modification with straightforward adapter function implementation

## Objective

Implement the `createLegacyShim(structuredLogger: Logger): LegacyLoggerInterface` function that creates an adapter to bridge the existing window.Logger API with the new StructuredLogger system.

## Technical Approach

### 1. Function Signature

```typescript
export function createLegacyShim(structuredLogger: Logger): LegacyLoggerInterface;
```

### 2. Implementation Strategy

- Import the Logger interface from structured-logger.ts
- Create and return an object literal that implements LegacyLoggerInterface
- Each method in the returned object will delegate to the corresponding StructuredLogger method

### 3. Method Mapping

- `debug(message, data)` → `structuredLogger.debug(message, { legacy_data: data })`
- `info(message, data)` → `structuredLogger.info(message, { legacy_data: data })`
- `warn(message, data)` → `structuredLogger.warn(message, { legacy_data: data })`
- `error(message, data)` → `structuredLogger.error(message, { legacy_data: data })`

### 4. Data Wrapping Strategy

- When `data` parameter is provided, wrap it in `{ legacy_data: data }`
- When `data` is undefined, pass undefined context
- This preserves the legacy API while providing structured context

## Design Considerations

- Use explicit typing with Logger and LegacyLoggerInterface imports
- Follow DEVELOPMENT_PHILOSOPHY.md: no `any` types, explicit contracts
- Maintain backward compatibility for existing window.Logger usage
- Simple delegation pattern - no complex logic needed

## Validation Criteria

1. Function accepts StructuredLogger and returns LegacyLoggerInterface-compliant object
2. All legacy methods delegate correctly to structured logger
3. Data parameter handling works with and without provided data
4. TypeScript compilation succeeds without errors
5. No `any` types used

## Files to Modify

- `src/utils/logger-adapter.ts`
