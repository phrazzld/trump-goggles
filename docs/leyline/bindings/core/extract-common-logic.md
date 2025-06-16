---
id: extract-common-logic
last_modified: '2025-06-02'
version: '0.1.0'
derived_from: dry-dont-repeat-yourself
enforced_by: 'Code review, static analysis, refactoring tools'
---
# Binding: Extract and Centralize Common Logic

Identify recurring patterns, algorithms, and business rules in your codebase and extract them into reusable abstractions. This creates a single authoritative implementation that can be maintained, tested, and evolved in one place rather than scattered across multiple locations.

## Rationale

This binding directly implements our DRY tenet by eliminating knowledge duplication at the code level. When the same logic appears in multiple places, it represents duplicated knowledge about how to solve a particular problem. This duplication creates maintenance burden because changes to the logic must be applied consistently across all instances, and bugs must be fixed in multiple locations.

Think of common logic extraction like creating a recipe book for your kitchen. Instead of writing cooking instructions on sticky notes scattered throughout your kitchen, you create a central recipe collection where each technique is documented once. When you improve a recipe or fix a mistake, you only need to update it in one place, and everyone using the recipe gets the benefit immediately. Similarly, extracting common logic creates a single source of truth for each piece of business knowledge.

The alternative—allowing logic duplication—creates a maintenance nightmare where the same bug can exist in multiple places, improvements benefit only some users of the logic, and the codebase becomes inconsistent over time. Each duplicated piece of logic represents a potential divergence point where implementations may slowly drift apart, leading to subtle bugs and inconsistent behavior across the system.

## Rule Definition

Common logic extraction must follow these identification and implementation principles:

- **Identify True Duplication**: Distinguish between similar-looking code that serves different purposes and genuine duplication of the same knowledge or algorithm. Only extract logic when it represents the same conceptual operation.

- **Extract at the Right Level**: Choose the appropriate abstraction level for extraction—function, class, module, or service—based on the scope and complexity of the duplicated logic.

- **Maintain Single Responsibility**: Extracted logic should have a single, clear purpose and not combine unrelated operations just because they happen to be used together.

- **Preserve Interface Clarity**: Create clear, well-documented interfaces for extracted logic that make the intended usage obvious and prevent misuse.

- **Handle Variations Explicitly**: When logic has slight variations across use cases, design the extraction to handle these variations through parameters or strategy patterns rather than duplicating the core logic.

**Extraction Candidates:**
- Business rules and validation logic
- Data transformation and formatting algorithms
- Mathematical calculations and formulas
- String manipulation and parsing routines
- Configuration and setup procedures
- Error handling and recovery logic

**When NOT to Extract:**
- Code that coincidentally looks similar but serves different business purposes
- Logic that is likely to diverge in the future due to different evolution paths
- Simple operations where the extraction would be more complex than the duplication
- Platform-specific code that cannot be shared across environments

## Practical Implementation

1. **Use the Rule of Three**: Before extracting logic, wait until you see the same pattern implemented at least three times. This ensures you understand the common aspects and variations before creating an abstraction.

2. **Start with Pure Functions**: Begin extractions with pure functions that take inputs and return outputs without side effects. These are the easiest to extract, test, and reuse safely across different contexts.

3. **Create Domain-Specific Utilities**: Organize extracted logic into domain-specific utility modules rather than generic "utils" collections. This makes the extracted logic more discoverable and maintainable.

4. **Use Configuration for Variations**: When logic has slight variations, use configuration objects or strategy patterns to handle the differences rather than creating multiple similar functions.

5. **Document Usage Patterns**: Provide clear documentation and examples showing how to use extracted logic correctly, including common pitfalls and edge cases.

## Examples

