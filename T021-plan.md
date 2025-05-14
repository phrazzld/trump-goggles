# Plan for T021: Write Unit Tests for TooltipManager

## Overview
This task involves creating comprehensive unit tests for the TooltipManager module. The TooltipManager is responsible for coordinating interactions between DOM events (mouse, keyboard, focus) and the TooltipUI module, showing and hiding tooltips when users hover over or focus on converted text elements.

## Module Functionality to Test
1. **Initialization & Disposal**
   - `initialize(tooltipUIInstance)` - Sets up event listeners and stores the TooltipUI instance
   - `dispose()` - Cleans up event listeners and resources

2. **Event Handling** (private functions but testable via events)
   - `handleShowTooltip(event)` - Shows tooltip when hovering/focusing on converted text
   - `handleHideTooltip(event)` - Hides tooltip when moving away/blurring
   - `handleKeyDown(event)` - Dismisses tooltip when Escape key is pressed
   - `findConvertedTextElement(target)` - Utility to find converted text elements

## Test Strategy

### Setup
- Use JSDOM to create a simulated DOM environment
- Create a mock TooltipUI that implements the TooltipUIInterface
- Mock the Logger
- Create helper functions to simulate various events (mouse, keyboard, focus)
- Set up DOM elements with the necessary attributes for testing

### Test Cases

#### 1. Initialization
- Should store TooltipUI instance and mark as initialized
- Should call tooltipUI.ensureCreated()
- Should attach event listeners to document.body
- Should log initialization message
- Should handle errors gracefully during initialization
- Should dispose existing instance when initializing again

#### 2. Disposal
- Should remove event listeners
- Should clear any pending timeout
- Should call tooltipUI.destroy()
- Should reset state (tooltipUI = null, isInitialized = false)
- Should log disposal message
- Should handle errors gracefully during disposal
- Should do nothing if not initialized

#### 3. Mouse Event Handling
- Should show tooltip when hovering over a converted text element
- Should set tooltip text from data-original-text attribute
- Should position tooltip relative to target element
- Should set aria-describedby attribute for accessibility
- Should apply show delay to prevent flickering
- Should hide tooltip when mouse leaves converted text element
- Should not hide tooltip when moving between child elements of converted text
- Should remove aria-describedby attribute when hiding
- Should handle missing data-original-text attribute gracefully
- Should log appropriate debug/error messages

#### 4. Focus Event Handling
- Should show tooltip when focusing on a converted text element
- Should hide tooltip when blurring a converted text element
- Should not trigger for unrelated elements

#### 5. Keyboard Dismissal
- Should hide tooltip when Escape key is pressed
- Should remove aria-describedby attributes when dismissed with Escape
- Should log escape key dismissal message

#### 6. Edge Cases & Error Handling
- Should handle invalid or null tooltipUI gracefully
- Should handle various event target types correctly
- Should handle DOM exceptions gracefully
- Should work with or without performance utilities

### Mocking Strategy
- Mock TooltipUI methods (ensureCreated, setText, updatePosition, show, hide, destroy, getId)
- Mock Logger methods (debug, info, warn, error)
- Mock performance utilities (throttle, DOMBatch)
- Use spies to verify method calls with correct arguments

## Success Criteria
- Tests pass with >90% code coverage for the module
- All public methods are thoroughly tested
- Event handling functionality is verified
- Error handling is properly tested

## Implementation Approach
1. Create test file structure with necessary imports and mocks
2. Implement test setup and teardown logic
3. Create helper functions for event simulation
4. Implement test cases in logical groups
5. Verify all code paths are covered
6. Run tests and fix any issues
7. Optimize tests for performance and readability