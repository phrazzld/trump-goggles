---
id: git-hooks-automation
last_modified: '2025-06-09'
version: '0.1.0'
derived_from: automation
enforced_by: 'pre-commit hooks, git hooks, CI/CD pipelines, automated quality gates'
---
# Binding: Establish Mandatory Git Hooks for Quality Automation

Implement automated git hooks that enforce quality standards at commit time, preventing low-quality code from entering the repository. Create systematic barriers that catch issues immediately when developers have full context, rather than later in the development cycle when fixes are more expensive and disruptive.

## Rationale

This binding directly implements our automation tenet by eliminating manual quality checks that are prone to human error and inconsistent application. Git hooks act as the first line of defense in your quality automation strategy, catching issues like formatting violations, linting errors, security vulnerabilities, and test failures before they can propagate through the development pipeline.

Think of git hooks as quality guardrails on a mountain road—they prevent you from going over the cliff before you even realize you're getting close to the edge. Without these automated checkpoints, developers must rely on memory and discipline to run quality checks manually, which inevitably leads to inconsistent application and quality degradation over time. By the time CI catches these issues, context has been lost and the fix requires more cognitive overhead to understand and resolve.

The investment in comprehensive git hooks pays immediate dividends by providing instant feedback when the developer's mental model of the code is still fresh and complete. This creates a tight feedback loop that helps developers internalize quality standards while dramatically reducing the time and effort required to maintain code quality across the entire team. Failed hooks are not obstacles—they are learning opportunities that prevent future problems.

## Rule Definition

Mandatory git hooks must implement these core quality checkpoints:

- **Pre-commit Validation**: Every commit must pass automated checks for code formatting, linting, security scanning, and basic correctness before it can be recorded in git history.

- **Commit Message Enforcement**: All commit messages must follow conventional commit standards to enable automated changelog generation and semantic versioning.

- **Secret Detection**: Scan all staged changes for potential secrets, API keys, passwords, or other sensitive information before they can be committed to version control.

- **Fast Feedback**: Hooks must complete quickly (typically under 30 seconds) to avoid disrupting developer workflow while still providing comprehensive validation.

- **Bypass Prevention**: Hooks cannot be easily bypassed through git options like `--no-verify` except in documented emergency procedures with full audit trails.

- **Incremental Validation**: Hooks should validate only changed files when possible to minimize execution time and provide focused feedback.

**Quality Gate Categories for Git Hooks:**
- Code formatting and style consistency
- Syntax validation and linting
- Security scanning and secret detection
- Commit message format validation
- Basic test execution for changed components
- Documentation and comment quality checks

**Emergency Override Procedures:**
- Documented process for bypass in genuine emergencies
- Required approval from team lead or senior developer
- Automatic issue creation for follow-up remediation
- Audit logging of all bypasses with justification

## Tiered Implementation Approach

This binding supports incremental adoption through three complexity tiers, allowing teams to start simple and progressively enhance their automation:

### **🚀 Tier 1: Essential Setup (Must Have)**
*Start here for immediate impact with minimal setup complexity*

**Scope**: Basic quality gates that catch the most common issues
**Time to implement**: 30 minutes
**Team impact**: Low friction, immediate value

**Essential Components:**
- ✅ **Secret detection** - Prevents credential leaks (highest security risk)
- ✅ **Basic formatting** - Ensures consistent code appearance
- ✅ **Commit message validation** - Enables automated changelog generation
- ✅ **Syntax checking** - Catches obvious compilation errors

### **⚡ Tier 2: Enhanced Automation (Should Have)**
*Add after team adaptation to Tier 1 (2-4 weeks)*

**Scope**: Comprehensive quality validation with language-specific checks
**Time to implement**: 2-3 hours
**Team impact**: Moderate setup, significant quality improvement

**Enhanced Components:**
- ✅ **Code linting** - Enforces coding standards and best practices
- ✅ **Test execution** - Validates that changes don't break existing functionality
- ✅ **Dependency auditing** - Scans for security vulnerabilities in dependencies
- ✅ **Documentation validation** - Ensures code changes include proper documentation

### **🏆 Tier 3: Comprehensive Integration (Nice to Have)**
*Add after mastering Tier 2 (4-8 weeks)*

**Scope**: Advanced automation with full CI/CD integration
**Time to implement**: 4-6 hours
**Team impact**: Complex setup, enterprise-grade automation

**Advanced Components:**
- ✅ **Performance testing** - Validates performance regression prevention
- ✅ **Architecture validation** - Enforces design patterns and architectural constraints
- ✅ **Multi-language support** - Comprehensive validation across polyglot codebases
- ✅ **Custom business rules** - Project-specific validation and compliance checks

## Practical Implementation

