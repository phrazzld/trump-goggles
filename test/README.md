# Test Setup Documentation

## Overview

This directory contains the test suite for Trump Goggles browser extension. The test environment is carefully designed to be **independent of build artifacts** to ensure tests can run reliably in any environment without requiring a prior build step.

## Critical Design Constraint: Build Independence

**⚠️ IMPORTANT**: Tests must NEVER depend on compiled files from the `dist/` directory.

### Why This Matters

The CI pipeline runs tests before building to catch issues early. If tests depend on build artifacts:
- CI will fail with "File not found" errors
- Local development becomes fragile  
- Test reliability is compromised
- Deploy pipeline is blocked

### Historical Context

Previously, the test setup attempted to load compiled JavaScript modules from `dist/` using `eval()`. This caused CI failures because:
- Tests run before build step in CI
- `dist/` directory doesn't exist during test execution
- Build dependencies create unnecessary coupling

## Current Test Setup Architecture

### Core Principle: Direct TypeScript Imports

The test setup (`test/setup.ts`) uses **direct TypeScript imports** to initialize window globals:

```typescript
// ✅ CORRECT: Direct TypeScript imports  
import '../src/utils/structured-logger';  // Exports window.StructuredLogger
import '../src/utils/logger-context';     // Exports window.LoggerContext  
import '../src/utils/logger-adapter';     // Exports window.LoggerAdapter
import '../src/utils/logger-factory';     // Exports window.LoggerFactory
```

```typescript
// ❌ WRONG: Loading compiled artifacts
const moduleCode = fs.readFileSync('/dist/structured-logger.js', 'utf8');
eval(moduleCode); // Fails in CI - dist/ doesn't exist
```

### Window Global Initialization

Each TypeScript module automatically exports to window globals when imported:

```typescript
// In structured-logger.ts
if (typeof window !== 'undefined') {
  (window as any).StructuredLogger = {
    Logger: StructuredLogger,
  };
}
```

This approach ensures:
- ✅ Tests work without build step  
- ✅ Same window global pattern as browser
- ✅ Fast test startup (no file I/O)
- ✅ Environment independence

## Test Environment Requirements

### Dependencies

- **Node.js**: v18.18.0+
- **pnpm**: Required package manager
- **TypeScript**: For direct imports
- **Vitest**: Test runner with jsdom

### Mock Strategy

Following `DEVELOPMENT_PHILOSOPHY.md`, we:
- ✅ Mock external boundaries (console, browser APIs, filesystem)
- ❌ Never mock internal collaborators
- ✅ Refactor code for testability instead of mocking

### Test Categories

1. **Unit Tests**: Individual module testing
2. **Integration Tests**: Cross-module interaction testing  
3. **E2E Tests**: Browser extension testing with Playwright
4. **Performance Tests**: Benchmarking with controlled environments

## Development Guidelines

### Adding New Tests

When adding tests that use logging components:

```typescript
// ✅ GOOD: Access via window globals (automatically set up)
const logger = (window as any).LoggerFactory.getLogger('my-component');

// ❌ BAD: Direct imports of logging classes  
import { StructuredLogger } from '../src/utils/structured-logger';
```

### Test File Structure

```
test/
├── setup.ts              # Global test setup (window globals, mocks)
├── README.md             # This documentation
├── content/              # Content script tests  
├── browser/              # Browser API tests
├── utils/                # Utility module tests
├── integration/          # Cross-component tests
├── e2e/                  # End-to-end tests
├── mocks/                # External boundary mocks
└── fixtures/             # Test data and helpers
```

### Running Tests

```bash
# Run all tests (no build required)
pnpm test

# Run specific test file  
pnpm test test/utils/logger-adapter.test.ts

# Run with coverage
pnpm test:coverage

# Run E2E tests (requires built extension)
pnpm test:e2e
```

## Troubleshooting

### Common Issues

**"File not found" errors for dist/ files**
- Cause: Test trying to load compiled artifacts
- Solution: Use direct TypeScript imports instead

**"Cannot read properties of undefined (reading 'Logger')"**  
- Cause: Window globals not properly initialized
- Solution: Ensure test/setup.ts imports all required modules

**Tests pass locally but fail in CI**
- Cause: Environment-specific dependencies (often build artifacts)
- Solution: Verify tests run without prior `pnpm build`

### Debugging Steps

1. Run tests locally without building: `pnpm test`
2. Check for any references to `dist/` in test files
3. Verify window globals are set up in test/setup.ts
4. Ensure imports match the dependency order

## Prevention Checklist

Before modifying test setup:

- [ ] Does change introduce dependency on `dist/` directory?
- [ ] Can tests still run without prior build step?
- [ ] Are window globals properly initialized?
- [ ] Does change follow direct TypeScript import pattern?
- [ ] Have you tested both locally and verified CI will pass?

## Emergency Recovery

If tests break due to build dependencies:

1. **Identify the issue**: Look for `dist/` references in error logs
2. **Replace with imports**: Convert file loading to TypeScript imports  
3. **Verify window globals**: Ensure modules export to window
4. **Test thoroughly**: Run full suite locally before pushing
5. **Update this documentation**: Keep prevention measures current

Remember: **Test independence is critical for CI reliability and developer productivity.**