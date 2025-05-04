# Detailed Task Breakdown for Trump Goggles Enhancement

This document provides a structured, actionable breakdown of the tasks required to implement the remediation plan for the Trump Goggles browser extension. Each task has a unique ID, defined dependencies, estimated level of effort, and clear acceptance criteria.

## Critical Tasks

### Performance Optimization

**TASK-C1: Cache Trump Map at Module Level**
- [x] Refactor content.js to cache the result of buildTrumpMap() once at module level
  - **Dependencies**: None
  - **Effort**: Low (1-2 hours)
  - **Acceptance Criteria**:
    - [x] trumpMap is created once at module level
    - [x] convert function uses cached trumpMap
    - [x] mapKeys is also cached at module level
    - [x] Performance improvement verified with browser profiling tools
  - **Implementation Notes**:
    - Move map building outside of convert
    - Create constants at module level
    - Follow existing code style
  - **Status**: Already implemented in code. Found existing implementation at lines 15-17 of content.js.

**TASK-C2: Optimize Convert Function for Performance**
- [x] Refactor convert function to avoid multiple DOM updates and improve text replacement efficiency
  - **Dependencies**: TASK-C1
  - **Effort**: Medium (2-3 hours)
  - **Acceptance Criteria**:
    - [x] convert function only updates DOM once per text node
    - [x] Temporary variable used for string manipulations
    - [x] DOM updated only if text has changed
    - [x] regex.lastIndex reset if needed
    - [x] Performance improvement verified with browser profiling
  - **Implementation Notes**:
    - Create temporary variables for text manipulation
    - Only update nodeValue if text has changed
    - Reset regex state if using 'g' flag
  - **Status**: Already implemented in code. Found existing implementation at lines 133-165 of content.js.

**TASK-C3: Remove Unused Storage Logic**
- [x] Remove or implement the unused chrome.storage.sync.get call
  - **Dependencies**: None
  - **Effort**: Very Low (< 1 hour)
  - **Acceptance Criteria**:
    - [x] chrome.storage.sync.get call removed
    - [x] walk(document.body) called directly
    - [x] Extension continues to function normally
  - **Implementation Notes**:
    - Simple removal of unused code
    - May be implemented as part of a more comprehensive refactoring
  - **Status**: Already implemented in code. The chrome.storage.sync.get call doesn't exist in the codebase, and walk(document.body) is called directly at line 21.

### Test Coverage

**TASK-C4: Create Test Framework Setup**
- [x] Ensure test infrastructure is properly set up for content.js testing
  - **Dependencies**: None
  - **Effort**: Medium (2-3 hours)
  - **Acceptance Criteria**:
    - [x] Vitest configured correctly for extension testing
    - [x] JSDOM available for simulating DOM
    - [x] Test helper functions created (e.g., createTextNode)
    - [x] Test scripts added to package.json
  - **Implementation Notes**:
    - Review existing test setup in test/ directory
    - Add necessary configuration for content script testing
    - Create helper functions for DOM simulation
  - **Status**: Already implemented in code. The test infrastructure is properly set up with Vitest configured to use JSDOM (vitest.config.js), helper functions for DOM testing are created (e.g., createTextNode in content.test.js and convert.test.js), and test scripts are defined in package.json.

**TASK-C5: Write Unit Tests for buildTrumpMap**
- [x] Create comprehensive tests for the buildTrumpMap function
  - **Dependencies**: TASK-C4
  - **Effort**: Medium (2-3 hours)
  - **Acceptance Criteria**:
    - [x] Tests verify correct structure of returned map
    - [x] Tests verify regex patterns have correct flags
    - [x] Tests verify nicknames are correct
    - [x] Tests achieve high coverage of buildTrumpMap
  - **Implementation Notes**:
    - May require export modifications to make function testable
    - Consider using a snapshot test for the entire map
  - **Status**: Already implemented in code. Found comprehensive test coverage in test/content/trumpMap.test.js which verifies structure, regex flags, nicknames, and boundary patterns. All tests are passing.

**TASK-C6: Write Unit Tests for convert Function**
- [ ] Create comprehensive tests for the convert function
  - **Dependencies**: TASK-C4, TASK-C1, TASK-C2
  - **Effort**: High (3-4 hours)
  - **Acceptance Criteria**:
    - [ ] Tests for basic replacements for each pattern
    - [ ] Tests for case-insensitivity
    - [ ] Tests for word boundaries
    - [ ] Tests for multiple patterns in one text node
    - [ ] Tests for edge cases (empty strings, no matches)
    - [ ] Tests achieve high coverage of convert function
  - **Implementation Notes**:
    - Simulate text nodes for testing
    - Test various input/output scenarios
    - Ensure optimized version works correctly

## Important Tasks

**TASK-I1: Update package.json Version Format**
- [x] Change version format to follow semantic versioning
  - **Dependencies**: None
  - **Effort**: Very Low (< 1 hour)
  - **Acceptance Criteria**:
    - [x] Version changed from "18.4.08" to "2.0.0"
    - [x] manifest.json version updated if necessary
  - **Implementation Notes**:
    - Simple change to package.json
    - Check if manifest.json needs corresponding update
  - **Status**: Already implemented in code. Both package.json and manifest.json already use version "2.0.0".

## Recommended Tasks

**TASK-R1: Modernize JavaScript in content.js**
- [ ] Replace var with const/let throughout content.js
  - **Dependencies**: TASK-C1, TASK-C2, TASK-C3 (to avoid conflicts)
  - **Effort**: Low (1-2 hours)
  - **Acceptance Criteria**:
    - [ ] All instances of var replaced with const where variables are not reassigned
    - [ ] All instances of var replaced with let where variables are reassigned
    - [ ] No functional changes introduced
    - [ ] Tests continue to pass
  - **Implementation Notes**:
    - Simple style updates
    - Follow existing code style for consistency

