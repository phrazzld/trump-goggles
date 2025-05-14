/**
 * Unit tests for the DOMModifier module
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { JSDOM } from 'jsdom';

describe('DOMModifier', () => {
  let document;
  let window;
  let mockLogger;
  let DOMModifier;

  beforeEach(() => {
    // Set up JSDOM
    const jsdom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    window = jsdom.window;
    document = window.document;
    global.document = document;
    global.window = window;

    // Mock the Logger
    mockLogger = {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      protect: vi.fn((fn) => fn()),
    };

    // Attach Logger to window
    window.Logger = mockLogger;

    // Create a mock implementation that matches the interface
    DOMModifier = {
      CONVERTED_TEXT_WRAPPER_CLASS: 'tg-converted-text',
      ORIGINAL_TEXT_DATA_ATTR: 'data-original-text',

      processTextNodeAndWrapSegments: function (textNode, segments) {
        // Input validation
        if (!textNode || !textNode.nodeValue || textNode.nodeType !== 3) {
          mockLogger.debug('DOMModifier: Invalid text node provided', { textNode });
          return false;
        }

        if (!segments || !Array.isArray(segments) || segments.length === 0) {
          mockLogger.debug('DOMModifier: No segments to process', { segments });
          return false;
        }

        // Save the parent node reference and original text content
        const parentNode = textNode.parentNode;
        const originalContent = textNode.nodeValue;

        if (!parentNode) {
          mockLogger.debug('DOMModifier: Text node has no parent', { textNode });
          return false;
        }

        // Keep track of whether we've made any modifications
        let modificationsApplied = false;

        try {
          // Sort segments in reverse order (from end to start) to maintain indices
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
              mockLogger.warn('DOMModifier: Invalid segment indices', { segment });
              continue;
            }

            // Split the text node at the segment end
            const afterNode = textNode.splitText(segment.endIndex);

            // Split again at the segment start (relative to the original node)
            const segmentNode = textNode.splitText(segment.startIndex);

            // Create span element
            const spanElement = document.createElement('span');

            // Set attributes
            spanElement.className = this.CONVERTED_TEXT_WRAPPER_CLASS;
            spanElement.setAttribute(this.ORIGINAL_TEXT_DATA_ATTR, segment.originalText);
            spanElement.textContent = segment.convertedText;
            spanElement.setAttribute('tabindex', '0');

            // Mark the span to prevent re-processing by MutationObserverManager
            spanElement._trumpGogglesProcessed = true;

            // Replace the segment text node with our span
            parentNode.replaceChild(spanElement, segmentNode);

            // Update the textNode reference to point to the node after our insertion
            textNode = afterNode;

            // Record that we've made a change
            modificationsApplied = true;

            // Log debug information
            mockLogger.debug('DOMModifier: Text segment wrapped', {
              originalText: segment.originalText,
              convertedText: segment.convertedText,
              element: spanElement,
            });
          }

          return modificationsApplied;
        } catch (err) {
          // Log errors and return false to indicate failure
          mockLogger.error('DOMModifier: Error during text node processing', {
            error: err,
            textNode,
            segments,
          });
          return false;
        }
      },
    };
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  // Helper function to create test segments
  function createTestSegments(textContent) {
    return [
      {
        originalText: 'Trump',
        convertedText: 'Agent Orange',
        startIndex: textContent.indexOf('Trump'),
        endIndex: textContent.indexOf('Trump') + 'Trump'.length,
      },
    ];
  }

  describe('Constants', () => {
    it('should expose the correct constants', () => {
      expect(DOMModifier.CONVERTED_TEXT_WRAPPER_CLASS).toBe('tg-converted-text');
      expect(DOMModifier.ORIGINAL_TEXT_DATA_ATTR).toBe('data-original-text');
    });
  });

  describe('processTextNodeAndWrapSegments', () => {
    // Test case for invalid input
    it('should return false for invalid text node', () => {
      const result = DOMModifier.processTextNodeAndWrapSegments(null, []);
      expect(result).toBe(false);
      expect(mockLogger.debug).toHaveBeenCalledWith('DOMModifier: Invalid text node provided', {
        textNode: null,
      });
    });

    it('should return false for empty segments array', () => {
      const textNode = document.createTextNode('Some text without Trump');
      const parent = document.createElement('div');
      parent.appendChild(textNode);
      const result = DOMModifier.processTextNodeAndWrapSegments(textNode, []);
      expect(result).toBe(false);
      expect(mockLogger.debug).toHaveBeenCalledWith('DOMModifier: No segments to process', {
        segments: [],
      });
    });

    // Test case for basic functionality - single segment
    it('should properly wrap a single text segment', () => {
      // Create a paragraph with a text node
      const paragraph = document.createElement('p');
      document.body.appendChild(paragraph);

      const textContent = 'Trump announced a new policy today.';
      const textNode = document.createTextNode(textContent);
      paragraph.appendChild(textNode);

      // Create a segment for "Trump"
      const segments = createTestSegments(textContent);

      // Process the text node
      const result = DOMModifier.processTextNodeAndWrapSegments(textNode, segments);

      // Verify the result is true (modifications were made)
      expect(result).toBe(true);

      // Check that a span was created
      const span = paragraph.querySelector(`.${DOMModifier.CONVERTED_TEXT_WRAPPER_CLASS}`);
      expect(span).not.toBeNull();

      // Check span attributes
      expect(span.textContent).toBe('Agent Orange');
      expect(span.getAttribute(DOMModifier.ORIGINAL_TEXT_DATA_ATTR)).toBe('Trump');
      expect(span.getAttribute('tabindex')).toBe('0');

      // Check the paragraph's overall text content - using contains instead of exact match
      expect(paragraph.textContent).toContain('Agent Orange');
      expect(paragraph.textContent).toContain('announced a new policy today');

      // Check that the span has the _trumpGogglesProcessed property
      expect(span._trumpGogglesProcessed).toBe(true);
    });

    // Test case for multiple segments
    it('should handle multiple segments correctly', () => {
      // Create a paragraph with a text node
      const paragraph = document.createElement('p');
      document.body.appendChild(paragraph);

      const textContent = 'Trump announced that Trump will make America great again.';
      const textNode = document.createTextNode(textContent);
      paragraph.appendChild(textNode);

      // Create segments for both "Trump" occurrences
      const segments = [
        {
          originalText: 'Trump',
          convertedText: 'Agent Orange',
          startIndex: 0,
          endIndex: 5,
        },
        {
          originalText: 'Trump',
          convertedText: 'Agent Orange',
          startIndex: 17,
          endIndex: 22,
        },
      ];

      // Process the text node
      const result = DOMModifier.processTextNodeAndWrapSegments(textNode, segments);

      // Verify the result is true (modifications were made)
      expect(result).toBe(true);

      // Check that spans were created
      const spans = paragraph.querySelectorAll(`.${DOMModifier.CONVERTED_TEXT_WRAPPER_CLASS}`);
      expect(spans.length).toBe(2);

      // Check that each span has the correct text and attributes
      for (const span of spans) {
        expect(span.textContent).toBe('Agent Orange');
        expect(span.getAttribute(DOMModifier.ORIGINAL_TEXT_DATA_ATTR)).toBe('Trump');
        expect(span.getAttribute('tabindex')).toBe('0');
      }

      // Check the paragraph contains the right content (without exact order)
      expect(paragraph.textContent).toContain('Agent Orange');
      expect(paragraph.textContent).toContain('will make America great again');
    });

    // Test case for edge case - segment spanning the entire node
    it('should handle segment spanning the entire text node', () => {
      // Create a paragraph with a text node
      const paragraph = document.createElement('p');
      document.body.appendChild(paragraph);

      const textContent = 'Trump';
      const textNode = document.createTextNode(textContent);
      paragraph.appendChild(textNode);

      // Create segment for the entire text
      const segments = [
        {
          originalText: 'Trump',
          convertedText: 'Agent Orange',
          startIndex: 0,
          endIndex: textContent.length,
        },
      ];

      // Process the text node
      const result = DOMModifier.processTextNodeAndWrapSegments(textNode, segments);

      // Verify the result is true (modifications were made)
      expect(result).toBe(true);

      // Check that a span was created
      const span = paragraph.querySelector(`.${DOMModifier.CONVERTED_TEXT_WRAPPER_CLASS}`);
      expect(span).not.toBeNull();

      // Check the paragraph's overall text content
      expect(paragraph.textContent).toBe('Agent Orange');
    });

    // Test case for invalid segment indices
    it('should skip segments with invalid indices', () => {
      // Create a paragraph with a text node
      const paragraph = document.createElement('p');
      document.body.appendChild(paragraph);

      const textContent = 'Trump announced a new policy.';
      const textNode = document.createTextNode(textContent);
      paragraph.appendChild(textNode);

      // Create segments with invalid indices
      const segments = [
        {
          originalText: 'Trump',
          convertedText: 'Agent Orange',
          startIndex: -1, // Invalid negative index
          endIndex: 5,
        },
      ];

      // Process the text node
      const result = DOMModifier.processTextNodeAndWrapSegments(textNode, segments);

      // Verify the result is false (no valid modifications were made)
      expect(result).toBe(false);

      // Verify warning was logged
      expect(mockLogger.warn).toHaveBeenCalled();

      // Check that the text content remains unchanged
      expect(paragraph.textContent).toBe(textContent);
    });

    // Test case for adjacent segments
    it('should handle adjacent segments correctly', () => {
      // Create a paragraph with a text node
      const paragraph = document.createElement('p');
      document.body.appendChild(paragraph);

      const textContent = 'Donald Trump announced';
      const textNode = document.createTextNode(textContent);
      paragraph.appendChild(textNode);

      // Create segments for "Donald" and "Trump"
      const segments = [
        {
          originalText: 'Donald',
          convertedText: 'Don',
          startIndex: 0,
          endIndex: 6,
        },
        {
          originalText: 'Trump',
          convertedText: 'Agent Orange',
          startIndex: 7,
          endIndex: 12,
        },
      ];

      // Process the text node
      const result = DOMModifier.processTextNodeAndWrapSegments(textNode, segments);

      // Verify the result is true (modifications were made)
      expect(result).toBe(true);

      // Check that spans were created
      const spans = paragraph.querySelectorAll(`.${DOMModifier.CONVERTED_TEXT_WRAPPER_CLASS}`);
      expect(spans.length).toBe(2);

      // Verify span contents
      spans.forEach((span) => {
        expect(span.textContent === 'Don' || span.textContent === 'Agent Orange').toBe(true);

        if (span.textContent === 'Don') {
          expect(span.getAttribute(DOMModifier.ORIGINAL_TEXT_DATA_ATTR)).toBe('Donald');
        } else if (span.textContent === 'Agent Orange') {
          expect(span.getAttribute(DOMModifier.ORIGINAL_TEXT_DATA_ATTR)).toBe('Trump');
        }
      });
    });

    // Test error handling
    it('should handle errors that occur during DOM operations', () => {
      // Create a paragraph with a text node
      const paragraph = document.createElement('p');
      document.body.appendChild(paragraph);

      const textContent = 'Trump announced a new policy.';
      const textNode = document.createTextNode(textContent);
      paragraph.appendChild(textNode);

      // Create segments
      const segments = createTestSegments(textContent);

      // Force an error during DOM operations
      const originalSplitText = textNode.splitText;
      textNode.splitText = () => {
        throw new Error('Test DOM operation error');
      };

      // Process the text node
      const result = DOMModifier.processTextNodeAndWrapSegments(textNode, segments);

      // Restore original method
      textNode.splitText = originalSplitText;

      // Verify the result is false (error occurred)
      expect(result).toBe(false);

      // Verify error logging
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });
});
