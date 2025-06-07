---
derived_from: testability
enforced_by: code review & architecture analysis
id: dependency-inversion
last_modified: '2025-05-14'
---
# Binding: Design Against Abstractions, Not Implementations

High-level modules containing your business logic should never depend on low-level
implementation details. Instead, both high and low-level components should depend on
shared abstractions. These abstractions should be owned by the business domain, with
implementation details depending on them—not the other way around.

## Rationale

This binding directly implements our testability tenet by making code inherently more
testable through decoupling. When your business logic depends only on abstractions
rather than concrete implementations, you can easily substitute real dependencies with
test doubles without changing a single line of your core code. This enables fast,
reliable tests that verify business logic in isolation from external concerns like
databases, APIs, or file systems.

Think of your codebase as a city with different districts. The central business district
(your domain logic) should never rely on specific roads to the outlying industrial areas
(your infrastructure code). Instead, the city publishes transportation standards that
all districts must follow. When the business district needs something from industrial
areas, it uses these standard interfaces without caring about the specific factories
involved. This way, entire industrial zones can be rebuilt or modernized without
disrupting the flow of business in the central district.

The complexity and maintenance cost of a system increases exponentially when high-level
modules directly depend on low-level details. Each time an infrastructure component
changes—whether due to vendor updates, performance optimizations, or security patches—it
ripples through your business logic, requiring changes in the very code that should be
most stable. By inverting these dependencies, you create a protective barrier around
your domain logic, allowing it to remain focused on business problems while
infrastructure evolves independently.

## Rule Definition

The Dependency Inversion Principle (DIP) specifically requires that:

- High-level modules (containing business logic) must not directly reference or import
  low-level modules (infrastructure concerns like databases, external APIs, file
  systems, etc.)
- Both high-level and low-level modules should depend on abstractions (interfaces,
  abstract classes, protocols) that define capabilities without specifying
  implementations
- These abstractions should be owned by and oriented toward the business domain, not the
  technical infrastructure
- The direction of source code dependencies must point inward toward the core domain,
  not outward toward infrastructure

This creates a clear boundary where:

- Your domain models and business logic remain pure and focused, isolated from technical
  details
- Infrastructure components act as plugins to your business core, implementing
  interfaces defined by the domain
- Dependencies flow in one direction, from infrastructure toward domain, making the
  system more modular and testable

There are legitimate exceptions to this rule, primarily at the composition root of your
application—the startup point where you initially wire together abstractions with their
concrete implementations. This area, sometimes called the "main" component or DI
container configuration, is allowed to know about both domains and implementations in
order to connect them, but should not itself contain any business logic.

## Practical Implementation

To effectively implement dependency inversion in your projects:

1. **Define Interfaces in the Domain Layer**: Create interfaces or abstract classes
   within your business domain that represent the capabilities your domain needs, not
   the implementations that will provide them. Ask yourself: "What does my business
   logic need to accomplish its goals?" rather than "How will this be implemented?" For
   example, define a `UserRepository` interface in your domain with methods like
   `findById`, `save`, and `delete` rather than importing a specific MongoDB or SQL
   client.

   ```typescript
   // Domain layer
   export interface UserRepository {
     findById(id: string): Promise<User | null>;
     save(user: User): Promise<void>;
     delete(id: string): Promise<boolean>;
   }
   ```

1. **Use Constructor Dependency Injection**: Have your business logic accept its
   dependencies through constructors rather than creating them directly. This makes
   dependencies explicit, allows them to be substituted during testing, and prevents the
   business layer from knowing which specific implementations are being used.

   ```typescript
   // Domain layer
   export class UserService {
     constructor(private userRepository: UserRepository) {}

     async getUser(id: string): Promise<User | null> {
       return this.userRepository.findById(id);
     }
   }
   ```

1. **Implement Adapters in the Infrastructure Layer**: Create concrete implementations
   of your domain interfaces in a separate infrastructure layer. These adapters
   translate between your domain's abstractions and the specific technologies you're
   using. When implementing these adapters, import from your domain, never the other way
   around.

   ```typescript
   // Infrastructure layer
   import { UserRepository, User } from '../domain/user';

   export class MongoUserRepository implements UserRepository {
     constructor(private mongoClient: MongoClient) {}

     async findById(id: string): Promise<User | null> {
       // MongoDB-specific implementation
     }

     async save(user: User): Promise<void> {
       // MongoDB-specific implementation
     }

     async delete(id: string): Promise<boolean> {
       // MongoDB-specific implementation
     }
   }
   ```

