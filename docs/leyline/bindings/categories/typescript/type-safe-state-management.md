---
id: type-safe-state-management
last_modified: '2025-06-02'
version: '0.1.0'
derived_from: orthogonality
enforced_by: 'TypeScript compiler, state management libraries, code review'
---
# Binding: Implement Type-Safe State Management with Isolated State Boundaries

Design state management systems using TypeScript's type system to enforce clear boundaries between different domains of application state. Use discriminated unions, immutable patterns, and type guards to prevent state contamination and ensure predictable state transitions.

## Rationale

This binding implements our orthogonality tenet by creating independent, self-contained state domains that can evolve without affecting each other. State management is one of the most common sources of coupling in applications, where changes to one part of the state can have unexpected effects throughout the system. TypeScript's type system provides powerful tools to enforce boundaries and prevent these coupling issues before they reach runtime.

Think of type-safe state management like organizing a well-designed library. Each section (fiction, non-fiction, reference) has clear boundaries and its own organization system. Books don't randomly migrate between sections, and changes to how fiction books are organized don't affect the reference section. Each section can evolve its organization independently, and library patrons know exactly where to find what they need. Similarly, well-typed state domains have clear boundaries, predictable organization, and can evolve independently without creating system-wide disruption.

Without proper type boundaries, state management becomes like a poorly organized warehouse where items are stored randomly, inventory lists become unreliable, and moving anything requires checking the entire warehouse for unexpected dependencies. TypeScript's discriminated unions, strict interfaces, and type guards act as inventory management systems that keep state organized and prevent the chaos that leads to bugs, performance issues, and maintenance nightmares.

## Rule Definition

Type-safe state management must establish these TypeScript-specific patterns:

- **Domain State Isolation**: Define separate, strongly-typed interfaces for each logical domain of application state. Avoid monolithic state objects that mix unrelated concerns.

- **Discriminated Union Actions**: Use discriminated unions with literal type discriminators for all state actions. This enables exhaustive checking and prevents invalid action types from being dispatched.

- **Immutable State Patterns**: Enforce immutability through TypeScript's `readonly` modifiers and immutable update patterns. Never mutate state objects directly.

- **Type-Safe Selectors**: Create typed selector functions that enforce correct state shape access and provide compile-time guarantees about returned data.

- **State Transition Guards**: Use type guards and type predicates to ensure state transitions are valid and maintain type safety throughout the state lifecycle.

- **Error State Modeling**: Model error states explicitly as part of the state type system rather than relying on implicit error handling patterns.

**State Domain Categories:**
- UI state (form data, modal visibility, loading states)
- Business entity state (users, orders, products)
- Application state (authentication, routing, preferences)
- Cache state (API responses, computed values)
- Transient state (async operations, optimistic updates)

**Type Safety Mechanisms:**
- Strict state interfaces with readonly properties
- Discriminated unions for actions and state variants
- Type guards for state validation and narrowing
- Generic types for reusable state patterns
- Branded types for domain-specific identifiers

## Practical Implementation

1. **Design Domain-Specific State Interfaces**: Create isolated state domains with clear boundaries:

   ```typescript
   // ✅ GOOD: Separate state domains with clear boundaries

   // User domain state
   interface UserState {
     readonly currentUser: User | null;
     readonly profile: UserProfile | null;
     readonly preferences: UserPreferences;
     readonly loading: {
       readonly profile: boolean;
       readonly preferences: boolean;
     };
     readonly errors: {
       readonly profile: string | null;
       readonly preferences: string | null;
     };
   }

   // Order domain state
   interface OrderState {
     readonly orders: ReadonlyArray<Order>;
     readonly currentOrder: Order | null;
     readonly orderHistory: ReadonlyArray<Order>;
     readonly loading: {
       readonly list: boolean;
       readonly details: boolean;
       readonly submission: boolean;
     };
     readonly errors: {
       readonly list: string | null;
       readonly details: string | null;
       readonly submission: string | null;
     };
   }

   // UI domain state
   interface UIState {
     readonly modals: {
       readonly confirmDialog: boolean;
       readonly userProfile: boolean;
       readonly orderDetails: boolean;
     };
     readonly forms: {
       readonly userProfile: FormState<UserProfileForm>;
       readonly orderForm: FormState<OrderForm>;
     };
     readonly notifications: ReadonlyArray<Notification>;
   }

   // Root application state
   interface AppState {
     readonly user: UserState;
     readonly orders: OrderState;
     readonly ui: UIState;
   }
   ```

