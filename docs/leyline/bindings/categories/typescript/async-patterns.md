---
derived_from: simplicity
id: async-patterns
last_modified: '2025-05-14'
enforced_by: code review & style guides
---
# Binding: Structure TypeScript Async Code with Best Practices

Use async/await for all asynchronous operations in TypeScript, with proper error
handling, cancellation patterns, and explicit typing. Asynchronous code must be
structured for readability, testability, and robustness, avoiding common pitfalls like
unhandled promises, excessive nesting, and missing error management.

## Rationale

This binding implements our simplicity tenet by addressing one of the most common
sources of complexity in modern JavaScript and TypeScript applications: asynchronous
code flow.

Asynchronous programming is inherently more complex than synchronous code. It introduces
temporal coupling, error propagation challenges, and cognitive overhead due to its
non-linear execution. When not managed properly, async code quickly becomes a breeding
ground for subtle bugs, race conditions, and unhandled exceptions that manifest in
unpredictable ways.

Think of async code like a choreographed dance where multiple dancers need to coordinate
their movements without being able to directly speak to each other. When this dance is
properly orchestrated with clear patterns and signals, it appears elegant and flows
naturally. But when coordination breaks down, dancers collide, steps are performed out
of sequence, and the entire performance falls apart. Similarly, well-structured async
code with consistent patterns feels intuitive and reliable, while poorly managed async
operations lead to race conditions, memory leaks, and error states that are
exceptionally difficult to reproduce and debug.

By establishing clear, consistent patterns for async code, we create predictability that
reduces the mental overhead needed to understand program flow. This predictability is
especially important because async bugs are among the hardest to diagnose—they often
involve timing issues that don't appear consistently in testing and may only manifest
under specific load conditions in production. Good async patterns serve as guardrails
that prevent entire categories of errors from occurring in the first place.

## Rule Definition

This binding establishes clear requirements for async code patterns in TypeScript:

- **Async/Await Usage**:

  - MUST use `async`/`await` syntax for all asynchronous operations, rather than direct
    Promise chains with `.then()` and `.catch()`
  - `Promise.all()`, `Promise.race()` and other Promise combinators MAY be used with
    `await` for concurrent operations
  - MUST always declare functions that return Promises with the `async` keyword
  - MUST explicitly type async functions with `Promise<T>` for their return values

- **Error Handling**:

  - MUST wrap `await` expressions in `try/catch` blocks to handle potential errors
  - MUST NOT have unhandled Promise rejections or uncaught exceptions from async code
  - SHOULD create specific error subclasses that extend `Error` for different error
    categories
  - MUST propagate errors with context, preserving the error chain by using techniques
    like wrapping

- **Cancellation**:

  - MUST implement cancellation mechanism for long-running async operations that may
    need to be terminated
  - SHOULD use `AbortController` and `AbortSignal` for cancellation when available
  - MUST clean up resources (event listeners, subscriptions, file handles) even when
    operations are canceled

- **Concurrency Management**:

  - MUST handle concurrent operations explicitly using appropriate Promise combinators:
    - `Promise.all()` when all operations must succeed
    - `Promise.allSettled()` when operations can individually fail
    - `Promise.race()` when only the first result matters
  - SHOULD limit concurrent operations to avoid overwhelming resources using patterns
    like semaphores and throttling

- **Async Flows**:

  - MUST avoid deeply nested async code (more than 2-3 levels)
  - SHOULD break down complex async workflows into smaller, named async functions
  - MUST NOT mix callback-based async with Promise-based async without proper wrapping
    (use promisification)
  - SHOULD use sequential, concurrent, or parallel execution patterns appropriately
    based on dependencies

- **Testing Async Code**:

  - MUST ensure all tests properly await async operations and correctly handle Promise
    resolution/rejection
  - SHOULD use testing utilities that help with async testing (like test framework's
    async support)

## Practical Implementation

1. **Properly Structure Async Functions**: Always use async/await with explicit error
   handling:

   ```typescript
   // ✅ GOOD: Structured async function with error handling
   async function fetchUserData(userId: string): Promise<UserData> {
     try {
       const response = await fetch(`/api/users/${userId}`);

       if (!response.ok) {
         throw new ApiError(
           `Failed to fetch user data: ${response.statusText}`,
           response.status
         );
       }

       return await response.json() as UserData;
     } catch (error) {
       // Add context to the error
       if (error instanceof ApiError) {
         // Rethrow ApiErrors as they already have context
         throw error;
       }

       // Wrap other errors to add context
       throw new ApiError(
         `Error fetching user ${userId}: ${error instanceof Error ? error.message : String(error)}`,
         500,
         error instanceof Error ? error : undefined
       );
     }
   }

   // Custom error class with context
   class ApiError extends Error {
     constructor(
       message: string,
       public statusCode: number,
       public cause?: Error
     ) {
       super(message);
       this.name = 'ApiError';
     }
   }
   ```

