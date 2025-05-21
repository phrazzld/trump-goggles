# T024 Implementation Plan: Remove Clinton/Hillary specific debug logs

## Background
The codebase contains several debug logs specifically targeting "Clinton" and "Hillary" text patterns. These logs were likely added during development to troubleshoot specific issues with these patterns, but are no longer needed in the production code. As part of the cleanup effort, these specific debug statements should be removed while maintaining general debugging capabilities.

## Files to Modify

1. **text-processor.js**:
   - Multiple instances of Clinton/Hillary specific debug logs:
     - Lines 246-249: `// Log for Hillary pattern` comment and related check
     - Lines 274-277: `// Log the result for Hillary pattern` comment and related check
     - Lines 368-370: Logging when "bailing out on Hillary/Clinton text"
     - Lines 386-390: Logging for matches in Hillary/Clinton text
     - Lines 724-731: Early bailout logging specifically for Clinton/Hillary texts

2. **content-consolidated.js**:
   - Lines 211-220: Debug logging for Clinton/Hillary text found during processing

3. **content-shared.js** - Not modifying:
   - No debug logs to remove, only contains the mapping definitions for Clinton/Hillary patterns

## Implementation Approach

1. **Simple removal of specific debug logs**:
   - Remove the conditional checks specifically targeting Clinton/Hillary text for debug logging
   - Keep general logging functionality intact, just remove the pattern-specific targeting
   - Leave actual mapping definitions untouched (in content-shared.js)

2. **Maintain generic logging**:
   - If useful logging exists within the Clinton/Hillary specific blocks, convert it to generic logging
   - Ensure no loss of general-purpose debugging capabilities

## Success Criteria
1. All Clinton/Hillary specific debug logging code is removed
2. Extension continues to function correctly with these patterns
3. Generic logging capabilities remain intact
4. No regressions in text replacement functionality

## Steps to Implement
1. Remove the specific if-conditions checking for Clinton/Hillary in text-processor.js
2. Remove Clinton/Hillary specific debug logging in content-consolidated.js
3. Test the extension to ensure it still properly handles Clinton/Hillary replacements
4. Verify no regressions in other functionalities