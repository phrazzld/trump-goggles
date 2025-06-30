---
id: code-review-excellence
last_modified: '2025-06-15'
version: '0.1.0'
derived_from: build-trust-through-collaboration
enforced_by: 'CI Pipeline, Review Automation, Pull Request Checks'
---

# Binding: Code Review Excellence

Code review is a critical quality gate that balances automated verification with human insight. Structure reviews to maximize learning, maintain consistency, and focus human attention on high-value concerns like design, security, and user experience.

## Rationale

While automation can catch formatting issues, syntax errors, and common bugs, human review remains essential for evaluating design decisions, identifying edge cases, and sharing domain knowledge. The key is structuring reviews so automation handles mechanical verification while humans focus on aspects requiring judgment and experience.

Effective code review practices compound over time. Teams that review well share knowledge continuously, maintain consistent standards, and catch issues early when fixes are cheap. Poor review practices create bottlenecks, breed resentment, and miss critical problems.

## Rule Definition

**MUST** automate mechanical checks (formatting, linting, type checking, test coverage) before human review begins.

**MUST** provide review templates that guide reviewers toward high-value feedback areas.

**MUST** establish clear SLAs for review turnaround (e.g., initial response within 4 hours).

**MUST** enforce that all code changes receive at least one approval before merging.

**SHOULD** use automated suggestions for common improvements (e.g., security patterns, performance optimizations).

**SHOULD** track review metrics to identify bottlenecks and improve processes.

## Implementation Patterns

### 1. Automated Pre-Review Checks

Configure CI to run all mechanical checks before human review:

```yaml
# .github/workflows/pr-checks.yml
name: PR Validation
on:
  pull_request:
    types: [opened, synchronize]

jobs:
  automated-checks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run Linting
        run: npm run lint

      - name: Type Check
        run: npm run type-check

      - name: Run Tests
        run: npm test -- --coverage

      - name: Check Coverage
        run: |
          coverage=$(npm run coverage:summary | grep "All files" | awk '{print $10}' | sed 's/%//')
          if (( $(echo "$coverage < 80" | bc -l) )); then
            echo "Coverage $coverage% is below 80% threshold"
            exit 1
          fi

      - name: Security Scan
        run: npm audit --audit-level=moderate

      - name: Post Check Summary
        if: always()
        uses: actions/github-script@v7
        with:
          script: |
            const checks = {
              lint: '${{ steps.lint.outcome }}',
              types: '${{ steps.types.outcome }}',
              tests: '${{ steps.tests.outcome }}',
              coverage: '${{ steps.coverage.outcome }}',
              security: '${{ steps.security.outcome }}'
            };

            const failed = Object.entries(checks)
              .filter(([_, status]) => status === 'failure')
              .map(([check, _]) => check);

            if (failed.length > 0) {
              await github.rest.issues.createComment({
                ...context.repo,
                issue_number: context.issue.number,
                body: `❌ Automated checks failed: ${failed.join(', ')}\n\nPlease fix these before requesting human review.`
              });
            }
```

### 2. Review Templates and Checklists

Guide reviewers toward high-value feedback:

```markdown
<!-- .github/pull_request_template.md -->
## Description
Brief description of changes and their purpose.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Review Checklist
### For Reviewers - Focus Areas:

**Design & Architecture**
- [ ] Changes align with existing patterns
- [ ] No unnecessary complexity introduced
- [ ] Proper separation of concerns

**Security**
- [ ] Input validation at boundaries
- [ ] No hardcoded secrets
- [ ] Proper error handling without info leakage

**Performance**
- [ ] No obvious performance regressions
- [ ] Efficient algorithms for the use case
- [ ] Appropriate caching strategies

**User Experience**
- [ ] Error messages are helpful
- [ ] Edge cases handled gracefully
- [ ] Backwards compatibility maintained

## Automated Checks
These are verified automatically:
- ✅ Formatting (prettier)
- ✅ Linting (eslint)
- ✅ Type safety (TypeScript)
- ✅ Test coverage (>80%)
- ✅ Security vulnerabilities (npm audit)
```

### 3. GitLab Review Automation

