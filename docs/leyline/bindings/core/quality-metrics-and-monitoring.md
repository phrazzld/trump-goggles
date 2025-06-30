---
id: quality-metrics-and-monitoring
last_modified: '2025-06-15'
version: '0.1.0'
derived_from: automation
enforced_by: 'Quality Dashboards, Automated Alerts, Code Quality Gates'
---

# Binding: Quality Metrics and Monitoring

Measure what matters to drive continuous improvement. Establish meaningful quality KPIs that guide decision-making, surface issues early, and create accountability for technical excellence without becoming bureaucratic overhead.

## Rationale

Quality metrics serve as early warning systems and progress indicators, but only when they measure outcomes that teams can act upon. Poorly chosen metrics create false urgency or, worse, incentivize gaming the system rather than improving quality.

Effective quality monitoring creates a feedback loop: metrics reveal problems, teams investigate root causes, solutions are implemented, and metrics confirm improvement. This cycle only works when metrics are accurate, timely, and connected to actionable improvement strategies.

## Rule Definition

**MUST** track core quality indicators: test coverage, build success rate, deployment frequency, mean time to recovery.

**MUST** set measurable thresholds that trigger alerts and action items.

**MUST** review metrics weekly during team retrospectives with focus on trends and improvement actions.

**MUST** automate metric collection to eliminate manual reporting overhead.

**SHOULD** correlate quality metrics with user-facing outcomes like error rates and performance.

**SHOULD** track leading indicators (code review time, test execution speed) alongside lagging indicators (bugs found in production).

## Core Quality KPIs

### Code Quality Metrics

**Test Coverage (Target: ≥80%)**
- **Unit Test Coverage**: ≥90% for core business logic
- **Integration Test Coverage**: ≥70% for API endpoints
- **E2E Test Coverage**: ≥60% for critical user paths
- **Alert Threshold**: <75% coverage fails builds

**Code Complexity (Target: Maintainable)**
- **Cyclomatic Complexity**: <10 per function
- **Technical Debt Ratio**: <5% (SonarQube)
- **Code Duplication**: <3% of codebase
- **Alert Threshold**: >20% increase in complexity metrics

### Process Quality Metrics

**Build Health (Target: ≥95% success)**
- **Build Success Rate**: Last 50 builds
- **Test Execution Time**: <10 minutes for full suite
- **Flaky Test Rate**: <2% of total tests
- **Alert Threshold**: <90% build success or >3 consecutive failures

**Deployment Velocity (Target: Daily deployments)**
- **Deployment Frequency**: Deployments per week
- **Lead Time**: Commit to production time
- **Change Failure Rate**: <15% of deployments
- **Mean Time to Recovery**: <4 hours for critical issues

## Implementation Examples

### SonarQube Integration

```yaml
# sonar-project.properties
sonar.projectKey=myproject
sonar.organization=myorg
sonar.sources=src
sonar.tests=tests
sonar.exclusions=**/*.test.ts,**/node_modules/**
sonar.typescript.lcov.reportPaths=coverage/lcov.info
sonar.coverage.exclusions=**/*.test.ts,**/*.spec.ts

# Quality Gate Configuration
sonar.qualitygate.wait=true
sonar.qualitygate.timeout=300

# Custom Quality Gate Conditions
sonar.coverage.minimum=80
sonar.duplicated_lines_density.maximum=3
sonar.maintainability_rating.maximum=A
sonar.reliability_rating.maximum=A
sonar.security_rating.maximum=A
```

```yaml
# .github/workflows/quality-gate.yml
name: Quality Gate
on: [push, pull_request]

jobs:
  quality-analysis:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run tests with coverage
        run: npm test -- --coverage --watchAll=false

      - name: SonarQube Scan
        uses: sonarqube-quality-gate-action@master
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}

      - name: Quality Gate Check
        run: |
          if [ "${{ steps.sonarqube.outputs.quality-gate-status }}" != "PASSED" ]; then
            echo "Quality gate failed"
            exit 1
          fi
```

### Custom Quality Dashboard