2. **Implement Discriminated Union Actions**: Use type-safe action patterns with exhaustive checking:

   ```typescript
   // ✅ GOOD: Discriminated union actions with type safety

   // User actions
   type UserAction =
     | { type: 'USER_LOAD_PROFILE_START' }
     | { type: 'USER_LOAD_PROFILE_SUCCESS'; payload: UserProfile }
     | { type: 'USER_LOAD_PROFILE_FAILURE'; payload: string }
     | { type: 'USER_UPDATE_PREFERENCES'; payload: Partial<UserPreferences> }
     | { type: 'USER_LOGOUT' };

   // Order actions
   type OrderAction =
     | { type: 'ORDER_LOAD_LIST_START' }
     | { type: 'ORDER_LOAD_LIST_SUCCESS'; payload: ReadonlyArray<Order> }
     | { type: 'ORDER_LOAD_LIST_FAILURE'; payload: string }
     | { type: 'ORDER_SELECT'; payload: { orderId: string } }
     | { type: 'ORDER_SUBMIT_START' }
     | { type: 'ORDER_SUBMIT_SUCCESS'; payload: Order }
     | { type: 'ORDER_SUBMIT_FAILURE'; payload: string };

   // UI actions
   type UIAction =
     | { type: 'UI_SHOW_MODAL'; payload: { modalType: ModalType } }
     | { type: 'UI_HIDE_MODAL'; payload: { modalType: ModalType } }
     | { type: 'UI_SHOW_NOTIFICATION'; payload: Notification }
     | { type: 'UI_DISMISS_NOTIFICATION'; payload: { id: string } };

   // Combined action type
   type AppAction = UserAction | OrderAction | UIAction;

   // Type-safe reducer with exhaustive checking
   function userReducer(state: UserState, action: UserAction): UserState {
     switch (action.type) {
       case 'USER_LOAD_PROFILE_START':
         return {
           ...state,
           loading: { ...state.loading, profile: true },
           errors: { ...state.errors, profile: null }
         };

       case 'USER_LOAD_PROFILE_SUCCESS':
         return {
           ...state,
           profile: action.payload,
           loading: { ...state.loading, profile: false }
         };

       case 'USER_LOAD_PROFILE_FAILURE':
         return {
           ...state,
           loading: { ...state.loading, profile: false },
           errors: { ...state.errors, profile: action.payload }
         };

       case 'USER_UPDATE_PREFERENCES':
         return {
           ...state,
           preferences: { ...state.preferences, ...action.payload }
         };

       case 'USER_LOGOUT':
         return {
           ...state,
           currentUser: null,
           profile: null,
           preferences: createDefaultPreferences()
         };

       default:
         // TypeScript ensures exhaustive checking
         const _exhaustiveCheck: never = action;
         return state;
     }
   }
   ```

3. **Create Type-Safe Selectors**: Build selectors that enforce correct state access patterns:

   ```typescript
   // ✅ GOOD: Type-safe selectors with compile-time guarantees

   // Base selector types
   type Selector<TState, TResult> = (state: TState) => TResult;
   type AppSelector<TResult> = Selector<AppState, TResult>;

   // User selectors
   const selectCurrentUser: AppSelector<User | null> = (state) => state.user.currentUser;

   const selectUserProfile: AppSelector<UserProfile | null> = (state) => state.user.profile;

   const selectIsUserLoading: AppSelector<boolean> = (state) =>
     state.user.loading.profile || state.user.loading.preferences;

   const selectUserErrors: AppSelector<string[]> = (state) => {
     const errors = state.user.errors;
     return Object.values(errors).filter((error): error is string => error !== null);
   };

   // Computed selectors with memoization
   const selectUserDisplayName: AppSelector<string> = createSelector(
     [selectCurrentUser, selectUserProfile],
     (user, profile) => {
       if (profile?.displayName) return profile.displayName;
       if (user?.firstName && user?.lastName) return `${user.firstName} ${user.lastName}`;
       if (user?.email) return user.email;
       return 'Anonymous User';
     }
   );

   // Order selectors with type safety
   const selectOrderById = (orderId: string): AppSelector<Order | undefined> =>
     (state) => state.orders.orders.find(order => order.id === orderId);

   const selectOrdersByStatus = (status: OrderStatus): AppSelector<ReadonlyArray<Order>> =>
     (state) => state.orders.orders.filter(order => order.status === status);

   // Complex selectors with error handling
   const selectOrderSummary: AppSelector<OrderSummary | null> = createSelector(
     [selectCurrentUser, (state: AppState) => state.orders.orders],
     (user, orders): OrderSummary | null => {
       if (!user) return null;

       const userOrders = orders.filter(order => order.userId === user.id);
       const totalSpent = userOrders.reduce((sum, order) => sum + order.total, 0);
       const completedOrders = userOrders.filter(order => order.status === 'completed');

       return {
         totalOrders: userOrders.length,
         completedOrders: completedOrders.length,
         totalSpent,
         averageOrderValue: userOrders.length > 0 ? totalSpent / userOrders.length : 0
       };
     }
   );
   ```

