---
id: centralized-configuration
last_modified: '2025-06-02'
version: '0.1.0'
derived_from: dry-dont-repeat-yourself
enforced_by: 'Configuration management tools, environment validation, deployment scripts'
---
# Binding: Centralize Configuration and Settings Management

Establish a single, authoritative source for all configuration data, environment variables, feature flags, and application settings. This eliminates duplication of configuration knowledge and ensures consistent behavior across all parts of the system.

## Rationale

This binding implements our DRY tenet by creating a single source of truth for all configuration knowledge in your system. Like a master control panel for a building's systems, centralized configuration manages everything consistently from one location instead of having scattered, potentially conflicting settings.

When configuration values are scattered across multiple files, environment setups, or hardcoded in various locations, you create duplication that leads to inconsistencies, deployment errors, and difficult troubleshooting. Configuration sprawl creates maintenance burden and is a common source of production bugs.

## Rule Definition

Centralized configuration must establish these organizational principles:

- **Single Source of Truth**: All configuration values must be defined in one authoritative location and referenced from there by all components that need them.

- **Environment-Specific Overrides**: Support configuration variations across different environments while maintaining the same configuration structure.
- **Type Safety**: Use strongly-typed configuration objects that catch errors at startup rather than runtime.
- **Validation and Defaults**: Validate all configuration values at application startup and provide sensible defaults.
- **Secret Management**: Handle sensitive configuration separately from non-sensitive settings using appropriate security measures.

**Anti-Patterns to Avoid:**
- Hardcoding configuration values in source code
- Duplicating the same setting in multiple configuration files
- Using different configuration formats or locations across services
- Mixing secrets with non-sensitive configuration

## Practical Implementation

1. **Use Configuration Schema Validation**: Define a schema for your configuration that validates types, ranges, and required fields at application startup.
2. **Implement Configuration Layering**: Support multiple configuration sources with a clear precedence order.
3. **Create Configuration Objects**: Map configuration to strongly-typed objects that provide compile-time safety.
4. **Externalize All Environment Dependencies**: Never hardcode environment-specific values.

## Examples

