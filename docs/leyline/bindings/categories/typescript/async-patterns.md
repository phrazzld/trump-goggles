---
derived_from: simplicity
id: async-patterns
last_modified: '2025-05-14'
version: '0.1.0'
enforced_by: code review & style guides
---
# Binding: Structure TypeScript Async Code with Best Practices

Use async/await for all asynchronous operations in TypeScript, with proper error
handling, cancellation patterns, and explicit typing. Asynchronous code must be
structured for readability, testability, and robustness, avoiding common pitfalls like
unhandled promises, excessive nesting, and missing error management.

## Rationale

This binding implements our simplicity tenet by establishing clear patterns for asynchronous code flow in TypeScript. Async programming introduces temporal coupling, error propagation challenges, and timing-dependent bugs that are difficult to test consistently.

Clear async patterns create predictability, reduce mental overhead, and prevent categories of errors like unhandled promises, race conditions, and missing error context.

## Rule Definition

This binding establishes clear requirements for async code patterns in TypeScript:

**Core Requirements:**

- **Async/Await**: Use `async`/`await` syntax for all asynchronous operations with explicit `Promise<T>` return types
- **Error Handling**: Wrap `await` expressions in `try/catch` blocks and propagate errors with context
- **Cancellation**: Implement cancellation using `AbortController` for long-running operations
- **Concurrency**: Use `Promise.all()`, `Promise.allSettled()`, or `Promise.race()` appropriately for concurrent operations
- **Structure**: Avoid deeply nested async code; break complex workflows into smaller functions
- **Testing**: Ensure all tests properly await async operations and handle Promise resolution/rejection

## Practical Implementation

**Core Async Function Pattern with Error Handling:**

```typescript
// ✅ Comprehensive async pattern demonstrating all key principles
interface CancellableOperation<T> {
  promise: Promise<T>;
  cancel: () => void;
}

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

// Main async pattern with error handling, cancellation, and timeout
export function fetchWithSafety<T>(
  url: string,
  options?: RequestInit,
  timeoutMs = 5000
): CancellableOperation<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const promise = fetch(url, { ...options, signal: controller.signal })
    .then(async response => {
      if (!response.ok) {
        throw new ApiError(
          `Request failed: ${response.statusText}`,
          response.status
        );
      }
      return await response.json() as T;
    })
    .catch(error => {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        `Network error: ${error.message}`,
        500,
        error
      );
    })
    .finally(() => clearTimeout(timeoutId));

  return {
    promise,
    cancel: () => {
      clearTimeout(timeoutId);
      controller.abort();
    }
  };
}

// Concurrent operations with proper error handling
async function loadDashboardData(userId: string): Promise<DashboardData> {
  try {
    // Parallel execution with Promise.all
    const [userData, ordersData, notificationsData] = await Promise.all([
      fetchWithSafety<UserData>(`/api/users/${userId}`).promise,
      fetchWithSafety<OrderData[]>(`/api/users/${userId}/orders`).promise,
      fetchWithSafety<Notification[]>(`/api/users/${userId}/notifications`).promise
    ]);

    return { user: userData, orders: ordersData, notifications: notificationsData };
  } catch (error) {
    throw new ApiError(
      `Failed to load dashboard for user ${userId}`,
      500,
      error instanceof Error ? error : undefined
    );
  }
}

// Resilient operations with Promise.allSettled
async function loadDashboardDataResilient(userId: string): Promise<Partial<DashboardData>> {
  const results = await Promise.allSettled([
    fetchWithSafety<UserData>(`/api/users/${userId}`).promise,
    fetchWithSafety<OrderData[]>(`/api/users/${userId}/orders`).promise,
    fetchWithSafety<Notification[]>(`/api/users/${userId}/notifications`).promise
  ]);

  return {
    user: results[0].status === 'fulfilled' ? results[0].value : null,
    orders: results[1].status === 'fulfilled' ? results[1].value : [],
    notifications: results[2].status === 'fulfilled' ? results[2].value : []
  };
}

// Concurrency control for processing large datasets
async function processItemsConcurrently<T, R>(
  items: T[],
  processFn: (item: T) => Promise<R>,
  concurrencyLimit = 5
): Promise<R[]> {
  const results: R[] = [];
  const executing: Promise<void>[] = [];

  for (let i = 0; i < items.length; i++) {
    const promise = processFn(items[i]).then(result => {
      results[i] = result;
    });

    executing.push(promise);

    if (executing.length >= concurrencyLimit) {
      await Promise.race(executing);
      executing.splice(executing.findIndex(p => p === promise), 1);
    }
  }

  await Promise.all(executing);
  return results;
}

// Testing async functions
describe('Async Operations', () => {
  test('fetchWithSafety handles errors correctly', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

    const { promise } = fetchWithSafety<any>('/api/test');

    await expect(promise).rejects.toThrow('Network error');
  });

  test('concurrent operations complete successfully', async () => {
    const mockData = [{ id: 1 }, { id: 2 }, { id: 3 }];
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData[0])
    });

    const result = await processItemsConcurrently(
      [1, 2, 3],
      id => fetchWithSafety<any>(`/api/items/${id}`).promise,
      2
    );

    expect(result).toHaveLength(3);
  });
});
```

## Examples

```typescript
// ❌ BAD: Callback hell, unhandled promises, no types
function loadUserData(userId, callback) {
  fetchUser(userId, (userError, user) => {
    if (userError) {
      callback(userError, null);
      return;
    }
    fetchOrders(user.id, (ordersError, orders) => {
      // Nested callbacks create complex error handling
      callback(ordersError, { user, orders });
    });
  });
}

// Unhandled promise without awaiting
fetch('/api/data').then(response => response.json());

// ✅ GOOD: Structured async with proper error handling
async function loadUserData(userId: string): Promise<UserWithOrders> {
  try {
    const user = await fetchUser(userId);
    const orders = await fetchOrders(user.id);
    const details = await Promise.all(
      orders.map(order => fetchOrderDetails(order.id))
    );

    return {
      user,
      orders: orders.map((order, index) => ({
        ...order,
        details: details[index]
      }))
    };
  } catch (error) {
    throw new ApiError(
      `Failed to fetch user ${userId} data`,
      500,
      error instanceof Error ? error : undefined
    );
  }
}

// Proper usage with error handling
try {
  const userData = await loadUserData('123');
  displayData(userData);
} catch (error) {
  handleError(error);
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
