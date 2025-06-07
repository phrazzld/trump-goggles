---
derived_from: no-secret-suppression
id: external-configuration
last_modified: '2025-05-14'
enforced_by: code review & style guides
---
# Binding: Never Hardcode Configuration

Never embed configuration values in your source code. Keep all environment-specific
settings, credentials, connection strings, feature flags, and other variable
configuration external to your application code, making them injectable at runtime.

## Rationale

This binding directly implements our no-secret-suppression tenet by preventing one of
its most dangerous forms: hardcoded secrets and configuration. When you embed
configuration values directly in your code, you're essentially creating hidden
vulnerabilities and dependencies that evade the checks and balances designed to protect
your system.

Think of your application as a fine musical instrument that needs to be tuned
differently depending on the venue and performance. Hardcoding configuration is like
permanently fixing all the tuning pegs in place—the instrument can only perform
correctly in one specific environment. External configuration, on the other hand, allows
your application to be "tuned" appropriately for each environment it runs in, from a
developer's laptop to staging and production systems, without changing a single line of
code.

The costs of hardcoded configuration compound over time and across teams. What begins as
a convenient shortcut ("I'll just put the dev server URL right here for now") inevitably
leads to deployment failures, security breaches, and configuration drift. When a
credential is embedded in code, it typically lives far longer than intended, potentially
remaining accessible long after the developer has left the company. What's worse,
changing these values requires code changes, testing cycles, and redeployment—turning
what should be a simple configuration adjustment into a full release process.

## Rule Definition

This binding stipulates that:

- All variable configuration must be externalized from source code and supplied at
  runtime. This includes:

  - Environment-specific values (URLs, hostnames, ports, timeouts)
  - Credentials (passwords, API keys, tokens, certificates)
  - Feature flags and toggles
  - Resource limits and scalability parameters
  - Logging levels and destinations
  - Any other value that might need to change between deployments or environments

- Configuration should be supplied through standardized mechanisms appropriate to your
  deployment environment:

  - Environment variables
  - Configuration files (excluded from version control when containing sensitive values)
  - Secrets management systems
  - Configuration management platforms

- Configuration values must never be:

  - Hardcoded in source code, even as "defaults"
  - Stored in version control (except for template files and non-sensitive examples)
  - Embedded in compiled binaries or deployment artifacts
  - Shared across environments without intentional decision-making

Limited exceptions exist primarily for:

- Non-sensitive constants that are truly invariant (e.g., mathematical constants, HTTP
  status codes)
- Development-only tooling aids that never deploy to production
- Test fixtures that are explicitly labeled and isolated

Even in these exceptional cases, consider whether the value might ever need to change.
If there's any doubt, externalize it. When you must include default values in code
(e.g., for developer convenience), ensure they're clearly marked as defaults and are
overridden in all real deployment environments.

## Practical Implementation

To implement external configuration effectively in your systems:

1. **Design with Configuration Abstraction**: Create a dedicated configuration layer in
   your application that centralizes all interactions with external configuration
   sources. Ask yourself: "If we needed to change where configuration comes from, how
   many files would we need to modify?" A well-designed system should require changes to
   only one dedicated component. This approach creates a clear boundary between
   configuration retrieval and the business logic that uses those values.

   ```typescript
   // Configuration layer with abstraction
   class ConfigService {
     private readonly config: Record<string, any>;

     constructor() {
       // Load from environment, files, or remote sources
       this.config = this.loadConfiguration();
     }

     get<T>(key: string, defaultValue?: T): T {
       return this.config[key] !== undefined ? this.config[key] : defaultValue;
     }

     private loadConfiguration() {
       // Implementation details of loading configuration
     }
   }

   // Usage in business logic
   const configService = new ConfigService();
   const databaseUrl = configService.get<string>('DATABASE_URL');
   ```

