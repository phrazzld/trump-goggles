---
derived_from: simplicity
id: code-size
last_modified: '2025-05-14'
version: '0.1.0'
enforced_by: code review & style guides
---
# Binding: Keep Code Units Small and Focused

Limit the size of all code units—functions, methods, classes, and files—to maintain
readability and comprehension. Each unit should be small enough to understand at a
glance, with specific upper bounds based on the unit type and responsibility.

## Rationale

This binding implements our simplicity tenet by addressing the cognitive overhead
created by large, sprawling code units. When functions, methods, classes, or files grow
beyond certain thresholds, they become increasingly difficult to understand, debug, and
modify—even for their original authors. Every additional line of code increases the
number of potential interactions and state changes a developer must hold in their mind
at once, quickly exceeding our brain's working memory capacity.

Think of code size like paragraphs in writing. A paragraph that spans an entire page
becomes intimidating and hard to digest, forcing readers to constantly backtrack and
reread sections to maintain context. Similarly, code units that require significant
scrolling force developers to maintain too much context, making it difficult to
understand the component's purpose and behavior. Breaking large units into focused,
well-named components creates natural "cognitive resting points" that aid comprehension,
much like well-structured paragraphs guide readers through complex ideas.

This binding also directly supports our modularity tenet. Size limits serve as a forcing
function for creating proper module boundaries and appropriate separation of concerns.
When a function or class grows too large, it's almost always a sign that it's trying to
do too much—violating the "do one thing well" principle of modularity. Enforcing size
constraints naturally pushes developers to identify these distinct responsibilities and
separate them into focused, composable units.

The resulting codebase, built from small, focused components, becomes dramatically more
maintainable, testable, and comprehensible. It enables developers to understand each
piece in isolation, make changes with confidence, and compose simple units to create
complex behaviors without creating complex code.

## Rule Definition

This binding establishes the following size limits for different code units:

- **Functions and Methods**:

  - Should have a maximum of 15-30 lines of code (excluding comments and blank lines)
  - Should handle a single, focused responsibility
  - Should have no more than 3-4 parameters
  - Should have at most 2-3 levels of nesting (conditionals, loops)
  - Should contain at most 1-2 return statements in typical cases

- **Classes and Components**:

  - Should have a maximum of 300-500 lines of code (including methods)
  - Should have a cohesive set of related methods and properties
  - Should have no more than 10-15 public methods/properties
  - Should follow the Single Responsibility Principle

- **Files**:

  - Should have a maximum of 500-750 lines of code in total
  - Should contain related functionality that belongs together
  - Should have a clear, focused purpose reflected in the filename

- **Nesting Depth**:

  - Maximum 3 levels of nested conditionals/loops
  - Maximum 4 levels of nested callbacks/promises (in asynchronous code)

These limits are intended as practical guidance rather than rigid rules. The following
exceptions and considerations apply:

- **Permitted Exceptions**:

  - Generated or declarative code (schemas, machine-generated parsers)
  - Data-heavy initialization routines with repetitive structure
  - Well-documented public APIs where splitting would harm usability
  - Performance-critical code where inlining is necessary (with benchmarks)

- **Context-Sensitive Considerations**:

  - Simpler functions can be longer than complex ones
  - Declarative code can be longer than imperative code
  - Lower-level languages may need more lines for the same functionality
  - Formatting conventions affect line count

When exceeding these guidelines, you must provide justification in comments explaining
why the exception is appropriate, and take extra care with naming, documentation, and
internal structure to mitigate the increased complexity.

## Practical Implementation

1. **Configure Linters with Size Limits**: Set up automated tools to enforce size
   constraints as part of your continuous integration process. Ask yourself: "What size
   thresholds are appropriate for our specific codebase and team?" Then configure tools
   like ESLint, Rubocop, or SonarQube to flag violations based on those thresholds.

   ```javascript
   // .eslintrc.js example for JavaScript/TypeScript
   module.exports = {
     rules: {
       // Limit function size
       'max-lines-per-function': ['error', {
         max: 25,
         skipBlankLines: true,
         skipComments: true
       }],

       // Limit file size
       'max-lines': ['error', {
         max: 500,
         skipBlankLines: true,
         skipComments: true
       }],

       // Limit parameter count
       'max-params': ['error', 3],

       // Limit nesting depth
       'max-depth': ['error', 3],

       // Limit complexity
       'complexity': ['error', 10],
     }
   };
   ```

