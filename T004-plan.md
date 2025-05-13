# T004 Plan: Implement DOMModifier.processTextNodeAndWrapSegments Method

## Approach
I'll implement the `processTextNodeAndWrapSegments` method in the `dom-modifier.js` file to handle splitting and wrapping text nodes with spans for highlighting converted text segments. This implementation will adhere to the DOMModifierInterface and support tooltip functionality.

## Implementation Strategy

1. **Input Validation**
   - Validate the text node and segments array
   - Return false early if invalid or empty input

2. **DOM Modification Approach**
   - Process segments in reverse order (from end to start) to maintain correct indices
   - For each segment:
     1. Split the text node at segment boundaries
     2. Create a span element for the segment
     3. Apply required attributes to the span:
        - className = "tg-converted-text"
        - data-original-text = segment.originalText
        - textContent = segment.convertedText
        - tabindex = "0" (for accessibility)
     4. Insert the span in place of the split text node

3. **Error Handling**
   - Wrap DOM operations in Logger.protect for graceful failure handling
   - Log errors at the ERROR level using the Logger module
   - Return false if any operation fails

4. **Mutation Observer Protection**
   - Mark created spans with a property to prevent re-processing
   - Ensure the span's textContent (not innerHTML) is set to prevent XSS

5. **Logging**
   - Add DEBUG level logging for wrapped segments
   - Log success/failure states of operations

6. **Return Value**
   - Return true if at least one segment was successfully processed
   - Return false otherwise (no segments, error, or no changes made)

## Edge Cases to Handle
- Empty text nodes or no segments
- Invalid text node references
- Text nodes with special characters or HTML entities
- DOM insertion failures
- Overlapping segments (handled by sorting in TextProcessor)