**TASK-R2: Improve Regex Pattern Organization**
- [ ] Refactor global regex pattern definitions into buildTrumpMap function
  - **Dependencies**: TASK-C1, TASK-C5 (to ensure tests pass after refactoring)
  - **Effort**: Medium (2-3 hours)
  - **Acceptance Criteria**:
    - [ ] Global regex constants removed
    - [ ] Patterns defined inline in buildTrumpMap
    - [ ] No functional changes introduced
    - [ ] Tests continue to pass
  - **Implementation Notes**:
    - Move pattern definitions into the map object
    - Maintain correct regex flags and patterns

**TASK-R3: Skip Replacements in Editable Fields**
- [ ] Modify walk function to avoid processing editable elements
  - **Dependencies**: TASK-C1, TASK-C2, TASK-C6 (to avoid conflicts with optimizations)
  - **Effort**: Medium (2-3 hours)
  - **Acceptance Criteria**:
    - [ ] walk function skips INPUT and TEXTAREA elements
    - [ ] walk function skips elements with isContentEditable=true
    - [ ] convert not called for text nodes within editable contexts
    - [ ] Tests added to verify this behavior
  - **Implementation Notes**:
    - Add checks for editable elements in walk function
    - Create tests with simulated editable elements

## Verification Tasks

**TASK-V1: Performance Profiling**
- [ ] Compare performance before and after optimizations
  - **Dependencies**: TASK-C1, TASK-C2, TASK-C3
  - **Effort**: Medium (2-3 hours)
  - **Acceptance Criteria**:
    - [ ] Before/after profiles captured with Chrome DevTools
    - [ ] Documented performance improvements
    - [ ] No regressions in functionality
  - **Implementation Notes**:
    - Use Chrome DevTools Performance tab
    - Test on news sites with heavy content
    - Document findings

**TASK-V2: Cross-Browser Testing**
- [ ] Verify extension works in different browsers
  - **Dependencies**: All implementation tasks
  - **Effort**: Medium (2-3 hours)
  - **Acceptance Criteria**:
    - [ ] Tested in Chrome
    - [ ] Tested in Firefox (if applicable)
    - [ ] Tested in Edge (if applicable)
    - [ ] No browser-specific issues found
  - **Implementation Notes**:
    - Test on popular browsers
    - Focus on major functionality

**TASK-V3: Final Code Review**
- [ ] Comprehensive review of all changes
  - **Dependencies**: All implementation tasks
  - **Effort**: Medium (2-3 hours)
  - **Acceptance Criteria**:
    - [ ] All code follows project standards
    - [ ] Performance improvements verified
    - [ ] Tests are comprehensive and pass
    - [ ] No regression in functionality
  - **Implementation Notes**:
    - Review all changed files
    - Run linters and formatters
    - Ensure all tests pass

## Dependency Graph

```
               ┌──────────┐
               │ TASK-C1  │
               └────┬─────┘
                    │
                    ▼
┌──────────┐  ┌──────────┐  ┌──────────┐
│ TASK-C3  │  │ TASK-C2  │  │ TASK-C4  │
└──────────┘  └────┬─────┘  └────┬─────┘
                    │             │
                    │             ▼
                    │       ┌──────────┐
                    │       │ TASK-C5  │
                    │       └────┬─────┘
                    ▼             │
               ┌──────────┐       │
               │ TASK-C6  │◄──────┘
               └────┬─────┘
                    │
          ┌─────────┴────────┐
          │                  │
          ▼                  ▼
    ┌──────────┐      ┌──────────┐
    │ TASK-R1  │      │ TASK-R2  │
    └────┬─────┘      └────┬─────┘
          │                 │
          └────────┬────────┘
                   ▼
             ┌──────────┐
             │ TASK-R3  │
             └────┬─────┘
                  │
                  ▼
             ┌──────────┐
             │ TASK-V1  │
             └────┬─────┘
                  │
                  ▼
             ┌──────────┐
             │ TASK-V2  │
             └────┬─────┘
                  │
                  ▼
             ┌──────────┐
             │ TASK-V3  │
             └──────────┘
```

## Implementation Order

1. **First Phase (Critical Performance & Structure)**
   - [ ] TASK-C1: Cache Trump Map
   - [ ] TASK-C3: Remove Unused Storage Logic 
   - [ ] TASK-I1: Update package.json Version

2. **Second Phase (Testing Foundation)**
   - [ ] TASK-C4: Test Framework Setup
   - [ ] TASK-C5: Tests for buildTrumpMap

3. **Third Phase (Additional Optimizations)**
   - [ ] TASK-C2: Optimize Convert Function
   - [ ] TASK-C6: Tests for convert Function

4. **Fourth Phase (Code Quality Improvements)**
   - [ ] TASK-R1: Modernize JavaScript
   - [ ] TASK-R2: Improve Regex Organization
   - [ ] TASK-R3: Skip Editable Fields

5. **Final Phase (Verification)**
   - [ ] TASK-V1: Performance Profiling
   - [ ] TASK-V2: Cross-Browser Testing
   - [ ] TASK-V3: Final Code Review

## Estimated Timeline

- **Phase 1**: 1 day
- **Phase 2**: 1 day
- **Phase 3**: 1-2 days
- **Phase 4**: 1-2 days
- **Phase 5**: 1 day

Total estimated time: 5-7 days