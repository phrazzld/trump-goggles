---
derived_from: simplicity
enforced_by: dependency scanners & code review
id: dependency-management
last_modified: '2025-05-14'
version: '0.1.0'
---
# Binding: Minimize and Maintain Dependencies Deliberately

Choose third-party dependencies deliberately, preferring minimal solutions that solve
specific problems. Actively manage the entire dependency lifecycle, from initial
evaluation through regular updates and security audits, treating each dependency as a
long-term commitment rather than a quick solution.

## Rationale

This binding implements our simplicity tenet by addressing a major source of hidden
complexity: the sprawling dependency trees that frequently grow beneath the surface of
modern applications. When you add a dependency to your project, you're not just adding a
single package—you're adopting an entire tree of transitive dependencies, each with its
own APIs, behaviors, bugs, and security vulnerabilities that now become your
responsibility to understand and maintain.

Think of your dependency graph like a garden. Each new dependency is a plant that needs
ongoing care, might attract pests (security vulnerabilities), and will continue to grow
and spread roots (transitive dependencies) far beyond what's visible on the surface.
Just as a garden requires regular weeding and pruning to remain healthy, your dependency
tree requires continuous evaluation and maintenance. Without deliberate care, both
quickly become overgrown, making it difficult to spot problems early and expensive to
fix them once they've taken hold.

This binding also directly supports our automation tenet by emphasizing the need for
automated tools and processes throughout the dependency lifecycle. Manual dependency
management quickly becomes impractical as projects grow. By automating dependency
updates, security scanning, license compliance checks, and other maintenance tasks, you
can consistently apply best practices across your entire codebase. These automated
processes serve as gardening tools that make it possible to maintain healthy
dependencies at scale, catching issues before they impact your software's security,
performance, or functionality.

## Rule Definition

This binding establishes principles for thoughtful dependency management throughout the
software lifecycle:

- **Evaluation and Selection**: Before adding any dependency, you must:

  - Verify that the functionality cannot be reasonably implemented in-house with less
    complexity
  - Evaluate the dependency's quality, activity, maintenance status, and community
    health
  - Assess the full impact of the dependency's transitive dependency tree
  - Consider the security and licensing implications of adopting the dependency
  - Examine the compatibility with your existing technology stack and deployment targets

- **Minimization and Isolation**: When using dependencies, you should:

  - Choose the smallest, most focused solution that solves your specific problem
  - Prefer mature, well-maintained libraries with minimal dependency trees of their own
  - Isolate third-party dependencies behind clear boundaries in your architecture
  - Avoid directly exposing third-party types in your public APIs
  - Only import the specific functionality you need, not entire frameworks

- **Ongoing Maintenance**: For the lifetime of your project, you must:

  - Regularly update dependencies to their latest compatible versions
  - Continuously monitor for security vulnerabilities and license compliance issues
  - Automate dependency updates where possible, with appropriate testing to catch
    regressions
  - Have a clear process for evaluating and accepting or rejecting updates
  - Maintain an accurate inventory of all dependencies and their purposes

- **Permitted Exceptions**: The following exceptions are allowed:

  - Core platform dependencies (language runtimes, standard libraries)
  - Organization-wide approved frameworks designated as "sanctioned"
  - Critical specialized functionality where the cost of implementation would be
    prohibitive
  - Legacy dependencies with plans for replacement or isolation

When implementing these exceptions, you must document the justification, scope the usage
as narrowly as possible, and establish a plan for any necessary refactoring toward more
maintainable alternatives.

## Practical Implementation

1. **Implement a Dependency Evaluation Process**: Establish clear criteria for
   evaluating potential dependencies before adding them to your project. Ask yourself:
   "Is this dependency worth the long-term maintenance burden?" Create a checklist that
   considers factors like:

   - Does this solve a real, immediate need?
   - Could we reasonably implement this ourselves with less complexity?
   - Is the project actively maintained? (Recent commits, responsive to issues)
   - How large is its dependency tree?
   - What is its security history?
   - Does it follow semantic versioning?
   - Are its API and behavior well-documented?
   - Is the license compatible with our project?

   ```typescript
   // Example dependency evaluation checklist (in documentation or PR template)
   /**
    * Dependency Evaluation
    *
    * Package: <package-name>
    * Version: <version>
    * Purpose: <1-2 sentence justification>
    *
    * - [ ] Solves a specific, immediate need
    * - [ ] Would require >100 LOC to implement ourselves
    * - [ ] Active maintenance (commits within last 6 months)
    * - [ ] Well-documented API
    * - [ ] Compatible license
    * - [ ] Security vulnerabilities checked
    * - [ ] Dependency tree analyzed (adds fewer than 10 transitive deps)
    * - [ ] Added to minimal scope (not globally)
    */
   ```

