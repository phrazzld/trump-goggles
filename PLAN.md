# Implementation Plan: Structured JSON Logging System

## Executive Summary

Transform the current console-based logging system into a fully compliant structured JSON logging system that meets DEVELOPMENT_PHILOSOPHY.md requirements while maintaining backward compatibility during migration.

---

## Technical Approach Analysis

### Approach 1: Incremental Migration with Adapter Pattern 🟢 **SELECTED**

**Philosophy Alignment**: ⭐⭐⭐⭐⭐ (Excellent - Simplicity, Modularity, Testability)

**Architecture**:

```
├── src/utils/
│   ├── structured-logger.ts     # New JSON logger core
│   ├── logger-adapter.ts        # Legacy compatibility layer
│   ├── logger-context.ts        # Context propagation
│   └── logger.js               # Legacy (deprecated, shimmed)
```

**Pros**:

- ✅ **Simplicity**: Phased rollout reduces risk
- ✅ **Zero breaking changes**: Existing code continues working
- ✅ **Testable**: Clear interfaces, dependency injection
- ✅ **Philosophy compliant**: ES modules, explicit dependencies
- ✅ **Immediate value**: New code gets benefits immediately

**Cons**:

- ⚠️ Temporary dual system complexity
- ⚠️ Requires disciplined migration plan

**Risk Level**: **Low** - Incremental, backwards compatible

---

### Approach 2: Big Bang Replacement

**Philosophy Alignment**: ⭐⭐⭐ (Good - Simplicity compromised by scope)

**Architecture**: Replace all logging at once with new system

**Pros**:

- ✅ Immediate full compliance
- ✅ No dual systems

**Cons**:

- ❌ **High risk**: 29 files require simultaneous changes
- ❌ **Complex testing**: Entire system changes at once
- ❌ **Violates Simplicity**: Too much complexity in single change
- ❌ **Hard to rollback**: All-or-nothing deployment

**Risk Level**: **High** - Too many simultaneous changes

---

### Approach 3: External Library Integration (Winston/Pino)

**Philosophy Alignment**: ⭐⭐ (Fair - Added dependency complexity)

**Pros**:

- ✅ Battle-tested libraries
- ✅ Rich feature sets

**Cons**:

- ❌ **Dependency weight**: Violates "Keep It Lean"
- ❌ **Browser extension constraints**: Size/performance impact
- ❌ **External dependency risk**: Supply chain, updates
- ❌ **Over-engineering**: More than needed for browser extension

**Risk Level**: **Medium** - Dependency management overhead

---

## Detailed Implementation Plan (Approach 1)

### Phase 1: Foundation (Sprint 1)

#### 1.1 Core Structured Logger (`src/utils/structured-logger.ts`)

```typescript
interface LogEntry {
  timestamp: string; // ISO 8601 UTC
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  service_name: string; // 'trump-goggles'
  correlation_id: string; // Request/operation ID
  function_name: string; // Calling function
  component: string; // Module/component name
  error_details?: {
    // For ERROR level
    type: string;
    message: string;
    stack?: string;
  };
  context?: Record<string, unknown>; // Additional data
}

interface Logger {
  debug(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
  withContext(context: Record<string, unknown>): Logger;
  child(component: string): Logger;
}
```

**Implementation Details**:

- **JSON-only output**: No console styling, pure structured data
- **Correlation ID generation**: UUID v4 for each operation
- **Component hierarchy**: Parent-child logger relationships
- **Context inheritance**: Child loggers inherit parent context
- **Caller detection**: Automatic function name extraction from stack trace

#### 1.2 Context Propagation (`src/utils/logger-context.ts`)

```typescript
class LoggerContext {
  private static instance: LoggerContext;
  private correlationStack: string[] = [];

  static getInstance(): LoggerContext;
  createCorrelationId(): string; // Generate UUID v4
  pushCorrelation(id: string): void; // Start new context
  popCorrelation(): void; // End context
  getCurrentCorrelation(): string; // Get active ID
}
```

**Use Cases**:

- **Page load**: Root correlation ID for entire page processing
- **User interactions**: New correlation ID per click/hover
- **Nested operations**: Text processing → DOM modification → tooltip creation

#### 1.3 Legacy Adapter (`src/utils/logger-adapter.ts`)

