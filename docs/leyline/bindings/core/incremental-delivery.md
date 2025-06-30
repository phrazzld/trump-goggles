---
id: incremental-delivery
last_modified: '2025-06-02'
version: '0.1.0'
derived_from: adaptability-and-reversibility
enforced_by: 'CI/CD pipelines, deployment strategies, release management'
---
# Binding: Practice Incremental Delivery and Continuous Deployment

Deliver software in small, frequent increments that can be safely deployed and easily reversed. This enables rapid feedback, reduces deployment risk, and maintains the ability to quickly adapt to changing requirements or rollback problematic changes.

## Rationale

This binding implements our adaptability and reversibility tenet by creating a delivery process that prioritizes safety, speed, and adaptability over large, risky releases. Like a relay race where each runner passes the baton safely to the next, incremental delivery ensures each change can be safely passed to production without disrupting the entire system.

Small, frequent deployments reduce the blast radius of any single change, making problems easier to identify and fix quickly. When changes are small and incremental, they're easier to understand, test, and reverse if necessary. This breaks the vicious cycle of deployment fear that leads to longer release cycles and increasingly risky deployments.

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

## Practical Implementation

1. **Implement Deployment Automation**: Create fully automated deployment pipelines that handle building, testing, deploying, and verifying releases without manual intervention.
2. **Use Database Migration Strategies**: Implement backward-compatible database changes that can be deployed incrementally without breaking existing functionality.
3. **Create Rollback Procedures**: Establish automated rollback mechanisms that can quickly restore previous versions when problems are detected.
4. **Monitor Key Metrics**: Track deployment frequency, lead time, failure rate, and recovery time to continuously improve your delivery process.
5. **Practice Trunk-Based Development**: Use trunk-based development with short-lived feature branches to minimize integration complexity and enable frequent releases.

## Examples

```yaml
# ❌ BAD: Monolithic deployment pipeline with high risk
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
