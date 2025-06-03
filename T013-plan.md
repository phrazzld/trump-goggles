# T013 Plan: Define LegacyLoggerInterface in logger-adapter.ts

## Task Classification

**Simple** - Single file creation with TypeScript interface definition

## Objective

Create src/utils/logger-adapter.ts and define a LegacyLoggerInterface that matches the existing window.Logger API structure to enable backward compatibility.

## Technical Approach

### 1. Analysis of Existing API

From src/utils/logger.js, the core logging methods are:

- `debug(message: string, data?: any): void`
- `info(message: string, data?: any): void`
- `warn(message: string, data?: any): void`
- `error(message: string, data?: any): void`

### 2. TypeScript Interface Design

- Use `interface` (not `type`) for object shape definition
- Replace `any` with `unknown` for data parameter (DEVELOPMENT_PHILOSOPHY.md compliance)
- Define specific method signatures matching existing API

### 3. Implementation

```typescript
export interface LegacyLoggerInterface {
  debug(message: string, data?: unknown): void;
  info(message: string, data?: unknown): void;
  warn(message: string, data?: unknown): void;
  error(message: string, data?: unknown): void;
}
```

## Design Considerations

- Focus on core logging methods only (debug, info, warn, error)
- Use `unknown` instead of `any` for type safety
- Interface will be used by T014 for createLegacyShim implementation
- Maintains backward compatibility with existing window.Logger usage

## Validation Criteria

1. Interface defines all required logging methods
2. TypeScript compilation succeeds
3. Method signatures match existing API structure
4. No `any` types used

## Files to Create

- `src/utils/logger-adapter.ts`
