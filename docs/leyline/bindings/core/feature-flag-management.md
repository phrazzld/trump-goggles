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

Like having a universal remote control for your software, feature flags let you adjust your application's behavior without deploying new code. Just as you can change TV channels or adjust settings without opening and rewiring the TV, feature flags let you control functionality without deployments. When problems occur, you can immediately "change the channel" back to a working state instead of scrambling to fix and redeploy code.

Without feature flags, every change requires a full deployment cycle, making adaptations slow and risky. When problems occur in production, your only option is to quickly develop, test, and deploy a fix—a process that can take hours or days while users experience issues. Feature flags eliminate this dependency on deployment cycles, enabling immediate responses to problems and rapid experimentation with new functionality.

## Rule Definition

Feature flag management must establish these operational principles:

- **Granular Control**: Implement flags at appropriate granularity levels—feature-level for major functionality, component-level for specific behaviors, and user-level for personalization.
- **Safe Defaults**: Design flags with safe default values that ensure system stability when flag evaluation fails or flags are misconfigured.
- **Targeting Capabilities**: Support sophisticated targeting rules based on user attributes, environments, geographic locations, time periods, or custom criteria.
- **Audit and Monitoring**: Track all flag changes, evaluations, and impacts with comprehensive logging and monitoring to ensure accountability and enable debugging.

Common patterns this binding requires:

- Feature flag service with centralized configuration and distributed evaluation
- Gradual rollout capabilities with percentage-based targeting
- Environment-specific flag configurations with promotion workflows
- Flag lifecycle management with automatic cleanup of obsolete flags
- Real-time flag updates without application restarts

What this explicitly prohibits:

- Hard-coded feature switches that require deployments to change
- Feature flags without expiration dates or cleanup plans
- Flag evaluation logic that can cause application failures
- Unmonitored flags that lack visibility into usage and impact
- Flags that control critical security or data integrity features without proper safeguards

## Practical Implementation

1. **Implement Centralized Feature Flag Service**: Create a feature flag
   system that provides centralized configuration with distributed, fast evaluation.

   ```typescript
   // Feature flag service interface
   interface FeatureFlagService {
     isEnabled(flag: string, context?: FlagContext): Promise<boolean>;
     getValue<T>(flag: string, defaultValue: T, context?: FlagContext): Promise<T>;
     getVariant(flag: string, context?: FlagContext): Promise<string>;
   }

   interface FlagContext {
     userId?: string;
     environment: string;
     userAttributes?: Record<string, any>;
     customAttributes?: Record<string, any>;
   }

   // Implementation with caching and safe defaults
   class FeatureFlagManager implements FeatureFlagService {
     private cache = new Map<string, any>();
     private cacheExpiry = new Map<string, number>();

     constructor(
       private flagProvider: FlagProvider,
       private logger: Logger,
       private cacheTimeoutMs = 60000 // 1 minute cache
     ) {}

     async isEnabled(flag: string, context?: FlagContext): Promise<boolean> {
       return this.getValue(flag, false, context);
     }

     async getValue<T>(flag: string, defaultValue: T, context?: FlagContext): Promise<T> {
       try {
         // Check cache first
         const cached = this.getCachedValue(flag);
         if (cached !== undefined) {
           return cached;
         }

         // Evaluate flag
         const value = await this.flagProvider.evaluate(flag, context);

         // Cache the result
         this.setCachedValue(flag, value);

         // Log flag evaluation for monitoring
         this.logger.debug('Feature flag evaluated', {
           flag,
           value,
           userId: context?.userId,
           environment: context?.environment
         });

         return value !== undefined ? value : defaultValue;
       } catch (error) {
         // Always return safe default on error
         this.logger.error('Feature flag evaluation failed', {
           flag,
           error: error.message,
           defaultValue
         });
         return defaultValue;
       }
     }

     async getVariant(flag: string, context?: FlagContext): Promise<string> {
       return this.getValue(flag, 'control', context);
     }

     private getCachedValue(flag: string): any {
       const expiry = this.cacheExpiry.get(flag);
       if (expiry && Date.now() < expiry) {
         return this.cache.get(flag);
       }

       // Clean up expired cache entries
       this.cache.delete(flag);
       this.cacheExpiry.delete(flag);
       return undefined;
     }

     private setCachedValue(flag: string, value: any): void {
       this.cache.set(flag, value);
       this.cacheExpiry.set(flag, Date.now() + this.cacheTimeoutMs);
     }
   }

   // Usage in application components
   class UserService {
     constructor(private flagService: FeatureFlagService) {}

     async getUserProfile(userId: string): Promise<UserProfile> {
       const context: FlagContext = {
         userId,
         environment: process.env.NODE_ENV || 'development',
         userAttributes: await this.getUserAttributes(userId)
       };

       // Use feature flag to control new profile features
       const useEnhancedProfile = await this.flagService.isEnabled(
         'enhanced-user-profile',
         context
       );

       if (useEnhancedProfile) {
         return this.getEnhancedUserProfile(userId);
       }

       return this.getBasicUserProfile(userId);
     }

     async processPayment(userId: string, amount: number): Promise<PaymentResult> {
       const context: FlagContext = {
         userId,
         environment: process.env.NODE_ENV || 'development',
         customAttributes: { paymentAmount: amount }
       };

       // Use variant testing for payment flow
       const paymentVariant = await this.flagService.getVariant(
         'payment-flow-test',
         context
       );

       switch (paymentVariant) {
         case 'streamlined':
           return this.processStreamlinedPayment(userId, amount);
         case 'enhanced':
           return this.processEnhancedPayment(userId, amount);
         default:
           return this.processStandardPayment(userId, amount);
       }
     }
   }
   ```

