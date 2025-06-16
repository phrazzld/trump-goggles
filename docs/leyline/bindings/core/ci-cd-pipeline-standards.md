---
id: ci-cd-pipeline-standards
last_modified: '2025-06-09'
version: '0.1.0'
derived_from: automation
enforced_by: 'CI/CD platforms, automated quality gates, deployment pipelines, monitoring systems'
---
# Binding: Establish Standardized CI/CD Pipeline Architecture

Implement consistent, automated CI/CD pipelines that enforce quality gates, security standards, and deployment practices across all platforms. Create systematic automation that ensures every code change progresses through comprehensive validation before reaching production environments.

## Rationale

This binding extends our automation tenet by establishing CI/CD pipelines as the backbone of development workflow automation. While git hooks provide immediate local feedback, CI/CD pipelines serve as the authoritative quality enforcement layer that validates all changes in controlled, reproducible environments before they can impact users.

Think of CI/CD pipelines as a factory assembly line with rigorous quality control at every station. Each stage validates specific aspects of code quality, security, and functionality, with automated gates that prevent defective changes from advancing. Unlike manual testing and deployment processes that are prone to human error and inconsistent execution, automated pipelines apply the same rigorous standards to every change, regardless of time pressure or complexity.

The investment in comprehensive CI/CD automation pays exponential dividends through reduced manual effort, faster feedback cycles, and dramatically improved reliability. Teams with robust pipeline automation can deploy multiple times per day with confidence, while teams relying on manual processes struggle to deploy weekly without significant risk. This automation becomes the foundation that enables rapid iteration and continuous delivery of value to users.

## Rule Definition

Standardized CI/CD pipelines must implement these core stages and principles:

- **Standardized Pipeline Stages**: Every pipeline must include setup, validation, security scanning, testing, building, and deployment verification stages with consistent behavior across platforms.

- **Fail-Fast Principles**: Pipelines must fail immediately when critical issues are detected, providing rapid feedback and preventing waste of computational resources on fundamentally flawed changes.

- **Security-First Integration**: Security scanning, vulnerability assessment, and compliance validation must be mandatory pipeline stages that cannot be bypassed or disabled.

- **Comprehensive Quality Gates**: Integrate multiple validation layers including automated testing, code coverage analysis, performance benchmarking, and deployment verification.

- **Platform-Agnostic Patterns**: Use consistent approaches and tooling across different CI/CD platforms to minimize cognitive overhead and enable team mobility between projects.

- **Observability and Monitoring**: Include comprehensive logging, metrics collection, and alerting to enable rapid diagnosis of pipeline failures and performance issues.

**Required Pipeline Stages:**
- Environment setup and dependency installation
- Code quality validation (linting, formatting, complexity analysis)
- Security scanning (vulnerabilities, secrets, compliance)
- Automated testing (unit, integration, end-to-end)
- Performance and load testing for critical paths
- Build artifact creation and verification
- Deployment to staging/production environments
- Post-deployment verification and monitoring

**Quality Gate Enforcement:**
- All tests must pass with minimum coverage thresholds
- No critical or high-severity security vulnerabilities
- Performance benchmarks within acceptable ranges
- Successful deployment verification in staging environment

## Tiered Implementation Approach

This binding supports progressive CI/CD maturity through three implementation tiers, enabling teams to build robust automation incrementally:

### **🚀 Tier 1: Foundation Pipeline (Must Have)**
*Essential CI/CD automation for immediate quality assurance*

**Scope**: Basic validation with essential security and quality gates
**Time to implement**: 1-2 hours
**Team impact**: Immediate automated validation, prevents broken deployments

**Essential Components:**
- ✅ **Automated testing** - Unit tests with basic coverage requirements
- ✅ **Security scanning** - Dependency vulnerability detection
- ✅ **Build verification** - Ensure code compiles and packages correctly
- ✅ **Basic deployment** - Automated staging deployment with health checks

### **⚡ Tier 2: Enhanced Automation (Should Have)**
*Comprehensive validation with advanced quality gates*

**Scope**: Multi-stage validation with performance and integration testing
**Time to implement**: 4-6 hours
**Team impact**: Comprehensive quality assurance, reduced manual testing