1. **Set Up Automated Dependency Management**: Implement automation for keeping
   dependencies up-to-date and secure. Ask yourself: "How will we know when a dependency
   needs attention?" Configure tools appropriate for your ecosystem that:

   - Monitor for security vulnerabilities
   - Alert about outdated dependencies
   - Automate version updates with proper testing

   ```yaml
   # Example GitHub Dependabot configuration (.github/dependabot.yml)
   version: 2
   updates:
     - package-ecosystem: "npm"
       directory: "/"
       schedule:
         interval: "weekly"
       # Group minor and patch updates together
       groups:
         minor-and-patch:
           update-types:
             - "minor"
             - "patch"
       # Configure automatic merge for safe updates
       auto-merge: true
       auto-merge-conditions:
         - "all-checks-success"
       # Add reviewers to manual updates
       reviewers:
         - "security-team"
       # Limit pull requests for stability
       open-pull-requests-limit: 5
   ```

1. **Create Architectural Boundaries Around Dependencies**: Design your code to isolate
   third-party dependencies behind clear interfaces. Ask yourself: "What would happen if
   we needed to replace this dependency?" This approach creates a buffer zone between
   your core code and external libraries, making them easier to manage, test, and
   potentially replace.

   ```go
   // ❌ BAD: Exposing third-party library throughout codebase
   import "github.com/third-party/parsing"

   func ProcessUserData(data []byte) {
       // Direct usage of third-party types and functions scattered
       // throughout the codebase
       result := parsing.Parse(data)
       // ...
   }

   // ✅ GOOD: Isolating third-party library behind an interface
   // parser.go
   type Parser interface {
       Parse(data []byte) (Document, error)
   }

   // internal/parsing/third_party.go
   import "github.com/third-party/parsing"

   type ThirdPartyParser struct {}

   func (p *ThirdPartyParser) Parse(data []byte) (Document, error) {
       // Adapter code that converts between your domain types
       // and the third-party library's types
       result := parsing.Parse(data)
       return convertToDocument(result), nil
   }

   // Usage in business logic only sees your interface
   func ProcessUserData(parser Parser, data []byte) {
       doc, err := parser.Parse(data)
       // ...
   }
   ```

1. **Implement Dependency Inventory and Auditing**: Maintain a clear inventory of your
   dependencies and regularly audit them. Ask yourself: "Do we know what every
   dependency is doing in our project?" Consider using tools to:

   - Generate a software bill of materials (SBOM)
   - Track dependencies and their purposes
   - Analyze and visualize dependency relationships
   - Identify unused or duplicate dependencies

   ```shell
   # Example dependency audit commands

   # npm example: find unused dependencies
   $ npx depcheck

   # npm example: analyze dependency tree
   $ npm ls --all

   # Python example: generate requirements.txt with pinned versions
   $ pip freeze > requirements.txt

   # Go example: tidy dependencies
   $ go mod tidy
   $ go mod why github.com/some/dependency

   # General: generate SBOM
   $ cyclonedx-npm --output-file sbom.xml
   ```