```typescript
// quality-dashboard.ts
interface QualityMetrics {
  timestamp: Date;
  coverage: {
    unit: number;
    integration: number;
    e2e: number;
    total: number;
  };
  builds: {
    successRate: number;
    averageTime: number;
    flakyTests: number;
  };
  deployment: {
    frequency: number;
    leadTime: number;
    failureRate: number;
    mttr: number;
  };
  codeQuality: {
    complexity: number;
    duplication: number;
    techDebtRatio: number;
  };
}

class QualityDashboard {
  async collectMetrics(): Promise<QualityMetrics> {
    const [coverage, builds, deployments, sonar] = await Promise.all([
      this.getCoverageMetrics(),
      this.getBuildMetrics(),
      this.getDeploymentMetrics(),
      this.getSonarMetrics()
    ]);

    return {
      timestamp: new Date(),
      coverage,
      builds,
      deployment: deployments,
      codeQuality: sonar
    };
  }

  async generateAlerts(metrics: QualityMetrics): Promise<Alert[]> {
    const alerts: Alert[] = [];

    if (metrics.coverage.total < 80) {
      alerts.push({
        severity: 'warning',
        message: `Test coverage ${metrics.coverage.total}% below 80% threshold`,
        action: 'Add tests for uncovered code paths'
      });
    }

    if (metrics.builds.successRate < 95) {
      alerts.push({
        severity: 'critical',
        message: `Build success rate ${metrics.builds.successRate}% below 95%`,
        action: 'Investigate failing builds and flaky tests'
      });
    }

    if (metrics.deployment.mttr > 4) {
      alerts.push({
        severity: 'warning',
        message: `MTTR ${metrics.deployment.mttr}h exceeds 4h target`,
        action: 'Review incident response and rollback procedures'
      });
    }

    return alerts;
  }
}
```

### Grafana Dashboard Configuration

```json
{
  "dashboard": {
    "title": "Code Quality Metrics",
    "panels": [
      {
        "title": "Test Coverage Trend",
        "type": "stat",
        "targets": [
          {
            "expr": "test_coverage_percentage",
            "legendFormat": "Coverage %"
          }
        ],
        "thresholds": [
          {"color": "red", "value": 0},
          {"color": "yellow", "value": 70},
          {"color": "green", "value": 80}
        ]
      },
      {
        "title": "Build Success Rate",
        "type": "singlestat",
        "targets": [
          {
            "expr": "rate(builds_successful[7d]) / rate(builds_total[7d]) * 100",
            "legendFormat": "Success Rate %"
          }
        ]
      },
      {
        "title": "Deployment Frequency",
        "type": "graph",
        "targets": [
          {
            "expr": "increase(deployments_total[1d])",
            "legendFormat": "Daily Deployments"
          }
        ]
      }
    ]
  }
}
```

## Team Retrospective Integration

```typescript
// retrospective-metrics.ts
interface RetrospectiveData {
  period: string;
  metrics: QualityMetrics;
  improvements: string[];
  blockers: string[];
  actions: ActionItem[];
}

class QualityRetrospective {
  generateRetrospectiveReport(
    currentMetrics: QualityMetrics,
    previousMetrics: QualityMetrics
  ): RetrospectiveData {
    const improvements = this.identifyImprovements(currentMetrics, previousMetrics);
    const regressions = this.identifyRegressions(currentMetrics, previousMetrics);

    return {
      period: "Last 2 weeks",
      metrics: currentMetrics,
      improvements,
      blockers: regressions,
      actions: this.generateActionItems(regressions)
    };
  }

  private generateActionItems(regressions: string[]): ActionItem[] {
    return regressions.map(regression => ({
      issue: regression,
      owner: this.assignOwner(regression),
      deadline: this.calculateDeadline(regression),
      priority: this.assessPriority(regression)
    }));
  }
}
```

## Metric Selection Guidelines

**Focus on Outcomes, Not Outputs**
- Track bug escape rate, not lines of code written
- Measure deployment success, not deployment count
- Monitor user error rates, not test count

**Balance Leading and Lagging Indicators**
- Leading: Code review time, test execution speed, complexity trends
- Lagging: Production bugs, customer satisfaction, performance metrics

**Ensure Actionability**
- Every metric should have a clear improvement action
- Thresholds should trigger specific response procedures
- Trends matter more than absolute values

## Anti-Patterns to Avoid

**❌ Vanity Metrics**: Tracking impressive numbers that don't correlate with quality (lines of code, number of commits).

**❌ Gaming Incentives**: Metrics that encourage harmful behavior (100% coverage leading to meaningless tests).

**❌ Alert Fatigue**: Too many alerts or alerts for non-actionable issues that train teams to ignore them.

**❌ Lagging-Only Metrics**: Only measuring outcomes without leading indicators to predict problems.

**❌ Manual Collection**: Requiring human effort to gather metrics reduces accuracy and sustainability.

## Related Standards

- [automated-quality-gates](../../docs/bindings/core/automated-quality-gates.md): Defines the automated thresholds that trigger alerts and block deployments
- [performance-testing-standards](../../docs/bindings/core/performance-testing-standards.md): Establishes performance benchmarks tracked in quality dashboards
- [ci-cd-pipeline-standards](../../docs/bindings/core/ci-cd-pipeline-standards.md): Pipeline metrics that feed into overall quality monitoring

## References

- [DORA Metrics](https://cloud.google.com/blog/products/devops-sre/using-the-four-keys-to-measure-your-devops-performance)
- [SonarQube Quality Gates](https://docs.sonarqube.org/latest/user-guide/quality-gates/)
- [Grafana Dashboard Best Practices](https://grafana.com/docs/grafana/latest/dashboards/build-dashboards/best-practices/)
