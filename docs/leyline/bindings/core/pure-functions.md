---
derived_from: simplicity
id: pure-functions
last_modified: '2025-05-14'
version: '0.1.0'
enforced_by: code review & style guides
---
# Binding: Write Pure Functions, Isolate Side Effects

Structure your code to maximize the use of pure functions that always produce the same
output for a given input and have no side effects. When side effects are necessary,
isolate them to the boundaries of your application and make them explicit.

## Rationale

This binding implements our simplicity tenet by reducing complexity at its most
fundamental level—predictable code execution. When a function is pure, its behavior is
entirely determined by its inputs, making it dramatically easier to understand, test,
debug, and reason about. There's no hidden state, no temporal coupling, and no
mysterious interactions with the outside world—just a clear, predictable transformation
of inputs to outputs.

Think of pure functions like mathematical equations. The formula for calculating a
circle's area (πr²) always gives the same result for the same radius—it doesn't depend
on the time of day, the weather, or what other calculations you've performed previously.
This predictability makes mathematical formulas easy to work with, verify, and combine
into more complex calculations. Similarly, pure functions create islands of certainty in
your codebase—components that will behave consistently no matter when or where they're
called.

By contrast, functions with side effects are like chemical reactions—their behavior
depends not only on their inputs but also on their environment and can permanently alter
that environment in ways that affect future operations. While such reactions are
sometimes necessary, they're inherently more complex to understand and control. Just as
chemists carefully isolate dangerous reactions in controlled environments, we need to
isolate side effects in our code to contain their complexity.

This binding also directly supports our testability tenet. Pure functions are inherently
testable because they have clearly defined inputs and outputs with no hidden
dependencies. Testing becomes as simple as providing input values and asserting on the
output, without need for complex mocks, stubs, or setup. The test cases are also
repeatable and deterministic, eliminating flaky tests that undermine confidence in your
test suite.

## Rule Definition

This binding establishes the following principles for managing side effects and
promoting pure functions:

- **Maximize Pure Functions**: The majority of your codebase should consist of pure
  functions that:

  - Always return the same output for the same input
  - Have no observable side effects (no mutations to external state)
  - Depend only on their input parameters (no hidden dependencies)
  - Don't rely on or modify global state
  - Don't perform I/O operations (file, network, database, etc.)

- **Contain Side Effects**: When side effects are necessary (and they often are), they
  should be:

  - Isolated to the boundaries of your application or module
  - Made explicit in function signatures and documentation
  - Kept separate from your core business logic
  - Minimized in scope and complexity

- **Types of Side Effects to Manage**:

  - External I/O (file systems, networks, databases)
  - Logging and monitoring
  - Global state modifications
  - Mutable data structure changes
  - System clock or random number usage
  - Throwing exceptions (in languages where these cause non-local control flow)

- **Permitted Exceptions**: Code may deviate from pure functions in specific
  circumstances:

  - In clearly defined boundary layers responsible for I/O
  - When performance concerns are validated with benchmarks
  - In initialization/bootstrap code that runs once
  - When following language-specific idioms that would be unnatural to avoid

- **Implementation Requirements**: When implementing this binding:

  - Use clear architectural patterns to separate pure and impure code
  - Make side effects explicit through function signatures and type systems
  - Prefer returning new data over modifying existing data
  - Use dependency injection to make external dependencies explicit

## Practical Implementation

Here are concrete strategies for implementing and enforcing pure functions across your
codebase:

1. **Adopt Functional Core, Imperative Shell**: Structure your application with a
   "functional core" of pure business logic surrounded by a thin "imperative shell" that
   handles side effects. Ask yourself: "Can I separate the what from the how?" The core
   should determine what to do (decisions) while the shell handles how to do it
   (effects).

   ```typescript
   // Imperative shell (handles side effects)
   async function createUserController(req, res) {
     // Extract and validate input
     const userData = req.body;

     // Call pure function for business logic
     const result = createUser(userData);

     // Handle side effects based on the result
     if (result.success) {
       await userRepository.save(result.user);
       await notificationService.sendWelcomeEmail(result.user.email);
       res.status(201).json(result.user);
     } else {
       res.status(400).json({ errors: result.errors });
     }
   }

   // Functional core (pure function)
   function createUser(userData) {
     // Validate and transform data
     const validation = validateUserData(userData);
     if (!validation.valid) {
       return { success: false, errors: validation.errors };
     }

     // Create user entity (no side effects, just returns data)
     const user = {
       id: generateId(userData.email),
       name: userData.name,
       email: userData.email,
       role: 'user',
       createdAt: new Date().toISOString()
     };

     return { success: true, user };
   }
   ```

