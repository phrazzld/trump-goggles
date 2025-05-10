# CI-06: Update Pre-commit Hooks and CI for Type Checking

## Task Summary
The task requires adding TypeScript type checking to pre-commit hooks and the CI pipeline to ensure that type errors are caught early in the development process.

## Current State
- The project uses Husky for pre-commit hooks
- The pre-commit hook is configured to run lint-staged
- The lint-staged configuration currently runs:
  - Prettier for formatting
  - ESLint for linting
  - Vitest for running related tests
- There is no TypeScript type checking in the pre-commit process
- The project has `typescript` and `tsc --noEmit` command configured in package.json

## Implementation Plan

### 1. Update Lint-staged Configuration
Add TypeScript type checking to the lint-staged configuration in `.lintstagedrc.json`:

```json
{
  "*.js": [
    "prettier --write",
    "eslint --fix",
    "vitest related --run"
  ],
  "*.ts": [
    "prettier --write",
    "eslint --fix",
    "tsc --noEmit"
  ],
  "{*.js,*.ts}": "tsc --noEmit"
}
```

This will:
1. Continue applying Prettier and ESLint to JavaScript files
2. Apply Prettier and ESLint to TypeScript files
3. Run the TypeScript type checker on all JavaScript and TypeScript files

### 2. Verify GitHub Actions Configuration
Check if there's a GitHub Actions workflow file and update it to include type checking:

1. Look for workflow files in `.github/workflows/`
2. Add a step to run `pnpm typecheck` in the CI workflow
3. Ensure the step fails the build if type checking fails

### Alternatives Considered
1. Running TypeScript on all files instead of just changed files: This could be more thorough but slower on large codebases
2. Using separate hooks for type checking: This adds complexity without clear benefits

## Implementation Steps
1. Update `.lintstagedrc.json` to include TypeScript checking
2. Locate CI workflow files
3. Update CI workflow to include type checking
4. Test the pre-commit hook with a type error to verify it catches issues
5. Test the CI workflow if possible

## Verification Plan
1. Introduce a deliberate type error to test if the pre-commit hook catches it
2. Verify that the hook prevents committing code with type errors
3. Check that the CI workflow includes the type checking step

## Expected Outcome
- Pre-commit hooks will prevent committing code with TypeScript errors
- CI pipeline will fail if TypeScript errors are present
- Developers will get earlier feedback on type issues