```typescript
// ❌ BAD: Duplicated validation logic across multiple components
class UserRegistrationForm {
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  validatePassword(password: string): boolean {
    return password.length >= 8 &&
           /[A-Z]/.test(password) &&
           /[a-z]/.test(password) &&
           /[0-9]/.test(password);
  }
}

class UserProfileForm {
  validateEmail(email: string): boolean {
    // Same logic duplicated with slight variation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 255; // Different length!
  }

  validatePassword(password: string): boolean {
    // Same logic duplicated
    return password.length >= 8 &&
           /[A-Z]/.test(password) &&
           /[a-z]/.test(password) &&
           /[0-9]/.test(password);
  }
}

class AdminUserForm {
  validateEmail(email: string): boolean {
    // Same logic duplicated again
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  // Password validation omitted - inconsistent behavior!
}

// ✅ GOOD: Extracted and centralized validation logic
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class ValidationError extends Error {
  constructor(public field: string, public violations: string[]) {
    super(`Validation failed for ${field}: ${violations.join(', ')}`);
  }
}

// Single source of truth for email validation
export class EmailValidator {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private static readonly MAX_LENGTH = 254; // RFC 5321 standard

  static validate(email: string): ValidationResult {
    const errors: string[] = [];

    if (!email) {
      errors.push('Email is required');
      return { isValid: false, errors };
    }

    if (!this.EMAIL_REGEX.test(email)) {
      errors.push('Email format is invalid');
    }

    if (email.length > this.MAX_LENGTH) {
      errors.push(`Email must not exceed ${this.MAX_LENGTH} characters`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateOrThrow(email: string): void {
    const result = this.validate(email);
    if (!result.isValid) {
      throw new ValidationError('email', result.errors);
    }
  }
}

// Single source of truth for password validation
export interface PasswordRequirements {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
}

export class PasswordValidator {
  private static readonly DEFAULT_REQUIREMENTS: PasswordRequirements = {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false
  };

  static validate(
    password: string,
    requirements: PasswordRequirements = this.DEFAULT_REQUIREMENTS
  ): ValidationResult {
    const errors: string[] = [];

    if (!password) {
      errors.push('Password is required');
      return { isValid: false, errors };
    }

    if (password.length < requirements.minLength) {
      errors.push(`Password must be at least ${requirements.minLength} characters`);
    }

    if (requirements.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (requirements.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (requirements.requireNumbers && !/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (requirements.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Usage in forms is now consistent and maintainable
class UserRegistrationForm {
  validateForm(data: { email: string; password: string }): ValidationResult {
    const emailResult = EmailValidator.validate(data.email);
    const passwordResult = PasswordValidator.validate(data.password);

    return {
      isValid: emailResult.isValid && passwordResult.isValid,
      errors: [...emailResult.errors, ...passwordResult.errors]
    };
  }
}

class UserProfileForm {
  validateForm(data: { email: string; password?: string }): ValidationResult {
    const emailResult = EmailValidator.validate(data.email);

    // Password validation only if provided
    const passwordResult = data.password
      ? PasswordValidator.validate(data.password)
      : { isValid: true, errors: [] };

    return {
      isValid: emailResult.isValid && passwordResult.isValid,
      errors: [...emailResult.errors, ...passwordResult.errors]
    };
  }
}
```

