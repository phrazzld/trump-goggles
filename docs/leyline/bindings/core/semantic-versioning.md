---
derived_from: explicit-over-implicit
enforced_by: version checking tools & CI validation
id: semantic-versioning
last_modified: '2025-05-14'
version: '0.1.0'
---
# Binding: Make Breaking Changes Explicit with Semantic Versioning

All projects must follow Semantic Versioning (SemVer) for release numbering, making
compatibility guarantees explicit through version numbers. Version numbers must clearly
signal the nature of changes: patch (bug fixes), minor (backward-compatible features),
or major (breaking changes). This ensures developers can confidently update dependencies
with a clear understanding of the potential impact, and enables automated dependency
management tools to function correctly.

## Rationale

This binding directly implements our explicit-over-implicit tenet by bringing clarity to
one of the most critical aspects of software engineering: managing compatibility between
interdependent components. When you follow semantic versioning, you're transforming
version numbers from arbitrary labels into meaningful contracts that explicitly
communicate the compatibility implications of each release. This explicitness creates
trust between producers and consumers of software components, fostering healthy
ecosystems where developers can confidently build upon each other's work.

Think of semantic versioning like traffic signals at an intersection. Without clear
signals, every intersection would require cautious negotiation, slowing traffic and
increasing the risk of collisions. But with standardized signals, drivers can move
efficiently with confidence because the rules are explicit and universally understood.
Similarly, semantic versioning provides standardized signals about software changes,
allowing developers to navigate dependencies efficiently without the "collision risk" of
unexpected breaking changes or the inefficiency of overly cautious update avoidance.

The benefits of semantic versioning compound as projects scale and dependencies
multiply. In modern software development, even small applications might depend on dozens
or hundreds of libraries, each with their own dependencies. Without semantic versioning,
every update becomes a potential minefield of undocumented breaking changes, leading to
"dependency hell" where projects become locked to specific versions, falling behind on
important updates. By making compatibility guarantees explicit through version numbers,
semantic versioning creates an ecosystem where automated tools can safely navigate these
complex dependency networks, applying security fixes and performance improvements while
avoiding breaking changes.

## Rule Definition

This binding establishes how version numbers must communicate the nature of changes:

- **Version Format**: All releases must use the `MAJOR.MINOR.PATCH` versioning scheme:

  - `MAJOR`: Incremented for backward-incompatible changes
  - `MINOR`: Incremented for backward-compatible new features
  - `PATCH`: Incremented for backward-compatible bug fixes

- **Initial Development**: Versions before 1.0.0 (0.x.y) are considered unstable:

  - The API is not considered stable
  - Breaking changes may occur in minor versions
  - Projects should reach 1.0.0 when the API stabilizes

- **Version Increments**: Follow these rules for incrementing versions:

  - Increment `PATCH` when making backward-compatible bug fixes
  - Increment `MINOR` when adding functionality in a backward-compatible manner
  - Increment `MAJOR` when making incompatible API changes
  - Never modify released versions; always increment the version number

- **Pre-release Versions**: Use pre-release identifiers for unstable releases:

  - Format as `MAJOR.MINOR.PATCH-[identifier]`, e.g., `1.0.0-alpha.1`
  - Consider pre-release versions less precedent than normal versions

- **Build Metadata**: Additional build information can be appended:

  - Format as `MAJOR.MINOR.PATCH+[metadata]`, e.g., `1.0.0+20250506`
  - Build metadata does not affect version precedence

- **Deprecation Process**: Before removing features in a major version:

  - Mark features as deprecated in a minor version
  - Document migration paths and alternatives
  - Maintain deprecated features until the next major version

- **Compliance Verification**: Versions must be validated:

  - Include version validation in CI pipelines
  - Enforce compatibility with published API contracts
  - Verify version increments match the nature of changes

## Practical Implementation

Here are concrete strategies for implementing semantic versioning effectively:

1. **Set Up Version Management Tools**:

   ```bash
   # Install semantic-release for automated SemVer management
   npm install --save-dev semantic-release

   # Configure semantic-release (.releaserc.json)
   echo '{
     "branches": ["main"],
     "plugins": [
       "@semantic-release/commit-analyzer",
       "@semantic-release/release-notes-generator",
       "@semantic-release/npm",
       "@semantic-release/github",
       "@semantic-release/git"
     ]
   }' > .releaserc.json

   # Alternative: Use standard-version
   npm install --save-dev standard-version
   ```

1. **Implement API Contract Validation**:

   ```typescript
   // api-extractor.json for TypeScript API contract validation
   {
     "$schema": "https://developer.microsoft.com/json-schemas/api-extractor/v7/api-extractor.schema.json",
     "mainEntryPointFilePath": "<projectFolder>/lib/index.d.ts",
     "apiReport": {
       "enabled": true,
       "reportFolder": "<projectFolder>/api"
     },
     "dtsRollup": {
       "enabled": true
     },
     "docModel": {
       "enabled": true
     },
     "messages": {
       "extractorMessageReporting": {
         "ae-missing-release-tag": {
           "logLevel": "warning"
         },
         "ae-incompatible-release-tags": {
           "logLevel": "error"
         }
       }
     }
   }
   ```

1. **Configure CI/CD for Version Validation**:

   ```yaml
   # Workflow for validating version changes
   name: Version Validation

   on:
     pull_request:
       branches: [main]

   jobs:
     validate:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v2
           with:
             fetch-depth: 0

         - name: Check version increment
           run: |
             current_version=$(node -p "require('./package.json').version")
             main_version=$(git show origin/main:package.json | node -p "JSON.parse(process.stdin.read()).version")

             # Check if version follows SemVer
             if ! [[ $current_version =~ ^([0-9]+)\.([0-9]+)\.([0-9]+)(-([0-9A-Za-z-]+(\.[0-9A-Za-z-]+)*))?(\+([0-9A-Za-z-]+(\.[0-9A-Za-z-]+)*))?$ ]]; then
               echo "Error: Version $current_version does not follow semantic versioning"
               exit 1
             fi

             # Compare with main version
             if [[ $current_version == $main_version ]]; then
               echo "Error: Version not incremented"
               exit 1
             fi

             # Verify breaking changes warrant major version increment
             if [[ $(git log --oneline --grep "BREAKING CHANGE:" origin/main..HEAD | wc -l) -gt 0 ]]; then
               current_major=${current_version%%.*}
               main_major=${main_version%%.*}
               if [[ $current_major -le $main_major ]]; then
                 echo "Error: Breaking changes detected but major version not incremented"
                 exit 1
               fi
             fi

         - name: Validate API compatibility
           run: |
             npm ci
             npm run build
             npx api-extractor run --local
   ```

1. **Document Versioning Policy**:

   ```markdown
   # Versioning Policy

   This project follows [Semantic Versioning 2.0.0](https://semver.org/).

   ## Version Increments

   - **PATCH** (`1.0.X`): Bug fixes and patches that don't change the public API
   - **MINOR** (`1.X.0`): New features added in a backward-compatible manner
   - **MAJOR** (`X.0.0`): Breaking changes to the public API

   ## Stability Guarantees

   - **Stable API** (`>=1.0.0`): Public APIs are stable and will only break with a major version increment
   - **Experimental Features**: APIs marked as experimental may change between minor versions
   - **Internal APIs**: Anything marked "internal" or in `internal/` directories is not part of the public API

   ## Deprecation Process

   1. Features are marked as deprecated with `@deprecated` annotations
   2. Documentation is updated with migration guidance
   3. Deprecation warnings are emitted at runtime
   4. Deprecated features remain functional until the next major version
   ```

1. **Integrate with Package Registries**:

   ```json
   // package.json version scripts
   {
     "scripts": {
       "version": "npm run build && npm run api-report && git add api/",
       "postversion": "git push && git push --tags"
     }
   }
   ```

   ```bash
   # .npmrc
   tag-version-prefix=""
   message="chore(release): %s"
   ```

