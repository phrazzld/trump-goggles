---
id: automated-quality-gates
last_modified: '2025-06-15'
version: '0.1.0'
derived_from: fix-broken-windows
enforced_by: 'CI/CD pipelines, pre-commit hooks, automated testing, code analysis tools'
---

# Binding: Establish Comprehensive Automated Quality Gates

Implement automated validation checkpoints that prevent low-quality code from progressing through the development pipeline. Create systematic barriers that catch quality issues early, before they can compound into larger system problems.

## Rationale

This binding implements our fix-broken-windows tenet by creating automated systems that prevent quality degradation before it begins. Quality gates act as checkpoints that enforce standards consistently, objectively, and without human error or oversight. When quality issues can slip through manual processes due to time pressure, automated gates provide reliable protection against quality decay.

Manual quality assurance is insufficient because it's inconsistent and prone to error. Automated quality gates eliminate this variability by applying the same rigorous standards to every change, creating a foundation of quality that teams can build upon with confidence.

## Rule Definition

**MUST** implement quality gates at multiple pipeline stages:
- Pre-commit hooks for immediate feedback
- Pull request validation for team review
- Continuous integration for comprehensive testing
- Pre-deployment validation for production readiness

**MUST** validate these quality categories:
- Code quality (syntax, complexity, style, duplication)
- Security (vulnerability scanning, dependency analysis)
- Testing (coverage thresholds, regression detection)
- Performance (benchmarking, resource usage validation)

**MUST** provide fast feedback with specific, actionable guidance for resolution.

**MUST** implement escalating rigor as code progresses through the pipeline.

**SHOULD** include emergency override mechanisms with audit trails for critical production fixes.

## Quality Gate Implementation

```yaml
# .github/workflows/quality-gates.yml
name: Quality Gates
on: [push, pull_request]

jobs:
  pre-flight-checks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci

      # Code Quality Gate
      - name: Code Quality Validation
        run: |
          echo "🔍 Running code quality checks..."
          npm run lint || { echo "❌ Linting failed. Run 'npm run lint:fix' to resolve."; exit 1; }
          npm run format:check || { echo "❌ Formatting issues. Run 'npm run format' to fix."; exit 1; }

          # Complexity check
          npx complexity-report --format json --output complexity.json src/
          COMPLEXITY=$(node -p "JSON.parse(require('fs').readFileSync('complexity.json')).summary.average.complexity")
          if (( $(echo "$COMPLEXITY > 10" | bc -l) )); then
            echo "❌ Average complexity $COMPLEXITY exceeds threshold of 10"
            exit 1
          fi
          echo "✅ Code quality checks passed"

      # Security Gate
      - name: Security Validation
        run: |
          echo "🛡️ Running security checks..."
          npm audit --audit-level=moderate || {
            echo "❌ Security vulnerabilities found. Run 'npm audit fix' to resolve.";
            exit 1;
          }

          # Check for hardcoded secrets
          if grep -r "password\|secret\|token\|key" src/ --include="*.ts" --include="*.js" | grep -v "test" | grep -v "example"; then
            echo "❌ Potential hardcoded secrets detected"
            exit 1
          fi
          echo "✅ Security checks passed"

      # Testing Gate
      - name: Testing Validation
        run: |
          echo "🧪 Running test validation..."
          npm test -- --coverage --reporter=json > test-results.json

          # Check test results
          FAILURES=$(node -p "JSON.parse(require('fs').readFileSync('test-results.json')).stats.failures || 0")
          if [ "$FAILURES" -gt 0 ]; then
            echo "❌ $FAILURES test(s) failed"
            exit 1
          fi

          # Check coverage
          COVERAGE=$(node -p "JSON.parse(require('fs').readFileSync('coverage/coverage-summary.json')).total.lines.pct")
          if (( $(echo "$COVERAGE < 85" | bc -l) )); then
            echo "❌ Coverage $COVERAGE% is below 85% threshold"
            echo "Add tests for uncovered code or update coverage threshold if appropriate"
            exit 1
          fi
          echo "✅ Testing validation passed with $COVERAGE% coverage"

  performance-gates:
    needs: pre-flight-checks
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci

      # Performance Gate
      - name: Performance Validation
        run: |
          echo "⚡ Running performance validation..."
          npm run build:production

          # Bundle size check
          BUNDLE_SIZE=$(du -k dist/main.js | cut -f1)
          if [ "$BUNDLE_SIZE" -gt 500 ]; then
            echo "❌ Bundle size ${BUNDLE_SIZE}KB exceeds 500KB limit"
            echo "Consider code splitting or removing unnecessary dependencies"
            exit 1
          fi

          # Performance benchmark
          npm run benchmark > benchmark-results.txt
          RESPONSE_TIME=$(grep "Average response time" benchmark-results.txt | awk '{print $4}' | sed 's/ms//')
          if (( $(echo "$RESPONSE_TIME > 200" | bc -l) )); then
            echo "❌ Average response time ${RESPONSE_TIME}ms exceeds 200ms threshold"
            exit 1
          fi
          echo "✅ Performance validation passed (${RESPONSE_TIME}ms avg, ${BUNDLE_SIZE}KB bundle)"

  integration-gates:
    needs: [pre-flight-checks, performance-gates]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' || github.event_name == 'pull_request'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci

      # Integration Testing Gate
      - name: Integration Validation
        run: |
          echo "🔗 Running integration validation..."

          # Start test environment
          docker-compose -f docker-compose.test.yml up -d
          sleep 30

          # Run integration tests
          npm run test:integration || {
            echo "❌ Integration tests failed"
            docker-compose -f docker-compose.test.yml logs
            docker-compose -f docker-compose.test.yml down
            exit 1
          }

          # Cleanup
          docker-compose -f docker-compose.test.yml down
          echo "✅ Integration validation passed"

      # Documentation Gate
      - name: Documentation Validation
        run: |
          echo "📚 Validating documentation..."

          # Check for README updates on API changes
          if git diff --name-only HEAD~1 | grep -E "(api|interface)" && ! git diff --name-only HEAD~1 | grep README; then
            echo "❌ API changes detected but README not updated"
            echo "Update README.md to document API changes"
            exit 1
          fi

          # Validate TypeScript documentation
          npx typedoc --validation.notExported --validation.invalidLink
          echo "✅ Documentation validation passed"

  deployment-readiness:
    needs: [pre-flight-checks, performance-gates, integration-gates]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci

      # Final Production Gates
      - name: Production Readiness Validation
        run: |
          echo "🚀 Validating production readiness..."

          # Ensure all environment variables are documented
          if ! test -f .env.example; then
            echo "❌ Missing .env.example file"
            echo "Create .env.example with all required environment variables"
            exit 1
          fi

          # Health check endpoint test
          npm run build:production
          npm start &
          APP_PID=$!
          sleep 10

          if ! curl -f http://localhost:3000/health; then
            echo "❌ Health check endpoint failed"
            kill $APP_PID
            exit 1
          fi

          kill $APP_PID
          echo "✅ Production readiness validated"

      # Emergency Override Mechanism
      - name: Check Emergency Override
        if: contains(github.event.head_commit.message, '[emergency-deploy]')
        run: |
          echo "🚨 Emergency deployment override detected"
          echo "Override authorized by: ${{ github.actor }}"
          echo "Commit: ${{ github.sha }}"
          echo "This override will be audited and reviewed post-deployment"

          # Log to audit system (replace with actual audit endpoint)
          curl -X POST "${{ secrets.AUDIT_WEBHOOK_URL }}" \
            -H "Content-Type: application/json" \
            -d '{
              "event": "emergency_override",
              "actor": "${{ github.actor }}",
              "commit": "${{ github.sha }}",
              "message": "${{ github.event.head_commit.message }}",
              "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
            }'
```

