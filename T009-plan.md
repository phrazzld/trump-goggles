# T009: Implement TooltipUI positioning logic

## Overview
This task involves implementing the `updatePosition(targetElement)` method in the TooltipUI module. This method is responsible for calculating and applying the tooltip's position relative to the target element (converted text span), ensuring it stays within viewport boundaries.

## Requirements
1. Calculate position based on targetElement.getBoundingClientRect()
2. Implement viewport boundary detection
3. Add logic to adjust position (flip top/bottom, left/right) to prevent overflow
4. Consider scroll position in calculations

## Implementation Details

### Position Calculation
1. Get target element's position and dimensions using getBoundingClientRect()
2. Get tooltip element's dimensions
3. Calculate initial position (centered above the target element by default)
4. Check if tooltip would overflow viewport boundaries
5. Adjust position if needed (flip top/bottom, left/right)
6. Apply final position via style properties

### Default Positioning
- Default position: Centered above the target element with a small offset (8-10px)
- Fallback positions (in order of preference):
  1. Below the target element
  2. To the right of the target element
  3. To the left of the target element
  4. Inside viewport at closest valid position

### Edge Case Handling
- If tooltip is wider than viewport, center it horizontally in the viewport
- If tooltip is taller than viewport, position it at the top of the viewport with overflow
- Handle situations where the target element is partially off-screen

### Scroll Handling
- Use absolute coordinates that account for scroll position
- Position: fixed ensures the tooltip stays correctly positioned even during scrolling

## Error Handling
- Add try/catch block to handle any potential errors during calculations
- Provide reasonable fallback positions if calculations fail
- Log errors with detailed information for debugging

## Accessibility
- Consider ARIA best practices for positioned tooltips
- Ensure the tooltip remains associated with its target element visually

## Performance Considerations
- Minimize reflows by batching DOM operations
- Cache dimensions where possible when calculating multiple positions