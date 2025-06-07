---
id: yagni-pattern-enforcement
last_modified: '2025-06-03'
derived_from: simplicity
enforced_by: 'code review & feature specification validation'
---

# Binding: Apply YAGNI to Prevent Speculative Development

Rigorously apply "You Aren't Gonna Need It" principles by only implementing features that solve immediate, demonstrated needs. Reject any functionality added "just in case" or for imagined future requirements without concrete evidence or user demand.

## Rationale

This binding implements our simplicity tenet by attacking complexity at its source—the temptation to build more than what's actually required. YAGNI serves as a powerful filter that separates essential features from speculative ones, dramatically reducing the cognitive overhead and maintenance burden of codebases. When you consistently apply YAGNI, you eliminate entire categories of complexity that would otherwise accumulate and compound over time.

Think of YAGNI like a strict editor who cuts unnecessary content from a manuscript. Every speculative feature you don't build is maintenance you don't have to do, bugs you don't have to fix, and complexity future developers don't have to navigate. The code you don't write is the code that can't break, can't become outdated, and can't confuse new team members. This negative space—the features deliberately omitted—becomes a strategic advantage that keeps your system focused and maintainable.

The challenge with YAGNI isn't understanding the principle; it's recognizing when you're violating it. Developers naturally want to build flexible, powerful solutions that anticipate future needs. This instinct, while well-intentioned, leads to over-engineering that creates more problems than it solves. By establishing clear criteria for what constitutes a "demonstrated need" and consistently applying these standards, you protect your project from the accumulating complexity that destroys long-term maintainability.

## Rule Definition

This binding establishes strict criteria for when new functionality should be implemented and clear procedures for preventing speculative development:

- **Demonstrated Need Requirements**: All new features must meet at least one of these criteria:
  - **Current User Request**: Direct feedback from actual users experiencing a specific problem
  - **Business Requirement**: Explicit business case with measurable success criteria
  - **Technical Debt Remediation**: Addressing proven maintainability or performance issues
  - **Regulatory/Security Compliance**: Legal or security requirements with specific deadlines

- **Prohibited Speculative Patterns**:
  - Features justified with "we might need this later"
  - Overly generic solutions "for future extensibility"
  - Complex configuration systems without proven variability needs
  - Abstraction layers before seeing multiple concrete use cases
  - Performance optimizations without measured bottlenecks

- **Evidence Standards**: For any proposed feature, you must provide:
  - Specific use cases from real users or stakeholder requests
  - Clear success metrics that define when the feature has succeeded
  - Timeline constraints that justify implementation now rather than later
  - Cost analysis showing the problem's impact without the feature

- **Evaluation Questions**: Before implementing any functionality, ask:
  - "Do we have concrete evidence this is needed now?"
  - "What happens if we defer this for six months?"
  - "Are we solving a real problem or an imagined one?"
  - "Can we validate the need with a simpler solution first?"

- **Permitted Exceptions**: YAGNI may be relaxed in limited circumstances:
  - When deferring would create significantly higher implementation costs later
  - For foundational architecture decisions that are expensive to change
  - When regulatory requirements have firm deadlines
  - For critical path features where failure to anticipate needs would block users

## Practical Implementation

Here are concrete strategies for applying YAGNI principles throughout your development process:

1. **Establish Feature Validation Gates**: Create checkpoints that validate feature necessity before implementation begins. Require explicit justification documentation for any new functionality, including user stories, business cases, or technical necessity arguments. Make "we might need this" an automatic rejection criterion during design reviews. Ask probing questions like "What evidence do we have that users actually want this?" and "What specific problem does this solve that we can measure?"

2. **Practice Minimum Viable Implementation**: Start with the simplest possible implementation that solves the immediate problem. Resist the urge to build flexibility or extensibility until you see multiple concrete use cases that require it. When building a feature, ask "What's the smallest version of this that would satisfy the requirement?" Build that version first, then evaluate whether additional complexity is actually justified by real usage patterns.

3. **Use Feature Flags for Incremental Delivery**: Deploy simple implementations behind feature flags to gather real user feedback before expanding functionality. This approach lets you validate whether users actually need additional complexity before building it. Monitor usage metrics and user feedback to determine whether proposed enhancements address real problems or just theoretical concerns.

4. **Document Deferred Decisions**: Maintain a clear record of functionality that was considered but intentionally deferred, along with the criteria that would trigger implementation. This prevents repeatedly revisiting the same speculative features while ensuring legitimate future needs aren't forgotten. Include the original reasoning for deferral and the specific conditions that would justify revisiting the decision.

5. **Refactor Towards Generalization**: Only extract common patterns and create abstractions after seeing the same concrete need appear multiple times. Wait until you have at least three similar use cases before creating shared utilities or generic solutions. This approach ensures your abstractions are grounded in real requirements rather than imagined ones, leading to more useful and maintainable generic code.

6. **Regular Feature Audit Process**: Periodically review existing features to identify functionality that was built speculatively but never used. Track usage metrics for all features and consider removing or simplifying those that don't provide value. This audit process helps maintain discipline around YAGNI principles and demonstrates the real cost of speculative development to the team.

## Examples

