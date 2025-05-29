# Todo List

## Technical Debt

- [x] T050: Fix TypeScript errors in test files

  - Find a proper solution to address type errors in test files
  - Update test files to properly type mock objects
  - Create proper type definitions for mock objects
  - Configure TypeScript properly for test files

- [x] T051: Fix remaining TypeScript errors in test files

  - ✅ Address the most common TypeScript errors identified by our type checking script
  - ✅ Create test type definitions infrastructure (test/types/ directory)
  - ✅ Convert high-priority JavaScript test files to TypeScript (5 files converted)
  - ✅ Update mock objects to properly implement their interfaces
  - ✅ Fix type mismatches between JSDOM's window object and the real Window interface
  - ✅ Ensure test files pass TypeScript checks with the test-specific configuration (reduced from 565 to 29 errors)

- [x] T054: Add allowJs: false to tsconfig and convert all JavaScript test files

  - ✅ Create test type infrastructure (test/types/ directory)
  - ✅ Convert all 14 JavaScript test files to TypeScript
  - ✅ Update tsconfig.test.json: set allowJs: false
  - ✅ Validate all tests pass (257 tests passing)
  - ✅ Complete TypeScript migration of entire test suite

- [x] T055: Enable strict TypeScript checking for test files

  - ✅ Enable strict mode in tsconfig.test.json
  - ✅ Fix type assertion issues in tooltip-manager-simplified.test.ts (implemented vi.mocked() helper)
  - ✅ Fix missing type exports (DOMWindow vs JSDOMWindow)
  - ✅ Address unused variable warnings
  - ✅ Fix null/undefined checking issues (added non-null assertions and proper null checks)
  - ✅ Ensure all test files pass strict TypeScript checking (257 tests passing)

- [x] T056: Complete TypeScript migration of remaining JavaScript files
  - ✅ Convert test/fixtures/\*.js files to TypeScript or add proper type declarations (kept as JS with .d.ts)
  - ✅ Convert test/e2e/\*.js files to TypeScript (4 files converted)
  - ✅ Restore full test directory TypeScript checking (allowJs: false)
  - ✅ Remove temporary exclusions from tsconfig.json
  - ✅ Ensure full codebase TypeScript compliance (257 tests passing)
- [x] T052: Fix TypeScript errors in bundled scripts
  - Fix variable redeclaration errors (Logger, TrumpMappings)
  - Address implicit any types in utility scripts
  - Ensure proper type checking for all bundled scripts
- [x] T053: Fix remaining TypeScript errors in extensions and mocks
  - Resolve errors in extension-api.mock.ts
  - Update extension mock types and interfaces
  - Fix TypeScript compatibility issues in browser modules

Note: Major TypeScript migration milestone reached! T050-T054 complete the core TypeScript conversion work. All 257 tests are passing and no JavaScript test files remain. T055 will complete the migration by enabling strict type checking across all test files.
