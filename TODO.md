# Todo: Implement Hover Tooltip Showing Original Unconverted Text

## Types and Interfaces
- [x] **T001 · Chore · P0: Define TypeScript interfaces for tooltip feature**
    - **Context:** Public Interfaces / Contracts (TS-01-plan.md)
    - **Action:**
        1. Create or update `types.d.ts` or a new `types/tooltip.ts` file
        2. Define `TextSegmentConversion`, `TextProcessor`, `DOMModifier`, `TooltipUI`, and `TooltipManager` interfaces as specified in the plan
    - **Done‑when:**
        1. All interfaces are defined accurately in TypeScript with proper JSDoc comments
        2. Types are compilable and available for import by other modules
    - **Verification:**
        1. Run TypeScript compiler (tsc) to verify type definitions
        2. Review defined types against the "Public Interfaces / Contracts" section in plan
    - **Depends‑on:** none

## TextProcessor Module
- [x] **T002 · Refactor · P1: Implement TextProcessor.identifyConversableSegments method**
    - **Context:** Detailed Build Steps #1 (TS-01-plan.md)
    - **Action:**
        1. Modify `text-processor.js` to implement `identifyConversableSegments(textNodeContent, replacementMap, mapKeys)`
        2. Ensure method returns an array of `TextSegmentConversion[]` objects (with originalText, convertedText, startIndex, endIndex)
        3. Method must NOT modify the DOM - it only identifies and returns data
    - **Done‑when:**
        1. Method correctly identifies segments requiring conversion based on TrumpMappings
        2. Method returns accurate segment data with precise indices
        3. Method adheres to the `TextProcessor` interface defined in T001
    - **Verification:**
        1. Unit tests cover no matches, single match, multiple matches, and matches at text node boundaries
    - **Depends‑on:** [T001]

## DOMModifier Module
- [x] **T003 · Feature · P1: Create DOMModifier module structure and constants**
    - **Context:** Detailed Build Steps #2 (TS-01-plan.md)
    - **Action:**
        1. Create new `dom-modifier.js` file (or refactor from `dom-processor.js` if applicable)
        2. Define the DOMModifier class/object structure according to interface
        3. Define constants: `CONVERTED_TEXT_WRAPPER_CLASS = "tg-converted-text"` and `ORIGINAL_TEXT_DATA_ATTR = "data-original-text"`
    - **Done‑when:**
        1. `dom-modifier.js` exists with proper module structure
        2. Constants are defined and accessible
        3. Module structure is ready for method implementation
    - **Depends‑on:** [T001]

- [x] **T004 · Feature · P0: Implement DOMModifier.processTextNodeAndWrapSegments method**
    - **Context:** Detailed Build Steps #2 (TS-01-plan.md)
    - **Action:**
        1. Implement `processTextNodeAndWrapSegments(textNode, segments)` method
        2. Iterate through text node content, using segments info from TextProcessor
        3. Split TextNode carefully, create span elements with required attributes:
           - `className = "tg-converted-text"`
           - `data-original-text = segment.originalText`
           - `textContent = segment.convertedText`
           - `tabindex = "0"` (for accessibility)
        4. Insert spans into DOM, preserving surrounding non-converted text
        5. Add mechanism to prevent re-processing by MutationObserverManager
        6. Wrap DOM operations in ErrorHandler.protect for graceful failure handling
        7. Add DEBUG level logging for wrapped segments
    - **Done‑when:**
        1. Method successfully processes text nodes and wraps segments in spans with all required attributes
        2. Original text structure is preserved with converted segments wrapped
        3. Method returns true if modifications were made, false otherwise
        4. Errors during DOM modification are handled gracefully with appropriate logging
    - **Verification:**
        1. Manually inspect DOM after processing a text node with conversions
        2. Unit tests verify DOM structure, span attributes, and return values
    - **Depends‑on:** [T002, T003]

## TooltipUI Module
- [x] **T005 · Feature · P1: Create TooltipUI module structure**
    - **Context:** Detailed Build Steps #3 (TS-01-plan.md)
    - **Action:**
        1. Create new `tooltip-ui.js` file
        2. Define TooltipUI class/object structure according to interface
    - **Done‑when:**
        1. `tooltip-ui.js` exists with proper module structure implementing interface
    - **Depends‑on:** [T001]

