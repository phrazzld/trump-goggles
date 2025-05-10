# GitHub Actions Versioning Strategy

This document outlines the project's approach to managing GitHub Actions versions, providing guidelines for updates, and ensuring consistent CI/CD workflows.

## Current GitHub Actions

As of May 2025, the project uses the following GitHub Actions:

| Action | Current Version | Repository | Purpose |
|--------|----------------|------------|---------|
| checkout | v4 | [actions/checkout](https://github.com/actions/checkout) | Checks out repository code |
| setup-node | v4 | [actions/setup-node](https://github.com/actions/setup-node) | Sets up Node.js environment |
| cache | v4 | [actions/cache](https://github.com/actions/cache) | Caches dependencies |
| upload-artifact | v4 | [actions/upload-artifact](https://github.com/actions/upload-artifact) | Uploads build artifacts |
| pnpm/action-setup | v2 | [pnpm/action-setup](https://github.com/pnpm/action-setup) | Sets up pnpm package manager |

## Versioning Guidelines

### Version Pinning

- Always pin GitHub Actions to a specific major version using the `@vX` syntax (e.g., `actions/checkout@v4`).
- Avoid using:
  - Latest version (`@latest`): This can introduce breaking changes without warning
  - Commit SHAs: These are difficult to track and understand when updates are needed
  - Branch references: These can change unexpectedly

### Version Update Frequency

- **Major Versions**: Evaluate and update within 3 months of stable release
- **Minor/Patch Versions**: GitHub Actions automatically use the latest minor/patch version within the specified major version

### Update Criteria

Update GitHub Actions versions when:

1. **Security Updates**: Immediately update when security vulnerabilities are announced
2. **Deprecation Notices**: Update when GitHub announces version deprecation
3. **Feature Requirements**: Update when new features are needed for the CI/CD workflow
4. **Performance Improvements**: Update when significant performance improvements are available
5. **Quarterly Review**: Review all actions during the quarterly maintenance cycle

## Update Process

When updating GitHub Actions versions:

1. **Research**:
   - Review the action's release notes for breaking changes
   - Check compatibility with other actions in the workflow
   - Verify parameter compatibility with the new version

2. **Implementation**:
   - Update the version number in the workflow file
   - Update any parameters that have changed in the new version

3. **Testing**:
   - Create a test PR to trigger the workflow
   - Verify all CI steps complete successfully
   - Confirm artifacts are correctly generated and accessible

4. **Documentation**:
   - Update this document with the new version
   - Note any significant changes or compatibility considerations

## Compatibility Guidelines

When updating GitHub Actions, consider the following compatibility factors:

- **Node.js Versions**: Ensure actions are compatible with the project's Node.js versions
- **Runner Environments**: Verify compatibility with the GitHub-hosted runner environments
- **Dependencies**: Check for dependencies on other actions or external services

## Quarterly Review Process

Every quarter, perform the following steps:

1. Review all actions used in workflows and check for new major versions
2. Evaluate potential benefits and risks of updating
3. Create a GitHub issue to track the review and update process
4. Implement and test updates
5. Update documentation with new versions and considerations

## Troubleshooting

If GitHub Actions fail after an update:

1. Check the action's documentation for breaking changes
2. Review the full workflow logs for detailed error messages
3. Consider temporarily reverting to the previous version while investigating
4. Look for GitHub status updates that might indicate service issues

## References

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Actions Versioning](https://github.com/actions/toolkit/blob/main/docs/action-versioning.md)
- [GitHub Actions Security Best Practices](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)