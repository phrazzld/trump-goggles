/**
 * DOM Modifier Module - Responsible for modifying DOM elements with text conversions
 *
 * This module handles wrapping converted text segments in span elements with
 * appropriate attributes for tooltip functionality. It implements the DOMModifierInterface.
 *
 * @version 1.0.0
 */

/// <reference path="../types/types.d.ts" />

'use strict';

/**
 * Gets or initializes the logger instance for this module
 *
 * @private
 * @returns Logger instance or null if LoggerFactory unavailable
 */
function getLogger(): any {
  // Always check for LoggerFactory first (don't cache for tests)
  if ((window as any).LoggerFactory) {
    try {
      return (window as any).LoggerFactory.getLogger('dom-modifier');
    } catch {
      // Fall back to legacy Logger if available
      if ((window as any).Logger) {
        return (window as any).Logger;
      }
    }
  }

  // If no LoggerFactory, try legacy Logger
  if ((window as any).Logger) {
    return (window as any).Logger;
  }

  return null;
}

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
  // Log entry to the function
  const currentLogger = getLogger();
  if (currentLogger) {
    currentLogger.debug('DOMModifier: Starting innerImplementation', {
      hasTextNode: !!textNode,
      textNodeType: textNode?.nodeType,
      segmentsLength: segments?.length,
    });
  }

  // Validate inputs
  if (!textNode || !textNode.nodeValue || textNode.nodeType !== Node.TEXT_NODE) {
    const currentLogger = getLogger();
    if (currentLogger) {
      currentLogger.debug('DOMModifier: Invalid text node provided', { textNode });
    }
    return false;
  }

  if (!segments || !Array.isArray(segments) || segments.length === 0) {
    const currentLogger = getLogger();
    if (currentLogger) {
      currentLogger.debug('DOMModifier: No segments to process', { segments });
    }
    return false;
  }

  const parentNode = textNode.parentNode;
  const originalText = textNode.nodeValue;

  if (!parentNode) {
    const currentLogger = getLogger();
    if (currentLogger) {
      currentLogger.debug('DOMModifier: Text node has no parent', { textNode });
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
        const currentLogger = getLogger();
        if (currentLogger) {
          currentLogger.warn('DOMModifier: Invalid segment indices', { segment });
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
      wrapper.setAttribute('data-tg-processed', 'true');

      // Replace the segment node with the wrapper
      parentNode.replaceChild(wrapper, segmentNode);

      // Continue with the remaining text (after the segment)
      textNode = afterSegment;
      modified = true;

      const currentLogger = getLogger();
      if (currentLogger) {
        currentLogger.debug('DOMModifier: Text segment wrapped', {
          originalText: segment.originalText,
          convertedText: segment.convertedText,
          element: wrapper,
        });
      }
    }

    return modified;
  } catch (err) {
    const currentLogger = getLogger();
    if (currentLogger) {
      currentLogger.error('DOMModifier: Error during text node processing', {
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
  const currentLogger = getLogger();
  if (currentLogger) {
    currentLogger.debug('DOMModifier: processTextNodeAndWrapSegments called', {
      textContent: textNode?.nodeValue?.substring(0, 50) + '...',
      segmentsLength: segments?.length,
      segments: segments,
    });
  }

  // Create a function that captures the parameters
  function processImplementation(): boolean {
    return innerImplementation(textNode, segments);
  }

  // Execute with error handling
  try {
    return processImplementation();
  } catch (error) {
    // Log error and return false
    const currentLogger = getLogger();
    if (currentLogger) {
      currentLogger.error('DOMModifier: Error processing text node', { error });
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
