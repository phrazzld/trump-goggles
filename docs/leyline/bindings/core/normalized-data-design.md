---
id: normalized-data-design
last_modified: '2025-06-02'
version: '0.1.0'
derived_from: dry-dont-repeat-yourself
enforced_by: 'Database design review, schema validation, data modeling tools'
---
# Binding: Design Normalized Data Structures

Structure data to eliminate redundancy and ensure that each piece of information is stored in exactly one place. This creates a single source of truth for each data element and prevents inconsistencies that arise from duplicated information.

## Rationale

This binding implements our DRY tenet at the data layer by ensuring that knowledge represented in data exists in only one location. When the same information is stored in multiple places—whether in database tables, object properties, or data structures—you create maintenance challenges and opportunities for data inconsistency that can corrupt your system's integrity. Denormalized data creates a maintenance nightmare where the same fact must be updated in multiple locations, creating opportunities for inconsistency that leads to bugs, incorrect business decisions, and user frustration.

## Rule Definition

**Core Requirements:**

- **Single Source of Truth**: Each distinct piece of information should be stored in exactly one location and referenced from all other locations that need it

- **Eliminate Redundant Storage**: Avoid storing the same information in multiple places unless there's a compelling performance or business requirement that justifies the duplication

- **Use Foreign Keys and References**: Establish relationships between data entities through keys and references rather than duplicating related information across entities

- **Separate Concerns by Entity Type**: Organize data according to the distinct entities and concepts in your domain, ensuring that each entity's data is managed independently

- **Maintain Referential Integrity**: Implement constraints and validation that ensure references between data entities remain valid and consistent

**Normalization Levels:** First Normal Form (1NF) - eliminate repeating groups and ensure atomic values; Second Normal Form (2NF) - eliminate partial dependencies on composite keys; Third Normal Form (3NF) - eliminate transitive dependencies between non-key attributes; Higher Normal Forms - apply Boyce-Codd Normal Form (BCNF) and beyond for complex scenarios

**Controlled Denormalization:** Performance optimization based on measured bottlenecks, read-heavy scenarios where query performance is critical, derived values that are expensive to calculate - always with explicit justification and maintenance strategies

## Practical Implementation

1. **Identify Domain Entities**: Analyze your business domain to identify distinct entities and their relationships. Each entity should represent a single concept with its own lifecycle and responsibilities.

2. **Apply Normalization Systematically**: Work through normalization forms methodically, ensuring that each level is properly implemented before moving to the next.

3. **Use Consistent Referencing Patterns**: Establish standard patterns for how entities reference each other, using primary keys, foreign keys, and junction tables consistently across your schema.

4. **Implement Data Integrity Constraints**: Use database constraints, application-level validation, and business rules to maintain referential integrity and prevent data corruption.

5. **Design for Query Patterns**: While maintaining normalization, consider how your data will be queried and accessed to ensure that normalized structures support efficient data retrieval.

## Examples

**Comprehensive Normalized Database Design:**

```sql
-- ❌ BAD: Denormalized data with redundancy and inconsistency risks
-- All customer and product info duplicated in each order
CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,

    -- Customer info duplicated from customers table
    customer_name VARCHAR(100),
    customer_email VARCHAR(100),
    customer_phone VARCHAR(20),
    customer_address TEXT,
    customer_city VARCHAR(50),
    customer_state VARCHAR(20),
    customer_zip VARCHAR(10),

    -- Product info duplicated from products table
    product_name VARCHAR(100),
    product_description TEXT,
    product_category VARCHAR(50),
    product_manufacturer VARCHAR(100),

    -- Order-specific info
    quantity INTEGER,
    unit_price DECIMAL(10,2),
    total_price DECIMAL(10,2),
    order_date TIMESTAMP
);

-- Problems with this design:
-- 1. Customer address change requires updating ALL their orders
-- 2. Product description change requires updating ALL orders containing that product
-- 3. Multiple orders for the same customer can have conflicting customer info
-- 4. Cannot store customer without an order, or product without being ordered
-- 5. Massive storage waste due to duplicated information

-- ✅ GOOD: Normalized design with single source of truth
-- Customers table - single source for customer information
CREATE TABLE customers (
    customer_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customer addresses - separate entity for address management
CREATE TABLE customer_addresses (
    address_id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(customer_id) ON DELETE CASCADE,
    address_type VARCHAR(20) DEFAULT 'primary', -- 'primary', 'billing', 'shipping'
    street_address TEXT NOT NULL,
    city VARCHAR(50) NOT NULL,
    state VARCHAR(20) NOT NULL,
    postal_code VARCHAR(10) NOT NULL,
    country VARCHAR(50) DEFAULT 'US',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product categories - separate entity for category management
CREATE TABLE product_categories (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    parent_category_id INTEGER REFERENCES product_categories(category_id)
);

-- Manufacturers - separate entity for manufacturer information
CREATE TABLE manufacturers (
    manufacturer_id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    website VARCHAR(200),
    contact_email VARCHAR(100)
);

-- Products table - single source for product information
CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category_id INTEGER REFERENCES product_categories(category_id),
    manufacturer_id INTEGER REFERENCES manufacturers(manufacturer_id),
    base_price DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table - references other entities, no duplication
CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(customer_id) ON DELETE RESTRICT,
    billing_address_id INTEGER REFERENCES customer_addresses(address_id),
    shipping_address_id INTEGER REFERENCES customer_addresses(address_id),
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending',
    total_amount DECIMAL(10,2) -- Calculated field, could be computed
);

-- Order items - junction table with order-specific information
CREATE TABLE order_items (
    order_item_id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(order_id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(product_id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL, -- Price at time of order (may differ from current product price)
    line_total DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED
);

-- Benefits of normalized design:
-- 1. Customer info updated once, applies to all orders
-- 2. Product info updated once, applies to all references
-- 3. Can store customers without orders, products without orders
-- 4. Referential integrity prevents orphaned data
-- 5. Minimal storage space, no duplication
-- 6. Consistent data across all references
```

