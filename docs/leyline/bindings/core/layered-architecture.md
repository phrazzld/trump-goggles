---
id: layered-architecture
last_modified: '2025-06-15'
version: '0.1.0'
derived_from: orthogonality
enforced_by: 'Build system dependencies, architectural linting, code review'
---

# Binding: Implement Layered Architecture with Dependency Flow Control

Organize code into distinct horizontal layers with well-defined responsibilities, where higher-level layers depend on lower-level layers but never vice versa. This creates a clear hierarchy that separates concerns and enables flexible, testable, and maintainable systems.

## Rationale

This binding implements our orthogonality tenet by creating structured separation between different levels of abstraction and responsibility. Layered architecture prevents high-level policy from becoming entangled with low-level implementation details, enabling each layer to evolve independently as long as the interfaces between layers remain stable.

Without layered organization, code becomes a tangled web where business logic depends on database schemas, user interface code contains business rules, and infrastructure concerns are scattered throughout the application. Layered architecture solves these problems by enforcing a discipline where dependencies flow in only one direction, creating stability and flexibility.

## Rule Definition

**MUST** implement these four distinct layers:

**Presentation Layer**: Handles user interface concerns, input/output formatting, and user interaction workflows. Translates between external interfaces and application use cases.

**Application Layer**: Orchestrates business workflows and use cases. Coordinates between domain services and handles application-specific logic like transaction boundaries and security enforcement.

**Domain Layer**: Contains core business logic, entities, and domain services. Encapsulates the essential complexity of the business problem and must be independent of external concerns.

**Infrastructure Layer**: Handles external concerns like databases, file systems, network communication, and third-party integrations. Implements interfaces defined by higher layers.

**MUST** enforce dependency rules:
- Presentation may depend on Application and Domain
- Application may depend on Domain only
- Domain depends on nothing else in the application
- Infrastructure may depend on Domain and Application (to implement their interfaces)
- Dependencies never flow upward or sideways between peer layers

**MUST** ensure each layer has a single, well-defined responsibility with cohesive internals and loose coupling to other layers.

**SHOULD** communicate between layers through explicit interfaces only.

## Practical Implementation

**Start Simple**: Begin with clear separation of concerns before introducing complex patterns.

**Interface-Driven Design**: Define interfaces in higher layers that lower layers implement.

**Dependency Injection**: Use dependency injection to connect layers without creating tight coupling.

**Test Boundaries**: Each layer should be testable in isolation from others.

**Avoid Cross-Layer Calls**: Never skip layers or create backdoor dependencies.

## Implementation Examples

### ❌ Tangled Architecture

```typescript
// Bad: Business logic mixed with infrastructure concerns
class UserService {
  async registerUser(userData: any) {
    // UI validation mixed with business logic
    if (!userData.email?.includes('@')) {
      throw new Error('Invalid email');
    }

    // Direct database coupling in business logic
    const user = await db.query('INSERT INTO users...', userData);

    // Infrastructure concerns in business layer
    await sendEmail(user.email, 'Welcome!');

    return { message: 'User created successfully' }; // UI concern in service
  }
}
```

### ✅ Layered Architecture

