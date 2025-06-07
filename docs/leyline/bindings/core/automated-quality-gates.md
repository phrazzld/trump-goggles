---
id: automated-quality-gates
last_modified: '2025-06-02'
derived_from: fix-broken-windows
enforced_by: 'CI/CD pipelines, pre-commit hooks, automated testing, code analysis tools'
---

# Binding: Establish Comprehensive Automated Quality Gates

Implement automated validation checkpoints that prevent low-quality code from progressing through the development pipeline. Create systematic barriers that catch quality issues early, before they can compound into larger system problems.

## Rationale

This binding implements our fix-broken-windows tenet by creating automated systems that prevent quality degradation before it begins. Quality gates act as checkpoints that enforce standards consistently, objectively, and without human error or oversight. When quality issues can slip through manual processes due to time pressure, oversight, or inconsistent application of standards, automated gates provide reliable protection against quality decay.

Think of quality gates like a series of inspection stations in a manufacturing process. Each station checks for specific defects and prevents flawed products from continuing down the line. Without these checkpoints, defects accumulate and compound, ultimately producing unreliable products that are expensive to fix or must be scrapped entirely. In software development, quality gates catch issues like failing tests, security vulnerabilities, performance regressions, and standard violations before they become entrenched in the codebase.

Manual quality assurance is insufficient because it's inconsistent, time-consuming, and prone to human error. Under pressure, manual checks are often rushed or skipped entirely. Automated quality gates eliminate this variability by applying the same rigorous standards to every change, regardless of deadlines or workload. This creates a foundation of quality that teams can build upon with confidence, knowing that fundamental issues have been systematically prevented.

## Rule Definition

Automated quality gates must establish these validation principles:

- **Comprehensive Coverage**: Implement quality checks at multiple levels including code quality, security, performance, documentation, and functional correctness. No single type of quality issue should be able to slip through without detection.

- **Fast Feedback**: Provide rapid feedback to developers so quality issues can be fixed while the context is still fresh. Gates should fail fast and provide actionable guidance for resolution.

- **Consistent Enforcement**: Apply the same quality standards to all code changes regardless of author, urgency, or scope. No mechanism should exist to bypass quality gates except in documented emergency procedures.

- **Escalating Rigor**: Implement increasingly rigorous quality checks as code progresses through the pipeline, with the most comprehensive validation occurring before production deployment.

- **Clear Standards**: Define explicit, measurable quality criteria that can be automatically validated. Avoid subjective or ambiguous quality requirements that cannot be consistently enforced.

- **Actionable Results**: Provide specific, actionable feedback when quality gates fail, including clear guidance on how to resolve the issues and prevent similar problems in the future.

**Quality Gate Categories:**
- Code quality gates (syntax, complexity, duplication, style)
- Security gates (vulnerability scanning, dependency analysis)
- Testing gates (coverage, test execution, regression detection)
- Performance gates (benchmarking, resource usage, latency)
- Documentation gates (completeness, accuracy, format validation)
- Compliance gates (regulatory requirements, organizational policies)

**Pipeline Integration Points:**
- Pre-commit hooks for immediate feedback
- Pull request validation for team review
- Continuous integration for comprehensive testing
- Pre-deployment validation for production readiness
- Post-deployment monitoring for runtime quality

## Practical Implementation

1. **Implement Multi-Layer Validation**: Create quality gates at different stages of the development pipeline, each with appropriate scope and rigor for its position in the workflow.

2. **Establish Quality Metrics**: Define specific, measurable quality criteria that can be automatically validated, such as test coverage percentages, complexity thresholds, and performance benchmarks.

3. **Create Fast Feedback Loops**: Ensure that quality gates provide rapid feedback so developers can address issues while the context is still fresh and the cost of fixing is minimal.

4. **Design Emergency Overrides**: Implement controlled mechanisms for bypassing quality gates in true emergencies, with full audit trails and automatic follow-up processes.

5. **Monitor Gate Effectiveness**: Track the effectiveness of quality gates by monitoring the types and frequency of issues they catch, and continuously improve gate configuration based on this data.

## Examples

