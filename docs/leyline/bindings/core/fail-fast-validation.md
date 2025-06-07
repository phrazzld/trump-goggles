---
id: fail-fast-validation
last_modified: '2025-06-03'
derived_from: explicit-over-implicit
enforced_by: 'static analysis tools & runtime assertions'
---

# Binding: Validate Inputs and Fail Fast When Preconditions Fail

Immediately validate all inputs and assumptions at function entry points, failing with clear error messages when expectations aren't met. Prevent invalid data from propagating through the system by catching violations as early as possible in the execution flow.

## Rationale

This binding implements our explicit-over-implicit tenet by making function assumptions and constraints visible through immediate validation rather than allowing them to remain hidden and cause mysterious failures later. When you validate preconditions at entry points, you make the function's requirements explicit to both callers and maintainers, creating self-documenting code that clearly states what it expects and what it guarantees.

Think of fail-fast validation like a security checkpoint that thoroughly inspects everything entering a secure facility. Just as allowing unauthorized items past the checkpoint could compromise the entire facility later, allowing invalid data past your function's entry point can corrupt your system's state in subtle, hard-to-diagnose ways. By establishing clear validation at these boundaries, you contain problems at their source and make debugging dramatically easier.

The principle "dead programs tell no lies" is fundamental here—a program that crashes immediately when something is wrong is infinitely more reliable than one that continues with invalid data and produces corrupt results. When your functions fail fast with clear error messages, you eliminate entire categories of bugs that would otherwise manifest as mysterious behavior deep in your application logic. This approach transforms silent corruption into loud, immediate feedback that guides developers to the actual source of problems.

## Rule Definition

This binding establishes comprehensive guidelines for input validation and precondition checking:

- **Mandatory Validation Points**: All functions must validate their inputs at entry:
  - **Parameter Validation**: Check type, range, format, and business rule compliance
  - **State Validation**: Verify object state preconditions before proceeding
  - **Resource Validation**: Confirm required resources exist and are accessible
  - **Contract Validation**: Ensure calling context meets function's assumptions

- **Validation Requirements**: Each validation must be:
  - **Immediate**: Performed before any other logic or side effects
  - **Complete**: Cover all assumptions the function makes about its inputs
  - **Explicit**: State exactly what constraint was violated
  - **Actionable**: Provide information needed to fix the problem

- **Error Handling Standards**:
  - **Clear Messages**: Describe what was expected vs. what was received
  - **Context Information**: Include relevant parameter values and constraints
  - **Consistent Format**: Use standardized error structures across the codebase
  - **Appropriate Exceptions**: Choose exception types that reflect the violation category

- **Validation Scope**: Apply validation to:
  - Public API entry points (always)
  - Internal function boundaries (when assumptions change)
  - Data transformation points (before and after critical operations)
  - External system interfaces (network, file system, database interactions)

- **Performance Considerations**: Balance validation thoroughness with performance:
  - Use compile-time checking where possible (type systems, static analysis)
  - Cache expensive validations when inputs haven't changed
  - Provide debug vs. production validation levels for performance-critical paths
  - Document any validation shortcuts taken for performance reasons

## Practical Implementation

Here are concrete strategies for implementing comprehensive fail-fast validation:

1. **Establish Input Validation Patterns**: Create consistent patterns for validating different types of inputs. Use guard clauses at the beginning of functions to check preconditions before proceeding with business logic. Establish conventions for parameter checking that make violations immediately obvious. Create validation utilities that can be reused across similar input types to maintain consistency.

2. **Implement Type-Safe Validation**: Leverage your language's type system to catch as many constraint violations as possible at compile time. Use strong typing, enums, and custom types to encode business rules directly in the type system. When runtime validation is necessary, make it complement rather than duplicate compile-time checks. Design APIs that make invalid states unrepresentable when possible.

3. **Create Domain-Specific Validators**: Build validation functions that understand your business domain and can check not just format but semantic correctness. Create validators for common business entities like email addresses, phone numbers, IDs, monetary amounts, and dates that understand your specific constraints and edge cases. Make these validators reusable and testable as independent units.

4. **Design Error Messages for Developers**: Write error messages that help developers understand what went wrong and how to fix it. Include the actual value that caused the failure, the constraint that was violated, and suggestions for resolution when possible. Make error messages consistent in format so developers can quickly scan and understand validation failures. Consider including documentation links for complex business rules.

5. **Use Assertion Libraries Effectively**: Choose assertion libraries that provide clear, readable validation code and helpful error messages. Use assertions that read like natural language descriptions of your constraints. Prefer assertion libraries that provide detailed failure information over simple boolean checks. Consider using assertion libraries that can be configured for different environments (development vs. production).