## ❌ Anti-Pattern Example

```yaml
# Bad: Single massive validation step
- name: Check Everything
  run: npm run lint && npm test && npm run security-check && npm run deploy
```

## Quality Gate Reporting

```yaml
# Add to end of workflow for comprehensive reporting
  quality-report:
    needs: [pre-flight-checks, performance-gates, integration-gates, deployment-readiness]
    runs-on: ubuntu-latest
    if: always()
    steps:
      - name: Generate Quality Report
        run: |
          echo "📊 Quality Gates Summary"
          echo "Pre-flight: ${{ needs.pre-flight-checks.result }}"
          echo "Performance: ${{ needs.performance-gates.result }}"
          echo "Integration: ${{ needs.integration-gates.result }}"
          echo "Deployment: ${{ needs.deployment-readiness.result }}"
```

## Implementation Guidelines

**Progressive Enhancement**: Start with basic gates (lint, test, security) and add complexity gradually.

**Clear Failure Messages**: Each gate should provide specific guidance on resolution when it fails.

**Performance Optimization**: Run gates in parallel where possible to minimize total pipeline time.

**Emergency Procedures**: Include documented override mechanisms for critical production fixes with full audit trails.

## Monitoring and Maintenance

**Gate Effectiveness**: Track which gates catch the most issues to optimize validation priorities.

**Performance Impact**: Monitor pipeline execution time and adjust parallelization as needed.

**False Positives**: Regularly review and tune thresholds to minimize unnecessary build failures.

**Coverage Analysis**: Ensure quality gates catch the types of issues that matter most to your system.

## Related Standards

- [ci-cd-pipeline-standards](../../docs/bindings/core/ci-cd-pipeline-standards.md): Pipeline architecture that implements these quality gates
- [git-hooks-automation](../../docs/bindings/core/git-hooks-automation.md): Pre-commit validation that provides immediate quality feedback
- [use-structured-logging](../../docs/bindings/core/use-structured-logging.md): Observability practices that support quality gate monitoring

## References

- [GitHub Actions Quality Gates](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Continuous Integration Best Practices](https://martinfowler.com/articles/continuousIntegration.html)
- [Quality Gates in DevOps](https://www.atlassian.com/devops/frameworks/quality-gates)
