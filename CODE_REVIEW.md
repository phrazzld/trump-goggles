## CRITICAL ISSUES

### [Continued Reliance on Global State and IIFE Pattern for New Modules] - BLOCKER

- **Location**: `dom-modifier.js`, `tooltip-ui.js`, `tooltip-manager.js`, `tooltip-browser-adapter.js`, `performance-utils.js` (all new modules), and `content-consolidated.js` (integration points).
- **Violation**: Mandatory Modularity, Strict Separation of Concerns, Design for Testability, Explicit is Better than Implicit. This contradicts planned architectural improvements ([FUT-03C], [ARCH-01]).
- **Impact**: New modules are tightly coupled via the global `window` object, obscuring dependencies, preventing true modularity, hindering isolated testing (without extensive `window` mocking), and blocking future migration to standard ES Modules and bundlers. Adding _new_ modules with this anti-pattern is a significant regression.
- **Fix**: Immediately refactor all newly added modules (`dom-modifier.js`, `tooltip-ui.js`, `tooltip-manager.js`, `tooltip-browser-adapter.js`, `performance-utils.js`) to use standard ES Module syntax (`import`/`export`). Pass dependencies explicitly (e.g., via constructor or initialization functions) rather than relying on global `window` properties. Update `content-consolidated.js` to import and instantiate these modules correctly.

### [Unit/Integration Tests Re-implement Modules Instead of Testing Actual Code] - BLOCKER

- **Location**:
  - `test/content/dom-modifier.test.js`
  - `test/content/identifyConversableSegments.test.js`
  - `test/content/tooltip-manager.test.js`
  - `test/content/tooltip-ui.test.js`
  - `test/integration/text-processor-dom-modifier-integration.test.js`
  - `test/integration/tooltip-components-integration.test.js`
- **Violation**: Design for Testability (Tests must verify actual code), Mock ONLY True External System Boundaries, NO Mocking Internal Collaborators.
- **Impact**: The unit and integration tests are not testing the actual production module code. They are testing mock or re-implemented versions of the modules defined _within the test files themselves_. This provides a false sense of security, does not validate the correctness of the production code, and makes tests highly brittle to any refactoring of the actual modules.
- **Fix**: Refactor all affected unit and integration tests to `import` the actual JavaScript modules from their respective files (e.g., `import DOMModifier from '../../dom-modifier.js'`) and test their exported functionalities directly. Remove the re-implementations of these modules from the test files. This change is coupled with the move to ES Modules for the main codebase.

### [New Modules Implemented in JavaScript, Not TypeScript] - BLOCKER

- **Location**: `dom-modifier.js`, `tooltip-ui.js`, `tooltip-manager.js`, `tooltip-browser-adapter.js`, `performance-utils.js`.
- **Violation**: Leverage Types Diligently ([FUT-02C] from backlog), Maximize Language Strictness.
- **Impact**: All new core feature logic is implemented in JavaScript, negating the benefits of TypeScript for these components. This bypasses compile-time type checking, increases the risk of runtime errors, and makes the `types.d.ts` definitions for these new interfaces mere documentation rather than enforceable contracts.
- **Fix**: Convert all newly added JavaScript files (`dom-modifier.js`, `tooltip-ui.js`, `tooltip-manager.js`, `tooltip-browser-adapter.js`, `performance-utils.js`) to TypeScript (`.ts`). Apply strict typing to all functions, parameters, return values, and variables within these new modules, referencing the interfaces defined in `types.d.ts`.

### [Improper `TooltipBrowserAdapter` Integration by `TooltipUI`] - BLOCKER

- **Location**: `tooltip-ui.js` (specifically `applyTooltipStyles` and `addAccessibilityStyles` functions).
- **Violation**: Modularity is Mandatory, Strict Separation of Concerns.
- **Impact**: `TooltipUI` currently reimplements or bypasses the styling logic intended to be handled by `TooltipBrowserAdapter`. For instance, `applyTooltipStyles` directly sets many CSS properties, and `addAccessibilityStyles` uses hardcoded CSS strings, rather than deferring to the adapter for browser-specific style application and CSS generation. This undermines the adapter's purpose and can lead to inconsistencies.
- **Fix**:
  1.  Modify `TooltipUI.applyTooltipStyles` to call `window.TooltipBrowserAdapter.applyBrowserSpecificStyles(element)` if the adapter is available, allowing the adapter to manage the actual style application. `TooltipUI` should only define minimal, browser-agnostic base styles if any.
  2.  Modify `TooltipUI.addAccessibilityStyles` to fetch the CSS string from `window.TooltipBrowserAdapter.getDefaultTooltipStyles()` and, if necessary, process it via `window.TooltipBrowserAdapter.convertCssForBrowser(css)` before injecting the style tag.

### [Unstructured `console.*` Logging in New Modules] - BLOCKER

