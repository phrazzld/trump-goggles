# T002 Plan: Implement TextProcessor.identifyConversableSegments Method

## Approach
I'll implement the `identifyConversableSegments` method in the existing `text-processor.js` file to identify text segments that need conversion without modifying the DOM. The method will analyze text content and identify segments that match patterns in the replacement map, then return an array of `TextSegmentConversion` objects.

## Implementation Details
1. The method will reuse existing pattern matching logic from `processText` but instead of performing replacements, it will collect segment information (original text, converted text, start/end indices).
2. To find segments, I'll:
   - Apply the early bailout optimization first to quickly skip texts with no possible matches
   - Use regex with the `exec()` method in a loop to find all matches
   - For each match, create a `TextSegmentConversion` object with the required properties
   - Ensure regex lastIndex is properly reset for global patterns
3. Follow the TypeScript interface definition for the return type
4. Add proper JSDoc documentation 
5. Ensure immutability of the returned data by using readonly properties
6. Handle edge cases (no matches, overlapping matches, etc.)

## Testing Strategy
The implementation will be tested in task T018, which will cover:
- No matches in text
- Single match in middle of text
- Multiple matches in text
- Matches at start/end of text