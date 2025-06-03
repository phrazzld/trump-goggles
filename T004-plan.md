# T004 Plan: Implement Correlation ID Inclusion in StructuredLogger

## Task Classification

**Simple** - Single file modification with straightforward logic

## Objective

Modify StructuredLogger to include correlation IDs from LoggerContext in every log entry, enabling request tracking across distributed logging operations.

## Technical Approach

### 1. Import LoggerContext

Add import statement for LoggerContext in structured-logger.ts

### 2. Modify createLogEntry Method

Update the private createLogEntry method to:

- Call LoggerContext.getInstance().getCurrentCorrelation()
- Include the retrieved correlation_id in the LogEntry object

### 3. Implementation Details

```typescript
// In createLogEntry method
const correlationId = LoggerContext.getInstance().getCurrentCorrelation();

// Add to LogEntry construction
correlation_id: correlationId,
```

## Design Considerations

- LoggerContext handles ID generation if stack is empty (from T012)
- No need for null/undefined checks as getCurrentCorrelation() always returns a valid ID
- Maintains singleton pattern consistency

## Validation Criteria

1. Every log entry includes a non-empty correlation_id field
2. Correlation IDs are valid UUID v4 format
3. TypeScript compilation succeeds
4. All existing tests pass

## Files to Modify

- `src/utils/structured-logger.ts`