1. **Practice Dependency Pruning and Replacement**: Regularly review your dependencies
   and remove those that are no longer necessary or have become problematic. Ask
   yourself: "If we were starting this project today, would we still choose this
   dependency?" Consider:

   - Replacing heavy dependencies with lighter alternatives
   - Inlining small amounts of functionality instead of carrying entire libraries
   - Consolidating multiple dependencies that serve similar purposes
   - Upgrading to newer alternatives when appropriate

   ```typescript
   // Example: Consider replacing a large date library with native functionality

   // ❌ BAD: Using a heavy library for simple date formatting
   import * as moment from 'moment'; // Adds ~300KB to your bundle

   function formatDate(date) {
     return moment(date).format('YYYY-MM-DD');
   }

   // ✅ GOOD: Using native functionality or smaller alternative
   function formatDate(date) {
     const d = new Date(date);
     return d.toISOString().split('T')[0]; // No additional dependencies
   }

   // Or with a more focused library if native isn't sufficient
   import { format } from 'date-fns'; // Modular, tree-shakable, ~6KB for this function

   function formatDate(date) {
     return format(new Date(date), 'yyyy-MM-dd');
   }
   ```

## Examples

```javascript
// ❌ BAD: Excessive dependencies for simple functionality
// package.json
{
  "dependencies": {
    "left-pad": "^1.3.0",           // For padding strings
    "is-odd": "^3.0.1",             // To check if a number is odd
    "is-even": "^1.0.0",            // To check if a number is even
    "is-number": "^7.0.0",          // To check if a value is a number
    "array-unique": "^0.3.2",       // To remove duplicates
    "lodash": "^4.17.21"            // For various utilities
  }
}

// Usage
const leftPad = require('left-pad');
const isOdd = require('is-odd');
const isNumber = require('is-number');
const _ = require('lodash');

function processValues(values) {
  // Using separate tiny packages for simple operations
  const numbers = values.filter(v => isNumber(v));
  const oddNumbers = numbers.filter(v => isOdd(v));
  const uniqueOddNumbers = _.uniq(oddNumbers);

  return uniqueOddNumbers.map(n => leftPad(n.toString(), 5, '0'));
}
```

```javascript
// ✅ GOOD: Minimal dependencies, native functionality where possible
// No additional dependencies needed for these simple operations

function processValues(values) {
  // Using native JavaScript functionality
  const numbers = values.filter(v => typeof v === 'number' && !isNaN(v));
  const oddNumbers = numbers.filter(n => n % 2 !== 0);
  const uniqueOddNumbers = [...new Set(oddNumbers)];

  return uniqueOddNumbers.map(n => n.toString().padStart(5, '0'));
}
```

```java
// ❌ BAD: Dependency version conflicts and management issues
// build.gradle with unmanaged versions
dependencies {
    // Multiple JSON libraries with overlapping functionality
    implementation 'org.json:json:20210307'
    implementation 'com.google.code.gson:gson:2.8.7'
    implementation 'com.fasterxml.jackson.core:jackson-databind:2.12.3'

    // Multiple HTTP client libraries
    implementation 'org.apache.httpcomponents:httpclient:4.5.13'
    implementation 'com.squareup.okhttp3:okhttp:4.9.1'

    // Transitive dependencies might conflict
    implementation 'org.springframework.boot:spring-boot-starter-web:2.5.2'
    implementation 'org.springframework:spring-web:5.3.8' // Potential conflict
}

// Example usage with direct references to libraries throughout codebase
import org.json.JSONObject;
import com.google.gson.Gson;
import com.fasterxml.jackson.databind.ObjectMapper;

class UserService {
    // Mixing multiple JSON libraries
    public User parseUser(String json) {
        JSONObject jsonObject = new JSONObject(json);
        String name = jsonObject.getString("name");

        Gson gson = new Gson();
        User partialUser = gson.fromJson(json, User.class);

        ObjectMapper mapper = new ObjectMapper();
        return mapper.readValue(json, User.class);
    }
}
```