## Examples

```
// ❌ BAD: Inconsistent versioning scheme
Version 1.4 -> Version 1.5 -> Version 1.5.1 -> Version 1.6 -> Version 2
```

```
// ✅ GOOD: Semantic versioning with clear meaning
1.0.0 -> 1.1.0 (new feature) -> 1.1.1 (bug fix) -> 1.2.0 (new feature) -> 2.0.0 (breaking change)
```

```
// ❌ BAD: Breaking change without major version increment
// v1.2.0
export function processData(data: string[]): Result {
  // Implementation
}

// v1.3.0 - Breaking change but only minor version increment!
export function processData(data: string[]): Promise<Result> {
  // Now returns a Promise!
}
```

```
// ✅ GOOD: Breaking change with proper version increment and migration path
// v1.2.0
export function processData(data: string[]): Result {
  // Implementation
}

// v1.3.0 - Added async version while maintaining backward compatibility
export function processData(data: string[]): Result {
  // Original implementation
}
export function processDataAsync(data: string[]): Promise<Result> {
  // Async implementation
}

// v2.0.0 - Breaking change with major version increment
/**
 * @deprecated Use processDataAsync instead
 */
export function processData(data: string[]): Result {
  console.warn('processData is deprecated. Use processDataAsync instead.');
  // Original implementation
}
export function processDataAsync(data: string[]): Promise<Result> {
  // Async implementation
}
```

```
// ❌ BAD: Misleading version increment
// Bug fix with minor version increment instead of patch
v1.2.0 -> v1.3.0 (just bug fixes, should be v1.2.1)

// New feature with patch increment instead of minor
v1.2.0 -> v1.2.1 (adds new features, should be v1.3.0)
```

```
// ✅ GOOD: Version increments match nature of changes
// Bug fix correctly uses patch increment
v1.2.0 -> v1.2.1 (fixes alignment bug in dashboard)

// New feature correctly uses minor increment
v1.2.1 -> v1.3.0 (adds export to PDF feature)

// Breaking API change correctly uses major increment
v1.3.0 -> v2.0.0 (redesigned authentication API)
```

## Related Bindings

- [require-conventional-commits](../../docs/bindings/core/require-conventional-commits.md): Conventional commit
  messages provide the structured metadata needed to automate semantic version
  increments. The type prefix in a conventional commit directly maps to SemVer
  increments: `fix:` triggers a patch, `feat:` triggers a minor version, and `feat!:` or
  `BREAKING CHANGE:` triggers a major version. Together, these bindings create a
  seamless workflow where commit messages drive both changelogs and versioning.

- [automate-changelog](../../docs/bindings/core/automate-changelog.md): Semantic versioning and automated
  changelogs work together to communicate changes clearly. While SemVer provides a quick
  signal about compatibility through version numbers, changelogs provide the details
  about what actually changed. These bindings complement each other by ensuring both
  high-level compatibility signals and detailed change information are available and
  accurate.

- [immutable-by-default](../../docs/bindings/core/immutable-by-default.md): Both semantic versioning and
  immutability share a fundamental principle: once something is released or shared, it
  shouldn't change unexpectedly. With SemVer, we explicitly signal when breaking changes
  occur through major version increments; with immutability, we prevent unexpected
  changes to data. Both create more predictable, reliable systems by making changes
  explicit rather than implicit.

- [version-control-workflows.md](../../docs/bindings/core/version-control-workflows.md): Version control workflows integrate semantic versioning with automated release processes and branch protection. Both bindings ensure that version increments accurately reflect the nature of changes through systematic workflow automation.

- [ci-cd-pipeline-standards.md](../../docs/bindings/core/ci-cd-pipeline-standards.md): CI/CD pipelines automate semantic version increments based on conventional commit messages and validate compatibility guarantees. Both bindings create reliable automation that ensures version numbers accurately communicate compatibility expectations.
