---
derived_from: testability
enforced_by: code review & linters
id: no-internal-mocking
last_modified: '2025-05-14'
---
# Binding: Mock External Systems Only, Never Internal Components

Never mock, stub, or fake components that live within your application's boundaries.
When writing tests, you must use real implementations of all internal classes,
functions, interfaces, and services. Only create test doubles for dependencies that
cross true system boundaries, such as databases, APIs, file systems, or other external
services.

## Rationale

This binding directly implements our testability tenet by forcing you to design code
that's genuinely testable rather than creating the illusion of testability through
elaborate mocking. When you test with real internal components, you're verifying that
your system's actual parts work together correctly, not just that individual units
behave as specified in isolation.

Think of your application like a car engine. A skilled mechanic doesn't replace pistons
with wooden blocks when testing if the engine runs properly—this would tell you nothing
about how the real parts interact. Instead, they ensure each component works correctly
with its genuine collaborators, only simulating external factors like electrical current
or fuel input. Similarly, when testing your code, using real internal components ensures
you're testing the system as it will actually operate in production, with mocks only
standing in for resources outside your control.

The problem with internal mocking goes beyond philosophical purity—it creates tangible,
harmful consequences. Each mock introduces a dangerous gap between your tests and
reality. Tests with extensive internal mocking often pass perfectly while the actual
system fails spectacularly. Worse, these tests become actively harmful when you
refactor, breaking loudly even when behavior remains unchanged, because they're coupled
to implementation details rather than observable behavior. By avoiding internal mocks,
you create tests that remain valid through refactoring, accurately detect regressions,
and serve as reliable guardians of your system's integrity.

## Rule Definition

This binding establishes clear boundaries for what can and cannot be replaced with test
doubles:

- **Never Mock Internal Components**: Do not create mocks, stubs, fakes, or spies for
  any component defined within your application boundary:

  - Classes and objects
  - Functions and methods
  - Interfaces and protocols implemented within your application
  - Services, utilities, and helpers internal to your system
  - Local event emitters or message buses

- **Only Mock True External Dependencies**: Test doubles should only stand in for
  components that cross system boundaries:

  - Databases and data stores
  - HTTP/gRPC/API clients
  - File system interactions
  - Message brokers and queues
  - Email/SMS/notification services
  - System clock/time functions
  - Hardware interfaces
  - Third-party service clients

- **Key Distinctions**:

  - The boundary is your application or service, not individual modules or packages
  - "Internal" means "code you own and can change"
  - "External" means "systems outside your control"
  - For microservices, other services in your ecosystem are considered external
  - Libraries and frameworks you use but don't control are not considered external
    unless they access external resources

- **Exceptions**: There are limited exceptions to this rule:

  - When testing edge cases that are impractical to create with real components (extreme
    error conditions, race conditions)
  - When real components would make tests prohibitively slow (>100ms per test)
  - When testing UI components where the rendering framework itself is considered
    external

  Even in these cases, you should:

  - Keep exceptions minimal and explicitly justified in the test code
  - Consider if the need for exceptions indicates design problems
  - Maintain integration tests that verify real components work together

## Practical Implementation

Here are concrete strategies for building testable systems without resorting to internal
mocks:

1. **Design with Proper Dependency Injection**: Structure your application to receive
   dependencies rather than creating them internally:

   ```typescript
   // ❌ BAD: Creating dependencies internally
   class OrderService {
     private repo = new OrderRepository(); // Hard to replace in tests

     processOrder(order) {
       // Uses internal repo directly
     }
   }

   // ✅ GOOD: Receiving dependencies externally
   class OrderService {
     constructor(private readonly repo: OrderRepository) {}

     processOrder(order) {
       // Uses injected repo
     }
   }
   ```

   This approach allows you to provide real implementations in unit tests and substitute
   test doubles only for external dependencies in integration tests.

1. **Extract Pure Business Logic**: Move core business rules and logic into pure
   functions or classes that don't depend directly on external resources:

   ```python
   # ❌ BAD: Business logic mixed with external concerns
   def calculate_discount(customer_id, purchase_amount):
       customer = db.query(f"SELECT tier FROM customers WHERE id = {customer_id}")
       if customer.tier == 'gold':
           return purchase_amount * 0.1
       return 0

   # ✅ GOOD: Pure business logic free from external dependencies
   def calculate_discount(customer_tier, purchase_amount):
       if customer_tier == 'gold':
           return purchase_amount * 0.1
       return 0

   # Interface to external systems handles the database part
   def get_customer_discount(customer_id, purchase_amount):
       customer = customer_repository.find_by_id(customer_id)
       return calculate_discount(customer.tier, purchase_amount)
   ```

   Pure functions are naturally testable without mocks because they have no dependencies
   to substitute.

