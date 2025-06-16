---
id: system-boundaries
last_modified: '2025-06-02'
version: '0.1.0'
derived_from: orthogonality
enforced_by: 'Architectural review, module organization, build systems'
---
# Binding: Establish Clear System and Module Boundaries

Define explicit boundaries that separate different concerns, domains, or levels of abstraction within your system. These boundaries should be enforced through code organization, build systems, and architectural patterns that prevent unintended dependencies and coupling across boundary lines.

## Rationale

This binding implements our orthogonality tenet by creating architectural separation that prevents components from becoming entangled across different levels of abstraction or domains of responsibility. Clear boundaries act as firewalls that contain complexity within appropriate contexts and prevent changes in one part of the system from unexpectedly affecting unrelated parts.

Think of system boundaries like the walls and doors in a building. Walls separate different rooms (concerns) and provide structural integrity, while doors provide controlled access points between rooms. You wouldn't want the plumbing from the bathroom to run through the kitchen, or electrical systems to be mixed with plumbing—each system has its own dedicated pathways and boundaries. Similarly, software systems need clear separation between different concerns like business logic, data persistence, user interface, and external integrations.

Without well-defined boundaries, systems tend to become "big balls of mud" where everything is connected to everything else. This makes it impossible to understand or change one part of the system without understanding the whole, dramatically increasing complexity and maintenance costs. Clear boundaries enable teams to work independently, facilitate testing, and make system evolution manageable by containing the blast radius of changes.

## Rule Definition

System boundaries must establish these separation principles:

- **Domain Boundaries**: Separate different business domains or problem areas into distinct modules. Each domain should encapsulate its own data models, business rules, and processes without depending on implementation details of other domains.

- **Layer Boundaries**: Enforce separation between different levels of abstraction such as presentation, business logic, and data access layers. Higher layers may depend on lower layers, but not vice versa.

- **Service Boundaries**: Define clear interfaces between different services or major subsystems. Each service should have a well-defined responsibility and communicate with others only through public APIs.

- **Technology Boundaries**: Isolate technology-specific concerns like frameworks, databases, or external APIs from core business logic. This allows technology choices to change without affecting business rules.

- **Team Boundaries**: Align system boundaries with team ownership to enable autonomous development. Each team should own complete, well-bounded portions of the system.

These boundaries should be:
- **Enforceable**: Implemented through technical mechanisms like module systems, build rules, or linting
- **Discoverable**: Clearly documented and reflected in code organization
- **Stable**: Changes to boundaries should be rare and well-coordinated
- **Meaningful**: Based on real functional or team distinctions, not arbitrary technical divisions

Boundary violations may be acceptable when:
- Rapid prototyping requires temporary shortcuts during exploration
- Performance optimizations require cross-boundary access (with careful documentation)
- Legacy system migration requires temporary bridging during transition periods

## Practical Implementation

1. **Organize Code by Domain, Not Technical Layer**: Structure your codebase around business capabilities and problem domains rather than technical concerns. This creates natural boundaries that align with how the business thinks about the system.

2. **Use Build System Enforcement**: Configure your build system to prevent dependencies that cross boundaries inappropriately. Use tools like module systems, dependency analysis, or linting rules to catch boundary violations automatically.

3. **Implement Hexagonal Architecture**: Use architectural patterns like hexagonal architecture (ports and adapters) to separate core business logic from external concerns. This creates clear boundaries between your application's core and its interfaces.

4. **Define Anti-Corruption Layers**: When integrating with external systems or legacy code, create anti-corruption layers that translate between different models and prevent external concerns from polluting your domain.

5. **Establish Communication Protocols**: Define how components across boundaries should communicate—whether through events, APIs, shared databases, or message queues. Make these protocols explicit and enforce them consistently.

## Examples