**Enhanced Components:**
- ✅ **Multi-environment testing** - Unit, integration, and end-to-end tests
- ✅ **Code quality analysis** - Linting, complexity analysis, coverage reporting
- ✅ **Performance validation** - Load testing and benchmark comparisons
- ✅ **Security depth** - Static analysis, container scanning, compliance checks

### **🏆 Tier 3: Enterprise Integration (Nice to Have)**
*Advanced deployment strategies with full observability*

**Scope**: Production-grade automation with progressive deployment and monitoring
**Time to implement**: 8-12 hours
**Team impact**: Enterprise-grade reliability, zero-downtime deployments

**Advanced Components:**
- ✅ **Progressive deployment** - Blue-green, canary, and feature flag integration
- ✅ **Advanced monitoring** - APM integration, custom metrics, alerting
- ✅ **Multi-platform support** - Cross-platform builds and deployment strategies
- ✅ **Compliance automation** - Audit logging, security attestation, governance

## Practical Implementation

### Starting with Tier 1: Foundation Pipeline

1. **Select Primary Platform**: Choose based on your repository hosting:
   - **GitHub**: GitHub Actions (native integration, extensive marketplace)
   - **GitLab**: GitLab CI (built-in container registry, integrated security)
   - **Multi-platform**: Jenkins (flexible, self-hosted control)

2. **Implement Basic Testing Pipeline**: Start with automated test execution and build verification to catch obvious failures quickly.

3. **Add Essential Security Scanning**: Include dependency vulnerability scanning as a mandatory pipeline stage that blocks deployment on critical issues.

4. **Configure Staging Deployment**: Automate deployment to a staging environment with basic health check validation.

### Progressing to Tier 2: Enhanced Automation

1. **Expand Test Coverage**: Add integration and end-to-end testing with appropriate coverage thresholds for your project's risk profile.

2. **Integrate Code Quality Tools**: Add linting, complexity analysis, and code coverage reporting with configurable thresholds.

3. **Implement Performance Validation**: Include load testing and performance benchmarking to prevent performance regressions.

4. **Enhance Security Scanning**: Add static code analysis, container security scanning, and compliance validation.

### Advancing to Tier 3: Enterprise Integration

1. **Implement Progressive Deployment**: Configure blue-green or canary deployment strategies with automated rollback capabilities.

2. **Add Comprehensive Monitoring**: Integrate APM tools, custom metrics, and alerting for both pipeline and application monitoring.

3. **Enable Multi-Platform Support**: Support deployment to multiple environments and cloud providers with consistent automation.

4. **Implement Compliance Automation**: Add audit logging, security attestation, and governance reporting for enterprise requirements.

## Examples by Tier

### 🚀 Tier 1: Foundation Pipeline Examples

**Minimal Viable CI/CD (1 hour setup):**

```yaml
# .github/workflows/foundation.yml - Essential CI/CD pipeline
name: 🚀 Foundation Pipeline
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '20'
  COVERAGE_THRESHOLD: 70

jobs:
  # Essential validation
  validate:
    name: ✅ Essential Validation
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      # 🧪 ESSENTIAL: Basic testing
      - name: Run unit tests
        run: |
          npm run test -- --coverage --watchAll=false
          COVERAGE=$(npm run test:coverage:check --silent)
          if [ ${COVERAGE%.*} -lt ${{ env.COVERAGE_THRESHOLD }} ]; then
            echo "::error::Coverage ${COVERAGE}% below threshold ${{ env.COVERAGE_THRESHOLD }}%"
            exit 1
          fi

      # 🔒 ESSENTIAL: Security scanning
      - name: Audit dependencies
        run: |
          npm audit --audit-level=high
          if [ $? -ne 0 ]; then
            echo "::error::High/critical vulnerabilities found"
            exit 1
          fi

      # 🏗️ ESSENTIAL: Build verification
      - name: Build application
        run: |
          npm run build
          if [ $? -ne 0 ]; then
            echo "::error::Build failed"
            exit 1
          fi

  # Essential deployment
  deploy-staging:
    name: 🚀 Deploy to Staging
    runs-on: ubuntu-latest
    needs: validate
    if: github.ref == 'refs/heads/main'
    environment: staging
    steps:
      - name: Deploy to staging
        run: |
          echo "🚀 Deploying to staging..."
          # Deployment logic here
          sleep 5
          echo "✅ Staging deployment completed"

      - name: Basic health check
        run: |
          curl -f https://staging.example.com/health
          if [ $? -ne 0 ]; then
            echo "::error::Staging health check failed"
            exit 1
          fi
```

