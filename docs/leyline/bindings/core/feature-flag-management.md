---
id: feature-flag-management
last_modified: '2025-06-02'
version: '0.1.0'
derived_from: adaptability-and-reversibility
enforced_by: 'Feature flag platforms, deployment controls, runtime configuration'
---
# Binding: Implement Comprehensive Feature Flag Management

Use feature flags to control functionality at runtime, enabling safe rollouts, quick rollbacks, A/B testing, and gradual feature adoption. This provides the ability to reverse decisions and adapt behavior without code deployments.

## Rationale

This binding implements our adaptability and reversibility tenet by creating software that can change behavior dynamically without requiring code changes or system restarts. Feature flags act as runtime switches that allow you to enable, disable, or modify functionality for specific users, environments, or conditions. This capability is essential for modern software delivery where speed, safety, and adaptability are paramount.

Think of feature flags like having a universal remote control for your software. Just as you can adjust your TV's settings, change channels, or turn features on and off without opening the TV and rewiring it, feature flags let you control your application's behavior without deploying new code. When something goes wrong, you can immediately "change the channel" back to a working state instead of scrambling to fix and redeploy code.

Without feature flags, every change requires a full deployment cycle, making adaptations slow and risky. When problems occur in production, your only option is to quickly develop, test, and deploy a fix—a process that can take hours or days while users experience issues. Feature flags eliminate this dependency on deployment cycles, enabling immediate responses to problems and rapid experimentation with new functionality.

## Rule Definition

Feature flag management must establish these operational principles:

- **Granular Control**: Implement flags at appropriate granularity levels—feature-level for major functionality, component-level for specific behaviors, and user-level for personalization.

- **Safe Defaults**: Design flags with safe default values that ensure system stability when flag evaluation fails or flags are misconfigured.

- **Targeting Capabilities**: Support sophisticated targeting rules based on user attributes, environments, geographic locations, time periods, or custom criteria.

- **Audit and Monitoring**: Track all flag changes, evaluations, and impacts with comprehensive logging and monitoring to ensure accountability and enable debugging.

- **Lifecycle Management**: Establish clear processes for flag creation, testing, rollout, and retirement to prevent flag sprawl and technical debt.

- **Performance Optimization**: Ensure flag evaluation is fast and doesn't impact application performance, with proper caching and fallback mechanisms.

**Flag Types:**
- **Release flags**: Control rollout of new features
- **Experiment flags**: Enable A/B testing and experimentation
- **Operational flags**: Control system behavior and performance settings
- **Permission flags**: Manage access to premium or restricted features
- **Kill switches**: Provide emergency shutoff capabilities

**Targeting Strategies:**
- Percentage-based rollouts for gradual adoption
- User segment targeting for specific audiences
- Environment-based flags for deployment stages
- Time-based flags for scheduled activations
- Custom attribute targeting for complex rules

## Practical Implementation

1. **Design Flag Hierarchies**: Organize flags in logical hierarchies that reflect your application structure and business domains. This makes flag management more intuitive and reduces the chance of conflicts.

2. **Implement Evaluation Caching**: Cache flag evaluations to minimize performance impact while ensuring timely updates when flag values change. Use appropriate cache invalidation strategies.

3. **Create Fallback Mechanisms**: Implement robust fallback behavior when flag evaluation fails due to network issues, service outages, or configuration errors.

4. **Establish Flag Naming Conventions**: Use consistent, descriptive naming conventions that make flag purpose and scope clear to all team members.

5. **Monitor Flag Performance Impact**: Track the performance impact of flag evaluations and optimize hot paths to ensure flags don't become bottlenecks.

## Examples