### Starting with Tier 1: Essential Setup

1. **Choose a Pre-commit Framework**: Select based on your team's primary language:
   - **Node.js projects**: Husky (widely adopted, simple setup)
   - **Multi-language projects**: pre-commit (extensive ecosystem)
   - **Performance-focused**: lefthook (fastest execution)

2. **Implement Security-First Approach**: Start with secret detection as it has the highest impact and lowest false-positive rate.

3. **Add Basic Quality Gates**: Focus on formatting and commit message validation as they provide immediate value with minimal configuration.

4. **Test with Small Changes**: Validate the setup works correctly before rolling out to the entire team.

### Progressing to Tier 2: Enhanced Automation

1. **Add Language-Specific Linting**: Configure linters for your primary languages with project-appropriate rules.

2. **Integrate Basic Testing**: Add hooks that run fast unit tests for changed components only.

3. **Enable Dependency Scanning**: Add vulnerability scanning for package managers used in your project.

4. **Monitor Performance Impact**: Ensure hooks complete within 30 seconds to maintain developer productivity.

### Advancing to Tier 3: Comprehensive Integration

1. **Synchronize with CI/CD**: Ensure git hooks use identical tools and configurations as your CI/CD pipeline.

2. **Add Custom Validation**: Implement project-specific rules that enforce your architectural decisions.

3. **Enable Full Test Suites**: Run comprehensive test suites for critical changes when performance allows.

4. **Implement Bypass Auditing**: Add logging and approval processes for emergency hook bypasses.

## Examples by Tier

### 🚀 Tier 1: Essential Setup Examples

**Minimal Viable Configuration (15 minutes setup):**

```yaml
# .pre-commit-config.yaml - Essential setup for immediate security and consistency
default_install_hook_types: [pre-commit, commit-msg]
default_stages: [commit]

repos:
  # 🔒 ESSENTIAL: Secret detection (highest priority)
  - repo: https://github.com/trufflesecurity/trufflehog
    rev: v3.63.2
    hooks:
      - id: trufflehog
        name: 🔒 Secret Detection
        entry: trufflehog git file://. --since-commit HEAD --only-verified --fail
        language: system
        stages: [commit]

  # ✨ ESSENTIAL: Basic file hygiene
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.5.0
    hooks:
      - id: trailing-whitespace
        name: ✨ Remove trailing whitespace
      - id: end-of-file-fixer
        name: ✨ Ensure files end with newline
      - id: check-added-large-files
        name: 🔒 Check for large files
        args: ['--maxkb=500']

  # 📝 ESSENTIAL: Commit message validation
  - repo: https://github.com/compilerla/conventional-pre-commit
    rev: v3.0.0
    hooks:
      - id: conventional-pre-commit
        name: 📝 Validate commit message format
        stages: [commit-msg]
```

**Husky Alternative (Node.js projects):**

```json
// package.json
{
  "scripts": {
    "prepare": "husky install"
  },
  "devDependencies": {
    "husky": "^8.0.3",
    "@commitlint/cli": "^18.4.0",
    "@commitlint/config-conventional": "^18.4.0"
  }
}
```

```bash
# .husky/pre-commit - Essential validation only
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# 🔒 Secret detection (mandatory)
trufflehog git file://. --since-commit HEAD --only-verified --fail

# ✨ Basic formatting (fast feedback)
npx prettier --check .
```

### ⚡ Tier 2: Enhanced Automation Examples

**Progressive Enhancement (add after 2-4 weeks):**

```yaml
# .pre-commit-config.yaml - Enhanced configuration with language-specific validation
default_install_hook_types: [pre-commit, commit-msg]
default_stages: [commit]

repos:
  # 🔒 SECURITY LAYER (from Tier 1)
  - repo: https://github.com/trufflesecurity/trufflehog
    rev: v3.63.2
    hooks:
      - id: trufflehog
        name: 🔒 Secret Detection
        entry: trufflehog git file://. --since-commit HEAD --only-verified --fail

  # ✨ QUALITY LAYER (enhanced)
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.5.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-json
      - id: check-yaml
      - id: check-added-large-files
        args: ['--maxkb=500']

  # 📊 LANGUAGE-SPECIFIC VALIDATION
  - repo: https://github.com/pre-commit/mirrors-eslint
    rev: v8.56.0
    hooks:
      - id: eslint
        name: 📊 ESLint - JavaScript/TypeScript
        files: \.(js|jsx|ts|tsx)$
        args: [--fix]

  - repo: https://github.com/psf/black
    rev: 23.12.1
    hooks:
      - id: black
        name: 📊 Black - Python formatting
        language_version: python3

  # 🧪 BASIC TESTING
  - repo: local
    hooks:
      - id: fast-tests
        name: 🧪 Run fast tests for changed files
        entry: npm run test:changed
        language: system
        pass_filenames: false
```

