---
id: incremental-delivery
last_modified: '2025-06-02'
derived_from: adaptability-and-reversibility
enforced_by: 'CI/CD pipelines, deployment strategies, release management'
---

# Binding: Practice Incremental Delivery and Continuous Deployment

Deliver software in small, frequent increments that can be safely deployed and easily reversed. This enables rapid feedback, reduces deployment risk, and maintains the ability to quickly adapt to changing requirements or rollback problematic changes.

## Rationale

This binding implements our adaptability and reversibility tenet by creating a delivery process that prioritizes safety, speed, and adaptability over large, risky releases. Small, frequent deployments reduce the blast radius of any single change, making it easier to identify and fix problems quickly. When changes are small and incremental, they're easier to understand, test, and reverse if necessary.

Think of incremental delivery like taking a cross-country road trip with frequent stops versus driving non-stop for 20 hours. With frequent stops, you can check your progress, adjust your route if needed, refuel, and address any problems while they're small. If you take a wrong turn, you've only lost a short distance and can quickly get back on track. Non-stop driving means problems compound, course corrections become expensive, and a single mistake can derail the entire journey.

Large, infrequent releases create deployment fear that leads to even longer release cycles as teams batch more changes together to "make the deployment worth it." This creates a vicious cycle where deployments become increasingly risky and stressful. Incremental delivery breaks this cycle by making deployments routine, low-risk events that enable rapid iteration and learning.

## Rule Definition

Incremental delivery must establish these deployment principles:

- **Small Batch Sizes**: Keep individual changes small and focused on single features or bug fixes. Large changes should be broken down into multiple smaller, independent deployments.

- **Automated Deployment Pipelines**: Use fully automated deployment processes that eliminate manual steps and reduce the chance of human error during releases.

- **Progressive Rollout Strategies**: Deploy changes gradually to subsets of users or infrastructure, allowing for monitoring and validation before full rollout.

- **Immediate Rollback Capability**: Maintain the ability to quickly and safely rollback any deployment if problems are detected. Rollback should be faster than rolling forward with a fix.

- **Continuous Monitoring**: Implement comprehensive monitoring and alerting that can quickly detect problems after deployment and trigger automated responses.

- **Feature Branch Integration**: Use short-lived feature branches that are integrated frequently to avoid merge conflicts and integration problems.

**Deployment Strategies:**
- Blue-green deployments for zero-downtime releases
- Canary releases for gradual validation
- Rolling updates for distributed systems
- Feature flags for decoupling deployment from release
- Database migration automation for schema changes

**Quality Gates:**
- Automated testing at multiple levels (unit, integration, e2e)
- Performance benchmarking and regression detection
- Security scanning and vulnerability assessment
- Compliance validation for regulated environments

## Practical Implementation

1. **Implement Deployment Automation**: Create fully automated deployment pipelines that handle building, testing, deploying, and verifying releases without manual intervention.

2. **Use Database Migration Strategies**: Implement backward-compatible database changes that can be deployed incrementally without breaking existing functionality.

3. **Create Rollback Procedures**: Establish automated rollback mechanisms that can quickly restore previous versions when problems are detected.

4. **Monitor Key Metrics**: Track deployment frequency, lead time, failure rate, and recovery time to continuously improve your delivery process.

5. **Practice Trunk-Based Development**: Use trunk-based development with short-lived feature branches to minimize integration complexity and enable frequent releases.

## Examples