```typescript
// ❌ BAD: Hardcoded feature controls and environment checks
class UserRegistrationService {
  async registerUser(userData: UserData): Promise<User> {
    // Hardcoded feature control - requires deployment to change
    const enableEmailVerification = process.env.NODE_ENV === 'production';

    // Hardcoded percentage rollout - cannot be adjusted dynamically
    const enableNewValidationLogic = Math.random() < 0.1; // 10% of users

    // Hardcoded premium feature control
    const allowPremiumFeatures = userData.plan === 'enterprise';

    if (enableNewValidationLogic) {
      // New validation logic
      await this.validateUserDataV2(userData);
    } else {
      // Old validation logic
      await this.validateUserDataV1(userData);
    }

    const user = await this.createUser(userData);

    if (enableEmailVerification) {
      await this.sendVerificationEmail(user.email);
    }

    if (allowPremiumFeatures) {
      await this.setupPremiumFeatures(user);
    }

    return user;
  }
}

// Problems:
// 1. Cannot change rollout percentage without code deployment
// 2. Cannot quickly disable problematic features
// 3. Cannot target specific user segments
// 4. No ability to gradually increase rollouts
// 5. No audit trail of feature usage

// ✅ GOOD: Comprehensive feature flag management
interface FeatureFlagContext {
  userId?: string;
  userPlan?: string;
  environment: string;
  userAttributes?: Record<string, any>;
  timestamp?: Date;
}

interface FeatureFlagResult<T = boolean> {
  value: T;
  variant?: string;
  reason: string;
}

// Feature flag client interface
interface FeatureFlagClient {
  isEnabled(flagKey: string, context: FeatureFlagContext): Promise<FeatureFlagResult<boolean>>;
  getVariant<T>(flagKey: string, defaultValue: T, context: FeatureFlagContext): Promise<FeatureFlagResult<T>>;
  track(eventName: string, context: FeatureFlagContext, properties?: Record<string, any>): Promise<void>;
}

// Flag configuration with sophisticated targeting
interface FlagConfiguration {
  key: string;
  name: string;
  description: string;
  defaultValue: any;
  environments: {
    [env: string]: {
      enabled: boolean;
      rules: TargetingRule[];
      fallbackValue: any;
    };
  };
  variants?: {
    [variantName: string]: {
      value: any;
      weight: number;
    };
  };
}

interface TargetingRule {
  description: string;
  conditions: Condition[];
  percentage?: number;
  value: any;
  variant?: string;
}

interface Condition {
  attribute: string;
  operator: 'equals' | 'contains' | 'in' | 'greaterThan' | 'lessThan' | 'matches';
  value: any;
}

// Production-ready feature flag client
class ProductionFeatureFlagClient implements FeatureFlagClient {
  private cache = new Map<string, { value: any; expiry: number }>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  constructor(
    private flagService: FeatureFlagService,
    private analytics: AnalyticsService,
    private logger: Logger
  ) {}

  async isEnabled(flagKey: string, context: FeatureFlagContext): Promise<FeatureFlagResult<boolean>> {
    return this.getVariant(flagKey, false, context);
  }

  async getVariant<T>(
    flagKey: string,
    defaultValue: T,
    context: FeatureFlagContext
  ): Promise<FeatureFlagResult<T>> {
    try {
      // Check cache first
      const cached = this.getCachedValue(flagKey, context);
      if (cached) {
        return cached;
      }

      // Fetch flag configuration
      const flagConfig = await this.flagService.getFlagConfiguration(flagKey);
      if (!flagConfig) {
        return this.createResult(defaultValue, 'flag_not_found');
      }

      // Evaluate flag for current context
      const result = this.evaluateFlag(flagConfig, context, defaultValue);

      // Cache the result
      this.cacheResult(flagKey, context, result);

      // Track flag evaluation for analytics
      await this.track('feature_flag_evaluated', context, {
        flagKey,
        value: result.value,
        variant: result.variant,
        reason: result.reason
      });

      this.logger.debug('Feature flag evaluated', {
        flagKey,
        userId: context.userId,
        value: result.value,
        reason: result.reason
      });

      return result;
    } catch (error) {
      this.logger.error('Feature flag evaluation failed', {
        flagKey,
        error: error.message,
        context
      });

      // Return safe default on error
      return this.createResult(defaultValue, 'evaluation_error');
    }
  }

  private evaluateFlag<T>(
    config: FlagConfiguration,
    context: FeatureFlagContext,
    defaultValue: T
  ): FeatureFlagResult<T> {
    const envConfig = config.environments[context.environment];
    if (!envConfig || !envConfig.enabled) {
      return this.createResult(envConfig?.fallbackValue ?? defaultValue, 'environment_disabled');
    }

    // Evaluate targeting rules in order
    for (const rule of envConfig.rules) {
      if (this.evaluateConditions(rule.conditions, context)) {
        // Check percentage rollout
        if (rule.percentage !== undefined) {
          const hash = this.hashContextForPercentage(context, config.key);
          if (hash > rule.percentage) {
            continue; // User not in percentage
          }
        }

        return this.createResult(rule.value, 'rule_match', rule.variant);
      }
    }

    // No rules matched, return default
    return this.createResult(envConfig.fallbackValue ?? defaultValue, 'default_value');
  }

  private evaluateConditions(conditions: Condition[], context: FeatureFlagContext): boolean {
    return conditions.every(condition => {
      const contextValue = this.getContextValue(condition.attribute, context);

      switch (condition.operator) {
        case 'equals':
          return contextValue === condition.value;
        case 'contains':
          return String(contextValue).includes(condition.value);
        case 'in':
          return Array.isArray(condition.value) && condition.value.includes(contextValue);
        case 'greaterThan':
          return Number(contextValue) > Number(condition.value);
        case 'lessThan':
          return Number(contextValue) < Number(condition.value);
        case 'matches':
          return new RegExp(condition.value).test(String(contextValue));
        default:
          return false;
      }
    });
  }

  private getContextValue(attribute: string, context: FeatureFlagContext): any {
    switch (attribute) {
      case 'userId':
        return context.userId;
      case 'userPlan':
        return context.userPlan;
      case 'environment':
        return context.environment;
      default:
        return context.userAttributes?.[attribute];
    }
  }

  private hashContextForPercentage(context: FeatureFlagContext, flagKey: string): number {
    // Consistent hashing for stable percentage rollouts
    const input = `${context.userId || 'anonymous'}-${flagKey}`;
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash) % 100;
  }

  private createResult<T>(value: T, reason: string, variant?: string): FeatureFlagResult<T> {
    return { value, reason, variant };
  }

  async track(eventName: string, context: FeatureFlagContext, properties?: Record<string, any>): Promise<void> {
    await this.analytics.track(eventName, {
      userId: context.userId,
      timestamp: context.timestamp || new Date(),
      properties: {
        environment: context.environment,
        ...properties
      }
    });
  }
}

// Usage in service with comprehensive flag management
class FlexibleUserRegistrationService {
  constructor(
    private featureFlags: FeatureFlagClient,
    private userRepository: UserRepository,
    private emailService: EmailService,
    private validationService: ValidationService
  ) {}

  async registerUser(userData: UserData): Promise<User> {
    const context: FeatureFlagContext = {
      userId: userData.email, // Use email as temporary ID
      userPlan: userData.plan,
      environment: process.env.NODE_ENV || 'development',
      userAttributes: {
        country: userData.country,
        referralSource: userData.referralSource,
        accountAge: userData.accountAge
      }
    };

    // Feature flag: New validation logic rollout
    const useNewValidation = await this.featureFlags.isEnabled(
      'user_registration_validation_v2',
      context
    );

    if (useNewValidation.value) {
      await this.validationService.validateV2(userData);
    } else {
      await this.validationService.validateV1(userData);
    }

    // Feature flag: Email verification requirement
    const requireEmailVerification = await this.featureFlags.isEnabled(
      'require_email_verification',
      context
    );

    // Feature flag: Premium features availability
    const premiumFeaturesEnabled = await this.featureFlags.isEnabled(
      'premium_features_available',
      context
    );

    // Feature flag: Registration rate limiting
    const rateLimitConfig = await this.featureFlags.getVariant(
      'registration_rate_limit',
      { enabled: false, requestsPerMinute: 10 },
      context
    );

    if (rateLimitConfig.value.enabled) {
      await this.checkRateLimit(userData.email, rateLimitConfig.value.requestsPerMinute);
    }

    // Create user
    const user = await this.userRepository.create({
      ...userData,
      emailVerified: !requireEmailVerification.value,
      premiumFeaturesEnabled: premiumFeaturesEnabled.value
    });

    // Conditional email verification
    if (requireEmailVerification.value) {
      await this.emailService.sendVerificationEmail(user.email);

      // Track feature usage
      await this.featureFlags.track('email_verification_sent', context, {
        userId: user.id
      });
    }

    // Feature flag: Welcome email variants
    const welcomeEmailVariant = await this.featureFlags.getVariant(
      'welcome_email_variant',
      'standard',
      context
    );

    await this.sendWelcomeEmail(user, welcomeEmailVariant.value);

    return user;
  }

  private async sendWelcomeEmail(user: User, variant: string): Promise<void> {
    const templates = {
      'standard': 'welcome_standard',
      'premium': 'welcome_premium',
      'minimal': 'welcome_minimal'
    };

    const template = templates[variant] || templates['standard'];
    await this.emailService.sendTemplatedEmail(user.email, template, { user });
  }
}

// Flag configuration management
class FeatureFlagManager {
  constructor(private flagService: FeatureFlagService) {}

  async createFlag(config: FlagConfiguration): Promise<void> {
    await this.flagService.createFlag(config);
  }

  async updateFlag(flagKey: string, updates: Partial<FlagConfiguration>): Promise<void> {
    await this.flagService.updateFlag(flagKey, updates);
  }

  async retireFlag(flagKey: string): Promise<void> {
    // Safely retire flags by gradually reducing their rollout
    await this.flagService.updateFlag(flagKey, {
      environments: {
        production: { enabled: false, rules: [], fallbackValue: false },
        staging: { enabled: false, rules: [], fallbackValue: false },
        development: { enabled: false, rules: [], fallbackValue: false }
      }
    });

    // Schedule flag deletion after confirmation period
    await this.flagService.scheduleForDeletion(flagKey, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)); // 30 days
  }
}
```

