---
derived_from: simplicity
id: hex-domain-purity
last_modified: '2025-05-14'
enforced_by: code review & style guides
---
# Binding: Keep Business Logic Pure and Infrastructure-Free

Your core business logic (domain layer) must remain completely free from infrastructure
concerns. Domain code should never directly import or reference databases, web
frameworks, file systems, third-party APIs, or any other technical implementations.
Instead, create a clear boundary that keeps your domain focused solely on business rules
and concepts.

## Rationale

This binding directly implements our simplicity tenet by eliminating a major source of
accidental complexity—the entanglement of business rules with technical implementations.
When you mix business logic with infrastructure concerns, you create a codebase that's
difficult to understand, test, and evolve. By keeping your domain pure, you reduce this
complexity dramatically, allowing developers to focus on one aspect at a time.

Think of your domain code as a novel and infrastructure as the printing process. A great
story shouldn't be concerned with paper quality, binding techniques, or distribution
channels—those are separate concerns that shouldn't influence the narrative itself.
Similarly, your business logic shouldn't change just because you switch from PostgreSQL
to MongoDB, or from REST to GraphQL. When these concerns remain separate, both your
domain and infrastructure can evolve independently at their own pace, significantly
reducing cognitive load and maintenance costs.

The real power of this separation becomes apparent over time. As your application
evolves, you'll inevitably need to replace or upgrade infrastructure components—perhaps
adopting new databases, switching cloud providers, or modernizing your API layer. With a
pure domain, these changes remain isolated to the infrastructure layer without cascading
through your entire codebase. This dramatically reduces the cost and risk of technical
evolution, giving your application greater longevity and adaptability in the face of
changing technologies.

## Rule Definition

This binding establishes clear boundaries between your domain and infrastructure:

- **Domain Layer Restrictions**: Your domain layer (core business logic) must not:

  - Import or use any infrastructure libraries (databases, HTTP clients, file I/O)
  - Reference specific technologies (SQL queries, HTTP status codes, file paths)
  - Include serialization/deserialization logic for external systems
  - Contain environment-specific behavior or configuration
  - Directly instantiate infrastructure components

- **Interface Ownership**: The domain layer defines interfaces (ports) representing its
  needs for external services, but never implements those interfaces directly:

  - Data persistence (repositories)
  - External services (API clients, notification systems)
  - Security/authentication services
  - Clock/time services
  - Logging/monitoring systems

- **Implementation Location**: All concrete implementations of these interfaces
  (adapters) belong in the infrastructure layer:

  - Database access logic
  - API clients and servers
  - File system interaction
  - Message queues and event buses
  - External service connectors

Limited exceptions exist only for truly domain-level utilities (like date manipulation
without I/O) and cases where infrastructure concepts are genuinely part of the domain
vocabulary (like in a system that manages cloud resources, where "S3 Bucket" might be a
domain concept).

## Practical Implementation

To effectively implement domain purity in your system:

1. **Apply Architectural Patterns**: Adopt a layered architecture pattern that enforces
   domain purity through structure. Ask yourself: "Which architectural boundary style
   works best for our application and team?" Common options include:

   - **Hexagonal Architecture** (Ports & Adapters): Domain at the center, with adapter
     implementations on the outside
   - **Clean Architecture**: Concentric circles with dependencies pointing inward toward
     the domain
   - **Onion Architecture**: Similar to Clean Architecture with domain at the center,
     surrounded by services and infrastructure

   The specific pattern matters less than the clear separation it provides. Choose based
   on your team's familiarity and application's needs.

   ```typescript
   // Project structure example (hexagonal architecture)
   src/
     domain/           // Pure business logic
       entities/
       repositories/   // Interfaces only
       services/
     infrastructure/   // Concrete implementations
       persistence/    // Implements domain/repositories
       external/       // Implements adapters to external systems
       web/            // API controllers, etc.
     application/      // Orchestrates domain and infrastructure
       config/
       di/             // Dependency injection setup
   ```

1. **Create Domain-Centric Interfaces**: Define interfaces in your domain layer that
   express what your business logic needs, not how those needs are implemented. Ask
   yourself: "What capabilities does my domain need, regardless of implementation
   details?" Focus on domain terminology and operations, not technical implementation
   details.

   ```java
   // Domain layer - pure business concepts
   package com.example.domain.repositories;

   import com.example.domain.entities.Customer;

   public interface CustomerRepository {
     Customer findById(CustomerId id);
     void save(Customer customer);
     List<Customer> findByLoyaltyTier(LoyaltyTier tier);
   }
   ```

