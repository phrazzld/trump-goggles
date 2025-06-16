---
derived_from: automation
enforced_by: commit hooks & CI checks
id: require-conventional-commits
last_modified: '2025-05-14'
version: '0.1.0'
---
# Binding: Express Intent Through Structured Commit Messages

All commit messages must follow the Conventional Commits specification, providing a
consistent format that explicitly communicates the purpose and impact of each change.
This structured approach enables automated versioning, changelog generation, and release
management by making commit intent machine-readable while remaining human-friendly.

## Rationale

This binding directly implements our automation tenet by transforming commit messages
from unstructured text into structured data that can drive automated processes
throughout the development lifecycle. When you adopt conventional commits, you're not
just documenting changes—you're creating machine-readable metadata that enables
automation to take over repetitive tasks like versioning, release notes, and deployment
workflows.

Think of conventional commits like addressing an envelope correctly. Just as a properly
formatted mailing address ensures your letter reaches its destination through multiple
automated sorting systems, a properly formatted commit message ensures your code changes
flow smoothly through automated versioning, changelog generation, and release processes.
An incorrectly addressed envelope might eventually reach its destination through manual
intervention, but it creates unnecessary friction. Similarly, unstructured commit
messages might eventually be understood by humans reading them, but they create friction
that prevents automation from reliably interpreting your intent.

The benefits of conventional commits compound as your project grows. For small projects
with few contributors, inconsistent commit messages might seem like a minor
inconvenience. But as teams scale and release frequency increases, the inability to
automate versioning and changelog generation becomes a significant bottleneck. By
establishing consistent commit message patterns from the start, you create the
foundation for sustainable automation that scales with your project. The small upfront
cost of learning and applying the convention pays enormous dividends in reduced manual
work, more reliable releases, and clearer project history.

## Rule Definition

This binding establishes structured commit messages as a fundamental project
requirement:

- **Follow the Conventional Commits Format**: Every commit message must adhere to this
  pattern:

  ```
  <type>[optional scope]: <description>

  [optional body]

  [optional footer(s)]
  ```

- **Use Standardized Type Prefixes**: The `type` field must be one of these standardized
  values:

  - `feat`: A new feature (correlates to a MINOR version bump in semantic versioning)
  - `fix`: A bug fix (correlates to a PATCH version bump)
  - `docs`: Documentation-only changes
  - `style`: Changes that don't affect code functionality (formatting, whitespace)
  - `refactor`: Code changes that neither fix bugs nor add features
  - `perf`: Performance improvements
  - `test`: Adding or correcting tests
  - `build`: Changes to build system or dependencies
  - `ci`: Changes to CI configuration or scripts
  - `chore`: Other changes that don't modify source or test files

- **Denote Breaking Changes**: When a commit introduces a breaking change:

  - Add an exclamation mark after the type/scope: `feat!:` or `feat(api)!:`
  - Explain the breaking change in the body with a `BREAKING CHANGE:` footer

- **Keep Commits Focused**: Each commit should represent a single logical change:

  - The type should accurately reflect the primary purpose of the change
  - The description should be concise (50 characters or less) but descriptive
  - More detailed explanations belong in the commit body

- **Scope Usage**: When applicable, include a scope in parentheses after the type to
  indicate which part of the codebase is affected:

  - Scopes should be consistent across similar commits
  - Common scopes include module names, feature areas, or system components

- **Compliance Checking**: All commits must pass automated validation before being
  accepted:

  - Pre-commit hooks should validate commit message format
  - CI/CD pipelines should reject non-compliant commit messages
  - Pull requests containing non-compliant commits should be blocked

## Practical Implementation

Here are concrete strategies for implementing conventional commits effectively:

1. **Set Up Tooling for Enforcement**: Add automated checks to prevent non-compliant
   commits:

   ```bash
   # Install commitlint and config-conventional
   npm install --save-dev @commitlint/cli @commitlint/config-conventional

   # Create commitlint.config.js
   echo "module.exports = {extends: ['@commitlint/config-conventional']}" > commitlint.config.js

   # Set up Husky for pre-commit hooks
   npm install --save-dev husky
   npx husky install
   npx husky add .husky/commit-msg 'npx --no -- commitlint --edit $1'
   ```

   These tools validate commit messages before they're accepted, providing immediate
   feedback when a message doesn't meet the convention.

1. **Provide Commit Message Generation Tools**: Use interactive tools to help developers
   create compliant messages:

   ```bash
   # Install Commitizen
   npm install --save-dev commitizen cz-conventional-changelog

   # Configure Commitizen to use conventional changelog format
   echo '{ "path": "cz-conventional-changelog" }' > .czrc

   # Add script to package.json
   # "scripts": { "commit": "cz" }
   ```

   This creates an interactive commit process that guides developers through creating
   properly formatted messages without memorizing the specification.

