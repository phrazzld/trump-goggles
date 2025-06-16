---
derived_from: no-secret-suppression
enforced_by: code review & custom linters
id: no-lint-suppression
last_modified: '2025-05-14'
version: '0.1.0'
---
# Binding: Document Why You're Silencing Warnings

Never disable or suppress linter warnings, static analysis errors, or type checking
flags without including a detailed comment explaining why the suppression is necessary,
what makes the code safe despite the warning, and why fixing the issue properly isn't
feasible. Unexplained suppressions are strictly forbidden.

## Rationale

This binding directly implements our no-secret-suppression tenet by requiring
transparency and justification when bypassing automated quality guardrails. When you
silence a warning without explanation, you're essentially making a unilateral decision
that future developers must trust blindly, with no way to evaluate whether your bypass
was warranted or remains necessary as the code evolves.

Think of lint suppressions like prescription medication warnings—they exist for
important reasons, and choosing to ignore them requires informed, documented
justification. Just as a doctor who overrides a medication warning must record their
reasoning in the patient's chart for other medical professionals to understand the
decision, a developer who bypasses a linter warning must document their reasoning for
future maintainers. Without this documentation, others have no way to distinguish
between legitimate exceptions and dangerous technical debt.

The dangers of undocumented suppressions compound over time. As codebases grow and team
members change, the original context and reasoning behind suppressions are lost. New
developers encountering a silent suppression must either blindly trust it or spend
precious time reverse-engineering the intent. Worse, when the code surrounding a
suppression changes, there's no way to know if the conditions that justified the
exception still apply. By requiring clear documentation for every suppression, we create
a history of deliberate decisions rather than mysterious exceptions, making the codebase
more maintainable, safer, and ultimately, more trustworthy.

## Rule Definition

This binding establishes clear requirements for any code that suppresses automated
quality checks:

- **Document Every Suppression**: All directives that disable linter rules, type
  checking, or other automated quality checks must include an explanatory comment that:

  - Identifies why the underlying rule is triggering in this specific case
  - Explains why the code is actually correct/safe despite the warning
  - Clarifies why fixing the issue properly isn't currently feasible
  - Ideally includes a ticket reference or timeline for revisiting the suppression

- **Suppression Methods Covered**: This rule applies to all forms of quality check
  suppressions, including but not limited to:

  - Language-specific linter suppression comments (e.g., `// eslint-disable-line`,
    `// nolint`, `// NOSONAR`)
  - Compiler flag suppressions (e.g., `#pragma warning disable`, `#[allow(...)]`,
    `@SuppressWarnings`)
  - Inline type assertions that bypass type checking (e.g., `as any`, type casts,
    `@ts-ignore`)
  - Configuration-based suppressions in linter config files
  - CI/build script flags that bypass quality checks (`--no-lint`, `--force`, etc.)

- **Limit Suppression Scope**: Beyond documentation, suppressions must be:

  - As narrow as possible in scope (line-level rather than file-level when available)
  - As specific as possible (targeting only the exact rule being suppressed)
  - Temporary by default (include a timeline or conditions for removal when possible)

- **Exceptions**: This binding recognizes limited scenarios where suppressions may be
  necessary:

  - Integration with external code you can't modify (third-party libraries, generated
    code)
  - Known false positives in the quality tools
  - Temporary emergency fixes that will be properly addressed in a timely manner
  - Cases where the automated rule conflicts with a higher-priority requirement

  Even in these exception cases, the documentation requirement still applies—exceptions
  must be explained, not merely asserted.

## Practical Implementation

Here are concrete strategies for handling suppressions responsibly:

1. **Write Informative Suppression Comments**: Include clear, detailed justifications
   that future developers can evaluate:

   ```typescript
   // ❌ BAD: No explanation
   // eslint-disable-next-line no-console
   console.log('User logged in');

   // ✅ GOOD: Clear explanation
   // eslint-disable-next-line no-console
   // Intentionally using console.log for login events to provide visibility in production
   // logs that can be filtered by monitoring tools. Preferred over our usual logger
   // for these specific events per discussion in ARCH-2023-05.
   console.log('User logged in', { userId, timestamp });
   ```

   The explanation should include enough context for someone unfamiliar with the code to
   understand both why the rule triggered and why the suppression is justified.

1. **Make Suppressions Temporary By Default**: Include strategies for eventual
   resolution:

   ```java
   // ❌ BAD: Permanent suppression with vague justification
   @SuppressWarnings("unchecked")
   // We know this is safe
   List<User> users = (List<User>) result;

   // ✅ GOOD: Suppression with clear intent and timeline
   @SuppressWarnings("unchecked")
   // Temporary cast needed until we update the legacy UserRepository interface
   // to use generics. The repository always returns User objects in practice.
   // See JIRA-1234 for the interface update scheduled for Q2.
   List<User> users = (List<User>) result;
   ```

   When possible, include ticket references, planned resolution approaches, or
   conditions under which the suppression should be reevaluated.

1. **Implement Suppression Linters**: Set up automated checks to enforce documentation
   of suppressions:

   ```yaml
   # ESLint rule configuration
   rules:
     "eslint-comments/require-description": ["error", { "ignore": [] }]
   ```

   Many linting tools can be configured to require comments with suppressions. Custom
   linters can also scan for suppression patterns and verify they have associated
   explanations.