**GitLab CI Equivalent:**

```yaml
# .gitlab-ci.yml - Foundation pipeline
stages:
  - validate
  - deploy

variables:
  NODE_VERSION: "20"
  COVERAGE_THRESHOLD: "70"

validate:
  stage: validate
  image: node:${NODE_VERSION}
  cache:
    paths:
      - node_modules/
  script:
    # Install and test
    - npm ci
    - npm run test -- --coverage --watchAll=false
    - npm audit --audit-level=high
    - npm run build
  coverage: '/All files[^|]*\|[^|]*\s+([\d\.]+)/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml

deploy-staging:
  stage: deploy
  image: alpine:latest
  environment:
    name: staging
    url: https://staging.example.com
  script:
    - echo "🚀 Deploying to staging..."
    - sleep 5
    - curl -f https://staging.example.com/health
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
```

### ⚡ Tier 2: Enhanced Automation Examples

**Comprehensive Quality Gates (4-6 hours setup):**

```yaml
# .github/workflows/enhanced.yml - Enhanced CI/CD pipeline
name: ⚡ Enhanced Pipeline
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '20'
  COVERAGE_THRESHOLD: 85
  PERFORMANCE_BUDGET_MS: 1000

jobs:
  # Multi-stage quality validation
  quality:
    name: 📊 Quality Analysis
    runs-on: ubuntu-latest
    strategy:
      matrix:
        check: [lint, format, complexity, security]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci

      - name: Code linting
        if: matrix.check == 'lint'
        run: npm run lint

      - name: Format validation
        if: matrix.check == 'format'
        run: npm run format:check

      - name: Complexity analysis
        if: matrix.check == 'complexity'
        run: npm run complexity:analyze

      - name: Security analysis
        if: matrix.check == 'security'
        run: |
          npm audit --audit-level=moderate
          npx eslint --ext .js,.ts --format=json . > eslint-security.json

  # Comprehensive testing
  test:
    name: 🧪 Multi-Environment Testing
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20, 22]
        test-type: [unit, integration]
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      - run: npm ci

      - name: Unit tests
        if: matrix.test-type == 'unit'
        run: npm run test:unit -- --coverage

      - name: Integration tests
        if: matrix.test-type == 'integration'
        env:
          DATABASE_URL: postgresql://postgres:test@localhost:5432/test
        run: npm run test:integration

  # Performance validation
  performance:
    name: ⚡ Performance Validation
    runs-on: ubuntu-latest
    needs: [quality, test]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm run build

      - name: Bundle size analysis
        run: |
          BUNDLE_SIZE=$(npm run analyze:bundle --silent)
          echo "Bundle size: ${BUNDLE_SIZE}KB"
          if [ $BUNDLE_SIZE -gt 1024 ]; then
            echo "::error::Bundle size exceeds 1MB limit"
            exit 1
          fi

      - name: Performance benchmarks
        run: npm run perf:benchmark
```

### 🏆 Tier 3: Enterprise Integration Examples

**Production-Grade Pipeline (8-12 hours setup):**

