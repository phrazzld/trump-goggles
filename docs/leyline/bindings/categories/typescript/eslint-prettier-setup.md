---
id: eslint-prettier-setup
last_modified: '2025-06-18'
version: '0.1.0'
derived_from: automation
enforced_by: 'pre-commit hooks, CI validation, zero-suppression policy, automated formatting'
---

# Binding: Automate Code Quality with ESLint/Prettier Zero-Suppression Policy

Implement comprehensive automated code quality enforcement using ESLint for linting and Prettier for formatting with a strict zero-suppression policy. Configure pre-commit hooks, CI gates, and development workflows that prevent quality violations from entering the codebase while maintaining developer velocity through fast feedback and automatic remediation.

## Rationale

This binding implements our automation tenet by eliminating manual code quality decisions and creating systematic barriers that enforce consistent standards without requiring developer memory or discipline. Just as automated testing prevents bugs from reaching production, automated code quality tools prevent style inconsistencies, potential errors, and maintenance issues from accumulating in the codebase.

Think of ESLint and Prettier as quality control inspectors on a manufacturing line—they catch defects immediately when the context is fresh and fixes are simple, rather than allowing problems to compound and become expensive to resolve later. When quality tools are properly automated with zero tolerance for suppressions, they transform from annoying interruptions into trusted guardians that enable confident refactoring and rapid development.

The zero-suppression policy implements our explicit-over-implicit tenet by making all code quality decisions visible and forcing developers to address root causes rather than hiding problems through suppressions. This approach prevents the gradual erosion of code quality that occurs when suppressions become normalized, ensures that all team members follow the same standards, and maintains the long-term health of the codebase.

## Rule Definition

This rule applies to all TypeScript projects and establishes comprehensive automated code quality enforcement:

**Zero-Suppression Policy:**
- **Prohibited Suppressions**: No `eslint-disable`, `prettier-ignore`, or similar directives without documented architectural justification
- **Root Cause Resolution**: Quality violations must be fixed through code improvement, rule configuration, or legitimate exceptions
- **Visible Decision Making**: All configuration decisions and rare exceptions must be documented and reviewable

**Automated Integration:**
- **Pre-commit Enforcement**: Quality violations block commits at the git hook level
- **Fast Feedback**: Quality checks complete within 10 seconds for typical changesets
- **Automatic Remediation**: Formatting and fixable linting issues auto-correct during pre-commit
- **CI Validation**: Comprehensive quality validation in continuous integration pipeline

**Configuration Standards:**
- **Workspace-Level Configuration**: Shared ESLint/Prettier configuration across monorepo packages
- **TypeScript Integration**: Full TypeScript parser and rule integration for type-aware linting
- **Security-First Rules**: ESLint security plugins enabled with strict enforcement
- **Team Standards**: Consistent formatting and style rules across all projects

## Practical Implementation

1. **Unified Configuration Setup**: Establish workspace-root configuration that all packages inherit:
   ```typescript
   // eslint.config.js - Modern flat config format
   import typescript from '@typescript-eslint/eslint-plugin';
   import typescriptParser from '@typescript-eslint/parser';
   import security from 'eslint-plugin-security';
   import prettier from 'eslint-plugin-prettier';

   export default [
     {
       files: ['**/*.{ts,tsx}'],
       languageOptions: {
         parser: typescriptParser,
         parserOptions: {
           ecmaVersion: 'latest',
           sourceType: 'module',
           project: './tsconfig.json'
         }
       },
       plugins: {
         '@typescript-eslint': typescript,
         'security': security,
         'prettier': prettier
       },
       rules: {
         // Type safety (zero tolerance)
         '@typescript-eslint/no-explicit-any': 'error',
         '@typescript-eslint/no-unsafe-assignment': 'error',
         '@typescript-eslint/no-unsafe-call': 'error',
         '@typescript-eslint/strict-boolean-expressions': 'error',

         // Security enforcement
         'security/detect-object-injection': 'error',
         'security/detect-eval-with-expression': 'error',
         'security/detect-non-literal-regexp': 'error',

         // Code quality
         'no-console': 'error',
         'no-debugger': 'error',
         'prefer-const': 'error',
         'no-var': 'error',

         // Prettier integration
         'prettier/prettier': 'error'
       }
     }
   ];
   ```

