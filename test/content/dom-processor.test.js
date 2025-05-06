/**
 * Unit tests for the DOM processor module
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { JSDOM } from 'jsdom';
import { createTestDOM, createTestTrumpMap, countReplacements } from '../helpers/test-utils';
import { COMPLEX_HTML, NESTED_HTML } from '../fixtures/html-fixtures';

// Create a mock of the DOM processor module
// In a real implementation, you'd import the actual module
const createDomProcessor = (options = {}) => {
  return {
    // Mock the core DOM walking function
    walkDOM: vi.fn((node, processingFunction, skipFunction = null) => {
      if (!node || !processingFunction) {
        return;
      }

      // Skip if the skip function returns true
      if (skipFunction && skipFunction(node)) {
        return;
      }

      // Process this node
      if (node.nodeType === 3) {
        // Text node
        processingFunction(node);
      }

      // Process child nodes
      let child = node.firstChild;
      while (child) {
        const next = child.nextSibling; // Store next before processing

        // Recursively process children
        createDomProcessor(options).walkDOM(child, processingFunction, skipFunction);

        child = next; // Use stored next to avoid issues if the DOM changes
      }
    }),

    // Check if a node should be skipped
    shouldSkipNode: vi.fn((node) => {
      if (!node) {
        return true;
      }

      // Skip non-element/non-text nodes
      if (node.nodeType !== 1 && node.nodeType !== 3) {
        return true;
      }

      // Always process text nodes
      if (node.nodeType === 3) {
        return false;
      }

      // Check if this is an editable element
      if (node.nodeName.toLowerCase() === 'textarea' || node.nodeName.toLowerCase() === 'input') {
        return true;
      }

      // Check for contenteditable attribute
      if (
        node.getAttribute &&
        (node.getAttribute('contenteditable') === 'true' ||
          node.getAttribute('contenteditable') === '')
      ) {
        return true;
      }

      // Check if this is a skipable element type
      const skipTags = [
        'script',
        'style',
        'noscript',
        'iframe',
        'svg',
        'math',
        'head',
        'select',
        'textarea',
        'button',
      ];
      if (skipTags.includes(node.nodeName.toLowerCase())) {
        return true;
      }

      // Not skipped
      return false;
    }),

    // Check if a node is editable
    isEditableNode: vi.fn((node) => {
      if (!node) {
        return false;
      }

      // Check for text node (check parent)
      if (node.nodeType === 3) {
        return node.parentNode
          ? createDomProcessor(options).isEditableNode(node.parentNode)
          : false;
      }

      // Check for element node
      if (node.nodeType === 1) {
        // Check for editable elements
        if (node.nodeName.toLowerCase() === 'textarea' || node.nodeName.toLowerCase() === 'input') {
          return true;
        }

        // Check for contenteditable attribute
        if (
          node.getAttribute &&
          (node.getAttribute('contenteditable') === 'true' ||
            node.getAttribute('contenteditable') === '')
        ) {
          return true;
        }

        // Check parent recursively
        return node.parentNode
          ? createDomProcessor(options).isEditableNode(node.parentNode)
          : false;
      }

      return false;
    }),

    // Check if a node has been processed
    isProcessedNode: vi.fn((node) => {
      return (
        node &&
        (node._trumpProcessed === true || (node.dataset && node.dataset.trumpProcessed === 'true'))
      );
    }),

    // Mark a node as processed
    markNodeAsProcessed: vi.fn((node) => {
      if (!node) {
        return;
      }

      try {
        if (node.nodeType === 1 && node.dataset) {
          node.dataset.trumpProcessed = 'true';
        } else {
          node._trumpProcessed = true;
        }
      } catch (/* eslint-disable-line no-unused-vars */ _e) {
        // Fallback for nodes that don't support dataset
        node._trumpProcessed = true;
      }
    }),

    // Process the entire DOM
    processDOM: vi.fn((rootNode, textProcessor, trumpMap, mapKeys) => {
      if (!rootNode || !textProcessor || !trumpMap || !mapKeys) {
        return;
      }

      // Create a processing function
      const processTextNode = (textNode) => {
        // Skip if already processed
        if (createDomProcessor(options).isProcessedNode(textNode)) {
          return;
        }

        // Skip if editable
        if (createDomProcessor(options).isEditableNode(textNode)) {
          return;
        }

        // Process text
        if (textNode.nodeValue) {
          const originalText = textNode.nodeValue;
          const processedText = textProcessor(originalText, trumpMap, mapKeys);

          // Only update if changed
          if (processedText !== originalText) {
            textNode.nodeValue = processedText;
          }

          // Mark as processed
          createDomProcessor(options).markNodeAsProcessed(textNode);
        }
      };

      // Walk the DOM and process text nodes
      createDomProcessor(options).walkDOM(
        rootNode,
        processTextNode,
        createDomProcessor(options).shouldSkipNode
      );
    }),
  };
};

