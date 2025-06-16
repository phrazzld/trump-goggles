---
id: interface-contracts
last_modified: '2025-06-02'
version: '0.1.0'
derived_from: orthogonality
enforced_by: 'Type checking, API documentation, code review'
---
# Binding: Define Clear Component Interface Contracts

Establish explicit, well-documented contracts that define how components interact with each other. These contracts should specify inputs, outputs, behavior, error conditions, and guarantees, creating stable boundaries that enable independent development and reliable composition.

## Rationale

This binding implements our orthogonality tenet by creating clear boundaries and expectations between components. Well-defined interface contracts act as formal agreements that allow components to interact predictably without needing to understand each other's internal implementation. This separation enables true orthogonality by ensuring that changes within a component don't affect other components as long as the contract remains stable.

Think of interface contracts like legal contracts between businesses. A shipping company doesn't need to understand how a manufacturer builds their products—they just need to know the weight, dimensions, and destination specified in their shipping contract. Similarly, software components can work together effectively when they have clear contracts that specify exactly what each component promises to deliver and what it expects to receive.

Without explicit contracts, components become coupled through assumptions and implicit knowledge. Developers must understand internal implementation details to use components safely, leading to brittle code where small changes can break seemingly unrelated parts of the system. Clear contracts prevent this brittleness by making expectations explicit and enforceable, enabling confident refactoring and parallel development across teams.

## Rule Definition

Interface contracts must establish these essential elements:

- **Input Specifications**: Clearly define all required and optional parameters, including their types, valid ranges, formats, and constraints. Specify what happens with invalid inputs.

- **Output Guarantees**: Document all possible return values, their types, and the conditions under which each is returned. Include both success and error cases in the contract.

- **Behavioral Contracts**: Specify the component's behavior, side effects, performance characteristics, and any state changes that occur. Make implicit assumptions explicit.

- **Error Handling**: Define all possible error conditions, their causes, and how they're communicated to the caller. Specify whether errors are recoverable and what actions callers should take.

- **Preconditions and Postconditions**: State what must be true before calling the component and what will be true after the call completes successfully.

- **Immutability Guarantees**: Specify whether inputs will be modified and whether outputs can be safely modified by callers.

These contracts should be:
- **Verifiable**: Enforceable through type systems, runtime checks, or testing
- **Stable**: Changes should be backward-compatible or follow explicit versioning protocols
- **Complete**: Cover all aspects necessary for safe usage without requiring implementation knowledge

Contracts may be relaxed when:
- Rapid prototyping requires flexibility over stability
- Internal APIs within a single module where coupling is acceptable
- Performance-critical code where contract overhead is prohibitive (with explicit documentation)

## Practical Implementation

1. **Use Strong Type Systems**: Leverage static typing to encode as many contract details as possible directly in the code. This makes contracts machine-checkable and provides immediate feedback during development.

2. **Document Behavioral Contracts**: Use standardized documentation formats (JSDoc, Rust docs, Go docs) to specify behavior that can't be captured in types. Include examples of correct usage and common pitfalls.

3. **Implement Runtime Validation**: Add runtime checks for contract violations, especially at system boundaries. Use assertion libraries or validation frameworks to verify inputs and outputs match expectations.

4. **Create Contract Tests**: Write tests that specifically verify contract compliance rather than implementation details. These tests should fail if the contract is violated, regardless of whether the implementation "works."

5. **Version Your Contracts**: When contracts must change, use semantic versioning and deprecation strategies to manage the transition. Provide clear migration paths for existing consumers.

## Examples

