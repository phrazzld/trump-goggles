---
id: package-json-standards
last_modified: '2025-06-18'
version: '0.1.0'
derived_from: automation
enforced_by: 'package.json linting, CI validation, dependency scanning, lock file verification'
---

# Binding: Enforce Comprehensive Package.json Standards for Supply Chain Security

Standardize package.json structure and dependency management practices across all TypeScript projects. Enforce pnpm exclusively with explicit version declarations, implement automated security scanning, and establish rigorous validation processes that prevent supply chain vulnerabilities and ensure reproducible builds.

## Rationale

This binding implements our automation tenet by establishing package.json as a security-critical configuration artifact that requires standardized structure, automated validation, and consistent enforcement across all projects. Just as a factory assembly line requires standardized parts and processes to ensure quality, TypeScript projects require standardized dependency management to ensure security and reliability.

Think of package.json as the bill of materials for your software project. In manufacturing, a compromised or inaccurate bill of materials can lead to defective products, supply chain attacks, or catastrophic failures. Similarly, an improperly configured package.json can introduce security vulnerabilities, compatibility issues, or deployment failures that propagate throughout your entire system.

The automation benefits compound significantly when package.json standards are consistently applied. Automated security scanning can reliably detect vulnerabilities, CI pipelines can enforce dependency policies, and team members can confidently add dependencies knowing they follow established security and compatibility guidelines. This consistency eliminates an entire class of "works on my machine" issues and security misconfigurations.

## Rule Definition

This rule applies to all TypeScript projects including applications, libraries, CLI tools, and monorepo packages. The rule specifically requires:

**Essential Fields:**
- **packageManager**: Exact pnpm version specification for tool consistency
- **engines**: Minimum Node.js and pnpm version requirements
- **license**: Explicit license declaration for legal compliance
- **repository**: Source repository URL for supply chain transparency

**Security Configuration:**
- **scripts**: Standardized security scanning and validation commands
- **overrides**: Explicit dependency override declarations when necessary
- **workspaces**: Workspace configuration for monorepo security boundaries

**Dependency Standards:**
- **Version Specification**: Semantic version ranges with documented exact pinning
- **Supply Chain Validation**: Automated dependency vulnerability scanning
- **License Compliance**: Automated license compatibility verification
- **Update Automation**: Controlled dependency update processes

The rule prohibits missing packageManager declarations, undocumented dependency overrides, and CI configurations that bypass dependency security validation. When exceptions exist, they must be documented with security rationale and remediation timelines.

## Practical Implementation

1. **Standard Package.json Template**: Establish required fields for all TypeScript projects:
   ```json
   {
     "name": "@company/project-name",
     "version": "1.0.0",
     "packageManager": "pnpm@10.12.1",
     "engines": {
       "node": ">=18.0.0",
       "pnpm": ">=10.0.0"
     },
     "license": "MIT",
     "repository": {
       "type": "git",
       "url": "https://github.com/company/project-name.git"
     },
     "scripts": {
       "build": "tsup",
       "test": "vitest",
       "lint": "eslint src/",
       "format": "prettier --write src/",
       "security:audit": "pnpm audit --audit-level=moderate",
       "security:check": "pnpm run security:audit && pnpm run security:licenses",
       "security:licenses": "license-checker --onlyAllow 'MIT;ISC;Apache-2.0;BSD-2-Clause;BSD-3-Clause'"
     },
     "dependencies": {
       "express": "^4.18.0"
     },
     "devDependencies": {
       "typescript": "^5.0.0",
       "vitest": "^1.0.0",
       "tsup": "^8.0.0",
       "eslint": "^8.0.0",
       "prettier": "^3.0.0",
       "license-checker": "^25.0.1"
     }
   }
   ```