1. **Implement Strong Validation**: Validate configuration values at application
   startup, failing fast if required values are missing or invalid. Don't wait until a
   feature is used to discover the configuration is incorrect. Ask yourself: "What
   assumptions am I making about this configuration value?" Then validate those
   assumptions explicitly. This creates a clear contract for what configuration your
   application requires and ensures problems are caught immediately, not deep in a call
   stack.

   ```go
   type DatabaseConfig struct {
     URL           string
     MaxConnections int
     Timeout        time.Duration
   }

   func ValidateDatabaseConfig(config DatabaseConfig) error {
     if config.URL == "" {
       return errors.New("database URL is required")
     }
     if config.MaxConnections <= 0 {
       return errors.New("max connections must be greater than zero")
     }
     if config.Timeout < time.Second {
       return errors.New("timeout must be at least one second")
     }
     return nil
   }
   ```

1. **Layer Your Configuration Sources**: Implement a configuration hierarchy that allows
   for overrides from multiple sources. A common pattern is: default values →
   configuration files → environment variables → command-line arguments. Ask yourself:
   "How will operators configure this system in an emergency?" Ensure there's always a
   mechanism to override configuration without requiring a rebuild or redeploy.

   ```python
   def load_config():
       # Start with defaults
       config = {
           "log_level": "info",
           "server_port": 8080,
           "metrics_enabled": True
       }

       # Override with config file if present
       try:
           with open("config.json") as f:
               file_config = json.load(f)
               config.update(file_config)
       except FileNotFoundError:
           pass

       # Environment variables override file config
       if os.environ.get("LOG_LEVEL"):
           config["log_level"] = os.environ.get("LOG_LEVEL")
       if os.environ.get("SERVER_PORT"):
           config["server_port"] = int(os.environ.get("SERVER_PORT"))
       if os.environ.get("METRICS_ENABLED"):
           config["metrics_enabled"] = os.environ.get("METRICS_ENABLED").lower() == "true"

       return config
   ```

1. **Secure Sensitive Configuration**: Treat secrets differently from regular
   configuration. Ask yourself: "What would happen if this value was exposed in logs or
   error messages?" Use specialized secrets management services appropriate to your
   deployment platform (e.g., AWS Secrets Manager, HashiCorp Vault, Kubernetes Secrets)
   rather than plain environment variables or configuration files for truly sensitive
   values.

   ```typescript
   async function getSecrets() {
     // For AWS environments
     const secretsManager = new AWS.SecretsManager();
     const result = await secretsManager.getSecretValue({ SecretId: 'my-service/production' }).promise();
     return JSON.parse(result.SecretString);

     // For Kubernetes environments
     // return readKubernetesSecret('my-service-secrets');

     // For local development, might fall back to well-isolated .env file
     // return dotenv.parse(fs.readFileSync('.env.secrets'));
   }
   ```

1. **Document Configuration Requirements**: Provide clear documentation about all
   configuration options, including their purpose, format, default values, and
   validation rules. Include example configuration for common scenarios. Ask yourself:
   "Could someone unfamiliar with this codebase configure it correctly just from the
   documentation?" Create template files with placeholder values (like `.env.example`)
   that can be checked into version control as a guide, even if the actual configuration
   files with real values are excluded.

   ```markdown
   # Configuration Guide

   The application requires the following configuration:

   ## Database Settings

   - `DATABASE_URL`: Connection string for the database (required)
   - `DB_POOL_SIZE`: Number of connections in the pool (default: 10)
   - `DB_TIMEOUT_MS`: Query timeout in milliseconds (default: 5000)

   ## API Settings

   - `API_KEY`: Authentication key for external API (required)
   - `API_TIMEOUT_MS`: API call timeout in milliseconds (default: 30000)
   ```

## Examples

```java
// ❌ BAD: Hardcoded configuration values in code
public class DatabaseService {
    private final String url = "jdbc:mysql://db.example.com:3306/production";
    private final String username = "admin";
    private final String password = "super-secret-password"; // Security risk!

    public Connection getConnection() throws SQLException {
        return DriverManager.getConnection(url, username, password);
    }
}
```

```java
// ✅ GOOD: External configuration with validation
public class DatabaseService {
    private final String url;
    private final String username;
    private final String password;

    public DatabaseService(Config config) {
        this.url = Objects.requireNonNull(config.getString("db.url"),
                                         "Database URL is required");
        this.username = Objects.requireNonNull(config.getString("db.username"),
                                              "Database username is required");
        this.password = Objects.requireNonNull(config.getString("db.password"),
                                              "Database password is required");
    }

    public Connection getConnection() throws SQLException {
        return DriverManager.getConnection(url, username, password);
    }
}

// In the application startup code:
public static void main(String[] args) {
    Config config = ConfigFactory.load(); // Loads from multiple sources
    DatabaseService db = new DatabaseService(config);
    // ...
}
```

