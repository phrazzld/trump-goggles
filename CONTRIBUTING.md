# Contributing to Trump Goggles

## Development Setup

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/trump-goggles.git
   cd trump-goggles
   ```

2. Install dependencies
   ```bash
   pnpm install
   ```

3. Make your changes

4. Run tests, linting, and type checking
   ```bash
   pnpm test
   pnpm lint
   pnpm typecheck
   ```

5. Submit a pull request

## Code Style

This project uses ESLint and Prettier to enforce code style. Before committing, your code will be automatically formatted and linted.

- Run formatting manually: `pnpm format`
- Run linting manually: `pnpm lint`

## Pre-commit Hooks

A pre-commit hook is configured to run on each commit:

1. Prettier will format your code
2. ESLint will check for issues
3. Vitest will run relevant tests

If any of these steps fail, the commit will be aborted.

## Testing

We use Vitest for testing. Write tests for any new features or bug fixes.

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

## TypeScript

While the project primarily uses JavaScript, we've set up TypeScript for type checking to improve code quality and catch errors early.

### Type Checking

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

## Pull Request Process

1. Update the README.md or documentation with details of changes if needed
2. Update the version number in package.json following semantic versioning
3. The PR will be merged once it passes all checks and receives approval