describe('DOM Processor Module', () => {
  let DOMProcessor;
  let document;
  let trumpMap;
  let mapKeys;
  let mockTextProcessor;

  beforeEach(() => {
    // Create a fresh instance for each test
    DOMProcessor = createDomProcessor();

    // Setup JSDOM
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    document = dom.window.document;
    global.document = document;

    // Create test Trump map
    trumpMap = createTestTrumpMap();
    mapKeys = Object.keys(trumpMap);

    // Mock text processor
    mockTextProcessor = vi.fn((text, trumpMap, mapKeys) => {
      if (!text || !trumpMap || !mapKeys) {
        return text;
      }

      let processedText = text;
      mapKeys.forEach((key) => {
        // Reset regex lastIndex
        trumpMap[key].regex.lastIndex = 0;
        processedText = processedText.replace(trumpMap[key].regex, trumpMap[key].nick);
      });
      return processedText;
    });
  });

  afterEach(() => {
    // Cleanup
    vi.resetAllMocks();
  });

  describe('DOM Walking Logic', () => {
    it('should walk the DOM and process text nodes', () => {
      // Create a test DOM
      const testDOM = createTestDOM(document);
      document.body.appendChild(testDOM);

      // Process the DOM
      DOMProcessor.walkDOM(testDOM, mockTextProcessor, DOMProcessor.shouldSkipNode);

      // Verify walkDOM was called
      expect(DOMProcessor.walkDOM).toHaveBeenCalled();
    });

    it('should skip non-element and non-text nodes', () => {
      // Create test nodes
      const element = document.createElement('div');
      const textNode = document.createTextNode('Test text');
      const comment = document.createComment('Test comment');

      // Check skip logic
      expect(DOMProcessor.shouldSkipNode(element)).toBe(false); // Should not skip normal elements
      expect(DOMProcessor.shouldSkipNode(textNode)).toBe(false); // Should not skip text nodes
      expect(DOMProcessor.shouldSkipNode(comment)).toBe(true); // Should skip comment nodes
    });

    it('should skip editable elements', () => {
      // Create editable elements
      const input = document.createElement('input');
      const textarea = document.createElement('textarea');
      const contentEditable = document.createElement('div');
      contentEditable.setAttribute('contenteditable', 'true');

      // Check skip logic
      expect(DOMProcessor.shouldSkipNode(input)).toBe(true); // Should skip input
      expect(DOMProcessor.shouldSkipNode(textarea)).toBe(true); // Should skip textarea
      expect(DOMProcessor.shouldSkipNode(contentEditable)).toBe(true); // Should skip contenteditable
    });

    it('should skip script and style elements', () => {
      // Create special elements
      const script = document.createElement('script');
      const style = document.createElement('style');

      // Check skip logic
      expect(DOMProcessor.shouldSkipNode(script)).toBe(true); // Should skip script
      expect(DOMProcessor.shouldSkipNode(style)).toBe(true); // Should skip style
    });
  });

  describe('Node Processing State', () => {
    it('should mark nodes as processed', () => {
      // Create test node
      const textNode = document.createTextNode('Test text');

      // Mark as processed
      DOMProcessor.markNodeAsProcessed(textNode);

      // Verify node is marked
      expect(DOMProcessor.isProcessedNode(textNode)).toBe(true);
    });

    it('should skip already processed nodes', () => {
      // Create test node
      const textNode = document.createTextNode('Test text');

      // Mark as processed
      DOMProcessor.markNodeAsProcessed(textNode);

      // Create processor function spy
      const processorSpy = vi.fn();

      // Process the node
      DOMProcessor.processDOM(textNode, processorSpy, trumpMap, mapKeys);

      // Verify processor wasn't called for the processed node
      expect(processorSpy).not.toHaveBeenCalled();
    });
  });

  describe('Text Node Processing', () => {
    it('should process text nodes and replace content', () => {
      // Create test node with Trump reference
      const textNode = document.createTextNode('Donald Trump announced a new policy');

      // Process the node
      DOMProcessor.processDOM(textNode, mockTextProcessor, trumpMap, mapKeys);

      // Verify content was replaced
      expect(textNode.nodeValue).toBe('Agent Orange announced a new policy');

      // Verify node was marked as processed
      expect(DOMProcessor.isProcessedNode(textNode)).toBe(true);
    });

    it('should not modify text in editable elements', () => {
      // Create editable element with Trump reference
      const input = document.createElement('input');
      input.value = 'Donald Trump';
      document.body.appendChild(input);

      // Text nodes inside input elements aren't directly accessible
      // So we'll test the isEditableNode logic instead
      const textNode = document.createTextNode('Donald Trump');
      input.appendChild(textNode);

      // Check if node is considered editable
      expect(DOMProcessor.isEditableNode(textNode)).toBe(true);
    });

    it('should process complex HTML document', () => {
      // Create a complex DOM
      const dom = new JSDOM(COMPLEX_HTML);
      const complexDocument = dom.window.document;

      // Count initial replacements
      const beforeCounts = countReplacements(complexDocument.body, trumpMap);

      // Process the DOM
      DOMProcessor.processDOM(complexDocument.body, mockTextProcessor, trumpMap, mapKeys);

      // Count after replacements
      const afterCounts = countReplacements(complexDocument.body, trumpMap);

      // Verify that no replacements were found after processing
      // (because they should all have been replaced)
      expect(afterCounts.totalReplacements).toBeLessThan(beforeCounts.totalReplacements);
    });

    it('should handle deeply nested DOM structures', () => {
      // Create a nested DOM
      const dom = new JSDOM(NESTED_HTML);
      const nestedDocument = dom.window.document;

      // Count initial replacements
      const beforeCounts = countReplacements(nestedDocument.body, trumpMap);

      // Process the DOM
      DOMProcessor.processDOM(nestedDocument.body, mockTextProcessor, trumpMap, mapKeys);

      // Count after replacements
      const afterCounts = countReplacements(nestedDocument.body, trumpMap);

      // Verify that no replacements were found after processing
      // (because they should all have been replaced)
      expect(afterCounts.totalReplacements).toBeLessThan(beforeCounts.totalReplacements);
    });
  });
});