```typescript
// Shim for existing window.Logger usage
export function createLegacyShim(structuredLogger: Logger): LegacyLoggerInterface {
  return {
    debug: (message: string, data?: any) => structuredLogger.debug(message, { legacy_data: data }),
    // ... other methods
    // Maintains exact API compatibility
  };
}
```

### Phase 2: Integration (Sprint 1-2)

#### 2.1 Logger Factory (`src/utils/logger-factory.ts`)

```typescript
export class LoggerFactory {
  private static structured: StructuredLogger;

  static initialize(): void {
    this.structured = new StructuredLogger({
      service_name: 'trump-goggles',
      version: '18.5.0',
      environment: 'extension',
    });

    // Install legacy shim
    window.Logger = createLegacyShim(this.structured);
  }

  static getLogger(component: string): Logger {
    return this.structured.child(component);
  }
}
```

#### 2.2 Manifest Integration

**Content Scripts**:

```json
{
  "content_scripts": [
    {
      "js": [
        "utils/structured-logger.js",
        "utils/logger-context.js",
        "utils/logger-adapter.js",
        "utils/logger-factory.js"
        // ... existing scripts
      ]
    }
  ]
}
```

**Initialization Order**: Logger system must initialize first

### Phase 3: Migration Strategy (Sprint 2-3)

#### 3.1 Priority Order

1. **High-Risk Security Files** (Week 1):

   - `src/components/tooltip-manager.ts` (XSS vulnerability dependency)
   - `src/utils/error-handler.js`
   - `src/utils/security-utils.ts`

2. **Core Content Scripts** (Week 2):

   - `src/content/dom-modifier.ts`
   - `src/content/text-processor.js`
   - `src/content/mutation-observer.js`

3. **Background Scripts** (Week 3):

   - `src/background/background-combined.js`
   - `src/background/background-polyfill.js`

4. **Remaining Components** (Week 4):
   - All other files with console.\* usage

#### 3.2 Per-File Migration Pattern

**Before** (Current Pattern):

```typescript
// src/components/tooltip-manager.ts
const logger = getLogger();
if (logger) {
  logger.debug('Tooltip shown', { element, originalText });
}
console.error('TooltipManager: Error in handler', error);
```

**After** (Migrated Pattern):

```typescript
// src/components/tooltip-manager.ts
import { LoggerFactory } from '../utils/logger-factory';
const logger = LoggerFactory.getLogger('tooltip-manager');

// Usage in event handlers
logger.info('Tooltip interaction started', { elementId: element.id });
logger.error('Handler execution failed', {
  error: error.message,
  elementType: element.tagName,
});
```

### Phase 4: Testing Strategy

#### 4.1 Unit Tests

**Test Structure**:

```
test/utils/
├── structured-logger.test.ts    # Core logger logic
├── logger-context.test.ts       # Context propagation
├── logger-adapter.test.ts       # Legacy compatibility
└── logger-integration.test.ts   # End-to-end flows
```

**Key Test Cases**:

- ✅ **JSON format validation**: All outputs parseable as JSON
- ✅ **Mandatory fields**: Every log has required context
- ✅ **Correlation propagation**: IDs flow through call stack
- ✅ **Legacy compatibility**: Existing API calls work unchanged
- ✅ **Error serialization**: Error objects properly formatted
- ✅ **Context inheritance**: Child loggers inherit parent context

#### 4.2 Integration Tests

**Browser Extension Context**:

```typescript
// test/e2e/logging.spec.ts
test('structured logging in extension context', async () => {
  // Verify logs in browser console are JSON
  const logs = await page.evaluate(() => window.capturedLogs.filter((l) => l.level === 'info'));

  expect(logs[0]).toMatchObject({
    timestamp: expect.stringMatching(ISO_8601_REGEX),
    service_name: 'trump-goggles',
    correlation_id: expect.stringMatching(UUID_REGEX),
    function_name: expect.any(String),
  });
});
```

#### 4.3 Mock Policy Compliance

**External Boundaries Only**:

- ✅ Mock `console` object (external system boundary)
- ✅ Mock `performance.now()` (system clock)
- ❌ **NO mocking** of internal Logger interfaces
- ❌ **NO mocking** of LoggerContext class

### Phase 5: Observability & Monitoring

#### 5.1 Log Analysis Validation

**Automated Checks** (CI Integration):

