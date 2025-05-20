# Security Considerations

## Overview

This document outlines security considerations for the Trump Goggles extension, focusing on the handling of untrusted text and potential Cross-Site Scripting (XSS) vulnerabilities.

## originalText Handling

### Source and Threat Model

The `originalText` variable represents text extracted from web pages the extension is running on. This text should be considered untrusted as it:

1. Comes from arbitrary web page DOM text nodes
2. Could potentially contain malicious HTML, JavaScript, or other attack payloads
3. Is controlled by the website creator or other users (in the case of user-generated content)

### Lifecycle

1. **Sourcing**: `originalText` is sourced directly from DOM text nodes via `textNode.nodeValue` in `dom-modifier.ts`.
2. **Storage**: The text is stored raw (unmodified) in the `data-original-text` attribute of wrapper spans that replace the original text nodes.
3. **Retrieval**: The `originalText` is retrieved via `getAttribute(ORIGINAL_TEXT_ATTR)` when a user hovers over or focuses on a converted text element.
4. **Display**: The text is displayed in tooltips using `tooltipElement.textContent` in `tooltip-ui.ts`.
5. **Logging**: Snippets of the text may be logged for debugging and diagnostic purposes.

### Security Measures

#### Display Security

The primary XSS vulnerability would be if `originalText` were inserted into the DOM using a method that interprets or executes HTML/JavaScript. We prevent this by:

- **Using `textContent` exclusively**: In `tooltip-ui.ts`, we exclusively use `tooltipElement.textContent = safeText` to set tooltip content. This ensures any HTML or script tags in the text are treated as literal text, not interpreted or executed.
- **Never using innerHTML**: We explicitly avoid using `innerHTML`, `outerHTML`, `document.write()`, or similar methods that would parse and execute malicious code in the text.

**CRITICAL SECURITY RULE**: Always use `textContent` (or equivalent safe properties) when displaying `originalText` or any untrusted content. Never use `innerHTML` or other methods that parse HTML.

#### Logging Security

Even when using `textContent` for display, logging untrusted content can pose risks if logs are viewed in contexts that might interpret HTML (e.g., log viewers with HTML rendering). We mitigate this by:

- **HTML Escaping**: We use the `escapeHTML` utility function in `security-utils.ts` to escape any HTML special characters before logging.
- **Snippet Limitation**: We only log short snippets (first 30 characters) of `originalText` to minimize risk and output size.

#### Attribute Security

Storing `originalText` in the `data-original-text` attribute is generally safe as:

- HTML attributes don't directly execute code
- Data attributes are meant for storing custom data and browsers don't interpret them specially
- We retrieve the value with `getAttribute()` which returns the raw string, rather than an interpreted value

However, it's important to note that attributes can be read by JavaScript on the page, so sensitive information should not be stored this way.

## General Security Guidelines

1. **Treat All Data as Untrusted**: Always assume `originalText` and any data from web pages could be malicious.
2. **Context-Appropriate Encoding**: Use appropriate encoding for the context:
   - `textContent` for DOM display
   - `escapeHTML` for logs or contexts where HTML might be interpreted
3. **Principle of Least Privilege**: Don't expose any more functionality or data than necessary to perform the required tasks.
4. **Defense in Depth**: Apply multiple layers of protection rather than relying on a single security measure.

## Testing Security

To test the security of `originalText` handling:

1. Create a page with text containing HTML tags, JavaScript code, and special characters
2. Install the extension and verify the tooltip displays the exact markup as literal text
3. Verify logs show properly escaped HTML content
4. Attempt to trigger XSS by inserting payloads like `<script>alert('XSS')</script>` into page text