4. **Implement State Validation and Type Guards**: Use type guards to ensure state integrity:

   ```typescript
   // ✅ GOOD: Type guards for state validation and narrowing

   // Type guards for state validation
   function isValidUser(user: unknown): user is User {
     return typeof user === 'object' &&
            user !== null &&
            typeof (user as User).id === 'string' &&
            typeof (user as User).email === 'string';
   }

   function isLoadingState<T>(state: AsyncState<T>): state is LoadingState {
     return state.status === 'loading';
   }

   function isSuccessState<T>(state: AsyncState<T>): state is SuccessState<T> {
     return state.status === 'success';
   }

   function isErrorState<T>(state: AsyncState<T>): state is ErrorState {
     return state.status === 'error';
   }

   // Generic async state type
   type AsyncState<T> = LoadingState | SuccessState<T> | ErrorState | IdleState;

   interface LoadingState {
     readonly status: 'loading';
   }

   interface SuccessState<T> {
     readonly status: 'success';
     readonly data: T;
   }

   interface ErrorState {
     readonly status: 'error';
     readonly error: string;
   }

   interface IdleState {
     readonly status: 'idle';
   }

   // State validation in components
   function UserProfileComponent({ userId }: { userId: string }) {
     const userState = useSelector(selectUserProfile);

     if (isLoadingState(userState)) {
       return <LoadingSpinner />;
     }

     if (isErrorState(userState)) {
       return <ErrorMessage error={userState.error} />;
     }

     if (isSuccessState(userState)) {
       // TypeScript knows userState.data is UserProfile
       return <ProfileDisplay profile={userState.data} />;
     }

     return <EmptyState />;
   }
   ```

5. **Design Error-Aware State Models**: Model errors as first-class state citizens:

   ```typescript
   // ✅ GOOD: Explicit error modeling in state types

   // Resource state with explicit error handling
   interface ResourceState<T> {
     readonly data: T | null;
     readonly meta: {
       readonly isLoading: boolean;
       readonly lastFetch: Date | null;
       readonly hasError: boolean;
     };
     readonly error: ResourceError | null;
   }

   interface ResourceError {
     readonly type: 'network' | 'validation' | 'authorization' | 'server' | 'unknown';
     readonly message: string;
     readonly code?: string;
     readonly retryable: boolean;
     readonly timestamp: Date;
   }

   // Form state with field-level error tracking
   interface FormState<T> {
     readonly values: T;
     readonly errors: Partial<Record<keyof T, string>>;
     readonly touched: Partial<Record<keyof T, boolean>>;
     readonly meta: {
       readonly isSubmitting: boolean;
       readonly isValid: boolean;
       readonly isDirty: boolean;
       readonly submitCount: number;
     };
   }

   // Operations state with detailed error context
   interface OperationState<TRequest, TResponse> {
     readonly status: 'idle' | 'pending' | 'success' | 'error';
     readonly request: TRequest | null;
     readonly response: TResponse | null;
     readonly error: OperationError | null;
     readonly attempts: number;
     readonly lastAttempt: Date | null;
   }

   interface OperationError {
     readonly message: string;
     readonly code: string;
     readonly details?: Record<string, unknown>;
     readonly retryable: boolean;
     readonly retryAfter?: Date;
   }

   // Usage in reducer
   function createResourceReducer<T>() {
     return function resourceReducer(
       state: ResourceState<T>,
       action: ResourceAction<T>
     ): ResourceState<T> {
       switch (action.type) {
         case 'RESOURCE_FETCH_START':
           return {
             ...state,
             meta: {
               ...state.meta,
               isLoading: true,
               hasError: false
             },
             error: null
           };

         case 'RESOURCE_FETCH_SUCCESS':
           return {
             ...state,
             data: action.payload,
             meta: {
               ...state.meta,
               isLoading: false,
               lastFetch: new Date(),
               hasError: false
             },
             error: null
           };

         case 'RESOURCE_FETCH_ERROR':
           return {
             ...state,
             meta: {
               ...state.meta,
               isLoading: false,
               hasError: true
             },
             error: {
               type: action.payload.type,
               message: action.payload.message,
               code: action.payload.code,
               retryable: action.payload.retryable,
               timestamp: new Date()
             }
           };

         default:
           return state;
       }
     };
   }
   ```