```typescript
// ❌ BAD: Mixing configuration and business logic
function sendAnalytics(eventData) {
  // Hardcoded endpoint, API key, and configuration
  const endpoint = "https://analytics.example.com/events";
  const apiKey = "1a2b3c4d5e6f";
  const batchSize = 10;
  const retryCount = 3;

  // What if we need different values for testing or different environments?
  // What if the API key needs to be rotated?
  fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": apiKey
    },
    body: JSON.stringify(eventData)
  });
}
```

```typescript
// ✅ GOOD: Clean separation with external configuration
class AnalyticsService {
  private readonly endpoint: string;
  private readonly apiKey: string;
  private readonly batchSize: number;
  private readonly retryCount: number;

  constructor(config: AnalyticsConfig) {
    this.endpoint = config.endpoint;
    this.apiKey = config.apiKey;
    this.batchSize = config.batchSize || 10;
    this.retryCount = config.retryCount || 3;

    // Validate configuration
    if (!this.endpoint) {
      throw new Error("Analytics endpoint is required");
    }
    if (!this.apiKey) {
      throw new Error("Analytics API key is required");
    }
  }

  async sendEvent(eventData: any): Promise<void> {
    // Use the configuration values
    await fetch(this.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": this.apiKey
      },
      body: JSON.stringify(eventData)
    });
  }
}

// Instantiate with configuration from environment
const analyticsService = new AnalyticsService({
  endpoint: process.env.ANALYTICS_ENDPOINT,
  apiKey: process.env.ANALYTICS_API_KEY,
  batchSize: parseInt(process.env.ANALYTICS_BATCH_SIZE || "10"),
  retryCount: parseInt(process.env.ANALYTICS_RETRY_COUNT || "3")
});
```

```python
# ❌ BAD: Configuration scattered throughout code
def process_image(image_data):
    # Hardcoded feature flags and parameters
    enable_hd = True
    max_size = 2048
    compression_quality = 85
    allowed_formats = ["jpg", "png", "webp"]

    # Business logic using hardcoded values
    # ...
```

```python
# ✅ GOOD: Centralized configuration management
class ImageProcessingConfig:
    def __init__(self, config_source):
        self.enable_hd = config_source.get_bool("image.enable_hd", False)
        self.max_size = config_source.get_int("image.max_size", 1024)
        self.compression_quality = config_source.get_int("image.compression_quality", 80)
        self.allowed_formats = config_source.get_list("image.allowed_formats", ["jpg", "png"])

        # Validate configuration
        if self.max_size < 100:
            raise ValueError("image.max_size must be at least 100")
        if not (0 <= self.compression_quality <= 100):
            raise ValueError("image.compression_quality must be between 0 and 100")

# Use the configuration in business logic
def process_image(image_data, config):
    if config.enable_hd:
        # HD processing logic
        pass

    # Rest of the business logic using config object
    # ...
```

## Related Bindings

- [no-secret-suppression](../../docs/tenets/no-secret-suppression.md): While
  no-secret-suppression focuses broadly on not bypassing quality safeguards, external
  configuration specifically addresses the practice of storing configuration and secrets
  directly in code. Both bindings work to prevent vulnerabilities and improve
  maintainability, but from different angles—implementing both creates multiple layers
  of protection against security issues.

- [dependency-inversion](../../docs/bindings/core/dependency-inversion.md): Proper external configuration
  complements dependency inversion by creating a clean separation between business logic
  and its environmental dependencies. When configuration is injected rather than
  hardcoded, your domain logic becomes more testable and portable across different
  environments—key benefits that dependency inversion also promotes.

- [hex-domain-purity](../../docs/bindings/core/hex-domain-purity.md): External configuration supports domain
  purity by ensuring that environment-specific details don't contaminate your business
  logic. Configuration becomes an infrastructure concern that's kept at the boundaries
  of your application, allowing your domain code to remain focused on the business
  problem rather than implementation details.
