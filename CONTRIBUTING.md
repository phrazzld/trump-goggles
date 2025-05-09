# Contributing to Trump Goggles

Thank you for considering contributing to Trump Goggles! This document outlines the development process, coding standards, and guidelines for contributing to the project.

## Table of Contents

- [Development Environment Setup](#development-environment-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Code Style and Standards](#code-style-and-standards)
- [Testing Guidelines](#testing-guidelines)
- [TypeScript and Type Checking](#typescript-and-type-checking)
- [Documentation](#documentation)
- [Pull Request Process](#pull-request-process)
- [Release Process](#release-process)
- [Troubleshooting](#troubleshooting)

## Development Environment Setup

### Prerequisites

- Node.js (v18.18.0 or higher)
- pnpm (v7.0.0 or higher)
- Git

### Initial Setup

1. **Fork the repository** on GitHub
   
2. **Clone your fork**
   ```bash
   git clone https://github.com/your-username/trump-goggles.git
   cd trump-goggles
   ```

3. **Add the original repository as an upstream remote**
   ```bash
   git remote add upstream https://github.com/original-owner/trump-goggles.git
   ```

4. **Install dependencies**
   ```bash
   pnpm install
   ```

### Installing the Extension for Testing

#### Chrome
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top-right corner
3. Click "Load unpacked" and select the root directory of the project
4. The extension should now be installed and active

#### Firefox
1. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select the `manifest.json` file in the root directory of the project
4. The extension should now be installed and active

## Project Structure

```
trump-goggles/
├── .github/                # GitHub configuration 
├── docs/                   # Documentation
│   ├── architecture.md     # Architecture overview
│   └── behavior.md         # Extension behavior documentation
├── test/                   # Test files
│   ├── background/         # Background script tests
│   ├── content/            # Content script tests
│   ├── fixtures/           # Test fixtures
│   ├── helpers/            # Test helpers
│   ├── mocks/              # Mock implementations
│   └── setup.js            # Test setup file
├── manifest.json           # Extension manifest
├── background.js           # Background script
├── content.js              # Content script (legacy)
├── content-consolidated.js # Main content script
├── *.js                    # Core modules
├── eslint.config.js        # ESLint configuration
├── vitest.config.js        # Vitest configuration
├── tsconfig.json           # TypeScript configuration
└── types.d.ts              # TypeScript declarations
```

## Development Workflow

### Branch Strategy

1. **Create a new branch** for your contribution
   ```bash
   git checkout -b feature/your-feature-name
   ```
   
   Use the following prefixes for branches:
   - `feature/` - For new features
   - `fix/` - For bug fixes
   - `docs/` - For documentation changes
   - `refactor/` - For code refactoring
   - `test/` - For adding or modifying tests

2. **Make your changes** and commit them
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```
   
   Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification for commit messages:
   - `feat:` - A new feature
   - `fix:` - A bug fix
   - `docs:` - Documentation changes
   - `style:` - Code style changes (formatting, etc.)
   - `refactor:` - Code refactoring without changing functionality
   - `test:` - Adding or modifying tests
   - `chore:` - Maintenance tasks, build changes, etc.

3. **Keep your branch updated** with the upstream repository
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

4. **Push your changes** to your fork
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a pull request** from your branch to the main repository

### Development Commands

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run linting
pnpm lint

# Fix linting issues
pnpm lint:fix

# Format code with Prettier
pnpm format

# Check TypeScript types
pnpm typecheck

# Typecheck in watch mode
pnpm typecheck:watch

# Run full CI verification
pnpm verify
```

## Code Style and Standards

### JavaScript Standards

- Use modern JavaScript features (ES2020+)
- Use module pattern (IIFE) for modules to maintain encapsulation
- Minimize global variables and namespace pollution
- Follow the single responsibility principle for functions and modules

### Formatting and Linting

This project uses ESLint and Prettier to enforce code style. Before committing, your code will be automatically formatted and linted.

- 2 spaces for indentation
- Single quotes for strings
- Semicolons are required
- Trailing commas where valid in ES5 (objects, arrays, etc.)
- Maximum line length of 100 characters

### Pre-commit Hooks

A pre-commit hook is configured to run on each commit:

1. Prettier will format your code
2. ESLint will check for issues
3. Vitest will run relevant tests
4. TypeScript type checking will be performed

If any of these steps fail, the commit will be aborted.

### CI Verification Process

Before pushing your changes, it's recommended to run the local CI verification script to ensure your changes will pass the CI pipeline:

```bash
# Either run the script directly
./verify-ci.sh

# Or use the npm script
pnpm verify
```

This script will:

1. Run ESLint checks
2. Run TypeScript type checking
3. Run all tests
4. Run test coverage

#### Pre-commit TypeScript Checks

The pre-commit hook has been configured to run TypeScript checks automatically before each commit. This helps catch type errors early in the development process. The hook will:

1. Format code with Prettier
2. Fix ESLint issues where possible
3. Run relevant tests for modified files
4. Perform TypeScript type checking

If any of these steps fail, the commit will be aborted, allowing you to fix the issues before committing.

#### When to Run CI Verification

Run the full CI verification in these scenarios:

1. Before creating a pull request
2. After making significant changes to the codebase
3. Before deploying to production
4. When troubleshooting CI pipeline failures

Using this verification process helps you catch CI failures before pushing to the remote repository, saving time and reducing the number of failed CI runs.

## Testing Guidelines

### Test Structure

We use Vitest for testing. All tests should follow this structure:

```javascript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('Module Name', () => {
  // Setup code
  
  describe('Function Name', () => {
    it('should behave in a certain way', () => {
      // Test code
      expect(result).toBe(expectedValue);
    });
    
    it('should handle edge cases', () => {
      // Test code
      expect(result).toBe(expectedValue);
    });
  });
});
```

### Test Coverage

- All new features should include tests
- Bug fixes should include tests that verify the fix
- Aim for at least 80% code coverage
- Cover both happy paths and edge cases

### Test Commands

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

## TypeScript and Type Checking

While the project primarily uses JavaScript, we've set up TypeScript for type checking to improve code quality and catch errors early.

### Type Checking Commands

```bash
# Check types
pnpm typecheck

# Check types in watch mode
pnpm typecheck:watch
```

### Adding Types to JavaScript Files

Add JSDoc comments with type annotations to your JavaScript files:

```javascript
/**
 * @typedef {Object} MyType
 * @property {string} name - The name property
 * @property {number} age - The age property
 */

/**
 * Example function with JSDoc type annotations
 * @param {string} text - The input text
 * @param {number} [count=1] - Optional count parameter
 * @returns {boolean} - The result
 */
function myFunction(text, count = 1) {
  // Function body
  return true;
}

// Type assertion for complex types
/** @type {Element} */
const element = document.getElementById('my-element');
```

## Documentation

### Code Documentation

- Use JSDoc comments for all functions, classes, and modules
- Include descriptions, parameter types, return types, and examples when helpful
- Document public APIs thoroughly
- Include comments for complex logic or non-obvious behavior

### Project Documentation

- Update README.md with any user-facing changes
- Update architecture.md when changing the system design
- Update behavior.md when modifying the extension's behavior
- Create new documentation files for significant features

## Pull Request Process

1. **Create a pull request** from your branch to the main repository
2. **Run the CI verification script** before submitting: `./verify-ci.sh`
3. **Ensure all checks pass** (tests, linting, type checking)
4. **Update documentation** if necessary
4. **Update version numbers** following [semantic versioning](https://semver.org/)
5. **Request a review** from a maintainer
6. **Address review feedback** by making additional commits to your branch
7. **Squash commits** if requested by the maintainer
8. **PR will be merged** once it passes all checks and receives approval

### PR Template

When creating a pull request, include the following information:

```markdown
## Description
[Describe the changes you've made]

## Related Issue
[Link to the related issue, if applicable]

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update
- [ ] Code refactoring
- [ ] Performance improvement

## Checklist
- [ ] I have tested my changes
- [ ] I have run the CI verification script (`./verify-ci.sh`)
- [ ] I have updated the documentation
- [ ] I have added tests that prove my fix/feature works
- [ ] All new and existing tests pass
- [ ] My code follows the code style of this project
```

## Release Process

Releases are managed by the maintainers using the following process:

1. **Version Bump**: Update version in package.json according to semantic versioning
2. **Changelog**: Update CHANGELOG.md with changes since the last release
3. **Release Tag**: Create a git tag for the release version
4. **Push Release**: Push the tag and changes to GitHub
5. **Create Release**: Create a GitHub release with release notes
6. **Store Submission**: Submit to browser extension stores

## Troubleshooting

### Common Issues

1. **Pre-commit hooks not working**
   - Ensure husky is installed correctly: `pnpm prepare`

2. **TypeScript errors despite correct code**
   - Check types.d.ts for missing type definitions
   - Use `// @ts-ignore` with explanatory comment as a last resort

3. **Tests failing inconsistently**
   - Check for async code not properly awaited
   - Look for shared state between tests

### Getting Help

If you need help with your contribution:

1. Check existing GitHub issues for similar problems
2. Create a new issue with the "question" label
3. Reach out to the maintainers