6. **Implement Graceful Degradation Boundaries**: While failing fast is crucial, establish clear boundaries where validation failures should result in graceful degradation rather than complete system failure. Design error propagation strategies that prevent cascading failures while still maintaining data integrity. Create mechanisms for isolating validation failures to prevent them from affecting unrelated system components.

## Examples

```typescript
// ❌ BAD: No input validation, silent failures propagate
function calculateMonthlyPayment(principal, interestRate, termMonths) {
  // No validation - invalid inputs cause mysterious results
  const monthlyRate = interestRate / 12;
  const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
                  (Math.pow(1 + monthlyRate, termMonths) - 1);
  return payment;
}

// Results in mysterious behavior:
calculateMonthlyPayment(-1000, 0.05, 360);     // Negative payment
calculateMonthlyPayment(100000, -0.02, 360);   // NaN result
calculateMonthlyPayment(100000, 0.05, 0);      // Division by zero

// ✅ GOOD: Comprehensive input validation with clear error messages
function calculateMonthlyPayment(principal: number, interestRate: number, termMonths: number): number {
  // Validate principal amount
  if (typeof principal !== 'number' || !isFinite(principal)) {
    throw new Error(`Principal must be a finite number, received: ${principal}`);
  }
  if (principal <= 0) {
    throw new Error(`Principal must be positive, received: ${principal}`);
  }
  if (principal > 10_000_000) {
    throw new Error(`Principal exceeds maximum allowed (10M), received: ${principal}`);
  }

  // Validate interest rate
  if (typeof interestRate !== 'number' || !isFinite(interestRate)) {
    throw new Error(`Interest rate must be a finite number, received: ${interestRate}`);
  }
  if (interestRate < 0) {
    throw new Error(`Interest rate cannot be negative, received: ${interestRate}`);
  }
  if (interestRate > 1) {
    throw new Error(`Interest rate appears to be a percentage (>100%), expected decimal (e.g., 0.05 for 5%), received: ${interestRate}`);
  }

  // Validate term
  if (typeof termMonths !== 'number' || !Number.isInteger(termMonths)) {
    throw new Error(`Term must be an integer number of months, received: ${termMonths}`);
  }
  if (termMonths <= 0) {
    throw new Error(`Term must be positive, received: ${termMonths}`);
  }
  if (termMonths > 480) { // 40 years
    throw new Error(`Term exceeds maximum allowed (480 months), received: ${termMonths}`);
  }

  // Business logic with validated inputs
  if (interestRate === 0) {
    return principal / termMonths; // Simple division for 0% interest
  }

  const monthlyRate = interestRate / 12;
  const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
                  (Math.pow(1 + monthlyRate, termMonths) - 1);

  return Math.round(payment * 100) / 100; // Round to cents
}
```

```python
# ❌ BAD: Function operates on invalid data leading to corruption
def update_user_profile(user_id, profile_data):
    # No validation - corrupted data enters the system
    user = get_user(user_id)
    user.email = profile_data.get('email')
    user.age = profile_data.get('age')
    user.phone = profile_data.get('phone')
    save_user(user)
    return user

# Results in corrupted data:
update_user_profile(None, {})                    # None user_id
update_user_profile("123", {"email": "invalid"}) # Invalid email
update_user_profile("123", {"age": -5})          # Invalid age

# ✅ GOOD: Comprehensive validation prevents data corruption
def update_user_profile(user_id: str, profile_data: dict) -> User:
    # Validate user_id
    if not user_id:
        raise ValueError("user_id is required and cannot be empty")
    if not isinstance(user_id, str):
        raise TypeError(f"user_id must be a string, received {type(user_id).__name__}")
    if not user_id.strip():
        raise ValueError("user_id cannot be only whitespace")

    # Validate profile_data structure
    if not isinstance(profile_data, dict):
        raise TypeError(f"profile_data must be a dictionary, received {type(profile_data).__name__}")
    if not profile_data:
        raise ValueError("profile_data cannot be empty - no fields to update")

    # Validate individual fields if present
    if 'email' in profile_data:
        email = profile_data['email']
        if not isinstance(email, str):
            raise TypeError(f"email must be a string, received {type(email).__name__}")
        if not email.strip():
            raise ValueError("email cannot be empty or whitespace")
        if '@' not in email or '.' not in email.split('@')[-1]:
            raise ValueError(f"email format is invalid: {email}")
        if len(email) > 254:  # RFC 5321 limit
            raise ValueError(f"email is too long (max 254 chars): {len(email)} chars")

    if 'age' in profile_data:
        age = profile_data['age']
        if not isinstance(age, int):
            raise TypeError(f"age must be an integer, received {type(age).__name__}")
        if age < 0:
            raise ValueError(f"age cannot be negative: {age}")
        if age > 150:
            raise ValueError(f"age seems unrealistic (max 150): {age}")

    if 'phone' in profile_data:
        phone = profile_data['phone']
        if not isinstance(phone, str):
            raise TypeError(f"phone must be a string, received {type(phone).__name__}")
        # Remove common formatting characters
        clean_phone = ''.join(c for c in phone if c.isdigit())
        if len(clean_phone) < 10:
            raise ValueError(f"phone number too short (min 10 digits): {phone}")
        if len(clean_phone) > 15:  # ITU-T E.164 international format
            raise ValueError(f"phone number too long (max 15 digits): {phone}")

    # Verify user exists before proceeding
    user = get_user(user_id)
    if not user:
        raise ValueError(f"user not found with id: {user_id}")

    # Apply validated updates
    if 'email' in profile_data:
        user.email = profile_data['email'].strip().lower()
    if 'age' in profile_data:
        user.age = profile_data['age']
    if 'phone' in profile_data:
        user.phone = profile_data['phone']

    save_user(user)
    return user
```

