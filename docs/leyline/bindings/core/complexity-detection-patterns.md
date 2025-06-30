---
id: complexity-detection-patterns
last_modified: '2025-06-17'
version: '0.1.0'
derived_from: simplicity
enforced_by: 'static analysis, code review, complexity metrics'
---

# Binding: Detect and Eliminate Complexity Patterns

Recognize specific code smells and patterns that indicate complexity demons have infected your codebase. Use concrete metrics and thresholds to identify complexity before it becomes entrenched, and apply targeted refactoring strategies to eliminate each pattern.

## Rationale

The complexity demon is cunning—it disguises itself as "necessary abstraction," "future-proofing," and "enterprise architecture." This binding provides concrete patterns to identify when the demon has taken hold. Each pattern includes specific detection criteria, measurable thresholds, and targeted remediation strategies.

## Rule Definition

**MUST** measure and track complexity metrics during development and code review.

**MUST** address complexity patterns immediately when detected rather than deferring to "later refactoring."

**SHOULD** automate complexity detection through static analysis tools and linting rules.

**SHOULD** establish team-wide thresholds for complexity metrics and enforce them in CI.

## Core Complexity Patterns

### 1. Parameter Explosion Pattern

**Detection:** Functions with 4+ parameters, constructor injection with 5+ dependencies

**Example:**
```typescript
// ❌ COMPLEXITY DEMON: Parameter explosion
function processOrder(orderId: string, customerId: string, paymentMethod: string,
  shippingAddress: string, billingAddress: string, discountCode: string,
  priority: boolean, giftWrap: boolean) { /* ... */ }

// ✅ SIMPLE: Group related parameters
interface OrderRequest {
  orderId: string;
  customerId: string;
  payment: PaymentInfo;
  shipping: ShippingInfo;
  options: OrderOptions;
}
function processOrder(request: OrderRequest) { /* ... */ }
```

### 2. Deep Nesting Pattern

**Detection:** Cyclomatic complexity > 10, nesting depth > 3 levels

**Example:**
```typescript
// ❌ COMPLEXITY DEMON: Deep nesting
function validateUser(user: User): boolean {
  if (user) {
    if (user.email) {
      if (user.email.includes('@')) {
        if (user.age >= 18) {
          if (user.permissions?.includes('read')) {
            return true;
          }
        }
      }
    }
  }
  return false;
}

// ✅ SIMPLE: Early returns and guard clauses
function validateUser(user: User): boolean {
  if (!user?.email?.includes('@')) return false;
  if (user.age < 18) return false;
  if (!user.permissions?.includes('read')) return false;
  return true;
}
```

### 3. God Object Pattern

**Detection:** Classes with 15+ methods, files with 500+ lines, classes with 10+ private fields

**Example:**
```typescript
// ❌ COMPLEXITY DEMON: God class handling everything
class UserManager {
  createUser() { /* ... */ }
  validateUser() { /* ... */ }
  authenticateUser() { /* ... */ }
  updateUserProfile() { /* ... */ }
  uploadUserAvatar() { /* ... */ }
  generateUserReport() { /* ... */ }
  // ... 17 more methods
}

// ✅ SIMPLE: Single responsibility classes
class UserCreator {
  createUser() { /* ... */ }
  validateUser() { /* ... */ }
}
class UserAuthenticator {
  authenticateUser() { /* ... */ }
}
class UserProfileManager {
  updateUserProfile() { /* ... */ }
  uploadUserAvatar() { /* ... */ }
}
```

### 4. Configuration Explosion Pattern

**Detection:** Configuration files with 50+ options, nested configuration 4+ levels deep

**Example:**
```yaml
# ❌ COMPLEXITY DEMON: Configuration explosion (52 options, 5 levels deep)
app:
  database:
    connection:
      pool:
        min: 5
        max: 20
        idle: 1000
        acquire: 60000
      retry:
        attempts: 3
        delay: 1000
        backoff: exponential
# ... 47 more options

# ✅ SIMPLE: Essential configuration only
app:
  database_url: "postgres://..."
  cache_enabled: true
  debug: false
```

### 5. Abstract Factory Factory Pattern

**Detection:** Classes with "Factory," "Builder," "Manager" without clear purpose, interfaces with single implementations

**Example:**
```typescript
// ❌ COMPLEXITY DEMON: Unnecessary abstraction layers
interface NotificationSenderFactory {
  createSender(): NotificationSender;
}
class EmailNotificationSenderFactory implements NotificationSenderFactory {
  createSender(): EmailNotificationSender {
    return new EmailNotificationSender();
  }
}

// ✅ SIMPLE: Direct implementation
class EmailSender {
  send(message: string): void {
    // Send email
  }
}
```

### 6. Boolean Trap Pattern

**Detection:** Functions with 3+ boolean parameters, method calls with unclear boolean literals

