---
derived_from: automation
id: automate-changelog
last_modified: '2025-05-14'
enforced_by: code review & style guides
---
# Binding: Automate Changelog Generation from Structured Commits

All projects must automatically generate changelogs using structured commit messages.
Manually maintaining change logs is error-prone and time-consuming; instead, leverage
conventional commits to automatically produce accurate, consistent documentation of
changes across versions.

## Rationale

This binding directly implements our automation tenet by transforming manual
documentation work into an automated process driven by data already captured in commit
messages. When you follow structured commit practices and automate changelog generation,
you're creating a system where documentation becomes a natural byproduct of your
development workflow rather than an additional burden that requires separate effort and
attention.

Think of automated changelogs like the difference between manually keeping a trip log
versus using a GPS system that automatically records your journey. With a manual log,
entries are often inconsistent, details get forgotten, and maintaining it requires
constant attention that distracts from your primary focus—driving. A GPS system,
however, silently records your exact route, stops, and timing without any additional
effort on your part. Similarly, automated changelog generation captures the development
journey without requiring developers to maintain a separate record, ensuring complete
and accurate documentation while freeing mental bandwidth for more valuable creative
work.

The benefits of automated changelogs become increasingly apparent as projects scale and
release frequency increases. Manual changelog maintenance inevitably leads to
inconsistencies in format, level of detail, and categorization, making changelog
information less useful over time. Automated generation enforces consistent
categorization (features, fixes, breaking changes) and detail level across all entries,
regardless of how many developers contribute or how frequently releases occur. This
consistency transforms the changelog from a loosely formatted text document into a
queryable history that helps users understand exactly what changed between versions and
how it might affect them.

## Rule Definition

This binding establishes clear requirements for implementing automated changelog
generation:

- **Commit Message Structure**: All commits must follow the Conventional Commits
  specification as defined in the
  [require-conventional-commits](../../docs/bindings/core/require-conventional-commits.md) binding:

  - Use standardized type prefixes (`feat`, `fix`, `docs`, etc.)
  - Mark breaking changes with `!` and `BREAKING CHANGE:` footer
  - Write clear, descriptive messages

- **Automated Tooling**: Projects must implement automated changelog generation:

  - Configure tools to parse conventional commits
  - Generate changelogs automatically during release processes
  - Include version number, release date, and categorized changes
  - Maintain a complete history of changes across all versions

- **Standard Format**: Generated changelogs must follow a consistent format:

  - Group changes by type (features, fixes, breaking changes)
  - Include commit authors for attribution
  - Link to issues or pull requests when referenced
  - Maintain a consistent style across all releases

- **Release Integration**: Changelog generation must be integrated into the release
  process:

  - Trigger changelog updates when creating a new version
  - Include changelog updates in release commits
  - Publish changelog changes alongside released artifacts

- **Exceptions**: The following are explicitly exempt from this binding:

  - Private exploratory repositories not intended for release
  - Single-use scripts and utilities without versioning
  - Repositories with fewer than 3 contributors and no public API

## Practical Implementation

Here are concrete strategies for implementing automated changelog generation:

1. **Set Up Standard-Version or similar tools**:

   ```bash
   # Install standard-version
   npm install --save-dev standard-version

   # Add script to package.json
   # "scripts": { "release": "standard-version" }

   # Configure changelog customization (.versionrc)
   echo '{
     "types": [
       {"type": "feat", "section": "Features"},
       {"type": "fix", "section": "Bug Fixes"},
       {"type": "docs", "section": "Documentation"},
       {"type": "style", "section": "Styling"},
       {"type": "refactor", "section": "Code Refactoring"},
       {"type": "perf", "section": "Performance Improvements"},
       {"type": "test", "section": "Tests"},
       {"type": "build", "section": "Build System"},
       {"type": "ci", "section": "CI"},
       {"type": "chore", "section": "Chores"}
     ]
   }' > .versionrc
   ```

1. **Configure CI/CD Integration**:

   ```yaml
   # GitHub Actions workflow example
   name: Release
   on:
     push:
       tags:
         - 'v*'

   jobs:
     release:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v2
           with:
             fetch-depth: 0

         - name: Set up Node.js
           uses: actions/setup-node@v2
           with:
             node-version: '16'

         - name: Install dependencies
           run: npm ci

         - name: Generate changelog
           run: npx standard-version --skip.bump --skip.tag

         - name: Create GitHub Release
           uses: actions/create-release@v1
           env:
             GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
           with:
             tag_name: ${{ github.ref }}
             release_name: Release ${{ github.ref }}
             body_path: CHANGELOG.md
             draft: false
             prerelease: false
   ```