**Application-Level Normalized Data Management:**

```typescript
// Normalized interfaces with references
interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Address {
  id: string;
  customerId: string;
  type: 'billing' | 'shipping' | 'primary';
  street: string;
  city: string;
  state: string;
  zipCode: string;
  isActive: boolean;
}

interface Product {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  basePrice: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Order {
  id: string;
  customerId: string;        // Reference to customer
  billingAddressId: string;  // Reference to address
  shippingAddressId: string; // Reference to address
  orderDate: Date;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  totalAmount: number;
}

interface OrderItem {
  id: string;
  orderId: string;      // Reference to order
  productId: string;    // Reference to product
  quantity: number;
  unitPriceAtOrder: number; // Price at time of order (may differ from current price)
  lineTotal: number;
}

// Data access layer that handles normalization
class NormalizedDataManager {
  constructor(
    private customers: Map<string, Customer>,
    private addresses: Map<string, Address>,
    private products: Map<string, Product>,
    private orders: Map<string, Order>,
    private orderItems: Map<string, OrderItem[]>
  ) {}

  // Denormalize data for presentation when needed
  getOrderDetails(orderId: string) {
    const order = this.orders.get(orderId);
    if (!order) return null;

    const customer = this.customers.get(order.customerId);
    const billingAddress = this.addresses.get(order.billingAddressId);
    const shippingAddress = this.addresses.get(order.shippingAddressId);
    const items = this.orderItems.get(orderId) || [];

    const itemsWithDetails = items.map(item => {
      const product = this.products.get(item.productId);
      return {
        ...item,
        product: product || null
      };
    });

    return {
      order,
      customer: customer || null,
      billingAddress: billingAddress || null,
      shippingAddress: shippingAddress || null,
      items: itemsWithDetails
    };
  }

  // Update customer info once - affects all their orders
  updateCustomer(customerId: string, updates: Partial<Customer>): void {
    const customer = this.customers.get(customerId);
    if (!customer) throw new Error('Customer not found');

    this.customers.set(customerId, {
      ...customer,
      ...updates,
      updatedAt: new Date()
    });
    // All orders automatically reference updated customer info
  }

  // Update product info once - affects all order items
  updateProduct(productId: string, updates: Partial<Product>): void {
    const product = this.products.get(productId);
    if (!product) throw new Error('Product not found');

    this.products.set(productId, {
      ...product,
      ...updates,
      updatedAt: new Date()
    });
    // All order items automatically reference updated product info
  }
}
```

## Related Bindings

- [centralized-configuration](../../docs/bindings/core/centralized-configuration.md): Both bindings implement DRY principles by eliminating duplication - normalized data design eliminates data duplication while centralized configuration eliminates settings duplication
- [extract-common-logic](../../docs/bindings/core/extract-common-logic.md): Just as common logic should be extracted to avoid code duplication, common data should be normalized to avoid data duplication at different system layers
- [interface-contracts](../../docs/bindings/core/interface-contracts.md): Normalized data structures should have well-defined interfaces and contracts that specify how data relationships work and ensure referential integrity
- [component-isolation](../../docs/bindings/core/component-isolation.md): Normalized data design supports component isolation by ensuring that each data entity has clear boundaries and dependencies through well-defined interfaces