1. **Create Team Standards for Common Suppressions**: Document agreed-upon patterns for
   handling common cases:

   ````markdown
   # Team Standards for Lint Suppressions

   ## React useEffect Dependencies

   When intentionally omitting a dependency from useEffect:

   ```jsx
   // eslint-disable-next-line react-hooks/exhaustive-deps
   // Intentionally omitting 'user' as a dependency to prevent re-fetching
   // when only user metadata changes. Only want to refresh when userId changes.
   ````

   This approach reduces the need for each developer to reinvent justifications and
   promotes consistency.

1. **Regularly Audit Existing Suppressions**: Implement processes to review and clean up
   suppressions:

   ```bash
   # Simple shell script to find and count suppression patterns
   find ./src -type f -name "*.ts" | xargs grep -l "eslint-disable" | wc -l
   ```

   Consider implementing a periodic "suppression audit" to review existing suppressions,
   remove unnecessary ones, and ensure all have proper documentation.

## Examples

```typescript
// ❌ BAD: Unexplained type assertion
interface Config {
  endpoint?: string;
  timeout?: number;
}

function initializeApi(config: Config) {
  // No explanation for why we know this is safe
  const endpoint = config.endpoint as string;
  fetch(endpoint);
}

// ✅ GOOD: Justified assertion with validation
function initializeApi(config: Config) {
  if (!config.endpoint) {
    throw new Error('API endpoint is required');
  }
  // Type assertion no longer needed after validation
  fetch(config.endpoint);
}
```

```python
# ❌ BAD: File-level suppression without explanation
# pylint: disable=too-many-arguments,too-many-locals

def process_data(arg1, arg2, arg3, arg4, arg5, arg6, arg7):
    # Complex function with many arguments and local variables
    local1 = arg1 + arg2
    local2 = arg3 * arg4
    # Many more locals...

# ✅ GOOD: Refactoring to avoid the need for suppression
class DataProcessor:
    def __init__(self, config):
        self.config = config

    def process(self):
        # Complex processing broken into smaller methods
        self._prepare_inputs()
        self._perform_calculation()
        return self._format_results()

    def _prepare_inputs(self):
        # ...

# If refactoring isn't immediately possible:
# pylint: disable=too-many-arguments
# This function handles the legacy import process which requires many parameters.
# Refactoring is planned in JIRA-5678 for Q3, but we need this interim solution
# to support the existing data import contracts.
def process_data_legacy(arg1, arg2, arg3, arg4, arg5, arg6, arg7):
    # ...
```

```go
// ❌ BAD: Silently ignoring errors
func readConfig() Config {
    data, _ := ioutil.ReadFile("config.json") // Error silently ignored
    var config Config
    json.Unmarshal(data, &config)
    return config
}

// ✅ GOOD: Properly handling or documenting error cases
func readConfig() (Config, error) {
    data, err := ioutil.ReadFile("config.json")
    if err != nil {
        return Config{}, fmt.Errorf("reading config: %w", err)
    }
    var config Config
    if err := json.Unmarshal(data, &config); err != nil {
        return Config{}, fmt.Errorf("parsing config: %w", err)
    }
    return config, nil
}

// If there's a rare case where ignoring an error is appropriate:
func fileExists(path string) bool {
    // #nosec G304 - This function only checks existence and doesn't read content,
    // so path injection would only reveal if a file exists, which isn't sensitive.
    _, err := os.Stat(path)
    return err == nil
}
```

```csharp
// ❌ BAD: Generic suppression in configuration
<PropertyGroup>
  <NoWarn>1591,1998,0618</NoWarn>
</PropertyGroup>

// ✅ GOOD: Targeted suppressions with justification in code
// CS1591: Missing XML comment for publicly visible type or member
// Suppressing only for internal testing utilities that don't need documentation
#pragma warning disable 1591
namespace Company.Project.Testing.Utilities
{
    public class TestHelper
    {
        // Testing utilities used only internally
    }
}
#pragma warning restore 1591
```

## Related Bindings

- [require-conventional-commits](../../docs/bindings/core/require-conventional-commits.md): Both bindings
  emphasize the importance of clear, informative communication about code changes. While
  conventional commits document why changes were made at the repository level,
  documented suppressions explain exceptions at the code level. Together, they create a
  comprehensive history of decisions that future developers can understand and evaluate.

- [use-structured-logging](../../docs/bindings/core/use-structured-logging.md): This binding complements the
  no-lint-suppression rule by ensuring that runtime information is as carefully tracked
  as compile-time exceptions. Both bindings recognize that future developers and
  operators need contextual information to make good decisions, whether they're
  investigating a production issue or evaluating a code pattern that triggered a
  warning.

- [external-configuration](../../docs/bindings/core/external-configuration.md): External configuration and
  documented suppressions both address how to handle necessary deviations from ideal
  patterns. Configuration values shouldn't be hardcoded, and quality warnings shouldn't
  be silenced—but when exceptions are unavoidable, both bindings require that these
  exceptions be transparent, documented, and managed with care.