2. **Design Gradual Rollout and Targeting System**: Implement sophisticated
   targeting rules that enable gradual feature rollouts and A/B testing.

   ```typescript
   // Flag configuration with targeting rules
   interface FlagConfig {
     key: string;
     enabled: boolean;
     defaultValue: any;
     variants?: FlagVariant[];
     targeting: TargetingRule[];
     createdAt: Date;
     expiresAt?: Date;
   }

   interface FlagVariant {
     key: string;
     value: any;
     weight: number; // Percentage (0-100)
     description?: string;
   }

   interface TargetingRule {
     conditions: Condition[];
     percentage?: number;
     variant?: string;
     enabled: boolean;
   }

   interface Condition {
     attribute: string;
     operator: 'equals' | 'contains' | 'in' | 'greater_than' | 'less_than';
     value: any;
   }

   // Flag evaluation engine
   class FlagEvaluator {
     evaluate(config: FlagConfig, context: FlagContext): any {
       // Check if flag is globally disabled
       if (!config.enabled) {
         return config.defaultValue;
       }

       // Check if flag has expired
       if (config.expiresAt && new Date() > config.expiresAt) {
         return config.defaultValue;
       }

       // Evaluate targeting rules
       for (const rule of config.targeting) {
         if (!rule.enabled) continue;

         if (this.matchesConditions(rule.conditions, context)) {
           // Apply percentage rollout if specified
           if (rule.percentage !== undefined) {
             const hash = this.hashContext(config.key, context);
             const bucket = hash % 100;
             if (bucket >= rule.percentage) {
               continue; // Skip this rule
             }
           }

           // Return variant or enabled state
           if (rule.variant && config.variants) {
             const variant = config.variants.find(v => v.key === rule.variant);
             return variant ? variant.value : config.defaultValue;
           }

           return rule.enabled;
         }
       }

       // No rules matched, return default
       return config.defaultValue;
     }

     private matchesConditions(conditions: Condition[], context: FlagContext): boolean {
       return conditions.every(condition => {
         const attributeValue = this.getAttributeValue(condition.attribute, context);
         return this.evaluateCondition(condition, attributeValue);
       });
     }

     private getAttributeValue(attribute: string, context: FlagContext): any {
       // Support nested attribute paths like 'userAttributes.plan'
       const parts = attribute.split('.');
       let value: any = context;

       for (const part of parts) {
         value = value?.[part];
         if (value === undefined) break;
       }

       return value;
     }

     private evaluateCondition(condition: Condition, attributeValue: any): boolean {
       switch (condition.operator) {
         case 'equals':
           return attributeValue === condition.value;
         case 'contains':
           return String(attributeValue).includes(String(condition.value));
         case 'in':
           return Array.isArray(condition.value) && condition.value.includes(attributeValue);
         case 'greater_than':
           return Number(attributeValue) > Number(condition.value);
         case 'less_than':
           return Number(attributeValue) < Number(condition.value);
         default:
           return false;
       }
     }

     private hashContext(flagKey: string, context: FlagContext): number {
       // Create consistent hash for percentage rollouts
       const hashInput = `${flagKey}:${context.userId || 'anonymous'}`;
       let hash = 0;
       for (let i = 0; i < hashInput.length; i++) {
         const char = hashInput.charCodeAt(i);
         hash = ((hash << 5) - hash) + char;
         hash = hash & hash; // Convert to 32-bit integer
       }
       return Math.abs(hash);
     }
   }
   ```

