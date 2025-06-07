---
id: layered-architecture
last_modified: '2025-06-02'
derived_from: orthogonality
enforced_by: 'Build system dependencies, architectural linting, code review'
---

# Binding: Implement Layered Architecture with Dependency Flow Control

Organize code into distinct horizontal layers with well-defined responsibilities, where higher-level layers depend on lower-level layers but never vice versa. This creates a clear hierarchy that separates concerns and enables flexible, testable, and maintainable systems.

## Rationale

This binding implements our orthogonality tenet by creating structured separation between different levels of abstraction and responsibility. Layered architecture prevents high-level policy from becoming entangled with low-level implementation details, enabling each layer to evolve independently as long as the interfaces between layers remain stable.

Think of layered architecture like a well-organized office building. The executive offices on the top floor make high-level decisions but don't need to know about the details of how the mailroom operates. The mailroom provides services to the entire building but doesn't make business decisions. Each floor has its own purpose and can be renovated or reorganized without affecting other floors, as long as the elevator system (interfaces) continues to work. This separation allows specialists to focus on their area of expertise while maintaining a cohesive organization.

Without layered organization, code tends to become a tangled web where business logic depends on database schemas, user interface code contains business rules, and infrastructure concerns are scattered throughout the application. This mixing makes it difficult to test components in isolation, adapt to changing requirements, or replace technology choices without widespread code changes. Layered architecture solves these problems by enforcing a discipline where dependencies flow in only one direction, creating stability and flexibility.

## Rule Definition

Layered architecture must establish these structural principles:

- **Presentation Layer**: Handles user interface concerns, input/output formatting, and user interaction workflows. This layer translates between external interfaces and application use cases.

- **Application Layer**: Orchestrates business workflows and use cases. This layer coordinates between domain services and handles application-specific logic like transaction boundaries and security enforcement.

- **Domain Layer**: Contains core business logic, entities, and domain services. This layer encapsulates the essential complexity of the business problem and should be independent of external concerns.

- **Infrastructure Layer**: Handles external concerns like databases, file systems, network communication, and third-party integrations. This layer implements interfaces defined by higher layers.

**Dependency Rules:**
- **Presentation** may depend on **Application** and **Domain**
- **Application** may depend on **Domain** only
- **Domain** depends on nothing else in the application
- **Infrastructure** may depend on **Domain** and **Application** (to implement their interfaces)
- Dependencies never flow upward or sideways between peer layers

**Layer Responsibilities:**
- Each layer should have a single, well-defined responsibility
- Layers should be cohesive within themselves and loosely coupled to other layers
- Communication between layers should happen through explicit interfaces
- Cross-cutting concerns (logging, security) should be handled through dependency injection or aspect-oriented patterns

Exceptions to strict layering may be appropriate when:
- Performance optimization requires direct access (with careful justification)
- Framework constraints make pure layering impractical
- Simple applications where layering overhead exceeds benefits

## Practical Implementation

1. **Organize Code by Layer, Not Feature**: Structure your project directories to reflect the layered architecture, making the architectural intentions clear to developers and build systems.

2. **Use Dependency Injection at Layer Boundaries**: Implement interfaces in lower layers and inject concrete implementations from higher layers or composition roots. This maintains dependency direction while enabling flexibility.

3. **Enforce Dependencies with Build Tools**: Configure your build system, linting tools, or dependency analysis tools to prevent dependency violations. Make architectural violations impossible rather than just discouraged.

4. **Keep Domain Layer Pure**: Ensure the domain layer has no dependencies on frameworks, databases, or external systems. It should contain only business logic and can be tested in isolation.

5. **Implement Anti-Corruption Layers**: When integrating with external systems, create anti-corruption layers in the infrastructure tier that translate between external models and your domain models.

## Examples

