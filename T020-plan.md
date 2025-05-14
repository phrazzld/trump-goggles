# Plan for T020: Write Unit Tests for TooltipUI

## Overview
This task involves creating comprehensive unit tests for the TooltipUI module. The TooltipUI module is responsible for managing a tooltip DOM element that displays original unconverted text when users hover over converted text segments. Tests need to cover all public methods and ensure proper DOM manipulation.

## Methods to Test
1. `ensureCreated()` - Creates the tooltip element if it doesn't exist
2. `setText(text)` - Sets the tooltip content with XSS protection
3. `updatePosition(targetElement)` - Positions tooltip relative to target element
4. `show()` - Makes tooltip visible and updates ARIA attributes
5. `hide()` - Hides tooltip and updates ARIA attributes
6. `destroy()` - Removes tooltip from DOM
7. `getId()` - Returns tooltip element ID

## Test Strategy

### Setup
- Use JSDOM to create a simulated DOM environment
- Create a mock implementation of the TooltipUI module that matches the interface
- Mock any dependencies (e.g., Logger)
- Setup global document object for each test

### Test Cases

#### ensureCreated()
- Should create tooltip element when it doesn't exist
- Should set proper attributes (id, role, aria-hidden)
- Should do nothing if tooltip already exists
- Should handle errors gracefully if document is undefined
- Should call Logger.debug when created (if available)

#### setText(text)
- Should set text content correctly
- Should handle null/undefined values safely
- Should sanitize HTML content (XSS protection)
- Should call ensureCreated() first
- Should handle errors gracefully

#### updatePosition(targetElement)
- Should position tooltip above target by default
- Should handle viewport boundary cases (top, bottom, left, right)
- Should handle target elements larger than viewport
- Should handle errors gracefully
- Should call ensureCreated() first

#### show()
- Should make tooltip visible (style.visibility="visible", style.opacity="1")
- Should update ARIA attributes (aria-hidden="false")
- Should call ensureCreated() first
- Should handle errors gracefully

#### hide()
- Should hide tooltip (style.visibility="hidden", style.opacity="0")
- Should update ARIA attributes (aria-hidden="true")
- Should handle case when tooltip doesn't exist
- Should handle errors gracefully

#### destroy()
- Should remove tooltip from DOM
- Should reset module state (tooltipElement=null, isCreated=false)
- Should handle case when tooltip doesn't exist
- Should handle errors gracefully

#### getId()
- Should return the correct tooltip ID constant

### Edge Cases
- Error handling when DOM operations fail
- Browser compatibility edge cases
- Handling of unusual text content (very long, special characters, etc.)
- Positioning with unusual viewport sizes or scroll positions

## Success Criteria
- Tests pass with >90% code coverage for the TooltipUI module
- All methods are thoroughly tested
- All branches of conditional logic are tested
- Error handling is verified