1. **Make Side Effects Explicit with Types**: Use your type system to clearly identify
   functions with side effects. Ask yourself: "Is it obvious from the function signature
   that this has side effects?" Make it impossible to accidentally invoke a side effect
   without being aware of it.

   ```typescript
   // TypeScript example with explicit effect types
   type Effect<T> = () => Promise<T>;

   // Pure function (returns data)
   function calculateTotal(items: Item[]): number {
     return items.reduce((sum, item) => sum + item.price, 0);
   }

   // Function that returns an effect (but doesn't execute it)
   function saveOrder(order: Order): Effect<void> {
     return async () => {
       await database.orders.insert(order);
       await logger.info(`Order ${order.id} saved`);
     };
   }

   // Imperative shell composes and executes effects
   async function processOrder(items: Item[]): Promise<void> {
     const total = calculateTotal(items);
     const order = { id: generateId(), items, total, date: new Date() };

     // Execute effects in sequence
     await saveOrder(order)();
     await sendConfirmationEmail(order)();
     await updateInventory(items)();
   }
   ```

1. **Isolate Non-Deterministic Operations**: Separate non-deterministic operations (like
   generating random numbers or timestamps) from your pure business logic. Ask yourself:
   "What makes this function unpredictable?" Then extract those elements and inject the
   results.

   ```javascript
   // ❌ BAD: Non-deterministic function
   function createUser(name, email) {
     return {
       id: Math.random().toString(36).substring(2),
       name,
       email,
       createdAt: new Date()
     };
   }

   // ✅ GOOD: Pure function with injected non-determinism
   function createUser(name, email, id, timestamp) {
     return {
       id,
       name,
       email,
       createdAt: timestamp
     };
   }

   // The shell provides the non-deterministic values
   function createUserController(name, email) {
     const id = generateId();
     const timestamp = new Date().toISOString();
     return createUser(name, email, id, timestamp);
   }
   ```

1. **Apply Functional Programming Patterns**: Use functional programming patterns to
   help maintain purity. Ask yourself: "How can I transform data without modifying it?"
   Learn to use techniques like:

   - Map/filter/reduce instead of for-loops with mutation
   - Function composition to build complex operations from simple ones
   - Currying and partial application to create specialized functions
   - Immutable data structures to prevent accidental mutation

   ```javascript
   // Functional patterns example
   const discount = rate => price => price * (1 - rate);
   const applyTax = rate => price => price * (1 + rate);

   // Function composition
   const computeFinalPrice = (discountRate, taxRate) => {
     const applyDiscount = discount(discountRate);
     const addTax = applyTax(taxRate);

     // Create a pipeline of transformations
     return price => addTax(applyDiscount(price));
   };

   // Usage
   const finalPrice = computeFinalPrice(0.1, 0.08)(100);
   ```

1. **Use Dependency Injection**: Make dependencies explicit by injecting them rather
   than importing them directly. Ask yourself: "What does this function depend on that
   isn't in its parameters?" Those hidden dependencies are candidates for injection.

   ```python
   # ❌ BAD: Hidden dependencies
   def get_user_preferences(user_id):
       # Hidden dependency on database module
       from database import db
       return db.users.find_one({"id": user_id}).get("preferences", {})

   # ✅ GOOD: Explicit dependency injection
   def get_user_preferences(user_id, db_client):
       return db_client.users.find_one({"id": user_id}).get("preferences", {})

   # Usage in the shell
   def preferences_controller(user_id):
       from database import get_db_client
       db_client = get_db_client()
       return get_user_preferences(user_id, db_client)
   ```