```typescript
// ❌ BAD: Mixed layers with unclear dependencies
// UI code mixed with business logic and database access

class UserRegistrationForm extends React.Component {
  async handleSubmit(formData) {
    // UI validation mixed with business rules
    if (!formData.email.includes('@')) {
      this.setState({ error: 'Invalid email' });
      return;
    }

    // Direct database access from UI
    const db = await MongoClient.connect('mongodb://localhost:27017');
    const users = db.collection('users');

    // Business logic in UI layer
    const existingUser = await users.findOne({ email: formData.email });
    if (existingUser) {
      this.setState({ error: 'User already exists' });
      return;
    }

    // Password hashing in UI layer
    const hashedPassword = await bcrypt.hash(formData.password, 10);

    // Direct email service access from UI
    const user = await users.insertOne({
      email: formData.email,
      password: hashedPassword,
      createdAt: new Date()
    });

    await sendgrid.send({
      to: formData.email,
      subject: 'Welcome!',
      html: '<h1>Welcome to our service!</h1>'
    });

    this.setState({ success: true });
  }
}

// ✅ GOOD: Clear layered architecture with proper separation
// Domain Layer - Core business logic
export class User {
  constructor(
    public readonly id: UserId,
    public readonly email: Email,
    public readonly hashedPassword: string,
    public readonly registeredAt: Date
  ) {}

  static create(email: string, plainPassword: string): User {
    return new User(
      UserId.generate(),
      Email.from(email), // Value object with validation
      PasswordHash.from(plainPassword),
      new Date()
    );
  }
}

export interface UserRepository {
  save(user: User): Promise<void>;
  findByEmail(email: Email): Promise<User | null>;
}

export class UserRegistrationService {
  constructor(private userRepository: UserRepository) {}

  async registerUser(email: string, password: string): Promise<User> {
    // Domain validation
    const emailValue = Email.from(email);

    // Business rule enforcement
    const existingUser = await this.userRepository.findByEmail(emailValue);
    if (existingUser) {
      throw new UserAlreadyExistsError(email);
    }

    // Create domain entity
    const user = User.create(email, password);
    await this.userRepository.save(user);

    return user;
  }
}

// Application Layer - Use case orchestration
export class RegisterUserCommand {
  constructor(
    public readonly email: string,
    public readonly password: string
  ) {}
}

export class RegisterUserUseCase {
  constructor(
    private userService: UserRegistrationService,
    private eventPublisher: EventPublisher,
    private transactionManager: TransactionManager
  ) {}

  async execute(command: RegisterUserCommand): Promise<RegisterUserResult> {
    return this.transactionManager.withTransaction(async () => {
      try {
        const user = await this.userService.registerUser(
          command.email,
          command.password
        );

        // Publish application event
        await this.eventPublisher.publish(new UserRegisteredEvent(user));

        return RegisterUserResult.success(user);
      } catch (error) {
        if (error instanceof UserAlreadyExistsError) {
          return RegisterUserResult.failure('Email already registered');
        }
        throw error;
      }
    });
  }
}

// Infrastructure Layer - External concerns
export class PostgresUserRepository implements UserRepository {
  constructor(private database: Database) {}

  async save(user: User): Promise<void> {
    await this.database.query(
      'INSERT INTO users (id, email, password_hash, registered_at) VALUES ($1, $2, $3, $4)',
      [user.id.value, user.email.value, user.hashedPassword, user.registeredAt]
    );
  }

  async findByEmail(email: Email): Promise<User | null> {
    const rows = await this.database.query(
      'SELECT id, email, password_hash, registered_at FROM users WHERE email = $1',
      [email.value]
    );

    if (rows.length === 0) return null;

    const row = rows[0];
    return new User(
      new UserId(row.id),
      new Email(row.email),
      row.password_hash,
      row.registered_at
    );
  }
}

export class EmailNotificationHandler {
  constructor(private emailService: EmailService) {}

  async handle(event: UserRegisteredEvent): Promise<void> {
    await this.emailService.send({
      to: event.user.email.value,
      subject: 'Welcome!',
      template: 'welcome',
      data: { userName: event.user.email.value }
    });
  }
}

// Presentation Layer - HTTP/UI interface
export class UserRegistrationController {
  constructor(private registerUserUseCase: RegisterUserUseCase) {}

  async register(request: HttpRequest): Promise<HttpResponse> {
    try {
      const { email, password } = request.body;

      // Input validation
      if (!email || !password) {
        return HttpResponse.badRequest('Email and password required');
      }

      const command = new RegisterUserCommand(email, password);
      const result = await this.registerUserUseCase.execute(command);

      if (result.isSuccess()) {
        return HttpResponse.created({
          userId: result.user.id.value,
          message: 'User registered successfully'
        });
      } else {
        return HttpResponse.badRequest(result.errorMessage);
      }
    } catch (error) {
      return HttpResponse.internalServerError('Registration failed');
    }
  }
}

// Composition Root - Dependency wiring
export class ApplicationCompositionRoot {
  static create(): UserRegistrationController {
    // Infrastructure
    const database = new PostgresDatabase(config.databaseUrl);
    const emailService = new SendgridEmailService(config.sendgridKey);
    const eventBus = new InMemoryEventBus();

    // Repositories
    const userRepository = new PostgresUserRepository(database);

    // Domain services
    const userService = new UserRegistrationService(userRepository);

    // Event handlers
    eventBus.subscribe(
      'UserRegistered',
      new EmailNotificationHandler(emailService)
    );

    // Application services
    const transactionManager = new DatabaseTransactionManager(database);
    const registerUserUseCase = new RegisterUserUseCase(
      userService,
      eventBus,
      transactionManager
    );

    // Controllers
    return new UserRegistrationController(registerUserUseCase);
  }
}
```

