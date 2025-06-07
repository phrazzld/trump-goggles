---
derived_from: modularity
enforced_by: code review & project linting rules
id: module-organization
last_modified: '2025-05-14'
---
# Binding: Organize TypeScript Code Into Feature-Focused Modules

Structure TypeScript code into cohesive modules organized by features or domains rather
than technical concerns. Each module should encapsulate related functionality with clear
boundaries, controlled visibility, and explicit interfaces that hide implementation
details.

## Rationale

This binding implements our modularity tenet by defining how to create well-bounded,
purpose-driven modules in TypeScript projects. Effective module organization is
fundamental to managing complexity in TypeScript codebases, providing natural seams that
make the system more understandable and maintainable.

Think of your TypeScript modules like the chapters of a well-written book. Each chapter
focuses on a specific part of the story, with a clear purpose that contributes to the
overall narrative. Readers can understand a chapter without necessarily reading the
entire book, but chapters connect logically to form a cohesive whole. Similarly,
well-organized TypeScript modules allow developers to work effectively within one area
of the codebase without needing to understand the entire system, while still maintaining
a coherent architecture.

The impact of module organization compounds over time. In the early stages of
development, poor organization may seem like a minor inconvenience. But as the codebase
grows, these structural choices determine how easily the system can evolve.
Feature-focused modules create natural boundaries that align with how the system
changes, while technical-layer modules (like separate folders for controllers, services,
and models) create artificial boundaries that cut across feature changes, leading to
scattered modifications and increased cognitive overhead. When code that changes
together lives together, developers can reason about the system more effectively,
leading to faster development and fewer bugs.

## Rule Definition

This binding establishes clear requirements for organizing TypeScript code into modules:

- **Module Identity and Focus**:

  - Modules MUST be organized around domain concepts, features, or functional areas, not
    technical roles
  - Each module SHOULD have a single, well-defined responsibility that can be expressed
    in a short sentence
  - Module names MUST be clear, descriptive nouns that reflect the domain concepts they
    represent
  - Modules SHOULD NOT be named after patterns or technical implementations (avoid
    "utils", "helpers", "managers")

- **Project Structure Requirements**:

  - Follow a consistent project structure with clear separation between application
    code, types, tests, and assets
  - Source code MUST be organized in a `src` directory (or equivalent based on framework
    conventions)
  - Related files SHOULD be co-located in feature directories rather than separated by
    technical role
  - Maintain a flat hierarchy where possible; avoid deep nesting beyond 3-4 levels

- **Module Boundaries and Visibility**:

  - Each module MUST clearly define its public API through deliberate exports
  - Implementation details MUST be kept private by avoiding direct exports
  - Use barrel files (`index.ts`) to control and document the public API of a module
  - Module boundaries MUST be respected; avoid reaching into the internals of other
    modules

- **Module Coupling and Dependencies**:

  - Modules MUST exhibit high internal cohesion (all code in the module works together
    for a unified purpose)
  - Modules MUST maintain low external coupling (minimal dependencies on other modules)
  - Circular dependencies between modules are PROHIBITED
  - Higher-level modules SHOULD depend on lower-level modules, not vice versa

- **Import and Export Patterns**:

  - Use ES Modules syntax (`import`/`export`) exclusively; CommonJS (`require`) is
    PROHIBITED
  - PREFER named exports over default exports for better refactoring support
  - Re-export shared types and interfaces to create a clear API contract
  - Minimize the use of deep relative imports (`../../../`) by establishing clear import
    paths

- **Exceptions and Special Cases**:

  - Small utility functions SHOULD be kept in the feature modules they serve rather than
    creating generic utility modules
  - Shared utilities needed across multiple modules SHOULD be organized into
    purpose-specific shared modules
  - Very small applications may use a simplified structure, but MUST still maintain
    clear module boundaries

## Practical Implementation