- **Location**: `dom-modifier.js` (e.g., L107, L117), `tooltip-ui.js` (e.g., L152, L159), `tooltip-manager.js` (e.g., L100-L102), `tooltip-browser-adapter.js`, `performance-utils.js`.
- **Violation**: Structured Logging is Mandatory, No `console.log` for operational logging.
- **Impact**: New modules frequently use `console.log`, `console.warn`, and `console.error`, often as fallbacks if `window.Logger` is unavailable. This bypasses the structured logging system, leading to unfilterable and inconsistent logs, especially if the main Logger fails.
- **Fix**: Replace all `console.*` calls intended for operational/error logging in the new modules with `window.Logger` calls at the appropriate severity levels (DEBUG, INFO, WARN, ERROR). The availability of `window.Logger` should be checked once at the main extension initialization; individual modules should not implement their own fallbacks to `console`.

## SIGNIFICANT CONCERNS

### [Brittle Event Handler Removal in `TooltipManager`] - HIGH

- **Location**: `tooltip-manager.js` (in the `dispose` function and `initialize` for `mouseOverHandler`, `mouseOutHandler`, `focusin`, `focusout`, `keydown` listeners).
- **Violation**: Explicit is Better than Implicit, Reliable resource cleanup.
- **Impact**: The `dispose` method attempts to remove event listeners. If `performanceUtils.throttle` is used, or due to `bind(this)`, the function references passed to `removeEventListener` might not be the same as those passed to `addEventListener`. This will lead to event listeners not being cleaned up, causing memory leaks and potential unintended behavior.
- **Fix**: In `TooltipManager.initialize`, store the exact function references (including those returned by `throttle` or created by `bind`) that are passed to `addEventListener`. Use these stored references in `dispose` when calling `removeEventListener`. The `this.eventHandlers` object pattern shown in the test mock for `TooltipManager` is a good approach to adopt.

### [Ineffective Element Caching in `TooltipManager`] - HIGH

- **Location**: `tooltip-manager.js` (L58 `elementCache` declaration, L213-L243 `findConvertedTextElement` logic).
- **Violation**: Simplicity First (if optimization is ineffective), Performance (intended optimization not working).
- **Impact**: `TooltipManager.elementCache` attempts to use `target.getAttribute('data-tg-cache-id')` for caching. However, `DOMModifier` (L163) sets `_trumpGogglesProcessed = true;` and does _not_ set `data-tg-cache-id`. This means the primary cache lookup mechanism will always miss. Caching via `target.id` is also unreliable.
- **Fix**:
  1.  Ensure `DOMModifier` sets a consistent, cacheable attribute (e.g., `data-tg-cache-id` with a unique ID if this strategy is chosen).
  2.  Alternatively, if this local cache is redundant or offers minimal benefit (especially if `PerformanceUtils.ElementCache` becomes actively used), remove `TooltipManager.elementCache` to simplify the code. The caching strategy must be effective and testable.

### [Inconsistent Logging Level for Production in `content-consolidated.js`] - HIGH

- **Location**: `content-consolidated.js`:L54
- **Violation**: Logging Strategy (Standard Log Levels).
- **Impact**: Setting `minLevel` to `WARN` for non-debug (production) mode suppresses `INFO` level logs. `INFO` logs are intended for routine operational events (e.g., initialization success, number of items processed). Suppressing them hides valuable operational context that could aid in diagnosing user-reported issues without requiring full debug mode.
- **Fix**: Change the non-debug `minLevel` to `window.Logger.LEVELS.INFO` in `content-consolidated.js`.

### [Potential XSS via Original Text in Logs/Display (Minor)] - MEDIUM

- **Location**: `tooltip-ui.js`:L209 (setText), `tooltip-manager.js`:L311 (logging originalTextSnippet).
- **Violation**: Security Considerations (Input Validation, Least Privilege for logged data).
- **Impact**: While `tooltipUI.setText` correctly uses `textContent` preventing direct XSS in the tooltip display, `originalText` is sourced from a DOM attribute (`data-original-text`). If a malicious site could inject executable content into this attribute value, logging this raw value (even a snippet) could pose a minor information disclosure risk or cause issues if logs are consumed by other systems expecting sanitized text.
- **Fix**: When logging `originalText` snippets, ensure it is treated purely as text and consider further sanitization or more aggressive truncation if there's any concern about the content of these attributes on arbitrary web pages. Confirm that `DOMModifier` correctly sets `data-original-text` only with plain text derived from text nodes.

### [Unused `ElementCache` and `DOMBatch` in `performance-utils.js`] - MEDIUM

- **Location**: `performance-utils.js`:L213-L388, `performance-utils.d.ts`.
- **Violation**: Simplicity First, No Dead Code.
- **Impact**: These utilities are defined and typed but are not currently used by the new tooltip modules or elsewhere in the diff. This adds dead code and complexity.
- **Fix**: Remove `ElementCache` and `DOMBatch` from `performance-utils.js` and `performance-utils.d.ts`. Re-introduce them only when they are actively integrated and provide a clear, tested benefit.

