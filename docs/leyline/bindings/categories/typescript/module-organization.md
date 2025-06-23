---
derived_from: modularity
enforced_by: code review & project linting rules
id: module-organization
last_modified: '2025-05-14'
version: '0.1.0'
---
# Binding: Organize TypeScript Code Into Feature-Focused Modules

Structure TypeScript code into cohesive modules organized by features or domains rather than technical concerns. Each module should encapsulate related functionality with clear boundaries, controlled visibility, and explicit interfaces that hide implementation details.

## Rationale

This binding implements our modularity tenet by defining how to create well-bounded, purpose-driven modules in TypeScript projects. Effective module organization is fundamental to managing complexity in TypeScript codebases, providing natural seams that make the system more understandable and maintainable. Feature-focused modules create natural boundaries that align with how the system changes, while technical-layer modules create artificial boundaries that cut across feature changes, leading to scattered modifications and increased cognitive overhead.

## Rule Definition

**Core Requirements:**

- **Module Identity and Focus**: Modules must be organized around domain concepts, features, or functional areas, not technical roles. Each module should have a single, well-defined responsibility that can be expressed in a short sentence. Module names must be clear, descriptive nouns that reflect the domain concepts they represent

- **Project Structure Requirements**: Follow a consistent project structure with clear separation between application code, types, tests, and assets. Source code must be organized in a `src` directory. Related files should be co-located in feature directories rather than separated by technical role. Maintain a flat hierarchy where possible; avoid deep nesting beyond 3-4 levels

- **Module Boundaries and Visibility**: Each module must clearly define its public API through deliberate exports. Implementation details must be kept private by avoiding direct exports. Use barrel files (`index.ts`) to control and document the public API of a module. Module boundaries must be respected; avoid reaching into the internals of other modules

- **Module Coupling and Dependencies**: Modules must exhibit high internal cohesion and maintain low external coupling. Circular dependencies between modules are prohibited. Higher-level modules should depend on lower-level modules, not vice versa

- **Import and Export Patterns**: Use ES Modules syntax (`import`/`export`) exclusively; CommonJS (`require`) is prohibited. Prefer named exports over default exports for better refactoring support. Re-export shared types and interfaces to create a clear API contract. Minimize the use of deep relative imports (`../../../`) by establishing clear import paths

**Exceptions**: Small utility functions should be kept in the feature modules they serve rather than creating generic utility modules. Shared utilities needed across multiple modules should be organized into purpose-specific shared modules.

## Practical Implementation

1. **Establish a Feature-Based Directory Structure**: Organize your project around domain features rather than technical concerns

2. **Define Clear Module Boundaries with Barrel Files**: Use `index.ts` files to control what each module exposes

3. **Configure Path Aliases for Clean Imports**: Set up TypeScript path aliases to avoid deep relative imports

4. **Implement Dependency Inversion for Module Communication**: Use interfaces to manage dependencies between modules

5. **Use ESLint Rules to Enforce Module Boundaries**: Configure ESLint to ensure module boundaries are respected

## Examples

**Comprehensive Feature-Based Module Organization:**

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

// ✅ GOOD: Feature-based organization that keeps related code together
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

// Module boundary control with barrel files
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

**Path Aliases Configuration:**

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

// Clean imports with path aliases
// Instead of:
import { User } from '../../../features/user/types';
import { formatDate } from '../../../shared/utils/date/format';

// Use:
import { User } from '@features/user';
import { formatDate } from '@utils/date/format';
```

**Dependency Inversion for Module Communication:**

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

**Breaking Circular Dependencies:**

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
    // Get orders...
  }
}

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

**ESLint Configuration for Module Boundaries:**

```javascript
// .eslintrc.js
module.exports = {
  plugins: ['import', 'boundaries'],
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

## Related Bindings

- [modularity](../../tenets/modularity.md): This binding is a TypeScript-specific implementation of our core modularity tenet, providing concrete guidance on how to achieve modularity in TypeScript projects
- [dependency-inversion](../../core/dependency-inversion.md): Proper module organization works hand-in-hand with dependency inversion by depending on abstractions rather than concrete implementations
- [ts-no-any](ts-no-any.md): Strong typing is essential for clear module boundaries by creating explicit contracts between modules that are enforced by the TypeScript compiler
- [hex-domain-purity](../../core/hex-domain-purity.md): Feature-based module organization naturally supports hexagonal architecture by creating separate modules for domain logic and adapters