```java
// ✅ GOOD: Centralized dependency management and isolation
// build.gradle with version management
plugins {
    id 'io.spring.dependency-management' version '1.0.11.RELEASE'
}

// Define versions in one place
ext {
    jacksonVersion = '2.12.3'
}

dependencies {
    // Single JSON library with well-defined version
    implementation "com.fasterxml.jackson.core:jackson-databind:${jacksonVersion}"
    implementation "com.fasterxml.jackson.datatype:jackson-datatype-jsr310:${jacksonVersion}"

    // Use BOM (Bill of Materials) for dependency sets
    implementation platform('org.springframework.boot:spring-boot-dependencies:2.5.2')
    implementation 'org.springframework.boot:spring-boot-starter-web'
    // No version needed here, it's managed by the platform
}

// Example usage with adapter pattern to isolate dependencies
// JsonParser.java - Interface for our domain
interface JsonParser {
    <T> T parse(String json, Class<T> type);
}

// JacksonAdapter.java - Isolates the Jackson dependency
class JacksonAdapter implements JsonParser {
    private final ObjectMapper mapper;

    public JacksonAdapter() {
        this.mapper = new ObjectMapper();
        // Configure mapper
    }

    @Override
    public <T> T parse(String json, Class<T> type) {
        return mapper.readValue(json, type);
    }
}

// UserService.java - Uses our interface, not the dependency directly
class UserService {
    private final JsonParser jsonParser;

    public UserService(JsonParser jsonParser) {
        this.jsonParser = jsonParser;
    }

    public User parseUser(String json) {
        return jsonParser.parse(json, User.class);
    }
}
```

```python
# ❌ BAD: Unpinned dependencies and poor dependency management
# requirements.txt with loose versions
flask>=2.0.0
requests>=2.25.0
pandas
numpy
matplotlib
scikit-learn
tensorflow  # Heavy dependency for a small feature

# app.py with excessive imports
import flask
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.linear_model import LinearRegression
import tensorflow as tf  # Only used for one simple operation

def analyze_data(data):
    # Using TensorFlow just for a simple operation that could be done with NumPy
    normalized = tf.keras.utils.normalize(data)
    # ...
```

```python
# ✅ GOOD: Precise dependency pinning and deliberate usage
# requirements.txt with exact versions and comments
flask==2.0.1  # Web framework
requests==2.26.0  # HTTP client
pandas==1.3.3  # Data analysis
numpy==1.21.2  # Numerical computing

# Separate requirements files for different environments
# requirements-dev.txt
-r requirements.txt  # Include base requirements
pytest==6.2.5  # Testing
coverage==6.0.2  # Code coverage

# app.py with focused imports
import flask
import numpy as np
import pandas as pd

# Using native or existing libraries for functionality instead of adding new ones
def analyze_data(data):
    # Using NumPy instead of adding TensorFlow for a simple operation
    normalized = (data - np.mean(data, axis=0)) / np.std(data, axis=0)
    # ...

# Optional dependency example
def generate_report(data, include_charts=False):
    # Core functionality works without matplotlib
    report = {"summary": summarize_data(data)}

    # Only import matplotlib when actually needed
    if include_charts:
        try:
            import matplotlib.pyplot as plt
            # Generate charts
            report["charts"] = create_charts(data, plt)
        except ImportError:
            report["charts_error"] = "Charting libraries not available"

    return report
```

## Related Bindings

- [simplicity](../../docs/tenets/simplicity.md): This dependency management binding is a direct
  application of the simplicity tenet's guidance to "minimize moving parts." Each
  dependency adds complexity that must be understood, maintained, and debugged. By
  deliberately limiting dependencies, you reduce the cognitive load required to work
  with your codebase and minimize potential points of failure.

- [external-configuration](../../docs/bindings/core/external-configuration.md): External configuration and
  careful dependency management are complementary practices that improve system
  maintainability. Both focus on isolating aspects of your system that are likely to
  change—configuration values and third-party code—behind clear boundaries. This
  isolation makes it easier to adapt to changes without disrupting the core
  functionality of your application.

- [no-secret-suppression](../../docs/tenets/no-secret-suppression.md): Proper dependency
  management is essential for security, directly supporting the no-secret-suppression
  tenet. Unpatched dependencies with known vulnerabilities are one of the most common
  security risks in modern applications. By maintaining an accurate inventory of
  dependencies and automating security scanning, you can detect and address
  vulnerabilities before they impact your users.

- [hex-domain-purity](../../docs/bindings/core/hex-domain-purity.md): Hexagonal architecture and careful
  dependency management work together to create more maintainable systems. By isolating
  third-party dependencies at the boundaries of your application, you keep your domain
  logic pure and focused on business rules rather than implementation details. This
  approach makes it easier to replace or upgrade dependencies without disrupting your
  core functionality.
