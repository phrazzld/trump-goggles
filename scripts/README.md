# Scripts Directory

This directory contains all build, validation, and utility scripts for the Trump Goggles project.

## Build Scripts

- **`build-browser-extensions.sh`** - Builds the extension for multiple browser targets
- **`build-browser-packages.sh`** - Creates distribution packages for different browsers

## Validation Scripts

- **`verify-ci.sh`** - Runs the complete CI validation pipeline locally (use via `pnpm verify`)
- **`validate-test-independence.js`** - Ensures tests are independent of build artifacts
- **`validate-logs.ts`** - Validates structured logging output

## Package Management

- **`check-package-manager.js`** - Verifies pnpm is being used as the package manager
- **`enforce-pnpm.js`** - Enforces pnpm usage (runs during preinstall)

## Packaging Scripts

- **`package-chrome-store.js`** - Creates Chrome Web Store compatible package
- **`package-quick.js`** - Quick packaging for development testing

## Type Checking

- **`check-test-types.js`** - Validates TypeScript types in test files
- **`check-test-types.ts`** - TypeScript implementation of test type checking
- **`typecheck-t053.cjs`** - Specific type checking for test case T053

## Usage

Most scripts are integrated into npm/pnpm scripts. Use:

```bash
# Run CI validation
pnpm verify

# Package for Chrome store
pnpm package:chrome

# Quick development package
pnpm package:quick
```

See `package.json` for the complete list of available script commands.