1. **Apply Single Responsibility Refactorings**: Identify oversized code units and break
   them down into smaller, focused components. Ask yourself: "What are the distinct
   responsibilities or steps in this function or class?" Then extract each into its own
   well-named function or class.

   ```typescript
   // ❌ BAD: Large function with multiple responsibilities
   function processUser(userData) {
     // 20 lines of validation logic
     // ...

     // 30 lines of business rule application
     // ...

     // 25 lines of database operations
     // ...

     // 15 lines of notification sending
     // ...
   }

   // ✅ GOOD: Broken down into focused functions
   function processUser(userData) {
     const validatedData = validateUserData(userData);
     const userWithRules = applyBusinessRules(validatedData);
     const savedUser = saveToDatabase(userWithRules);
     notifyUserCreation(savedUser);
     return savedUser;
   }

   function validateUserData(userData) {
     // 20 lines of focused validation logic
     // ...
   }

   function applyBusinessRules(userData) {
     // 30 lines of focused business rule application
     // ...
   }

   // And so on...
   ```

1. **Establish Clear Refactoring Triggers**: Define specific signals that indicate when
   code should be broken down into smaller units. Ask yourself: "What observable
   criteria indicate that a code unit is becoming too complex?" Create a shared
   understanding of these triggers among team members.

   Common refactoring triggers include:

   - Function needs more than one screenful of code to view
   - Multiple nested conditionals or loops (arrow-shaped code)
   - Difficulty writing a concise function name that covers all behavior
   - Multiple distinct code sections with their own comments
   - Multiple local variables used in different sections

   ```python
   # ❌ BAD: Function with multiple sections (refactoring trigger)
   def process_order(order_data):
       # Validate order inputs
       if not 'customer_id' in order_data:
           raise ValueError("Missing customer ID")
       if not 'items' in order_data:
           raise ValueError("No items in order")
       for item in order_data['items']:
           if not 'product_id' in item:
               raise ValueError(f"Item missing product ID: {item}")

       # Calculate order totals
       subtotal = 0
       for item in order_data['items']:
           price = get_product_price(item['product_id'])
           quantity = item.get('quantity', 1)
           subtotal += price * quantity

       # Apply discounts
       discount = 0
       if order_data.get('coupon_code'):
           discount = apply_coupon(order_data['coupon_code'], subtotal)
       if subtotal > 1000:
           discount += subtotal * 0.05  # 5% volume discount

       # Calculate taxes
       tax_rate = get_tax_rate(order_data.get('shipping_address', {}).get('country'))
       tax = (subtotal - discount) * tax_rate

       # Create final order
       total = subtotal - discount + tax
       # ... 20 more lines of code

   # ✅ GOOD: Broken into smaller, focused functions
   def process_order(order_data):
       validate_order_data(order_data)
       subtotal = calculate_subtotal(order_data['items'])
       discount = calculate_discounts(order_data, subtotal)
       tax = calculate_tax(order_data, subtotal, discount)
       return create_order(order_data, subtotal, discount, tax)
   ```

1. **Use Consistent Naming Conventions**: Establish clear naming patterns that reveal
   the purpose and relationships between smaller components. Ask yourself: "If I divide
   this large function, how should I name the pieces to make their purpose and
   relationship clear?" Good naming is essential when breaking down large units into
   smaller ones.

   ```java
   // Class with methods broken down and named consistently
   class OrderProcessor {
       // High-level orchestration
       public Order processOrder(OrderRequest request) {
           validateOrderRequest(request);
           Order order = createOrderFromRequest(request);
           calculateOrderTotals(order);
           applyDiscounts(order, request.getCouponCodes());
           saveOrder(order);
           notifyOrderCreation(order);
           return order;
       }

       // Each method handles one focused task
       private void validateOrderRequest(OrderRequest request) {
           // Focused validation logic
       }

       private Order createOrderFromRequest(OrderRequest request) {
           // Focused order creation logic
       }

       // Other methods follow the same pattern...
   }
   ```