```typescript
// ❌ BAD: Vague interface with unclear contract
interface UserService {
  getUser(id: any): any;
  updateUser(id: any, data: any): any;
}

// No clear contract about:
// - What types are expected
// - What happens with invalid IDs
// - What fields can be updated
// - What errors might occur
// - Whether the user object is modified

// ✅ GOOD: Explicit contract with clear specifications
interface UserData {
  readonly id: string;
  name: string;
  email: string;
  readonly createdAt: Date;
  lastLoginAt: Date | null;
}

interface UpdateUserRequest {
  name?: string;
  email?: string;
}

interface UserNotFoundError {
  type: 'USER_NOT_FOUND';
  userId: string;
}

interface ValidationError {
  type: 'VALIDATION_ERROR';
  field: string;
  message: string;
}

type UserServiceError = UserNotFoundError | ValidationError;

/**
 * User management service with explicit behavioral contracts
 */
interface UserService {
  /**
   * Retrieves a user by their unique identifier
   *
   * @param id - Valid user UUID string
   * @returns Promise resolving to UserData if found
   * @throws UserNotFoundError if user doesn't exist
   * @throws ValidationError if id format is invalid
   *
   * Contract guarantees:
   * - Returned user data is immutable (readonly fields)
   * - User ID in result matches requested ID
   * - All required fields are populated
   * - No side effects occur
   */
  getUser(id: string): Promise<UserData>;

  /**
   * Updates specified user fields
   *
   * @param id - Valid user UUID string
   * @param updates - Partial user data with only updatable fields
   * @returns Promise resolving to updated UserData
   * @throws UserNotFoundError if user doesn't exist
   * @throws ValidationError if updates are invalid
   *
   * Contract guarantees:
   * - Only provided fields are modified
   * - Readonly fields (id, createdAt) are never changed
   * - Email uniqueness is enforced
   * - Original user object is not modified (immutable operation)
   * - lastLoginAt is not affected by this operation
   */
  updateUser(id: string, updates: UpdateUserRequest): Promise<UserData>;
}
```

```python
# ❌ BAD: Function with unclear contract
def process_payment(amount, user_id, payment_method):
    # Unclear what happens with:
    # - Negative amounts
    # - Invalid user IDs
    # - Unsupported payment methods
    # - Network failures
    # - Insufficient funds
    pass

# ✅ GOOD: Function with explicit contract
from typing import Union, Dict, Any
from dataclasses import dataclass
from enum import Enum

class PaymentStatus(Enum):
    SUCCESS = "success"
    INSUFFICIENT_FUNDS = "insufficient_funds"
    INVALID_METHOD = "invalid_method"
    NETWORK_ERROR = "network_error"
    USER_NOT_FOUND = "user_not_found"

@dataclass(frozen=True)
class PaymentResult:
    """
    Immutable result of payment processing

    Contract:
    - status: Always present, indicates outcome
    - transaction_id: Present only when status is SUCCESS
    - error_message: Present only when status is not SUCCESS
    - amount_charged: Actual amount charged (may differ from requested)
    """
    status: PaymentStatus
    transaction_id: str | None = None
    error_message: str | None = None
    amount_charged: float = 0.0

def process_payment(
    amount: float,
    user_id: str,
    payment_method: str
) -> PaymentResult:
    """
    Process a payment for a user

    Args:
        amount: Payment amount in USD (must be > 0.01 and < 10000.00)
        user_id: Valid user UUID string (36 characters)
        payment_method: Payment method ID ("card_xxx" or "bank_xxx")

    Returns:
        PaymentResult with status and details

    Behavioral Contract:
        - Validates all inputs before processing
        - Charges payment method atomically
        - Records transaction in audit log
        - Sends confirmation email on success
        - Never charges more than requested amount
        - Idempotent for same transaction within 1 hour
        - Completes within 30 seconds or times out

    Error Conditions:
        - amount <= 0.01 or > 10000.00: Returns INVALID_AMOUNT
        - user_id invalid format: Returns USER_NOT_FOUND
        - payment_method not found: Returns INVALID_METHOD
        - insufficient balance: Returns INSUFFICIENT_FUNDS
        - network timeout: Returns NETWORK_ERROR

    Side Effects:
        - Creates transaction record in database
        - Charges external payment processor
        - Sends email notification on success
        - Logs all attempts for audit

    Preconditions:
        - User must exist and be active
        - Payment method must be verified
        - System must be within rate limits

    Postconditions (on success):
        - User balance reduced by exact amount
        - Transaction record exists with COMPLETED status
        - Confirmation email queued for delivery
        - Audit log contains processing details
    """
    # Implementation validates contract...
    if amount <= 0.01 or amount > 10000.00:
        return PaymentResult(
            status=PaymentStatus.INVALID_AMOUNT,
            error_message=f"Amount {amount} outside valid range (0.01-10000.00)"
        )

    # ... rest of implementation
```

