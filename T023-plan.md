# T023 Plan: Store cleanup function as private variable in TooltipManager

## Analysis

The task requires storing the cleanup function as a private variable in the TooltipManager module, rather than exposing it through the global window object.

Currently, the TooltipManager module has a `dispose` method that cleans up event listeners and resets the module state. The issue is that there's no reference to a cleanup function being stored in the global window object.

After reviewing the code, I've determined:

1. TooltipManager has a proper `dispose` function that is exported as part of the public API
2. The TooltipManager properly tracks all event listeners using the `activeEventHandlers` array
3. The `dispose` function properly removes event listeners and cleans up the module state
4. There's no explicit window-level cleanup function being defined in tooltip-manager.ts

Based on the TODO task description, there might have been a cleanup function exposed to the global window object in a previous version of the code, but it's no longer present in the current implementation. The task is likely referring to ensuring the cleanup functionality is properly encapsulated within the module.

## Implementation Plan

1. Add a private module variable to store the cleanup function reference
2. Make sure the `dispose` method references this private variable
3. Ensure no cleanup function is exposed to the global window object
4. Update any tests if necessary to verify the behavior

## Expected Outcome

After implementation:
- The cleanup functionality will be properly encapsulated within the TooltipManager module
- The dispose method will use the private cleanup function variable
- No cleanup function will be exposed to the global window object
- All tests will continue to pass