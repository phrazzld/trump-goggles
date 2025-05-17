# Task ID: T010

## Title: add explicit TypeScript type annotations to new modules

## Original Ticket Text:

- [ ] **T010 · Refactor · P0: add explicit TypeScript type annotations to new modules**

  - **Context:** PLAN.md, CR-02, Step 2
  - **Action:**
    1. Add explicit type annotations to all functions, parameters, and return types in the newly converted TypeScript modules.
    2. Use interfaces from `types.d.ts` where appropriate.
  - **Done‑when:**
    1. Each module has complete type coverage with no implicit `any` types.
    2. TypeScript compiler runs without type errors.
  - **Depends‑on:** [T009]

## Implementation Approach Analysis Prompt:

Analyze the task of adding explicit TypeScript type annotations to the following modules:
- dom-modifier.ts
- tooltip-ui.ts
- tooltip-manager.ts
- tooltip-browser-adapter.ts
- performance-utils.ts

The goal is to:
1. Add explicit type annotations to all functions, parameters, and return types
2. Use interfaces from types.d.ts where appropriate
3. Eliminate all implicit 'any' types
4. Ensure the TypeScript compiler runs without errors

Consider:
- What interfaces are available in types.d.ts that should be used?
- How should the modules' public APIs be typed?
- What are the most appropriate types for event handlers, DOM elements, and configuration objects?
- How can we maintain backward compatibility while adding type safety?
- What design patterns should be used for typing callback functions and event listeners?
- How should optional parameters and default values be typed?
- What approach should be taken for typing browser-specific APIs?

Provide a comprehensive plan for adding types to each module, including specific type definitions that should be created or imported.