```typescript
// ❌ BAD: Mixed concerns with no clear boundaries
// All code in one large module with entangled responsibilities

// User interface mixed with business logic
class UserRegistrationForm {
  async onSubmit(formData) {
    // UI validation mixed with business rules
    if (!formData.email.includes('@')) {
      this.showError('Invalid email');
      return;
    }

    // Direct database access from UI layer
    const existingUser = await database.users.findOne({
      email: formData.email
    });

    if (existingUser) {
      this.showError('User already exists');
      return;
    }

    // Business logic mixed with persistence
    const hashedPassword = await bcrypt.hash(formData.password, 10);
    const user = await database.users.create({
      email: formData.email,
      password: hashedPassword,
      createdAt: new Date()
    });

    // Infrastructure concerns mixed with UI
    await emailService.sendWelcomeEmail(user.email);
    await analyticsService.track('user_registered', { userId: user.id });

    this.showSuccess('Registration successful');
  }
}

// ✅ GOOD: Clear boundaries separating concerns
// Domain Layer - Pure business logic
export class UserRegistrationService {
  constructor(
    private userRepository: UserRepository,
    private passwordService: PasswordService,
    private eventPublisher: EventPublisher
  ) {}

  async registerUser(request: RegisterUserRequest): Promise<User> {
    // Domain validation
    if (!this.isValidEmail(request.email)) {
      throw new InvalidEmailError(request.email);
    }

    // Check business rules
    const existingUser = await this.userRepository.findByEmail(request.email);
    if (existingUser) {
      throw new UserAlreadyExistsError(request.email);
    }

    // Create domain entity
    const hashedPassword = await this.passwordService.hash(request.password);
    const user = new User({
      email: request.email,
      password: hashedPassword,
      registeredAt: new Date()
    });

    // Persist through repository interface
    const savedUser = await this.userRepository.save(user);

    // Publish domain event
    await this.eventPublisher.publish(new UserRegisteredEvent(savedUser));

    return savedUser;
  }

  private isValidEmail(email: string): boolean {
    return email.includes('@') && email.includes('.');
  }
}

// Application Layer - Orchestrates use cases
export class UserRegistrationController {
  constructor(
    private registrationService: UserRegistrationService,
    private validator: RequestValidator
  ) {}

  async handleRegistration(request: HttpRequest): Promise<HttpResponse> {
    try {
      // Application-level validation
      const validatedData = await this.validator.validate(request.body);

      // Delegate to domain service
      const user = await this.registrationService.registerUser(validatedData);

      return {
        status: 201,
        body: { userId: user.id, message: 'Registration successful' }
      };
    } catch (error) {
      return this.handleError(error);
    }
  }
}

// Infrastructure Layer - External concerns
export class EmailEventHandler {
  constructor(private emailService: EmailService) {}

  async handle(event: UserRegisteredEvent): Promise<void> {
    await this.emailService.sendWelcomeEmail(event.user.email);
  }
}

export class AnalyticsEventHandler {
  constructor(private analytics: AnalyticsService) {}

  async handle(event: UserRegisteredEvent): Promise<void> {
    await this.analytics.track('user_registered', {
      userId: event.user.id,
      timestamp: event.occurredAt
    });
  }
}
```

