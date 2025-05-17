# T009 Plan: Rename new module .js files to .ts

## Implementation Approach

This task involves renaming five JavaScript files to TypeScript files and updating any import statements that reference them.

### Files to rename:
1. `dom-modifier.js` → `dom-modifier.ts`
2. `tooltip-ui.js` → `tooltip-ui.ts`
3. `tooltip-manager.js` → `tooltip-manager.ts`
4. `tooltip-browser-adapter.js` → `tooltip-browser-adapter.ts`
5. `performance-utils.js` → `performance-utils.ts`

### Steps:
1. Rename each file using git mv to preserve history
2. Update import statements in `content-consolidated.js`
3. Update import statements in any test files if necessary
4. Update build configuration to recognize .ts files
5. Run build to verify everything still works

### Principles Applied:
- Simplicity First: This is a straightforward file rename operation
- Modularity: Maintaining module structure while changing file extension
- Automation: Using git mv and build tools to verify correctness