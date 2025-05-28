# Todo List

## Technical Debt

- [x] T050: Fix TypeScript errors in test files
  - Find a proper solution to address type errors in test files
  - Update test files to properly type mock objects
  - Create proper type definitions for mock objects
  - Configure TypeScript properly for test files

- [ ] T051: Fix remaining TypeScript errors in test files (in progress)
  - Address the most common TypeScript errors identified by our type checking script
  - Update mock objects to properly implement their interfaces
  - Fix type mismatches between JSDOM's window object and the real Window interface
  - Ensure all test files pass TypeScript checks with the test-specific configuration

- [ ] T054: Add allowJs: false to tsconfig and fix all remaining JavaScript test files
  - Convert remaining JavaScript test files to TypeScript
  - Fix implicit any errors in test files
  - Enable strict TypeScript checking for test files
  
- [x] T052: Fix TypeScript errors in bundled scripts
  - Fix variable redeclaration errors (Logger, TrumpMappings)
  - Address implicit any types in utility scripts
  - Ensure proper type checking for all bundled scripts
- [x] T053: Fix remaining TypeScript errors in extensions and mocks
  - Resolve errors in extension-api.mock.ts
  - Update extension mock types and interfaces
  - Fix TypeScript compatibility issues in browser modules
  
Note: A significant portion of the TypeScript errors have been fixed, especially the most critical ones related to DOMWindow vs Window type issues, NodeList conversion issues, and boolean index errors. T053 has been completed, fixing extension mocks and converting key test files. Remaining TypeScript errors in other test files will be addressed in T051.