6. **Configure TypeScript for Maximum State Safety**: Use strict compiler options and linting rules:

   ```json
   // tsconfig.json
   {
     "compilerOptions": {
       "strict": true,
       "noImplicitAny": true,
       "strictNullChecks": true,
       "strictFunctionTypes": true,
       "noImplicitReturns": true,
       "noFallthroughCasesInSwitch": true,
       "noUncheckedIndexedAccess": true,
       "exactOptionalPropertyTypes": true
     }
   }
   ```

   ```javascript
   // .eslintrc.js
   module.exports = {
     rules: {
       // Prevent state mutation
       'no-param-reassign': ['error', { props: true }],
       'prefer-const': 'error',

       // TypeScript-specific rules
       '@typescript-eslint/no-explicit-any': 'error',
       '@typescript-eslint/prefer-readonly': 'error',
       '@typescript-eslint/prefer-readonly-parameter-types': 'warn',

       // Redux-specific rules (if using Redux)
       'redux-saga/no-unhandled-errors': 'error',
       'redux-saga/yield-effects': 'error'
     }
   };
   ```

## Examples

```typescript
// ❌ BAD: Monolithic state with mixed concerns and poor type safety
interface AppState {
  user?: any;
  orders?: any[];
  loading?: boolean;
  error?: string;
  modal?: string;
  form?: any;
}

// Actions without type safety
type Action = {
  type: string;
  payload?: any;
};

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    // No compile-time checking for action types or payload shapes
    default:
      return state;
  }
}

// Problems:
// - Mixed concerns in single state object
// - No type safety for actions or payloads
// - Error prone state mutations
// - No guarantee about state shape consistency
```

```typescript
// ✅ GOOD: Domain-separated state with comprehensive type safety
interface UserDomain {
  readonly currentUser: User | null;
  readonly profile: AsyncState<UserProfile>;
  readonly preferences: UserPreferences;
}

interface OrderDomain {
  readonly list: AsyncState<ReadonlyArray<Order>>;
  readonly current: Order | null;
  readonly submission: OperationState<CreateOrderRequest, Order>;
}

interface UIDomain {
  readonly modals: {
    readonly userProfile: boolean;
    readonly orderConfirmation: boolean;
  };
  readonly forms: {
    readonly userProfile: FormState<UserProfileForm>;
  };
}

interface AppState {
  readonly user: UserDomain;
  readonly orders: OrderDomain;
  readonly ui: UIDomain;
}

// Type-safe actions with discriminated unions
type UserAction =
  | { type: 'USER_SET_CURRENT'; payload: User }
  | { type: 'USER_PROFILE_FETCH_START' }
  | { type: 'USER_PROFILE_FETCH_SUCCESS'; payload: UserProfile }
  | { type: 'USER_PROFILE_FETCH_ERROR'; payload: ResourceError };

// Domain-specific reducer with exhaustive checking
function userReducer(state: UserDomain, action: UserAction): UserDomain {
  switch (action.type) {
    case 'USER_SET_CURRENT':
      return { ...state, currentUser: action.payload };

    case 'USER_PROFILE_FETCH_START':
      return {
        ...state,
        profile: { status: 'loading' }
      };

    case 'USER_PROFILE_FETCH_SUCCESS':
      return {
        ...state,
        profile: { status: 'success', data: action.payload }
      };

    case 'USER_PROFILE_FETCH_ERROR':
      return {
        ...state,
        profile: { status: 'error', error: action.payload.message }
      };

    default:
      // TypeScript ensures all cases are handled
      const _exhaustiveCheck: never = action;
      return state;
  }
}
```

