# Node.js Version Configuration Simplification

## Decision Summary
We've simplified the Node.js configuration for this project by consolidating to a single Node.js version (v22.15.0) instead of supporting multiple versions in CI.

## Rationale
1. **Irrelevance to End Users**: As a browser extension, the code ultimately runs in users' browsers, not in Node.js environments.
2. **Reduced Complexity**: Supporting multiple Node.js versions adds unnecessary complexity to our CI pipeline.
3. **Focus on What Matters**: For browser extensions, browser compatibility testing is far more important than Node.js version compatibility.
4. **Build Consistency**: Using a single modern Node.js version ensures consistent builds and test results.

## Changes Made
1. **package.json**: Updated engines field to specify Node.js >=18.18.0 (allowing any modern version).
2. **CI Workflow**: Removed the matrix configuration and set Node.js version to v22.15.0 for CI.
3. **Artifacts**: Simplified artifact naming (removed Node.js version from name).
4. **vitest.config.js**: Removed special Node.js 20.9.0 compatibility settings.

## Benefits
1. **Faster CI**: CI runs once instead of twice for different Node.js versions.
2. **Simpler Debugging**: Consistent environment makes issues easier to diagnose.
3. **Reduced Maintenance**: No need to maintain compatibility with multiple Node.js versions.
4. **Resource Efficiency**: Less CI compute time and artifact storage.

## Going Forward
Development will proceed using Node.js v22.15.0 (or compatible LTS versions). If changes to Node.js version requirements are needed in the future, they should be evaluated based on the specific needs of the project rather than automatically supporting multiple versions.