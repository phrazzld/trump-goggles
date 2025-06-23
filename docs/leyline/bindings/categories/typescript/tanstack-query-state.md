---
id: tanstack-query-state
last_modified: '2025-06-18'
version: '0.1.0'
derived_from: explicit-over-implicit
enforced_by: 'TypeScript compiler, TanStack Query DevTools, ESLint rules, test coverage'
---

# Binding: Implement Type-Safe Server State Management with TanStack Query

Use TanStack Query as the standard solution for all server state management in TypeScript applications. Implement type-safe query patterns with explicit error handling, comprehensive caching strategies, and observable state transitions that provide clear visibility into server interactions and data flows.

## Rationale

This binding implements our explicit-over-implicit tenet by making server state management transparent and predictable through TanStack Query's declarative approach. Server state is fundamentally different from client state—it's asynchronous, shared across components, and can become stale—requiring specialized management patterns that generic state libraries handle poorly.

Think of server state like a cache in a distributed system: it needs invalidation strategies, background updates, optimistic updates, and error recovery mechanisms. TanStack Query provides these capabilities while making the state transitions explicit through its query states (idle, loading, success, error) and DevTools that show exactly what's happening with each query.

The observability benefits are substantial: TanStack Query DevTools provide real-time visibility into query status, cache contents, background updates, and performance metrics. This transforms server state debugging from guesswork into systematic investigation.

## Rule Definition

This rule applies to all TypeScript applications that interact with backend APIs. The rule specifically requires:

**Type Safety Requirements:**
- **Typed Query Functions**: All query functions must have explicit return type annotations
- **Typed Query Keys**: Query keys must use type-safe factory patterns for consistency
- **Error Type Definitions**: Explicit error interfaces for all API endpoints
- **Data Transformation Types**: Type-safe data transformation at query boundaries

**Caching and Invalidation:**
- **Structured Cache Keys**: Hierarchical query key patterns for efficient invalidation
- **Stale Time Configuration**: Explicit stale time settings based on data volatility
- **Background Refetch Strategy**: Configured background update patterns
- **Optimistic Update Patterns**: Type-safe optimistic mutations with rollback

**Error Handling and Observability:**
- **Granular Error States**: Specific error handling for different failure modes
- **Query Status Monitoring**: Observable query states throughout component lifecycles
- **DevTools Integration**: Enabled development tools for debugging and monitoring

The rule prohibits direct server state management in component state, global stores, or context providers. All server interactions must go through TanStack Query with appropriate typing and error handling.

## Practical Implementation

1. **Type-Safe API Layer**: Define explicit types for all API interactions:
   ```typescript
   // types/api.ts
   interface User {
     id: string;
     email: string;
     name: string;
   }

   interface ApiError {
     code: string;
     message: string;
   }

   // Query function with explicit typing
   async function fetchUserProfile(userId: string): Promise<User> {
     const response = await fetch(`/api/users/${userId}`);

     if (!response.ok) {
       const error: ApiError = await response.json();
       throw new ApiError(error.message, error.code);
     }

     return response.json();
   }
   ```

2. **Structured Query Key Factory**: Create type-safe query key patterns:
   ```typescript
   // lib/query-keys.ts
   export const queryKeys = {
     users: {
       all: ['users'] as const,
       detail: (id: string) => [...queryKeys.users.all, 'detail', id] as const,
       profile: (id: string) => [...queryKeys.users.detail(id), 'profile'] as const,
     },
   } as const;
   ```

3. **Type-Safe Query Hooks**: Implement observable query patterns:
   ```typescript
   // hooks/useUserProfile.ts
   export function useUserProfile(userId: string) {
     return useQuery({
       queryKey: queryKeys.users.profile(userId),
       queryFn: () => fetchUserProfile(userId),
       enabled: !!userId,
       staleTime: 5 * 60 * 1000, // 5 minutes
       retry: (failureCount, error) => {
         if (error instanceof ApiError && error.code.startsWith('4')) {
           return false; // Don't retry client errors
         }
         return failureCount < 3;
       },
     });
   }
   ```

4. **Optimistic Mutations**: Type-safe mutations with rollback capabilities:
   ```typescript
   export function useUpdateUser() {
     const queryClient = useQueryClient();

     return useMutation({
       mutationFn: async ({ userId, updates }: UpdateUserRequest) => {
         const response = await fetch(`/api/users/${userId}`, {
           method: 'PATCH',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify(updates),
         });

         if (!response.ok) {
           const error: ApiError = await response.json();
           throw new ApiError(error.message, error.code);
         }

         return response.json();
       },

       onMutate: async ({ userId, updates }) => {
         const queryKey = queryKeys.users.profile(userId);
         await queryClient.cancelQueries({ queryKey });

         const previousUser = queryClient.getQueryData<User>(queryKey);
         if (previousUser) {
           queryClient.setQueryData<User>(queryKey, { ...previousUser, ...updates });
         }

         return { previousUser, queryKey };
       },

       onError: (error, variables, context) => {
         if (context?.previousUser && context?.queryKey) {
           queryClient.setQueryData(context.queryKey, context.previousUser);
         }
       },

       onSettled: (data, error, variables) => {
         queryClient.invalidateQueries({
           queryKey: queryKeys.users.profile(variables.userId)
         });
       },
     });
   }
   ```