### 🏆 Tier 3: Comprehensive Integration Examples

**Enterprise-Grade Configuration:**

```yaml
# .pre-commit-config.yaml - Comprehensive enterprise configuration
default_install_hook_types: [pre-commit, commit-msg, pre-push]
default_stages: [commit]
fail_fast: false

repos:
  # 🔒 COMPREHENSIVE SECURITY
  - repo: https://github.com/trufflesecurity/trufflehog
    rev: v3.63.2
    hooks:
      - id: trufflehog
        name: 🔒 Secret Detection - TruffleHog
        entry: trufflehog git file://. --since-commit HEAD --only-verified --fail

  - repo: https://github.com/Yelp/detect-secrets
    rev: v1.4.0
    hooks:
      - id: detect-secrets
        name: 🔒 Secret Detection - Pattern Analysis
        args: ['--baseline', '.secrets.baseline']

  # 📊 MULTI-LANGUAGE QUALITY
  - repo: https://github.com/pre-commit/mirrors-eslint
    rev: v8.56.0
    hooks:
      - id: eslint
        name: 📊 ESLint - TypeScript/JavaScript
        files: \.(js|jsx|ts|tsx)$
        args: [--fix, --max-warnings=0]

  - repo: https://github.com/dnephin/pre-commit-golang
    rev: v0.5.1
    hooks:
      - id: go-fmt
        name: 📊 Go - Format
      - id: go-vet
        name: 📊 Go - Vet
      - id: golangci-lint
        name: 📊 Go - Lint

  # 🧪 COMPREHENSIVE TESTING
  - repo: local
    hooks:
      - id: unit-tests
        name: 🧪 Unit tests for changed components
        entry: npm run test:unit:changed
        language: system
        stages: [commit]

      - id: integration-tests
        name: 🧪 Integration tests
        entry: npm run test:integration
        language: system
        stages: [pre-push]

  # 🏗️ ARCHITECTURE VALIDATION
  - repo: local
    hooks:
      - id: architecture-check
        name: 🏗️ Validate architecture constraints
        entry: npm run arch:validate
        language: system
        files: ^src/
```

## Anti-Pattern Migration Guide

### Migrating from No Automation

**❌ Current State: Manual quality checks**
```bash
# Developers manually run (and often forget):
npm run lint
npm run test
npm run format
git commit -m "fixes"  # No message standards
```

**✅ Migration Path:**
1. **Week 1**: Start with Tier 1 essential setup
2. **Week 3**: Add your primary language linting (Tier 2)
3. **Week 6**: Add testing hooks and full Tier 2
4. **Month 3**: Evaluate Tier 3 based on team maturity

### Migrating from Basic Git Hooks

**❌ Current State: Minimal git hooks**
```bash
# .git/hooks/pre-commit (inconsistent across developers)
#!/bin/sh
npm run lint
```

**✅ Migration Path:**
1. **Standardize with framework**: Move to pre-commit/husky for consistency
2. **Add security scanning**: Implement secret detection immediately
3. **Version hook configuration**: Commit hook config to repository
4. **Progressive enhancement**: Add language-specific validation incrementally

### Migrating from CI-Only Validation

**❌ Current State: All validation in CI/CD only**
```yaml
# .github/workflows/ci.yml
- name: Run all checks
  run: |
    npm run lint
    npm run test
    npm run security:scan
# Results in late feedback and context switching
```

**✅ Migration Path:**
1. **Implement local-first approach**: Start with Tier 1 git hooks
2. **Synchronize configurations**: Ensure hooks match CI validation
3. **Fast local feedback**: Move fastest checks to git hooks
4. **Comprehensive CI validation**: Keep comprehensive testing in CI

## Related Bindings

- [automated-quality-gates.md](../../docs/bindings/core/automated-quality-gates.md): Git hooks provide the first layer of automated quality gates, focusing on immediate feedback at commit time. Both bindings work together to create comprehensive quality automation throughout the development pipeline.

- [require-conventional-commits.md](../../docs/bindings/core/require-conventional-commits.md): Git hooks enforce conventional commit message standards that enable automated changelog generation and semantic versioning. Commit message validation in hooks ensures consistency before code reaches the repository.

- [no-lint-suppression.md](../../docs/bindings/core/no-lint-suppression.md): Git hooks prevent lint rule violations from being committed, supporting the principle of addressing root causes rather than suppressing warnings. Both bindings maintain code quality through systematic enforcement.

- [use-structured-logging.md](../../docs/bindings/core/use-structured-logging.md): Git hooks can validate that logging practices follow structured patterns, ensuring observability standards are maintained from the earliest stages of development.
