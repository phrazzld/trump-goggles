---
id: functional-composition-patterns
last_modified: '2025-06-03'
version: '0.1.0'
derived_from: dry-dont-repeat-yourself
enforced_by: 'TypeScript compiler, functional programming libraries, code review'
---
# Binding: Eliminate Knowledge Duplication Through TypeScript Functional Composition

Use TypeScript's type system and functional programming patterns to create reusable, composable logic that eliminates duplication while maintaining type safety. Build libraries of pure functions, higher-order functions, and generic utilities that combine to solve complex problems without repeating implementation patterns.

## Rationale

This binding implements DRY by using functional composition to create single, authoritative representations of knowledge reusable across different contexts. Functional programming naturally aligns with DRY by encouraging smaller, reusable functions composed to create larger behaviors.

Functional composition creates reusable function building blocks with TypeScript ensuring type-safe connections. Without it, codebases develop "copy-paste inheritance" where logic patterns repeat with variations, creating maintenance issues.

## Rule Definition

Functional composition patterns must establish these TypeScript practices:
- **Pure Function Design**: Create functions without side effects that return consistent output for same input
- **Higher-Order Function Utilities**: Build functions that take or return other functions for behavior composition
- **Type-Safe Function Composition**: Use TypeScript generics to maintain type safety throughout composition chains
- **Monadic Error Handling**: Implement Result/Option types for functional error handling
- **Generic Utility Libraries**: Create strongly-typed utilities that work across data types

**Core Patterns:** Function composition (compose, pipe), higher-order functions (map, filter, reduce), monadic operations (Result, Option types), and generic constraint utilities.
**Application Areas:** Data validation and transformation, async operation orchestration, error handling and recovery, and collection manipulation.

## Practical Implementation

1. **Build Type-Safe Utility Functions**: Create reusable utilities with strong typing:

   ```typescript
   // Generic data transformation utilities
   export const pipe = <T>(...fns: Array<(arg: T) => T>) => (value: T): T =>
     fns.reduce((acc, fn) => fn(acc), value);

   export const compose = <T>(...fns: Array<(arg: T) => T>) => (value: T): T =>
     pipe(...fns.reverse())(value);

   // Type-safe property access
   export const prop = <T, K extends keyof T>(key: K) => (obj: T): T[K] => obj[key];
   export const pick = <T, K extends keyof T>(keys: K[]) => (obj: T): Pick<T, K> =>
     keys.reduce((result, key) => ({ ...result, [key]: obj[key] }), {} as Pick<T, K>);

   // Array utilities
   export const groupBy = <T, K extends string | number>(
     keyFn: (item: T) => K
   ) => (array: T[]): Record<K, T[]> =>
     array.reduce((groups, item) => {
       const key = keyFn(item);
       return { ...groups, [key]: [...(groups[key] || []), item] };
     }, {} as Record<K, T[]>);

   // Usage: Compose utilities
   const getActiveUsersByDepartment = pipe(
     (users: User[]) => users.filter(user => user.active),
     groupBy((user: User) => user.department)
   );
   ```

2. **Implement Monadic Error Handling**: Create Result/Option types for consistent error handling:

   ```typescript
   // Result type for operations that can fail
   export type Result<T, E = Error> = Success<T> | Failure<E>;

   export interface Success<T> {
     readonly success: true;
     readonly data: T;
   }

   export interface Failure<E> {
     readonly success: false;
     readonly error: E;
   }

   // Construction functions
   export const success = <T>(data: T): Success<T> => ({ success: true, data });
   export const failure = <E>(error: E): Failure<E> => ({ success: false, error });

   // Monadic operations
   export const map = <T, U, E>(fn: (value: T) => U) => (result: Result<T, E>): Result<U, E> =>
     result.success ? success(fn(result.data)) : result;

   export const flatMap = <T, U, E>(fn: (value: T) => Result<U, E>) => (result: Result<T, E>): Result<U, E> =>
     result.success ? fn(result.data) : result;

   // Async utilities
   export const fromPromise = async <T>(promise: Promise<T>): Promise<Result<T, Error>> => {
     try {
       return success(await promise);
     } catch (error) {
       return failure(error instanceof Error ? error : new Error(String(error)));
     }
   };

   // Usage: Compose validation functions
   const validateEmail = (email: string): Result<string, string> =>
     email.includes('@') ? success(email) : failure('Invalid email');

   const createUserProfile = (data: UserData): Result<UserProfile, string> =>
     flatMap((email: string) => success({ id: data.id, email }))(validateEmail(data.email));
   ```