```python
# ❌ BAD: No clear layer separation
class OrderAPI:
    def create_order(self, request_data):
        # Mixed HTTP, business logic, and database concerns

        # HTTP parsing mixed with business validation
        customer_id = request_data.get('customer_id')
        if not customer_id:
            return {'error': 'Customer ID required'}, 400

        # Direct database access from API layer
        customer = db.session.query(Customer).filter_by(id=customer_id).first()
        if not customer:
            return {'error': 'Customer not found'}, 404

        # Business logic mixed with HTTP concerns
        total = 0
        for item_data in request_data['items']:
            product = db.session.query(Product).filter_by(id=item_data['product_id']).first()
            if product.stock < item_data['quantity']:
                return {'error': f'Insufficient stock for {product.name}'}, 400
            total += product.price * item_data['quantity']

            # Update stock directly in API
            product.stock -= item_data['quantity']

        # Order creation mixed with stock management
        order = Order(
            customer_id=customer_id,
            total=total,
            status='pending'
        )
        db.session.add(order)

        # Email sending mixed with order processing
        email_service.send_order_confirmation(customer.email, order)

        db.session.commit()
        return {'order_id': order.id}, 201

# ✅ GOOD: Clear layered architecture
# Domain Layer
class Money:
    def __init__(self, amount: Decimal):
        if amount < 0:
            raise ValueError("Amount cannot be negative")
        self.amount = amount

    def add(self, other: 'Money') -> 'Money':
        return Money(self.amount + other.amount)

class OrderItem:
    def __init__(self, product_id: str, quantity: int, unit_price: Money):
        self.product_id = product_id
        self.quantity = quantity
        self.unit_price = unit_price

    def total_price(self) -> Money:
        return Money(self.unit_price.amount * self.quantity)

class Order:
    def __init__(self, customer_id: str, items: List[OrderItem]):
        self.id = str(uuid.uuid4())
        self.customer_id = customer_id
        self.items = items
        self.status = OrderStatus.PENDING
        self.created_at = datetime.utcnow()

    def calculate_total(self) -> Money:
        total = Money(Decimal('0'))
        for item in self.items:
            total = total.add(item.total_price())
        return total

    def confirm(self) -> None:
        if self.status != OrderStatus.PENDING:
            raise InvalidOrderStateError(f"Cannot confirm order in {self.status} state")
        self.status = OrderStatus.CONFIRMED

# Domain Services
class OrderService:
    def __init__(self, order_repo: OrderRepository, inventory_service: InventoryService):
        self.order_repo = order_repo
        self.inventory_service = inventory_service

    def create_order(self, customer_id: str, order_items: List[OrderItem]) -> Order:
        # Validate inventory availability
        for item in order_items:
            if not self.inventory_service.is_available(item.product_id, item.quantity):
                raise InsufficientInventoryError(item.product_id, item.quantity)

        # Create order entity
        order = Order(customer_id, order_items)

        # Reserve inventory
        for item in order_items:
            self.inventory_service.reserve(item.product_id, item.quantity)

        # Save order
        self.order_repo.save(order)

        return order

# Application Layer
class CreateOrderCommand:
    def __init__(self, customer_id: str, items: List[Dict]):
        self.customer_id = customer_id
        self.items = items

class CreateOrderUseCase:
    def __init__(
        self,
        order_service: OrderService,
        customer_service: CustomerService,
        product_service: ProductService,
        event_publisher: EventPublisher
    ):
        self.order_service = order_service
        self.customer_service = customer_service
        self.product_service = product_service
        self.event_publisher = event_publisher

    def execute(self, command: CreateOrderCommand) -> CreateOrderResult:
        try:
            # Validate customer exists
            if not self.customer_service.exists(command.customer_id):
                return CreateOrderResult.failure("Customer not found")

            # Convert to domain objects
            order_items = []
            for item_data in command.items:
                product = self.product_service.get_by_id(item_data['product_id'])
                if not product:
                    return CreateOrderResult.failure(f"Product {item_data['product_id']} not found")

                order_item = OrderItem(
                    product_id=product.id,
                    quantity=item_data['quantity'],
                    unit_price=product.price
                )
                order_items.append(order_item)

            # Create order through domain service
            order = self.order_service.create_order(command.customer_id, order_items)

            # Publish domain event
            self.event_publisher.publish(OrderCreatedEvent(order))

            return CreateOrderResult.success(order)

        except InsufficientInventoryError as e:
            return CreateOrderResult.failure(f"Insufficient stock for product {e.product_id}")
        except Exception as e:
            return CreateOrderResult.failure(f"Order creation failed: {str(e)}")

# Infrastructure Layer
class SQLOrderRepository(OrderRepository):
    def __init__(self, session: Session):
        self.session = session

    def save(self, order: Order) -> None:
        order_record = OrderRecord(
            id=order.id,
            customer_id=order.customer_id,
            status=order.status.value,
            total=order.calculate_total().amount,
            created_at=order.created_at
        )
        self.session.add(order_record)

        for item in order.items:
            item_record = OrderItemRecord(
                order_id=order.id,
                product_id=item.product_id,
                quantity=item.quantity,
                unit_price=item.unit_price.amount
            )
            self.session.add(item_record)

        self.session.commit()

# Presentation Layer
class OrderController:
    def __init__(self, create_order_use_case: CreateOrderUseCase):
        self.create_order_use_case = create_order_use_case

    def create_order(self, request: HTTPRequest) -> HTTPResponse:
        try:
            # Request validation
            if not request.json:
                return HTTPResponse.bad_request("JSON body required")

            # Extract command data
            command = CreateOrderCommand(
                customer_id=request.json.get('customer_id'),
                items=request.json.get('items', [])
            )

            # Input validation
            if not command.customer_id:
                return HTTPResponse.bad_request("Customer ID required")

            if not command.items:
                return HTTPResponse.bad_request("Order items required")

            # Execute use case
            result = self.create_order_use_case.execute(command)

            if result.is_success():
                return HTTPResponse.created({
                    'order_id': result.order.id,
                    'total': float(result.order.calculate_total().amount),
                    'status': result.order.status.value
                })
            else:
                return HTTPResponse.bad_request(result.error_message)

        except Exception as e:
            logger.exception("Unexpected error in order creation")
            return HTTPResponse.internal_server_error("Order creation failed")
```

