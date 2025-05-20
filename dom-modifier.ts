/**
 * DOM Modifier Module - Responsible for modifying DOM elements with text conversions
 *
 * This module handles wrapping converted text segments in span elements with
 * appropriate attributes for tooltip functionality. It implements the DOMModifierInterface.
 *
 * @version 1.0.0
 */

/// <reference path="./types.d.ts" />

'use strict';

// Import interfaces from types.d.ts
interface TextSegmentConversion {
  readonly originalText: string;
  readonly convertedText: string;
  readonly startIndex: number;
  readonly endIndex: number;
}

// ===== CONSTANTS =====

/**
 * CSS class applied to span elements wrapping converted text
 */
const CONVERTED_TEXT_WRAPPER_CLASS: string = 'tg-converted-text';

/**
 * Data attribute used to store original text for tooltips
 */
const ORIGINAL_TEXT_DATA_ATTR: string = 'data-original-text';

// ===== DOM MODIFICATION =====

/**
 * Implementation of text node processing
 *
 * @param textNode - The text node to process
 * @param segments - The segments to convert and wrap
 * @returns True if modifications were made, false otherwise
 */
function innerImplementation(textNode: Text, segments: TextSegmentConversion[]): boolean {
  // Use window.Logger if available, otherwise fall back to console
  if (window.Logger) {
    window.Logger.debug('DOMModifier: Starting innerImplementation', {
      hasTextNode: !!textNode,
      textNodeType: textNode?.nodeType,
      segmentsLength: segments?.length,
    });
  } else {
    console.log('DOMModifier: Starting innerImplementation', {
      hasTextNode: !!textNode,
      textNodeType: textNode?.nodeType,
      segmentsLength: segments?.length,
    });
  }

  // Validate inputs
  if (!textNode || !textNode.nodeValue || textNode.nodeType !== Node.TEXT_NODE) {
    if (window.Logger) {
      window.Logger.debug('DOMModifier: Invalid text node provided', { textNode });
    } else {
      console.log('DOMModifier: Invalid text node provided', { textNode });
    }
    return false;
  }

  if (!segments || !Array.isArray(segments) || segments.length === 0) {
    if (window.Logger) {
      window.Logger.debug('DOMModifier: No segments to process', { segments });
    } else {
      console.log('DOMModifier: No segments to process', { segments });
    }
    return false;
  }

  const parentNode = textNode.parentNode;
  const originalText = textNode.nodeValue;

  if (!parentNode) {
    if (window.Logger) {
      window.Logger.debug('DOMModifier: Text node has no parent', { textNode });
    } else {
      console.log('DOMModifier: Text node has no parent', { textNode });
    }
    return false;
  }

  let modified = false;

  try {
    // Sort segments by start index in descending order
    // This ensures we process from end to start, avoiding index shifting
    const sortedSegments = [...segments].sort((a, b) => b.startIndex - a.startIndex);

    for (const segment of sortedSegments) {
      // Validate segment indices
      if (
        typeof segment.startIndex !== 'number' ||
        typeof segment.endIndex !== 'number' ||
        segment.startIndex < 0 ||
        segment.endIndex > originalText.length ||
        segment.startIndex >= segment.endIndex
      ) {
        if (window.Logger) {
          window.Logger.warn('DOMModifier: Invalid segment indices', { segment });
        } else {
          console.warn('DOMModifier: Invalid segment indices', { segment });
        }
        continue;
      }

      // Split the text node at the segment boundaries
      const afterSegment = textNode.splitText(segment.endIndex);
      const segmentNode = textNode.splitText(segment.startIndex);

      // Create wrapper span
      const wrapper = document.createElement('span');
      wrapper.className = CONVERTED_TEXT_WRAPPER_CLASS;
      wrapper.setAttribute(ORIGINAL_TEXT_DATA_ATTR, segment.originalText);
      wrapper.textContent = segment.convertedText;
      wrapper.setAttribute('tabindex', '0'); // Make focusable for accessibility

      // Mark as processed
      (wrapper as any)._trumpGogglesProcessed = true;

      // Replace the segment node with the wrapper
      parentNode.replaceChild(wrapper, segmentNode);

      // Continue with the remaining text (after the segment)
      textNode = afterSegment;
      modified = true;

      if (window.Logger) {
        window.Logger.debug('DOMModifier: Text segment wrapped', {
          originalText: segment.originalText,
          convertedText: segment.convertedText,
          element: wrapper,
        });
      } else {
        console.log('DOMModifier: Text segment wrapped', {
          originalText: segment.originalText,
          convertedText: segment.convertedText,
          element: wrapper,
        });
      }
    }

    return modified;
  } catch (err) {
    if (window.Logger) {
      window.Logger.error('DOMModifier: Error during text node processing', {
        error: err,
        textNode,
        segments,
      });
    } else {
      console.error('DOMModifier: Error during text node processing', {
        error: err,
        textNode,
        segments,
      });
    }
    return false;
  }
}

/**
 * Processes a text node, replacing segments based on conversion info.
 * Wraps converted segments in spans with data attributes.
 *
 * @param textNode - The text node to process
 * @param segments - The segments to convert and wrap
 * @returns True if modifications were made, false otherwise
 */
function processTextNodeAndWrapSegments(
  textNode: Text,
  segments: TextSegmentConversion[]
): boolean {
  // Debug log entry point
  if (window.Logger) {
    window.Logger.debug('DOMModifier: processTextNodeAndWrapSegments called', {
      textContent: textNode?.nodeValue?.substring(0, 50) + '...',
      segmentsLength: segments?.length,
      segments: segments,
    });
  }

  // Create a function that captures the parameters
  function processImplementation(): boolean {
    return innerImplementation(textNode, segments);
  }

  // Use error protection if available
  if (window.Logger && typeof window.Logger.protect === 'function') {
    const protectedFn = window.Logger.protect(
      processImplementation,
      'processTextNodeAndWrapSegments',
      false
    );
    return protectedFn();
  }

  // Fallback to direct execution
  try {
    return processImplementation();
  } catch (error) {
    // Log error and return false
    if (window.Logger) {
      window.Logger.error('DOMModifier: Error processing text node', { error });
    } else {
      console.error('DOMModifier: Error processing text node', { error });
    }
    return false;
  }
}

// ===== MODULE EXPORT =====

export const DOMModifier = {
  processTextNodeAndWrapSegments,
};

// Browser compatibility export
if (typeof window !== 'undefined') {
  window.DOMModifier = DOMModifier;
}

export default DOMModifier;
