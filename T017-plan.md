# T017 Implementation Plan: Fix Event Handler Removal in TooltipManager

## Problem Analysis

The current implementation in TooltipManager.ts does not properly clean up event handlers in the `dispose` method. The issue is that:

1. Some event handlers (mouse move, scroll, keyboard) are throttled/debounced using the PerformanceUtils library, creating new function wrappers.
2. When events are removed in the `dispose` method, the original unwrapped functions are used, which don't match the actual functions registered with the event listeners.
3. This causes event handlers to remain attached even after `dispose` is called, leading to potential memory leaks.

## Current State

The current implementation adds event handlers directly in the `initialize` method:

```typescript
document.addEventListener('mousemove', handleMouseMove, { passive: true });
document.addEventListener('mouseleave', handleMouseLeave, { passive: true });
document.addEventListener('focusin', handleFocus, { passive: true });
document.addEventListener('focusout', handleBlur, { passive: true });
window.addEventListener('scroll', handleScroll, { passive: true, capture: true });
document.addEventListener('keydown', handleKeydown, { passive: false });
```

And attempts to remove them in the `dispose` method:

```typescript
document.removeEventListener('mousemove', handleMouseMove);
document.removeEventListener('mouseleave', handleMouseLeave);
document.removeEventListener('focusin', handleFocus);
document.removeEventListener('focusout', handleBlur);
window.removeEventListener('scroll', handleScroll);
document.removeEventListener('keydown', handleKeydown);
```

However, the functions passed to `addEventListener` might not be the original functions but rather throttled/debounced versions created when the events are first triggered.

## Solution Approach

Implement a pattern similar to the one in tooltip-browser-adapter.ts, where:

1. Define a structure to store event handler information, including:
   - Element (document/window)
   - Event type
   - Handler function reference
   - Options object (if any)

2. When adding event listeners, store the exact function references that are passed to `addEventListener` in an array or map.

3. When disposing, iterate through the stored references and remove the exact same functions.

## Implementation Steps

1. Add a new private array to store event handler references at the module level.

2. Modify the event handling setup in `initialize` to:
   - Create and store throttled/debounced versions of handlers if needed
   - Add event listeners with these stored references
   - Track all handlers in the array with their target element, event type, and options

3. Update the `dispose` method to:
   - Iterate through the stored handler references
   - Remove each event listener using the stored information
   - Clear the array after removal

4. Add a test to verify proper cleanup of event handlers.

## Expected Outcome

1. All event handlers are properly removed when the `dispose` method is called.
2. No memory leaks occur from retained event handlers.
3. The testing verifies that cleanup is successful.

## Verification

We will add a test that:
1. Initializes the TooltipManager
2. Triggers a few events to ensure handlers are active
3. Calls `dispose`
4. Verifies that event handlers are no longer active