2. **Prettier Configuration**: Standard formatting rules optimized for readability and consistency:
   ```json
   // .prettierrc
   {
     "semi": true,
     "trailingComma": "es5",
     "singleQuote": true,
     "printWidth": 80,
     "tabWidth": 2,
     "useTabs": false,
     "endOfLine": "lf",
     "bracketSpacing": true,
     "arrowParens": "avoid"
   }
   ```

3. **Pre-commit Hook Integration**: Fast, comprehensive quality validation with auto-fixing:
   ```yaml
   # .pre-commit-config.yaml
   repos:
     - repo: local
       hooks:
         - id: eslint-fix
           name: 🔧 ESLint - Auto-fix issues
           entry: pnpm eslint --fix
           language: system
           files: \.(ts|tsx)$
           stages: [commit]

         - id: prettier-format
           name: ✨ Prettier - Format code
           entry: pnpm prettier --write
           language: system
           files: \.(ts|tsx|json|md)$
           stages: [commit]

         - id: eslint-check
           name: 📊 ESLint - Validate quality
           entry: pnpm eslint --max-warnings=0
           language: system
           files: \.(ts|tsx)$
           stages: [commit]
           pass_filenames: false
   ```

4. **Package.json Scripts**: Consistent commands across all projects with comprehensive validation:
   ```json
   {
     "scripts": {
       "lint": "eslint src/ --max-warnings=0",
       "lint:fix": "eslint src/ --fix --max-warnings=0",
       "format": "prettier --write src/",
       "format:check": "prettier --check src/",
       "quality:check": "pnpm run lint && pnpm run format:check",
       "quality:fix": "pnpm run lint:fix && pnpm run format"
     },
     "devDependencies": {
       "eslint": "^8.57.0",
       "@typescript-eslint/eslint-plugin": "^7.0.0",
       "@typescript-eslint/parser": "^7.0.0",
       "eslint-plugin-security": "^2.1.0",
       "eslint-plugin-prettier": "^5.1.0",
       "prettier": "^3.2.0"
     }
   }
   ```

5. **CI Pipeline Integration**: Comprehensive quality validation with clear failure reporting:
   ```yaml
   # .github/workflows/quality.yml
   name: Code Quality Validation

   on: [push, pull_request]

   jobs:
     quality:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4

         - name: Setup pnpm
           uses: pnpm/action-setup@v4
           with:
             version: 10

         - name: Install dependencies
           run: pnpm install --frozen-lockfile

         - name: ESLint validation
           run: pnpm lint

         - name: Prettier validation
           run: pnpm format:check

         - name: Report quality metrics
           run: |
             echo "## Code Quality Report" >> $GITHUB_STEP_SUMMARY
             echo "- ✅ ESLint: No violations detected" >> $GITHUB_STEP_SUMMARY
             echo "- ✅ Prettier: All files properly formatted" >> $GITHUB_STEP_SUMMARY
   ```

6. **IDE Integration**: Consistent development experience with real-time feedback:
   ```json
   // .vscode/settings.json
   {
     "editor.formatOnSave": true,
     "editor.defaultFormatter": "esbenp.prettier-vscode",
     "editor.codeActionsOnSave": {
       "source.fixAll.eslint": true
     },
     "eslint.validate": [
       "typescript",
       "typescriptreact"
     ],
     "typescript.preferences.quoteStyle": "single"
   }
   ```

## Zero-Suppression Implementation

The zero-suppression policy requires addressing quality violations through proper solutions rather than suppressions:

**Approved Approaches for Quality Violations:**

1. **Code Improvement**: Refactor code to eliminate the underlying issue
   ```typescript
   // ❌ SUPPRESSION APPROACH
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   const result: any = processData(input);

   // ✅ IMPROVEMENT APPROACH
   interface ProcessResult {
     data: string[];
     status: 'success' | 'error';
   }
   const result: ProcessResult = processData(input);
   ```