```bash
# Parse logs from test output
npm run test:e2e 2>&1 | jq -r 'select(.service_name == "trump-goggles")'

# Validate required fields present
npm run validate-log-structure
```

**Required Fields Checker**:

```typescript
// scripts/validate-logs.ts
const REQUIRED_FIELDS = [
  'timestamp',
  'level',
  'message',
  'service_name',
  'correlation_id',
  'function_name',
  'component',
];

function validateLogEntry(entry: any): boolean {
  return REQUIRED_FIELDS.every((field) => field in entry);
}
```

#### 5.2 Performance Monitoring

**Benchmarks**:

- **Throughput**: Logs/second capacity
- **Memory overhead**: Context object sizes
- **Latency impact**: Logging call overhead measurement

**Metrics to Track**:

```typescript
interface LoggerMetrics {
  entries_per_level: Record<string, number>;
  avg_context_size: number;
  correlation_depth: number;
  errors_logged: number;
}
```

---

## Security Considerations

### Input Sanitization

**Requirement**: All user-generated content must be sanitized before logging

**Implementation**:

```typescript
function sanitizeForLogging(data: unknown): unknown {
  if (typeof data === 'string') {
    return escapeHTML(data); // Address XSS vulnerability
  }
  // Deep sanitization for objects
  // Remove/mask sensitive patterns (API keys, tokens)
}
```

**Critical Files** (XSS Risk):

- `src/components/tooltip-manager.ts`: `originalText` variable
- Any file logging DOM content or user input

### Secret Detection

**Forbidden Content**:

- API keys, tokens, passwords
- Full user agent strings
- Sensitive DOM attributes (data-\*, id patterns)

**Implementation**: Pre-logging content filtering

---

## Risk Assessment & Mitigation

### Risk Matrix

| Risk                                  | Severity | Probability | Mitigation                             |
| ------------------------------------- | -------- | ----------- | -------------------------------------- |
| **Breaking changes during migration** | High     | Low         | Comprehensive legacy adapter + testing |
| **Performance degradation**           | Medium   | Medium      | Benchmarking + throttling mechanisms   |
| **Correlation ID memory leaks**       | Medium   | Low         | Context stack size limits + cleanup    |
| **JSON parsing failures**             | Low      | Low         | Strict typing + validation             |
| **Bundle size increase**              | Low      | Medium      | Tree-shaking + minimal dependencies    |

### Contingency Plans

**Rollback Strategy**:

1. **Phase 1**: Disable new logger, fall back to legacy
2. **Phase 2**: Toggle via feature flag per component
3. **Phase 3**: File-by-file rollback capability

**Performance Issues**:

- Logger output throttling (max entries/second)
- Context size limits (max 1KB per entry)
- Correlation stack depth limits (max 10 levels)

---

## Success Criteria

### Mandatory Requirements

✅ **Zero `console.*` usage** in operational code (audited via grep)
✅ **100% JSON-parseable** log output (automated validation)
✅ **All mandatory fields present** in every log entry
✅ **Correlation IDs** propagate through operation chains
✅ **Backward compatibility** maintained (existing tests pass)

### Quality Targets

✅ **Test coverage >95%** for new logging modules
✅ **Performance overhead <5%** vs current implementation  
✅ **Bundle size increase <10KB** uncompressed
✅ **Zero linting/type errors** with strict TypeScript config

### Documentation Deliverables

✅ **Migration guide** for future file conversions
✅ **API documentation** for new logging interfaces
✅ **Troubleshooting guide** for common issues
✅ **Performance best practices** for high-frequency logging

---

## Open Questions

1. **Correlation ID Scope**: Should correlation IDs span multiple page loads or reset per navigation?
2. **Log Retention**: Should extension maintain local log history for debugging?
3. **User Privacy**: What level of user activity logging is appropriate?
4. **Development vs Production**: Different logging levels/verbosity for extension development mode?

**Resolution Process**: Technical review with stakeholders, document decisions in ADR format.

---

## Timeline Estimate

**Total Duration**: 3-4 weeks (1 developer)

- **Week 1**: Core infrastructure (Phases 1-2)
- **Week 2**: High-priority file migrations (Phase 3.1-3.2)
- **Week 3**: Remaining migrations + testing (Phase 3.3-4)
- **Week 4**: Performance optimization + documentation (Phase 5)

**Dependencies**: None (standalone implementation)
**Blockers**: None identified

**Ready for implementation** ✅