1. **Monitor and Reduce Complexity Metrics**: Use tools that measure cyclomatic
   complexity, cognitive complexity, and maintainability indices. Ask yourself: "Beyond
   just counting lines, how complex is this code really?" Then focus on reducing the
   most troublesome complexity hotspots first.

   ```
   # Sample complexity report from a static analyzer

   File: UserService.java
   - Cyclomatic Complexity: 24 (exceeds limit of 15)
   - Cognitive Complexity: 31 (exceeds limit of 20)
   - Methods exceeding complexity limits:
     - processUserRegistration: 18 (exceeds limit of 10)
     - validateUserInput: 12 (exceeds limit of 10)

   Recommendation:
   - Break down processUserRegistration into smaller methods
   - Extract validation rules from validateUserInput
   ```

## Examples

```javascript
// ❌ BAD: Oversized function with multiple responsibilities
function processPayment(user, cart, paymentInfo) {
  // Validate inputs
  if (!user || !user.id) {
    throw new Error('Invalid user');
  }
  if (!cart || !cart.items || cart.items.length === 0) {
    throw new Error('Empty cart');
  }
  if (!paymentInfo || !paymentInfo.method) {
    throw new Error('Invalid payment info');
  }

  // Calculate totals
  let subtotal = 0;
  for (const item of cart.items) {
    subtotal += item.price * item.quantity;
  }

  // Apply discounts
  let discount = 0;
  if (user.isVIP) {
    discount = subtotal * 0.1;
  } else if (subtotal > 100) {
    discount = subtotal * 0.05;
  }
  if (cart.couponCode) {
    const coupon = getCoupon(cart.couponCode);
    if (coupon && coupon.isValid) {
      discount += coupon.type === 'percentage'
        ? subtotal * (coupon.value / 100)
        : coupon.value;
    }
  }

  // Calculate tax
  const taxRate = getTaxRate(user.address.state);
  const tax = (subtotal - discount) * taxRate;

  // Calculate final total
  const total = subtotal - discount + tax;

  // Process payment
  let paymentResult;
  if (paymentInfo.method === 'credit_card') {
    paymentResult = processCreditCardPayment(
      paymentInfo.cardNumber,
      paymentInfo.expiryDate,
      paymentInfo.cvv,
      total
    );
  } else if (paymentInfo.method === 'paypal') {
    paymentResult = processPayPalPayment(
      paymentInfo.email,
      total
    );
  } else {
    throw new Error('Unsupported payment method');
  }

  // Create order
  const order = {
    id: generateOrderId(),
    userId: user.id,
    items: cart.items,
    subtotal,
    discount,
    tax,
    total,
    paymentMethod: paymentInfo.method,
    paymentId: paymentResult.id,
    status: paymentResult.success ? 'confirmed' : 'failed',
    createdAt: new Date()
  };

  // Save order to database
  saveOrder(order);

  // Send email confirmation
  if (paymentResult.success) {
    sendOrderConfirmation(user.email, order);
  }

  // Clear cart
  clearCart(user.id);

  // Return result
  return {
    success: paymentResult.success,
    orderId: order.id,
    total
  };
}
```

```javascript
// ✅ GOOD: Function broken down into smaller, focused functions
// High-level orchestration function
function processPayment(user, cart, paymentInfo) {
  validateInputs(user, cart, paymentInfo);

  const pricingDetails = calculatePricing(user, cart);
  const paymentResult = processPaymentMethod(paymentInfo, pricingDetails.total);
  const order = createOrder(user, cart, pricingDetails, paymentResult);

  handleOrderCompletion(user, order, paymentResult);

  return {
    success: paymentResult.success,
    orderId: order.id,
    total: pricingDetails.total
  };
}

// Smaller, focused functions with clear responsibilities
