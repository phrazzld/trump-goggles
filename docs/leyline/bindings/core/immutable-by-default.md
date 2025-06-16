---
derived_from: simplicity
enforced_by: linters & code review
id: immutable-by-default
last_modified: '2025-05-14'
version: '0.1.0'
---
# Binding: Treat All Data as Unchangeable by Default

Never modify data after it's created. When you need to update state, create entirely new
data structures instead of changing existing ones. Only allow direct mutation with
explicit justification, such as in critical performance hot paths with measured impact.

## Rationale

This binding directly implements our simplicity tenet by eliminating a major source of
complexity—unpredictable state changes that are difficult to trace and reason about.
When your code freely modifies existing data structures, you introduce a subtle form of
time-dependency that dramatically increases cognitive load. Each function becomes a
potential modifier of shared state, forcing developers to mentally track all possible
changes throughout the execution path.

Think of data like a recipe card in a box. When you want to make a variation of a
recipe, you don't erase and rewrite the original—you create a new card that preserves
the original while recording your changes. This ensures the original recipe remains
available for others (or your future self) and makes it clear exactly what changed
between versions. Similarly, immutable data structures provide an unambiguous history of
state changes that makes debugging, testing, and reasoning about your code dramatically
simpler.

The benefits of immutability compound over time. In complex systems, tracking mutable
state across multiple components becomes nearly impossible. Each additional point of
mutation multiplies the possible states your system can be in, creating an explosion in
complexity. By making immutability your default approach, you prevent this complexity
debt from accumulating in the first place. The slight increase in verbosity or
performance overhead is a small price to pay for the dramatic improvement in
predictability, debuggability, and long-term maintainability.

## Rule Definition

This binding establishes immutability as the default approach for all data in your
system:

- **Default to Immutability**: Consider all data immutable unless there's a compelling
  reason otherwise. This applies to:

  - Function parameters (never modify what was passed in)
  - Return values (return new objects, not modified versions of inputs)
  - Internal data structures (create new versions rather than modifying in place)
  - Shared state (manage through controlled replacement rather than direct mutation)

- **Scope of Application**: This rule applies to all types of data structures:

  - Objects/maps/dictionaries
  - Arrays/lists/collections
  - Sets and other specialized data structures
  - Domain entities and value objects
  - Configuration data

- **Permitted Exceptions**: Direct mutation is only allowed in specific circumstances:

  - Performance-critical code where immutability creates a measurable bottleneck
  - Initialization phase of objects before they become visible to other components
  - Private implementation details that maintain immutable public interfaces
  - Language-specific idioms where immutability would violate platform conventions

- **Exception Requirements**: When implementing exceptions, you must:

  - Document the specific reason for allowing mutation
  - Contain mutation to the smallest possible scope
  - Keep mutations private, never exposing mutable objects across boundaries
  - Verify with benchmarks that immutability would create a real performance issue

The rule doesn't prohibit all state changes—systems would be useless without them—but
requires that state changes happen through creation of new data structures rather than
modification of existing ones.

## Practical Implementation

Here are concrete strategies for implementing immutability across your codebase:

1. **Use Language Features for Immutability**: Leverage built-in language support
   wherever possible to make immutability the default pattern:

   - In TypeScript/JavaScript:

     ```typescript
     // Mark variables as constant to prevent reassignment
     const user = { name: "Alice", email: "alice@example.com" };

     // Use readonly for properties and array types
     interface User {
       readonly id: string;
       readonly name: string;
       readonly email: string;
       readonly permissions: readonly string[];
     }
     ```

   - In Rust:

     ```rust
     // Default to immutable bindings
     let user = User { name: "Alice", email: "alice@example.com" };

     // Only use mut when necessary
     let mut builder = UserBuilder::new();
     ```

   - In Java/Kotlin:

     ```java
     // Make fields final
     public final class User {
       private final String id;
       private final String name;

       // Constructor and getters (no setters)
     }
     ```

   - In C#:

     ```csharp
     // Use init-only properties
     public class User {
       public string Id { get; init; }
       public string Name { get; init; }
     }
     ```

1. **Implement Immutable Update Patterns**: Learn the patterns for updating immutable
   data structures in your language:

   - Spread/rest operator for objects and arrays in JavaScript/TypeScript:

     ```typescript
     // Update user properties by creating a new object
     const updatedUser = { ...user, name: "Bob" };

     // Add item to array by creating a new array
     const newItems = [...items, newItem];

     // Remove item from array by creating a new array
     const filteredItems = items.filter(item => item.id !== itemToRemove.id);
     ```

   - Builder pattern for complex objects:

     ```java
     User updatedUser = User.builder()
       .from(originalUser)  // Copy all properties from original
       .name("Bob")         // Override specific properties
       .build();            // Create new immutable instance
     ```

   - Record types in languages that support them:

     ```csharp
     // C# record types are immutable by default
     public record User(string Id, string Name, string Email);

     // Create new record with updated properties
     var updatedUser = user with { Name = "Bob" };
     ```