## Examples

```typescript
// ❌ BAD: Function with hidden side effects
function sendWelcomeMessage(user) {
  const message = `Welcome, ${user.name}!`;

  // Hidden side effect: logging
  console.log(`Sending message to ${user.email}`);

  // Hidden side effect: API call
  fetch('/api/notifications', {
    method: 'POST',
    body: JSON.stringify({
      user: user.id,
      message
    })
  });

  // Hidden side effect: modifying the user object
  user.hasWelcomeMessage = true;

  return message;
}
```

```typescript
// ✅ GOOD: Separation of pure logic and side effects
// Pure function: creates the message
function createWelcomeMessage(userName) {
  return `Welcome, ${userName}!`;
}

// Pure function: decides which users need welcome messages
function needsWelcomeMessage(user) {
  return !user.hasWelcomeMessage;
}

// Impure function in the shell: handles side effects
async function sendWelcomeMessage(user) {
  // Only proceed if needed (pure decision)
  if (!needsWelcomeMessage(user)) {
    return { sent: false, reason: 'already-welcomed' };
  }

  // Create message (pure transformation)
  const message = createWelcomeMessage(user.name);

  // Explicit side effects
  try {
    await logger.info(`Sending welcome to ${user.email}`);
    await notificationService.send(user.id, message);

    // Return new user state rather than modifying
    return {
      sent: true,
      user: { ...user, hasWelcomeMessage: true }
    };
  } catch (error) {
    await logger.error('Failed to send welcome', { userId: user.id, error });
    return { sent: false, reason: 'send-failed', error };
  }
}
```

```javascript
// ❌ BAD: Business logic mixed with side effects
function processOrder(items, userId) {
  // Business logic mixed with database calls
  let total = 0;
  for (const item of items) {
    total += item.price * item.quantity;

    // Side effect: updating inventory
    const inventory = db.inventory.findOne({ itemId: item.id });
    inventory.stock -= item.quantity;
    db.inventory.update(inventory);
  }

  // Apply discount if eligible
  const user = db.users.findOne({ id: userId });
  if (user.loyaltyPoints > 100) {
    total *= 0.9;  // 10% discount

    // Side effect: updating user
    user.loyaltyPoints -= 100;
    db.users.update(user);
  }

  // Side effect: creating order
  const order = {
    userId,
    items,
    total,
    date: new Date()
  };
  db.orders.insert(order);

  // Side effect: sending email
  emailService.sendOrderConfirmation(user.email, order);

  return order;
}
```

```javascript
// ✅ GOOD: Pure business logic separated from effects
// Pure function: calculates total
function calculateOrderTotal(items) {
  return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

// Pure function: determines discount
function applyDiscount(total, loyaltyPoints) {
  if (loyaltyPoints >= 100) {
    return {
      newTotal: total * 0.9,
      pointsUsed: 100
    };
  }
  return {
    newTotal: total,
    pointsUsed: 0
  };
}

// Pure function: creates order object
function createOrder(userId, items, total, date) {
  return {
    userId,
    items,
    total,
    date
  };
}

// Impure function in the shell: orchestrates the process
async function processOrder(items, userId) {
  // Load data
  const user = await db.users.findOne({ id: userId });

  // Pure business logic
  const total = calculateOrderTotal(items);
  const { newTotal, pointsUsed } = applyDiscount(total, user.loyaltyPoints);
  const order = createOrder(userId, items, newTotal, new Date());

  // Side effects isolated and explicit
  try {
    // Update inventory in database
    await Promise.all(items.map(item =>
      db.inventory.updateStock(item.id, -item.quantity)
    ));

    // Update user loyalty points if needed
    if (pointsUsed > 0) {
      await db.users.updateLoyaltyPoints(userId, -pointsUsed);
    }

    // Save order
    await db.orders.insert(order);

    // Send confirmation
    await emailService.sendOrderConfirmation(user.email, order);

    return { success: true, order };
  } catch (error) {
    await logger.error('Order processing failed', { userId, error });
    return { success: false, error };
  }
}
```