### [Inconsistent Property for Marking Processed Spans] - MEDIUM

- **Location**: `dom-modifier.js`:L163 (`_trumpGogglesProcessed = true;`), `content-consolidated.js`:L290 (existing logic using `window.DOMProcessor.markProcessed(node)`).
- **Violation**: Coding Standards (Consistency).
- **Impact**: Two different mechanisms (`_trumpGogglesProcessed` and `DOMProcessor.markProcessed`) for marking elements to prevent re-processing can lead to confusion, maintenance overhead, and potential bugs if one system doesn't respect the other's markers.
- **Fix**: Standardize on a single, explicit method for marking processed elements. A `data-tg-processed="true"` attribute on the outermost wrapper span (`tg-converted-text`) would be more robust, inspectable, and less prone to conflicts than an internal underscore property. Update both `DOMModifier` and the mutation observer logic in `content-consolidated.js` to use this consistent marker.

### [Missing Cleanup of Global `tooltipManagerBrowserEventsCleanup`] - MEDIUM

- **Location**: `tooltip-manager.js`:L150 (assignment to `window.tooltipManagerBrowserEventsCleanup`), L216 (usage in `dispose`).
- **Violation**: Explicit is Better than Implicit, Avoid Global Pollution.
- **Impact**: The cleanup function returned by `TooltipBrowserAdapter.registerBrowserEvents` is stored on the global `window` object. This pollutes the global scope, is not explicitly typed in `types.d.ts` for `window`, and is a less clean way to manage module-specific resources.
- **Fix**: Store the `cleanupBrowserEvents` function as a private variable within the `TooltipManager` module's closure (similar to how `tooltipUI` or `isInitialized` are handled). The `dispose` method should then call this private variable.

## MINOR IMPROVEMENTS

### [Overly Specific Debug Logging for "Clinton/Hillary"] - LOW

- **Location**: `content-consolidated.js`:L196-L204, `text-processor.js`:L260-L263, L370-L373, L403-L406.
- **Violation**: Maintainability (Temporary debug code should be removed or generalized).
- **Impact**: Debug logs highly specific to "Clinton/Hillary" terms add noise to the codebase and logs. These appear to be temporary development aids.
- **Fix**: Remove these specific debugging logs. If detailed tracing for specific terms or patterns is generally useful, implement it behind a more generic, configurable debug flag or logging mechanism.

### [JSDoc Type Casting with `@ts-ignore` in JavaScript Files] - LOW

- **Location**: `dom-modifier.js`:L66, `tooltip-browser-adapter.js` (multiple instances e.g., L158, L196), `tooltip-ui.js` (multiple instances e.g., L176, L238).
- **Violation**: Leverage Types Diligently (Address Violations, Don't Suppress).
- **Impact**: Using `@ts-ignore` with JSDoc type casts in JavaScript files indicates potential mismatches or areas where TypeScript (if it were analyzing these JS files with full strictness) would complain. While these are JS files for now, this pattern can hide actual type issues that will surface during TS conversion.
- **Fix**: Once these files are converted to TypeScript (see BLOCKER issue), these `@ts-ignore` comments should be addressed by ensuring correct TypeScript types are used, eliminating the need for suppression. For JSDoc in JS, ensure the JSDoc accurately reflects the intended types to minimize future TS conversion friction.

### [Deleted `AUTHORS.md` File] - LOW

- **Location**: `AUTHORS.md` (deleted file).
- **Violation**: Project Documentation/Policy.
- **Impact**: Removal of the dedicated file for author and contributor acknowledgment.
- **Fix**: Restore `AUTHORS.md` or, if project policy has changed, ensure this information is appropriately integrated into another file like `README.md` or `CONTRIBUTING.md` as per the new [DEV-06C] task in `BACKLOG.md`.

### [Deleted `cross-browser-compatibility-report.md`] - LOW

- **Location**: `cross-browser-compatibility-report.md` (deleted file).
- **Violation**: Documentation Approach (Document Decisions, Not Mechanics).
- **Impact**: Removal of a potentially useful document that analyzed cross-browser compatibility. This context could be valuable, especially with the introduction of `TooltipBrowserAdapter`.
- **Fix**: Consider restoring and updating this report if it contains valuable, non-obvious decisions or findings relevant to the new adapter. Alternatively, ensure key cross-browser considerations and the adapter's role are documented in `docs/architecture.md` or a similar location.

### [No Newline at End of `PLAN.md`] - LOW

- **Location**: `PLAN.md`.
- **Violation**: Coding Standards (Consistent Formatting - related to [DEV-05C] from backlog).
- **Impact**: Minor; can cause trivial diffs or issues with some POSIX-based tools.
- **Fix**: Add a newline character to the end of `PLAN.md`.