- [x] **T006 · Feature · P1: Implement TooltipUI core functionality: creation and destruction**
    - **Context:** Detailed Build Steps #3 (TS-01-plan.md)
    - **Action:**
        1. Implement `ensureCreated()` method to lazily create tooltip element with:
           - `<div id="tg-tooltip" role="tooltip" aria-hidden="true"></div>`
           - Append to document.body
        2. Implement `destroy()` method to remove tooltip element from DOM
        3. Implement `getId()` method to return tooltip element ID
    - **Done‑when:**
        1. `ensureCreated()` correctly creates (only once) and appends tooltip element with proper attributes
        2. `destroy()` removes the element completely
        3. `getId()` returns the correct tooltip ID
    - **Verification:**
        1. Inspect DOM after calling methods to verify expected changes
    - **Depends‑on:** [T005]

- [x] **T007 · Feature · P0: Implement TooltipUI text setting with XSS protection**
    - **Context:** Detailed Build Steps #3 (TS-01-plan.md); Security & Config section
    - **Action:**
        1. Implement `setText(text)` to update tooltip content
        2. **CRITICAL**: Use `tooltipElement.textContent = text` (never innerHTML) to prevent XSS
        3. Add tests to ensure XSS protection
    - **Done‑when:**
        1. Method correctly updates tooltip text
        2. Implementation exclusively uses textContent, never innerHTML
    - **Verification:**
        1. Test with text containing HTML tags to ensure they're displayed as text, not rendered
    - **Depends‑on:** [T006]

- [x] **T008 · Feature · P1: Implement TooltipUI visibility methods**
    - **Context:** Detailed Build Steps #3 (TS-01-plan.md)
    - **Action:**
        1. Implement `show()` method to:
           - Set `tooltipElement.style.visibility = "visible"`
           - Set `tooltipElement.style.opacity = "1"`
           - Set `tooltipElement.setAttribute("aria-hidden", "false")`
        2. Implement `hide()` method to:
           - Set `tooltipElement.style.opacity = "0"`
           - Set `tooltipElement.style.visibility = "hidden"`
           - Set `tooltipElement.setAttribute("aria-hidden", "true")`
    - **Done‑when:**
        1. Methods correctly toggle tooltip visibility with appropriate ARIA attributes
    - **Verification:**
        1. Visually verify tooltip appearance/disappearance
        2. Verify ARIA attribute changes
    - **Depends‑on:** [T006]

- [x] **T009 · Feature · P1: Implement TooltipUI positioning logic**
    - **Context:** Detailed Build Steps #3 (TS-01-plan.md); Error & Edge-Case Strategy: Tooltip Positioning
    - **Action:**
        1. Implement `updatePosition(targetElement)` method
        2. Calculate position based on targetElement.getBoundingClientRect()
        3. Implement viewport boundary detection
        4. Add logic to adjust position (flip top/bottom, left/right) to prevent overflow
        5. Consider scroll position in calculations
    - **Done‑when:**
        1. Tooltip is positioned correctly relative to target element
        2. Tooltip adjusts position to stay within viewport boundaries
        3. Position updates correctly when window is scrolled
    - **Verification:**
        1. Test positioning with elements at different viewport locations
        2. Test elements near viewport edges
    - **Depends‑on:** [T006]