1. **Create Proper Abstraction Boundaries**: Define clear interfaces for all external
   system interactions and keep these interfaces in your domain layer:

   ```java
   // Domain layer interface (owned by your application)
   public interface PaymentGateway {
       PaymentResult processPayment(Order order, PaymentDetails details);
   }

   // Infrastructure implementation (uses external system)
   public class StripePaymentGateway implements PaymentGateway {
       private final StripeClient stripeClient;

       public StripePaymentGateway(StripeClient stripeClient) {
           this.stripeClient = stripeClient;
       }

       @Override
       public PaymentResult processPayment(Order order, PaymentDetails details) {
           // Convert domain objects to Stripe API requests
           // Call Stripe API via the client
           // Convert response back to domain objects
       }
   }

   // In tests: Create test implementation of PaymentGateway
   public class TestPaymentGateway implements PaymentGateway {
       private List<Order> processedOrders = new ArrayList<>();

       @Override
       public PaymentResult processPayment(Order order, PaymentDetails details) {
           processedOrders.add(order);
           return new PaymentResult(true, "TEST-TRANSACTION-ID");
       }

       public List<Order> getProcessedOrders() {
           return processedOrders;
       }
   }
   ```

   This pattern lets you inject test implementations for external services without
   mocking internal components.

1. **Use Composition Over Inheritance**: Build systems of small, focused components that
   you can easily assemble and test individually:

   ```csharp
   // ❌ BAD: Large classes with many responsibilities
   public class OrderProcessor {
       public void Process(Order order) {
           // Validate order
           // Update inventory
           // Calculate shipping
           // Apply discount
           // Process payment
           // Send notification
           // Update reporting
       }
   }

   // ✅ GOOD: Composable components with focused responsibilities
   public class OrderValidator { /* ... */ }
   public class InventoryManager { /* ... */ }
   public class ShippingCalculator { /* ... */ }
   public class DiscountApplier { /* ... */ }
   public class PaymentProcessor { /* ... */ }
   public class NotificationSender { /* ... */ }

   public class OrderProcessor {
       private readonly OrderValidator validator;
       private readonly InventoryManager inventory;
       // Other dependencies...

       public OrderProcessor(
           OrderValidator validator,
           InventoryManager inventory,
           // Other dependencies...
       ) {
           this.validator = validator;
           this.inventory = inventory;
           // Set other dependencies...
       }

       public void Process(Order order) {
           validator.Validate(order);
           inventory.ReserveItems(order.Items);
           // Call other components...
       }
   }
   ```

   With small, focused components, you can use real implementations in tests without
   creating complex setups.

1. **Leverage In-Memory Implementations**: For data stores and repositories, create
   in-memory implementations for testing:

   ```go
   // Interface defined in domain layer
   type UserRepository interface {
       FindByID(id string) (*User, error)
       Save(user *User) error
       FindByEmail(email string) (*User, error)
   }

   // Production implementation using PostgreSQL
   type PostgresUserRepository struct {
       db *sql.DB
   }

   // Test implementation using in-memory storage
   type InMemoryUserRepository struct {
       users map[string]*User
   }

   func NewInMemoryUserRepository() *InMemoryUserRepository {
       return &InMemoryUserRepository{
           users: make(map[string]*User),
       }
   }

   func (r *InMemoryUserRepository) FindByID(id string) (*User, error) {
       user, exists := r.users[id]
       if !exists {
           return nil, ErrUserNotFound
       }
       return user, nil
   }

   // Other method implementations...
   ```

   In-memory implementations provide fast, predictable behavior for tests while
   respecting your interfaces.

## Examples

```typescript
// ❌ BAD: Excessive internal mocking
it("should calculate order total", () => {
  // Mocking internal services
  const mockPriceCalculator = {
    calculateItemPrice: jest.fn().mockReturnValue(10.00)
  };
  const mockDiscountService = {
    applyDiscount: jest.fn().mockReturnValue(2.00)
  };
  const mockTaxService = {
    calculateTax: jest.fn().mockReturnValue(0.80)
  };

  const orderService = new OrderService(
    mockPriceCalculator,
    mockDiscountService,
    mockTaxService
  );

  const total = orderService.calculateTotal({
    items: [{ id: "item1", quantity: 1 }],
    customerId: "customer1"
  });

  // Testing implementation details, not behavior
  expect(mockPriceCalculator.calculateItemPrice).toHaveBeenCalledWith("item1", 1);
  expect(mockDiscountService.applyDiscount).toHaveBeenCalledWith(10.00, "customer1");
  expect(mockTaxService.calculateTax).toHaveBeenCalledWith(8.00);
  expect(total).toBe(8.80);
});

// ✅ GOOD: Using real internal components
it("should calculate order total", () => {
  // Using real internal services
  const priceCalculator = new PriceCalculator();
  const discountService = new DiscountService();
  const taxService = new TaxService();

  // Only mock the external database dependency
  const mockDatabase = new InMemoryDatabase();
  mockDatabase.addProduct({ id: "item1", price: 10.00 });
  mockDatabase.addCustomer({ id: "customer1", discountTier: "gold" });

  const orderService = new OrderService(
    priceCalculator,
    discountService,
    taxService,
    mockDatabase // External dependency
  );

  const total = orderService.calculateTotal({
    items: [{ id: "item1", quantity: 1 }],
    customerId: "customer1"
  });

  // Testing observable behavior, not implementation
  expect(total).toBe(8.80);
});
```