5. **Query Client Configuration**: Configure observability and error handling:
   ```typescript
   // lib/query-client.ts
   export const queryClient = new QueryClient({
     defaultOptions: {
       queries: {
         staleTime: 2 * 60 * 1000, // 2 minutes default
         gcTime: 10 * 60 * 1000, // 10 minutes
         retry: (failureCount, error) => {
           if (error instanceof ApiError && error.code === 'UNAUTHORIZED') {
             return false;
           }
           return failureCount < 3;
         },
         refetchOnWindowFocus: false,
         refetchOnReconnect: 'always',
       },
       mutations: {
         onError: (error) => {
           console.error('Mutation error:', {
             error: error.message,
             code: error instanceof ApiError ? error.code : 'UNKNOWN',
             timestamp: new Date().toISOString(),
           });
         },
       },
     },
   });
   ```

6. **Testing Patterns**: Test query hooks with isolated query clients:
   ```typescript
   // __tests__/useUserProfile.test.ts
   function createWrapper() {
     const queryClient = new QueryClient({
       defaultOptions: { queries: { retry: false } },
     });

     return ({ children }: { children: React.ReactNode }) => (
       <QueryClientProvider client={queryClient}>
         {children}
       </QueryClientProvider>
     );
   }

   test('should fetch user profile successfully', async () => {
     fetchMock.mockResponseOnce(JSON.stringify({ id: '1', name: 'Test User' }));

     const { result } = renderHook(
       () => useUserProfile('1'),
       { wrapper: createWrapper() }
     );

     expect(result.current.isLoading).toBe(true);

     await waitFor(() => {
       expect(result.current.isLoading).toBe(false);
     });

     expect(result.current.data).toEqual({ id: '1', name: 'Test User' });
   });
   ```

## Examples

```typescript
// ❌ BAD: Server state in component state with poor error handling
function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(setUser)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  return <ProfileDisplay user={user} />;
}

// ✅ GOOD: Type-safe TanStack Query with comprehensive error handling
function UserProfile({ userId }: { userId: string }) {
  const { data: user, isLoading, error, isStale } = useUserProfile(userId);

  if (isLoading) return <ProfileSkeleton />;

  if (error) {
    if (error.code === 'USER_NOT_FOUND') {
      return <UserNotFound userId={userId} />;
    }
    if (error.code === 'UNAUTHORIZED') {
      return <LoginRequired />;
    }
    return <ErrorMessage error={error} />;
  }

  return (
    <div>
      {isStale && <StaleBanner />}
      <ProfileDisplay user={user} />
    </div>
  );
}
```

## Security Considerations

### Environment Variable Patterns

All API configurations must use environment variables, never hardcoded values:

```typescript
// ✅ GOOD: Environment-based API configuration
interface ApiConfig {
  readonly baseUrl: string;
  readonly timeout: number;
  readonly retryAttempts: number;
}

const apiConfig: ApiConfig = {
  baseUrl: process.env.VITE_API_BASE_URL || process.env.API_BASE_URL || '',
  timeout: parseInt(process.env.VITE_API_TIMEOUT || process.env.API_TIMEOUT || '5000'),
  retryAttempts: parseInt(process.env.VITE_API_RETRY_ATTEMPTS || process.env.API_RETRY_ATTEMPTS || '3'),
};

// Validate required environment variables at startup
if (!apiConfig.baseUrl) {
  throw new Error(
    'API_BASE_URL environment variable is required. Set VITE_API_BASE_URL for development or API_BASE_URL for production.'
  );
}

// ❌ BAD: Hardcoded API endpoints
const apiConfig = {
  baseUrl: 'https://api.mycompany.com', // Hardcoded - insecure
  apiKey: 'sk_live_[REDACTED]', // Hardcoded secret - major security violation
};
```

### Authentication Token Management

Handle authentication tokens securely with proper validation:

```typescript
// ✅ GOOD: Secure token handling with environment variables
interface AuthConfig {
  readonly tokenStorageKey: string;
  readonly refreshEndpoint: string;
  readonly requiresAuth: boolean;
}

const authConfig: AuthConfig = {
  tokenStorageKey: process.env.VITE_AUTH_TOKEN_KEY || 'app_token',
  refreshEndpoint: process.env.VITE_AUTH_REFRESH_URL || '/auth/refresh',
  requiresAuth: process.env.VITE_REQUIRE_AUTH !== 'false',
};

// Secure query client configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const token = getStoredToken();
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };

        if (token && authConfig.requiresAuth) {
          headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(`${apiConfig.baseUrl}${queryKey[0]}`, {
          headers,
        });

        if (!response.ok) {
          if (response.status === 401) {
            // Clear invalid token and redirect to login
            clearStoredToken();
            throw new ApiError('UNAUTHORIZED', 'Authentication required');
          }
          throw new ApiError('API_ERROR', `HTTP ${response.status}`);
        }

        return response.json();
      },
    },
  },
});


```

## Security Integration

This binding integrates with security-first development practices:
- **Environment Variables**: All API configuration uses environment variables
- **Error Sanitization**: Production builds sanitize error messages
- **Token Management**: Secure authentication token handling patterns
- **Input Validation**: Type-safe query parameters and response validation

See `examples/typescript-full-toolchain/SECURITY.md` for complete security implementation.
