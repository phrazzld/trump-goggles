# T006 Plan: Implement TooltipUI core functionality: creation and destruction

## Approach
I'll implement the `ensureCreated()`, `destroy()`, and `getId()` methods in the TooltipUI module to handle the creation and cleanup of the tooltip DOM element. These methods will form the foundation for the tooltip functionality.

## Implementation Details

### ensureCreated()
1. Check if the tooltip is already created using the `isCreated` flag and `tooltipElement` reference
2. If already created, do nothing and return early
3. Create a new div element with document.createElement('div')
4. Set the appropriate attributes:
   - id = TOOLTIP_ID
   - role = "tooltip"
   - aria-hidden = "true"
5. Add initial styling for the tooltip element:
   - visibility = "hidden"
   - opacity = "0"
6. Append the element to document.body
7. Set the module-level variables:
   - tooltipElement = reference to the new element
   - isCreated = true

### destroy()
1. Check if the tooltip exists (tooltipElement is not null)
2. If it exists, remove it from its parent (document.body) using parentNode.removeChild()
3. Reset the module-level variables:
   - tooltipElement = null
   - isCreated = false

### getId()
1. Simply return the TOOLTIP_ID constant
2. This will be used for ARIA linking (aria-describedby attribute)

## Error Handling
- Add checks to ensure the DOM is available before attempting to create or destroy elements
- Add checks for element existence when performing operations
- Use try/catch blocks to handle unexpected DOM errors

## Testing Strategy
The implementation will be manually verified by:
1. Calling ensureCreated() and checking that the tooltip element is created in the DOM with correct attributes
2. Calling destroy() and confirming the element is removed
3. Calling getId() and verifying it returns the correct tooltip ID