```typescript
// Domain Layer - Pure business logic
interface User {
  id: string;
  email: string;
  username: string;
  createdAt: Date;
}

interface UserRepository {
  save(user: User): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
}

interface EmailService {
  sendWelcome(email: string): Promise<void>;
}

class UserDomainService {
  validateUser(email: string, username: string): void {
    if (!email.includes('@')) {
      throw new Error('Invalid email format');
    }
    if (username.length < 3) {
      throw new Error('Username must be at least 3 characters');
    }
  }

  createUser(email: string, username: string): User {
    this.validateUser(email, username);
    return {
      id: crypto.randomUUID(),
      email: email.toLowerCase(),
      username,
      createdAt: new Date()
    };
  }
}

// Application Layer - Orchestrates business workflows
class UserApplicationService {
  constructor(
    private userRepository: UserRepository,
    private emailService: EmailService,
    private userDomain: UserDomainService
  ) {}

  async registerUser(email: string, username: string): Promise<string> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Create domain object
    const user = this.userDomain.createUser(email, username);

    // Persist user
    await this.userRepository.save(user);

    // Send welcome email
    await this.emailService.sendWelcome(user.email);

    return user.id;
  }
}

// Infrastructure Layer - Implements external concerns
class DatabaseUserRepository implements UserRepository {
  async save(user: User): Promise<User> {
    // Database-specific implementation
    const result = await this.db.query(
      'INSERT INTO users (id, email, username, created_at) VALUES ($1, $2, $3, $4)',
      [user.id, user.email, user.username, user.createdAt]
    );
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.db.query(
      'SELECT id, email, username, created_at FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  }
}

class EmailServiceImpl implements EmailService {
  async sendWelcome(email: string): Promise<void> {
    // Email service implementation
    await this.emailClient.send({
      to: email,
      subject: 'Welcome!',
      template: 'welcome'
    });
  }
}

// Presentation Layer - Handles HTTP concerns
class UserController {
  constructor(private userService: UserApplicationService) {}

  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, username } = req.body;

      // Input validation and formatting
      if (!email || !username) {
        res.status(400).json({ error: 'Email and username required' });
        return;
      }

      const userId = await this.userService.registerUser(email, username);

      res.status(201).json({
        success: true,
        userId,
        message: 'User registered successfully'
      });
    } catch (error) {
      res.status(400).json({
        error: error.message
      });
    }
  }
}

// Composition Root - Wire dependencies
class DIContainer {
  static createUserController(): UserController {
    const userDomain = new UserDomainService();
    const userRepository = new DatabaseUserRepository();
    const emailService = new EmailServiceImpl();

    const userApplication = new UserApplicationService(
      userRepository,
      emailService,
      userDomain
    );

    return new UserController(userApplication);
  }
}
```

## Layer Testing Strategy

```typescript
// Domain Layer - Pure unit tests
describe('UserDomainService', () => {
  test('validates email format', () => {
    const userDomain = new UserDomainService();
    expect(() => userDomain.validateUser('invalid', 'user')).toThrow('Invalid email');
  });
});

// Application Layer - Mock external dependencies
describe('UserApplicationService', () => {
  test('registers new user successfully', async () => {
    const mockRepo = { save: jest.fn(), findByEmail: jest.fn().mockResolvedValue(null) };
    const mockEmail = { sendWelcome: jest.fn() };
    const mockDomain = { createUser: jest.fn().mockReturnValue({ id: '123' }) };

    const service = new UserApplicationService(mockRepo, mockEmail, mockDomain);
    const result = await service.registerUser('test@example.com', 'testuser');

    expect(result).toBe('123');
    expect(mockRepo.save).toHaveBeenCalled();
    expect(mockEmail.sendWelcome).toHaveBeenCalled();
  });
});

// Infrastructure Layer - Integration tests
describe('DatabaseUserRepository', () => {
  test('saves user to database', async () => {
    const repo = new DatabaseUserRepository();
    const user = { id: '123', email: 'test@example.com', username: 'test', createdAt: new Date() };

    const saved = await repo.save(user);
    const found = await repo.findByEmail('test@example.com');

    expect(found).toEqual(user);
  });
});
```

## Common Anti-Patterns

**❌ Layer Skipping**: Presentation layer directly calling Infrastructure layer.

**❌ Circular Dependencies**: Lower layers depending on higher layers.

**❌ Anemic Domain**: Domain layer with only data structures and no business logic.

**❌ Fat Controllers**: Presentation layer containing business logic.

**❌ Leaky Abstractions**: Infrastructure concerns bleeding into domain layer.

## When to Use Layered Architecture

**Good Fit**:
- Complex business logic that benefits from isolation
- Applications requiring high testability
- Systems with multiple external integrations
- Teams needing clear separation of responsibilities

**Poor Fit**:
- Simple CRUD applications with minimal business logic
- High-performance systems where layer overhead is problematic
- Small applications where architectural overhead exceeds benefits

## Architecture Evolution

**Start Minimal**: Begin with basic layer separation and add complexity as needed.

**Measure Impact**: Monitor whether layering improves or hinders development velocity.

**Refactor Boundaries**: Adjust layer responsibilities as domain understanding improves.

**Consider Alternatives**: Evaluate whether other patterns (hexagonal, event-driven) better fit evolving requirements.

## Related Standards

- [dependency-inversion](../../docs/bindings/core/dependency-inversion.md): Provides dependency management patterns that support layer isolation
- [interface-contracts](../../docs/bindings/core/interface-contracts.md): Defines contract design that enables clean layer boundaries
- [component-isolation](../../docs/bindings/core/component-isolation.md): Component separation principles that complement layered architecture

## References

- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Layered Architecture Pattern](https://www.oreilly.com/library/view/software-architecture-patterns/9781491971437/ch01.html)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