3. **Implement Flag Lifecycle Management**: Create systematic processes
   for flag creation, monitoring, and cleanup to prevent flag proliferation.

   ```typescript
   // Flag lifecycle management
   interface FlagMetrics {
     evaluationCount: number;
     lastEvaluated: Date;
     variantDistribution: Record<string, number>;
     errorRate: number;
   }

   class FlagLifecycleManager {
     constructor(
       private flagService: FeatureFlagService,
       private metricsService: MetricsService,
       private logger: Logger
     ) {}

     async createFlag(config: FlagConfig): Promise<void> {
       // Validate flag configuration
       this.validateFlagConfig(config);

       // Set automatic expiration if not specified
       if (!config.expiresAt) {
         // Default to 6 months expiration
         config.expiresAt = new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000);
       }

       // Create flag with monitoring
       await this.flagService.createFlag(config);

       this.logger.info('Feature flag created', {
         flagKey: config.key,
         expiresAt: config.expiresAt,
         targetingRules: config.targeting.length
       });
     }

     async cleanupExpiredFlags(): Promise<void> {
       const expiredFlags = await this.flagService.getExpiredFlags();

       for (const flag of expiredFlags) {
         const metrics = await this.metricsService.getFlagMetrics(flag.key);

         // Only cleanup flags that haven't been used recently
         const daysSinceLastEvaluation =
           (Date.now() - metrics.lastEvaluated.getTime()) / (1000 * 60 * 60 * 24);

         if (daysSinceLastEvaluation > 30) {
           await this.flagService.deleteFlag(flag.key);

           this.logger.info('Expired feature flag cleaned up', {
             flagKey: flag.key,
             lastEvaluated: metrics.lastEvaluated,
             totalEvaluations: metrics.evaluationCount
           });
         }
       }
     }

     async generateFlagHealthReport(): Promise<FlagHealthReport> {
       const allFlags = await this.flagService.getAllFlags();
       const healthReport: FlagHealthReport = {
         totalFlags: allFlags.length,
         expiringSoon: [],
         unused: [],
         highErrorRate: []
       };

       for (const flag of allFlags) {
         const metrics = await this.metricsService.getFlagMetrics(flag.key);

         // Check for flags expiring within 30 days
         if (flag.expiresAt) {
           const daysToExpiry =
             (flag.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24);

           if (daysToExpiry < 30) {
             healthReport.expiringSoon.push(flag.key);
           }
         }

         // Check for unused flags
         const daysSinceLastEvaluation =
           (Date.now() - metrics.lastEvaluated.getTime()) / (1000 * 60 * 60 * 24);

         if (daysSinceLastEvaluation > 60) {
