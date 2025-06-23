---
id: vitest-testing-framework
last_modified: '2025-06-18'
version: '0.1.0'
derived_from: testability
enforced_by: 'vitest configuration, coverage thresholds, CI pipeline, pre-commit hooks'
---

# Binding: Implement Test Pyramid with Vitest for Behavior Verification

Use Vitest as the unified testing framework for all TypeScript test types—unit, integration, and end-to-end. Structure tests according to the test pyramid distribution (70% unit, 20% integration, 10% e2e), focusing on behavior verification rather than implementation details. Enforce coverage thresholds of ≥80% overall and ≥90% for core business logic through automated CI gates.

## Rationale

This binding implements our testability tenet by establishing a consistent, behavior-focused testing approach that enables confident refactoring and rapid development. Just as quality control in manufacturing catches defects early when they're cheapest to fix, a well-structured test pyramid catches bugs at the appropriate level—unit tests for algorithmic correctness, integration tests for component interaction, and e2e tests for critical user journeys.

Think of the test pyramid as a diagnostic system for your codebase. Unit tests provide immediate feedback on individual component correctness, like gauges on a dashboard. Integration tests verify that components work together properly, like testing an entire assembly line. End-to-end tests ensure the complete user experience functions correctly, like final quality inspection. Each level serves a specific purpose and provides different types of confidence.

Vitest's unified approach eliminates the cognitive overhead and tooling fragmentation of using different testing frameworks for different test types. When developers can use the same syntax, configuration, and debugging tools for unit, integration, and e2e tests, they spend more time writing meaningful tests and less time context-switching between tools. This consistency compounds into higher test coverage and better system reliability over time.

## Rule Definition

This rule applies to all TypeScript projects and test types within the unified toolchain. The rule specifically requires:

**Test Distribution Strategy:**
- **70% Unit Tests**: Fast, isolated tests for pure functions, algorithms, and individual components
- **20% Integration Tests**: Component interaction verification including API boundaries, database access, and service integration
- **10% End-to-End Tests**: Critical user journey validation through complete application workflows

**Testing Principles:**
- **Behavior Focus**: Test what code accomplishes (outcomes) rather than how it accomplishes it (implementation)
- **No Internal Mocking**: Only mock external dependencies (APIs, databases, file systems), never internal application components
- **Test Independence**: Tests run in any order without shared state or interdependencies
- **Coverage Enforcement**: Automated validation of ≥80% overall coverage and ≥90% for core business logic

**Vitest Integration:**
- Single configuration file for all test types with appropriate environment setup
- Consistent syntax and tooling across unit, integration, and e2e test suites
- Performance monitoring with benchmark testing capabilities
- CI pipeline integration with parallel execution and coverage reporting

The rule prohibits mixing testing frameworks within projects (e.g., Jest for unit + Playwright for e2e) without architectural justification. Test code follows the same quality standards as production code with clear naming, proper organization, and maintainable structure.

## Practical Implementation

1. **Vitest Configuration**: Establish unified test configuration with environment-specific settings:
   ```typescript
   // vitest.config.ts
   import { defineConfig } from 'vitest/config';

   export default defineConfig({
     test: {
       // Global test settings
       globals: true,
       environment: 'node', // or 'jsdom' for frontend

       // Coverage configuration
       coverage: {
         provider: 'v8',
         reporter: ['text', 'json', 'html'],
         thresholds: {
           statements: 80,
           branches: 80,
           functions: 80,
           lines: 80,
           // Core business logic requires higher coverage
           'src/core/**/*.ts': {
             statements: 90,
             branches: 90,
             functions: 90,
             lines: 90
           }
         },
         exclude: [
           'node_modules/',
           'dist/',
           '**/*.d.ts',
           '**/*.config.*',
           '**/test/**',
           '**/tests/**'
         ]
       },

       // Test organization
       include: ['src/**/*.{test,spec}.{js,ts}'],
       exclude: ['node_modules/', 'dist/'],

       // Performance configuration
       testTimeout: 10000,
       hookTimeout: 10000
     }
   });
   ```

2. **Test Organization Strategy**: Structure tests by type with clear separation and purpose:
   ```
   src/
   ├── components/
   │   ├── Button.ts
   │   ├── Button.test.ts           # Unit tests
   │   └── Button.integration.test.ts  # Integration tests
   ├── services/
   │   ├── ApiService.ts
   │   ├── ApiService.test.ts       # Unit tests
   │   └── ApiService.integration.test.ts
   └── e2e/
       ├── user-journey.test.ts     # End-to-end tests
       └── critical-paths.test.ts
   ```

3. **Unit Test Patterns**: Fast, isolated verification of individual component behavior:
   ```typescript
   // ✅ GOOD: Behavior-focused unit test
   describe('calculateTotal', () => {
     it('should apply discount percentage to subtotal', () => {
       const result = calculateTotal({
         subtotal: 100,
         discountPercentage: 10
       });

       expect(result.total).toBe(90);
       expect(result.discount).toBe(10);
     });

     it('should handle zero discount correctly', () => {
       const result = calculateTotal({
         subtotal: 100,
         discountPercentage: 0
       });

       expect(result.total).toBe(100);
       expect(result.discount).toBe(0);
     });
   });
   ```