1. **Implement Proper Cancellation**: Use AbortController to make async operations
   cancellable:

   ```typescript
   // ✅ GOOD: Cancellable async operation
   export interface CancellableOperation<T> {
     promise: Promise<T>;
     cancel: () => void;
   }

   export function fetchWithTimeout<T>(
     url: string,
     options?: RequestInit,
     timeoutMs = 5000
   ): CancellableOperation<T> {
     // Create an AbortController to handle cancellation
     const controller = new AbortController();
     const { signal } = controller;

     // Set up timeout that will abort the operation
     const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

     // Create the fetch promise with the abort signal
     const fetchPromise = fetch(url, {
       ...options,
       signal,
     }).then(async (response) => {
       if (!response.ok) {
         throw new ApiError(`Request failed: ${response.statusText}`, response.status);
       }
       return await response.json() as T;
     }).finally(() => {
       // Clean up timeout when fetch completes (success or failure)
       clearTimeout(timeoutId);
     });

     // Return both the promise and a cancel function
     return {
       promise: fetchPromise,
       cancel: () => {
         clearTimeout(timeoutId);
         controller.abort();
       }
     };
   }

   // Usage:
   const { promise, cancel } = fetchWithTimeout<UserData>('/api/users/123');

   // Later, if needed:
   cancel(); // This will abort the request
   ```

1. **Handle Concurrent Operations**: Use appropriate Promise combinators for managing
   multiple async operations:

   ```typescript
   // ✅ GOOD: Handling multiple async operations with Promise combinators

   // When all operations must succeed
   async function loadDashboardData(userId: string): Promise<DashboardData> {
     try {
       // Run these requests in parallel
       const [userData, ordersData, notificationsData] = await Promise.all([
         fetchUserData(userId),
         fetchUserOrders(userId),
         fetchNotifications(userId)
       ]);

       return {
         user: userData,
         orders: ordersData,
         notifications: notificationsData
       };
     } catch (error) {
       // If any request fails, the entire operation fails
       throw new DashboardError(
         `Failed to load dashboard for user ${userId}`,
         error instanceof Error ? error : undefined
       );
     }
   }

   // When individual failures should be tolerated
   async function loadDashboardDataResilient(userId: string): Promise<DashboardData> {
     const results = await Promise.allSettled([
       fetchUserData(userId),
       fetchUserOrders(userId),
       fetchNotifications(userId)
     ]);

     // Process results, handling failures individually
     return {
       user: results[0].status === 'fulfilled' ? results[0].value : null,
       orders: results[1].status === 'fulfilled' ? results[1].value : [],
       notifications: results[2].status === 'fulfilled' ? results[2].value : []
     };
   }

   // When you need the first successful response
   async function fetchFromMirroredApis<T>(urls: string[]): Promise<T> {
     // Create an array of promises with timeouts
     const fetchPromises = urls.map(url =>
       fetchWithTimeout<T>(url, undefined, 2000).promise
     );

     // Race to get the first successful response
     return Promise.race(fetchPromises);
   }
   ```

1. **Limit Concurrency**: Implement rate limiting for async operations:

   ```typescript
   // ✅ GOOD: Managing concurrency to avoid overwhelming resources

   // Semaphore for limiting concurrent operations
   class Semaphore {
     private permits: number;
     private queue: Array<() => void> = [];

     constructor(permits: number) {
       this.permits = permits;
     }

     async acquire(): Promise<void> {
       if (this.permits > 0) {
         this.permits--;
         return Promise.resolve();
       }

       return new Promise<void>(resolve => {
         this.queue.push(resolve);
       });
     }

     release(): void {
       if (this.queue.length > 0) {
         const resolve = this.queue.shift()!;
         resolve();
       } else {
         this.permits++;
       }
     }
   }

   // Process a large array of items with limited concurrency
   async function processItemsWithLimit<T, R>(
     items: T[],
     processFn: (item: T) => Promise<R>,
     concurrencyLimit = 5
   ): Promise<R[]> {
     const semaphore = new Semaphore(concurrencyLimit);
     const results: R[] = [];

     // Create a processing function that acquires a permit before processing
     const processWithSemaphore = async (item: T, index: number): Promise<void> => {
       try {
         await semaphore.acquire();
         const result = await processFn(item);
         results[index] = result;
       } finally {
         semaphore.release();
       }
     };

     // Launch all tasks, but they'll wait on the semaphore
     const tasks = items.map((item, index) => processWithSemaphore(item, index));

     // Wait for all tasks to complete
     await Promise.all(tasks);

     return results;
   }

   // Usage example:
   const userIds = ['user1', 'user2', 'user3', /* ... hundreds more ... */];
   const userData = await processItemsWithLimit(
     userIds,
     id => fetchUserData(id),
     10 // Only 10 concurrent requests
   );
   ```

