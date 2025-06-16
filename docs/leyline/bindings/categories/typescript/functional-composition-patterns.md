---
id: functional-composition-patterns
last_modified: '2025-06-03'
version: '0.1.0'
derived_from: dry-dont-repeat-yourself
enforced_by: 'TypeScript compiler, functional programming libraries, code review'
---
# Binding: Eliminate Knowledge Duplication Through TypeScript Functional Composition

Use TypeScript's type system and functional programming patterns to create reusable, composable logic that eliminates duplication while maintaining type safety. Build libraries of pure functions, higher-order functions, and generic utilities that can be combined to solve complex problems without repeating knowledge or implementation patterns.

## Rationale

This binding implements our DRY (Don't Repeat Yourself) tenet by using functional composition to create single, authoritative representations of knowledge that can be reused across different contexts. Functional programming principles naturally align with DRY because they encourage breaking complex operations into smaller, reusable functions that can be composed to create larger behaviors.

Think of functional composition like building with LEGO blocks. Each function is like a specialized LEGO piece with a specific shape and purpose—a gear, a wheel, a connector. You don't need to remake the wheel every time you build a car; you reuse the existing wheel piece. Similarly, functional composition lets you create a library of "computational LEGO blocks" where each function has a single, well-defined responsibility. When you need to solve a complex problem, you snap together existing pieces rather than building everything from scratch.

Without functional composition, codebases often develop what could be called "copy-paste inheritance"—the same logic patterns appear repeatedly with slight variations, leading to maintenance nightmares when that logic needs to change. TypeScript's type system provides the "instruction manual" for these LEGO blocks, ensuring that pieces fit together correctly and warning you when you're trying to connect incompatible parts. This combination of functional composition and strong typing creates a development environment where reusing existing knowledge is easier and safer than duplicating it.

## Rule Definition

Functional composition patterns must establish these TypeScript-specific practices:

- **Pure Function Design**: Create functions without side effects that return the same output for the same input. Pure functions are the building blocks of reliable composition.

- **Higher-Order Function Utilities**: Build functions that take other functions as parameters or return functions, enabling behavior composition and code reuse across different contexts.

- **Type-Safe Function Composition**: Use TypeScript's generic system to create composable functions that maintain type safety throughout the composition chain.

- **Monadic Error Handling**: Implement Result/Option types and monadic patterns to handle errors and null values functionally, eliminating repetitive error-handling boilerplate.

- **Generic Utility Libraries**: Create strongly-typed utility functions that work across different data types while maintaining compile-time safety and IDE support.

- **Pipeline and Point-Free Style**: Use function composition and pipeline operators to create readable, declarative code that focuses on data transformation rather than implementation details.

**Composition Patterns:**
- Function composition (`compose`, `pipe` operators)
- Currying and partial application
- Higher-order functions (map, filter, reduce extensions)
- Monadic operations (Result, Option, Either types)
- Generic constraint utilities

**Reusable Logic Categories:**
- Data validation and transformation
- Async operation orchestration
- Error handling and recovery
- State transformation patterns
- Collection manipulation utilities

## Practical Implementation

1. **Build Type-Safe Utility Function Libraries**: Create reusable utility functions with strong typing:

   ```typescript
   // ✅ GOOD: Type-safe utility functions that eliminate duplication

   // Generic data transformation utilities
   export const pipe = <T>(...fns: Array<(arg: T) => T>) => (value: T): T =>
     fns.reduce((acc, fn) => fn(acc), value);

   export const compose = <T>(...fns: Array<(arg: T) => T>) => (value: T): T =>
     pipe(...fns.reverse())(value);

   // Type-safe property access
   export const prop = <T, K extends keyof T>(key: K) => (obj: T): T[K] => obj[key];

   export const pick = <T, K extends keyof T>(keys: K[]) => (obj: T): Pick<T, K> =>
     keys.reduce((result, key) => ({ ...result, [key]: obj[key] }), {} as Pick<T, K>);

   export const omit = <T, K extends keyof T>(keys: K[]) => (obj: T): Omit<T, K> => {
     const result = { ...obj };
     keys.forEach(key => delete result[key]);
     return result;
   };

   // Array transformation utilities
   export const groupBy = <T, K extends string | number>(
     keyFn: (item: T) => K
   ) => (array: T[]): Record<K, T[]> =>
     array.reduce((groups, item) => {
       const key = keyFn(item);
       return {
         ...groups,
         [key]: [...(groups[key] || []), item]
       };
     }, {} as Record<K, T[]>);

   export const uniqueBy = <T, K>(keyFn: (item: T) => K) => (array: T[]): T[] => {
     const seen = new Set<K>();
     return array.filter(item => {
       const key = keyFn(item);
       if (seen.has(key)) return false;
       seen.add(key);
       return true;
     });
   };

   // Usage: Compose utilities for specific business logic
   interface User {
     id: string;
     name: string;
     email: string;
     department: string;
     active: boolean;
   }

   const getActiveUsersByDepartment = pipe(
     (users: User[]) => users.filter(user => user.active),
     groupBy((user: User) => user.department),
   );

   const getUserSummaries = pipe(
     (users: User[]) => users.filter(user => user.active),
     (users: User[]) => users.map(pick(['id', 'name', 'email'])),
     uniqueBy((user: Pick<User, 'id' | 'name' | 'email'>) => user.email)
   );
   ```

2. **Implement Monadic Error Handling Patterns**: Create Result/Option types for consistent error handling:

   ```typescript
   // ✅ GOOD: Monadic error handling that eliminates repetitive try-catch patterns

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

   // Result construction functions
   export const success = <T>(data: T): Success<T> => ({ success: true, data });
   export const failure = <E>(error: E): Failure<E> => ({ success: false, error });

   // Monadic operations
   export const map = <T, U, E>(fn: (value: T) => U) => (result: Result<T, E>): Result<U, E> =>
     result.success ? success(fn(result.data)) : result;

   export const flatMap = <T, U, E>(fn: (value: T) => Result<U, E>) => (result: Result<T, E>): Result<U, E> =>
     result.success ? fn(result.data) : result;

   export const mapError = <T, E, F>(fn: (error: E) => F) => (result: Result<T, E>): Result<T, F> =>
     result.success ? result : failure(fn(result.error));

   export const getOrElse = <T>(defaultValue: T) => <E>(result: Result<T, E>): T =>
     result.success ? result.data : defaultValue;

   export const fold = <T, E, U>(
     onSuccess: (data: T) => U,
     onFailure: (error: E) => U
   ) => (result: Result<T, E>): U =>
     result.success ? onSuccess(result.data) : onFailure(result.error);

   // Async Result utilities
   export const fromPromise = async <T>(promise: Promise<T>): Promise<Result<T, Error>> => {
     try {
       const data = await promise;
       return success(data);
     } catch (error) {
       return failure(error instanceof Error ? error : new Error(String(error)));
     }
   };

   // Usage: Eliminate repetitive error handling patterns
   interface UserProfile {
     id: string;
     email: string;
     preferences: UserPreferences;
   }

   interface UserPreferences {
     theme: 'light' | 'dark';
     notifications: boolean;
   }

   const validateEmail = (email: string): Result<string, string> =>
     email.includes('@') && email.includes('.')
       ? success(email)
       : failure('Invalid email format');

   const validatePreferences = (prefs: unknown): Result<UserPreferences, string> => {
     if (typeof prefs !== 'object' || prefs === null) {
       return failure('Preferences must be an object');
     }

     const p = prefs as any;
     if (!['light', 'dark'].includes(p.theme)) {
       return failure('Theme must be light or dark');
     }

     if (typeof p.notifications !== 'boolean') {
       return failure('Notifications must be boolean');
     }

     return success({
       theme: p.theme,
       notifications: p.notifications
     });
   };

   // Compose validation functions
   const createUserProfile = (data: {
     id: string;
     email: string;
     preferences: unknown;
   }): Result<UserProfile, string> => {
     const emailResult = validateEmail(data.email);
     if (!emailResult.success) return emailResult;

     const preferencesResult = validatePreferences(data.preferences);
     if (!preferencesResult.success) return preferencesResult;

     return success({
       id: data.id,
       email: emailResult.data,
       preferences: preferencesResult.data
     });
   };

   // Alternative: Use monadic composition
   const createUserProfileMonadic = (data: {
     id: string;
     email: string;
     preferences: unknown;
   }): Result<UserProfile, string> =>
     pipe(
       validateEmail(data.email),
       flatMap(email =>
         pipe(
           validatePreferences(data.preferences),
           map(preferences => ({
             id: data.id,
             email,
             preferences
           }))
         )
       )
     );
   ```

3. **Create Higher-Order Functions for Behavior Composition**: Build reusable function combinators:

   ```typescript
   // ✅ GOOD: Higher-order functions that enable behavior reuse

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

         if (attempt === maxAttempts) {
           throw lastError;
         }

         await new Promise(resolve => setTimeout(resolve, delay * attempt));
       }
     }

     throw lastError!;
   };

   export const withTimeout = <T extends unknown[], R>(
     timeoutMs: number
   ) => (fn: (...args: T) => Promise<R>) => async (...args: T): Promise<R> => {
     const timeoutPromise = new Promise<never>((_, reject) =>
       setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs)
     );

     return Promise.race([fn(...args), timeoutPromise]);
   };

   export const withCaching = <T extends unknown[], R>(
     keyFn: (...args: T) => string,
     ttlMs: number = 300000 // 5 minutes default
   ) => {
     const cache = new Map<string, { value: R; expires: number }>();

     return (fn: (...args: T) => Promise<R>) => async (...args: T): Promise<R> => {
       const key = keyFn(...args);
       const now = Date.now();
       const cached = cache.get(key);

       if (cached && cached.expires > now) {
         return cached.value;
       }

       const result = await fn(...args);
       cache.set(key, { value: result, expires: now + ttlMs });

       return result;
     };
   };

   // Function composition utilities
   export const throttle = <T extends unknown[], R>(
     delayMs: number
   ) => (fn: (...args: T) => R) => {
     let lastCall = 0;
     let lastResult: R;

     return (...args: T): R => {
       const now = Date.now();
       if (now - lastCall >= delayMs) {
         lastCall = now;
         lastResult = fn(...args);
       }
       return lastResult;
     };
   };

   export const debounce = <T extends unknown[], R>(
     delayMs: number
   ) => (fn: (...args: T) => R) => {
     let timeoutId: NodeJS.Timeout;

     return (...args: T): Promise<R> => {
       return new Promise((resolve) => {
         clearTimeout(timeoutId);
         timeoutId = setTimeout(() => {
           resolve(fn(...args));
         }, delayMs);
       });
     };
   };

   // Usage: Compose behaviors without duplication
   interface UserService {
     fetchUser(id: string): Promise<User>;
     updateUser(id: string, updates: Partial<User>): Promise<User>;
   }

   class ApiUserService implements UserService {
     private apiClient: ApiClient;

     constructor(apiClient: ApiClient) {
       this.apiClient = apiClient;
     }

     // Apply multiple behaviors through composition
     fetchUser = pipe(
       withCaching((id: string) => `user:${id}`, 300000), // 5-minute cache
       withRetry(3, 1000), // 3 retries with backoff
       withTimeout(5000) // 5-second timeout
     )(async (id: string): Promise<User> => {
       const response = await this.apiClient.get(`/users/${id}`);
       return response.data;
     });

     updateUser = pipe(
       withRetry(2, 500), // 2 retries for updates
       withTimeout(10000) // Longer timeout for updates
     )(async (id: string, updates: Partial<User>): Promise<User> => {
       const response = await this.apiClient.patch(`/users/${id}`, updates);
       return response.data;
     });
   }
   ```

4. **Build Type-Safe Data Transformation Pipelines**: Create composable data transformation functions:

   ```typescript
   // ✅ GOOD: Type-safe data transformation pipelines

   // Data transformation utilities
   export const transform = <T, U>(transformFn: (data: T) => U) => transformFn;

   export const filter = <T>(predicate: (item: T) => boolean) => (array: T[]): T[] =>
     array.filter(predicate);

   export const sort = <T>(compareFn: (a: T, b: T) => number) => (array: T[]): T[] =>
     [...array].sort(compareFn);

   export const take = (count: number) => <T>(array: T[]): T[] =>
     array.slice(0, count);

   export const skip = (count: number) => <T>(array: T[]): T[] =>
     array.slice(count);

   export const partition = <T>(predicate: (item: T) => boolean) => (array: T[]): [T[], T[]] =>
     array.reduce(
       ([pass, fail], item) => predicate(item) ? [[...pass, item], fail] : [pass, [...fail, item]],
       [[], []] as [T[], T[]]
     );

   // Advanced transformation utilities
   export const reduceBy = <T, K extends string | number, R>(
     keyFn: (item: T) => K,
     reduceFn: (acc: R, item: T) => R,
     initialValue: R
   ) => (array: T[]): Record<K, R> =>
     array.reduce((acc, item) => {
       const key = keyFn(item);
       return {
         ...acc,
         [key]: reduceFn(acc[key] || initialValue, item)
       };
     }, {} as Record<K, R>);

   export const chunk = <T>(size: number) => (array: T[]): T[][] => {
     const chunks: T[][] = [];
     for (let i = 0; i < array.length; i += size) {
       chunks.push(array.slice(i, i + size));
     }
     return chunks;
   };

   // Usage: Build complex data processing pipelines
   interface Order {
     id: string;
     customerId: string;
     items: OrderItem[];
     status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
     createdAt: Date;
     total: number;
   }

   interface OrderItem {
     productId: string;
     name: string;
     price: number;
     quantity: number;
   }

   interface OrderSummary {
     orderId: string;
     customerId: string;
     itemCount: number;
     total: number;
     status: string;
   }

   // Composable transformation pipeline
   const processOrdersForDashboard = pipe(
     filter((order: Order) => order.status !== 'cancelled'),
     sort((a: Order, b: Order) => b.createdAt.getTime() - a.createdAt.getTime()),
     take(100),
     (orders: Order[]) => orders.map(transform((order: Order): OrderSummary => ({
       orderId: order.id,
       customerId: order.customerId,
       itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
       total: order.total,
       status: order.status
     })))
   );

   // Revenue analysis pipeline
   const analyzeRevenueByCustomer = pipe(
     filter((order: Order) => ['delivered', 'shipped'].includes(order.status)),
     groupBy((order: Order) => order.customerId),
     (grouped: Record<string, Order[]>) => Object.entries(grouped).map(([customerId, orders]) => ({
       customerId,
       totalOrders: orders.length,
       totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
       averageOrderValue: orders.reduce((sum, order) => sum + order.total, 0) / orders.length,
       lastOrderDate: Math.max(...orders.map(order => order.createdAt.getTime()))
     })),
     sort((a, b) => b.totalRevenue - a.totalRevenue)
   );
   ```

5. **Create Async Operation Composition Utilities**: Build reusable patterns for async workflows:

   ```typescript
   // ✅ GOOD: Async operation composition patterns

   // Parallel execution utilities
   export const parallel = <T>(tasks: Array<() => Promise<T>>): Promise<T[]> =>
     Promise.all(tasks.map(task => task()));

   export const parallelLimit = <T>(
     limit: number
   ) => async (tasks: Array<() => Promise<T>>): Promise<T[]> => {
     const results: T[] = [];
     const executing: Promise<void>[] = [];

     for (const task of tasks) {
       const promise = task().then(result => {
         results.push(result);
       });

       executing.push(promise);

       if (executing.length >= limit) {
         await Promise.race(executing);
         executing.splice(executing.findIndex(p => p === promise), 1);
       }
     }

     await Promise.all(executing);
     return results;
   };

   // Sequential execution utilities
   export const sequence = async <T>(tasks: Array<() => Promise<T>>): Promise<T[]> => {
     const results: T[] = [];
     for (const task of tasks) {
       results.push(await task());
     }
     return results;
   };

   export const reduceAsync = <T, R>(
     reduceFn: (acc: R, item: T, index: number) => Promise<R>,
     initialValue: R
   ) => async (items: T[]): Promise<R> => {
     let accumulator = initialValue;
     for (let i = 0; i < items.length; i++) {
       accumulator = await reduceFn(accumulator, items[i], i);
     }
     return accumulator;
   };

   // Error handling utilities
   export const fallback = <T>(fallbackValue: T) => async (promise: Promise<T>): Promise<T> => {
     try {
       return await promise;
     } catch {
       return fallbackValue;
     }
   };

   export const chain = <T, U>(fn: (value: T) => Promise<U>) => async (promise: Promise<T>): Promise<U> =>
     fn(await promise);

   // Usage: Compose async operations without duplication
   interface EmailService {
     sendEmail(to: string, subject: string, body: string): Promise<void>;
   }

   interface NotificationService {
     sendPush(userId: string, message: string): Promise<void>;
   }

   interface UserRepository {
     findByIds(ids: string[]): Promise<User[]>;
   }

   class OrderNotificationService {
     constructor(
       private emailService: EmailService,
       private notificationService: NotificationService,
       private userRepository: UserRepository
     ) {}

     // Composed async workflow
     async notifyOrderShipped(orderIds: string[]): Promise<void> {
       const processOrders = pipe(
         (ids: string[]) => ids.map(id => () => this.fetchOrderDetails(id)),
         parallelLimit(5), // Process 5 orders at a time
         chain((orders: Order[]) =>
           pipe(
             (orders: Order[]) => orders.map(order => order.customerId),
             uniqueBy((id: string) => id),
             (customerIds: string[]) => this.userRepository.findByIds(customerIds)
           )(orders).then(customers =>
             pipe(
               (orders: Order[]) => orders.map(order => ({
                 order,
                 customer: customers.find(c => c.id === order.customerId)!
               })),
               (orderCustomerPairs: Array<{ order: Order; customer: User }>) =>
                 orderCustomerPairs.map(({ order, customer }) => () =>
                   this.sendShippingNotifications(order, customer)
                 ),
               parallelLimit(3) // Send 3 notifications at a time
             )(orders)
           )
         )
       );

       await processOrders(orderIds);
     }

     private async fetchOrderDetails(orderId: string): Promise<Order> {
       // Implementation
       throw new Error('Not implemented');
     }

     private async sendShippingNotifications(order: Order, customer: User): Promise<void> {
       const emailTask = () => this.emailService.sendEmail(
         customer.email,
         'Your order has shipped!',
         `Order ${order.id} is on its way.`
       );

       const pushTask = () => this.notificationService.sendPush(
         customer.id,
         `Order ${order.id} has shipped!`
       );

       // Send both notifications in parallel, don't fail if one fails
       await parallel([
         fallback(undefined)(emailTask()),
         fallback(undefined)(pushTask())
       ]);
     }
   }
   ```

## Examples

```typescript
// ❌ BAD: Duplicated validation logic across different contexts
function validateUserRegistration(data: any): string[] {
  const errors: string[] = [];

  if (!data.email || typeof data.email !== 'string') {
    errors.push('Email is required');
  } else if (!data.email.includes('@') || !data.email.includes('.')) {
    errors.push('Email format is invalid');
  }

  if (!data.password || typeof data.password !== 'string') {
    errors.push('Password is required');
  } else if (data.password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }

  if (!data.name || typeof data.name !== 'string') {
    errors.push('Name is required');
  } else if (data.name.trim().length === 0) {
    errors.push('Name cannot be empty');
  }

  return errors;
}

function validateUserUpdate(data: any): string[] {
  const errors: string[] = [];

  // Duplicated email validation
  if (data.email !== undefined) {
    if (typeof data.email !== 'string') {
      errors.push('Email must be a string');
    } else if (!data.email.includes('@') || !data.email.includes('.')) {
      errors.push('Email format is invalid');
    }
  }

  // Duplicated password validation
  if (data.password !== undefined) {
    if (typeof data.password !== 'string') {
      errors.push('Password must be a string');
    } else if (data.password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }
  }

  // Duplicated name validation
  if (data.name !== undefined) {
    if (typeof data.name !== 'string') {
      errors.push('Name must be a string');
    } else if (data.name.trim().length === 0) {
      errors.push('Name cannot be empty');
    }
  }

  return errors;
}

// Problems:
// - Same validation logic duplicated across functions
// - No type safety
// - Error-prone to maintain (changes need to be made in multiple places)
// - No reusability for other validation contexts
```

```typescript
// ✅ GOOD: Reusable validation functions with composition
type ValidationResult<T> = Result<T, string[]>;

// Basic validation building blocks
const isString = (value: unknown): value is string => typeof value === 'string';
const isRequired = <T>(value: T | undefined): value is T => value !== undefined;
const hasMinLength = (min: number) => (value: string): boolean => value.length >= min;
const isEmail = (value: string): boolean => value.includes('@') && value.includes('.');
const isNotEmpty = (value: string): boolean => value.trim().length > 0;

// Generic validation function factory
const createValidator = <T>(
  validations: Array<{
    check: (value: T) => boolean;
    message: string;
  }>
) => (value: T): string[] =>
  validations
    .filter(validation => !validation.check(value))
    .map(validation => validation.message);

// Specific field validators
const validateEmail = (value: unknown): ValidationResult<string> => {
  if (!isRequired(value)) return failure(['Email is required']);
  if (!isString(value)) return failure(['Email must be a string']);

  const validator = createValidator([
    { check: isEmail, message: 'Email format is invalid' }
  ]);

  const errors = validator(value);
  return errors.length > 0 ? failure(errors) : success(value);
};

const validatePassword = (value: unknown): ValidationResult<string> => {
  if (!isRequired(value)) return failure(['Password is required']);
  if (!isString(value)) return failure(['Password must be a string']);

  const validator = createValidator([
    { check: hasMinLength(8), message: 'Password must be at least 8 characters' }
  ]);

  const errors = validator(value);
  return errors.length > 0 ? failure(errors) : success(value);
};

const validateName = (value: unknown): ValidationResult<string> => {
  if (!isRequired(value)) return failure(['Name is required']);
  if (!isString(value)) return failure(['Name must be a string']);

  const validator = createValidator([
    { check: isNotEmpty, message: 'Name cannot be empty' }
  ]);

  const errors = validator(value);
  return errors.length > 0 ? failure(errors) : success(value);
};

// Optional field validators
const validateOptionalEmail = (value: unknown): ValidationResult<string | undefined> => {
  if (value === undefined) return success(undefined);
  return validateEmail(value);
};

const validateOptionalPassword = (value: unknown): ValidationResult<string | undefined> => {
  if (value === undefined) return success(undefined);
  return validatePassword(value);
};

const validateOptionalName = (value: unknown): ValidationResult<string | undefined> => {
  if (value === undefined) return success(undefined);
  return validateName(value);
};

// Compose validators for different contexts
interface UserRegistration {
  email: string;
  password: string;
  name: string;
}

interface UserUpdate {
  email?: string;
  password?: string;
  name?: string;
}

const validateUserRegistration = (data: unknown): ValidationResult<UserRegistration> => {
  if (typeof data !== 'object' || data === null) {
    return failure(['Invalid data format']);
  }

  const obj = data as any;
  const emailResult = validateEmail(obj.email);
  const passwordResult = validatePassword(obj.password);
  const nameResult = validateName(obj.name);

  const errors = [
    ...(emailResult.success ? [] : emailResult.error),
    ...(passwordResult.success ? [] : passwordResult.error),
    ...(nameResult.success ? [] : nameResult.error)
  ];

  if (errors.length > 0) return failure(errors);

  return success({
    email: emailResult.data,
    password: passwordResult.data,
    name: nameResult.data
  });
};

const validateUserUpdate = (data: unknown): ValidationResult<UserUpdate> => {
  if (typeof data !== 'object' || data === null) {
    return failure(['Invalid data format']);
  }

  const obj = data as any;
  const emailResult = validateOptionalEmail(obj.email);
  const passwordResult = validateOptionalPassword(obj.password);
  const nameResult = validateOptionalName(obj.name);

  const errors = [
    ...(emailResult.success ? [] : emailResult.error),
    ...(passwordResult.success ? [] : passwordResult.error),
    ...(nameResult.success ? [] : nameResult.error)
  ];

  if (errors.length > 0) return failure(errors);

  return success({
    email: emailResult.data,
    password: passwordResult.data,
    name: nameResult.data
  });
};

// Benefits:
// - Single source of truth for each validation rule
// - Type-safe validation results
// - Reusable validators across different contexts
// - Easy to test individual validation rules
// - Composable for complex validation scenarios
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

  async deleteUser(id: string): Promise<void> {
    // Same retry logic duplicated again
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        const response = await fetch(`/api/users/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return;
      } catch (error) {
        attempts++;
        if (attempts >= maxAttempts) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
      }
    }

    throw new Error('Max attempts reached');
  }
}