4. **Integration Test Patterns**: Verify component interactions without mocking internal dependencies:
   ```typescript
   // ✅ GOOD: Integration test with real internal components
   describe('UserService integration', () => {
     let userService: UserService;
     let testDatabase: Database;

     beforeEach(async () => {
       testDatabase = await createTestDatabase();
       userService = new UserService(testDatabase);
     });

     afterEach(async () => {
       await cleanupTestDatabase(testDatabase);
     });

     it('should create user and send welcome email', async () => {
       const emailSpy = vi.fn();
       const emailService = { send: emailSpy };

       const user = await userService.createUser({
         email: 'test@example.com',
         name: 'Test User'
       }, emailService);

       expect(user.id).toBeDefined();
       expect(emailSpy).toHaveBeenCalledWith({
         to: 'test@example.com',
         subject: 'Welcome to our platform'
       });
     });
   });
   ```

5. **End-to-End Test Patterns**: Critical user journey validation with complete application stack:
   ```typescript
   // ✅ GOOD: E2E test for critical user journey
   describe('User Registration Journey', () => {
     it('should complete full registration workflow', async () => {
       // Arrange: Set up test environment
       const app = await createTestApp();
       const testUser = generateTestUser();

       // Act: Execute complete user journey
       const response = await app.request('/api/register', {
         method: 'POST',
         json: testUser
       });

       // Assert: Verify complete workflow success
       expect(response.status).toBe(201);

       const user = await response.json();
       expect(user.email).toBe(testUser.email);

       // Verify email was sent
       const emailQueue = await getEmailQueue();
       expect(emailQueue).toContainEqual(
         expect.objectContaining({
           to: testUser.email,
           template: 'welcome'
         })
       );

       // Cleanup
       await cleanupTestUser(user.id);
     });
   });
   ```

6. **CI Pipeline Integration**: Automate test execution with performance optimization:
   ```yaml
   # CI configuration example
   test:
     runs-on: ubuntu-latest
     steps:
       - uses: actions/checkout@v4
       - uses: pnpm/action-setup@v4
         with:
           version: 10

       - name: Install dependencies
         run: pnpm install --frozen-lockfile

       - name: Run tests with coverage
         run: pnpm test:coverage

       - name: Upload coverage reports
         uses: codecov/codecov-action@v3
         with:
           file: ./coverage/lcov.info
   ```

## Examples

```typescript
// ❌ BAD: Implementation-focused test with internal mocking
describe('OrderProcessor', () => {
  it('should call payment service correctly', () => {
    const mockPayment = vi.fn();
    const mockInventory = vi.fn();
    const processor = new OrderProcessor(mockPayment, mockInventory);

    processor.processOrder(order);

    expect(mockPayment).toHaveBeenCalledWith(order.total);
    expect(mockInventory).toHaveBeenCalledWith(order.items);
  });
});

// ✅ GOOD: Behavior-focused test verifying outcomes
describe('OrderProcessor', () => {
  it('should create confirmed order with reserved inventory', async () => {
    const processor = new OrderProcessor(
      new TestPaymentService(),
      new TestInventoryService()
    );

    const result = await processor.processOrder({
      items: [{ id: 'item1', quantity: 2 }],
      total: 100
    });

    expect(result.status).toBe('confirmed');
    expect(result.paymentId).toBeDefined();
    expect(result.reservationId).toBeDefined();
  });
});
```

```typescript
// ❌ BAD: Mixing different testing frameworks
// jest.config.js for unit tests
// playwright.config.ts for e2e tests
// Different syntax, configuration, and debugging tools

// ✅ GOOD: Unified Vitest configuration for all test types
// vitest.config.ts handles unit, integration, and e2e tests
// Consistent syntax, tooling, and developer experience
export default defineConfig({
  test: {
    env: {
      NODE_ENV: 'test'
    },
    setupFiles: ['./test/setup.ts'],
    // Single configuration for all test types
  }
});
```

```typescript
// ❌ BAD: Shared state between tests
let userDatabase; // Shared across tests

describe('User operations', () => {
  it('should create user', () => {
    userDatabase.insert(user);
    expect(userDatabase.count()).toBe(1);
  });

  it('should delete user', () => {
    userDatabase.delete(user.id); // Depends on previous test
    expect(userDatabase.count()).toBe(0);
  });
});

// ✅ GOOD: Independent tests with isolated setup
describe('User operations', () => {
  let database: Database;

  beforeEach(async () => {
    database = await createIsolatedTestDatabase();
  });

  afterEach(async () => {
    await cleanupTestDatabase(database);
  });

  it('should create user successfully', async () => {
    const user = await database.users.create({
      email: 'test@example.com'
    });

    expect(user.id).toBeDefined();
    expect(user.email).toBe('test@example.com');
  });
});
```

## Related Bindings

- [modern-typescript-toolchain.md](../../docs/bindings/categories/typescript/modern-typescript-toolchain.md): This testing binding implements the testing component of the unified toolchain, providing consistent Vitest integration with the broader TypeScript ecosystem established in the foundation binding.

- [no-internal-mocking.md](../core/no-internal-mocking.md): The testing patterns in this binding enforce the principle of only mocking external dependencies, ensuring tests accurately reflect real system behavior rather than creating false confidence through internal mocks.

- [test-pyramid-implementation.md](../core/test-pyramid-implementation.md): This binding provides the practical Vitest implementation of test pyramid principles, translating the abstract testing strategy into concrete TypeScript patterns and configurations.

- [integration-first-testing.md](../core/integration-first-testing.md): While supporting traditional test pyramid distribution, this binding can be adapted to support integration-first testing approaches where component boundary testing receives primary investment.

- [automated-quality-gates.md](../core/automated-quality-gates.md): The coverage enforcement and CI integration aspects of this binding implement automated quality gates specifically for testing verification, ensuring consistent quality standards across all TypeScript projects.
