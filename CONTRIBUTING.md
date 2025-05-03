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

4. Run tests and linting
   ```bash
   pnpm test
   pnpm lint
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

## Pull Request Process

1. Update the README.md or documentation with details of changes if needed
2. Update the version number in package.json following semantic versioning
3. The PR will be merged once it passes all checks and receives approval