1. **Set Up Commit Validation**:

   ```bash
   # Install commitlint and husky
   npm install --save-dev @commitlint/cli @commitlint/config-conventional husky

   # Configure commitlint
   echo "module.exports = {extends: ['@commitlint/config-conventional']}" > commitlint.config.js

   # Set up Husky
   npx husky install
   npx husky add .husky/commit-msg 'npx --no -- commitlint --edit $1'
   ```

1. **Create a Changelog Template**:

   ```markdown
   # Changelog

   All notable changes to this project will be documented in this file.

   The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
   and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

   ## [Unreleased]

   <!-- Automatically generated by release tooling -->
   ```

1. **Integrate with Documentation Workflow**:

   ```yaml
   # Documentation site build workflow
   name: Docs

   on:
     push:
       branches: [main]

   jobs:
     build-docs:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v2

         - name: Set up build environment
           uses: actions/setup-node@v2
           with:
             node-version: '16'

         - name: Install dependencies
           run: |
             # Install your documentation generator
             # Examples: npm install -g @11ty/eleventy
             #           npm install -g hexo-cli
             #           npm install -g vuepress
             npm ci

         - name: Extract changelog for docs
           run: |
             # Extract the most recent complete release entry
             awk '/^## [[0-9]+\.[0-9]+\.[0-9]+]/{p++;if(p==2)exit} {if(p==1)print}' CHANGELOG.md > docs/recent-changes.md

         - name: Build documentation
           run: |
             # Build your documentation site
             # Examples: eleventy, hexo generate, vuepress build
             npm run build-docs
   ```

## Examples

```
// ❌ BAD: Manual changelog with inconsistent format and missing entries
# Changelog

## v1.2.0
- Added user profile feature
- Some bug fixes
- Performance improvements

## v1.1.0
- New dashboard
- Fixed login issues
```

```
// ✅ GOOD: Automatically generated changelog with consistent formatting
# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.2.0](https://github.com/org/repo/compare/v1.1.0...v1.2.0) (2025-04-15)

### Features

* **profile:** add user profile page with avatar support ([a1b2c3d](https://github.com/org/repo/commit/a1b2c3d))
* **profile:** implement profile settings section ([e5f6g7h](https://github.com/org/repo/commit/e5f6g7h))

### Bug Fixes

* **auth:** prevent login timeout on slow connections ([i8j9k0l](https://github.com/org/repo/commit/i8j9k0l))
* **dashboard:** correct data loading sequence ([m1n2o3p](https://github.com/org/repo/commit/m1n2o3p))

### Performance Improvements

* **api:** implement query result caching ([q4r5s6t](https://github.com/org/repo/commit/q4r5s6t))
* **dashboard:** virtualize large data lists ([u7v8w9x](https://github.com/org/repo/commit/u7v8w9x))

## [1.1.0](https://github.com/org/repo/compare/v1.0.0...v1.1.0) (2025-03-01)

### Features

* **dashboard:** add interactive analytics dashboard ([y9z8a7b](https://github.com/org/repo/commit/y9z8a7b))

### Bug Fixes

* **auth:** resolve login failure with special characters in password ([c6d5e4f](https://github.com/org/repo/commit/c6d5e4f))
```

```
// ❌ BAD: Separate, manual process for changelog updates
# Release Process

1. Update version in package.json
2. Update CHANGELOG.md manually:
   - Add new version heading
   - List all major changes since last release
   - Group changes by type
3. Commit changes: "Bump version to X.Y.Z"
4. Create tag: git tag vX.Y.Z
5. Push changes and tags
```

````
// ✅ GOOD: Integrated, automated release process
# Release Process

1. Ensure all changes are committed and CI is passing
2. Run the release script:
   ```bash
   npm run release
````

This will:

- Determine the appropriate version bump based on commit messages
- Update package.json and package-lock.json
- Generate/update CHANGELOG.md from commit history
- Create a version commit
- Create a git tag

3. Push changes and tags:
   ```bash
   git push --follow-tags origin main
   ```
1. CI will automatically create a GitHub release with the generated changelog

```

## Related Bindings

- [require-conventional-commits](../../docs/bindings/core/require-conventional-commits.md): Conventional commits provide the structured data that enables automated changelog generation. These bindings work together to create a seamless workflow—conventional commit messages act as the data source, and changelog automation transforms that data into valuable documentation without additional effort.

- [semantic-versioning](../../docs/bindings/core/semantic-versioning.md): Automated changelogs and semantic versioning are complementary practices. Conventional commits signal what kind of version change is needed (patch, minor, major), while changelog automation ensures that all relevant changes are documented for each version increment.
```