```python
# ❌ BAD: Hardcoded feature controls with no flexibility
class DataProcessingService:
    def process_data(self, data_batch):
        # Hardcoded algorithm selection
        if len(data_batch) > 1000:
            return self.process_large_batch(data_batch)
        else:
            return self.process_small_batch(data_batch)

    def process_large_batch(self, data_batch):
        # Fixed processing logic - cannot be changed without deployment
        for item in data_batch:
            self.validate_item(item)
            self.transform_item_v1(item)  # Old transformation
            self.save_item(item)

    def process_small_batch(self, data_batch):
        # Different hardcoded logic
        results = []
        for item in data_batch:
            if self.is_valid_item(item):
                transformed = self.transform_item_v1(item)
                results.append(transformed)
        self.bulk_save(results)

# ✅ GOOD: Feature flag-driven processing with runtime control
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from dataclasses import dataclass
from enum import Enum

class ProcessingAlgorithm(Enum):
    LEGACY_V1 = "legacy_v1"
    OPTIMIZED_V2 = "optimized_v2"
    EXPERIMENTAL_V3 = "experimental_v3"

@dataclass
class ProcessingConfig:
    algorithm: ProcessingAlgorithm
    batch_threshold: int
    enable_validation: bool
    enable_parallel_processing: bool
    max_workers: int
    error_tolerance: float

class FeatureFlagEvaluator:
    def __init__(self, flag_service, cache_ttl=300):
        self.flag_service = flag_service
        self.cache = {}
        self.cache_ttl = cache_ttl

    def get_flag_value(self, flag_key: str, context: Dict[str, Any], default_value: Any = False):
        cache_key = f"{flag_key}:{hash(str(sorted(context.items())))}"

        # Check cache
        if cache_key in self.cache:
            cached_value, timestamp = self.cache[cache_key]
            if time.time() - timestamp < self.cache_ttl:
                return cached_value

        try:
            # Evaluate flag with context
            value = self.flag_service.evaluate(flag_key, context, default_value)

            # Cache result
            self.cache[cache_key] = (value, time.time())

            return value
        except Exception as e:
            print(f"Flag evaluation failed for {flag_key}: {e}")
            return default_value

class FlexibleDataProcessingService:
    def __init__(self, flag_evaluator: FeatureFlagEvaluator):
        self.flag_evaluator = flag_evaluator
        self.processors = {
            ProcessingAlgorithm.LEGACY_V1: self.process_v1,
            ProcessingAlgorithm.OPTIMIZED_V2: self.process_v2,
            ProcessingAlgorithm.EXPERIMENTAL_V3: self.process_v3
        }

    def process_data(self, data_batch: List[Dict], user_id: str = None):
        # Build context for flag evaluation
        context = {
            'user_id': user_id,
            'batch_size': len(data_batch),
            'data_type': self.detect_data_type(data_batch),
            'environment': os.getenv('ENVIRONMENT', 'development')
        }

        # Get processing configuration from feature flags
        config = self.get_processing_config(context)

        # Select processing algorithm based on flags
        processor = self.processors.get(config.algorithm, self.process_v1)

        try:
            if config.enable_parallel_processing and len(data_batch) > config.batch_threshold:
                return self.process_parallel(data_batch, processor, config)
            else:
                return self.process_sequential(data_batch, processor, config)
        except Exception as e:
            # Feature flag: Fallback behavior
            enable_fallback = self.flag_evaluator.get_flag_value(
                'data_processing_fallback_enabled',
                context,
                True
            )

            if enable_fallback:
                print(f"Processing failed, falling back to legacy algorithm: {e}")
                return self.process_v1(data_batch, config)
            else:
                raise

    def get_processing_config(self, context: Dict[str, Any]) -> ProcessingConfig:
        # Algorithm selection flag
        algorithm_name = self.flag_evaluator.get_flag_value(
            'data_processing_algorithm',
            context,
            'legacy_v1'
        )

        # Batch threshold flag
        batch_threshold = self.flag_evaluator.get_flag_value(
            'processing_batch_threshold',
            context,
            1000
        )

        # Validation toggle
        enable_validation = self.flag_evaluator.get_flag_value(
            'enable_data_validation',
            context,
            True
        )

        # Parallel processing flag
        enable_parallel = self.flag_evaluator.get_flag_value(
            'enable_parallel_processing',
            context,
            False
        )

        # Worker count flag
        max_workers = self.flag_evaluator.get_flag_value(
            'max_processing_workers',
            context,
            4
        )

        # Error tolerance flag
        error_tolerance = self.flag_evaluator.get_flag_value(
            'processing_error_tolerance',
            context,
            0.1  # 10% error tolerance
        )

        return ProcessingConfig(
            algorithm=ProcessingAlgorithm(algorithm_name),
            batch_threshold=batch_threshold,
            enable_validation=enable_validation,
            enable_parallel_processing=enable_parallel,
            max_workers=max_workers,
            error_tolerance=error_tolerance
        )

    def process_v1(self, data_batch: List[Dict], config: ProcessingConfig) -> List[Dict]:
        """Legacy processing algorithm"""
        results = []
        errors = 0

        for item in data_batch:
            try:
                if config.enable_validation and not self.validate_item_v1(item):
                    continue

                transformed = self.transform_item_v1(item)
                results.append(transformed)
            except Exception as e:
                errors += 1
                error_rate = errors / len(data_batch)

                if error_rate > config.error_tolerance:
                    raise Exception(f"Error rate {error_rate} exceeds tolerance {config.error_tolerance}")

        return results

    def process_v2(self, data_batch: List[Dict], config: ProcessingConfig) -> List[Dict]:
        """Optimized processing algorithm"""
        results = []

        # Batch validation for efficiency
        if config.enable_validation:
            valid_items = self.batch_validate_v2(data_batch)
        else:
            valid_items = data_batch

        # Optimized transformation
        for item in valid_items:
            transformed = self.transform_item_v2(item)
            results.append(transformed)

        return results

    def process_v3(self, data_batch: List[Dict], config: ProcessingConfig) -> List[Dict]:
        """Experimental processing algorithm"""
        # Machine learning-based processing
        results = []

        if config.enable_validation:
            # ML-based validation
            valid_items = self.ml_validate_items(data_batch)
        else:
            valid_items = data_batch

        # Advanced transformation pipeline
        for item in valid_items:
            transformed = self.ml_transform_item(item)
            results.append(transformed)

        return results

    def process_parallel(self, data_batch: List[Dict], processor, config: ProcessingConfig) -> List[Dict]:
        """Parallel processing with worker pool"""
        from concurrent.futures import ThreadPoolExecutor
        import math

        chunk_size = math.ceil(len(data_batch) / config.max_workers)
        chunks = [data_batch[i:i + chunk_size] for i in range(0, len(data_batch), chunk_size)]

        results = []
        with ThreadPoolExecutor(max_workers=config.max_workers) as executor:
            futures = [executor.submit(processor, chunk, config) for chunk in chunks]

            for future in futures:
                chunk_results = future.result()
                results.extend(chunk_results)

        return results

    def process_sequential(self, data_batch: List[Dict], processor, config: ProcessingConfig) -> List[Dict]:
        """Sequential processing"""
        return processor(data_batch, config)

# Feature flag configuration management
class DataProcessingFlagManager:
    def __init__(self, flag_service):
        self.flag_service = flag_service

    def setup_processing_flags(self):
        """Initialize all data processing feature flags"""

        # Algorithm selection flag
        self.flag_service.create_flag({
            'key': 'data_processing_algorithm',
            'name': 'Data Processing Algorithm',
            'description': 'Controls which processing algorithm to use',
            'type': 'string',
            'variations': [
                {'value': 'legacy_v1', 'name': 'Legacy V1'},
                {'value': 'optimized_v2', 'name': 'Optimized V2'},
                {'value': 'experimental_v3', 'name': 'Experimental V3'}
            ],
            'defaultVariation': 'legacy_v1',
            'targeting': {
                'rules': [
                    {
                        'variation': 'optimized_v2',
                        'conditions': [
                            {'attribute': 'environment', 'op': 'in', 'values': ['staging', 'production']},
                            {'attribute': 'batch_size', 'op': 'greaterThan', 'value': 500}
                        ]
                    },
                    {
                        'variation': 'experimental_v3',
                        'conditions': [
                            {'attribute': 'environment', 'op': 'equals', 'value': 'staging'},
                            {'attribute': 'user_id', 'op': 'in', 'values': ['beta_user_1', 'beta_user_2']}
                        ]
                    }
                ]
            }
        })

        # Parallel processing toggle
        self.flag_service.create_flag({
            'key': 'enable_parallel_processing',
            'name': 'Enable Parallel Processing',
            'description': 'Controls whether to use parallel processing for large batches',
            'type': 'boolean',
            'defaultVariation': False,
            'targeting': {
                'rules': [
                    {
                        'variation': True,
                        'conditions': [
                            {'attribute': 'batch_size', 'op': 'greaterThan', 'value': 1000},
                            {'attribute': 'environment', 'op': 'in', 'values': ['staging', 'production']}
                        ]
                    }
                ]
            }
        })

    def enable_experimental_algorithm(self, user_ids: List[str]):
        """Enable experimental algorithm for specific users"""
        self.flag_service.add_user_targets('data_processing_algorithm', 'experimental_v3', user_ids)

    def gradual_rollout_optimized_algorithm(self, percentage: int):
        """Gradually roll out optimized algorithm to percentage of users"""
        self.flag_service.update_percentage_rollout('data_processing_algorithm', 'optimized_v2', percentage)

    def emergency_disable_experimental(self):
        """Emergency disable experimental algorithm"""
        self.flag_service.update_flag('data_processing_algorithm', {
            'targeting': {
                'rules': [
                    rule for rule in self.flag_service.get_flag('data_processing_algorithm')['targeting']['rules']
                    if rule['variation'] != 'experimental_v3'
                ]
            }
        })
```

## Related Bindings

- [flexible-architecture-patterns.md](../../docs/bindings/core/flexible-architecture-patterns.md): Feature flags are one specific implementation of flexible architecture that enables runtime behavior changes. Flexible architecture provides the foundation that makes feature flags possible and effective.

- [runtime-adaptability.md](../../docs/bindings/core/runtime-adaptability.md): Feature flags enable runtime adaptability by allowing behavior changes without deployments. Both bindings work together to create systems that can adapt quickly to changing conditions and requirements.

- [automated-quality-gates.md](../../docs/bindings/core/automated-quality-gates.md): Quality gates can include checks for proper feature flag usage, such as ensuring flags have appropriate documentation, testing, and retirement plans. This prevents feature flag technical debt from accumulating.

- [centralized-configuration.md](../../docs/bindings/core/centralized-configuration.md): Feature flags are a specialized form of configuration that controls application behavior. Both bindings emphasize centralized management and single sources of truth, but feature flags add dynamic evaluation and targeting capabilities.
