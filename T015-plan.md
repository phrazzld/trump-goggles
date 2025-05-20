# T015 Plan: Modify TooltipUI to use TooltipBrowserAdapter for styling

## Task Definition
- **Task ID:** T015
- **Title:** Modify TooltipUI to use TooltipBrowserAdapter for styling
- **Context:** CODE_REVIEW.md, CR-04, Step 1-3

## Implementation Approach

The task requires updating the TooltipUI module to properly delegate styling responsibilities to the TooltipBrowserAdapter. This will improve separation of concerns, making the codebase more maintainable and resilient to browser-specific issues.

### 1. Update `applyTooltipStyles` to delegate to browser adapter

Currently, the `applyTooltipStyles` function in TooltipUI.ts has the following issues:
- It attempts to use the browser adapter but still applies many hardcoded styles directly
- This leads to a mix of responsibility where both TooltipUI and TooltipBrowserAdapter are handling styling
- There are many `@ts-ignore` comments that indicate TypeScript issues that need addressing

The fix will:
1. Remove most of the direct style assignments from the TooltipUI.applyTooltipStyles function
2. Move the base styling responsibilities to TooltipBrowserAdapter
3. Make TooltipUI's applyTooltipStyles primarily delegate to TooltipBrowserAdapter.applyBrowserSpecificStyles
4. Ensure only essential, non-browser-specific base styles remain in TooltipUI, if any
5. Clean up the remaining TypeScript errors properly instead of using @ts-ignore

### 2. Update `addAccessibilityStyles` to use adapter methods

Currently, the `addAccessibilityStyles` function in TooltipUI.ts:
- Checks for the browser adapter but has a large inline CSS fallback
- Does not use the full capabilities of the browser adapter
- Could use browser adapter for style transformations and optimizations

The fix will:
1. Fully rely on TooltipBrowserAdapter.getDefaultTooltipStyles() for the CSS content
2. Use TooltipBrowserAdapter.convertCssForBrowser() for any browser-specific CSS adaptations
3. Remove the hardcoded CSS from TooltipUI entirely
4. Handle edge cases and error conditions appropriately

### 3. Clean up hardcoded styles from TooltipUI

After the above changes, we need to:
1. Ensure consistent usage of browser adapter throughout the file
2. Fix the constant TOOLTIP_Z_INDEX to only use the browser adapter's getSafeZIndex()
3. Remove any remaining hardcoded styles that should be managed by the adapter
4. Fix TypeScript errors properly without @ts-ignore directives

## Testing Strategy

1. Verify the tooltip still functions correctly after changes:
   - Styles are applied correctly
   - Tooltip appears in the right position with correct styling
   - Accessibility features still work properly

2. Ensure proper browser compatibility across different browsers:
   - Make sure delegating to TooltipBrowserAdapter doesn't break functionality
   - Verify that the separation of concerns is maintained

## Acceptance Criteria

1. TooltipUI properly delegates styling responsibilities to TooltipBrowserAdapter
2. No hardcoded styles remain in TooltipUI that should be in the adapter
3. No @ts-ignore comments in the code
4. The tooltips function correctly with proper styling in all supported browsers
5. Clean separation of concerns between the tooltip UI and browser-specific adaptations