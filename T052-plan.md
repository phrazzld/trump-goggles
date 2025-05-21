# T052 Plan: Fix TypeScript Errors in Bundled Scripts

## Context
The project contains several TypeScript errors in bundled scripts that need to be fixed. The main issues are:

1. **Variable redeclaration errors for Logger and TrumpMappings**:
   - Both 'logger.js' and 'trump-mappings.js' use const declarations that conflict with global window attachments
   - Error: TS2451: Cannot redeclare block-scoped variable 'X'

2. **Implicit any types in utility scripts**:
   - 'scripts/check-test-types.js' has several issues with object type indexing
   - Error: TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'

3. **General type checking issues**:
   - Unused @ts-expect-error directives
   - Implicit any types in various scripts
   - Type incompatibility issues

## Implementation Plan

### 1. Fix Variable Redeclaration Errors

#### For logger.js:
1. Convert to proper TypeScript module export pattern
2. Create type declarations to properly define the Logger interface
3. Use proper namespacing to avoid global namespace pollution
4. Maintain backward compatibility while improving TypeScript support

#### For trump-mappings.js:
1. Similar approach as logger.js - convert to proper TypeScript module
2. Create type declarations for the TrumpMappings interface
3. Use namespacing to avoid redeclaration issues
4. Preserve backward compatibility with existing code

### 2. Fix Implicit Any Types in check-test-types.js

1. Add proper type annotations to objects like errorTypes
2. Use Record<string, number> type for objects with dynamic string keys
3. Add type assertions where needed
4. Fix TypeScript errors in error pattern matching and processing

### 3. General Type Improvements

1. Add .d.ts declaration files where needed
2. Remove unused @ts-expect-error directives
3. Add proper JSDoc with TypeScript types for any remaining JavaScript files
4. Address import/export compatibility in modules

## Implementation Details

### Logger Module Fixes
- Convert to TypeScript (.ts extension)
- Use explicit module exports
- Define comprehensive type definitions
- Namespace the module properly to avoid collisions

### TrumpMappings Module Fixes
- Convert to TypeScript or add proper JSDoc annotations
- Create cleaner module structure
- Define proper types for regex-mapping pairs
- Maintain window.* exports for compatibility

### Utility Script Fixes
- Add type definitions for dynamic objects
- Fix index signatures
- Add proper error handling with types

## Backward Compatibility Considerations
- Maintain the same public APIs
- Keep window.* assignments for browser extension compatibility
- Ensure the same functionality is preserved
- Add compatibility types for legacy code

## Testing Strategy
After making changes, we'll verify that:
1. TypeScript compiles without errors
2. All existing functionality continues to work
3. No regressions are introduced
4. Tests continue to pass

## Success Criteria
1. No TypeScript errors in bundled scripts
2. Improved type safety across the codebase
3. Passing all existing tests
4. Proper type declarations for public APIs