```yaml
# .github/workflows/enterprise.yml - Enterprise CI/CD pipeline
name: 🏆 Enterprise Pipeline
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  workflow_dispatch:
    inputs:
      deployment_strategy:
        description: 'Deployment strategy'
        required: true
        default: 'blue-green'
        type: choice
        options:
          - blue-green
          - canary
          - rolling

env:
  NODE_VERSION: '20'
  COVERAGE_THRESHOLD: 90
  SECURITY_SCAN_TIMEOUT: 600

jobs:
  # Comprehensive security scanning
  security:
    name: 🔒 Advanced Security
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Multi-tool security scan
        uses: securecodewarrior/github-action-add-sarif@v1
        with:
          sarif-file: 'security-results.sarif'

      - name: Container security scan
        run: |
          docker build -t app:latest .
          trivy image --exit-code 1 --severity HIGH,CRITICAL app:latest

      - name: Infrastructure security scan
        run: |
          terraform plan -out=tfplan
          tfsec tfplan

  # Progressive deployment
  deploy:
    name: 🚀 Progressive Deployment
    runs-on: ubuntu-latest
    environment: production
    needs: [security]
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Blue-Green Deployment
        if: github.event.inputs.deployment_strategy == 'blue-green'
        run: |
          echo "🔄 Starting blue-green deployment..."
          # Blue-green deployment logic
          kubectl apply -f k8s/blue-green/

      - name: Canary Deployment
        if: github.event.inputs.deployment_strategy == 'canary'
        run: |
          echo "🐦 Starting canary deployment..."
          # Canary deployment with 10% traffic
          kubectl apply -f k8s/canary/
          kubectl patch service app -p '{"spec":{"selector":{"version":"canary"}}}'

      - name: Deployment verification
        run: |
          # Wait for rollout
          kubectl rollout status deployment/app --timeout=300s

          # Health checks
          curl -f https://api.example.com/health

          # Smoke tests
          npm run test:smoke:production

      - name: Rollback on failure
        if: failure()
        run: |
          echo "🔄 Deployment failed, initiating rollback..."
          kubectl rollout undo deployment/app
```

## Anti-Pattern Migration Guide

### Migrating from Manual Deployment

**❌ Current State: Manual deployment process**
```bash
# Developer manually runs:
npm run build
scp dist/* server:/var/www/html/
ssh server "sudo systemctl restart nginx"
# No validation, no rollback capability
```

**✅ Migration Path:**
1. **Week 1**: Start with Tier 1 foundation pipeline
2. **Week 2**: Add staging environment and health checks
3. **Week 4**: Migrate to Tier 2 with comprehensive testing
4. **Month 2**: Evaluate Tier 3 enterprise features

### Migrating from Basic CI Only

**❌ Current State: CI without deployment automation**
```yaml
# Basic validation only
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - run: npm test
# Manual deployment still required
```

**✅ Migration Path:**
1. **Add deployment stage**: Start with Tier 1 staging deployment
2. **Enhance validation**: Progress to Tier 2 quality gates
3. **Automate production**: Add production deployment with safeguards
4. **Monitor and iterate**: Implement comprehensive observability

### Migrating from Platform-Specific Pipelines

**❌ Current State: Tightly coupled to single CI/CD platform**
```yaml
# GitLab-specific features that don't translate
include:
  - template: Security/SAST.gitlab-ci.yml
  - template: Security/Secret-Detection.gitlab-ci.yml
# Hard to migrate to other platforms
```

