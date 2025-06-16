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

This binding implements our DRY tenet by creating a single source of truth for all configuration knowledge in your system. When configuration values are scattered across multiple files, environment setups, or hardcoded in various locations, you create duplication that leads to inconsistencies, deployment errors, and difficult troubleshooting.

Think of centralized configuration like having a single control panel for your entire building's systems. Instead of having separate thermostats, light switches, and security controls scattered throughout the building with potentially conflicting settings, you have one master control system that manages everything consistently. When you need to change a setting, you change it in one place and the entire building responds appropriately.

Without centralized configuration, teams often create configuration drift where different environments have slightly different settings, development and production behave differently due to configuration mismatches, and troubleshooting becomes difficult because no one knows definitively what settings are being used where. This configuration sprawl creates a maintenance burden and is a common source of production bugs.

## Rule Definition

Centralized configuration must establish these organizational principles:

- **Single Source of Truth**: All configuration values must be defined in one authoritative location and referenced from there by all components that need them.

- **Environment-Specific Overrides**: Support configuration variations across different environments (development, staging, production) while maintaining the same configuration structure.

- **Hierarchical Configuration**: Organize configuration in a logical hierarchy that reflects your application's structure and makes related settings easy to find and manage together.

- **Type Safety**: Use strongly-typed configuration objects that catch errors at startup rather than runtime, and provide clear documentation of expected values.

- **Validation and Defaults**: Validate all configuration values at application startup and provide sensible defaults where appropriate to prevent runtime failures.

- **Secret Management**: Handle sensitive configuration (API keys, database passwords) separately from non-sensitive settings using appropriate security measures.

**Configuration Categories:**
- Application behavior settings (timeouts, retry counts, feature flags)
- External service endpoints and credentials
- Database connection parameters
- Logging levels and output destinations
- Performance tuning parameters (cache sizes, thread pools)
- Business rules and thresholds

**Anti-Patterns to Avoid:**
- Hardcoding configuration values in source code
- Duplicating the same setting in multiple configuration files
- Using different configuration formats or locations across services
- Mixing secrets with non-sensitive configuration

## Practical Implementation

1. **Use Configuration Schema Validation**: Define a schema for your configuration that validates types, ranges, and required fields at application startup. This catches configuration errors early rather than during runtime.

2. **Implement Configuration Layering**: Support multiple configuration sources (defaults, files, environment variables) with a clear precedence order. This enables flexible deployment while maintaining consistency.

3. **Create Configuration Objects**: Map configuration to strongly-typed objects or structures that provide compile-time safety and IDE support. Avoid accessing configuration through string keys scattered throughout code.

4. **Externalize All Environment Dependencies**: Never hardcode environment-specific values. Use configuration for anything that changes between development, testing, and production environments.

5. **Implement Configuration Hot-Reloading**: For appropriate settings, support runtime configuration updates without requiring application restarts. This enables operational flexibility while maintaining consistency.

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

# email_service.py
class EmailService:
    def __init__(self):
        self.api_key = "sg_hardcoded_key"  # Insecure hardcoded secret
        self.from_email = "noreply@example.com"  # Hardcoded

# payment_service.py
class PaymentService:
    def __init__(self):
        self.stripe_key = "sk_test_hardcoded"  # Another hardcoded secret
        self.webhook_secret = "whsec_hardcoded"  # Yet another secret

# ✅ GOOD: Centralized configuration with proper secret management
import os
from dataclasses import dataclass
from typing import Optional, Dict, Any
import json
from pathlib import Path

@dataclass
class DatabaseConfig:
    url: str
    max_connections: int = 20
    connection_timeout: int = 30
    enable_logging: bool = False

@dataclass
class RedisConfig:
    url: str
    key_prefix: str = "myapp:"
    default_ttl: int = 3600
    max_connections: int = 10

@dataclass
class EmailConfig:
    provider: str  # 'sendgrid', 'ses', 'smtp'
    api_key: str
    from_email: str
    reply_to: Optional[str] = None
    template_dir: str = "templates/email"

@dataclass
class PaymentConfig:
    stripe_api_key: str
    stripe_webhook_secret: str
    currency: str = "usd"
    enable_webhooks: bool = True