1. **Establish a Feature-Based Directory Structure**: Organize your project around
   domain features rather than technical concerns:

   ```
   src/
   ├── features/                 # Domain-specific features
   │   ├── user/                 # User feature module
   │   │   ├── index.ts          # Public API exports
   │   │   ├── types.ts          # User-related types
   │   │   ├── user.service.ts   # User business logic
   │   │   ├── user.repository.ts # Data access
   │   │   ├── user.component.tsx # UI (for frontend)
   │   │   └── user.test.ts      # Tests co-located with code
   │   │
   │   ├── product/              # Product feature module
   │   │   ├── index.ts
   │   │   ├── types.ts
   │   │   ├── product.service.ts
   │   │   └── ...
   │   │
   │   └── order/                # Order feature module
   │       ├── index.ts
   │       ├── types.ts
   │       ├── order.service.ts
   │       └── ...
   │
   ├── shared/                   # Cross-cutting concerns
   │   ├── api/                  # API utilities
   │   ├── components/           # Shared UI components
   │   ├── utils/                # Shared utilities
   │   │   ├── date/             # Date-specific utilities
   │   │   ├── validation/       # Validation utilities
   │   │   └── ...
   │   └── types/                # Shared type definitions
   │
   ├── app.tsx                   # Application entry point
   └── main.ts                   # Bootstrap code
   ```

   This structure:

   - Co-locates related code regardless of technical role
   - Makes feature boundaries explicit and visible
   - Simplifies navigation by organizing code the way people think about the system
   - Creates natural boundaries for change and code ownership

1. **Define Clear Module Boundaries with Barrel Files**: Use `index.ts` files to control
   what each module exposes:

   ```typescript
   // features/user/index.ts - Controls the public API of the user module

   // Re-export public types
   export type { User, UserRole, UserPreferences } from './types';

   // Re-export the service as the primary API
   export { UserService } from './user.service';

   // Export the repository interface but not the implementation
   export type { UserRepository } from './user.repository';

   // Re-export factory function to create the service
   export { createUserService } from './user.factory';

   // Note: Internal implementations like user.repository.impl.ts
   // are NOT exported, keeping them as implementation details
   ```

   This approach:

   - Makes the public API explicit and documented in one place
   - Hides implementation details by selectively re-exporting
   - Allows for easier refactoring without breaking dependent code
   - Creates a contract with the rest of the application

1. **Configure Path Aliases for Clean Imports**: Set up TypeScript path aliases to avoid
   deep relative imports:

   ```jsonc
   // tsconfig.json
   {
     "compilerOptions": {
       "baseUrl": "src",
       "paths": {
         "@features/*": ["features/*"],
         "@shared/*": ["shared/*"],
         "@utils/*": ["shared/utils/*"],
         "@types/*": ["shared/types/*"]
       }
     }
   }
   ```

   With these aliases, imports become cleaner and more maintainable:

   ```typescript
   // Instead of:
   import { User } from '../../../features/user/types';
   import { formatDate } from '../../../shared/utils/date/format';

   // Use:
   import { User } from '@features/user';
   import { formatDate } from '@utils/date/format';
   ```

   This approach:

   - Makes imports more readable and maintainable
   - Reduces fragility when files move within the directory structure
   - Creates a clear, consistent pattern for importing from different parts of the
     application