1. **Handle Timeouts and Retries**: Implement timeout and retry mechanisms for resilient
   async operations:

   ```typescript
   // ✅ GOOD: Async operation with retries and exponential backoff
   async function fetchWithRetry<T>(
     url: string,
     options?: RequestInit,
     maxRetries = 3,
     initialDelayMs = 1000
   ): Promise<T> {
     let retries = 0;
     let delayMs = initialDelayMs;

     while (true) {
       try {
         const response = await fetch(url, options);

         if (!response.ok) {
           // Only retry on 5xx server errors or specific 4xx errors
           if (response.status >= 500 || response.status === 429) {
             throw new RetryableError(`Server error: ${response.status}`);
           }

           // Don't retry on other client errors
           throw new ApiError(`Request failed: ${response.statusText}`, response.status);
         }

         return await response.json() as T;
       } catch (error) {
         // Only retry on network errors or marked retryable errors
         const isRetryable = error instanceof RetryableError ||
                             (error instanceof Error && error.name === 'TypeError');

         if (!isRetryable || retries >= maxRetries) {
           throw error;
         }

         // Increment retry counter
         retries++;

         // Wait with exponential backoff before retrying
         await sleep(delayMs);

         // Exponential backoff with jitter
         delayMs = delayMs * 2 * (0.8 + Math.random() * 0.4);
       }
     }
   }

   class RetryableError extends Error {
     constructor(message: string) {
       super(message);
       this.name = 'RetryableError';
     }
   }

   function sleep(ms: number): Promise<void> {
     return new Promise(resolve => setTimeout(resolve, ms));
   }
   ```

1. **Testing Async Code**: Structure async tests properly:

   ```typescript
   // ✅ GOOD: Properly structured async tests

   // Jest example
   describe('UserService', () => {
     test('fetchUserData returns user data for valid ID', async () => {
       // Arrange
       const userId = '123';
       const mockUserData = { id: userId, name: 'Test User' };

       // Mock the fetch API
       global.fetch = jest.fn().mockResolvedValue({
         ok: true,
         json: jest.fn().mockResolvedValue(mockUserData)
       });

       // Act
       const userService = new UserService();
       const result = await userService.fetchUserData(userId);

       // Assert
       expect(result).toEqual(mockUserData);
       expect(global.fetch).toHaveBeenCalledWith(`/api/users/${userId}`);
     });

     test('fetchUserData throws for network errors', async () => {
       // Arrange
       const userId = '123';
       const errorMessage = 'Network error';

       // Mock the fetch API to reject
       global.fetch = jest.fn().mockRejectedValue(new Error(errorMessage));

       // Act & Assert
       const userService = new UserService();
       await expect(userService.fetchUserData(userId))
         .rejects
         .toThrow(`Error fetching user ${userId}: ${errorMessage}`);
     });
   });
   ```

1. **Configure ESLint for Async Best Practices**: Use ESLint rules to enforce async
   patterns:

   ```javascript
   // .eslintrc.js
   module.exports = {
     // other ESLint configuration
     rules: {
       // Prevent missing await on async function calls
       'require-await': 'error',

       // Require Promise rejection handling
       '@typescript-eslint/no-floating-promises': 'error',

       // Prevent misuse of Promise.race and Promise.all
       '@typescript-eslint/no-misused-promises': 'error',

       // Disallow unnecessary awaits
       'no-return-await': 'error',

       // Encourage catching rejected promises
       'promise/catch-or-return': 'error',

       // Ensure promises are properly handled
       'promise/always-return': 'error',

       // Prevent callback mixing
       'promise/no-callback-in-promise': 'warn',

       // Prevent nesting promises
       'promise/no-nesting': 'warn',

       // Prevent creating new promises unnecessarily
       'promise/no-new-statics': 'error',

       // Prevent promise executor functions from having async function signatures
       'promise/no-promise-executor-return': 'error',
     }
   };
   ```