// Problems:
// - Retry logic duplicated across all methods
// - Error handling patterns repeated
// - No centralized configuration
// - Difficult to change retry behavior globally
```

```typescript
// ✅ GOOD: Composed async utilities eliminate duplication
// Reusable async utilities (from previous examples)
const withRetry = <T extends unknown[], R>(maxAttempts: number, baseDelay: number = 1000) =>
  (fn: (...args: T) => Promise<R>) => async (...args: T): Promise<R> => {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn(...args);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (attempt === maxAttempts) throw lastError;
        await new Promise(resolve => setTimeout(resolve, baseDelay * attempt));
      }
    }

    throw lastError!;
  };

const withTimeout = <T extends unknown[], R>(timeoutMs: number) =>
  (fn: (...args: T) => Promise<R>) => async (...args: T): Promise<R> => {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs)
    );
    return Promise.race([fn(...args), timeoutPromise]);
  };

// HTTP utility with error handling
const httpRequest = async (url: string, options?: RequestInit): Promise<Response> => {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return response;
};

// Composed HTTP methods
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

const httpDelete = pipe(
  withTimeout(5000),
  withRetry(2, 1000)
)((url: string) => httpRequest(url, { method: 'DELETE' }));

class UserService {
  async fetchUser(id: string): Promise<User> {
    const response = await httpGet(`/api/users/${id}`);
    return response.json();
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const response = await httpPatch(`/api/users/${id}`, updates);
    return response.json();
  }

