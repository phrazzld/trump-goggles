/**
 * DOM Modifier Module - Responsible for modifying DOM elements with text conversions
 *
 * This module handles wrapping converted text segments in span elements with
 * appropriate attributes for tooltip functionality. It implements the DOMModifierInterface.
 *
 * @version 1.0.0
 */

// DOMModifier module pattern
const DOMModifier = (function () {
  'use strict';

  // ===== CONSTANTS =====

  /**
   * CSS class applied to span elements wrapping converted text
   * @type {string}
   */
  const CONVERTED_TEXT_WRAPPER_CLASS = 'tg-converted-text';

  /**
   * Data attribute used to store original text for tooltips
   * @type {string}
   */
  const ORIGINAL_TEXT_DATA_ATTR = 'data-original-text';

  // ===== DOM MODIFICATION =====

  /**
   * Processes a text node, replacing segments based on conversion info.
   * Wraps converted segments in spans with data attributes.
   *
   * @param {Text} textNode - The text node to process
   * @param {TextSegmentConversion[]} segments - The segments to convert and wrap
   * @returns {boolean} - True if modifications were made, false otherwise
   */
  function processTextNodeAndWrapSegments(textNode, segments) {
    // Create a function that captures the parameters
    function processImplementation() {
      return innerImplementation(textNode, segments);
    }

    // Use Logger if available, otherwise use a fallback implementation
    if (window.Logger && typeof window.Logger.protect === 'function') {
      // @ts-ignore: Logger.protect is properly typed in LoggerInterface but TypeScript doesn't see it
      return window.Logger.protect(processImplementation, 'processTextNodeAndWrapSegments', false);
    } else {
      // Fallback if Logger is not available
      try {
        return processImplementation();
      } catch (error) {
        console.error('DOMModifier: Error during text node processing', error);
        return false;
      }
    }
  }

  /**
   * Inner implementation of processTextNodeAndWrapSegments
   * Extracted to avoid code duplication between protected and fallback paths
   *
   * @private
   * @param {Text} textNode - The text node to process
   * @param {TextSegmentConversion[]} segments - The segments to convert and wrap
   * @returns {boolean} - True if modifications were made, false otherwise
   */
  function innerImplementation(textNode, segments) {
    const logger = window.Logger || console;
    const debug = logger === console ? console.log : logger.debug;
    const warn = logger === console ? console.warn : logger.warn;
    const error = logger === console ? console.error : logger.error;

    // Input validation
    if (!textNode || !textNode.nodeValue || textNode.nodeType !== 3) {
      debug('DOMModifier: Invalid text node provided', { textNode });
      return false;
    }

    if (!segments || !Array.isArray(segments) || segments.length === 0) {
      debug('DOMModifier: No segments to process', { segments });
      return false;
    }

    // Save the parent node reference and original text content
    const parentNode = textNode.parentNode;
    const originalContent = textNode.nodeValue;

    if (!parentNode) {
      debug('DOMModifier: Text node has no parent', { textNode });
      return false;
    }

    // Keep track of whether we've made any modifications
    let modificationsApplied = false;

    try {
      // Sort segments in reverse order (from end to start) to maintain indices
      // This way earlier modifications don't affect the indices of later ones
      const sortedSegments = [...segments].sort((a, b) => b.startIndex - a.startIndex);

      // Process each segment
      for (const segment of sortedSegments) {
        // Validate segment data
        if (
          typeof segment.startIndex !== 'number' ||
          typeof segment.endIndex !== 'number' ||
          segment.startIndex < 0 ||
          segment.endIndex > originalContent.length ||
          segment.startIndex >= segment.endIndex
        ) {
          warn('DOMModifier: Invalid segment indices', { segment });
          continue;
        }

        // Segment is already validated, proceed with DOM operations

        // Split the text node at the segment end
        const afterNode = textNode.splitText(segment.endIndex);

        // Split again at the segment start (relative to the original node)
        // This gives us the exact text node that contains just our segment
        const segmentNode = textNode.splitText(segment.startIndex);

        // Create span element
        const spanElement = document.createElement('span');

        // Set attributes
        spanElement.className = CONVERTED_TEXT_WRAPPER_CLASS;
        spanElement.setAttribute(ORIGINAL_TEXT_DATA_ATTR, segment.originalText);
        spanElement.textContent = segment.convertedText; // Use textContent for XSS protection
        spanElement.setAttribute('tabindex', '0'); // For accessibility

        // Mark the span to prevent re-processing by MutationObserverManager
        spanElement._trumpGogglesProcessed = true;

        // Replace the segment text node with our span
        parentNode.replaceChild(spanElement, segmentNode);

        // Update the textNode reference to point to the node after our insertion
        // for the next iteration
        textNode = afterNode;

        // Record that we've made a change
        modificationsApplied = true;

        // Log debug information
        debug('DOMModifier: Text segment wrapped', {
          originalText: segment.originalText,
          convertedText: segment.convertedText,
          element: spanElement,
        });
      }

      return modificationsApplied;
    } catch (err) {
      // Log errors and return false to indicate failure
      error('DOMModifier: Error during text node processing', {
        error: err,
        textNode,
        segments,
      });
      return false;
    }
  }

  // ===== PUBLIC API =====

  /** @type {DOMModifierInterface} */
  return {
    // Core DOM modification method
    processTextNodeAndWrapSegments: processTextNodeAndWrapSegments,

    // Constants exported for configuration and testing
    CONVERTED_TEXT_WRAPPER_CLASS: CONVERTED_TEXT_WRAPPER_CLASS,
    ORIGINAL_TEXT_DATA_ATTR: ORIGINAL_TEXT_DATA_ATTR,
  };
})();

// Export the module
window.DOMModifier = DOMModifier;
