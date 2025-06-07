---
derived_from: explicit-over-implicit
enforced_by: eslint("@typescript-eslint/no-explicit-any") & tsconfig("noImplicitAny")
id: no-any
last_modified: '2025-05-14'
---
# Binding: Make Types Explicit, Never Use `any`

Never use the `any` type in TypeScript code. Instead, always create proper type
definitions that accurately describe your data structures and API contracts. The `any`
type defeats TypeScript's safety mechanisms and undermines the compiler's ability to
catch errors.

## Rationale

This binding implements our explicit-over-implicit tenet by requiring you to clearly
express types rather than hiding them behind an escape hatch.

Think of TypeScript's type system like a detailed map for your code. When you mark
something as `any`, it's like drawing a blank area on that map labeled "here be
dragons." While explorers once used this phrase to mark unknown territories, modern
software doesn't have room for such uncertainty. Each `any` type creates a blind spot
where TypeScript can't provide guidance, intellisense help, or error checking. These
blind spots don't stay contained—they spread outward as untyped values flow through your
system, eventually affecting parts of your code that you thought were safe.

Just as experienced travelers prefer detailed maps with clearly marked roads and
landmarks, experienced developers prefer a codebase where types are explicit and
well-defined. This clarity isn't just about preventing errors—it's about creating a
self-documenting codebase where intentions and constraints are visible to everyone.

## Rule Definition

The `any` type in TypeScript is an escape hatch that effectively opts out of type
checking. When you use `any`, you're telling the compiler to trust you blindly,
regardless of what operations you perform. Specifically:

- A value of type `any` can be assigned to any other type without type checking
- Any property can be accessed on an `any` value, regardless of whether it exists
- Any method can be called on an `any` value, regardless of whether it's defined
- Type errors involving `any` values are only discovered at runtime, if at all

This binding prohibits all uses of `any`, including:

- Explicit type annotations (`let x: any`)
- Type assertions to `any` (`someValue as any`)
- Generic type parameters using `any` (`Array<any>`)
- Implicit `any` from disabled configuration (`noImplicitAny: false`)

Instead, you must use precise types like:

- Concrete types (`string`, `number`, custom interfaces)
- Union types (`string | number`) for values that could be one of several types
- Generic types (`Array<T>`, `Map<K, V>`) for collections with consistent element types
- `unknown` when you need a top type but want to maintain type safety

## Practical Implementation

### TypeScript Configuration

1. **Enable strict type checking** in your `tsconfig.json`:

   ```json
   {
     "compilerOptions": {
       "strict": true,
       "noImplicitAny": true
     }
   }
   ```

1. **Add ESLint rules** to prevent explicit `any`:

   ```json
   {
     "rules": {
       "@typescript-eslint/no-explicit-any": "error"
     }
   }
   ```

### Alternative Approaches

1. **Use `unknown` instead of `any` for values of uncertain type**:

   ```typescript
   // Instead of:
   function process(data: any): void { /* ... */ }

   // Use:
   function process(data: unknown): void {
     // Must verify type before using
     if (typeof data === 'string') {
       console.log(data.toUpperCase());
     } else if (Array.isArray(data)) {
       data.forEach(item => console.log(item));
     }
   }
   ```

1. **Create proper interfaces for structured data**:

   ```typescript
   // Instead of:
   function processUser(user: any): void { /* ... */ }

   // Use:
   interface User {
     id: string;
     name: string;
     email?: string;
   }

   function processUser(user: User): void { /* ... */ }
   ```

1. **Use union types for values that could be one of several types**:

   ```typescript
   // Instead of:
   function getLength(value: any): number { /* ... */ }

   // Use:
   function getLength(value: string | Array<unknown>): number {
     return value.length;
   }
   ```

1. **Use generics for flexible, type-safe functions**:

   ```typescript
   // Instead of:
   function getProperty(obj: any, key: string): any { /* ... */ }

   // Use:
   function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
     return obj[key];
   }
   ```

1. **For third-party libraries without types, use declaration files or minimally-scoped
   type assertions**:

   ```typescript
   // Instead of:
   import * as untyped from 'untyped-library';
   const result = untyped.someFunction() as any;

   // Create types:
   declare module 'untyped-library' {
     export function someFunction(): SomeReturnType;
   }

   // Or use type assertions scoped to the minimum needed interface:
   import * as untyped from 'untyped-library';
   interface SomeReturnType { id: string; value: number; }
   const result = untyped.someFunction() as SomeReturnType;
   ```