```python
# ❌ BAD: Monolithic structure with boundary violations
# Everything in one package with no separation

class OrderProcessor:
    def process_order(self, order_data):
        # Payment processing mixed with order logic
        payment_result = stripe.charge(
            amount=order_data['total'],
            token=order_data['payment_token']
        )

        # Inventory management mixed with payment
        for item in order_data['items']:
            inventory_item = database.inventory.find_one({'sku': item['sku']})
            inventory_item['quantity'] -= item['quantity']
            database.inventory.save(inventory_item)

        # Shipping logic mixed with order processing
        shipping_address = order_data['shipping_address']
        shipping_cost = fedex.calculate_shipping(
            weight=sum(item['weight'] for item in order_data['items']),
            destination=shipping_address
        )

        # Email notification mixed with business logic
        customer_email = order_data['customer_email']
        email_service.send_order_confirmation(customer_email, order_data)

# ✅ GOOD: Clear domain boundaries with proper separation
# Order Domain
class Order:
    def __init__(self, customer_id: str, items: List[OrderItem]):
        self.customer_id = customer_id
        self.items = items
        self.status = OrderStatus.PENDING
        self.total = self.calculate_total()

    def calculate_total(self) -> Decimal:
        return sum(item.price * item.quantity for item in self.items)

    def confirm(self) -> None:
        if self.status != OrderStatus.PENDING:
            raise InvalidOrderStateError(f"Cannot confirm order in {self.status} state")
        self.status = OrderStatus.CONFIRMED

class OrderService:
    def __init__(self, order_repo: OrderRepository, event_bus: EventBus):
        self.order_repo = order_repo
        self.event_bus = event_bus

    def create_order(self, customer_id: str, items: List[OrderItem]) -> Order:
        order = Order(customer_id, items)
        saved_order = self.order_repo.save(order)

        # Publish domain event
        self.event_bus.publish(OrderCreatedEvent(saved_order))
        return saved_order

# Payment Domain
class PaymentService:
    def __init__(self, payment_gateway: PaymentGateway, event_bus: EventBus):
        self.payment_gateway = payment_gateway
        self.event_bus = event_bus

    def process_payment(self, order_id: str, payment_method: PaymentMethod) -> Payment:
        # Payment domain logic only
        payment = Payment(order_id, payment_method.amount, payment_method)

        gateway_result = self.payment_gateway.charge(payment_method)
        if gateway_result.success:
            payment.mark_successful(gateway_result.transaction_id)
            self.event_bus.publish(PaymentSucceededEvent(payment))
        else:
            payment.mark_failed(gateway_result.error_message)
            self.event_bus.publish(PaymentFailedEvent(payment))

        return payment

# Inventory Domain
class InventoryService:
    def __init__(self, inventory_repo: InventoryRepository):
        self.inventory_repo = inventory_repo

    def reserve_items(self, order_items: List[OrderItem]) -> ReservationResult:
        reservations = []

        for item in order_items:
            inventory_item = self.inventory_repo.find_by_sku(item.sku)
            if inventory_item.available_quantity >= item.quantity:
                reservation = inventory_item.reserve(item.quantity)
                reservations.append(reservation)
            else:
                # Rollback previous reservations
                for prev_reservation in reservations:
                    prev_reservation.cancel()
                return ReservationResult.insufficient_inventory(item.sku)

        return ReservationResult.success(reservations)

# Application Layer - Orchestrates across domains
class OrderProcessingService:
    def __init__(
        self,
        order_service: OrderService,
        payment_service: PaymentService,
        inventory_service: InventoryService
    ):
        self.order_service = order_service
        self.payment_service = payment_service
        self.inventory_service = inventory_service

    async def process_order(self, order_request: OrderRequest) -> OrderResult:
        try:
            # Step 1: Create order (Order domain)
            order = self.order_service.create_order(
                order_request.customer_id,
                order_request.items
            )

            # Step 2: Reserve inventory (Inventory domain)
            reservation_result = self.inventory_service.reserve_items(order.items)
            if not reservation_result.success:
                return OrderResult.failed(f"Insufficient inventory: {reservation_result.error}")

            # Step 3: Process payment (Payment domain)
            payment = self.payment_service.process_payment(
                order.id,
                order_request.payment_method
            )

            if payment.status == PaymentStatus.SUCCESSFUL:
                order.confirm()
                return OrderResult.success(order)
            else:
                # Rollback inventory reservation
                reservation_result.rollback()
                return OrderResult.failed(f"Payment failed: {payment.error_message}")

        except Exception as error:
            # Handle any system-level errors
            return OrderResult.failed(f"System error: {str(error)}")
```