@dataclass
class FeatureFlags:
    enable_user_registration: bool = True
    enable_email_notifications: bool = True
    enable_payment_processing: bool = True
    enable_analytics: bool = False
    maintenance_mode: bool = False

@dataclass
class LoggingConfig:
    level: str = "INFO"
    format: str = "json"  # 'json' or 'text'
    destination: str = "console"  # 'console', 'file', or 'syslog'
    file_path: Optional[str] = None

@dataclass
class ApplicationConfig:
    environment: str  # 'development', 'staging', 'production'
    debug: bool = False
    secret_key: str
    database: DatabaseConfig
    redis: RedisConfig
    email: EmailConfig
    payment: PaymentConfig
    features: FeatureFlags
    logging: LoggingConfig

class ConfigurationError(Exception):
    """Raised when configuration is invalid or missing"""
    pass

class ConfigurationManager:
    """Centralized configuration management with validation and type safety"""

    _instance: Optional['ConfigurationManager'] = None
    _config: Optional[ApplicationConfig] = None

    def __new__(cls) -> 'ConfigurationManager':
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        if self._config is None:
            self._config = self._load_configuration()
            self._validate_configuration()

    @property
    def config(self) -> ApplicationConfig:
        if self._config is None:
            raise ConfigurationError("Configuration not loaded")
        return self._config

    def _load_configuration(self) -> ApplicationConfig:
        """Load configuration from multiple sources with precedence"""

        # Start with defaults
        config_data = self._get_default_config()

        # Override with file-based configuration
        config_file_path = os.getenv('CONFIG_FILE', 'config.json')
        if Path(config_file_path).exists():
            with open(config_file_path, 'r') as f:
                file_config = json.load(f)
                config_data = self._deep_merge(config_data, file_config)

        # Override with environment variables (highest precedence)
        env_overrides = self._extract_env_overrides()
        config_data = self._deep_merge(config_data, env_overrides)

        # Convert to typed configuration object
        return self._create_config_object(config_data)

    def _get_default_config(self) -> Dict[str, Any]:
        """Default configuration values"""
        return {
            'environment': 'development',
            'debug': False,
            'database': {
                'max_connections': 20,
                'connection_timeout': 30,
                'enable_logging': False
            },
            'redis': {
                'key_prefix': 'myapp:',
                'default_ttl': 3600,
                'max_connections': 10
            },
            'email': {
                'provider': 'sendgrid',
                'template_dir': 'templates/email'
            },
            'payment': {
                'currency': 'usd',
                'enable_webhooks': True
            },
            'features': {
                'enable_user_registration': True,
                'enable_email_notifications': True,
                'enable_payment_processing': True,
                'enable_analytics': False,
                'maintenance_mode': False
            },
            'logging': {
                'level': 'INFO',
                'format': 'json',
                'destination': 'console'
            }
        }

    def _extract_env_overrides(self) -> Dict[str, Any]:
        """Extract configuration from environment variables"""
        return {
            'environment': os.getenv('ENVIRONMENT', 'development'),
            'debug': os.getenv('DEBUG', 'false').lower() == 'true',
            'secret_key': self._require_env('SECRET_KEY'),
            'database': {
                'url': self._require_env('DATABASE_URL'),
                'max_connections': int(os.getenv('DB_MAX_CONNECTIONS', '20')),
                'enable_logging': os.getenv('DB_ENABLE_LOGGING', 'false').lower() == 'true'
            },
            'redis': {
                'url': self._require_env('REDIS_URL'),
                'key_prefix': os.getenv('REDIS_KEY_PREFIX', 'myapp:'),
                'default_ttl': int(os.getenv('REDIS_DEFAULT_TTL', '3600'))
            },
            'email': {
                'api_key': self._require_env('EMAIL_API_KEY'),
                'from_email': self._require_env('FROM_EMAIL'),
                'reply_to': os.getenv('REPLY_TO_EMAIL')
            },
            'payment': {
                'stripe_api_key': self._require_env('STRIPE_API_KEY'),
                'stripe_webhook_secret': self._require_env('STRIPE_WEBHOOK_SECRET'),
                'currency': os.getenv('PAYMENT_CURRENCY', 'usd')
            },
            'features': {
                'enable_user_registration': os.getenv('ENABLE_USER_REGISTRATION', 'true').lower() == 'true',
                'enable_email_notifications': os.getenv('ENABLE_EMAIL_NOTIFICATIONS', 'true').lower() == 'true',
                'enable_payment_processing': os.getenv('ENABLE_PAYMENT_PROCESSING', 'true').lower() == 'true',
                'enable_analytics': os.getenv('ENABLE_ANALYTICS', 'false').lower() == 'true',
                'maintenance_mode': os.getenv('MAINTENANCE_MODE', 'false').lower() == 'true'
            },
            'logging': {
                'level': os.getenv('LOG_LEVEL', 'INFO'),
                'format': os.getenv('LOG_FORMAT', 'json'),
                'destination': os.getenv('LOG_DESTINATION', 'console'),
                'file_path': os.getenv('LOG_FILE_PATH')
            }
        }

    def _require_env(self, key: str) -> str:
        """Require an environment variable to be set"""
        value = os.getenv(key)
        if not value:
            raise ConfigurationError(f"Required environment variable {key} is not set")
        return value

    def _create_config_object(self, config_data: Dict[str, Any]) -> ApplicationConfig:
        """Convert configuration dictionary to typed object"""
        return ApplicationConfig(
            environment=config_data['environment'],
            debug=config_data['debug'],
            secret_key=config_data['secret_key'],
            database=DatabaseConfig(**config_data['database']),
            redis=RedisConfig(**config_data['redis']),
            email=EmailConfig(**config_data['email']),
            payment=PaymentConfig(**config_data['payment']),
            features=FeatureFlags(**config_data['features']),
            logging=LoggingConfig(**config_data['logging'])
        )

    def _validate_configuration(self) -> None:
        """Validate configuration values"""
        config = self.config

        # Validate environment
        valid_environments = ['development', 'staging', 'production']
        if config.environment not in valid_environments:
            raise ConfigurationError(f"Environment must be one of {valid_environments}")

        # Validate secret key length
        if len(config.secret_key) < 32:
            raise ConfigurationError("Secret key must be at least 32 characters long")

        # Validate email format
        import re
        email_regex = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
        if not re.match(email_regex, config.email.from_email):
            raise ConfigurationError("FROM_EMAIL must be a valid email address")