```python
# ❌ BAD: Duplicated data processing logic
def process_user_data(user_dict):
    # Data cleaning and transformation duplicated in multiple places
    cleaned_data = {}

    # Name processing
    if 'name' in user_dict:
        cleaned_data['name'] = user_dict['name'].strip().title()

    # Email processing
    if 'email' in user_dict:
        cleaned_data['email'] = user_dict['email'].strip().lower()

    # Phone processing
    if 'phone' in user_dict:
        phone = re.sub(r'[^\d]', '', user_dict['phone'])
        if len(phone) == 10:
            cleaned_data['phone'] = f'({phone[:3]}) {phone[3:6]}-{phone[6:]}'

    return cleaned_data

def process_customer_data(customer_dict):
    # Same logic duplicated with slight variations
    cleaned_data = {}

    # Name processing (same)
    if 'full_name' in customer_dict:  # Different field name
        cleaned_data['full_name'] = customer_dict['full_name'].strip().title()

    # Email processing (same)
    if 'email_address' in customer_dict:  # Different field name
        cleaned_data['email_address'] = customer_dict['email_address'].strip().lower()

    # Phone processing (different format)
    if 'phone_number' in customer_dict:
        phone = re.sub(r'[^\d]', '', customer_dict['phone_number'])
        if len(phone) == 10:
            cleaned_data['phone_number'] = f'{phone[:3]}-{phone[3:6]}-{phone[6:]}'  # Different format

    return cleaned_data

# ✅ GOOD: Extracted and configurable data processing logic
from typing import Dict, Any, Optional, Callable
from dataclasses import dataclass
import re

@dataclass
class FieldProcessor:
    """Configuration for processing a single field"""
    source_field: str
    target_field: Optional[str] = None
    processor: Optional[Callable[[str], str]] = None
    required: bool = False
    default_value: Any = None

    def get_target_field(self) -> str:
        return self.target_field or self.source_field

# Single source of truth for common data transformations
class DataTransformers:
    @staticmethod
    def normalize_name(name: str) -> str:
        """Normalize person names to title case"""
        return name.strip().title()

    @staticmethod
    def normalize_email(email: str) -> str:
        """Normalize email addresses to lowercase"""
        return email.strip().lower()

    @staticmethod
    def format_phone_standard(phone: str) -> str:
        """Format 10-digit phone number as (XXX) XXX-XXXX"""
        digits = re.sub(r'[^\d]', '', phone)
        if len(digits) != 10:
            raise ValueError(f"Phone number must have 10 digits, got {len(digits)}")
        return f'({digits[:3]}) {digits[3:6]}-{digits[6:]}'

    @staticmethod
    def format_phone_dashes(phone: str) -> str:
        """Format 10-digit phone number as XXX-XXX-XXXX"""
        digits = re.sub(r'[^\d]', '', phone)
        if len(digits) != 10:
            raise ValueError(f"Phone number must have 10 digits, got {len(digits)}")
        return f'{digits[:3]}-{digits[3:6]}-{digits[6:]}'

class DataProcessor:
    """Configurable data processor that eliminates logic duplication"""

    def __init__(self, field_processors: list[FieldProcessor]):
        self.field_processors = field_processors

    def process(self, data: Dict[str, Any]) -> Dict[str, Any]:
        result = {}

        for processor in self.field_processors:
            try:
                # Get source value
                if processor.source_field in data:
                    value = data[processor.source_field]

                    # Apply transformation if configured
                    if processor.processor and value is not None:
                        if isinstance(value, str):
                            value = processor.processor(value)

                    result[processor.get_target_field()] = value

                elif processor.required:
                    raise ValueError(f"Required field '{processor.source_field}' is missing")

                elif processor.default_value is not None:
                    result[processor.get_target_field()] = processor.default_value

            except Exception as e:
                raise ValueError(f"Error processing field '{processor.source_field}': {str(e)}")

        return result

# Configuration-driven processing eliminates duplication
class UserDataProcessor:
    processor = DataProcessor([
        FieldProcessor('name', processor=DataTransformers.normalize_name, required=True),
        FieldProcessor('email', processor=DataTransformers.normalize_email, required=True),
        FieldProcessor('phone', processor=DataTransformers.format_phone_standard),
        FieldProcessor('bio', default_value=''),
    ])

    @classmethod
    def process(cls, user_data: Dict[str, Any]) -> Dict[str, Any]:
        return cls.processor.process(user_data)

class CustomerDataProcessor:
    processor = DataProcessor([
        FieldProcessor('full_name', 'name', DataTransformers.normalize_name, required=True),
        FieldProcessor('email_address', 'email', DataTransformers.normalize_email, required=True),
        FieldProcessor('phone_number', 'phone', DataTransformers.format_phone_dashes),
        FieldProcessor('company', default_value='Individual'),
    ])

    @classmethod
    def process(cls, customer_data: Dict[str, Any]) -> Dict[str, Any]:
        return cls.processor.process(customer_data)

# Usage is now consistent and configurable
user_data = {
    'name': '  john doe  ',
    'email': '  JOHN@EXAMPLE.COM  ',
    'phone': '555-123-4567'
}

customer_data = {
    'full_name': '  jane smith  ',
    'email_address': '  JANE@COMPANY.COM  ',
    'phone_number': '(555) 987-6543'
}

processed_user = UserDataProcessor.process(user_data)
# {'name': 'John Doe', 'email': 'john@example.com', 'phone': '(555) 123-4567', 'bio': ''}

processed_customer = CustomerDataProcessor.process(customer_data)
# {'name': 'Jane Smith', 'email': 'jane@company.com', 'phone': '555-987-6543', 'company': 'Individual'}
```