```typescript
// ❌ BAD: Unsafe selectors that can break at runtime
const getUser = (state: any) => state.user; // Any type, no safety
const getUserName = (state: any) => state.user.profile.name; // Can throw if profile is null
const getOrderTotal = (state: any, orderId: any) => {
  const order = state.orders.find((o: any) => o.id === orderId);
  return order.total; // Can throw if order not found
};
```

```typescript
// ✅ GOOD: Type-safe selectors with proper error handling
const selectCurrentUser: AppSelector<User | null> = (state) => state.user.currentUser;

const selectUserDisplayName: AppSelector<string> = createSelector(
  [selectCurrentUser, (state: AppState) => state.user.profile],
  (user, profileState): string => {
    if (isSuccessState(profileState)) {
      return profileState.data.displayName || user?.email || 'Anonymous';
    }
    return user?.email || 'Anonymous';
  }
);

const selectOrderById = (orderId: string): AppSelector<Order | null> =>
  createSelector(
    [(state: AppState) => state.orders.list],
    (orderListState): Order | null => {
      if (!isSuccessState(orderListState)) {
        return null;
      }
      return orderListState.data.find(order => order.id === orderId) || null;
    }
  );

// Safe usage in components
function UserHeader() {
  const displayName = useSelector(selectUserDisplayName);
  const isLoading = useSelector(selectIsUserProfileLoading);

  if (isLoading) {
    return <Skeleton />;
  }

  return <h1>Welcome, {displayName}</h1>;
}
```

```typescript
// ❌ BAD: Mutating state directly and losing type safety
function badReducer(state: any, action: any) {
  switch (action.type) {
    case 'ADD_ORDER':
      state.orders.push(action.payload); // Direct mutation
      state.loading = false;
      return state;

    case 'UPDATE_USER':
      state.user.profile.name = action.payload.name; // Nested mutation
      return state;
  }
}
```

```typescript
// ✅ GOOD: Immutable updates with type safety
function orderReducer(state: OrderDomain, action: OrderAction): OrderDomain {
  switch (action.type) {
    case 'ORDER_ADD_SUCCESS':
      return {
        ...state,
        list: isSuccessState(state.list)
          ? {
              status: 'success' as const,
              data: [...state.list.data, action.payload]
            }
          : state.list,
        submission: { status: 'success', response: action.payload }
      };

    case 'ORDER_UPDATE_SUCCESS':
      return {
        ...state,
        list: isSuccessState(state.list)
          ? {
              status: 'success' as const,
              data: state.list.data.map(order =>
                order.id === action.payload.id ? action.payload : order
              )
            }
          : state.list,
        current: state.current?.id === action.payload.id ? action.payload : state.current
      };

    default:
      const _exhaustiveCheck: never = action;
      return state;
  }
}
```

## Related Bindings

- [component-isolation.md](../../core/component-isolation.md): Type-safe state management directly implements component isolation by creating clear boundaries between state domains. Both bindings work together to prevent coupling and ensure components can evolve independently without affecting each other.

- [async-patterns.md](../../docs/bindings/categories/typescript/async-patterns.md): Async state management requires type-safe patterns for handling loading, success, and error states. This binding provides the state modeling patterns that complement async operation patterns for comprehensive type safety.

- [no-any.md](../../docs/bindings/categories/typescript/no-any.md): Type-safe state management depends on avoiding `any` types throughout the state system. Both bindings work together to ensure compile-time guarantees about data shapes and operations throughout the application.

- [orthogonality.md](../../tenets/orthogonality.md): This binding directly implements the orthogonality tenet by using TypeScript's type system to enforce independence between state domains. Changes to one state domain cannot affect others when proper type boundaries are maintained.