1. **Enforce Dependency Direction**: Organize your code to make improper dependencies
   physically difficult or impossible. Ask yourself: "If someone violates this pattern,
   will it be immediately obvious?" Use package/module visibility, project structures,
   and build tools to create physical constraints that guide developers toward proper
   architecture.

   ```go
   // Go example with explicitly enforced dependency direction
   package domain // domain package has no imports from infrastructure

   type OrderRepository interface {
     FindById(id OrderId) (Order, error)
     Save(order Order) error
   }

   // infrastructure package imports domain, never the reverse
   package infrastructure

   import "myapp/domain"

   type PostgresOrderRepository struct {
     db *sql.DB
   }

   func (r *PostgresOrderRepository) FindById(id domain.OrderId) (domain.Order, error) {
     // Implementation details
   }
   ```

1. **Use Dependency Injection**: Provide infrastructure implementations to your domain
   code at runtime rather than hardcoding them. Ask yourself: "How will infrastructure
   implementations be connected to the domain?" Use constructor injection or a
   dependency injection container to wire components together at the application's entry
   point.

   ```csharp
   // Domain service that receives its dependencies
   public class OrderService {
     private readonly IOrderRepository _orderRepository;
     private readonly IPaymentGateway _paymentGateway;

     public OrderService(IOrderRepository orderRepository, IPaymentGateway paymentGateway) {
       _orderRepository = orderRepository;
       _paymentGateway = paymentGateway;
     }

     public void PlaceOrder(Order order) {
       // Pure business logic with no knowledge of concrete implementations
     }
   }

   // In application startup/composition root
   services.AddScoped<IOrderRepository, SqlOrderRepository>();
   services.AddScoped<IPaymentGateway, StripePaymentGateway>();
   services.AddScoped<OrderService>();
   ```

1. **Convert Between Boundaries**: When crossing the domain-infrastructure boundary, use
   mappers or adapters to convert between domain objects and infrastructure-specific
   representations. Ask yourself: "How can I prevent leakage between layers?" Ensure
   that infrastructure concepts (like database records) don't leak into your domain
   logic.

   ```python
   # Infrastructure layer mapper example
   class CustomerMapper:
     @staticmethod
     def to_database_record(customer: Customer) -> Dict:
       """Convert domain customer to database record"""
       return {
         "id": str(customer.id),
         "name": customer.name,
         "email": customer.email,
         "loyalty_points": customer.loyalty_status.points
       }

     @staticmethod
     def to_domain_entity(record: Dict) -> Customer:
       """Convert database record to domain customer"""
       customer_id = CustomerId(record["id"])
       loyalty_status = LoyaltyStatus(record["loyalty_points"])
       return Customer(
         id=customer_id,
         name=record["name"],
         email=record["email"],
         loyalty_status=loyalty_status
       )
   ```

## Examples

```java
// ❌ BAD: Domain layer with infrastructure dependencies
// OrderService.java in domain layer
import com.example.domain.Order;
import java.sql.Connection;
import java.sql.PreparedStatement;
import org.apache.http.client.HttpClient;

public class OrderService {
  private final Connection dbConnection;
  private final HttpClient httpClient;

  public OrderService(Connection dbConnection, HttpClient httpClient) {
    this.dbConnection = dbConnection;
    this.httpClient = httpClient;
  }

  public void placeOrder(Order order) {
    try (PreparedStatement stmt = dbConnection.prepareStatement(
         "INSERT INTO orders (id, customer_id, amount) VALUES (?, ?, ?)")) {
      stmt.setString(1, order.getId().toString());
      stmt.setString(2, order.getCustomerId().toString());
      stmt.setBigDecimal(3, order.getAmount());
      stmt.executeUpdate();

      // Directly making HTTP calls to payment gateway
      HttpPost request = new HttpPost("https://payment.example.com/api/v1/charge");
      request.setEntity(new StringEntity("{\"orderId\":\"" + order.getId() + "\"}"));
      httpClient.execute(request);
    } catch (Exception e) {
      throw new RuntimeException("Failed to place order", e);
    }
  }
}
```

