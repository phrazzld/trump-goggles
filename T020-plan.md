# T020 Plan: Review and Secure originalText Handling for XSS

## Problem Analysis

After a thorough review of the codebase, I've identified that `originalText` is used in several locations throughout the extension and requires security analysis for potential XSS vulnerabilities. Specifically:

1. **Source of originalText**: Text is sourced from DOM text nodes via `textNode.nodeValue` in `dom-modifier.ts`.
2. **Storage**: The text is stored as-is in the `data-original-text` attribute of wrapper spans.
3. **Display**: The text is displayed in tooltips via `tooltipUI.setText()` in `tooltip-ui.ts`.
4. **Logging**: Snippets of the text are logged for debugging in various places, including `tooltip-manager.ts`.

The primary security concern is ensuring that potentially malicious content in `originalText` cannot be executed when displayed in tooltips or included in logs that might be viewed in contexts where HTML is interpreted.

## Current State

- In `dom-modifier.ts`, `originalText` is sourced directly from text nodes using `textNode.nodeValue` and then stored in an HTML attribute via `wrapper.setAttribute(ORIGINAL_TEXT_DATA_ATTR, segment.originalText)`.
  
- In `tooltip-ui.ts`, the `setText` method properly uses `textContent` which is the correct safe approach for displaying potentially untrusted content.

- In `tooltip-manager.ts` and other files, snippets of `originalText` are logged without HTML-escaping, potentially allowing malicious content to be executed if these logs are viewed in contexts that interpret HTML.

## Solution Approach

The solution will involve:

1. Confirming and documenting that `textContent` is used exclusively for displaying `originalText`.
2. Implementing HTML-escaping for log output to prevent potential XSS in log viewers.
3. Documenting security considerations for handling `originalText`.

## Implementation Steps

1. **Audit originalText Sourcing and Storage**
   - Confirm that `originalText` is sourced exclusively from the `nodeValue` of DOM `Text` nodes in `dom-modifier.ts`
   - Verify that it's stored securely in the `data-original-text` attribute

2. **Verify Secure Display Mechanism**
   - Confirm that `setText` in `tooltip-ui.ts` exclusively uses `textContent` for rendering
   - Verify no usage of `innerHTML`, `outerHTML`, or other unsafe methods for display

3. **Implement Log Sanitization**
   - Create a utility function to escape HTML special characters
   - Apply this function to all logging calls that include `originalText` snippets 
   - Update the following logging calls in tooltip-manager.ts:
     - Line 123-124 (originalText in mousemove handler)
     - Line 256-257 (originalText in focus handler)

4. **Create Security Documentation**
   - Document the lifecycle of `originalText` from source to display
   - Outline the security measures implemented to prevent XSS
   - Include guidelines for safe handling of `originalText`

5. **Testing and Verification**
   - Manually test with text containing HTML markup to ensure proper display
   - Verify logs show properly escaped HTML content
   - Run existing tests to ensure no regressions

## Security Utility Implementation

I'll create a simple HTML-escaping utility function to use with logs:

```typescript
/**
 * Escapes HTML special characters in a string to prevent XSS in contexts
 * where the string might be interpreted as HTML (e.g., some log viewers).
 * 
 * @param str The string to escape
 * @returns The HTML-escaped string, or empty string if input is null/undefined
 */
function escapeHTML(str: string | null | undefined): string {
  if (str == null) {
    return '';
  }
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
```

This utility will be added to a new file or an existing utility module, and will be used to escape originalText in logging calls.