```go
// ❌ BAD: Function with multiple responsibilities and side effects
func ProcessPayment(userID string, amount float64) error {
    // Load user data
    user, err := db.GetUser(userID)
    if err != nil {
        return err
    }

    // Validate balance
    if user.Balance < amount {
        return errors.New("insufficient funds")
    }

    // Update user balance
    user.Balance -= amount
    if err := db.UpdateUser(user); err != nil {
        return err
    }

    // Create transaction record
    transaction := Transaction{
        UserID: userID,
        Amount: amount,
        Type: "payment",
        Date: time.Now(),
    }
    if err := db.SaveTransaction(transaction); err != nil {
        // Inconsistent state if this fails!
        return err
    }

    // Send notification
    if err := notifier.SendPaymentConfirmation(userID, amount); err != nil {
        log.Printf("Failed to send notification: %v", err)
        // Continue anyway
    }

    return nil
}
```

```go
// ✅ GOOD: Pure functions with isolated side effects
// Pure function: validates and calculates new balance
func ValidatePayment(balance, amount float64) (float64, error) {
    if balance < amount {
        return 0, errors.New("insufficient funds")
    }
    return balance - amount, nil
}

// Pure function: creates transaction data
func CreateTransaction(userID string, amount float64, txType string, timestamp time.Time) Transaction {
    return Transaction{
        UserID: userID,
        Amount: amount,
        Type: txType,
        Date: timestamp,
    }
}

// Impure function that orchestrates the process
func ProcessPayment(userID string, amount float64, db Database, notifier NotificationService) error {
    // Wrap everything in a transaction for consistency
    return db.WithTransaction(func(tx DatabaseTx) error {
        // Load data
        user, err := tx.GetUser(userID)
        if err != nil {
            return fmt.Errorf("failed to get user: %w", err)
        }

        // Pure business logic
        newBalance, err := ValidatePayment(user.Balance, amount)
        if err != nil {
            return err
        }

        // Create transaction record (pure)
        transaction := CreateTransaction(userID, amount, "payment", time.Now())

        // Side effects grouped together
        if err := tx.UpdateUserBalance(userID, newBalance); err != nil {
            return fmt.Errorf("failed to update balance: %w", err)
        }

        if err := tx.SaveTransaction(transaction); err != nil {
            return fmt.Errorf("failed to save transaction: %w", err)
        }

        // Non-critical side effect outside the transaction
        go func() {
            if err := notifier.SendPaymentConfirmation(userID, amount); err != nil {
                log.Printf("Failed to send notification: %v", err)
            }
        }()

        return nil
    })
}
```

## Related Bindings

- [immutable-by-default](../../docs/bindings/core/immutable-by-default.md): Pure functions and immutability are
  two sides of the same coin. Immutability ensures data doesn't change after creation,
  while pure functions ensure behavior doesn't have hidden side effects. Together, they
  create a predictable system where data flows through transformations without
  unexpected mutations. When you follow both bindings, you gain compounding benefits in
  terms of code simplicity and testability.

- [dependency-inversion](../../docs/bindings/core/dependency-inversion.md): Pure functions support dependency
  inversion by making dependencies explicit. When functions only rely on their inputs,
  they're naturally decoupled from implementation details. Both bindings push you toward
  code where components interact through clear interfaces rather than hidden shared
  state or direct knowledge of internals.

- [hex-domain-purity](../../docs/bindings/core/hex-domain-purity.md): Hexagonal architecture and pure functions
  complement each other perfectly. The domain layer in a hexagonal architecture should
  consist primarily of pure functions that implement business rules, while side effects
  are pushed to the adapters at the boundaries. This binding provides specific guidance
  on how to implement the "pure domain" aspect of hexagonal architecture.

- [no-internal-mocking](../../docs/bindings/core/no-internal-mocking.md): Pure functions dramatically reduce the
  need for mocking in tests. When functions have no side effects and depend only on
  their inputs, you can test them by providing inputs and asserting on outputs—no mocks
  required. This directly supports our no-internal-mocking binding by making code
  naturally testable without complex test doubles.