3. **Create Higher-Order Functions**: Build reusable function combinators:

   ```typescript
   // Async operation utilities
   export const withRetry = <T extends unknown[], R>(
     maxAttempts: number,
     delay: number = 1000
   ) => (fn: (...args: T) => Promise<R>) => async (...args: T): Promise<R> => {
     let lastError: Error;

     for (let attempt = 1; attempt <= maxAttempts; attempt++) {
       try {
         return await fn(...args);
       } catch (error) {
         lastError = error instanceof Error ? error : new Error(String(error));
         if (attempt === maxAttempts) throw lastError;
         await new Promise(resolve => setTimeout(resolve, delay * attempt));
       }
     }
     throw lastError!;
   };

   export const withTimeout = <T extends unknown[], R>(
     timeoutMs: number
   ) => (fn: (...args: T) => Promise<R>) => async (...args: T): Promise<R> => {
     const timeoutPromise = new Promise<never>((_, reject) =>
       setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs)
     );
     return Promise.race([fn(...args), timeoutPromise]);
   };

   export const withCaching = <T extends unknown[], R>(
     keyFn: (...args: T) => string,
     ttlMs: number = 300000
   ) => {
     const cache = new Map<string, { value: R; expires: number }>();

     return (fn: (...args: T) => Promise<R>) => async (...args: T): Promise<R> => {
       const key = keyFn(...args);
       const cached = cache.get(key);

       if (cached && cached.expires > Date.now()) {
         return cached.value;
       }

       const result = await fn(...args);
       cache.set(key, { value: result, expires: Date.now() + ttlMs });
       return result;
     };
   };

   // Usage: Compose behaviors
   const fetchUser = pipe(
     withCaching((id: string) => `user:${id}`, 300000),
     withRetry(3, 1000),
     withTimeout(5000)
   )((id: string) => apiClient.get(`/users/${id}`));
   ```

4. **Build Data Transformation Pipelines**: Create composable transformation functions:

   ```typescript
   // Data transformation utilities
   export const filter = <T>(predicate: (item: T) => boolean) => (array: T[]): T[] =>
     array.filter(predicate);

   export const sort = <T>(compareFn: (a: T, b: T) => number) => (array: T[]): T[] =>
     [...array].sort(compareFn);

   export const take = (count: number) => <T>(array: T[]): T[] =>
     array.slice(0, count);

   export const partition = <T>(predicate: (item: T) => boolean) => (array: T[]): [T[], T[]] =>
     array.reduce(
       ([pass, fail], item) => predicate(item) ? [[...pass, item], fail] : [pass, [...fail, item]],
       [[], []] as [T[], T[]]
     );

   // Usage: Build processing pipelines
   const processOrders = pipe(
     filter((order: Order) => order.status !== 'cancelled'),
     sort((a: Order, b: Order) => b.total - a.total),
     take(10)
   );
   ```

5. **Create Async Composition Utilities**: Build reusable async patterns:

   ```typescript
   // Parallel execution utilities
   export const parallel = <T>(tasks: Array<() => Promise<T>>): Promise<T[]> =>
     Promise.all(tasks.map(task => task()));

   export const fallback = <T>(fallbackValue: T) => async (promise: Promise<T>): Promise<T> => {
     try {
       return await promise;
     } catch {
       return fallbackValue;
     }
   };
   ```

## Examples

```typescript
// ❌ BAD: Duplicated validation logic
function validateUserRegistration(data: any): string[] {
  const errors: string[] = [];

  if (!data.email || typeof data.email !== 'string') {
    errors.push('Email is required');
  } else if (!data.email.includes('@')) {
    errors.push('Email format is invalid');
  }

  if (!data.password || typeof data.password !== 'string') {
    errors.push('Password is required');
  } else if (data.password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }

  return errors;
}

function validateUserUpdate(data: any): string[] {
  const errors: string[] = [];

  // Duplicated email validation
  if (data.email !== undefined) {
    if (typeof data.email !== 'string') {
      errors.push('Email must be a string');
    } else if (!data.email.includes('@')) {
      errors.push('Email format is invalid');
    }
  }

  // Duplicated password validation - same logic repeated
  if (data.password !== undefined) {
    if (typeof data.password !== 'string') {
      errors.push('Password must be a string');
    } else if (data.password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }
  }

  return errors;
}
```

