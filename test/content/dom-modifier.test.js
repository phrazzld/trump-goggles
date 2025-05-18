/**
 * Unit tests for the DOMModifier module
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { JSDOM } from 'jsdom';
import { DOMModifier } from '../../dom-modifier.ts';

describe('DOMModifier', () => {
  let document;
  let window;
  let mockLogger;

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
      protect: vi.fn((fn) => fn),
    };

    // Attach Logger to window
    window.Logger = mockLogger;
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

  // Constants are no longer exposed directly - they're internal to the module
  // Remove this describe block since constants are private

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
      const span = paragraph.querySelector('.tg-converted-text');
      expect(span).not.toBeNull();

      // Check span attributes
      expect(span.textContent).toBe('Agent Orange');
      expect(span.getAttribute('data-original-text')).toBe('Trump');
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
      const spans = paragraph.querySelectorAll('.tg-converted-text');
      expect(spans.length).toBe(2);

      // Check that each span has the correct text and attributes
      for (const span of spans) {
        expect(span.textContent).toBe('Agent Orange');
        expect(span.getAttribute('data-original-text')).toBe('Trump');
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
      const span = paragraph.querySelector('.tg-converted-text');
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
      const spans = paragraph.querySelectorAll('.tg-converted-text');
      expect(spans.length).toBe(2);

      // Verify span contents
      spans.forEach((span) => {
        expect(span.textContent === 'Don' || span.textContent === 'Agent Orange').toBe(true);

        if (span.textContent === 'Don') {
          expect(span.getAttribute('data-original-text')).toBe('Donald');
        } else if (span.textContent === 'Agent Orange') {
          expect(span.getAttribute('data-original-text')).toBe('Trump');
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