1. **Use Immutability Libraries**: When built-in language features aren't sufficient,
   leverage libraries specifically designed for immutable data:

   - For JavaScript/TypeScript:

     - Immer.js for simpler immutable updates
     - Immutable.js for persistent data structures
     - Redux Toolkit for immutable state management

   - For Java:

     - Immutables for generating immutable classes
     - Vavr for persistent collections

   - For other languages, seek equivalent libraries that provide:

     - Persistent data structures with efficient updates
     - Helper utilities for immutable transformations
     - Thread-safe immutable collections

1. **Apply Functional Programming Techniques**: Adopt functional patterns that work well
   with immutable data:

   - Favor pure functions that don't modify their inputs
   - Use function composition instead of sequential mutation
   - Apply transformations with map/filter/reduce instead of in-place loops
   - Implement copy-on-write when performance is a concern

1. **Enforce Through Tooling**: Use automated checks to prevent accidental mutations:

   - Configure ESLint with rules like `no-param-reassign`, `prefer-const`
   - Enable compiler flags like `-XStrict` (Haskell) or `--strict` (TypeScript)
   - Set up code reviews to specifically check for immutability violations
   - Write tests that verify objects remain unchanged when they should

## Examples

```typescript
// ❌ BAD: Mutating objects directly
function updateUserPreferences(user, preferences) {
  user.preferences = {
    ...user.preferences,
    ...preferences
  };
  return user;  // Returns same object with modified properties
}

const user = { name: "Alice", preferences: { theme: "light" } };
updateUserPreferences(user, { notifications: "all" });
// Now the original user object has been changed!

// ✅ GOOD: Creating new objects instead
function updateUserPreferences(user, preferences) {
  return {
    ...user,
    preferences: {
      ...user.preferences,
      ...preferences
    }
  };  // Returns new object with updated properties
}

const user = { name: "Alice", preferences: { theme: "light" } };
const updatedUser = updateUserPreferences(user, { notifications: "all" });
// Original user object remains unchanged
// updatedUser contains the updated preferences
```

```javascript
// ❌ BAD: Mutating arrays in place
function addItem(cart, item) {
  cart.items.push(item);         // Mutates the array in place
  cart.total += item.price;      // Mutates the total
  return cart;                   // Returns the same modified object
}

// ✅ GOOD: Creating new arrays and objects
function addItem(cart, item) {
  return {
    ...cart,
    items: [...cart.items, item],  // Creates new array with added item
    total: cart.total + item.price // Calculates new total
  };  // Returns entirely new cart object
}
```

```go
// ❌ BAD: Methods that modify the receiver
type Counter struct {
  Value int
}

func (c *Counter) Increment() {
  c.Value++  // Modifies the counter in place
}

// ✅ GOOD: Methods that return new instances
type Counter struct {
  Value int
}

func (c Counter) Increment() Counter {
  return Counter{Value: c.Value + 1}  // Returns new Counter
}

// Usage:
counter := Counter{Value: 5}
increasedCounter := counter.Increment()  // counter still has Value=5
```

```rust
// ❌ BAD: Mutation when unnecessary
fn add_tag(mut tags: Vec<String>, tag: String) -> Vec<String> {
    tags.push(tag);  // Mutates the vector in place
    tags  // Returns the same vector
}

// ✅ GOOD: Creating new collections and properly handling ownership
fn add_tag(tags: Vec<String>, tag: String) -> Vec<String> {
    let mut new_tags = tags;  // Take ownership
    new_tags.push(tag);       // Mutate locally, before it's shared
    new_tags                  // Return the new vector
}

// Alternative approach with clone
fn add_tag_clone(tags: &[String], tag: String) -> Vec<String> {
    let mut new_tags = tags.to_vec();  // Create new vector
    new_tags.push(tag);                // Add the new tag
    new_tags                           // Return the new vector
}
```

## Related Bindings

- [dependency-inversion](../../docs/bindings/core/dependency-inversion.md): Immutability and dependency inversion
  work together to make code more testable and maintainable. Immutability ensures your
  data doesn't change unexpectedly, while dependency inversion ensures your components
  are loosely coupled. Together, they dramatically reduce the complexity of
  understanding how data flows through your system.

- [hex-domain-purity](../../docs/bindings/core/hex-domain-purity.md): Domain purity and immutability are
  complementary approaches to simplifying your codebase. Domain purity keeps your
  business logic free from infrastructure concerns, while immutability ensures your data
  structures remain stable and predictable. Both reduce the cognitive load of
  understanding how your system evolves over time.

- [no-internal-mocking](../../docs/bindings/core/no-internal-mocking.md): Immutable data structures make testing
  significantly easier, supporting our no-internal-mocking binding. When components use
  immutable data, they're naturally more testable because inputs and outputs are clear
  and predictable. You can verify that functions produce the expected outputs without
  worrying about side effects on shared state.
