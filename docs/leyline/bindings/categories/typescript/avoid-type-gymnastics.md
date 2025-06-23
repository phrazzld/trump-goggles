---
id: avoid-type-gymnastics
last_modified: '2025-06-17'
version: '0.1.0'
derived_from: simplicity
enforced_by: 'code review, type complexity linting, team guidelines'
---

# Binding: Avoid TypeScript Type Gymnastics

Use TypeScript for developer productivity—autocomplete, basic safety, and refactoring confidence—not as a way to encode complex business logic in the type system. Prefer simple, readable types over clever type gymnastics. Remember that types are deleted at runtime; they serve developers, not the computer.

## Rationale

Grug teaches that type systems should make development easier, not harder. TypeScript's main benefits are IDE support (autocomplete, navigation), catching obvious mistakes (typos, wrong arguments), and enabling confident refactoring. These benefits come from basic typing, not from complex generic manipulations or type-level programming.

The complexity demon loves TypeScript because it whispers seductive lies: "This mapped type will make your API perfectly type-safe." "This conditional type will prevent all possible misuse." "This template literal type will encode your business rules." But these sophisticated types often create more problems than they solve—they're difficult to debug, impossible for junior developers to understand, and brittle when requirements change.

TypeScript should feel like a helpful assistant, not a puzzle to solve. When you find yourself fighting the type system, step back and ask: "Am I serving the types, or are the types serving me?" Choose boring, obvious types that make your code easier to work with, not harder.

## Rule Definition

**MUST** prioritize code readability over type sophistication.

**MUST** use `any` when fighting complex type inference wastes significant development time.

**SHOULD** prefer explicit, simple types over inferred complex types.

**SHOULD** limit generic constraints to essential cases, not theoretical completeness.

**SHOULD** avoid template literal types, conditional types, and mapped types unless they solve specific problems.

## Pragmatic TypeScript Philosophy

### Types Serve Developers, Not Computers

**✅ Good: Types for developer productivity**
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
}

function getUserDisplayName(user: User): string {
  return user.name || user.email; // IDE knows these properties exist
}
```

**❌ Bad: Types as academic exercise**
```typescript
// Overly complex mapped type that doesn't add real value
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends (infer U)[]
    ? DeepReadonlyArray<U>
    : T[P] extends ReadonlyArray<infer U>
    ? DeepReadonlyArray<U>
    : T[P] extends object
    ? DeepReadonly<T[P]>
    : T[P];
};

interface DeepReadonlyArray<T> extends ReadonlyArray<DeepReadonly<T>> {}

// When you could just use readonly where it matters
```

### When to Use `any` (Yes, Really)

**✅ Third-party library without types:**
```typescript
// Don't spend hours writing complex type definitions for libraries you don't control
const weirdLibrary: any = require('some-weird-library');
const result = weirdLibrary.doSomething(); // any is honest about unknown shape
```

**✅ Complex data transformation:**
```typescript
// When the type transformation is more complex than the actual logic
function processApiResponse(response: any): ProcessedData {
  // Focus on the logic, not type gymnastics
  return {
    id: response.data?.id || 'unknown',
    name: response.data?.attributes?.name || 'Unknown',
    // ...clear transformation logic
  };
}
```

**✅ Prototyping and iteration:**
```typescript
// During rapid prototyping, don't let types slow you down
function experimentalFeature(data: any): any {
  // Once the logic is stable, then add proper types
  const result = complexExperimentalLogic(data);
  return result;
}
```

**❌ Bad use of `any`:**
```typescript
// Laziness when simple types would work
function addUser(user: any): any { // Should be typed
  return database.save(user);
}
```

## Simple Type Patterns

### Prefer Union Types Over Complex Inheritance

**✅ Simple and clear:**
```typescript
type DatabaseConfig = {
  type: 'postgres';
  host: string;
  port: number;
  database: string;
} | {
  type: 'sqlite';
  filename: string;
} | {
  type: 'memory';
};

