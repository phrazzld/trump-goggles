# CI Workflow Maintenance Guide

This document outlines the standards, processes, and best practices for maintaining Continuous Integration (CI) workflows in the Trump Goggles project. Following these guidelines ensures consistent, reliable CI pipelines that catch issues early and maintain code quality.

## Table of Contents

1. [GitHub Actions Versioning Strategy](#github-actions-versioning-strategy)
2. [Artifact Naming Standards](#artifact-naming-standards)
3. [Maintenance Schedule](#maintenance-schedule)
4. [Common CI Issues and Solutions](#common-ci-issues-and-solutions)

## GitHub Actions Versioning Strategy

### Current Actions

| Action                    | Current Version | Purpose                      |
| ------------------------- | --------------- | ---------------------------- |
| `actions/checkout`        | v4              | Checks out repository code   |
| `actions/setup-node`      | v4              | Sets up Node.js environment  |
| `pnpm/action-setup`       | v2              | Sets up pnpm package manager |
| `actions/cache`           | v4              | Caches dependencies          |
| `actions/upload-artifact` | v4              | Uploads build artifacts      |

### Version Pinning Guidelines

- **Major Version Pinning**: Always pin to major versions using the `@v4` syntax rather than `@latest` to prevent breaking changes.

  ```yaml
  # Recommended
  - uses: actions/checkout@v4

  # Avoid
  - uses: actions/checkout@latest # Could break workflows unexpectedly
  ```

- **Security Updates**: For actions maintained by GitHub (actions/\*) or other trusted organizations, using major version pins (`@v4`) automatically includes security updates.

- **Third-Party Actions**: For community-maintained actions, consider pinning to exact versions using the full commit SHA for maximum stability:
  ```yaml
  # For third-party actions, consider full SHA pinning for critical workflows
  - uses: third-party/action@a1b2c3d4e5f6...
  ```

### When to Update Actions

Update GitHub Actions in these scenarios:

1. **Security Vulnerabilities**: Immediately update when security vulnerabilities are announced
2. **Deprecation Notices**: Update before the current version becomes deprecated
3. **New Features**: Update when a new major version offers features that would benefit the project
4. **Regular Review**: Update as part of the quarterly maintenance schedule (see below)

### Update Process

1. Create a dedicated branch for GitHub Actions updates
2. Update the version numbers in all workflow files
3. Review the release notes and update any parameters that have changed
4. Test the workflow by pushing the branch
5. Create a pull request with detailed notes about the changes

## Artifact Naming Standards

Artifacts are build outputs, test results, or coverage reports that are saved for later use. Proper naming helps prevent collisions and makes artifacts easier to identify.

### Naming Convention

```
<purpose>-<context>-<unique-identifier>
```

- **purpose**: What the artifact contains (e.g., `coverage-report`, `build-output`)
- **context**: Additional identification (e.g., project name or environment)
- **unique-identifier**: A value that ensures uniqueness, such as:
  - GitHub run ID: `${{ github.run_id }}`
  - Matrix values: `node-${{ matrix.node-version }}`
  - Timestamp: `$(date +%Y%m%d%H%M%S)`

### Examples

```yaml
# Example for a matrix build with different Node.js versions
- name: Upload Coverage Report
  uses: actions/upload-artifact@v4
  with:
    name: coverage-report-node-${{ matrix.node-version }}
    path: coverage/
    retention-days: 14

# Example for a single-build workflow
- name: Upload Build Output
  uses: actions/upload-artifact@v4
  with:
    name: build-output-${{ github.run_id }}
    path: dist/
    retention-days: 14
```

### Best Practices for Artifacts

1. **Set appropriate retention periods**: Use `retention-days` to automatically clean up old artifacts
2. **Compress large artifacts**: Use compression to reduce storage use for large artifacts
3. **Be selective**: Only upload files that are necessary for debugging or deployment
4. **Use matrix information**: For matrix builds, include matrix values in artifact names

## Maintenance Schedule

The CI infrastructure requires regular maintenance to ensure it remains effective and up-to-date.

### Quarterly Review

A quarterly review of all CI configurations should be conducted, scheduled for:

- **Q1**: January (first week)
- **Q2**: April (first week)
- **Q3**: July (first week)
- **Q4**: October (first week)

### Quarterly Review Checklist

During each quarterly review, complete the following checks:

1. **Actions Version Audit**

   - [ ] Check for new major versions of all GitHub Actions
   - [ ] Review security advisories for all actions
   - [ ] Update actions to latest stable major versions

2. **Workflow Efficiency Audit**

   - [ ] Review workflow run times and identify bottlenecks
   - [ ] Check cache hit rates and optimize caching
   - [ ] Look for duplicate or redundant steps

3. **Dependency Audit**

   - [ ] Ensure dependency scanning is functioning
   - [ ] Review and address any vulnerabilities

4. **Documentation Update**
   - [ ] Update this document with any new best practices
   - [ ] Update version tables with current versions

### Responsibility

The quarterly review should be conducted by the project maintainer or a designated team member with CI/CD expertise. The review should be documented in an issue, and any changes should be made through pull requests.

## Common CI Issues and Solutions

### Artifact Upload Conflicts

**Problem**: Attempting to upload artifacts with the same name in parallel jobs.

**Solution**: Include distinguishing information in artifact names:

```yaml
name: coverage-report-node-${{ matrix.node-version }}
```

### Actions Version Deprecation

**Problem**: GitHub periodically deprecates older versions of actions.

**Solution**: Stay on major versions (v4) and include regular reviews as described above.

### Slow CI Builds

**Problem**: CI builds taking too long, delaying feedback to developers.

**Solutions**:

- Optimize test parallelization
- Improve caching strategy
- Consider using faster runners when available
- Split workflows into critical (fast) and comprehensive (slower) components

### Pre-commit vs CI Mismatch

**Problem**: Code passes local pre-commit hooks but fails in CI.

**Solution**: Ensure local development environment matches CI:

- Use the same ESLint configuration with the same rules and severity levels
- Ensure pre-commit hooks run the same checks as CI
- Document any environment-specific settings

---

## Document History

- **Created**: [Date]
- **Last Updated**: [Date]
- **Last Quarterly Review**: [Date]