2. **Rule Configuration**: Adjust rules at the configuration level when appropriate
   ```typescript
   // eslint.config.js - Project-specific rule adjustment
   export default [
     {
       rules: {
         // Disable for test files where console.log is acceptable
         'no-console': 'off'
       },
       files: ['**/*.test.ts', '**/*.spec.ts']
     }
   ];
   ```

3. **Architectural Exceptions**: Document rare cases requiring suppressions
   ```typescript
   // Only for integration with external libraries that require any types
   // Approved in ADR-2024-03: Legacy API integration requirements
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   const legacyResult = externalLibrary.process(data as any);
   ```

**Forbidden Suppression Patterns:**
- Inline `eslint-disable` comments without architectural documentation
- File-level `prettier-ignore` for convenience
- Global rule disabling to avoid refactoring effort
- Temporary suppressions that become permanent

## Examples

```typescript
// ❌ BAD: Suppression to avoid fixing code quality issues
function processUser(data: any) {
  // eslint-disable-next-line no-console
  console.log('Processing user');

  // prettier-ignore
  const result = { id: data.id,name: data.name,email: data.email };

  return result;
}

// ✅ GOOD: Proper types and structured logging
interface UserData {
  id: string;
  name: string;
  email: string;
}

function processUser(data: UserData): UserData {
  logger.info('Processing user', { userId: data.id });

  const result: UserData = {
    id: data.id,
    name: data.name,
    email: data.email,
  };

  return result;
}
```

```typescript
// ❌ BAD: Configuration that allows quality violations
// eslint.config.js
export default [
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn', // Allows any types
      'no-console': 'off', // Disables console checking globally
      'prettier/prettier': 'warn' // Makes formatting optional
    }
  }
];

// ✅ GOOD: Strict configuration with appropriate exceptions
// eslint.config.js
export default [
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      'no-console': 'error',
      'prettier/prettier': 'error'
    }
  },
  {
    // Specific exceptions for test files only
    files: ['**/*.test.ts'],
    rules: {
      'no-console': 'off' // Tests may use console for debugging
    }
  }
];
```

```bash
# ❌ BAD: Development workflow that bypasses quality checks
git add .
git commit -m "quick fix" --no-verify
git push

# ✅ GOOD: Quality-enforced development workflow
pnpm quality:fix  # Auto-fix formatting and linting
git add .
git commit -m "fix: resolve user authentication issue"
# Pre-commit hooks automatically validate quality
git push
```

## Performance Optimization

Ensure quality checks don't impede development velocity:

```typescript
// eslint.config.js - Performance optimization
export default [
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        // Use TypeScript project references for faster parsing
        project: true,
        tsconfigRootDir: import.meta.dirname,
      }
    },
    rules: {
      // Focus on high-impact rules that prevent real issues
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',

      // Disable expensive rules that provide minimal value
      '@typescript-eslint/prefer-readonly-parameter-types': 'off'
    }
  }
];
```

```yaml
# .pre-commit-config.yaml - Fast execution configuration
repos:
  - repo: local
    hooks:
      - id: eslint-changed
        name: 📊 ESLint - Changed files only
        entry: bash -c 'git diff --cached --name-only --diff-filter=ACM | grep -E "\.(ts|tsx)$" | xargs eslint --max-warnings=0'
        language: system
        stages: [commit]
        pass_filenames: false
```

## Related Bindings

- [git-hooks-automation.md](../../core/git-hooks-automation.md): This binding extends git hooks automation by implementing ESLint/Prettier as essential quality gates. Both bindings work together to create comprehensive pre-commit validation that catches issues before they reach the repository.

- [no-lint-suppression.md](../../core/no-lint-suppression.md): The zero-suppression policy directly implements the no-lint-suppression binding's principles by requiring documented justification for any quality check bypasses and encouraging root cause resolution over suppression.

- [modern-typescript-toolchain.md](../../docs/bindings/categories/typescript/modern-typescript-toolchain.md): This binding implements the code quality component of the unified TypeScript toolchain, providing the ESLint/Prettier automation that complements Vitest testing, tsup building, and pnpm package management.

- [automated-quality-gates.md](../../core/automated-quality-gates.md): ESLint/Prettier automation serves as a foundational quality gate that prevents style and basic correctness issues from entering the development pipeline, supporting the tiered enforcement strategy with fast feedback and automatic remediation.
