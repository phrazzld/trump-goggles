# TEST-07: Implement Unit Tests for Nickname Mapping Legacy Support

## Task Summary
Implement unit tests for the deprecated `buildTrumpMap` function in the Trump Mappings module, verifying it maintains backward compatibility and logs the expected deprecation warning when used.

## Current Status
During the implementation of TEST-06, we already added the following tests for the deprecated `buildTrumpMap` function:

1. Verification that `buildTrumpMap` exists on the window object for backward compatibility
2. Confirmation that it returns the same mapping object as the new `getReplacementMap` method
3. Validation that it logs a deprecation warning when called

These tests are located in the "Replacement Map API" section of the Enhanced Trump Mappings Module tests in `test/content/trump-mappings.test.js`.

## Approach
Since the core tests for backward compatibility are already implemented, I'll focus on enhancing these tests to ensure more comprehensive coverage:

1. Verify the structure of the objects returned by `buildTrumpMap`
2. Test the function's behavior with different parameters (if applicable)
3. Ensure the logged deprecation warning has the expected format
4. Verify that the returned mappings have the correct regex patterns and nickname values

## Implementation Steps
1. Review existing tests in `trump-mappings.test.js` to avoid duplication
2. Add more specific tests for the `buildTrumpMap` function:
   - Test correct structure of returned objects
   - Verify that all expected mappings are present
   - Test that all returned regex patterns are properly formatted
3. Enhance the deprecation warning test:
   - Verify warning is logged exactly once per call
   - Check for the expected warning message format

## Verification
- Run the tests with `npm test` to confirm all tests pass
- Ensure code coverage for the legacy support function is comprehensive