# Services use centralized configuration
class UserService:
    def __init__(self):
        self.config = ConfigurationManager().config
        self.db_config = self.config.database
        self.features = self.config.features

    def create_user(self, user_data: dict):
        if not self.features.enable_user_registration:
            raise Exception("User registration is currently disabled")

        # Use centralized database configuration
        db = Database(
            url=self.db_config.url,
            max_connections=self.db_config.max_connections
        )
        # Implementation...

class EmailService:
    def __init__(self):
        self.config = ConfigurationManager().config
        self.email_config = self.config.email
        self.features = self.config.features

    def send_email(self, to: str, subject: str, body: str):
        if not self.features.enable_email_notifications:
            print("Email notifications disabled")
            return

        # Use centralized email configuration
        provider = EmailProvider(
            api_key=self.email_config.api_key,
            from_email=self.email_config.from_email
        )
        # Implementation...

# Global configuration access
def get_config() -> ApplicationConfig:
    """Get the global application configuration"""
    return ConfigurationManager().config
```

## Related Bindings

- [extract-common-logic.md](../../docs/bindings/core/extract-common-logic.md): While common logic extraction eliminates behavioral duplication, centralized configuration eliminates data and settings duplication. Both work together to implement comprehensive DRY principles across different aspects of your system.

- [external-configuration.md](../../docs/bindings/core/external-configuration.md): External configuration focuses on runtime adaptability and deployment flexibility, while centralized configuration focuses on eliminating duplication and ensuring consistency. They complement each other in creating robust configuration management.

- [unified-documentation.md](../../docs/bindings/core/unified-documentation.md): Configuration and documentation both benefit from centralization to avoid duplication. A well-documented centralized configuration system prevents teams from creating conflicting or outdated configuration knowledge.

- [no-secret-suppression.md](../../docs/tenets/no-secret-suppression.md): Centralized configuration must properly handle secrets and sensitive data. The configuration system should integrate with secret management practices to avoid exposing sensitive information while maintaining centralization benefits.