```yaml
# ❌ BAD: Monolithic deployment pipeline with high risk
# deploy.yml - Infrequent, high-risk deployments
name: Monthly Production Deploy
on:
  schedule:
    - cron: '0 2 1 * *'  # First day of month at 2 AM
  workflow_dispatch:     # Manual trigger only

jobs:
  deploy-everything:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout entire codebase
        uses: actions/checkout@v2
        with:
          fetch-depth: 0  # Get all history for large deployment

      - name: Run limited tests
        run: npm test  # Only basic tests to save time

      - name: Build everything
        run: |
          npm run build:frontend
          npm run build:backend
          npm run build:mobile-app
          npm run build:worker-services

      - name: Deploy all services simultaneously
        run: |
          # Deploy everything at once - high risk
          kubectl apply -f k8s/
          docker-compose -f production.yml up -d

      - name: Update database schema
        run: |
          # Run all pending migrations at once
          npm run migrate:production

      - name: Manual verification
        run: |
          echo "Manual verification required"
          echo "Check all services manually"

      - name: Send notification
        run: |
          curl -X POST $SLACK_WEBHOOK \
            -d '{"text": "Monthly deployment completed - please verify manually"}'

# Problems:
# 1. Large batches mean high risk of failure
# 2. Infrequent deployments make each one stressful
# 3. No automated rollback capability
# 4. Manual verification creates bottlenecks
# 5. All-or-nothing deployment increases blast radius

# ✅ GOOD: Incremental delivery with automated safety
# continuous-deployment.yml
name: Continuous Deployment Pipeline
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  # Quality gates before deployment
  test-and-validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run comprehensive test suite
        run: |
          npm run test:unit
          npm run test:integration
          npm run test:e2e:headless

      - name: Check code coverage
        run: |
          npm run test:coverage
          # Fail if coverage drops below threshold
          npm run coverage:check

      - name: Security scanning
        run: |
          npm audit --audit-level=high
          npm run security:scan

      - name: Performance benchmarks
        run: |
          npm run perf:benchmark
          npm run perf:regression-check

      - name: Build and validate
        run: |
          npm run build
          npm run validate:build

  # Deploy to staging for validation
  deploy-staging:
    needs: test-and-validate
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v3

      - name: Build container image
        run: |
          docker build -t $REGISTRY/$IMAGE_NAME:staging-${{ github.sha }} .

      - name: Deploy to staging
        run: |
          # Blue-green deployment to staging
          kubectl set image deployment/app-staging \
            app=$REGISTRY/$IMAGE_NAME:staging-${{ github.sha }}
          kubectl rollout status deployment/app-staging --timeout=300s

      - name: Run smoke tests
        run: |
          npm run test:smoke -- --env=staging

      - name: Performance validation
        run: |
          npm run perf:load-test -- --env=staging

      - name: Create staging preview
        run: |
          echo "::notice::Staging deployment available at https://staging-pr-${{ github.event.number }}.example.com"

  # Production deployment with progressive rollout
  deploy-production:
    needs: test-and-validate
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v3

      - name: Build production image
        run: |
          docker build -t $REGISTRY/$IMAGE_NAME:${{ github.sha }} .
          docker tag $REGISTRY/$IMAGE_NAME:${{ github.sha }} $REGISTRY/$IMAGE_NAME:latest

      - name: Database migration (backward compatible)
        run: |
          # Only run new migrations, ensuring backward compatibility
          npm run migrate:forward-only -- --env=production

      - name: Canary deployment (5% traffic)
        run: |
          # Deploy to canary instances first
          kubectl set image deployment/app-canary \
            app=$REGISTRY/$IMAGE_NAME:${{ github.sha }}
          kubectl rollout status deployment/app-canary --timeout=300s

          # Route 5% of traffic to canary
          kubectl apply -f k8s/canary-5percent.yml

      - name: Monitor canary metrics
        run: |
          # Monitor for 10 minutes
          for i in {1..10}; do
            npm run monitor:canary-health
            if [ $? -ne 0 ]; then
              echo "Canary health check failed, initiating rollback"
              exit 1
            fi
            sleep 60
          done

      - name: Gradual rollout (25% traffic)
        run: |
          # Increase traffic to 25%
          kubectl apply -f k8s/canary-25percent.yml

          # Monitor for 5 minutes
          for i in {1..5}; do
            npm run monitor:canary-health
            if [ $? -ne 0 ]; then
              echo "25% rollout failed, initiating rollback"
              exit 1
            fi
            sleep 60
          done

      - name: Full production rollout
        run: |
          # Deploy to all production instances
          kubectl set image deployment/app-production \
            app=$REGISTRY/$IMAGE_NAME:${{ github.sha }}
          kubectl rollout status deployment/app-production --timeout=600s

          # Remove canary routing
          kubectl apply -f k8s/production-100percent.yml

      - name: Post-deployment validation
        run: |
          npm run test:smoke -- --env=production
          npm run monitor:deployment-success

      - name: Update deployment tracking
        run: |
          # Record successful deployment
          curl -X POST "$DEPLOYMENT_API/deployments" \
            -H "Content-Type: application/json" \
            -d '{
              "sha": "${{ github.sha }}",
              "environment": "production",
              "status": "success",
              "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
              "rollback_sha": "${{ env.PREVIOUS_SHA }}"
            }'

  # Automatic rollback on failure
  rollback-on-failure:
    needs: deploy-production
    if: failure()
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Emergency rollback
        run: |
          echo "Deployment failed, initiating automatic rollback"

          # Rollback to previous version
          kubectl rollout undo deployment/app-production
          kubectl rollout undo deployment/app-canary
          kubectl rollout status deployment/app-production --timeout=300s

          # Restore previous traffic routing
          kubectl apply -f k8s/production-100percent.yml

      - name: Rollback database if needed
        run: |
          # Only rollback if safe migrations were applied
          npm run migrate:rollback-safe -- --env=production

      - name: Verify rollback success
        run: |
          npm run test:smoke -- --env=production
          npm run monitor:rollback-success

      - name: Alert team
        run: |
          curl -X POST $SLACK_WEBHOOK \
            -d '{
              "text": "🚨 Production deployment failed and was automatically rolled back",
              "attachments": [{
                "color": "danger",
                "fields": [
                  {"title": "SHA", "value": "${{ github.sha }}", "short": true},
                  {"title": "Branch", "value": "${{ github.ref }}", "short": true},
                  {"title": "Status", "value": "Rolled back", "short": true}
                ]
              }]
            }'
```