1. **Create a Composition Root**: Use a composition root (often in your application's
   entry point) to wire together your domain services with their infrastructure
   implementations. This is the one place where it's acceptable to know about both
   domains and implementations.

   ```typescript
   // Composition root (application entry point)
   import { UserService } from './domain/user';
   import { MongoUserRepository } from './infrastructure/persistence';

   function bootstrap() {
     const mongoClient = new MongoClient(config.dbUri);
     const userRepository = new MongoUserRepository(mongoClient);
     const userService = new UserService(userRepository);

     // Continue bootstrapping application with the configured services
   }
   ```

1. **Enforce Through Package Structure**: Reinforce dependency inversion through your
   project's physical structure. Organize code into packages/modules that make it
   impossible to import in the wrong direction. Many languages provide module or package
   visibility modifiers that can help enforce these boundaries. If your language
   doesn't, consider using build tools or linters to validate import directions.

## Examples

```typescript
// ❌ BAD: Domain directly depends on infrastructure
import { MongoClient } from 'mongodb';

export class UserService {
  private db: MongoClient;

  constructor() {
    // Domain creates and depends directly on infrastructure
    this.db = new MongoClient('mongodb://localhost:27017');
  }

  async getUser(id: string) {
    await this.db.connect();
    const user = await this.db.db('users').collection('users').findOne({ _id: id });
    return user;
  }

  // Business logic mixed with MongoDB-specific code
  async createUser(userData: any) {
    await this.db.connect();
    const result = await this.db.db('users').collection('users').insertOne(userData);
    return result.insertedId;
  }
}
```

```typescript
// ✅ GOOD: Dependencies point toward the domain
// Domain defines interfaces it needs
export interface UserRepository {
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<void>;
}

export class User {
  constructor(
    public id: string,
    public name: string,
    public email: string
  ) {}

  updateEmail(newEmail: string): void {
    // Email validation logic
    this.email = newEmail;
  }
}

export class UserService {
  constructor(private userRepository: UserRepository) {}

  async getUser(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async updateUserEmail(userId: string, newEmail: string): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    if (!user) return false;

    user.updateEmail(newEmail);
    await this.userRepository.save(user);
    return true;
  }
}

// Infrastructure implements domain interfaces
import { UserRepository, User } from '../domain/user';
import { MongoClient } from 'mongodb';

export class MongoUserRepository implements UserRepository {
  constructor(private client: MongoClient) {}

  async findById(id: string): Promise<User | null> {
    const data = await this.client.db('users').collection('users').findOne({ _id: id });
    if (!data) return null;
    return new User(data._id, data.name, data.email);
  }

  async save(user: User): Promise<void> {
    await this.client.db('users').collection('users').updateOne(
      { _id: user.id },
      { $set: { name: user.name, email: user.email } },
      { upsert: true }
    );
  }
}
```

```typescript
// ❌ BAD: Abstractions depend on details
// Interface bakes in implementation details
export interface UserRepository {
  collection: MongoDB.Collection;
  findUserById(id: string): Promise<Document>;
  insertDocument(doc: Document): Promise<MongoDB.InsertResult>;
}

// ✅ GOOD: Abstractions are implementation-agnostic
export interface UserRepository {
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<void>;
}

// The abstraction uses domain types (User) not infrastructure types (Document)
// Methods express domain concepts not database operations
```

## Related Bindings

- [hex-domain-purity](../../docs/bindings/core/hex-domain-purity.md): These bindings work in tandem to create a
  clean architecture. While dependency inversion focuses on the direction of
  dependencies, hex-domain purity ensures that no infrastructure concepts leak into your
  domain layer. Together, they create a strong boundary that protects your business
  logic from technical details.

- [no-internal-mocking](../../docs/bindings/core/no-internal-mocking.md): Dependency inversion enables proper
  testing without internal mocking. When your code follows dependency inversion, you can
  inject test doubles at the boundaries rather than mocking internal collaborators,
  resulting in more maintainable tests that don't break when implementation details
  change.

- [immutable-by-default](../../docs/bindings/core/immutable-by-default.md): Both bindings promote predictability
  and maintainability. Dependency inversion makes module interactions predictable by
  defining clear interfaces, while immutability makes data flow predictable by
  preventing unexpected mutations. Together, they significantly reduce the cognitive
  load of understanding how code behaves.
