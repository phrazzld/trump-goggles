# T013 Task Details

## Task ID
T013

## Title
refactor tests to import actual modules instead of re-implementations

## Original Ticket Text
- [ ] **T013 · Test · P0: refactor tests to import actual modules instead of re-implementations**

  - **Context:** PLAN.md, CR-03, Step 1-2
  - **Action:**
    1. Update all test files to import the actual ES Modules.
    2. Remove mock/re-implemented versions of modules from within test files.
  - **Done‑when:**
    1. Tests import and test actual production code.
    2. No module re-implementations remain in test files.
  - **Depends‑on:** [T006]

## Implementation Approach Analysis Prompt

Analyze the codebase to understand:

1. **Current State of Tests**
   - How are tests currently importing/using modules?
   - What re-implementations exist in test files?
   - How are ES modules being handled (or not) in the test environment?

2. **Required Changes**
   - Which test files need to be updated?
   - What imports need to be changed from re-implementations to actual modules?
   - Are there any test configuration changes needed?

3. **Impact Assessment**  
   - Will changing imports affect test behavior?
   - Are there any dependencies between test files that need consideration?
   - How will this change affect test coverage and quality?

4. **Implementation Plan**
   - What is the systematic approach to update each test file?
   - How to ensure tests continue to pass after changes?
   - What validation steps are needed?

5. **Risk Analysis**
   - What could break when switching to actual module imports?
   - Are there any modules that shouldn't be imported directly?
   - How to handle any necessary mocking while still following philosophy?

Provide a detailed, actionable plan for safely refactoring the tests to use actual ES module imports while maintaining test quality and coverage.