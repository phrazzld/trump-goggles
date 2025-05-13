# T007 Plan: Implement TooltipUI text setting with XSS protection

## Approach
I'll implement the `setText(text)` method in the TooltipUI module to update the tooltip content, ensuring proper XSS protection by exclusively using `textContent` rather than `innerHTML`.

## Implementation Details

1. **Input Validation**
   - Check if the tooltip element exists, create it if needed using ensureCreated()
   - Validate the text parameter (null/undefined check, convert to string if necessary)

2. **XSS Protection**
   - Use ONLY `textContent` property to set content, NEVER `innerHTML` 
   - This ensures that HTML tags in the original text are displayed as text, not rendered as HTML
   - Add explicit comments in the code to emphasize this security requirement for future maintainers

3. **Error Handling**
   - Add try/catch block to handle any DOM manipulation errors
   - Log errors appropriately with the Logger if available
   - Don't throw errors to avoid breaking the extension

4. **Testing Considerations**
   - Manually verify the method correctly escapes HTML for security
   - Ensure text containing HTML tags is displayed as text, not rendered
   - Check that all special characters are displayed properly

## Security Focus
The primary objective of this task is security-focused. By using `textContent` instead of `innerHTML`, we ensure that any HTML tags or malicious script code in the original text will be treated as literal text and not executed, protecting against XSS attacks.