**✅ Migration Path:**
1. **Standardize on common patterns**: Use platform-agnostic tools and configurations
2. **Create reusable components**: Build modular pipeline steps
3. **Document platform differences**: Maintain translation guides
4. **Test across platforms**: Validate pipelines work consistently
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run dependency audit
        run: |
          npm audit --audit-level=${{ env.SECURITY_SCAN_LEVEL }}
          if [ $? -ne 0 ]; then
            echo "::error::Security vulnerabilities detected in dependencies"
            exit 1
          fi

      - name: Scan for secrets
        uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          base: main
          head: HEAD
          extra_args: --debug --only-verified

      - name: Static security analysis
        uses: github/codeql-action/analyze@v2
        with:
          languages: javascript

      - name: Container security scan
        if: hashFiles('Dockerfile') != ''
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: 'app:latest'
          format: 'sarif'
          output: 'trivy-results.sarif'

  # Stage 3: Automated Testing
  test:
    needs: [code-quality, security-scan]
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [16, 18, 20]
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: |
          npm run test:unit -- --coverage --watchAll=false
          if [ $? -ne 0 ]; then
            echo "::error::Unit tests failed"
            exit 1
          fi

      - name: Run integration tests
        run: |
          npm run test:integration
          if [ $? -ne 0 ]; then
            echo "::error::Integration tests failed"
            exit 1
          fi

      - name: Check coverage thresholds
        run: |
          COVERAGE=$(npm run test:coverage:report --silent | grep "All files" | awk '{print $10}' | sed 's/%//')
          if [ ${COVERAGE%.*} -lt ${{ env.COVERAGE_THRESHOLD }} ]; then
            echo "::error::Test coverage ${COVERAGE}% below threshold ${{ env.COVERAGE_THRESHOLD }}%"
            exit 1
          fi
          echo "::notice::Test coverage: ${COVERAGE}%"

      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
          flags: unittests
          name: codecov-umbrella

  # Stage 4: Performance Testing
  performance:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
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
          BUNDLE_SIZE=$(du -b dist/main.js | cut -f1)
          MAX_SIZE=1048576  # 1MB
          if [ $BUNDLE_SIZE -gt $MAX_SIZE ]; then
            echo "::error::Bundle size exceeds limit: ${BUNDLE_SIZE} bytes"
            exit 1
          fi

      - name: Load testing
        run: |
          npm run test:load
          if [ $? -ne 0 ]; then
            echo "::error::Performance benchmarks failed"
            exit 1
          fi

  # Stage 5: Build and Package
  build:
    needs: [test, performance]
    runs-on: ubuntu-latest
    outputs:
      image-digest: ${{ steps.build.outputs.digest }}
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build

      - name: Build container image
        id: build
        uses: docker/build-push-action@v4
        with:
          context: .
          push: false
          tags: app:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Test container
        run: |
          docker run --rm -d -p 3000:3000 --name test-container app:latest
          sleep 10
          curl -f http://localhost:3000/health || exit 1
          docker stop test-container

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build-artifacts
          path: |
            dist/
            Dockerfile
          retention-days: 30

  # Stage 6: Staging Deployment
  deploy-staging:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - name: Download artifacts
        uses: actions/download-artifact@v3
        with:
          name: build-artifacts

      - name: Deploy to staging
        run: |
          echo "Deploying to staging environment..."
          # Deployment logic here
          sleep 5

      - name: Verify staging deployment
        run: |
          curl -f https://staging.example.com/health
          if [ $? -ne 0 ]; then
            echo "::error::Staging deployment verification failed"
            exit 1
          fi

      - name: Run smoke tests
        run: |
          npm run test:smoke -- --env=staging
          if [ $? -ne 0 ]; then
            echo "::error::Staging smoke tests failed"
            exit 1
          fi

  # Stage 7: Production Deployment
  deploy-production:
    needs: deploy-staging
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Download artifacts
        uses: actions/download-artifact@v3
        with:
          name: build-artifacts

      - name: Deploy to production
        run: |
          echo "Deploying to production environment..."
          # Blue-green deployment logic
          sleep 10

      - name: Verify production deployment
        run: |
          curl -f https://api.example.com/health
          if [ $? -ne 0 ]; then
            echo "::error::Production deployment verification failed"
            # Trigger rollback
            exit 1
          fi

      - name: Update monitoring dashboards
        run: |
          curl -X POST https://monitoring.example.com/deployments \
            -H "Content-Type: application/json" \
            -d '{"version": "${{ github.sha }}", "environment": "production"}'

      - name: Notify deployment success
        uses: 8398a7/action-slack@v3
        with:
          status: success
          channel: '#deployments'
          message: 'Production deployment successful: ${{ github.sha }}'
```

```yaml
# ✅ GOOD: GitLab CI equivalent with comprehensive validation
# .gitlab-ci.yml
stages:
  - validate
  - security
  - test
  - build
  - deploy-staging
  - deploy-production

variables:
  NODE_VERSION: "18"
  COVERAGE_THRESHOLD: "85"
  DOCKER_DRIVER: overlay2

# Security and quality validation (parallel)
code-quality:
  stage: validate
  image: node:${NODE_VERSION}
  before_script:
    - npm ci
  script:
    - npm run lint
    - npm run format:check
    - npx commitlint --from=origin/main --to=HEAD
  artifacts:
    reports:
      junit: reports/lint-results.xml
  rules:
    - if: $CI_PIPELINE_SOURCE == "push" || $CI_PIPELINE_SOURCE == "merge_request_event"