```typescript
// ❌ BAD: Configuration scattered and duplicated throughout codebase
// Database connection duplicated in multiple files
const userService = new UserService({
  host: 'localhost',
  port: 5432,
  database: 'myapp',
  username: 'user',
  password: 'password'
});

const orderService = new OrderService({
  host: 'localhost',        // Duplicated
  port: 5432,              // Duplicated
  database: 'myapp',       // Duplicated
  username: 'user',        // Duplicated
  password: 'password'     // Duplicated - and insecure!
});

// API endpoints hardcoded in different components
class PaymentService {
  async processPayment(amount: number) {
    const response = await fetch('https://api.stripe.com/v1/charges', {
      headers: {
        'Authorization': 'Bearer sk_test_hardcoded_key'  // Hardcoded secret!
      }
    });
  }
}

class EmailService {
  async sendEmail(to: string, subject: string) {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      headers: {
        'Authorization': 'Bearer SG.hardcoded_key'  // Different hardcoded secret!
      }
    });
  }
}

// ✅ GOOD: Centralized configuration with type safety
// Configuration schema definition
interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  maxConnections: number;
  connectionTimeout: number;
}

interface ExternalServicesConfig {
  stripe: {
    apiKey: string;
    webhookSecret: string;
    apiVersion: string;
  };
  sendgrid: {
    apiKey: string;
    fromEmail: string;
    replyToEmail: string;
  };
  redis: {
    url: string;
    keyPrefix: string;
    ttlSeconds: number;
  };
}

interface ApplicationConfig {
  server: {
    port: number;
    host: string;
    corsOrigins: string[];
  };
  database: DatabaseConfig;
  externalServices: ExternalServicesConfig;
  features: {
    enableEmailNotifications: boolean;
    enablePaymentProcessing: boolean;
    enableAnalytics: boolean;
  };
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    destination: 'console' | 'file' | 'remote';
    enableStructuredLogging: boolean;
  };
}

// Configuration loader with validation and defaults
class ConfigurationManager {
  private static instance: ConfigurationManager;
  private config: ApplicationConfig;

  private constructor() {
    this.config = this.loadConfiguration();
    this.validateConfiguration();
  }

  static getInstance(): ConfigurationManager {
    if (!this.instance) {
      this.instance = new ConfigurationManager();
    }
    return this.instance;
  }

  getConfig(): ApplicationConfig {
    return this.config;
  }

  private loadConfiguration(): ApplicationConfig {
    // Load from multiple sources with precedence:
    // 1. Environment variables (highest precedence)
    // 2. Configuration files
    // 3. Default values (lowest precedence)

    const defaults: ApplicationConfig = {
      server: {
        port: 3000,
        host: 'localhost',
        corsOrigins: ['http://localhost:3000']
      },
      database: {
        host: 'localhost',
        port: 5432,
        database: 'myapp',
        username: 'postgres',
        password: '',
        maxConnections: 10,
        connectionTimeout: 30000
      },
      externalServices: {
        stripe: {
          apiKey: this.requireEnv('STRIPE_API_KEY'),
          webhookSecret: this.requireEnv('STRIPE_WEBHOOK_SECRET'),
          apiVersion: '2023-10-16'
        },
        sendgrid: {
          apiKey: this.requireEnv('SENDGRID_API_KEY'),
          fromEmail: this.requireEnv('FROM_EMAIL'),
          replyToEmail: this.getEnv('REPLY_TO_EMAIL', 'noreply@example.com')
        },
        redis: {
          url: this.getEnv('REDIS_URL', 'redis://localhost:6379'),
          keyPrefix: 'myapp:',
          ttlSeconds: 3600
        }
      },
      features: {
        enableEmailNotifications: this.getBoolEnv('ENABLE_EMAIL_NOTIFICATIONS', true),
        enablePaymentProcessing: this.getBoolEnv('ENABLE_PAYMENT_PROCESSING', true),
        enableAnalytics: this.getBoolEnv('ENABLE_ANALYTICS', false)
      },
      logging: {
        level: this.getEnv('LOG_LEVEL', 'info') as any,
        destination: this.getEnv('LOG_DESTINATION', 'console') as any,
        enableStructuredLogging: this.getBoolEnv('ENABLE_STRUCTURED_LOGGING', true)
      }
    };

    // Override with environment-specific values
    return this.mergeWithEnvironmentOverrides(defaults);
  }

  private validateConfiguration(): void {
    // Validate required fields
    const required = [
      'STRIPE_API_KEY',
      'STRIPE_WEBHOOK_SECRET',
      'SENDGRID_API_KEY',
      'FROM_EMAIL'
    ];

    for (const key of required) {
      if (!process.env[key]) {
        throw new Error(`Required environment variable ${key} is not set`);
      }
    }

    // Validate ranges and formats
    if (this.config.server.port < 1 || this.config.server.port > 65535) {
      throw new Error('Server port must be between 1 and 65535');
    }

    if (this.config.database.maxConnections < 1) {
      throw new Error('Database max connections must be at least 1');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.config.externalServices.sendgrid.fromEmail)) {
      throw new Error('FROM_EMAIL must be a valid email address');
    }
  }

  private requireEnv(key: string): string {
    const value = process.env[key];
    if (!value) {
      throw new Error(`Required environment variable ${key} is not set`);
    }
    return value;
  }

  private getEnv(key: string, defaultValue: string): string {
    return process.env[key] || defaultValue;
  }

  private getBoolEnv(key: string, defaultValue: boolean): boolean {
    const value = process.env[key];
    if (!value) return defaultValue;
    return value.toLowerCase() === 'true';
  }
}

// Services now use centralized configuration
class UserService {
  private dbConfig: DatabaseConfig;

  constructor() {
    this.dbConfig = ConfigurationManager.getInstance().getConfig().database;
  }

  async connect() {
    return new DatabaseConnection({
      host: this.dbConfig.host,
      port: this.dbConfig.port,
      database: this.dbConfig.database,
      username: this.dbConfig.username,
      password: this.dbConfig.password,
      maxConnections: this.dbConfig.maxConnections
    });
  }
}

class PaymentService {
  private stripeConfig: ExternalServicesConfig['stripe'];

  constructor() {
    this.stripeConfig = ConfigurationManager.getInstance().getConfig().externalServices.stripe;
  }

  async processPayment(amount: number) {
    const response = await fetch('https://api.stripe.com/v1/charges', {
      headers: {
        'Authorization': `Bearer ${this.stripeConfig.apiKey}`,
        'Stripe-Version': this.stripeConfig.apiVersion
      }
    });
  }
}

class EmailService {
  private sendgridConfig: ExternalServicesConfig['sendgrid'];
  private featuresConfig: ApplicationConfig['features'];

  constructor() {
    const config = ConfigurationManager.getInstance().getConfig();
    this.sendgridConfig = config.externalServices.sendgrid;
    this.featuresConfig = config.features;
  }

  async sendEmail(to: string, subject: string, body: string) {
    // Feature flag check using centralized configuration
    if (!this.featuresConfig.enableEmailNotifications) {
      console.log('Email notifications disabled, skipping send');
      return;
    }

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      headers: {
        'Authorization': `Bearer ${this.sendgridConfig.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: this.sendgridConfig.fromEmail },
        reply_to: { email: this.sendgridConfig.replyToEmail },
        subject,
        content: [{ type: 'text/html', value: body }]
      })
    });
  }
}
```

```python
# ❌ BAD: Configuration scattered across multiple files and hardcoded values
# settings.py
DATABASE_URL = "postgresql://user:pass@localhost/db"  # Hardcoded credentials
REDIS_URL = "redis://localhost:6379"
DEBUG = True  # Should be environment-specific

# user_service.py
class UserService:
    def __init__(self):
        self.db_url = "postgresql://user:pass@localhost/db"  # Duplicated
        self.cache_ttl = 3600  # Hardcoded

# ✅ GOOD: Centralized configuration with proper secret management
import os
from dataclasses import dataclass
from typing import Optional

@dataclass
class DatabaseConfig:
    url: str
    max_connections: int = 20
    enable_logging: bool = False

@dataclass
class EmailConfig:
    api_key: str
    from_email: str
    reply_to: Optional[str] = None

@dataclass
class ApplicationConfig:
    environment: str
    debug: bool = False
    secret_key: str
    database: DatabaseConfig
    email: EmailConfig

class ConfigurationManager:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        if not hasattr(self, '_config'):
            self._config = self._load_configuration()

    def _load_configuration(self) -> ApplicationConfig:
        return ApplicationConfig(
            environment=os.getenv('ENVIRONMENT', 'development'),
            debug=os.getenv('DEBUG', 'false').lower() == 'true',
            secret_key=self._require_env('SECRET_KEY'),
            database=DatabaseConfig(
                url=self._require_env('DATABASE_URL'),
                max_connections=int(os.getenv('DB_MAX_CONNECTIONS', '20'))
            ),
            email=EmailConfig(
                api_key=self._require_env('EMAIL_API_KEY'),
                from_email=self._require_env('FROM_EMAIL')
            )
        )

    def _require_env(self, key: str) -> str:
        value = os.getenv(key)
        if not value:
            raise ValueError(f"Required environment variable {key} is not set")
        return value
