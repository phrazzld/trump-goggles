# T010 Plan: Add explicit TypeScript type annotations to new modules

## Approach

Adopt a "Strict Dependency-Ordered Typing" strategy:
1. Enforce full TypeScript strictness globally
2. Add explicit type annotations to each module in their order of dependency
3. Leverage `types.d.ts` and standard DOM types
4. Achieve zero implicit `any` and ensure compiler validation

## Module Dependency Order

Based on imports and functionality analysis, the typing order will be:

1. **performance-utils.ts** - No internal dependencies, foundational utilities
2. **tooltip-browser-adapter.ts** - Browser API adapter, used by other modules  
3. **dom-modifier.ts** - DOM utilities with text conversion types
4. **tooltip-ui.ts** - UI component that depends on browser adapter
5. **tooltip-manager.ts** - Orchestrates tooltips, depends on UI and performance utils

## Typing Strategy

### Phase 1: TypeScript Configuration

1. Verify `tsconfig.json` has `"strict": true` (currently active)
2. Review all existing interfaces in `types.d.ts`
3. Identify gaps in type definitions

### Phase 2: Module-by-Module Implementation

For each module, apply these principles:

1. **Public API Typing**
   - All exported functions get explicit parameter and return types
   - Use `void` for functions with no return
   - Use `Promise<T>` for async functions

2. **Internal Logic Typing**
   - Type all internal variables, constants, and helper functions
   - No implicit `any` allowed

3. **DOM Element Types**
   - Use standard TypeScript DOM types: `HTMLElement`, `Event`, `MouseEvent`, etc.
   - Event handlers: `(event: MouseEvent) => void`

4. **Configuration Objects**
   - Utilize interfaces from `types.d.ts`
   - Create new interfaces in `types.d.ts` for shared types
   - Use `?` for optional properties

5. **Callbacks and Event Listeners**
   - Define clear function signatures
   - Example: `type MutationCallback = (mutations: MutationRecord[], observer: MutationObserver) => void`

6. **Browser-Specific APIs**
   - Leverage TypeScript's built-in `lib.dom.d.ts`
   - Create minimal typed wrappers for non-standard APIs

### Phase 3: Specific Module Requirements

#### performance-utils.ts
- Type the `PerformanceUtils` object and all methods
- Use generic types for throttle/debounce functions
- Define `MemoryInfo` interface
- Type ElementCache and DOMBatch properties

#### tooltip-browser-adapter.ts
- Type browser detection results
- Create interfaces for browser info and feature detection
- Type style manipulation functions
- Define event handler cleanup functions

#### dom-modifier.ts
- Use `TextSegmentConversion` interface from `types.d.ts`
- Type DOM manipulation functions  
- Ensure proper Text node typing

#### tooltip-ui.ts
- Implement `TooltipUIInterface` from `types.d.ts`
- Type internal state (tooltipElement, isCreated)
- Type positioning calculations
- Define debug info structure

#### tooltip-manager.ts
- Implement `TooltipManagerInterface` from `types.d.ts`
- Type event handlers with proper Event types
- Type cached functions (throttled/debounced)
- Define initialization and disposal functions

### Phase 4: Verification

1. Run `tsc --noEmit` after each module
2. Fix all TypeScript errors
3. Ensure zero implicit `any` types
4. Run full project type check
5. Update any broken imports or references

## Expected Challenges

1. Event handler typing may require specific event type unions
2. Browser API compatibility types may need careful handling
3. Cached/throttled function types need to preserve original signatures
4. DOM element types must be specific enough for manipulation

## Success Criteria

1. TypeScript compiler runs without errors
2. No implicit `any` types remain
3. All public APIs have complete type annotations
4. Type safety is improved without breaking existing functionality