```typescript
// ❌ BAD: Over-engineered configuration system for imagined future needs
interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;

  // Speculative: No current need for connection pooling
  connectionPool?: {
    min: number;
    max: number;
    timeout: number;
    retryAttempts: number;
    backoffStrategy: 'linear' | 'exponential';
    healthCheckInterval: number;
  };

  // Speculative: No current need for multiple read replicas
  readReplicas?: Array<{
    host: string;
    port: number;
    weight: number;
    region: string;
  }>;

  // Speculative: No current sharding requirements
  sharding?: {
    strategy: 'hash' | 'range' | 'directory';
    shardKey: string;
    shardCount: number;
    rebalanceThreshold: number;
  };
}

// ✅ GOOD: Simple configuration that solves current needs
interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
}

// Add complexity only when needed:
// - Connection pooling when performance testing shows bottlenecks
// - Read replicas when load requires horizontal scaling
// - Sharding when data volume necessitates partitioning
```

```python
# ❌ BAD: Complex user management system with speculative features
class UserManager:
    def __init__(self):
        self.users = {}
        # Speculative: No current need for role hierarchies
        self.role_hierarchy = {}
        # Speculative: No current need for custom permissions
        self.custom_permissions = {}
        # Speculative: No current need for user groups
        self.user_groups = {}
        # Speculative: No current multi-tenancy requirement
        self.tenant_isolation = {}

    def create_user(self, username, email, roles=None, groups=None,
                   tenant_id=None, custom_perms=None, metadata=None):
        # Complex implementation handling all speculative features
        user = {
            'username': username,
            'email': email,
            'roles': roles or [],
            'groups': groups or [],
            'tenant_id': tenant_id,
            'custom_permissions': custom_perms or {},
            'metadata': metadata or {},
            'created_at': datetime.now(),
            'last_active': None,
            'login_history': [],  # Speculative tracking
            'preferences': {},    # Speculative customization
        }
        self.users[username] = user
        self._update_role_cache(user)  # Complex caching for speculative performance
        self._notify_user_created(user)  # Speculative event system
        return user

# ✅ GOOD: Simple user management that solves current needs
class UserManager:
    def __init__(self):
        self.users = {}

    def create_user(self, username, email):
        user = {
            'username': username,
            'email': email,
            'created_at': datetime.now()
        }
        self.users[username] = user
        return user

    def get_user(self, username):
        return self.users.get(username)

# Add features only when needed:
# - Roles when authorization requirements are defined
# - Groups when user organization becomes necessary
# - Multi-tenancy when serving multiple customers
# - Audit logging when compliance requires it
```

```javascript
// ❌ BAD: Over-engineered API client with speculative features
class APIClient {
  constructor(config) {
    this.baseURL = config.baseURL;
    this.apiKey = config.apiKey;

    // Speculative: No current need for complex retry logic
    this.retryConfig = config.retry || {
      attempts: 3,
      backoff: 'exponential',
      jitter: true,
      retryCondition: (error) => error.status >= 500
    };

    // Speculative: No current caching requirements
    this.cache = new Map();
    this.cacheConfig = config.cache || {
      ttl: 300000,
      maxSize: 1000,
      strategy: 'lru'
    };

    // Speculative: No current need for request transformation
    this.requestInterceptors = [];
    this.responseInterceptors = [];

    // Speculative: No current batching requirements
    this.batchQueue = [];
    this.batchConfig = config.batch || {
      maxSize: 10,
      timeout: 100
    };
  }

  async request(endpoint, options = {}) {
    // Complex implementation with all speculative features
    const request = this.buildRequest(endpoint, options);
    const cachedResponse = this.checkCache(request);
    if (cachedResponse) return cachedResponse;

    const batchedRequest = this.addToBatch(request);
    if (batchedRequest) return batchedRequest;

    return this.executeWithRetry(request);
  }
}

// ✅ GOOD: Simple API client that solves current needs
class APIClient {
  constructor(baseURL, apiKey) {
    this.baseURL = baseURL;
    this.apiKey = apiKey;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
}

// Add complexity only when needed:
// - Retry logic when network reliability becomes an issue
// - Caching when performance testing shows repeated requests
// - Batching when API rate limits require request consolidation
// - Interceptors when cross-cutting concerns emerge
```

## Related Bindings

- [immutable-by-default](../../docs/bindings/core/immutable-by-default.md): Immutability principles support YAGNI by reducing the complexity that comes from managing mutable state. When you avoid premature optimization and complex state management, immutable data structures provide simpler alternatives that are easier to reason about. Both bindings push toward solutions that are simple by default rather than complex from the start.

- [pure-functions](../../docs/bindings/core/pure-functions.md): Pure functions align perfectly with YAGNI principles because they naturally resist over-engineering. When you focus on pure functions that solve immediate problems, you avoid the complexity of side effects and global state management that often drives speculative development. Pure functions make it easier to add functionality incrementally when it's actually needed.

- [no-internal-mocking](../../docs/bindings/core/no-internal-mocking.md): YAGNI principles help avoid the over-engineering that often leads to complex mocking scenarios. When you build only what's immediately needed, your components tend to be simpler and more focused, making them naturally easier to test without elaborate mock setups. Both bindings encourage starting simple and adding complexity only when justified by real requirements.