### Key Benefits

- **Better error detection** — Catch type errors at compile time instead of runtime
- **Improved IDE support** — Get accurate autocomplete and inline documentation
- **Self-documenting code** — Types serve as live documentation that can't get outdated
- **Safer refactoring** — The compiler will flag affected areas when you change types
- **Fewer runtime bugs** — Many common errors become impossible when proper typing is
  enforced

## Examples

```typescript
// ❌ BAD: Using 'any' creates dangerous type holes
function processData(data: any): any {
  return data.value * 2; // No type checking! This could crash at runtime
}

const result = processData("not an object"); // Runtime error: Cannot read property 'value' of undefined
const total: number = result + 10; // TypeScript won't catch that 'result' might not be a number
```

```typescript
// ✅ GOOD: Using proper types ensures correctness
interface DataWithValue {
  value: number;
}

function processData(data: DataWithValue): number {
  return data.value * 2; // Type safe!
}

// This would error during compilation, preventing runtime issues
// const result = processData("not an object"); // Error: Argument of type 'string' is not assignable to parameter of type 'DataWithValue'

const validData = { value: 5 };
const result = processData(validData); // Works as expected: result = 10
const total: number = result + 10; // Total = 20, type safe
```

```typescript
// ❌ BAD: Using 'any' for API responses
async function fetchUserData(): Promise<any> {
  const response = await fetch('/api/user');
  return response.json();
}

// Later in code:
const user = await fetchUserData();
console.log(user.nmae); // Typo won't be caught by TypeScript
```

```typescript
// ✅ GOOD: Using interfaces for API responses
interface User {
  id: string;
  name: string;
  email: string;
}

async function fetchUserData(): Promise<User> {
  const response = await fetch('/api/user');
  return response.json() as User;
}

// Later in code:
const user = await fetchUserData();
console.log(user.nmae); // TypeScript error: Property 'nmae' does not exist on type 'User'. Did you mean 'name'?
```

```typescript
// ❌ BAD: Using 'any' for uncertain function parameters
function handleEvent(event: any) {
  // We have no idea what this event is
  event.stopPropagation();
  console.log(event.target.value);
}
```

```typescript
// ✅ GOOD: Using 'unknown' with type guards for uncertain parameters
function handleEvent(event: unknown) {
  // Type guard to check what kind of event this is
  if (isMouseEvent(event)) {
    event.stopPropagation();
    console.log('Mouse position:', event.clientX, event.clientY);
  } else if (isKeyboardEvent(event)) {
    event.stopPropagation();
    console.log('Key pressed:', event.key);
  }
}

// Type guard functions
function isMouseEvent(event: unknown): event is MouseEvent {
  return event instanceof MouseEvent;
}

function isKeyboardEvent(event: unknown): event is KeyboardEvent {
  return event instanceof KeyboardEvent;
}
```

## Real-World Impact Example

Here's a subtle bug that TypeScript's type system would catch if you avoid `any`:

```typescript
// With 'any', this silent bug makes it to production:
function processUserInput(input: any) {
  if (input.isValid) {
    saveToDatabase(input.userData);
  }
}

// Someone calls the function with a typo:
processUserInput({ isvalid: true, userData: { name: "User" } }); // Note lowercase 'v' in 'isvalid'

// Result: Nothing gets saved, but no errors are thrown - silent failure!
```

With proper typing, this bug would be caught at compile time:

```typescript
interface UserInput {
  isValid: boolean;
  userData: { name: string };
}

function processUserInput(input: UserInput) {
  if (input.isValid) {
    saveToDatabase(input.userData);
  }
}

// TypeScript error: Property 'isValid' is missing in type '{ isvalid: boolean; userData: { name: string; }; }'
processUserInput({ isvalid: true, userData: { name: "User" } });
```

## Related Bindings

- [external-configuration](../../docs/bindings/core/external-configuration.md) - Type safety extends to
  configuration, preventing undefined configuration values from causing runtime failures
- [immutable-by-default](../../docs/bindings/core/immutable-by-default.md) - Type safety works best with
  immutable data, creating a stronger guarantee of correctness
- [no-lint-suppression](../../docs/bindings/core/no-lint-suppression.md) - Enforces that developers don't
  suppress TypeScript type errors or linter warnings without documented justification
- [hex-domain-purity](../../docs/bindings/core/hex-domain-purity.md) - Well-typed domain code ensures business
  logic operates on valid, properly structured data