security-scan:
  stage: security
  image: node:${NODE_VERSION}
  before_script:
    - npm ci
  script:
    - npm audit --audit-level=high
    - docker run --rm -v "$PWD:/pwd" trufflesecurity/trufflehog:latest git file:///pwd --since-commit HEAD~1 --only-verified --fail
  artifacts:
    reports:
      sast: gl-sast-report.json
      dependency_scanning: gl-dependency-scanning-report.json
  rules:
    - if: $CI_PIPELINE_SOURCE == "push" || $CI_PIPELINE_SOURCE == "merge_request_event"

# Comprehensive testing
test:
  stage: test
  image: node:${NODE_VERSION}
  needs: ["code-quality", "security-scan"]
  before_script:
    - npm ci
  script:
    - npm run test:unit -- --coverage --watchAll=false
    - npm run test:integration
    - |
      COVERAGE=$(npm run test:coverage:report --silent | grep "All files" | awk '{print $10}' | sed 's/%//')
      if [ ${COVERAGE%.*} -lt $COVERAGE_THRESHOLD ]; then
        echo "Coverage ${COVERAGE}% below threshold ${COVERAGE_THRESHOLD}%"
        exit 1
      fi
  coverage: '/All files[^|]*\|[^|]*\s+([\d\.]+)/'
  artifacts:
    reports:
      junit: reports/test-results.xml
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml
  rules:
    - if: $CI_PIPELINE_SOURCE == "push" || $CI_PIPELINE_SOURCE == "merge_request_event"

# Build and package
build:
  stage: build
  image: docker:latest
  services:
    - docker:dind
  needs: ["test"]
  before_script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
  script:
    - docker build -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA .
    - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
    - docker run --rm -d -p 3000:3000 --name test-container $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
    - sleep 10
    - curl -f http://localhost:3000/health || exit 1
    - docker stop test-container
  rules:
    - if: $CI_COMMIT_BRANCH == "main"

# Staging deployment with verification
deploy-staging:
  stage: deploy-staging
  image: alpine:latest
  needs: ["build"]
  environment:
    name: staging
    url: https://staging.example.com
  before_script:
    - apk add --no-cache curl
  script:
    - echo "Deploying to staging..."
    - sleep 5
    - curl -f https://staging.example.com/health
    - echo "Staging deployment verified"
  rules:
    - if: $CI_COMMIT_BRANCH == "main"

# Production deployment with monitoring
deploy-production:
  stage: deploy-production
  image: alpine:latest
  needs: ["deploy-staging"]
  environment:
    name: production
    url: https://api.example.com
  before_script:
    - apk add --no-cache curl
  script:
    - echo "Deploying to production..."
    - sleep 10
    - curl -f https://api.example.com/health
    - |
      curl -X POST https://monitoring.example.com/deployments \
        -H "Content-Type: application/json" \
        -d "{\"version\": \"$CI_COMMIT_SHA\", \"environment\": \"production\"}"
  when: manual
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
```

## Related Bindings

- [automated-quality-gates.md](../../docs/bindings/core/automated-quality-gates.md): CI/CD pipelines implement comprehensive automated quality gates across multiple validation layers. Both bindings work together to create systematic quality enforcement from local development through production deployment.

- [git-hooks-automation.md](../../docs/bindings/core/git-hooks-automation.md): Git hooks provide the first layer of quality validation while CI/CD pipelines serve as the authoritative enforcement layer. Together they create a complete automation strategy with immediate local feedback and comprehensive remote validation.

- [require-conventional-commits.md](../../docs/bindings/core/require-conventional-commits.md): CI/CD pipelines validate and leverage conventional commit messages for automated changelog generation and semantic versioning. Consistent commit standards enable reliable automation throughout the deployment pipeline.

- [use-structured-logging.md](../../docs/bindings/core/use-structured-logging.md): CI/CD pipelines must implement structured logging and observability to enable effective monitoring and debugging of automated processes. Both bindings support comprehensive system observability and operational excellence.

- [semantic-versioning.md](../../docs/bindings/core/semantic-versioning.md): CI/CD pipelines automate semantic version increments based on conventional commit messages and validate compatibility guarantees through automated testing and release processes. Both bindings create reliable automation that ensures version numbers accurately communicate compatibility expectations.
