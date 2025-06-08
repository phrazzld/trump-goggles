# Todo

## Core Mapping Immutability - TypeScript Types
- [x] **T001 · Refactor · P1**: define immutable typescript interfaces for mappings
    - **Context:** PLAN.md, Phase 1: TypeScript Type System Enhancement / 1. Create Immutable Type Definitions
    - **Action:**
        1. In `src/data/trump-mappings.d.ts`, create `ImmutableTrumpMapping`, `ImmutableTrumpMappingsRecord`, and `ImmutableTrumpMappingsInterface` using `readonly` modifiers on all properties and return types.
    - **Done‑when:**
        1. New types are defined and exported from `trump-mappings.d.ts`.
        2. `tsc --noEmit` passes with strict mode enabled.
    - **Depends‑on:** none

- [x] **T002 · Refactor · P1**: update global window interface with readonly types
    - **Context:** PLAN.md, Phase 1: TypeScript Type System Enhancement / 2. Update Global Window Interface
    - **Action:**
        1. In `src/data/trump-mappings.d.ts`, update the `Window` interface to use `readonly TrumpMappings: ImmutableTrumpMappingsInterface`.
        2. Update `buildTrumpMap` to return the `readonly` record type.
    - **Done‑when:**
        1. The global `Window` interface reflects the new immutable types.
        2. TypeScript compilation is successful.
    - **Depends‑on:** [T001]

## Core Mapping Immutability - Runtime Implementation
- [x] **T003 · Feature · P1**: implement a deep freeze utility function
    - **Context:** PLAN.md, Phase 2: Runtime Immutability Implementation / 1. Create Deep Freeze Utility
    - **Action:**
        1. Implement the `deepFreeze(obj)` function in `src/data/trump-mappings.js` as specified.
        2. Ensure it recursively freezes objects and arrays, while correctly handling primitives and skipping `RegExp` instances.
    - **Done‑when:**
        1. The `deepFreeze` function is implemented and documented with JSDoc.
    - **Depends‑on:** none

- [x] **T004 · Refactor · P1**: apply deep freeze to the core mappings object
    - **Context:** PLAN.md, Phase 2: Runtime Immutability Implementation / 2. Apply Deep Freeze to Mappings
    - **Action:**
        1. In `src/data/trump-mappings.js`, call `deepFreeze` on the `mappings` object immediately after its definition.
        2. Store the result in a `const frozenMappings`.
    - **Done‑when:**
        1. The `mappings` object is deep-frozen at module initialization.
    - **Depends‑on:** [T003]

- [ ] **T005 · Refactor · P1**: update mapping accessors to return the frozen object
    - **Context:** PLAN.md, Phase 2: Runtime Immutability Implementation / 3. Update Return Methods
    - **Action:**
        1. Modify `getMappings()` and `getReplacementMap()` in `src/data/trump-mappings.js` to return `frozenMappings` directly.
        2. Remove the previous shallow-copy logic (spread operator).
    - **Done‑when:**
        1. Both functions return the same deep-frozen `frozenMappings` object reference.
    - **Depends‑on:** [T004]

## Core Mapping Immutability - Testing
- [ ] **T006 · Test · P1**: implement core immutability tests for the mappings object
    - **Context:** PLAN.md, Phase 3: Comprehensive Testing Implementation / 1. Core Immutability Tests
    - **Action:**
        1. Create `test/content/trump-mappings-immutability.test.ts`.
        2. Add tests to assert that attempts to add, delete, or modify properties on the object returned by `TrumpMappings.getReplacementMap()` throw a `TypeError`.
        3. Add tests to assert that `Object.isFrozen()` returns `true` for the root object and for each nested mapping object.
    - **Done‑when:**
        1. Core immutability tests are implemented and pass, demonstrating that mutations are prevented.
    - **Depends‑on:** [T005]