**Example:**
```typescript
// ❌ COMPLEXITY DEMON: Boolean traps
function createUser(email: string, sendWelcome: boolean, validateEmail: boolean,
  createProfile: boolean) { /* ... */ }
createUser("user@example.com", true, false, true); // What do these mean?

// ✅ SIMPLE: Explicit options object
interface UserCreationOptions {
  sendWelcomeEmail: boolean;
  skipEmailValidation: boolean;
  createBlankProfile: boolean;
}
function createUser(email: string, options: UserCreationOptions) { /* ... */ }
```

### 7. Magic Number Pattern

**Detection:** Numeric literals scattered throughout code, same numbers repeated

**Example:**
```typescript
// ❌ COMPLEXITY DEMON: Magic numbers
function calculatePrice(basePrice: number, userType: string): number {
  if (userType === 'premium') price *= 0.85; // What is 0.85?
  return Math.round(price * 1.08); // What is 1.08?
}

// ✅ SIMPLE: Named constants
const PREMIUM_DISCOUNT = 0.15;
const TAX_RATE = 0.08;
```

### 8. Async Complexity Pattern

**Detection:** Nested callbacks 4+ levels deep, try-catch blocks nested 3+ levels

**Example:**
```typescript
// ❌ COMPLEXITY DEMON: Nested async complexity
function processOrder(orderId: string, callback: Function) {
  fetchOrder(orderId, (order) => {
    validateOrder(order, (isValid) => {
      if (isValid) {
        processPayment(order.payment, (result) => {
          updateInventory(order.items, () => {
            callback(null, { success: true });
          });
        });
      }
    });
  });
}

// ✅ SIMPLE: Async/await with early returns
async function processOrder(orderId: string): Promise<ProcessResult> {
  const order = await fetchOrder(orderId);
  if (!await validateOrder(order)) throw new Error('Invalid order');
  await processPayment(order.payment);
  await updateInventory(order.items);
  return { success: true };
}
```

## Complexity Metrics and Thresholds

### Automated Detection Thresholds

| Metric | Threshold | Detection Method |
|--------|-----------|------------------|
| **Cyclomatic Complexity** | > 10 | ESLint complexity rule |
| **Function Length** | > 50 lines | Static analysis |
| **Parameter Count** | > 3 parameters | Linting rules |
| **Nesting Depth** | > 3 levels | AST analysis |
| **Class Methods** | > 12 methods | Static analysis |
| **File Length** | > 300 lines | File metrics |
| **Boolean Parameters** | > 2 booleans | Custom linting |
| **Magic Numbers** | > 2 per function | Pattern detection |

### Manual Review Indicators

**Immediate Red Flags:**
- "This is complex, but..." justifications
- Code requiring extensive comments to explain
- Functions that can't be unit tested easily
- Classes changing for multiple reasons
- Configuration needing documentation

## Refactoring Strategies by Priority

### Priority 1: High-Impact, Low-Risk
1. **Extract Named Constants** (Magic Numbers)
2. **Add Early Returns** (Deep Nesting)
3. **Group Parameters** (Parameter Explosion)
4. **Replace Boolean Traps** (Boolean Parameters)

### Priority 2: Medium-Impact
5. **Extract Small Functions** (God Objects)
6. **Simplify Error Handling** (Async Complexity)
7. **Use Template Strings** (String Operations)
8. **Flatten Async Code** (Callback Pyramids)

### Priority 3: Architectural
9. **Remove Unnecessary Abstractions** (Factory Factories)
10. **Consolidate Configuration** (Configuration Explosion)

## Success Metrics

**Code Health Indicators:**
- Complexity metrics trending downward over time
- Faster code review cycles
- Reduced bug density in refactored areas
- Improved test coverage due to testable code

**Team Productivity:**
- Reduced time to understand unfamiliar code
- Faster onboarding for new team members
- More confident refactoring by all team members

## Implementation Strategy

### Automated Detection Setup

**ESLint Configuration:**
```json
{
  "rules": {
    "complexity": ["error", 10],
    "max-params": ["error", 3],
    "max-depth": ["error", 3],
    "max-lines-per-function": ["error", 50]
  }
}
```

**Pre-commit Hooks:**
- Run complexity analysis on changed files
- Fail builds that exceed thresholds
- Generate complexity reports for review

### Team Adoption Process

1. **Establish Baselines:** Measure current complexity metrics
2. **Set Targets:** Define improvement goals for each metric
3. **Automate Detection:** Add linting rules and CI checks
4. **Review Training:** Teach team to spot patterns in code review
5. **Iterate:** Adjust thresholds based on team capability

## Related Patterns

**Simplicity Above All:** These patterns provide concrete ways to identify when the complexity demon has violated simplicity principles.

**Avoid Premature Abstraction:** Many patterns (Abstract Factory Factories) result from abstracting too early before understanding real requirements.

**Natural Refactoring Points:** Use these patterns to identify when code has "settled" enough to reveal natural boundaries for refactoring.