1. **Implement Dependency Inversion for Module Communication**: Use interfaces to manage
   dependencies between modules:

   ```typescript
   // features/order/types.ts
   import type { User } from '@features/user';
   import type { Product } from '@features/product';

   export interface Order {
     id: string;
     user: User;
     products: Array<{
       product: Product;
       quantity: number;
     }>;
     status: OrderStatus;
     createdAt: Date;
   }

   export enum OrderStatus {
     Pending = 'PENDING',
     Processing = 'PROCESSING',
     Shipped = 'SHIPPED',
     Delivered = 'DELIVERED',
     Cancelled = 'CANCELLED'
   }

   // Define interface for user operations needed by orders
   export interface UserService {
     canPlaceOrder(userId: string): Promise<boolean>;
     notifyOrderStatus(userId: string, orderId: string, status: OrderStatus): Promise<void>;
   }

   // Define interface for product operations needed by orders
   export interface ProductService {
     checkAvailability(productId: string, quantity: number): Promise<boolean>;
     reserveStock(productId: string, quantity: number): Promise<void>;
   }
   ```

   ```typescript
   // features/order/order.service.ts
   import { OrderRepository } from './order.repository';
   import { Order, OrderStatus, UserService, ProductService } from './types';

   export class OrderService {
     constructor(
       private orderRepo: OrderRepository,
       private userService: UserService,
       private productService: ProductService
     ) {}

     async createOrder(userId: string, productItems: Array<{productId: string, quantity: number}>): Promise<Order> {
       // Check if user can place order
       const canPlace = await this.userService.canPlaceOrder(userId);
       if (!canPlace) {
         throw new Error('User cannot place order');
       }

       // Check all products availability
       for (const item of productItems) {
         const isAvailable = await this.productService.checkAvailability(
           item.productId,
           item.quantity
         );
         if (!isAvailable) {
           throw new Error(`Product ${item.productId} not available in requested quantity`);
         }
       }

       // Implementation continues...
     }
   }
   ```

   This approach:

   - Defines clear interfaces between modules
   - Prevents circular dependencies by depending on abstractions
   - Makes testing easier with mock implementations
   - Creates more flexible, loosely coupled modules

1. **Use ESLint Rules to Enforce Module Boundaries**: Configure ESLint to ensure module
   boundaries are respected:

   ```javascript
   // .eslintrc.js
   module.exports = {
     // other ESLint configuration
     plugins: [
       // other plugins
       'import',
       'boundaries',
     ],
     rules: {
       // Prevent circular dependencies
       'import/no-cycle': 'error',

       // Ensure correct import order
       'import/order': ['error', {
         'groups': [
           'builtin',
           'external',
           'internal',
           ['parent', 'sibling'],
           'index'
         ],
         'newlines-between': 'always'
       }],

       // Set up module boundary rules
       'boundaries/element-types': [
         'error',
         {
           default: 'allow',
           message: 'Dependency violates module boundaries',
           rules: [
             {
               from: 'features',
               disallow: ['app', 'main'],
               message: 'Features cannot import from app entry points'
             },
             {
               from: 'shared',
               disallow: ['features'],
               message: 'Shared utilities cannot import from feature modules'
             }
           ]
         }
       ]
     }
   };
   ```

   This ensures:

   - Module boundaries are enforced automatically
   - Circular dependencies are caught early
   - Code follows a consistent import structure
   - Violations are detected during development and CI

## Examples

```typescript
// ❌ BAD: Technical-layer organization that spreads features across directories
src/
├── controllers/        // All controllers mixed together
│   ├── user.controller.ts
│   ├── product.controller.ts
│   └── order.controller.ts
├── services/           // All services mixed together
│   ├── user.service.ts
│   ├── product.service.ts
│   └── order.service.ts
├── models/             // All models mixed together
│   ├── user.model.ts
│   ├── product.model.ts
│   └── order.model.ts
└── utils/              // Generic utility bucket
    ├── validators.ts
    ├── formatters.ts
    └── helpers.ts
```

```typescript
// ✅ GOOD: Feature-based organization that keeps related code together
src/
├── features/
│   ├── user/           // Everything related to users in one place
│   │   ├── index.ts
│   │   ├── types.ts
│   │   ├── user.service.ts
│   │   ├── user.controller.ts
│   │   └── user.model.ts
│   ├── product/        // Everything related to products in one place
│   │   ├── index.ts
│   │   ├── types.ts
│   │   ├── product.service.ts
│   │   └── ...
│   └── order/          // Everything related to orders in one place
│       ├── index.ts
│       ├── types.ts
│       ├── order.service.ts
│       └── ...
└── shared/
    ├── validation/     // Purpose-specific utilities
    ├── formatting/     // Purpose-specific utilities
    └── ...
```

