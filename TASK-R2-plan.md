# TASK-R2: Improve Regex Pattern Organization

## Task Description
Refactor global regex pattern definitions into buildTrumpMap function.

## Current Implementation
Currently, all regex patterns are already defined within the buildTrumpMap function in content.js. There are no global regex constants to be removed. The function returns an object where each entry has a regex property (containing a RegExp object) and a nick property.

## Approach
Since the regex patterns are already inside buildTrumpMap function, I'll verify that there are no global regex patterns elsewhere in the codebase that should be incorporated into buildTrumpMap. If none are found, this task may already be implemented.

## Implementation Plan
1. Search for any regex patterns defined outside of buildTrumpMap in content.js
2. Search for regex patterns in other JavaScript files that might need to be moved
3. If no external patterns are found, verify that the current buildTrumpMap implementation meets all the acceptance criteria
4. Run tests to confirm everything still works
5. Update TODO.md to reflect the implementation status

## Acceptance Criteria Check
- [ ] Global regex constants removed 
- [ ] Patterns defined inline in buildTrumpMap
- [ ] No functional changes introduced
- [ ] Tests continue to pass