## Examples

```typescript
// ❌ BAD: Callback hell and poor error handling
function fetchUserAndOrders(userId, callback) {
  fetchUser(userId, (userError, user) => {
    if (userError) {
      console.error('Error fetching user:', userError);
      callback(userError, null);
      return;
    }

    fetchOrders(user.id, (ordersError, orders) => {
      if (ordersError) {
        console.error('Error fetching orders:', ordersError);
        callback(ordersError, null);
        return;
      }

      fetchOrderDetails(orders, (detailsError, details) => {
        if (detailsError) {
          console.error('Error fetching order details:', detailsError);
          callback(detailsError, null);
          return;
        }

        const result = {
          user,
          orders: orders.map((order, index) => ({
            ...order,
            details: details[index]
          }))
        };

        callback(null, result);
      });
    });
  });
}
```

```typescript
// ✅ GOOD: Using async/await with proper error handling
async function fetchUserAndOrders(userId: string): Promise<UserWithOrders> {
  try {
    // Fetch user data
    const user = await fetchUser(userId);

    // Fetch orders for this user
    const orders = await fetchOrders(user.id);

    // Fetch all order details in parallel
    const details = await Promise.all(
      orders.map(order => fetchOrderDetails(order.id))
    );

    // Combine the data
    return {
      user,
      orders: orders.map((order, index) => ({
        ...order,
        details: details[index]
      }))
    };
  } catch (error) {
    // Add context to help with debugging
    throw new AppError(
      `Failed to fetch user ${userId} with orders: ${error instanceof Error ? error.message : String(error)}`,
      error instanceof Error ? error : undefined
    );
  }
}

class AppError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'AppError';
  }
}
```

```typescript
// ❌ BAD: Unhandled promise rejections and missing types
function loadData() {
  fetch('/api/data')
    .then(response => response.json())
    .then(data => {
      // No error handling for the fetch or JSON parsing
      processData(data);
    });

  // No return value, caller doesn't know when it completes
}

// Called without awaiting, any errors will be unhandled
loadData();
```

```typescript
// ✅ GOOD: Properly typed async function with error handling
async function loadData(): Promise<ProcessedData> {
  try {
    const response = await fetch('/api/data');

    if (!response.ok) {
      throw new ApiError(`Failed to fetch data: ${response.statusText}`, response.status);
    }

    const data = await response.json();
    return processData(data);
  } catch (error) {
    // Log the error before rethrowing
    console.error('Error loading data:', error);
    throw error;
  }
}

// Proper usage with awaiting and error handling
try {
  const result = await loadData();
  displayResult(result);
} catch (error) {
  displayError(error);
}
```

```typescript
// ❌ BAD: Improper concurrency management leading to resource exhaustion
async function processAllItems(items: Item[]): Promise<Result[]> {
  // Launches ALL requests at once, potentially thousands
  return Promise.all(items.map(item => processItem(item)));
}
```

```typescript
// ✅ GOOD: Controlled concurrency to prevent resource exhaustion
async function processAllItems(items: Item[]): Promise<Result[]> {
  // Process in batches of 10 at a time
  const results: Result[] = [];
  const batchSize = 10;

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(item => processItem(item)));
    results.push(...batchResults);
  }

  return results;
}
```

## Related Bindings

- [simplicity](../../docs/tenets/simplicity.md): Well-structured async code is inherently
  simpler to understand and maintain, even though asynchronous operations are complex by
  nature. This binding provides specific patterns that reduce the complexity of async
  operations.

- [ts-no-any](ts-no-any.md): Proper typing of async functions and their results is
  critical for catching errors at compile time rather than runtime. Using `Promise<T>`
  with specific return types instead of `Promise<any>` creates more robust code.

- [ts-module-organization](ts-module-organization.md): Clear module boundaries make
  async operations more manageable by defining what data and operations cross
  boundaries, simplifying testing and error handling.

- [testability](../../docs/tenets/testability.md): Async code requires special consideration in
  testing. Well-structured async patterns make tests more reliable and easier to write.

- [pure-functions](../../docs/bindings/core/pure-functions.md): While async functions inherently involve side
  effects, following pure function principles for the logic within async functions
  improves maintainability and testability.