1. **Create Templates and Examples**: Provide clear guidance for your team:

   ```bash
   # Create a commit template file
   cat > .gitmessage.txt << EOF
   # <type>[optional scope]: <short summary>
   # |<---- Use 50 chars ---->|

   # Explain why this change is being made
   # |<---- Try to limit each line to 72 chars ---->|

   # Provide links to any relevant tickets, articles or other resources
   # Example: Fixes #123, Relates #456

   # --- COMMIT END ---
   # Type can be:
   #   feat     (new feature)
   #   fix      (bug fix)
   #   docs     (changes to documentation)
   #   style    (formatting, missing semi colons, etc; no code change)
   #   refactor (refactoring production code)
   #   test     (adding missing tests, refactoring tests; no production code change)
   #   chore    (updating grunt tasks etc; no production code change)
   # --------------------
   # Remember to:
   #   - Use the imperative mood in the subject line
   #   - Do not end the subject line with a period
   #   - Separate subject from body with a blank line
   #   - Use the body to explain what and why vs. how
   #   - Can use multiple lines with "-" for bullet points in body
   # --------------------
   EOF

   # Configure Git to use the template
   git config --local commit.template .gitmessage.txt
   ```

   This template provides guidance when developers write commit messages and serves as a
   quick reference for the convention.

1. **Set Up Automated Changelog Generation**: Leverage conventional commits for release
   automation:

   ```bash
   # Install standard-version
   npm install --save-dev standard-version

   # Add script to package.json
   # "scripts": { "release": "standard-version" }
   ```

   This automatically generates changelogs based on commit types, making release
   preparation faster and more consistent.

1. **Improve Commit Message Quality**: Focus on writing meaningful descriptions:

   - Use the imperative mood ("Add feature" not "Added feature")
   - Be specific about what changed and why
   - Reference issue numbers when applicable
   - Describe the impact on users or developers
   - Explain motivation in the commit body

   Good commit messages provide context that helps future contributors understand why
   changes were made, not just what changed.

## Examples

```
// ❌ BAD: Unclear commit message with no structure
fixed login bug

// ✅ GOOD: Conventional commit message for a bug fix
fix(auth): prevent login timeout on slow connections

Login was failing when network responses exceeded 3 seconds.
The timeout has been increased to 10 seconds to accommodate
users on slower connections.

Fixes #143
```

```
// ❌ BAD: Multiple unrelated changes in one commit
updated styles, fixed navigation bug, added new API endpoint

// ✅ GOOD: Focused commit with a single purpose
feat(api): add user profile endpoint

The new endpoint allows clients to:
- Retrieve basic user profile information
- Update display name and preferences
- Set notification settings

This implements the user profile feature outlined in RFC-27.
```

```
// ❌ BAD: Breaking change without proper indication
refactor: rename authentication methods

// ✅ GOOD: Properly indicated breaking change
refactor!: rename authentication methods

BREAKING CHANGE: All authentication method names have been
standardized to follow the pattern `auth<Action>`.

Migration guide:
- `login()` → `authLogin()`
- `validateUser()` → `authValidate()`
- `logout()` → `authLogout()`

This change improves API consistency and makes the auth
subsystem more maintainable.
```

```
// ❌ BAD: Vague description that doesn't explain what changed
chore: update dependencies

// ✅ GOOD: Specific details about the dependency changes
chore(deps): update database driver to v4.2.1

Updates the database driver to resolve connection pool leaks
when database connections time out. This version also adds
support for the new authentication methods introduced in
the database server v14.

Closes #256
```

## Related Bindings

- [document-decisions](../../docs/tenets/document-decisions.md): Both bindings emphasize the
  importance of preserving context. While conventional commits provide structured
  history at the repository level, documenting decisions focuses on capturing context
  within the code. Together, they ensure the "why" behind changes is preserved at both
  the commit level and in the codebase itself.

- [automate-changelog](../../docs/bindings/core/automate-changelog.md): Conventional commits enable automated
  changelog generation by providing a structured format that tools can parse. These
  bindings work hand-in-hand—conventional commits provide the input data that automated
  changelog tools transform into organized release notes that highlight features, fixes,
  and breaking changes.

- [semantic-versioning](../../docs/bindings/core/semantic-versioning.md): Conventional commits create a direct
  mapping to semantic version increments—features trigger minor version bumps, fixes
  trigger patch version bumps, and breaking changes trigger major version bumps. This
  connection ensures your versioning accurately reflects the nature of changes, giving
  users clear expectations about compatibility.

- [git-hooks-automation.md](../../docs/bindings/core/git-hooks-automation.md): Git hooks enforce conventional commit message standards through automated validation at commit time. Both bindings ensure consistent commit practices that enable reliable automation throughout the development workflow.

- [version-control-workflows.md](../../docs/bindings/core/version-control-workflows.md): Version control workflows integrate conventional commits with branch protection and automated release processes. Both bindings create comprehensive commit standards that support automated project management.

- [ci-cd-pipeline-standards.md](../../docs/bindings/core/ci-cd-pipeline-standards.md): CI/CD pipelines leverage conventional commit messages for automated changelog generation and semantic versioning. Both bindings enable reliable automation from commit messages through production deployment.