function connectToDatabase(config: DatabaseConfig) {
  switch (config.type) {
    case 'postgres':
      return connectPostgres(config); // TypeScript knows postgres properties
    case 'sqlite':
      return connectSqlite(config);   // TypeScript knows sqlite properties
    case 'memory':
      return connectMemory();
  }
}
```

**❌ Complex inheritance hierarchy:**
```typescript
abstract class DatabaseConfig {
  abstract type: string;
  abstract connect(): Connection;
}

class PostgresConfig extends DatabaseConfig {
  // ... complex inheritance structure
}
// More ceremony than value for simple configuration
```

### Use Basic Generics, Avoid Complex Constraints

**✅ Simple generics for basic reuse:**
```typescript
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

function apiCall<T>(url: string): Promise<ApiResponse<T>> {
  // Generic provides type safety without complexity
  return fetch(url).then(r => r.json());
}
```

**❌ Over-constrained generics:**
```typescript
// Unnecessarily complex constraints
interface Repository<
  T extends { id: string | number },
  K extends keyof T,
  U extends T[K] extends string ? string : never
> {
  findBy(key: K, value: U): Promise<T[]>;
}

// When you could just use:
interface SimpleRepository<T> {
  findBy(key: string, value: any): Promise<T[]>;
}
```

### Explicit Types Over Complex Inference

**✅ Clear and explicit:**
```typescript
interface CreateUserRequest {
  name: string;
  email: string;
  role: string;
}

interface CreateUserResponse {
  id: string;
  success: boolean;
}

function createUser(request: CreateUserRequest): Promise<CreateUserResponse> {
  // Types are immediately clear to any reader
  return api.post('/users', request);
}
```

**❌ Inferred complexity:**
```typescript
// Relying on complex inference
const createUser = (request: Parameters<typeof api.post>[1]) =>
  api.post('/users', request) as Promise<ReturnType<typeof userCreationHandler>>;
// What are the actual types? Nobody knows without deep investigation
```

## TypeScript Complexity Anti-Patterns

### Common Anti-Patterns

**❌ Template Literal Types:** Encoding routing logic in types instead of runtime validation
**❌ Complex Conditionals:** Nested conditional types when simple functions work better
**❌ Mapped Type Overuse:** Complex transformations better handled at runtime

**✅ Simple Alternatives:** Use basic types and runtime validation for complex logic

## Practical Guidelines

**API Integration:** Start with basic interfaces, add fields as discovered
**Component Props:** Simple prop interfaces with union types for variants
**Data Modeling:** Model only properties you actually access
**Event Handling:** Use discriminated unions for simple event types

## Code Review Red Flags

**🚨 Type requires TypeScript handbook to understand**
**🚨 Error messages longer than the code**
**🚨 More time spent on types than business logic**

## Green Flags

**✅ Autocomplete helps remember APIs**
**✅ Compiler catches real bugs**
**✅ Refactoring is confident and fast**

## Migration Strategy

**Step 1:** Identify slow compilation and complex error messages
**Step 2:** Replace complex generics with simple types
**Step 3:** Use `// @ts-ignore` for stubborn third-party library issues

## Success Metrics

**Development Velocity:**
- Faster TypeScript compilation times
- Reduced time spent debugging type errors
- Quicker onboarding for new team members

**Code Quality:**
- More readable type definitions
- Fewer complex type-related bugs
- Better IDE performance and autocomplete

**Team Satisfaction:**
- Less frustration with type system fights
- More focus on business logic
- Increased confidence in refactoring

## Related Patterns

**Simplicity Above All:** TypeScript types should make code simpler to understand and maintain, not more complex.

**No Any Suppression:** When `any` is the honest answer, use it rather than fighting complex type inference.

**80/20 Solution Patterns:** Focus on the 20% of typing that provides 80% of the benefits (autocomplete, basic safety).