2. **Security-First Dependency Management**: Implement comprehensive vulnerability scanning and dependency validation:
   ```json
   {
     "scripts": {
       "preinstall": "npx only-allow pnpm",
       "postinstall": "pnpm run security:check",
       "security:audit": "pnpm audit --audit-level=moderate --audit-level=high",
       "security:outdated": "pnpm outdated",
       "security:licenses": "license-checker --onlyAllow 'MIT;ISC;Apache-2.0;BSD-2-Clause;BSD-3-Clause'",
       "security:check": "pnpm run security:audit && pnpm run security:licenses",
       "deps:update": "pnpm update --interactive --latest"
     },
     "overrides": {
       "vulnerable-package": "2.1.3"
     }
   }
   ```

3. **Automated Package.json Validation**: Create linting rules for package.json structure and content:
   ```javascript
   // package-json-lint.config.js
   module.exports = {
     rules: {
       'require-name': 'error',
       'require-version': 'error',
       'require-license': 'error',
       'require-repository': 'error',
       'require-engines': 'error',
       'valid-values-engines': ['error', ['>= 18.0.0']],
       'valid-values-license': ['error', ['MIT', 'ISC', 'Apache-2.0']],
       'prefer-property-order': ['error', [
         'name',
         'version',
         'packageManager',
         'engines',
         'license',
         'repository',
         'scripts',
         'dependencies',
         'devDependencies'
       ]],
       'require-scripts': ['error', ['build', 'test', 'lint', 'security:check']],
       'no-restricted-dependencies': ['error', {
         'dependencies': ['lodash'],
         'devDependencies': ['webpack']
       }]
     }
   };
   ```

4. **CI Pipeline Integration**: Comprehensive dependency validation in continuous integration:
   ```yaml
   name: Dependency Security Validation

   on: [push, pull_request]

   jobs:
     package-validation:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4

         - name: Setup pnpm
           uses: pnpm/action-setup@v4
           with:
             version: 10

         - name: Validate package.json structure
           run: |
             # Validate required fields exist
             required_fields=("packageManager" "engines" "license" "repository")
             for field in "${required_fields[@]}"; do
               if ! jq -e ".$field" package.json > /dev/null; then
                 echo "❌ Missing required field: $field"
                 exit 1
               fi
             done
             echo "✅ Package.json structure valid"

         - name: Verify pnpm version consistency
           run: |
             pkg_version=$(jq -r '.packageManager' package.json | grep -oE '[0-9]+\.[0-9]+\.[0-9]+')
             engine_version=$(jq -r '.engines.pnpm' package.json | grep -oE '[0-9]+\.[0-9]+\.[0-9]+')

             if [ "$pkg_version" != "$engine_version" ]; then
               echo "❌ pnpm version mismatch: packageManager=$pkg_version, engines=$engine_version"
               exit 1
             fi
             echo "✅ pnpm versions consistent"

         - name: Install dependencies
           run: pnpm install --frozen-lockfile

         - name: Security audit
           run: |
             pnpm audit --audit-level=moderate || {
               echo "❌ Security vulnerabilities found"
               echo "Run 'pnpm audit fix' to resolve automatically fixable issues"
               echo "For manual fixes, see: https://docs.npmjs.com/auditing-package-dependencies-for-security-vulnerabilities"
               exit 1
             }
             echo "✅ No security vulnerabilities detected"

         - name: License compliance check
           run: |
             pnpm run security:licenses || {
               echo "❌ License compliance violations detected"
               echo "Review dependency licenses and update allowed licenses list"
               exit 1
             }
             echo "✅ All licenses compliant"

         - name: Validate lockfile integrity
           run: |
             # Ensure lockfile is up to date
             pnpm install --frozen-lockfile --verify-store-integrity
             echo "✅ Lockfile integrity verified"

     dependency-analysis:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4

         - name: Analyze dependency tree
           run: |
             # Check for duplicate dependencies
             duplicates=$(pnpm list --depth=Infinity --json | jq '.[] | .dependencies | to_entries | group_by(.key) | map(select(length > 1)) | length')

             if [ "$duplicates" -gt 0 ]; then
               echo "⚠️  Duplicate dependencies detected: $duplicates"
               pnpm list --depth=Infinity --json | jq '.[] | .dependencies | to_entries | group_by(.key) | map(select(length > 1))'
               echo "Consider using pnpm overrides to deduplicate"
             fi

         - name: Bundle size analysis
           run: |
             # Check production bundle size
             pnpm run build
             bundle_size=$(du -sb dist/ | cut -f1)
             max_size=5000000  # 5MB limit

             if [ "$bundle_size" -gt "$max_size" ]; then
               echo "❌ Bundle size ${bundle_size} exceeds ${max_size} limit"
               echo "Consider: tree shaking, code splitting, or external dependencies"
               exit 1
             fi
             echo "✅ Bundle size ${bundle_size} within limits"
   ```