- [x] **T010 · Feature · P1: Implement TooltipUI styling**
    - **Context:** Detailed Build Steps #3 (TS-01-plan.md)
    - **Action:**
        1. Create and inject CSS for tooltip appearance
        2. Include styles for:
           - `position: fixed`
           - Background, color, padding, border-radius, font-size
           - High z-index
           - `pointer-events: none` (tooltip shouldn't block interactions)
           - Opacity transition
           - max-width, max-height, overflow, word-wrap for long content
    - **Done‑when:**
        1. Tooltip has appropriate visual styling
        2. Transitions for showing/hiding are smooth
        3. Long text is handled appropriately
    - **Verification:**
        1. Visually verify appearance and animations
        2. Test with various content lengths
    - **Depends‑on:** [T005]

## TooltipManager Module
- [x] **T011 · Feature · P1: Create TooltipManager module structure**
    - **Context:** Detailed Build Steps #4 (TS-01-plan.md)
    - **Action:**
        1. Create new `tooltip-manager.js` file
        2. Define TooltipManager class/object structure according to interface
    - **Done‑when:**
        1. `tooltip-manager.js` exists with proper module structure implementing interface
    - **Depends‑on:** [T001]

- [x] **T012 · Feature · P1: Implement TooltipManager initialization and disposal**
    - **Context:** Detailed Build Steps #4 (TS-01-plan.md)
    - **Action:**
        1. Implement `initialize(tooltipUI)` method:
           - Store tooltipUI instance
           - Call tooltipUI.ensureCreated()
        2. Implement `dispose()` method:
           - Remove all attached event listeners
           - Call tooltipUI.destroy()
        3. Add INFO level logging for initialization and disposal
    - **Done‑when:**
        1. Manager properly initializes with TooltipUI instance
        2. Disposal cleans up all resources
    - **Verification:**
        1. Verify tooltipUI.ensureCreated() is called during initialization
        2. Verify event listeners are removed and tooltip is destroyed on disposal
    - **Depends‑on:** [T006, T011]

- [x] **T013 · Feature · P1: Implement TooltipManager mouse and focus event handling**
    - **Context:** Detailed Build Steps #4 (TS-01-plan.md)
    - **Action:**
        1. In initialize():
           - Attach delegated event listeners to document.body for mouseover, mouseout, focusin, focusout
           - Target elements with .tg-converted-text class
        2. In mouseover/focusin handler:
           - Retrieve originalText from target.dataset.originalText
           - If valid, call tooltipUI.setText(originalText)
           - Call tooltipUI.updatePosition(target)
           - Call tooltipUI.show()
           - Set aria-describedby on target element
        3. In mouseout/focusout handler:
           - Call tooltipUI.hide()
           - Remove aria-describedby from target
        4. Add optional delay before showing to prevent flickering
        5. Add appropriate logging (DEBUG for showing/hiding, WARN for missing data-original-text)
    - **Done‑when:**
        1. Hovering/focusing on converted text shows tooltip with original text
        2. Moving away/blurring hides the tooltip
        3. ARIA attributes are properly managed
    - **Verification:**
        1. Manually test hover and focus interactions
        2. Verify aria-describedby attribute changes
    - **Depends‑on:** [T007, T008, T009, T012]

- [x] **T014 · Feature · P1: Implement TooltipManager keyboard dismissal**
    - **Context:** Detailed Build Steps #4 (TS-01-plan.md)
    - **Action:**
        1. Add keydown event listener to document in initialize()
        2. Check for Escape key (event.key === 'Escape')
        3. If Escape pressed while tooltip is visible, hide tooltip
        4. Remove listener in dispose()
    - **Done‑when:**
        1. Pressing Escape key dismisses visible tooltip
    - **Verification:**
        1. Manually test keyboard dismissal
    - **Depends‑on:** [T013]

## Integration
- [x] **T015 · Feature · P1: Integrate tooltip components in content script**
    - **Context:** Detailed Build Steps #5 (TS-01-plan.md)
    - **Action:**
        1. Import TooltipUI and TooltipManager in content-consolidated.js
        2. Instantiate both components
        3. Initialize TooltipManager with TooltipUI instance
        4. Ensure DOMModifier.processTextNodeAndWrapSegments is called:
           - During initial page scan
           - By MutationObserverManager on DOM changes
        5. Add code to dispose TooltipManager when content script unloads
    - **Done‑when:**
        1. Complete tooltip feature functions in browser extension
        2. DOMModifier is properly integrated with existing text processing
        3. Hovering over converted text shows original text in tooltip
        4. Keyboard navigation and Escape dismissal work
    - **Verification:**
        1. Test the complete feature in a browser with the extension loaded
    - **Depends‑on:** [T004, T014]

## Accessibility
- [x] **T016 · A11Y · P0: Verify and enhance accessibility support**
    - **Context:** Detailed Build Steps #6 (TS-01-plan.md)
    - **Action:**
        1. Confirm tabindex="0" on wrapper spans allows keyboard focus
        2. Verify aria-describedby correctly links span to tooltip content
        3. Confirm role="tooltip" is properly set on tooltip element
        4. Test with screen readers (NVDA, VoiceOver, JAWS if possible)
        5. Ensure sufficient color contrast for tooltip text/background
    - **Done‑when:**
        1. Keyboard users can navigate to converted text
        2. Screen readers announce original text when focused
        3. Color contrast meets WCAG AA standards
    - **Verification:**
        1. Manual testing with keyboard navigation
        2. Testing with screen reader software
        3. Color contrast analysis
    - **Depends‑on:** [T015]

## Performance
- [x] **T017 · Optimization · P2: Performance testing and optimization**
    - **Context:** Detailed Build Steps #7 (TS-01-plan.md)
    - **Action:**
        1. Benchmark DOM modification on pages with many conversions
        2. Test event delegation performance
        3. Profile tooltip show/hide and positioning logic
        4. Optimize any identified bottlenecks
    - **Done‑when:**
        1. Feature performs acceptably on large pages (no noticeable slowdown)
        2. Event delegation remains responsive
    - **Verification:**
        1. Performance tests on pages with high numbers of conversions
        2. Browser performance profiling
    - **Depends‑on:** [T015]

## Testing
- [x] **T018 · Test · P1: Write unit tests for TextProcessor.identifyConversableSegments**
    - **Context:** Testing Strategy (TS-01-plan.md)
    - **Action:**
        1. Create test file for TextProcessor
        2. Write tests for various scenarios:
           - No matches in text
           - Single match in middle of text
           - Multiple matches in text
           - Matches at start/end of text
    - **Done‑when:**
        1. Tests pass with >90% coverage for the new method
    - **Depends‑on:** [T002]

- [x] **T019 · Test · P1: Write unit tests for DOMModifier**
    - **Context:** Testing Strategy (TS-01-plan.md)
    - **Action:**
        1. Create test file for DOMModifier
        2. Test with mock text nodes and segments
        3. Verify resulting DOM structure, span creation, and attributes
        4. Test edge cases: empty text nodes, segments spanning entire node, etc.
    - **Done‑when:**
        1. Tests pass with >90% coverage for the module
    - **Depends‑on:** [T004]

- [x] **T020 · Test · P1: Write unit tests for TooltipUI**
    - **Context:** Testing Strategy (TS-01-plan.md)
    - **Action:**
        1. Create test file for TooltipUI
        2. Test all methods: ensureCreated, setText, updatePosition, show, hide, destroy, getId
        3. Mock getBoundingClientRect for positioning tests
        4. Verify DOM changes, text content, and style/attribute updates
    - **Done‑when:**
        1. Tests pass with >90% coverage for the module
    - **Depends‑on:** [T007, T008, T009, T010]

- [x] **T021 · Test · P1: Write unit tests for TooltipManager**
    - **Context:** Testing Strategy (TS-01-plan.md)
    - **Action:**
        1. Create test file for TooltipManager
        2. Mock TooltipUI dependency
        3. Simulate events: mouseover, mouseout, focusin, focusout, keydown
        4. Verify calls to TooltipUI methods
        5. Verify ARIA attribute management
    - **Done‑when:**
        1. Tests pass with >90% coverage for the module
    - **Depends‑on:** [T013, T014]

- [x] **T022 · Test · P2: Write integration tests for component interaction**
    - **Context:** Testing Strategy (TS-01-plan.md)
    - **Action:**
        1. Create integration test for TextProcessor → DOMModifier flow
        2. Create integration test for DOMModifier → TooltipManager → TooltipUI flow
        3. Test with realistic text and simulated user interactions
    - **Done‑when:**
        1. Integration tests pass for key component interactions
    - **Depends‑on:** [T015]

- [x] **T023 · Test · P3: Write E2E tests for tooltip feature**
    - **Context:** Testing Strategy (TS-01-plan.md)
    - **Action:**
        1. Set up Playwright or Cypress for browser testing
        2. Test with extension loaded in real browser
        3. Automate hover and focus interactions
        4. Verify tooltip appearance, content, and keyboard accessibility
    - **Done‑when:**
        1. E2E tests verify the complete feature
    - **Depends‑on:** [T016]

## Documentation
- [x] **T024 · Docs · P2: Update documentation**
    - **Context:** Documentation section (TS-01-plan.md)
    - **Action:**
        1. Add JSDoc/TSDoc comments to all new interfaces, classes, methods
        2. Update README.md with hover tooltip feature:
           - Add to features list
           - Briefly explain how it works and benefits
           - Mention accessibility support
        3. Update docs/architecture.md:
           - Add new modules to architecture diagram
           - Document tooltip interaction flow
        4. Update docs/behavior.md:
           - Describe how users can access original text
    - **Done‑when:**
        1. Code is well-documented with comments
        2. Project documentation reflects the new feature
    - **Depends‑on:** [T015]

## Cross-Browser Compatibility
- [x] **T025 · Enhancement · P1: Implement browser adapter for tooltips**
    - **Context:** Cross-browser compatibility for tooltip feature
    - **Action:**
        1. Create a new `tooltip-browser-adapter.js` module
        2. Implement browser detection and feature detection
        3. Handle browser-specific style and event differences
        4. Update tooltip components to use the adapter
        5. Update manifest files to include the adapter
    - **Done‑when:**
        1. Tooltip functions consistently across Chrome, Firefox, and Edge
        2. Browser-specific code is isolated in the adapter
        3. Tooltips maintain proper styling and interaction patterns in all browsers
    - **Verification:**
        1. Test adapter functionality with unit tests
        2. Manual verification in different browsers
    - **Depends‑on:** [T015]