```go
// ❌ BAD: Duplicated HTTP response handling logic
func HandleUserCreate(w http.ResponseWriter, r *http.Request) {
    // Duplicated error response logic
    if r.Method != "POST" {
        w.Header().Set("Content-Type", "application/json")
        w.WriteHeader(http.StatusMethodNotAllowed)
        json.NewEncoder(w).Encode(map[string]string{
            "error": "Method not allowed",
            "message": "Only POST requests are accepted",
        })
        return
    }

    // Duplicated JSON parsing error handling
    var user User
    if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
        w.Header().Set("Content-Type", "application/json")
        w.WriteHeader(http.StatusBadRequest)
        json.NewEncoder(w).Encode(map[string]string{
            "error": "Invalid JSON",
            "message": err.Error(),
        })
        return
    }

    // Business logic...
    createdUser, err := userService.Create(user)
    if err != nil {
        // Duplicated error response logic
        w.Header().Set("Content-Type", "application/json")
        w.WriteHeader(http.StatusInternalServerError)
        json.NewEncoder(w).Encode(map[string]string{
            "error": "Internal server error",
            "message": "Failed to create user",
        })
        return
    }

    // Duplicated success response logic
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(createdUser)
}

func HandleProductCreate(w http.ResponseWriter, r *http.Request) {
    // Same error handling logic duplicated
    if r.Method != "POST" {
        w.Header().Set("Content-Type", "application/json")
        w.WriteHeader(http.StatusMethodNotAllowed)
        json.NewEncoder(w).Encode(map[string]string{
            "error": "Method not allowed",
            "message": "Only POST requests are accepted",
        })
        return
    }

    // Same JSON parsing logic duplicated
    var product Product
    if err := json.NewDecoder(r.Body).Decode(&product); err != nil {
        w.Header().Set("Content-Type", "application/json")
        w.WriteHeader(http.StatusBadRequest)
        json.NewEncoder(w).Encode(map[string]string{
            "error": "Invalid JSON",
            "message": err.Error(),
        })
        return
    }

    // Business logic...
    createdProduct, err := productService.Create(product)
    if err != nil {
        // Same error handling duplicated
        w.Header().Set("Content-Type", "application/json")
        w.WriteHeader(http.StatusInternalServerError)
        json.NewEncoder(w).Encode(map[string]string{
            "error": "Internal server error",
            "message": "Failed to create product", // Slightly different message
        })
        return
    }

    // Same success response logic
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(createdProduct)
}

// ✅ GOOD: Extracted HTTP response handling utilities
package httputil

import (
    "encoding/json"
    "fmt"
    "net/http"
)

// Single source of truth for error response structure
type ErrorResponse struct {
    Error   string `json:"error"`
    Message string `json:"message"`
    Code    string `json:"code,omitempty"`
}

// Single source of truth for HTTP response utilities
type ResponseWriter struct {
    w http.ResponseWriter
}

func NewResponseWriter(w http.ResponseWriter) *ResponseWriter {
    return &ResponseWriter{w: w}
}

func (rw *ResponseWriter) JSON(statusCode int, data interface{}) {
    rw.w.Header().Set("Content-Type", "application/json")
    rw.w.WriteHeader(statusCode)
    json.NewEncoder(rw.w).Encode(data)
}

func (rw *ResponseWriter) Error(statusCode int, err string, message string) {
    rw.JSON(statusCode, ErrorResponse{
        Error:   err,
        Message: message,
    })
}

func (rw *ResponseWriter) ErrorWithCode(statusCode int, err string, message string, code string) {
    rw.JSON(statusCode, ErrorResponse{
        Error:   err,
        Message: message,
        Code:    code,
    })
}

func (rw *ResponseWriter) BadRequest(message string) {
    rw.Error(http.StatusBadRequest, "Bad Request", message)
}

func (rw *ResponseWriter) MethodNotAllowed(allowedMethods ...string) {
    message := "Method not allowed"
    if len(allowedMethods) > 0 {
        message = fmt.Sprintf("Only %v methods are allowed", allowedMethods)
    }
    rw.Error(http.StatusMethodNotAllowed, "Method Not Allowed", message)
}

func (rw *ResponseWriter) InternalServerError(message string) {
    rw.Error(http.StatusInternalServerError, "Internal Server Error", message)
}

func (rw *ResponseWriter) Created(data interface{}) {
    rw.JSON(http.StatusCreated, data)
}

// Single source of truth for request parsing utilities
type RequestParser struct {
    r *http.Request
}

func NewRequestParser(r *http.Request) *RequestParser {
    return &RequestParser{r: r}
}

func (rp *RequestParser) RequireMethod(method string) error {
    if rp.r.Method != method {
        return fmt.Errorf("method %s not allowed, expected %s", rp.r.Method, method)
    }
    return nil
}

func (rp *RequestParser) DecodeJSON(v interface{}) error {
    if err := json.NewDecoder(rp.r.Body).Decode(v); err != nil {
        return fmt.Errorf("invalid JSON: %w", err)
    }
    return nil
}

// Extracted handler wrapper that eliminates common duplication
type HandlerFunc func(*ResponseWriter, *RequestParser) error

func (h HandlerFunc) ServeHTTP(w http.ResponseWriter, r *http.Request) {
    rw := NewResponseWriter(w)
    rp := NewRequestParser(r)

    if err := h(rw, rp); err != nil {
        // Centralized error handling
        switch e := err.(type) {
        case *ValidationError:
            rw.BadRequest(e.Error())
        case *BusinessError:
            rw.ErrorWithCode(http.StatusBadRequest, "Business Rule Violation", e.Error(), e.Code)
        default:
            rw.InternalServerError("An unexpected error occurred")
        }
    }
}

// Usage eliminates duplication and ensures consistency
func HandleUserCreate(rw *ResponseWriter, rp *RequestParser) error {
    // Method validation - no duplication
    if err := rp.RequireMethod("POST"); err != nil {
        rw.MethodNotAllowed("POST")
        return nil
    }

    // JSON parsing - no duplication
    var user User
    if err := rp.DecodeJSON(&user); err != nil {
        rw.BadRequest(err.Error())
        return nil
    }

    // Business logic
    createdUser, err := userService.Create(user)
    if err != nil {
        return err // Handled by wrapper
    }

    // Success response - no duplication
    rw.Created(createdUser)
    return nil
}

func HandleProductCreate(rw *ResponseWriter, rp *RequestParser) error {
    // Same pattern, no duplication
    if err := rp.RequireMethod("POST"); err != nil {
        rw.MethodNotAllowed("POST")
        return nil
    }

    var product Product
    if err := rp.DecodeJSON(&product); err != nil {
        rw.BadRequest(err.Error())
        return nil
    }

    createdProduct, err := productService.Create(product)
    if err != nil {
        return err
    }

    rw.Created(createdProduct)
    return nil
}

// Wire up handlers with consistent error handling
func main() {
    http.Handle("/users", HandlerFunc(HandleUserCreate))
    http.Handle("/products", HandlerFunc(HandleProductCreate))
    http.ListenAndServe(":8080", nil)
}
```

## Related Bindings

- [centralized-configuration.md](../../docs/bindings/core/centralized-configuration.md): Both bindings eliminate duplication, but common logic extraction focuses on behavioral duplication while centralized configuration addresses data and settings duplication. They work together to create comprehensive DRY adherence across your codebase.

- [pure-functions.md](../../docs/bindings/core/pure-functions.md): Pure functions are ideal candidates for common logic extraction because they have no side effects and can be safely reused across different contexts. The predictability of pure functions makes them easier to extract and test.

- [component-isolation.md](../../docs/bindings/core/component-isolation.md): Extracted common logic should be designed as isolated components that can be used independently. This makes the extracted logic more reliable and easier to maintain across different use cases.

- [interface-contracts.md](../../docs/bindings/core/interface-contracts.md): When extracting common logic, establish clear interface contracts that define exactly how the logic should be used. This prevents misuse and ensures that the extracted logic serves its intended purpose consistently.