```typescript
// ❌ BAD: Large, risky feature releases
class FeatureReleaseManager {
  async deployLargeFeature(): Promise<void> {
    // Deploy entire feature at once - high risk
    await this.deployAllComponents([
      'user-interface-redesign',
      'new-payment-system',
      'recommendation-engine',
      'notification-system',
      'analytics-dashboard'
    ]);

    // All-or-nothing migration
    await this.runMassiveDatabaseMigration();

    // Enable everything simultaneously
    await this.enableAllFeatures();

    // Hope nothing breaks
    console.log('Large feature deployed - crossing fingers!');
  }
}

// ✅ GOOD: Incremental delivery with safe rollout
interface DeploymentStrategy {
  canaryPercentage: number;
  monitoringDuration: number;
  rollbackThreshold: {
    errorRate: number;
    latencyIncrease: number;
  };
}

interface DeploymentResult {
  success: boolean;
  metrics: {
    errorRate: number;
    averageLatency: number;
    throughput: number;
  };
  rollbackRequired: boolean;
}

class IncrementalDeploymentManager {
  constructor(
    private kubernetesClient: KubernetesClient,
    private databaseMigrator: DatabaseMigrator,
    private metricsCollector: MetricsCollector,
    private featureFlags: FeatureFlagClient,
    private alertManager: AlertManager
  ) {}

  async deployFeatureIncrement(
    featureComponent: string,
    strategy: DeploymentStrategy
  ): Promise<DeploymentResult> {
    const deploymentId = this.generateDeploymentId();

    try {
      // Step 1: Backward-compatible database changes
      await this.applyCompatibleMigrations(featureComponent);

      // Step 2: Deploy new version to canary instances
      await this.deployToCanary(featureComponent, deploymentId);

      // Step 3: Gradual traffic routing with monitoring
      const canaryResult = await this.monitorCanaryDeployment(
        featureComponent,
        strategy
      );

      if (!canaryResult.success) {
        await this.rollbackCanary(featureComponent);
        return canaryResult;
      }

      // Step 4: Full rollout with continued monitoring
      return await this.completeRollout(featureComponent, strategy);

    } catch (error) {
      await this.handleDeploymentFailure(featureComponent, deploymentId, error);
      throw error;
    }
  }

  private async applyCompatibleMigrations(component: string): Promise<void> {
    // Only apply migrations that don't break existing functionality
    const migrations = await this.databaseMigrator.getCompatibleMigrations(component);

    for (const migration of migrations) {
      console.log(`Applying backward-compatible migration: ${migration.name}`);
      await this.databaseMigrator.apply(migration);

      // Verify migration didn't break existing functionality
      const healthCheck = await this.runHealthChecks();
      if (!healthCheck.success) {
        await this.databaseMigrator.rollback(migration);
        throw new Error(`Migration ${migration.name} broke existing functionality`);
      }
    }
  }

  private async deployToCanary(component: string, deploymentId: string): Promise<void> {
    console.log(`Deploying ${component} to canary instances (deployment: ${deploymentId})`);

    // Update canary deployment
    await this.kubernetesClient.updateDeployment({
      name: `${component}-canary`,
      image: `${component}:${deploymentId}`,
      replicas: 2  // Small number of canary instances
    });

    // Wait for canary pods to be ready
    await this.kubernetesClient.waitForRollout(`${component}-canary`, 300000);

    // Run smoke tests on canary
    const smokeTestResult = await this.runSmokeTests(component, 'canary');
    if (!smokeTestResult.success) {
      throw new Error(`Smoke tests failed for canary deployment: ${smokeTestResult.errors}`);
    }
  }

  private async monitorCanaryDeployment(
    component: string,
    strategy: DeploymentStrategy
  ): Promise<DeploymentResult> {
    console.log(`Starting canary monitoring for ${component}`);

    // Route percentage of traffic to canary
    await this.updateTrafficRouting(component, strategy.canaryPercentage);

    // Collect baseline metrics
    const baselineMetrics = await this.metricsCollector.getBaseline(component);

    // Monitor for specified duration
    const startTime = Date.now();
    const endTime = startTime + strategy.monitoringDuration;

    while (Date.now() < endTime) {
      const currentMetrics = await this.metricsCollector.getCurrentMetrics(component);

      // Check if rollback is needed
      const shouldRollback = this.evaluateRollbackCriteria(
        baselineMetrics,
        currentMetrics,
        strategy.rollbackThreshold
      );

      if (shouldRollback) {
        return {
          success: false,
          metrics: currentMetrics,
          rollbackRequired: true
        };
      }

      // Wait before next check
      await this.sleep(30000); // Check every 30 seconds
    }

    const finalMetrics = await this.metricsCollector.getCurrentMetrics(component);
    return {
      success: true,
      metrics: finalMetrics,
      rollbackRequired: false
    };
  }

  private evaluateRollbackCriteria(
    baseline: any,
    current: any,
    threshold: any
  ): boolean {
    // Check error rate increase
    if (current.errorRate > baseline.errorRate * (1 + threshold.errorRate)) {
      console.log(`Error rate increased beyond threshold: ${current.errorRate} > ${baseline.errorRate * (1 + threshold.errorRate)}`);
      return true;
    }

    // Check latency increase
    if (current.averageLatency > baseline.averageLatency * (1 + threshold.latencyIncrease)) {
      console.log(`Latency increased beyond threshold: ${current.averageLatency} > ${baseline.averageLatency * (1 + threshold.latencyIncrease)}`);
      return true;
    }

    return false;
  }

  private async completeRollout(
    component: string,
    strategy: DeploymentStrategy
  ): Promise<DeploymentResult> {
    console.log(`Completing rollout for ${component}`);

    // Deploy to all production instances
    await this.kubernetesClient.updateDeployment({
      name: `${component}-production`,
      image: await this.getCanaryImage(component),
      strategy: 'RollingUpdate'
    });

    // Wait for production rollout
    await this.kubernetesClient.waitForRollout(`${component}-production`, 600000);

    // Route all traffic to new version
    await this.updateTrafficRouting(component, 100);

    // Final validation
    const finalMetrics = await this.metricsCollector.getCurrentMetrics(component);

    // Enable feature flag if deployment succeeded
    await this.featureFlags.enableFeature(`${component}-enabled`, {
      environment: 'production',
      rolloutPercentage: 100
    });

    return {
      success: true,
      metrics: finalMetrics,
      rollbackRequired: false
    };
  }

  private async rollbackCanary(component: string): Promise<void> {
    console.log(`Rolling back canary deployment for ${component}`);

    // Route traffic away from canary
    await this.updateTrafficRouting(component, 0);

    // Revert canary to previous version
    const previousImage = await this.getPreviousStableImage(component);
    await this.kubernetesClient.updateDeployment({
      name: `${component}-canary`,
      image: previousImage
    });

    // Alert team about rollback
    await this.alertManager.sendAlert({
      severity: 'warning',
      title: 'Canary Deployment Rolled Back',
      message: `Canary deployment for ${component} was rolled back due to performance issues`,
      component
    });
  }

  private async handleDeploymentFailure(
    component: string,
    deploymentId: string,
    error: Error
  ): Promise<void> {
    console.log(`Handling deployment failure for ${component}: ${error.message}`);

    // Rollback any database migrations
    await this.databaseMigrator.rollbackUnsafeMigrations(component);

    // Disable feature flags
    await this.featureFlags.disableFeature(`${component}-enabled`);

    // Alert team
    await this.alertManager.sendAlert({
      severity: 'critical',
      title: 'Deployment Failed',
      message: `Deployment of ${component} (${deploymentId}) failed: ${error.message}`,
      component,
      deploymentId
    });
  }

// Usage: Incremental feature delivery
class ProductFeatureManager {
  constructor(private deploymentManager: IncrementalDeploymentManager) {}

  async rolloutNewRecommendationEngine(): Promise<void> {
    // Break large feature into incremental deliveries
    const components = [
      'recommendation-data-pipeline',
      'recommendation-ml-service',
      'recommendation-api',
      'recommendation-ui-components'
    ];

    const strategy: DeploymentStrategy = {
      canaryPercentage: 5,
      monitoringDuration: 10 * 60 * 1000, // 10 minutes
      rollbackThreshold: {
        errorRate: 0.02, // 2% increase
        latencyIncrease: 0.20 // 20% increase
      }
    };

    // Deploy each component incrementally
    for (const component of components) {
      console.log(`Starting incremental deployment of ${component}`);

      const result = await this.deploymentManager.deployFeatureIncrement(
        component,
        strategy
      );

      if (!result.success) {
        console.log(`Deployment of ${component} failed, stopping rollout`);
        throw new Error(`Failed to deploy ${component}`);
      }

      console.log(`Successfully deployed ${component}`);

      // Wait between component deployments for stability
      await this.sleep(5 * 60 * 1000); // 5 minutes between components
    }

    console.log('Complete recommendation engine rollout successful!');
  }
}
```

## Related Bindings

- [feature-flag-management.md](../../docs/bindings/core/feature-flag-management.md): Feature flags enable incremental delivery by allowing features to be deployed but not yet released to users. This decouples deployment from release and enables safer, more gradual rollouts.

- [automated-quality-gates.md](../../docs/bindings/core/automated-quality-gates.md): Quality gates are essential for incremental delivery to ensure that small, frequent deployments maintain high quality standards. Automated testing and validation enable confident incremental releases.

- [flexible-architecture-patterns.md](../../docs/bindings/core/flexible-architecture-patterns.md): Flexible architecture supports incremental delivery by making it easier to deploy small changes without breaking existing functionality. Well-designed systems can accommodate incremental updates safely.

- [runtime-adaptability.md](../../docs/bindings/core/runtime-adaptability.md): Incremental delivery enables runtime adaptability by making it possible to quickly deploy configuration changes, feature toggles, and small behavioral modifications that adapt system behavior to changing conditions.
