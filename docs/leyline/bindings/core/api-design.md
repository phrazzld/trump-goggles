---
derived_from: explicit-over-implicit
enforced_by: code review & style guides
id: api-design
last_modified: '2025-05-14'
version: '0.1.0'
---
# Binding: Design Clear, Explicit API Contracts

Design APIs with clear, explicit contracts that fully communicate their behavior,
requirements, and limitations. Whether for internal modules, external services, or
command-line interfaces, prefer explicitness over convenience or brevity in all API
surfaces.

## Rationale

This binding directly implements our explicit-over-implicit tenet by ensuring that the
contracts between components—the most critical communication points in any system—are
thoroughly defined and clearly expressed. When APIs lack explicit contracts, they create
hidden knowledge that must be discovered through trial and error, leading to misuse,
bugs, and maintenance difficulties.

Think of APIs as the bridges connecting different parts of your ecosystem. Just as a
bridge needs clear weight limits, lane markings, and traffic signs to be used safely,
your APIs need explicit contracts that communicate their expectations and guarantees. A
bridge without proper signage might work for those who built it and know its limits, but
it becomes increasingly dangerous as more people use it who don't share that
institutional knowledge. Similarly, APIs without clear contracts might work for their
original authors but create growing risks as more developers interact with them.

The cost of implicit API design compounds over time and across team boundaries. What
starts as a convenient shortcut ("I'll just assume the caller knows they need to
validate this input") inevitably leads to unexpected behaviors, runtime errors, and loss
of trust in the system. These issues are particularly expensive because they often cross
component boundaries, making them harder to debug and fix. By contrast, explicit APIs
with well-defined contracts create a foundation of predictability that accelerates
development by eliminating an entire class of integration problems before they occur.

## Rule Definition

This binding requires that all APIs—whether they're interfaces between modules, HTTP
endpoints, command-line tools, or any other boundary between components—must have
explicit, well-defined contracts. Specifically:

- Every API must clearly define its:

  - Input requirements (parameters, their types, formats, valid ranges, and required vs.
    optional status)
  - Output guarantees (return values, response formats, possible errors/exceptions)
  - Side effects (what state changes occur, what external systems are affected)
  - Performance characteristics (expected latency, throughput, resource usage)
  - Security requirements (authentication, authorization, data validation)

- These contracts must be expressed through:

  - Strong typing where available (using the most specific types possible)
  - Input validation that fails fast with clear error messages
  - Comprehensive documentation (purpose, usage examples, edge cases)
  - Consistent naming that reflects behavior accurately
  - Explicit error handling strategies

- API designs must avoid:

  - Magic parameters or "flag" arguments that drastically change behavior
  - Overloaded methods that do fundamentally different things based on input types
  - Hidden side effects not clear from the interface
  - Implicit dependencies on global state or environment
  - Leaking implementation details into the public contract

Limited exceptions may apply for:

- Internal utility functions with small scope and limited usage
- Performance-critical code sections where the contract complexity would create
  measurable overhead
- Legacy systems with established patterns that would be disruptive to change

In these exceptional cases, extra documentation explaining the implicit behavior is
essential, and efforts should be made to contain the exceptions to the smallest possible
scope.

## Practical Implementation

1. **Use Strong Typing and Validation**: Define precise types for your API contracts and
   validate inputs at the boundary. Ask yourself: "What assumptions am I making about
   the data?" Then enforce those assumptions explicitly. This catches contract
   violations early, at their source, rather than deep in your implementation where the
   context is lost.

   ```typescript
   // Instead of accepting 'any' or loose types
   function processUserData(userData: any) {
     // Implementation assumes userData has specific properties
   }

   // Define a precise contract
   interface UserData {
     id: string;
     name: string;
     email: string;
     preferences?: {
       theme: 'light' | 'dark';
       notifications: boolean;
     };
   }

   function processUserData(userData: UserData) {
     // Implementation can rely on the contract
   }
   ```

1. **Separate Public APIs from Internal Implementation**: Clearly distinguish between
   public interfaces and internal implementation details. Ask yourself: "What is the
   minimum interface needed to fulfill the use cases?" Then expose only those elements,
   keeping implementation details hidden. This creates a clear boundary between what
   clients can depend on and what might change.

   ```go
   // Public API package with minimal, focused interfaces
   package api

   type UserService interface {
     GetUser(id string) (User, error)
     CreateUser(user CreateUserRequest) (User, error)
     UpdateUser(id string, updates UpdateUserRequest) (User, error)
   }

   type User struct {
     ID        string
     Name      string
     Email     string
     CreatedAt time.Time
   }

   type CreateUserRequest struct {
     Name  string `validate:"required"`
     Email string `validate:"required,email"`
   }

   type UpdateUserRequest struct {
     Name  *string
     Email *string
   }

   // Implementation package with internal details
   package internal

   type userService struct {
     db               Database
     eventPublisher   EventPublisher
     validationHelper *ValidationHelper
     // Other implementation details
   }

   // Implementation of api.UserService
   func (s *userService) GetUser(id string) (api.User, error) {
     // Implementation details
   }
   ```

1. **Document All Aspects of the Contract**: Create comprehensive documentation that
   explains the API's purpose, usage patterns, error handling, and edge cases. Ask
   yourself: "Could someone use this API correctly without looking at the
   implementation?" Documentation should include examples of correct usage, common
   pitfalls, and guidance for error handling.

   ```python
   def transfer_funds(source_account_id: str, destination_account_id: str, amount: Decimal) -> TransferResult:
       """Transfer funds between accounts.

       This function transfers the specified amount from the source account to the
       destination account atomically. Both accounts must exist and be active.

       Args:
           source_account_id: The ID of the account to transfer from. Must be an active account.
           destination_account_id: The ID of the account to transfer to. Must be an active account.
           amount: The amount to transfer. Must be positive and not exceed the source account's balance.

       Returns:
           A TransferResult object containing the updated balances and a transaction ID.

       Raises:
           AccountNotFoundError: If either account does not exist.
           InsufficientFundsError: If the source account lacks sufficient funds.
           AccountFrozenError: If either account is frozen.
           TransactionLimitError: If the transfer would exceed daily transaction limits.

       Note:
           This operation is atomic and will either fully succeed or fully fail.
           A detailed audit log is created for each transfer attempt.
       """
       # Implementation
   ```

1. **Design for Evolution**: Create APIs that can evolve without breaking clients. Ask
   yourself: "How will this API need to change in the future?" Use versioning, opt-in
   features, and backward compatibility patterns to allow APIs to evolve while
   preserving existing client behavior.

   ```java
   // REST API versioning in URL
   @RequestMapping("/api/v1/users")
   public class UserControllerV1 {
       // V1 implementation
   }

   @RequestMapping("/api/v2/users")
   public class UserControllerV2 {
       // V2 implementation with new features
   }

   // GraphQL schema evolution
   type User {
     id: ID!
     name: String!
     email: String!
     createdAt: String!  # ISO format date
     # New optional fields don't break existing queries
     preferences: UserPreferences
   }

   type UserPreferences {
     theme: Theme
     notifications: Boolean
   }

   enum Theme {
     LIGHT
     DARK
   }
   ```

1. **Use Consistent Naming and Patterns**: Apply consistent naming and design patterns
   across all APIs. Ask yourself: "Is this consistent with our other APIs?" Consistency
   makes APIs more predictable and easier to learn. Names should accurately reflect
   behavior and follow established conventions.

   ```javascript
   // Consistent naming for CRUD operations
   const userApi = {
     // GET operations use 'get' prefix and return data
     async getUser(id) {
       // Implementation
     },

     async getUsers(filter) {
       // Implementation
     },

     // Mutation operations use descriptive verbs and return the result
     async createUser(userData) {
       // Implementation
     },

     async updateUser(id, updates) {
       // Implementation
     },

     async deleteUser(id) {
       // Implementation
     },

     // Queries use descriptive verbs and return booleans
     async hasAccess(userId, resource) {
       // Implementation
     },

     // Operations with side effects are clearly named
     async sendPasswordResetEmail(email) {
       // Implementation
     }
   };
   ```

## Examples

```typescript
// ❌ BAD: Implicit API contract with hidden behaviors
function sendMessage(message, options) {
  // If options is a string, it's treated as the recipient
  // If options is an object, it has many possible properties
  const config = typeof options === 'string' ? { recipient: options } : options || {};

  // Global state dependency not clear from interface
  const currentUser = getCurrentUser();  // Pulled from global state

  // Side effects not clear from function name
  updateMessageCount();
  recordActivity();

  // Different behavior based on undocumented message format
  if (message.startsWith('!')) {
    // Treated as a command
    processCommand(message.substring(1), config);
    return true;
  }

  // Implementation continues...
}

// Called in various inconsistent ways
sendMessage("Hello world", "user123");
sendMessage("!status", { broadcast: true });
sendMessage({ text: "Hello", attachments: [...] }, { priority: "high" });
```

```typescript
// ✅ GOOD: Explicit API contract
interface MessageContent {
  text: string;
  attachments?: Attachment[];
}

interface SendMessageOptions {
  recipient: string;
  priority?: 'normal' | 'high';
  broadcast?: boolean;
}

interface CommandOptions {
  broadcast?: boolean;
  requiresAdmin?: boolean;
}

class MessagingService {
  constructor(
    private readonly currentUser: User,
    private readonly activityLogger: ActivityLogger
  ) {}

  // Regular message sending with clear contract
  async sendMessage(content: MessageContent, options: SendMessageOptions): Promise<MessageDeliveryResult> {
    // Implementation with explicit dependencies
    this.activityLogger.recordActivity({
      type: 'message_sent',
      user: this.currentUser.id,
      details: { recipient: options.recipient }
    });

    return this.deliveryService.send(content, options);
  }

  // Separate function for fundamentally different behavior
  async executeCommand(command: string, options: CommandOptions): Promise<CommandResult> {
    if (!command) {
      throw new Error('Command cannot be empty');
    }

    // Implementation
  }
}

// Usage is consistent and explicit
const messagingService = new MessagingService(currentUser, activityLogger);

await messagingService.sendMessage(
  { text: "Hello world" },
  { recipient: "user123" }
);

await messagingService.executeCommand(
  "status",
  { broadcast: true }
);
```

```go
// ❌ BAD: REST API with implicit contract
func HandleCreateUser(w http.ResponseWriter, r *http.Request) {
    // Parse request body - no schema or validation defined
    var data map[string]interface{}
    json.NewDecoder(r.Body).Decode(&data)

    // Implicit requirements, will fail mysteriously if not met
    username := data["username"].(string)  // Panics if missing or not a string
    email := data["email"].(string)

    // Hidden validation rules not communicated to API consumer
    if len(username) < 3 {
        http.Error(w, "Username too short", http.StatusBadRequest)
        return
    }

    if !strings.Contains(email, "@") {
        http.Error(w, "Invalid email", http.StatusBadRequest)
        return
    }

    // Response format not documented
    user := createUser(username, email)
    json.NewEncoder(w).Encode(user)
}
```

```go
// ✅ GOOD: REST API with explicit contract
// API documentation (OpenAPI/Swagger)
// POST /api/users
// Create a new user account
// Request body: UserCreateRequest
// Responses:
//   201: UserResponse - Successfully created
//   400: ErrorResponse - Validation failed
//   409: ErrorResponse - Username already exists

// Explicit request and response models
type UserCreateRequest struct {
    Username string `json:"username" validate:"required,min=3,max=50,alphanum"`
    Email    string `json:"email" validate:"required,email"`
    FullName string `json:"fullName" validate:"required,max=100"`
}

type UserResponse struct {
    ID        string    `json:"id"`
    Username  string    `json:"username"`
    Email     string    `json:"email"`
    FullName  string    `json:"fullName"`
    CreatedAt time.Time `json:"createdAt"`
}

type ErrorResponse struct {
    Code    string            `json:"code"`
    Message string            `json:"message"`
    Details map[string]string `json:"details,omitempty"`
}

func HandleCreateUser(w http.ResponseWriter, r *http.Request) {
    // Parse with explicit model
    var req UserCreateRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        respondWithError(w, "invalid_json", "Invalid JSON payload", http.StatusBadRequest, nil)
        return
    }

    // Explicit validation with clear error messages
    if err := validator.Validate(req); err != nil {
        validationErrors := formatValidationErrors(err)
        respondWithError(w, "validation_failed", "Validation failed", http.StatusBadRequest, validationErrors)
        return
    }

    // Business logic with clear error handling
    user, err := userService.CreateUser(r.Context(), req)
    if err != nil {
        switch {
        case errors.Is(err, ErrUsernameTaken):
            respondWithError(w, "username_taken", "Username already exists", http.StatusConflict, nil)
        case errors.Is(err, ErrEmailTaken):
            respondWithError(w, "email_taken", "Email already registered", http.StatusConflict, nil)
        default:
            // Log the unexpected error
            logger.Error("Failed to create user", "error", err)
            respondWithError(w, "internal_error", "An unexpected error occurred", http.StatusInternalServerError, nil)
        }
        return
    }

    // Successful response with correct status code
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(user)
}
```

```typescript
// ❌ BAD: CLI interface with implicit contracts
function handleCommand(args) {
  // Implicit parsing of unstructured args
  const command = args[0];

  if (command === 'deploy') {
    // Undocumented arg positions
    const environment = args[1] || 'dev';  // Default not communicated
    const version = args[2] || 'latest';   // Default not communicated

    // Hidden requirement of environment variable
    const apiKey = process.env.API_KEY;  // Will silently fail if missing

    // Implementation continues with confusing silent failures
    // ...
  } else if (command === 'config') {
    // Completely different argument structure for this command
    const action = args[1];
    const key = args[2];
    const value = args[3];

    // Implementation that handles args differently
    // ...
  }
}
```

```typescript
// ✅ GOOD: CLI interface with explicit contracts
import { Command } from 'commander';

// Define explicit command structure
const program = new Command();

program
  .name('app')
  .description('CLI tool for managing application deployments')
  .version('1.0.0');

// Each command has explicit options and documentation
program
  .command('deploy')
  .description('Deploy the application to the specified environment')
  .argument('<environment>', 'Target environment (dev, staging, prod)')
  .option('-v, --version <version>', 'Version to deploy', 'latest')
  .option('-f, --force', 'Force deployment even if validation fails')
  .requiredOption('-k, --api-key <key>', 'API key for deployment service')
  .action((environment, options) => {
    // Implementation with reliable, typed arguments
    deployService.deploy({
      environment,
      version: options.version,
      force: options.force === true,
      apiKey: options.apiKey
    });
  });

// Separate command with its own options
program
  .command('config')
  .description('Manage configuration settings')
  .addCommand(
    new Command('set')
      .description('Set a configuration value')
      .argument('<key>', 'Configuration key')
      .argument('<value>', 'Configuration value')
      .action((key, value) => {
        configService.set(key, value);
      })
  )
  .addCommand(
    new Command('get')
      .description('Get a configuration value')
      .argument('<key>', 'Configuration key')
      .action((key) => {
        const value = configService.get(key);
        console.log(value);
      })
  );

// Parse with helpful error handling
program.parse(process.argv);
```

## Related Bindings

- [explicit-over-implicit](../../docs/tenets/explicit-over-implicit.md): This binding is a
  direct application of the explicit-over-implicit tenet to API design. While the tenet
  provides the general principle that explicitness is better than implicitness, this
  binding specifies concrete practices for applying that principle to API design
  specifically.

- [dependency-inversion](../../docs/bindings/core/dependency-inversion.md): Well-designed APIs with clear
  contracts complement dependency inversion by enabling clean interfaces between
  high-level and low-level components. When APIs are explicit, dependency inversion
  becomes easier to implement because the contracts between components are clearly
  defined.

- [hex-domain-purity](../../docs/bindings/core/hex-domain-purity.md): Explicit API design supports hexagonal
  architecture by creating clear boundaries between the domain and infrastructure
  layers. The API contracts serve as ports that explicitly define how the domain
  interacts with the outside world, keeping the domain logic pure and free from
  infrastructure concerns.

- [ts-no-any](ts-no-any.md): For TypeScript specifically, avoiding the `any` type is a
  key aspect of creating explicit API contracts. The ts-no-any binding enforces type
  safety that strengthens API contracts by eliminating implicit type conversions and
  ensuring type errors are caught at compile time.