```java
// ❌ BAD: Method assumes valid state without checking
public class BankAccount {
    private BigDecimal balance;
    private AccountStatus status;

    public void withdraw(BigDecimal amount) {
        // No validation - allows overdrafts and invalid operations
        this.balance = this.balance.subtract(amount);
    }
}

// Allows dangerous operations:
account.withdraw(new BigDecimal("-100"));  // Negative withdrawal (actually a deposit)
account.withdraw(new BigDecimal("999999")); // Massive overdraft
// If account is frozen, still allows withdrawals

// ✅ GOOD: Comprehensive precondition validation
public class BankAccount {
    private BigDecimal balance;
    private AccountStatus status;

    public void withdraw(BigDecimal amount) {
        // Validate amount parameter
        if (amount == null) {
            throw new IllegalArgumentException("Withdrawal amount cannot be null");
        }
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException(
                String.format("Withdrawal amount must be positive, received: %s", amount)
            );
        }
        if (amount.scale() > 2) {
            throw new IllegalArgumentException(
                String.format("Withdrawal amount cannot have more than 2 decimal places, received: %s", amount)
            );
        }

        // Validate account state
        if (this.status == null) {
            throw new IllegalStateException("Account status is not initialized");
        }
        if (this.status == AccountStatus.CLOSED) {
            throw new IllegalStateException("Cannot withdraw from closed account");
        }
        if (this.status == AccountStatus.FROZEN) {
            throw new IllegalStateException("Cannot withdraw from frozen account");
        }

        // Validate balance state
        if (this.balance == null) {
            throw new IllegalStateException("Account balance is not initialized");
        }
        if (amount.compareTo(this.balance) > 0) {
            throw new InsufficientFundsException(
                String.format("Insufficient funds. Requested: %s, Available: %s",
                            amount, this.balance)
            );
        }

        // Validate business rules
        BigDecimal dailyLimit = getDailyWithdrawalLimit();
        BigDecimal todayWithdrawals = getTodayWithdrawals();
        if (todayWithdrawals.add(amount).compareTo(dailyLimit) > 0) {
            throw new DailyLimitExceededException(
                String.format("Daily withdrawal limit exceeded. Limit: %s, Today: %s, Requested: %s",
                            dailyLimit, todayWithdrawals, amount)
            );
        }

        // Perform withdrawal with validated inputs
        this.balance = this.balance.subtract(amount);
        recordTransaction(TransactionType.WITHDRAWAL, amount);
    }
}
```

## Related Bindings

- [use-structured-logging](../../docs/bindings/core/use-structured-logging.md): Structured logging complements fail-fast validation by providing detailed context when validation failures occur. When your validation logic fails fast with clear error messages, structured logging ensures those failures are captured with full context for debugging. Together, these bindings create systems that both prevent problems early and provide excellent diagnostics when issues do occur.

- [pure-functions](../../docs/bindings/core/pure-functions.md): Pure functions make fail-fast validation more effective because validation logic itself can be pure and easily testable. When your validation functions are pure, you can thoroughly test them in isolation and compose them reliably. The combination leads to validation logic that is both robust and easy to reason about.

- [dependency-inversion](../../docs/bindings/core/dependency-inversion.md): Dependency inversion supports fail-fast validation by making dependencies explicit and validatable. When dependencies are injected rather than hidden, you can validate them at construction time rather than discovering problems deep in execution. Both bindings make system requirements explicit rather than implicit.