```yaml
# ❌ BAD: Minimal, inconsistent quality checks
# .github/workflows/basic-ci.yml
name: Basic CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm test  # Only basic tests, no quality gates

  deploy:
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - run: echo "Deploying to production"  # No validation!

# Problems:
# 1. No code quality validation
# 2. No security scanning
# 3. No performance testing
# 4. No documentation checks
# 5. Direct deployment without comprehensive validation
```

```yaml
# ✅ GOOD: Comprehensive automated quality gates
# .github/workflows/quality-gates.yml
name: Quality Gates Pipeline
on: [push, pull_request]

env:
  NODE_VERSION: '18'
  QUALITY_THRESHOLD_COVERAGE: 85
  QUALITY_THRESHOLD_COMPLEXITY: 10
  QUALITY_THRESHOLD_DUPLICATION: 3

jobs:
  # Gate 1: Code Quality and Standards
  code-quality:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
        with:
          fetch-depth: 0  # Full history for better analysis

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint code
        run: |
          npm run lint
          # Fail if any linting errors
          if [ $? -ne 0 ]; then
            echo "❌ Code quality gate failed: Linting errors found"
            exit 1
          fi

      - name: Check code formatting
        run: |
          npm run format:check
          if [ $? -ne 0 ]; then
            echo "❌ Code quality gate failed: Formatting violations found"
            echo "Run 'npm run format' to fix formatting issues"
            exit 1
          fi

      - name: Analyze code complexity
        run: |
          npm run complexity:check
          if [ $? -ne 0 ]; then
            echo "❌ Code quality gate failed: Complexity threshold exceeded"
            exit 1
          fi

      - name: Check for code duplication
        run: |
          npm run duplication:check
          if [ $? -ne 0 ]; then
            echo "❌ Code quality gate failed: Code duplication detected"
            exit 1
          fi

      - name: Validate commit messages
        run: |
          npm run commitlint -- --from=origin/main --to=HEAD
          if [ $? -ne 0 ]; then
            echo "❌ Code quality gate failed: Invalid commit messages"
            exit 1
          fi

  # Gate 2: Security Validation
  security-gates:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Audit dependencies
        run: |
          npm audit --audit-level=high
          if [ $? -ne 0 ]; then
            echo "❌ Security gate failed: High/critical vulnerabilities in dependencies"
            echo "Run 'npm audit fix' to resolve security issues"
            exit 1
          fi

      - name: Static security analysis
        run: |
          npm run security:scan
          if [ $? -ne 0 ]; then
            echo "❌ Security gate failed: Security vulnerabilities detected in code"
            exit 1
          fi

      - name: Check for secrets in code
        uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          base: main
          head: HEAD

      - name: License compliance check
        run: |
          npm run license:check
          if [ $? -ne 0 ]; then
            echo "❌ Security gate failed: License compliance violations"
            exit 1
          fi

  # Gate 3: Testing and Coverage
  testing-gates:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: |
          npm run test:unit
          if [ $? -ne 0 ]; then
            echo "❌ Testing gate failed: Unit tests failing"
            exit 1
          fi

      - name: Run integration tests
        run: |
          npm run test:integration
          if [ $? -ne 0 ]; then
            echo "❌ Testing gate failed: Integration tests failing"
            exit 1
          fi

      - name: Check test coverage
        run: |
          npm run test:coverage
          COVERAGE=$(npm run test:coverage:report --silent | grep "All files" | awk '{print $10}' | sed 's/%//')
          if [ ${COVERAGE%.*} -lt ${{ env.QUALITY_THRESHOLD_COVERAGE }} ]; then
            echo "❌ Testing gate failed: Test coverage ${COVERAGE}% below threshold ${{ env.QUALITY_THRESHOLD_COVERAGE }}%"
            exit 1
          fi
          echo "✅ Test coverage: ${COVERAGE}%"

      - name: Mutation testing
        run: |
          npm run test:mutation
          if [ $? -ne 0 ]; then
            echo "⚠️ Mutation testing failed: Test quality may be insufficient"
            # Note: Might be warning vs failure depending on maturity
          fi

  # Gate 4: Performance Validation
  performance-gates:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build

      - name: Bundle size analysis
        run: |
          npm run analyze:bundle
          BUNDLE_SIZE=$(npm run bundle:size --silent)
          MAX_BUNDLE_SIZE=1048576  # 1MB limit
          if [ $BUNDLE_SIZE -gt $MAX_BUNDLE_SIZE ]; then
            echo "❌ Performance gate failed: Bundle size ${BUNDLE_SIZE} exceeds limit ${MAX_BUNDLE_SIZE}"
            exit 1
          fi

      - name: Performance benchmarks
        run: |
          npm run perf:benchmark
          if [ $? -ne 0 ]; then
            echo "❌ Performance gate failed: Performance regression detected"
            exit 1
          fi

      - name: Memory leak detection
        run: |
          npm run test:memory-leaks
          if [ $? -ne 0 ]; then
            echo "❌ Performance gate failed: Memory leaks detected"
            exit 1
          fi

  # Gate 5: Documentation and API Validation
  documentation-gates:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Validate API documentation
        run: |
          npm run docs:api:validate
          if [ $? -ne 0 ]; then
            echo "❌ Documentation gate failed: API documentation is invalid or incomplete"
            exit 1
          fi

      - name: Check README accuracy
        run: |
          npm run docs:readme:check
          if [ $? -ne 0 ]; then
            echo "❌ Documentation gate failed: README is outdated or incomplete"
            exit 1
          fi

      - name: Validate code examples
        run: |
          npm run docs:examples:test
          if [ $? -ne 0 ]; then
            echo "❌ Documentation gate failed: Code examples in documentation are broken"
            exit 1
          fi

  # Pre-deployment validation (most rigorous)
  pre-deployment-gates:
    needs: [code-quality, security-gates, testing-gates, performance-gates, documentation-gates]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: End-to-end testing
        run: |
          npm run test:e2e:production
          if [ $? -ne 0 ]; then
            echo "❌ Pre-deployment gate failed: E2E tests failing"
            exit 1
          fi

      - name: Load testing
        run: |
          npm run test:load
          if [ $? -ne 0 ]; then
            echo "❌ Pre-deployment gate failed: Load testing failed"
            exit 1
          fi

      - name: Database migration validation
        run: |
          npm run db:migrate:validate
          if [ $? -ne 0 ]; then
            echo "❌ Pre-deployment gate failed: Database migrations invalid"
            exit 1
          fi

      - name: Infrastructure validation
        run: |
          npm run infra:validate
          if [ $? -ne 0 ]; then
            echo "❌ Pre-deployment gate failed: Infrastructure configuration invalid"
            exit 1
          fi

      - name: Security scan (final)
        run: |
          npm run security:scan:comprehensive
          if [ $? -ne 0 ]; then
            echo "❌ Pre-deployment gate failed: Final security scan failed"
            exit 1
          fi

      - name: Generate deployment artifact
        run: |
          npm run build:production
          npm run package:deployment

      - name: Validate deployment artifact
        run: |
          npm run artifact:validate
          if [ $? -ne 0 ]; then
            echo "❌ Pre-deployment gate failed: Deployment artifact validation failed"
            exit 1
          fi

  # Quality gate reporting
  quality-report:
    needs: [code-quality, security-gates, testing-gates, performance-gates, documentation-gates]
    if: always()
    runs-on: ubuntu-latest
    steps:
      - name: Generate quality report
        run: |
          echo "## Quality Gates Report" >> $GITHUB_STEP_SUMMARY
          echo "| Gate | Status |" >> $GITHUB_STEP_SUMMARY
          echo "|------|--------|" >> $GITHUB_STEP_SUMMARY
          echo "| Code Quality | ${{ needs.code-quality.result == 'success' && '✅ Pass' || '❌ Fail' }} |" >> $GITHUB_STEP_SUMMARY
          echo "| Security | ${{ needs.security-gates.result == 'success' && '✅ Pass' || '❌ Fail' }} |" >> $GITHUB_STEP_SUMMARY
          echo "| Testing | ${{ needs.testing-gates.result == 'success' && '✅ Pass' || '❌ Fail' }} |" >> $GITHUB_STEP_SUMMARY
          echo "| Performance | ${{ needs.performance-gates.result == 'success' && '✅ Pass' || '❌ Fail' }} |" >> $GITHUB_STEP_SUMMARY
          echo "| Documentation | ${{ needs.documentation-gates.result == 'success' && '✅ Pass' || '❌ Fail' }} |" >> $GITHUB_STEP_SUMMARY
```