- [ ] **T007 · Test · P1**: implement functional verification tests for frozen mappings
    - **Context:** PLAN.md, Phase 3: Comprehensive Testing Implementation / 2. Functional Verification Tests
    - **Action:**
        1. In `test/content/trump-mappings-immutability.test.ts`, add tests to confirm that `RegExp` objects within the frozen mappings still function correctly for text matching.
        2. Add tests to verify that `nick` and other properties are still accessible and hold their correct values.
    - **Done‑when:**
        1. Functional verification tests pass, confirming no loss of functionality.
    - **Depends‑on:** [T006]

- [ ] **T008 · Test · P2**: implement backward compatibility tests for `buildTrumpMap`
    - **Context:** PLAN.md, Phase 3: Comprehensive Testing Implementation / 3. Backwards Compatibility Tests
    - **Action:**
        1. In `test/content/trump-mappings-immutability.test.ts`, add tests to verify `window.buildTrumpMap()`.
        2. Assert that the returned object is frozen and its keys match the modern `getReplacementMap()` object.
    - **Done‑when:**
        1. Backwards compatibility tests are implemented and pass.
    - **Depends‑on:** [T006]

- [ ] **T009 · Test · P2**: enhance existing tests with immutability checks
    - **Context:** PLAN.md, Phase 3: Comprehensive Testing Implementation / 4. Enhance Existing Tests
    - **Action:**
        1. In `test/content/trump-mappings.test.ts`, add an assertion that `TrumpMappings.getReplacementMap()` and `TrumpMappings.getKeys()` return frozen objects/arrays.
    - **Done‑when:**
        1. The existing test suite passes with the new `Object.isFrozen` assertions.
    - **Depends‑on:** [T005]

- [ ] **T010 · Test · P2**: implement performance benchmark for frozen objects
    - **Context:** PLAN.md, Phase 4: Integration and Validation / 2. Performance Benchmarking
    - **Action:**
        1. Add a performance test that simulates typical usage (1000 iterations of accessing and using mappings).
        2. Assert that the execution time is less than the 50ms threshold.
    - **Done‑when:**
        1. Performance benchmark test is implemented and passes within the specified threshold.
    - **Depends‑on:** [T005]

## Core Mapping Immutability - Integration & Documentation
- [ ] **T011 · Test · P1**: validate all integrations with immutable mappings
    - **Context:** PLAN.md, Phase 4: Integration and Validation / 1. Update Integration Tests
    - **Action:**
        1. Execute the full text-processor, DOM-modifier, and tooltip integration test suites.
        2. Address any failures caused by the immutability changes.
    - **Done‑when:**
        1. All existing integration tests pass with the new immutable mappings.
    - **Verification:**
        1. Run `npm test` (or equivalent) and ensure all test suites are green.
    - **Depends‑on:** [T007, T008, T009]

- [ ] **T012 · Chore · P3**: update code documentation for immutability
    - **Context:** PLAN.md, Milestone 4: Documentation
    - **Action:**
        1. Add/update JSDoc comments for the `deepFreeze` utility and all public mapping accessors to explain the immutability guarantee.
        2. Update `CLAUDE.md` if the changes introduce a new core pattern for the project.
    - **Done‑when:**
        1. Code comments and relevant project documentation are updated to reflect the immutability changes.
    - **Depends‑on:** [T011]

### Clarifications & Assumptions
- [ ] **Issue:** Confirm no existing code relies on mutating the mappings object returned by any public API.
    - **Context:** Risk Assessment & Mitigation / High Risk: Breaking Changes
    - **Blocking?:** no
- [ ] **Issue:** Is the legacy `buildTrumpMap` API planned for deprecation, or will it be maintained indefinitely for backward compatibility?
    - **Context:** Backwards Compatibility Tests / Future Considerations
    - **Blocking?:** no
- [ ] **Issue:** Is the performance overhead of a one-time `deepFreeze` on startup acceptable on all target devices/browsers?
    - **Context:** Risk Assessment & Mitigation / Medium Risk: Performance Impact
    - **Blocking?:** no