```go
// ❌ BAD: Interface with unclear contract
type DataProcessor interface {
    Process(data interface{}) interface{}
}

// ✅ GOOD: Interface with explicit contract and types
package processing

import (
    "context"
    "time"
)

// ProcessingResult represents the outcome of data processing
type ProcessingResult struct {
    ProcessedRecords int           `json:"processed_records"`
    SkippedRecords   int           `json:"skipped_records"`
    Errors           []ProcessingError `json:"errors,omitempty"`
    Duration         time.Duration  `json:"duration"`
    ProcessedAt      time.Time      `json:"processed_at"`
}

// ProcessingError represents a specific processing failure
type ProcessingError struct {
    RecordIndex int    `json:"record_index"`
    Field       string `json:"field"`
    Message     string `json:"message"`
    Code        string `json:"code"`
}

// ProcessingOptions configures processing behavior
type ProcessingOptions struct {
    MaxErrors        int           `json:"max_errors"`         // Stop after this many errors (0 = no limit)
    Timeout         time.Duration `json:"timeout"`            // Maximum processing time
    SkipInvalidRows bool          `json:"skip_invalid_rows"`  // Continue on validation errors
    BatchSize       int           `json:"batch_size"`         // Records per batch (default: 100)
}

// DataRecord represents a single record to process
type DataRecord map[string]interface{}

// DataProcessor defines the contract for processing data records
type DataProcessor interface {
    // ProcessBatch processes a batch of records according to the specified options
    //
    // Contract:
    //   Input:
    //     - ctx: Context for cancellation and timeouts (required)
    //     - records: Slice of data records (must not be nil, can be empty)
    //     - opts: Processing options (uses defaults if nil)
    //
    //   Output:
    //     - ProcessingResult: Always returned, never nil
    //     - error: Returned only for system-level failures
    //
    //   Behavior:
    //     - Processes records in order
    //     - Stops early if MaxErrors exceeded
    //     - Respects context cancellation
    //     - Never modifies input records
    //     - Individual record failures don't cause system error
    //
    //   Error Conditions:
    //     - System error: Database connection lost, out of memory
    //     - Context cancelled: Returns context.Canceled
    //     - Timeout exceeded: Returns context.DeadlineExceeded
    //     - Invalid options: Returns ErrInvalidOptions
    //
    //   Guarantees:
    //     - All processed records are committed atomically per batch
    //     - No partial batches are committed on error
    //     - ProcessedRecords + SkippedRecords = len(input records)
    //     - Duration reflects actual processing time
    //     - Thread-safe for concurrent calls
    ProcessBatch(
        ctx context.Context,
        records []DataRecord,
        opts *ProcessingOptions,
    ) (ProcessingResult, error)

    // ValidateRecord checks if a record meets processing requirements
    //
    // Contract:
    //   - Pure function with no side effects
    //   - Returns nil if record is valid
    //   - Returns ProcessingError describing first validation failure
    //   - Never modifies the input record
    //   - Deterministic: same input always produces same result
    ValidateRecord(record DataRecord) *ProcessingError
}
```