```java
// ✅ GOOD: Pure domain with interfaces for infrastructure needs
// Domain layer
public interface OrderRepository {
  void save(Order order);
  Order findById(OrderId id);
}

public interface PaymentGateway {
  PaymentResult processPayment(Order order);
}

public class OrderService {
  private final OrderRepository orderRepository;
  private final PaymentGateway paymentGateway;

  public OrderService(OrderRepository orderRepository, PaymentGateway paymentGateway) {
    this.orderRepository = orderRepository;
    this.paymentGateway = paymentGateway;
  }

  public void placeOrder(Order order) {
    // Validate order (pure domain logic)
    if (!order.isValid()) {
      throw new InvalidOrderException("Order failed validation");
    }

    // Process payment through the abstract interface
    PaymentResult result = paymentGateway.processPayment(order);
    if (!result.isSuccessful()) {
      throw new PaymentFailedException(result.getErrorMessage());
    }

    // Update order status (pure domain logic)
    order.markAsPaid();

    // Persist using the abstract repository
    orderRepository.save(order);
  }
}

// Infrastructure layer (separate module/package)
public class SqlOrderRepository implements OrderRepository {
  private final Connection connection;

  public SqlOrderRepository(Connection connection) {
    this.connection = connection;
  }

  @Override
  public void save(Order order) {
    // Implementation with SQL, JDBC, etc.
  }

  @Override
  public Order findById(OrderId id) {
    // Implementation with SQL, JDBC, etc.
  }
}

public class HttpPaymentGateway implements PaymentGateway {
  private final HttpClient httpClient;

  public HttpPaymentGateway(HttpClient httpClient) {
    this.httpClient = httpClient;
  }

  @Override
  public PaymentResult processPayment(Order order) {
    // Implementation with HTTP, API calls, etc.
  }
}
```

```typescript
// ❌ BAD: Domain entities coupled to infrastructure concerns
// User.ts in domain layer
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { IsEmail, Length } from "class-validator";

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Length(2, 100)
  name: string;

  @Column({ unique: true })
  @IsEmail()
  email: string;

  @Column()
  passwordHash: string;

  // Business logic mixed with ORM concerns
  async checkPassword(plainPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, this.passwordHash);
  }
}
```

```typescript
// ✅ GOOD: Domain entities free from infrastructure concerns
// Domain layer
export class UserId {
  private value: string;

  constructor(value: string) {
    if (!value || !this.isValidUuid(value)) {
      throw new InvalidUserIdError();
    }
    this.value = value;
  }

  toString(): string {
    return this.value;
  }

  private isValidUuid(id: string): boolean {
    // UUID validation logic (pure function, no I/O)
  }
}

export class User {
  private id: UserId;
  private name: string;
  private email: EmailAddress;
  private passwordHash: PasswordHash;

  constructor(id: UserId, name: string, email: EmailAddress, passwordHash: PasswordHash) {
    this.id = id;
    this.setName(name);
    this.email = email;
    this.passwordHash = passwordHash;
  }

  setName(name: string): void {
    if (!name || name.length < 2 || name.length > 100) {
      throw new InvalidNameError();
    }
    this.name = name;
  }

  checkPassword(password: Password): boolean {
    return this.passwordHash.matches(password);
  }

  // Other business logic and getters
}

// Infrastructure layer
import { User, UserId, EmailAddress } from "../domain/user";

// TypeORM entity
@Entity('users')
class UserRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;
}

// Mapper between domain and infrastructure
class UserMapper {
  static toDomain(record: UserRecord): User {
    return new User(
      new UserId(record.id),
      record.name,
      new EmailAddress(record.email),
      new PasswordHash(record.passwordHash)
    );
  }

  static toRecord(user: User): UserRecord {
    const record = new UserRecord();
    record.id = user.getId().toString();
    record.name = user.getName();
    record.email = user.getEmail().toString();
    record.passwordHash = user.getPasswordHash().toString();
    return record;
  }
}
```

## Related Bindings

- [dependency-inversion](../../docs/bindings/core/dependency-inversion.md): While hex-domain-purity focuses on
  keeping business logic free from infrastructure concerns, dependency inversion
  establishes the directional flow of dependencies. Together, they form the foundation
  of clean architecture—domain purity keeps your business logic clean, and dependency
  inversion ensures that dependencies flow toward the domain rather than away from it.

- [external-configuration](../../docs/bindings/core/external-configuration.md): Externalizing configuration
  complements domain purity by removing environment-specific details from your codebase
  entirely. Where domain purity focuses on keeping infrastructure dependencies out of
  your business logic, external configuration takes this a step further by ensuring that
  even adapter implementations don't contain hardcoded connection strings, credentials,
  or environment-specific settings.

- [immutable-by-default](../../docs/bindings/core/immutable-by-default.md): Immutability strengthens domain
  purity by making your business objects more predictable and side-effect free. Pure
  domain models with immutable properties are easier to reason about and less
  susceptible to bugs. Together, these bindings create a domain layer that's both free
  from infrastructure concerns and internally consistent in its handling of state.