  async deleteUser(id: string): Promise<void> {
    await httpDelete(`/api/users/${id}`);
  }
}

// Benefits:
// - Single source of truth for retry logic
// - Timeout and retry behavior configured once
// - Easy to modify global HTTP behavior
// - Methods focus on business logic, not infrastructure concerns
// - Reusable HTTP utilities across different services
```

## Related Bindings

- [extract-common-logic.md](../../core/extract-common-logic.md): Functional composition is TypeScript's primary mechanism for extracting common logic into reusable utilities. This binding provides specific patterns for creating composable functions that eliminate duplication while maintaining type safety.

- [no-any.md](../../docs/bindings/categories/typescript/no-any.md): Type-safe functional composition depends on avoiding `any` types to maintain compile-time guarantees. Generic functions and proper type constraints ensure that composition maintains type safety throughout the transformation chain.

- [component-isolation.md](../../core/component-isolation.md): Functional composition supports component isolation by creating reusable logic that doesn't depend on specific component implementations. Pure functions can be shared across components without creating coupling.

- [dry-dont-repeat-yourself.md](../../tenets/dry-dont-repeat-yourself.md): This binding directly implements the DRY tenet by using TypeScript's functional programming capabilities to create single sources of truth for common logic patterns. Function composition enables knowledge representation that can be reused across different contexts without duplication.