```rust
// ❌ BAD: Function with unclear error handling contract
fn parse_config_file(path: &str) -> Option<Config> {
    // Unclear what None means:
    // - File not found?
    // - Invalid format?
    // - Permission denied?
    // - Empty file?
    unimplemented!()
}

// ✅ GOOD: Explicit error contract with Result types
use std::fs;
use std::io;
use thiserror::Error;
use serde::Deserialize;

#[derive(Debug, Error)]
pub enum ConfigError {
    #[error("Configuration file not found: {path}")]
    FileNotFound { path: String },

    #[error("Permission denied reading config file: {path}")]
    PermissionDenied { path: String },

    #[error("Invalid configuration format: {message}")]
    InvalidFormat { message: String },

    #[error("Required field missing: {field}")]
    MissingField { field: String },

    #[error("IO error reading config: {source}")]
    IoError { source: io::Error },
}

#[derive(Debug, Deserialize, Clone)]
pub struct Config {
    pub database_url: String,
    pub api_key: String,
    pub port: u16,
    pub debug: bool,
}

/// Parses configuration from a file with explicit error contract
///
/// # Arguments
/// * `path` - File system path to configuration file (must be UTF-8)
///
/// # Returns
/// * `Ok(Config)` - Successfully parsed configuration
/// * `Err(ConfigError)` - Specific error type indicating failure reason
///
/// # Contract
///
/// ## Behavior
/// - Reads entire file into memory (suitable for files < 1MB)
/// - Parses as TOML format
/// - Validates all required fields are present
/// - Does not modify file system state
/// - Thread-safe and can be called concurrently
///
/// ## Error Conditions
/// - `FileNotFound`: File doesn't exist at specified path
/// - `PermissionDenied`: Process lacks read permissions
/// - `InvalidFormat`: File exists but isn't valid TOML
/// - `MissingField`: Required configuration field is absent
/// - `IoError`: Other I/O error (disk full, network drive unavailable, etc.)
///
/// ## Preconditions
/// - `path` must be valid UTF-8 string
/// - Process must have file system access
///
/// ## Postconditions
/// - On success: returned Config contains all required fields
/// - On error: file system state unchanged
/// - No resources are leaked (files automatically closed)
///
/// # Examples
/// ```
/// use my_app::config::parse_config_file;
///
/// match parse_config_file("config.toml") {
///     Ok(config) => println!("Database URL: {}", config.database_url),
///     Err(ConfigError::FileNotFound { path }) => {
///         eprintln!("Config file not found: {}", path);
///         std::process::exit(1);
///     },
///     Err(error) => {
///         eprintln!("Configuration error: {}", error);
///         std::process::exit(1);
///     }
/// }
/// ```
pub fn parse_config_file(path: &str) -> Result<Config, ConfigError> {
    // Read file with explicit error mapping
    let content = fs::read_to_string(path)
        .map_err(|error| match error.kind() {
            io::ErrorKind::NotFound => ConfigError::FileNotFound {
                path: path.to_string(),
            },
            io::ErrorKind::PermissionDenied => ConfigError::PermissionDenied {
                path: path.to_string(),
            },
            _ => ConfigError::IoError { source: error },
        })?;

    // Parse TOML with explicit format error handling
    let config: Config = toml::from_str(&content)
        .map_err(|error| ConfigError::InvalidFormat {
            message: error.to_string(),
        })?;

    // Validate required fields
    if config.database_url.is_empty() {
        return Err(ConfigError::MissingField {
            field: "database_url".to_string(),
        });
    }

    if config.api_key.is_empty() {
        return Err(ConfigError::MissingField {
            field: "api_key".to_string(),
        });
    }

    Ok(config)
}
```

## Related Bindings

- [component-isolation.md](../../docs/bindings/core/component-isolation.md): Interface contracts enable component isolation by providing the communication mechanism between isolated components. Well-defined contracts allow components to interact without breaking isolation principles.

- [api-design.md](../../docs/bindings/core/api-design.md): API design principles apply to interface contracts at all levels. Both bindings focus on creating clear, stable interfaces that enable predictable interactions between system components.

- [dependency-inversion.md](../../docs/bindings/core/dependency-inversion.md): Interface contracts are the foundation for dependency inversion. Abstract interfaces define contracts that multiple concrete implementations can fulfill, enabling flexible and testable designs.

- [no-internal-mocking.md](../../docs/bindings/core/no-internal-mocking.md): Clear interface contracts reduce the need for complex mocking by making component boundaries and expectations explicit. Well-contracted interfaces are easier to test with simple test doubles or real implementations.