```typescript
// ❌ BAD: Giant "utils" module with mixed responsibilities
// shared/utils.ts
export function formatDate(date: Date): string { /* ... */ }
export function validateEmail(email: string): boolean { /* ... */ }
export function calculateTax(amount: number, rate: number): number { /* ... */ }
export function capitalizeString(str: string): string { /* ... */ }
export function fetchData(url: string): Promise<any> { /* ... */ }
export function generateId(): string { /* ... */ }
export function parseCSV(data: string): Array<any> { /* ... */ }
// ...50 more unrelated functions
```

```typescript
// ✅ GOOD: Purpose-specific utility modules
// shared/date/format.ts
export function formatDate(date: Date, format?: string): string { /* ... */ }
export function parseDate(dateString: string): Date { /* ... */ }

// shared/validation/email.ts
export function validateEmail(email: string): boolean { /* ... */ }
export function normalizeEmail(email: string): string { /* ... */ }

// shared/formatting/string.ts
export function capitalize(str: string): string { /* ... */ }
export function truncate(str: string, maxLength: number): string { /* ... */ }

// features/tax/tax.service.ts (domain-specific logic belongs with its feature)
export function calculateTax(amount: number, rate: number): number { /* ... */ }
```

```typescript
// ❌ BAD: Circular dependencies between modules
// features/user/user.service.ts
import { OrderService } from '@features/order/order.service';

export class UserService {
  constructor(private orderService: OrderService) {}

  async getUserOrders(userId: string) {
    return this.orderService.getOrdersByUserId(userId);
  }
}

// features/order/order.service.ts
import { UserService } from '@features/user/user.service';

export class OrderService {
  constructor(private userService: UserService) {}

  async getOrdersByUserId(userId: string) {
    // First verify the user exists
    const user = await this.userService.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    // Get orders
    // ...
  }
}
```

```typescript
// ✅ GOOD: Breaking circular dependencies with interfaces
// features/user/types.ts
export interface User {
  id: string;
  name: string;
  email: string;
}

// Interfaces for order operations needed by user module
export interface OrderOperations {
  getOrdersByUserId(userId: string): Promise<Array<{id: string, total: number}>>;
}

// features/user/user.service.ts
import { User, OrderOperations } from './types';

export class UserService {
  constructor(private orderOps: OrderOperations) {}

  async getUserOrders(userId: string) {
    return this.orderOps.getOrdersByUserId(userId);
  }

  async getUserById(userId: string): Promise<User | null> {
    // Implementation
  }
}

// features/order/order.service.ts
import { User } from '@features/user/types';
import { OrderOperations } from '@features/user/types';

export class OrderService implements OrderOperations {
  async getOrdersByUserId(userId: string) {
    // Implementation that doesn't need to call back to UserService
  }
}

// app/di-container.ts (wiring them up)
import { UserService } from '@features/user/user.service';
import { OrderService } from '@features/order/order.service';

// Order service is created first
const orderService = new OrderService();
// Then passed to user service
const userService = new UserService(orderService);
```

## Related Bindings

- [modularity](../../docs/tenets/modularity.md): This binding is a TypeScript-specific
  implementation of our core modularity tenet, providing concrete guidance on how to
  achieve modularity in TypeScript projects specifically.

- [dependency-inversion](../../docs/bindings/core/dependency-inversion.md): Proper module organization works
  hand-in-hand with dependency inversion. By depending on abstractions (interfaces)
  rather than concrete implementations, modules can communicate without creating tight
  coupling or circular dependencies.

- [ts-no-any](ts-no-any.md): Strong typing is essential for clear module boundaries. By
  avoiding `any`, you create explicit contracts between modules that are enforced by the
  TypeScript compiler.

- [hex-domain-purity](../../docs/bindings/core/hex-domain-purity.md): Feature-based module organization naturally
  supports hexagonal architecture by creating separate modules for domain logic and
  adapters, ensuring clean separation of concerns.

- [immutable-by-default](../../docs/bindings/core/immutable-by-default.md): Module boundaries are more effective
  when data passed between them is immutable, preventing unexpected side effects when
  one module modifies data used by another.