```typescript
// ❌ BAD: Manual, inconsistent quality checks
class PullRequestReview {
  async reviewCode(pullRequest: PullRequest): Promise<ReviewResult> {
    // Manual checks - inconsistent and incomplete

    // Sometimes check tests, sometimes don't
    const hasTests = this.checkIfTestsExist(pullRequest);

    // Manual code review - subjective and time-consuming
    const codeQuality = this.manualCodeReview(pullRequest);

    // No security scanning
    // No performance validation
    // No documentation checks

    return {
      approved: hasTests && codeQuality === 'good',
      comments: ['Looks good to me'] // Generic feedback
    };
  }
}

// ✅ GOOD: Automated quality gate system
interface QualityGate {
  name: string;
  execute(codebase: Codebase): Promise<QualityGateResult>;
  getRequirements(): QualityRequirement[];
}

interface QualityGateResult {
  passed: boolean;
  score: number;
  issues: QualityIssue[];
  recommendations: string[];
  executionTime: number;
}

interface QualityIssue {
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  description: string;
  location: string;
  suggestion: string;
}

interface QualityRequirement {
  name: string;
  threshold: number;
  description: string;
}

class CodeQualityGate implements QualityGate {
  name = 'Code Quality';

  constructor(
    private linter: Linter,
    private complexityAnalyzer: ComplexityAnalyzer,
    private duplicationDetector: DuplicationDetector
  ) {}

  async execute(codebase: Codebase): Promise<QualityGateResult> {
    const startTime = Date.now();
    const issues: QualityIssue[] = [];

    // Linting validation
    const lintResults = await this.linter.analyze(codebase);
    for (const violation of lintResults.violations) {
      issues.push({
        severity: violation.severity,
        category: 'style',
        description: violation.message,
        location: `${violation.file}:${violation.line}`,
        suggestion: violation.fix || 'See linting rule documentation'
      });
    }

    // Complexity analysis
    const complexityResults = await this.complexityAnalyzer.analyze(codebase);
    for (const file of complexityResults.files) {
      if (file.cyclomaticComplexity > 10) {
        issues.push({
          severity: file.cyclomaticComplexity > 20 ? 'high' : 'medium',
          category: 'complexity',
          description: `High cyclomatic complexity: ${file.cyclomaticComplexity}`,
          location: file.path,
          suggestion: 'Consider breaking down complex functions into smaller, focused units'
        });
      }
    }

    // Duplication detection
    const duplicationResults = await this.duplicationDetector.analyze(codebase);
    for (const duplicate of duplicationResults.duplicates) {
      issues.push({
        severity: duplicate.similarity > 90 ? 'high' : 'medium',
        category: 'duplication',
        description: `Code duplication detected (${duplicate.similarity}% similar)`,
        location: duplicate.locations.join(', '),
        suggestion: 'Extract common functionality into shared utilities'
      });
    }

    // Calculate overall score
    const criticalIssues = issues.filter(i => i.severity === 'critical').length;
    const highIssues = issues.filter(i => i.severity === 'high').length;
    const mediumIssues = issues.filter(i => i.severity === 'medium').length;

    const score = Math.max(0, 100 - (criticalIssues * 25) - (highIssues * 10) - (mediumIssues * 5));
    const passed = criticalIssues === 0 && highIssues === 0 && score >= 80;

    return {
      passed,
      score,
      issues,
      recommendations: this.generateRecommendations(issues),
      executionTime: Date.now() - startTime
    };
  }

  getRequirements(): QualityRequirement[] {
    return [
      { name: 'No critical issues', threshold: 0, description: 'Code must not contain critical quality violations' },
      { name: 'No high-severity issues', threshold: 0, description: 'Code must not contain high-severity issues' },
      { name: 'Quality score', threshold: 80, description: 'Overall quality score must be 80 or higher' }
    ];
  }

  private generateRecommendations(issues: QualityIssue[]): string[] {
    const recommendations: string[] = [];

    const complexityIssues = issues.filter(i => i.category === 'complexity');
    if (complexityIssues.length > 0) {
      recommendations.push('Consider refactoring complex functions using the Extract Method pattern');
    }

    const duplicationIssues = issues.filter(i => i.category === 'duplication');
    if (duplicationIssues.length > 0) {
      recommendations.push('Eliminate code duplication by extracting common logic into shared utilities');
    }

    const styleIssues = issues.filter(i => i.category === 'style');
    if (styleIssues.length > 5) {
      recommendations.push('Consider running auto-formatter to resolve style violations');
    }

    return recommendations;
  }
}

class SecurityGate implements QualityGate {
  name = 'Security';

  constructor(
    private vulnerabilityScanner: VulnerabilityScanner,
    private dependencyAnalyzer: DependencyAnalyzer,
    private secretScanner: SecretScanner
  ) {}

  async execute(codebase: Codebase): Promise<QualityGateResult> {
    const startTime = Date.now();
    const issues: QualityIssue[] = [];

    // Vulnerability scanning
    const vulnResults = await this.vulnerabilityScanner.scan(codebase);
    for (const vuln of vulnResults.vulnerabilities) {
      issues.push({
        severity: vuln.severity,
        category: 'security',
        description: `Security vulnerability: ${vuln.name}`,
        location: vuln.location,
        suggestion: vuln.remediation
      });
    }

    // Dependency analysis
    const depResults = await this.dependencyAnalyzer.analyze(codebase);
    for (const dep of depResults.vulnerableDependencies) {
      issues.push({
        severity: dep.highestSeverity,
        category: 'dependency',
        description: `Vulnerable dependency: ${dep.name} (${dep.vulnerabilityCount} issues)`,
        location: dep.manifestFile,
        suggestion: `Update to version ${dep.fixedVersion} or later`
      });
    }

    // Secret scanning
    const secretResults = await this.secretScanner.scan(codebase);
    for (const secret of secretResults.secrets) {
      issues.push({
        severity: 'critical',
        category: 'secrets',
        description: `Potential secret detected: ${secret.type}`,
        location: secret.location,
        suggestion: 'Remove hardcoded secrets and use environment variables or secret management'
      });
    }

    const criticalIssues = issues.filter(i => i.severity === 'critical').length;
    const highIssues = issues.filter(i => i.severity === 'high').length;

    return {
      passed: criticalIssues === 0 && highIssues === 0,
      score: Math.max(0, 100 - (criticalIssues * 50) - (highIssues * 20)),
      issues,
      recommendations: [
        'Implement security scanning in CI/CD pipeline',
        'Regular dependency updates and security patches',
        'Use secrets management for sensitive configuration'
      ],
      executionTime: Date.now() - startTime
    };
  }

  getRequirements(): QualityRequirement[] {
    return [
      { name: 'No critical vulnerabilities', threshold: 0, description: 'Code must not contain critical security issues' },
      { name: 'No high-severity vulnerabilities', threshold: 0, description: 'Code must not contain high-severity security issues' },
      { name: 'No hardcoded secrets', threshold: 0, description: 'Code must not contain hardcoded secrets or credentials' }
    ];
  }
}

class QualityGateOrchestrator {
  private gates: QualityGate[] = [];

  constructor(private notificationService: NotificationService) {}

  addGate(gate: QualityGate): void {
    this.gates.push(gate);
  }

  async executeAllGates(codebase: Codebase): Promise<QualityGateReport> {
    const results: QualityGateResult[] = [];
    const startTime = Date.now();

    console.log('🚪 Executing quality gates...');

    for (const gate of this.gates) {
      console.log(`⚡ Running ${gate.name} gate...`);

      try {
        const result = await gate.execute(codebase);
        results.push(result);

        if (result.passed) {
          console.log(`✅ ${gate.name} gate passed (score: ${result.score})`);
        } else {
          console.log(`❌ ${gate.name} gate failed (${result.issues.length} issues)`);

          // Log critical issues immediately
          const criticalIssues = result.issues.filter(i => i.severity === 'critical');
          for (const issue of criticalIssues) {
            console.log(`  🚨 CRITICAL: ${issue.description} at ${issue.location}`);
          }
        }
      } catch (error) {
        console.log(`💥 ${gate.name} gate execution failed: ${error.message}`);
        results.push({
          passed: false,
          score: 0,
          issues: [{
            severity: 'critical',
            category: 'gate-failure',
            description: `Gate execution failed: ${error.message}`,
            location: 'gate-orchestrator',
            suggestion: 'Check gate configuration and dependencies'
          }],
          recommendations: ['Fix gate execution issues before proceeding'],
          executionTime: 0
        });
      }
    }

    const report = this.generateReport(results, Date.now() - startTime);

    // Notify stakeholders of results
    if (!report.overallPassed) {
      await this.notificationService.notifyQualityGateFailure(report);
    }

    return report;
  }

  private generateReport(results: QualityGateResult[], totalTime: number): QualityGateReport {
    const allIssues = results.flatMap(r => r.issues);
    const criticalIssues = allIssues.filter(i => i.severity === 'critical');
    const highIssues = allIssues.filter(i => i.severity === 'high');

    const overallPassed = results.every(r => r.passed);
    const averageScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;

    return {
      overallPassed,
      averageScore: Math.round(averageScore),
      gateResults: results,
      summary: {
        totalGates: this.gates.length,
        passedGates: results.filter(r => r.passed).length,
        totalIssues: allIssues.length,
        criticalIssues: criticalIssues.length,
        highIssues: highIssues.length
      },
      executionTime: totalTime,
      recommendations: this.generateOverallRecommendations(results)
    };
  }

  private generateOverallRecommendations(results: QualityGateResult[]): string[] {
    const recommendations: string[] = [];

    const failedGates = results.filter(r => !r.passed);
    if (failedGates.length > 0) {
      recommendations.push(`Address issues in ${failedGates.length} failing quality gates`);
    }

    const allIssues = results.flatMap(r => r.issues);
    const criticalCount = allIssues.filter(i => i.severity === 'critical').length;
    if (criticalCount > 0) {
      recommendations.push(`Immediately fix ${criticalCount} critical issues`);
    }

    const securityIssues = allIssues.filter(i => i.category === 'security' || i.category === 'dependency');
    if (securityIssues.length > 0) {
      recommendations.push('Priority: Resolve security vulnerabilities');
    }

    return recommendations;
  }
}

interface QualityGateReport {
  overallPassed: boolean;
  averageScore: number;
  gateResults: QualityGateResult[];
  summary: {
    totalGates: number;
    passedGates: number;
    totalIssues: number;
    criticalIssues: number;
    highIssues: number;
  };
  executionTime: number;
  recommendations: string[];
}

// Usage example
const qualityOrchestrator = new QualityGateOrchestrator(notificationService);

// Configure quality gates
qualityOrchestrator.addGate(new CodeQualityGate(linter, complexityAnalyzer, duplicationDetector));
qualityOrchestrator.addGate(new SecurityGate(vulnerabilityScanner, dependencyAnalyzer, secretScanner));
qualityOrchestrator.addGate(new TestingGate(testRunner, coverageAnalyzer));
qualityOrchestrator.addGate(new PerformanceGate(benchmarkRunner, bundleAnalyzer));

// Execute all gates
const report = await qualityOrchestrator.executeAllGates(codebase);

if (!report.overallPassed) {
  console.log('❌ Quality gates failed - blocking deployment');
  process.exit(1);
} else {
  console.log('✅ All quality gates passed - proceeding with deployment');
}
```

## Related Bindings

- [technical-debt-tracking.md](../../docs/bindings/core/technical-debt-tracking.md): Quality gates prevent new technical debt while debt tracking manages existing debt. Both bindings create a comprehensive approach to maintaining code quality through prevention and systematic remediation.

- [continuous-refactoring.md](../../docs/bindings/core/continuous-refactoring.md): Quality gates can include refactoring recommendations and prevent code that violates quality standards from entering the codebase. Both bindings work together to maintain high code quality over time.

- [no-lint-suppression.md](../../docs/bindings/core/no-lint-suppression.md): Quality gates should enforce lint rules without allowing suppressions. Both bindings prevent the accumulation of quality violations through systematic enforcement of coding standards.

- [use-structured-logging.md](../../docs/bindings/core/use-structured-logging.md): Quality gates can validate that proper logging practices are followed throughout the codebase. Both bindings support systematic quality enforcement and operational excellence.