For GitLab environments:

```yaml
# .gitlab-ci.yml
stages:
  - validate
  - review

mechanical-checks:
  stage: validate
  script:
    - npm ci
    - npm run lint
    - npm run type-check
    - npm test -- --coverage
  rules:
    - if: $CI_MERGE_REQUEST_ID

danger-review:
  stage: review
  image: node:18
  script:
    - npm install -g danger
    - danger ci
  rules:
    - if: $CI_MERGE_REQUEST_ID
  allow_failure: true

# Dangerfile.js
import { danger, warn, fail, message } from 'danger';

// Check PR size
const bigPRThreshold = 400;
if (danger.github.pr.additions + danger.github.pr.deletions > bigPRThreshold) {
  warn(`This PR is large (${danger.github.pr.additions + danger.github.pr.deletions} lines). Consider breaking it into smaller PRs.`);
}

// Ensure tests for new features
const hasTests = danger.git.fileMatch('**/*.test.{ts,js}').edited;
const hasImplementation = danger.git.fileMatch('src/**/*.{ts,js}').edited;
if (hasImplementation && !hasTests) {
  fail('Please add tests for the new implementation');
}

// Check for console.logs
danger.git.created_files.forEach(file => {
  if (file.includes('console.log')) {
    warn(`Found console.log in ${file} - consider using structured logging`);
  }
});
```

### 4. Review Metrics and Improvement

Track and optimize review processes:

```typescript
// review-metrics.ts
interface ReviewMetrics {
  prNumber: number;
  timeToFirstReview: number; // hours
  timeToApproval: number; // hours
  numberOfComments: number;
  numberOfRevisions: number;
  reviewerCount: number;
}

async function analyzeReviewPatterns(
  metrics: ReviewMetrics[]
): Promise<ReviewInsights> {
  const avgTimeToReview = average(metrics.map(m => m.timeToFirstReview));
  const avgTimeToApproval = average(metrics.map(m => m.timeToApproval));

  // Identify bottlenecks
  const slowReviews = metrics.filter(m => m.timeToFirstReview > 8);
  const highChurn = metrics.filter(m => m.numberOfRevisions > 3);

  return {
    averages: { timeToReview: avgTimeToReview, timeToApproval: avgTimeToApproval },
    bottlenecks: {
      slowReviewStart: slowReviews.length / metrics.length,
      highRevisionRate: highChurn.length / metrics.length
    },
    recommendations: generateRecommendations(metrics)
  };
}
```

## Human vs Automated Boundaries

**Automated Review Handles:**
- Code formatting and style consistency
- Type safety and compilation errors
- Test execution and coverage thresholds
- Security vulnerability scanning
- License compliance checks
- Documentation generation
- Merge conflict detection

**Human Review Focuses On:**
- Design decisions and architectural fit
- Business logic correctness
- Edge case identification
- Performance implications
- Security design patterns
- Code clarity and maintainability
- Knowledge sharing opportunities

## Anti-Patterns to Avoid

**❌ Nitpick Hell**: Arguing over subjective style preferences that should be automated.

**❌ Rubber Stamping**: Approving without meaningful review due to time pressure.

**❌ Review Bottlenecks**: Single person becoming a review bottleneck for all changes.

**❌ Context-Free Comments**: Leaving vague feedback like "this could be better" without specifics.

**❌ Delayed Reviews**: Letting PRs sit for days, forcing expensive context switches.

## Related Standards

- [automated-quality-gates](../../docs/bindings/core/automated-quality-gates.md): Defines the automated checks that must pass before human review
- [git-hooks-automation](../../docs/bindings/core/git-hooks-automation.md): Local automation that prevents issues before they reach review
- [ci-cd-pipeline-standards](../../docs/bindings/core/ci-cd-pipeline-standards.md): Full pipeline including post-review deployment automation

## References

- [Google Engineering Practices - Code Review](https://google.github.io/eng-practices/review/)
- [Best Practices for Code Review - SmartBear](https://smartbear.com/learn/code-review/best-practices-for-peer-code-review/)
- [Implementing Danger JS](https://danger.systems/js/)
