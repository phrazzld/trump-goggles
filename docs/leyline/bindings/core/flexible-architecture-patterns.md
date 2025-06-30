---
id: flexible-architecture-patterns
last_modified: '2025-06-02'
version: '0.1.0'
derived_from: adaptability-and-reversibility
enforced_by: 'Architectural review, design patterns, refactoring practices'
---
# Binding: Design Architecture for Change and Reversibility

Implement architectural patterns that enable easy modification, extension, and reversal of design decisions. Design systems that can adapt to changing requirements without requiring fundamental restructuring or breaking existing functionality.

## Rationale

This binding implements our adaptability and reversibility tenet by creating systems that evolve gracefully over time. Software requirements change constantly—business rules evolve, user needs shift, platforms update, and regulations emerge.

Inflexible architecture creates technical debt that compounds over time, making each change more expensive until rewrites become necessary. Flexible architecture prevents this decay by building adaptability into the system's core structure through modular components, stable interfaces, and configurable behavior.

## Rule Definition

**Core Principles:**

- **Interface Segregation**: Create focused, cohesive interfaces that evolve independently
- **Dependency Injection**: Decouple components from concrete dependencies for easy substitution
- **Strategy Patterns**: Implement variable behavior through swappable strategies
- **Event-Driven Communication**: Enable loose coupling through stable event contracts
- **Modular Design**: Structure as independent, replaceable modules with clear boundaries
- **Configuration-Driven Behavior**: Externalize behavior to enable runtime changes

**Key Patterns:**
- Plugin architectures for extensibility
- Adapter patterns for external integration
- Factory patterns for flexible object creation
- Observer patterns for decoupled communication
- Chain of responsibility for configurable pipelines

## Practical Implementation

**Comprehensive Flexible Architecture Demonstrating All Key Patterns:**

```typescript
// Complete example showing dependency injection, strategy patterns,
// plugin architecture, and configuration-driven behavior

// Define flexible interfaces for strategy patterns
interface PaymentProcessor {
  processPayment(amount: number, method: PaymentMethod): Promise<PaymentResult>;
}

interface NotificationPlugin {
  getType(): string;
  sendNotification(message: string, recipient: string): Promise<void>;
}

interface StorageAdapter {
  save(data: any): Promise<boolean>;
}

// Strategy pattern implementations - easily swappable
class StripePaymentProcessor implements PaymentProcessor {
  async processPayment(amount: number, method: PaymentMethod): Promise<PaymentResult> {
    return { success: true, transactionId: `stripe_${Date.now()}` };
  }
}

class PayPalPaymentProcessor implements PaymentProcessor {
  async processPayment(amount: number, method: PaymentMethod): Promise<PaymentResult> {
    return { success: true, transactionId: `paypal_${Date.now()}` };
  }
}

// Plugin architecture for extensible notifications
class EmailNotificationPlugin implements NotificationPlugin {
  getType(): string { return 'email'; }

  async sendNotification(message: string, recipient: string): Promise<void> {
    console.log(`Email to ${recipient}: ${message}`);
  }
}

class SMSNotificationPlugin implements NotificationPlugin {
  getType(): string { return 'sms'; }

  async sendNotification(message: string, recipient: string): Promise<void> {
    console.log(`SMS to ${recipient}: ${message}`);
  }
}

// Adapter pattern for external storage systems
class MySQLStorageAdapter implements StorageAdapter {
  async save(data: any): Promise<boolean> {
    console.log('Saving to MySQL:', data);
    return true;
  }
}

class S3StorageAdapter implements StorageAdapter {
  async save(data: any): Promise<boolean> {
    console.log('Saving to S3:', data);
    return true;
  }
}

// Plugin manager for dynamic notification handling
class NotificationManager {
  private plugins = new Map<string, NotificationPlugin>();

  registerPlugin(plugin: NotificationPlugin): void {
    this.plugins.set(plugin.getType(), plugin);
  }

  async sendNotifications(message: string, recipient: string, enabledTypes: string[]): Promise<void> {
    const promises = enabledTypes
      .map(type => this.plugins.get(type))
      .filter(plugin => plugin !== undefined)
      .map(plugin => plugin!.sendNotification(message, recipient));

    await Promise.all(promises);
  }
}

// Flexible order processor with dependency injection
class FlexibleOrderProcessor {
  constructor(
    private paymentProcessor: PaymentProcessor,
    private notificationManager: NotificationManager,
    private storageAdapter: StorageAdapter,
    private config: OrderProcessingConfig
  ) {}

  async processOrder(order: Order): Promise<OrderResult> {
    try {
      // Strategy pattern - payment processor is configurable
      const paymentResult = await this.paymentProcessor.processPayment(
        order.amount,
        order.paymentMethod
      );

      if (!paymentResult.success) {
        return { success: false, error: 'Payment failed' };
      }

      // Configuration-driven behavior
      if (this.config.enableNotifications) {
        await this.notificationManager.sendNotifications(
          `Order ${order.id} confirmed`,
          order.customerEmail,
          this.config.enabledNotificationTypes
        );
      }

      // Adapter pattern - storage is configurable
      await this.storageAdapter.save({
        orderId: order.id,
        amount: order.amount,
        status: 'completed',
        timestamp: new Date()
      });

      return { success: true, orderId: order.id };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Factory pattern for configuration-driven assembly
class OrderProcessorFactory {
  static create(config: SystemConfiguration): FlexibleOrderProcessor {
    // Select payment processor based on configuration
    const paymentProcessor = config.paymentProvider === 'stripe'
      ? new StripePaymentProcessor()
      : new PayPalPaymentProcessor();

    // Configure notification plugins based on settings
    const notificationManager = new NotificationManager();
    if (config.enableEmailNotifications) {
      notificationManager.registerPlugin(new EmailNotificationPlugin());
    }
    if (config.enableSMSNotifications) {
      notificationManager.registerPlugin(new SMSNotificationPlugin());
    }

    // Select storage adapter based on configuration
    const storageAdapter = config.storageProvider === 'mysql'
      ? new MySQLStorageAdapter()
      : new S3StorageAdapter();

    return new FlexibleOrderProcessor(
      paymentProcessor,
      notificationManager,
      storageAdapter,
      config.orderProcessing
    );
  }
}

// Configuration interfaces for type safety
interface SystemConfiguration {
  paymentProvider: 'stripe' | 'paypal';
  storageProvider: 'mysql' | 's3';
  enableEmailNotifications: boolean;
  enableSMSNotifications: boolean;
  orderProcessing: OrderProcessingConfig;
}

interface OrderProcessingConfig {
  enableNotifications: boolean;
  enabledNotificationTypes: string[];
  enableAnalytics: boolean;
}

// Usage with different configurations
const productionConfig: SystemConfiguration = {
  paymentProvider: 'stripe',
  storageProvider: 'mysql',
  enableEmailNotifications: true,
  enableSMSNotifications: false,
  orderProcessing: {
    enableNotifications: true,
    enabledNotificationTypes: ['email'],
    enableAnalytics: true
  }
};

const testConfig: SystemConfiguration = {
  paymentProvider: 'paypal',
  storageProvider: 's3',
  enableEmailNotifications: true,
  enableSMSNotifications: true,
  orderProcessing: {
    enableNotifications: true,
    enabledNotificationTypes: ['email', 'sms'],
    enableAnalytics: false
  }
};

// Create processors with different behaviors based on configuration
const productionProcessor = OrderProcessorFactory.create(productionConfig);
const testProcessor = OrderProcessorFactory.create(testConfig);

// Same interface, different behavior - demonstrates flexibility
const sampleOrder: Order = {
  id: '12345',
  amount: 99.99,
  customerEmail: 'customer@example.com',
  paymentMethod: { type: 'credit_card', token: 'tok_123' },
  items: [{ id: 'item1', quantity: 1 }]
};

// Both processors handle the same order differently based on configuration
productionProcessor.processOrder(sampleOrder);
testProcessor.processOrder(sampleOrder);
```