```go
// ❌ BAD: Layers mixed together
package main

import (
    "database/sql"
    "encoding/json"
    "net/http"
)

// HTTP handler with embedded business logic and database access
func CreateProduct(w http.ResponseWriter, r *http.Request) {
    // HTTP parsing mixed with business validation
    var req struct {
        Name  string  `json:"name"`
        Price float64 `json:"price"`
    }

    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, "Invalid JSON", 400)
        return
    }

    // Business validation in HTTP handler
    if req.Name == "" {
        http.Error(w, "Name required", 400)
        return
    }

    if req.Price <= 0 {
        http.Error(w, "Price must be positive", 400)
        return
    }

    // Direct database access from HTTP layer
    db, err := sql.Open("postgres", "postgres://localhost/myapp")
    if err != nil {
        http.Error(w, "Database error", 500)
        return
    }
    defer db.Close()

    // Business logic mixed with SQL
    var existingProduct string
    err = db.QueryRow("SELECT name FROM products WHERE name = $1", req.Name).Scan(&existingProduct)
    if err == nil {
        http.Error(w, "Product already exists", 409)
        return
    }

    // Product creation mixed with database operations
    id := generateUUID()
    _, err = db.Exec(
        "INSERT INTO products (id, name, price, created_at) VALUES ($1, $2, $3, $4)",
        id, req.Name, req.Price, time.Now(),
    )

    if err != nil {
        http.Error(w, "Failed to create product", 500)
        return
    }

    // Response formatting mixed with business logic
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(201)
    json.NewEncoder(w).Encode(map[string]interface{}{
        "id":   id,
        "name": req.Name,
        "price": req.Price,
    })
}

// ✅ GOOD: Clear layered architecture
// Domain Layer
package domain

import (
    "errors"
    "time"
)

type ProductID string
type Money float64

type Product struct {
    ID        ProductID
    Name      string
    Price     Money
    CreatedAt time.Time
}

func NewProduct(name string, price Money) (*Product, error) {
    if name == "" {
        return nil, errors.New("product name cannot be empty")
    }

    if price <= 0 {
        return nil, errors.New("product price must be positive")
    }

    return &Product{
        ID:        ProductID(generateUUID()),
        Name:      name,
        Price:     price,
        CreatedAt: time.Now(),
    }, nil
}

type ProductRepository interface {
    Save(product *Product) error
    FindByName(name string) (*Product, error)
    FindByID(id ProductID) (*Product, error)
}

type ProductService struct {
    productRepo ProductRepository
}

func NewProductService(repo ProductRepository) *ProductService {
    return &ProductService{productRepo: repo}
}

func (s *ProductService) CreateProduct(name string, price Money) (*Product, error) {
    // Check if product already exists
    existing, err := s.productRepo.FindByName(name)
    if err == nil && existing != nil {
        return nil, errors.New("product with this name already exists")
    }

    // Create new product
    product, err := NewProduct(name, price)
    if err != nil {
        return nil, err
    }

    // Save product
    if err := s.productRepo.Save(product); err != nil {
        return nil, err
    }

    return product, nil
}

// Application Layer
package application

import (
    "myapp/domain"
)

type CreateProductCommand struct {
    Name  string  `json:"name"`
    Price float64 `json:"price"`
}

type CreateProductResult struct {
    Product *domain.Product
    Error   string
}

func (r CreateProductResult) IsSuccess() bool {
    return r.Error == ""
}

type ProductApplicationService struct {
    productService *domain.ProductService
    eventPublisher EventPublisher
}

func NewProductApplicationService(
    productService *domain.ProductService,
    eventPublisher EventPublisher,
) *ProductApplicationService {
    return &ProductApplicationService{
        productService: productService,
        eventPublisher: eventPublisher,
    }
}

func (s *ProductApplicationService) CreateProduct(cmd CreateProductCommand) CreateProductResult {
    // Input validation
    if cmd.Name == "" {
        return CreateProductResult{Error: "Product name is required"}
    }

    if cmd.Price <= 0 {
        return CreateProductResult{Error: "Product price must be positive"}
    }

    // Delegate to domain service
    product, err := s.productService.CreateProduct(cmd.Name, domain.Money(cmd.Price))
    if err != nil {
        return CreateProductResult{Error: err.Error()}
    }

    // Publish application event
    s.eventPublisher.Publish(ProductCreatedEvent{Product: product})

    return CreateProductResult{Product: product}
}

// Infrastructure Layer
package infrastructure

import (
    "database/sql"
    "myapp/domain"
    _ "github.com/lib/pq"
)

type PostgresProductRepository struct {
    db *sql.DB
}

func NewPostgresProductRepository(db *sql.DB) *PostgresProductRepository {
    return &PostgresProductRepository{db: db}
}

func (r *PostgresProductRepository) Save(product *domain.Product) error {
    query := `INSERT INTO products (id, name, price, created_at) VALUES ($1, $2, $3, $4)`
    _, err := r.db.Exec(
        query,
        string(product.ID),
        product.Name,
        float64(product.Price),
        product.CreatedAt,
    )
    return err
}

func (r *PostgresProductRepository) FindByName(name string) (*domain.Product, error) {
    query := `SELECT id, name, price, created_at FROM products WHERE name = $1`
    row := r.db.QueryRow(query, name)

    var id, productName string
    var price float64
    var createdAt time.Time

    err := row.Scan(&id, &productName, &price, &createdAt)
    if err == sql.ErrNoRows {
        return nil, nil
    }
    if err != nil {
        return nil, err
    }

    return &domain.Product{
        ID:        domain.ProductID(id),
        Name:      productName,
        Price:     domain.Money(price),
        CreatedAt: createdAt,
    }, nil
}

// Presentation Layer
package interfaces

import (
    "encoding/json"
    "net/http"
    "myapp/application"
)

type ProductHandler struct {
    productApp *application.ProductApplicationService
}

func NewProductHandler(productApp *application.ProductApplicationService) *ProductHandler {
    return &ProductHandler{productApp: productApp}
}

func (h *ProductHandler) CreateProduct(w http.ResponseWriter, r *http.Request) {
    var cmd application.CreateProductCommand

    if err := json.NewDecoder(r.Body).Decode(&cmd); err != nil {
        http.Error(w, "Invalid JSON format", http.StatusBadRequest)
        return
    }

    result := h.productApp.CreateProduct(cmd)

    if !result.IsSuccess() {
        http.Error(w, result.Error, http.StatusBadRequest)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusCreated)

    response := map[string]interface{}{
        "id":         string(result.Product.ID),
        "name":       result.Product.Name,
        "price":      float64(result.Product.Price),
        "created_at": result.Product.CreatedAt,
    }

    json.NewEncoder(w).Encode(response)
}

// Composition Root
package main

import (
    "database/sql"
    "net/http"

    "myapp/application"
    "myapp/domain"
    "myapp/infrastructure"
    "myapp/interfaces"
)

func main() {
    // Infrastructure setup
    db, err := sql.Open("postgres", "postgres://localhost/myapp")
    if err != nil {
        panic(err)
    }
    defer db.Close()

    // Build dependency graph (bottom-up)
    productRepo := infrastructure.NewPostgresProductRepository(db)
    productService := domain.NewProductService(productRepo)
    eventPublisher := infrastructure.NewEventBus()
    productApp := application.NewProductApplicationService(productService, eventPublisher)
    productHandler := interfaces.NewProductHandler(productApp)

    // Setup HTTP routes
    http.HandleFunc("/products", productHandler.CreateProduct)

    http.ListenAndServe(":8080", nil)
}
```

## Related Bindings

- [system-boundaries.md](../../docs/bindings/core/system-boundaries.md): Layered architecture is a specific implementation pattern for establishing system boundaries. While system boundaries can be organized in various ways (vertical, horizontal, or mixed), layered architecture provides a horizontal slicing approach with clear dependency rules.

- [dependency-inversion.md](../../docs/bindings/core/dependency-inversion.md): Dependency inversion is essential for implementing clean layered architecture. It allows higher layers to define interfaces that lower layers implement, maintaining the dependency flow while enabling flexibility and testability.

- [hex-domain-purity.md](../../docs/bindings/core/hex-domain-purity.md): Hexagonal architecture and layered architecture are complementary approaches to organizing code. Layered architecture provides the horizontal structure, while hexagonal architecture focuses on keeping the domain pure by placing adapters at the boundaries.

- [component-isolation.md](../../docs/bindings/core/component-isolation.md): Layered architecture provides the structural context for component isolation. Components within each layer should be isolated from each other, while the layers themselves provide isolation between different levels of abstraction.