```java
// ❌ BAD: Mocking internal component with complex verification
@Test
public void shouldProcessOrder() {
    // Mocking an internal component
    OrderValidator mockValidator = mock(OrderValidator.class);
    when(mockValidator.validate(any())).thenReturn(true);

    // Mock external payment gateway (this is OK)
    PaymentGateway mockPayment = mock(PaymentGateway.class);
    when(mockPayment.process(any())).thenReturn(new PaymentResult(true, "TX123"));

    OrderProcessor processor = new OrderProcessor(mockValidator, mockPayment);
    Order order = new Order("customer1", List.of(new OrderItem("product1", 1)));

    boolean result = processor.process(order);

    // Brittle verification of implementation details
    verify(mockValidator).validate(order);
    verify(mockPayment).process(order);
    assertTrue(result);
}

// ✅ GOOD: Using real internal components with test implementations for externals
@Test
public void shouldProcessOrder() {
    // Real internal validator
    OrderValidator validator = new OrderValidator();

    // Test implementation of external dependency
    TestPaymentGateway paymentGateway = new TestPaymentGateway();

    OrderProcessor processor = new OrderProcessor(validator, paymentGateway);
    Order order = new Order("customer1", List.of(new OrderItem("product1", 1)));

    boolean result = processor.process(order);

    // Verify observable behavior
    assertTrue(result);
    assertEquals(1, paymentGateway.getProcessedOrders().size());
    assertEquals("customer1", paymentGateway.getProcessedOrders().get(0).getCustomerId());
}

// TestPaymentGateway implementation
class TestPaymentGateway implements PaymentGateway {
    private List<Order> processedOrders = new ArrayList<>();

    @Override
    public PaymentResult process(Order order) {
        processedOrders.add(order);
        return new PaymentResult(true, "TEST-TX-ID");
    }

    public List<Order> getProcessedOrders() {
        return processedOrders;
    }
}
```

```python
# ❌ BAD: Testing with mocked internal components
def test_order_processing_with_mocks():
    # Mocking internal components
    inventory_service = Mock()
    inventory_service.check_availability.return_value = True

    pricing_service = Mock()
    pricing_service.calculate_price.return_value = 100.0

    # Only this should be mocked (external database)
    order_repository = Mock()

    order_processor = OrderProcessor(
        inventory_service,
        pricing_service,
        order_repository
    )

    result = order_processor.process_order("product1", 5, "customer1")

    # Testing implementation details
    inventory_service.check_availability.assert_called_once_with("product1", 5)
    pricing_service.calculate_price.assert_called_once_with("product1", 5)
    order_repository.save.assert_called_once()
    assert result.success == True

# ✅ GOOD: Testing with real internal components
def test_order_processing_with_real_components():
    # Real internal components
    inventory_service = InventoryService()
    pricing_service = PricingService()

    # For a test, we inject test products
    inventory_service.add_product("product1", 10)  # 10 in stock
    pricing_service.set_product_price("product1", 20.0)  # $20 each

    # Only mock the external database
    order_repository = InMemoryOrderRepository()

    order_processor = OrderProcessor(
        inventory_service,
        pricing_service,
        order_repository
    )

    result = order_processor.process_order("product1", 5, "customer1")

    # Testing observable behavior
    assert result.success == True
    assert result.total_price == 100.0
    assert len(order_repository.saved_orders) == 1
    assert order_repository.saved_orders[0].product_id == "product1"
    assert inventory_service.get_availability("product1") == 5  # Stock reduced
```

## Related Bindings

- [dependency-inversion](../../docs/bindings/core/dependency-inversion.md): Dependency inversion is essential for
  implementing this no-internal-mocking binding. By depending on abstractions rather
  than concrete implementations, you can achieve testability without resorting to mocks.
  These bindings work together—dependency inversion creates the structure that makes
  testing without internal mocks practical and effective.

- [hex-domain-purity](../../docs/bindings/core/hex-domain-purity.md): Domain purity and no-internal-mocking are
  complementary approaches to testable architecture. By keeping your business logic free
  from infrastructure concerns, you naturally create a system where core components can
  be tested without elaborate mocking. The hexagonal architecture pattern provides the
  structure that makes no-internal-mocking practical to implement.

- [immutable-by-default](../../docs/bindings/core/immutable-by-default.md): Immutable data structures make
  testing without mocks significantly easier. When data doesn't change unexpectedly,
  tests become more predictable and less prone to order dependencies or side effects.
  Together, these bindings create systems that are both more testable and more reliable.