## Examples

```typescript
// ❌ BAD: Rigid architecture with hardcoded dependencies
class RigidOrderProcessor {
  processOrder(order: Order): void {
    // Hardcoded payment processor - cannot be changed without code modification
    const stripePayment = new StripePaymentProcessor();
    stripePayment.charge(order.amount, order.paymentMethod);

    // Hardcoded notification - cannot add SMS or other channels
    const sendgridEmail = new SendgridEmailService();
    sendgridEmail.sendOrderConfirmation(order.customerEmail);

    // Hardcoded storage - cannot switch databases
    const mysqlInventory = new MySQLInventoryService();
    mysqlInventory.decrementStock(order.items);
  }
}

// ✅ GOOD: Flexible architecture with configurable behavior
class FlexibleOrderProcessor {
  constructor(
    private paymentProcessor: PaymentProcessor,    // Strategy pattern
    private notificationManager: NotificationManager, // Plugin architecture
    private storageAdapter: StorageAdapter,        // Adapter pattern
    private config: OrderProcessingConfig          // Configuration-driven
  ) {}

  async processOrder(order: Order): Promise<OrderResult> {
    // All implementations are configurable and swappable
    const paymentResult = await this.paymentProcessor.processPayment(
      order.amount, order.paymentMethod
    );

    if (this.config.enableNotifications) {
      await this.notificationManager.sendNotifications(
        `Order ${order.id} confirmed`,
        order.customerEmail,
        this.config.enabledNotificationTypes
      );
    }

    await this.storageAdapter.save(order);
    return { success: true, orderId: order.id };
  }
}
```

## Related Bindings

- [feature-flag-management](../../docs/bindings/core/feature-flag-management.md): Feature flags enable runtime behavior changes, implementing flexible architecture for gradual rollouts.

- [component-isolation](../../docs/bindings/core/component-isolation.md): Well-isolated components provide the foundation for architectural flexibility by enabling independent modification.

- [interface-contracts](../../docs/bindings/core/interface-contracts.md): Stable, well-defined interfaces enable safe architectural evolution without breaking consumers.

- [dependency-inversion](../../docs/bindings/core/dependency-inversion.md): Depending on abstractions rather than implementations creates adaptable, extensible systems.
