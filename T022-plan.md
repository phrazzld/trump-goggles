# T022: Standardize on data-tg-processed for marking processed elements

## Analysis

The task is to standardize how elements are marked as processed by using a consistent `data-tg-processed` attribute instead of custom JavaScript properties like `_trumpGogglesProcessed`.

Currently, the codebase uses two different approaches for marking processed elements:

1. In dom-processor.js:
   - Text nodes are marked with a `_trumpProcessed` property
   - Element nodes are marked with a `data-trump-processed` attribute

2. In dom-modifier.ts:
   - Elements are marked with a `_trumpGogglesProcessed` property

3. In types.d.ts:
   - Node, Text, and ParentNode interfaces have custom properties defined for `_trumpGogglesProcessed` and `_trumpProcessed`

This inconsistency can lead to confusion, maintenance issues, and potential bugs.

## Implementation Plan

1. Update dom-processor.js:
   - Change the PROCESSED_ATTR constant from 'data-trump-processed' to 'data-tg-processed'
   - Keep the `_trumpProcessed` property for text nodes, as we can't add attributes to them

2. Update dom-modifier.ts:
   - Replace `(wrapper as any)._trumpGogglesProcessed = true;` with `wrapper.setAttribute('data-tg-processed', 'true');`

3. Update types.d.ts:
   - Keep the `_trumpProcessed` property for Text interface
   - Remove `_trumpGogglesProcessed` property from all interfaces (Node, Text, ParentNode)
   - Add a comment explaining why we keep `_trumpProcessed` for text nodes

4. Update any tests that rely on the old marking method:
   - Identify tests that check for `_trumpGogglesProcessed`
   - Update them to use the new attribute instead

## Validation

1. Run the test suite to ensure no regressions
2. Perform a visual inspection of processed pages to ensure conversions still work correctly

## Expected Outcome

- A consistent approach for marking processed elements using `data-tg-processed="true"`
- Text nodes will still use `_trumpProcessed` property (as they can't have attributes)
- Cleaner type definitions in types.d.ts
- Improved code organization and maintainability