```typescript
// ✅ GOOD: Reusable validation functions with composition
type ValidationResult<T> = Result<T, string[]>;

// Basic validation building blocks
const isString = (value: unknown): value is string => typeof value === 'string';
const isRequired = <T>(value: T | undefined): value is T => value !== undefined;
const isEmail = (value: string): boolean => value.includes('@');

// Specific field validators
const validateEmail = (value: unknown): ValidationResult<string> => {
  if (!isRequired(value)) return failure(['Email is required']);
  if (!isString(value)) return failure(['Email must be a string']);
  return isEmail(value) ? success(value) : failure(['Email format is invalid']);
};

const validatePassword = (value: unknown): ValidationResult<string> => {
  if (!isRequired(value)) return failure(['Password is required']);
  if (!isString(value)) return failure(['Password must be a string']);
  return value.length >= 8 ? success(value) : failure(['Password too short']);
};

// Compose validators
const validateUserRegistration = (data: unknown): ValidationResult<UserRegistration> => {
  if (typeof data !== 'object' || data === null) {
    return failure(['Invalid data format']);
  }

  const obj = data as any;
  const emailResult = validateEmail(obj.email);
  const passwordResult = validatePassword(obj.password);

  const errors = [
    ...(emailResult.success ? [] : emailResult.error),
    ...(passwordResult.success ? [] : passwordResult.error)
  ];

  return errors.length > 0 ? failure(errors) : success({
    email: emailResult.data,
    password: passwordResult.data
  });
};

// Benefits: Single source of truth, type-safe, reusable, composable
```

```typescript
// ❌ BAD: Repetitive async error handling and retry logic
class UserService {
  async fetchUser(id: string): Promise<User> {
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        const response = await fetch(`/api/users/${id}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
      } catch (error) {
        attempts++;
        if (attempts >= maxAttempts) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
      }
    }
    throw new Error('Max attempts reached');
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    // Same retry logic duplicated
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        const response = await fetch(`/api/users/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
      } catch (error) {
        attempts++;
        if (attempts >= maxAttempts) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
      }
    }
    throw new Error('Max attempts reached');
  }
}
```

```typescript
// ✅ GOOD: Composed async utilities eliminate duplication
const httpRequest = async (url: string, options?: RequestInit): Promise<Response> => {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return response;
};

// Composed HTTP methods using utilities from earlier examples
const httpGet = pipe(
  withTimeout(5000),
  withRetry(3, 1000)
)((url: string) => httpRequest(url));

const httpPatch = pipe(
  withTimeout(10000),
  withRetry(2, 1000)
)((url: string, data: unknown) => httpRequest(url, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
}));

class UserService {
  async fetchUser(id: string): Promise<User> {
    const response = await httpGet(`/api/users/${id}`);
    return response.json();
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const response = await httpPatch(`/api/users/${id}`, updates);
    return response.json();
  }
}

// Benefits:
// - Single source of truth for retry logic
// - Timeout and retry behavior configured once
// - Methods focus on business logic, not infrastructure
// - Reusable utilities across different services
```

## Related Bindings

- [extract-common-logic](../../core/extract-common-logic.md): Functional composition is TypeScript's primary mechanism for extracting common logic into reusable utilities that eliminate duplication while maintaining type safety.

- [no-any](../../docs/bindings/categories/typescript/no-any.md): Type-safe functional composition depends on avoiding `any` types to maintain compile-time guarantees through generic functions and proper type constraints.

- [component-isolation](../../core/component-isolation.md): Functional composition supports component isolation by creating reusable logic that doesn't depend on specific implementations.

- [dry-dont-repeat-yourself](../../tenets/dry-dont-repeat-yourself.md): This binding directly implements DRY by using TypeScript's functional programming to create single sources of truth for common logic patterns.