5. **Supply Chain Security Automation**: Implement comprehensive dependency monitoring:
   ```json
   {
     "scripts": {
       "security:full": "pnpm run security:check && pnpm run security:sbom && pnpm run security:sast",
       "security:sbom": "cyclonedx-node-npm --output-file sbom.json",
       "security:sast": "semgrep --config=auto src/",
       "security:supply-chain": "socket security audit",
       "deps:check-updates": "pnpm outdated --long",
       "deps:update-patch": "pnpm update --workspace-root",
       "deps:update-minor": "pnpm update --latest --workspace-root"
     },
     "devDependencies": {
       "@cyclonedx/cyclonedx-node-npm": "^1.0.0",
       "semgrep": "^1.0.0",
       "@socket.dev/cli": "^1.0.0"
     }
   }
   ```

## Supply Chain Security Integration

This binding integrates with comprehensive supply chain security practices to ensure dependency integrity and prevent security vulnerabilities.

**Security Scripts** (Required):
```json
{
  "scripts": {
    "security:check": "pnpm audit --audit-level=moderate && license-checker --onlyAllow 'MIT;ISC;Apache-2.0;BSD-2-Clause;BSD-3-Clause'",
    "security:audit": "pnpm audit --audit-level=moderate",
    "security:licenses": "license-checker --production --onlyAllow 'MIT;ISC;Apache-2.0;BSD-2-Clause;BSD-3-Clause'"
  },
  "devDependencies": {
    "license-checker": "^25.0.1"
  }
}
```

**Version Strategy**:
- **Security-Critical**: Exact versions (`"jsonwebtoken": "9.0.2"`)
- **Development Tools**: Semantic ranges (`"typescript": "^5.4.5"`)

**Security Configuration** (.npmrc):
```bash
audit-level=moderate
verify-store-integrity=true
verify-signatures=true
engine-strict=true
```

For comprehensive supply chain security guidance including SBOM generation, vulnerability scanning, license compliance automation, and CI integration, see the reference implementation in `examples/typescript-full-toolchain/SUPPLY_CHAIN_SECURITY.md`.

## Examples

```json
// ❌ BAD: Missing security-critical fields and inconsistent configuration
{
  "name": "my-app",
  "version": "1.0.0",
  "dependencies": {
    "express": "*",           // Dangerous wildcard version
    "lodash": "latest"        // Non-deterministic version
  },
  "devDependencies": {
    "webpack": "^5.0.0"       // Violates tsup standard
  }
}

// ✅ GOOD: Complete security configuration with required fields
{
  "name": "@company/secure-app",
  "version": "1.0.0",
  "packageManager": "pnpm@10.12.1",
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=10.0.0"
  },
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/company/secure-app.git"
  },
  "scripts": {
    "build": "tsup",
    "test": "vitest",
    "security:check": "pnpm audit --audit-level=moderate && license-checker --onlyAllow 'MIT;ISC;Apache-2.0'"
  },
  "dependencies": {
    "express": "^4.18.0"      // Semantic version range
  },
  "devDependencies": {
    "tsup": "^8.0.0",         // Standard build tool
    "vitest": "^1.0.0",       // Standard test framework
    "license-checker": "^25.0.1"
  }
}
```

## Enforcement

This binding is enforced through:
1. **Pre-commit hooks**: Validate package.json structure and dependency security
2. **CI pipeline**: Automated security scanning and license compliance checks
3. **Package.json linting**: Structural validation of required fields
4. **Dependency scanning**: Continuous monitoring for vulnerabilities

See `examples/typescript-full-toolchain/` for complete implementation example.
