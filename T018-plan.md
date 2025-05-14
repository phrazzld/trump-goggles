# T018 Plan: Write Unit Tests for TextProcessor.identifyConversableSegments

## Overview
This task involves writing unit tests for the `identifyConversableSegments` method of the TextProcessor module. This method is responsible for identifying segments of text that need to be converted according to the Trump Goggles mapping rules, without actually modifying the DOM.

## Approach

### 1. Understand the Method to be Tested
First, we need to understand how the `identifyConversableSegments` method works:
- It processes a text string and identifies segments that match the Trump mapping rules
- It returns an array of `TextSegmentConversion` objects
- Each object contains:
  - `originalText`: The original text that was identified for conversion
  - `convertedText`: The text after conversion
  - `startIndex`: Starting position in the original text
  - `endIndex`: Ending position in the original text

### 2. Create Test File and Setup
- Create a new test file: `test/content/text-processor.test.js`
- Set up the test boilerplate with necessary imports
- Create mock data for testing (Trump mappings, various text inputs)

### 3. Design Test Cases
We'll implement the following test cases:

#### Basic Functionality
1. **Empty text:** Should return empty array
2. **No matches:** Text without any convertible content should return empty array

#### Single Match Cases
3. **Single word match:** Text with one convertible word
4. **Match at start:** Convertible text at the beginning of the string
5. **Match at end:** Convertible text at the end of the string
6. **Match in middle:** Convertible text in the middle of a longer string

#### Multiple Match Cases
7. **Multiple matches:** Text with multiple convertible segments
8. **Adjacent matches:** Multiple convertible segments next to each other
9. **Overlapping patterns:** Handle case where patterns could potentially overlap

#### Edge Cases
10. **Case sensitivity:** Test different capitalizations
11. **Special characters:** Test with punctuation and special characters
12. **Long text:** Test with longer paragraphs of text

### 4. Implementation
For each test case:
- Create appropriate input text
- Create expected output (array of TextSegmentConversion objects)
- Call the method and compare result with expected output
- Verify all properties of each TextSegmentConversion object

### 5. Validation
- Ensure test coverage meets or exceeds 90% for the identifyConversableSegments method
- Verify tests run successfully
- Check test quality measures (no duplicated assertions, clear test names, etc.)

## Implementation Steps
1. Examine the TextProcessor module to understand the identifyConversableSegments method
2. Create the test file structure with necessary imports and setup
3. Implement the basic functionality tests
4. Implement the single match test cases
5. Implement the multiple match test cases
6. Implement the edge case tests
7. Run tests and verify coverage
8. Make any necessary adjustments to improve test quality

## Success Criteria
- All tests pass consistently
- Test coverage for the identifyConversableSegments method exceeds 90%
- Tests cover all identified scenarios
- Test code follows the project's testing patterns and conventions