```go
// ❌ BAD: Circular dependencies and boundary violations
package main

// user package imports order package
// order package imports user package
// circular dependency prevents clear boundaries

// ✅ GOOD: Clear layered architecture with enforced boundaries
// Domain layer - core business logic
package domain

type User struct {
    ID       string
    Email    string
    Name     string
    Status   UserStatus
}

type UserRepository interface {
    Save(user *User) error
    FindByID(id string) (*User, error)
    FindByEmail(email string) (*User, error)
}

type UserService struct {
    userRepo UserRepository
    events   EventPublisher
}

func (s *UserService) CreateUser(email, name string) (*User, error) {
    // Business rule validation
    if !isValidEmail(email) {
        return nil, ErrInvalidEmail
    }

    existing, _ := s.userRepo.FindByEmail(email)
    if existing != nil {
        return nil, ErrUserExists
    }

    user := &User{
        ID:     generateID(),
        Email:  email,
        Name:   name,
        Status: UserStatusActive,
    }

    if err := s.userRepo.Save(user); err != nil {
        return nil, fmt.Errorf("failed to save user: %w", err)
    }

    // Publish domain event
    s.events.Publish(UserCreatedEvent{User: user})

    return user, nil
}

// Application layer - use case orchestration
package application

import (
    "myapp/domain"
    "myapp/infrastructure"
)

type CreateUserCommand struct {
    Email string `json:"email"`
    Name  string `json:"name"`
}

type UserApplicationService struct {
    userService *domain.UserService
    validator   *RequestValidator
}

func NewUserApplicationService(
    userRepo domain.UserRepository,
    events domain.EventPublisher,
) *UserApplicationService {
    return &UserApplicationService{
        userService: &domain.UserService{
            UserRepo: userRepo,
            Events:   events,
        },
        validator: &RequestValidator{},
    }
}

func (s *UserApplicationService) CreateUser(cmd CreateUserCommand) (*domain.User, error) {
    // Application-level validation
    if err := s.validator.Validate(cmd); err != nil {
        return nil, fmt.Errorf("validation failed: %w", err)
    }

    // Delegate to domain service
    return s.userService.CreateUser(cmd.Email, cmd.Name)
}

// Infrastructure layer - external concerns
package infrastructure

import (
    "database/sql"
    "myapp/domain"
)

type PostgresUserRepository struct {
    db *sql.DB
}

func (r *PostgresUserRepository) Save(user *domain.User) error {
    query := `INSERT INTO users (id, email, name, status) VALUES ($1, $2, $3, $4)`
    _, err := r.db.Exec(query, user.ID, user.Email, user.Name, user.Status)
    return err
}

func (r *PostgresUserRepository) FindByID(id string) (*domain.User, error) {
    query := `SELECT id, email, name, status FROM users WHERE id = $1`
    row := r.db.QueryRow(query, id)

    var user domain.User
    err := row.Scan(&user.ID, &user.Email, &user.Name, &user.Status)
    if err != nil {
        return nil, err
    }

    return &user, nil
}

// HTTP interface layer
package interfaces

import (
    "encoding/json"
    "net/http"
    "myapp/application"
)

type UserHandler struct {
    userApp *application.UserApplicationService
}

func (h *UserHandler) CreateUser(w http.ResponseWriter, r *http.Request) {
    var cmd application.CreateUserCommand
    if err := json.NewDecoder(r.Body).Decode(&cmd); err != nil {
        http.Error(w, "Invalid request", http.StatusBadRequest)
        return
    }

    user, err := h.userApp.CreateUser(cmd)
    if err != nil {
        // Handle different error types appropriately
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(user)
}

// Build enforcement in go.mod
module myapp

// Enforce layering through separate modules
require (
    myapp/domain v0.0.0
    myapp/application v0.0.0
    myapp/infrastructure v0.0.0
    myapp/interfaces v0.0.0
)

// domain module cannot import application/infrastructure/interfaces
// application can import domain only
// infrastructure can import domain only
// interfaces can import application and domain
```

## Related Bindings

- [component-isolation.md](../../docs/bindings/core/component-isolation.md): System boundaries provide the architectural context within which component isolation occurs. While component isolation focuses on individual component independence, system boundaries define the larger structural separations that organize these components.

- [hex-domain-purity.md](../../docs/bindings/core/hex-domain-purity.md): Hexagonal architecture is a specific pattern for implementing system boundaries between core business logic and external concerns. Both bindings work together to create clean separation of concerns at different scales.

- [dependency-inversion.md](../../docs/bindings/core/dependency-inversion.md): Dependency inversion is a key technique for maintaining system boundaries. By depending on abstractions rather than implementations, boundaries can be enforced while still allowing necessary communication between layers.

- [layered-architecture.md](../../docs/bindings/core/layered-architecture.md): Layered architecture is one specific way to implement system boundaries through horizontal separation of concerns. Both bindings focus on creating clear architectural separations, with layered architecture being a concrete implementation pattern.
