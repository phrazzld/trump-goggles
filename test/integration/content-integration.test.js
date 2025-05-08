/**
 * Integration tests for the content script
 *
 * These tests verify the interaction between different components of the content script,
 * including DOM processing, text replacement, and mutation handling.
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { JSDOM } from 'jsdom';
import { createTestTrumpMap, createTestDOM, countReplacements } from '../helpers/test-utils';
import { COMPLEX_HTML, DYNAMIC_HTML } from '../fixtures/html-fixtures';

// Create mock modules for integration testing
const createMockModules = () => {
  // Create Trump mappings
  const trumpMap = createTestTrumpMap();
  const mapKeys = Object.keys(trumpMap);

  // Text processor module
  const TextProcessor = {
    processText: vi.fn((text, trumpMap, mapKeys) => {
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
    }),

    shouldProcessText: vi.fn((text) => {
      if (!text || text.length < 3) {
        return false;
      }

      // Skip processing if the text doesn't contain certain keywords
      const lowerText = text.toLowerCase();
      const keywords = ['trump', 'donald', 'president', 'cnn', 'coffee'];
      return keywords.some((keyword) => lowerText.includes(keyword));
    }),

    getCachedResult: vi.fn((_text) => null),
    setCachedResult: vi.fn((_text, _result) => {}),
    getMetrics: vi.fn(() => ({
      processedNodes: 0,
      totalReplacements: 0,
      cacheHits: 0,
      cacheMisses: 0,
      earlySkips: 0,
    })),
  };

  // DOM processor module
  const DOMProcessor = {
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
        DOMProcessor.walkDOM(child, processingFunction, skipFunction);

        child = next; // Use stored next to avoid issues if the DOM changes
      }
    }),

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

    isEditableNode: vi.fn((node) => {
      if (!node) {
        return false;
      }

      // Check for text node (check parent)
      if (node.nodeType === 3) {
        return node.parentNode ? DOMProcessor.isEditableNode(node.parentNode) : false;
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
        return node.parentNode ? DOMProcessor.isEditableNode(node.parentNode) : false;
      }

      return false;
    }),

    isProcessedNode: vi.fn((node) => {
      return (
        node &&
        (node._trumpProcessed === true || (node.dataset && node.dataset.trumpProcessed === 'true'))
      );
    }),

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
      } catch (_) {
        // Fallback for nodes that don't support dataset
        node._trumpProcessed = true;
      }
    }),

    processDOM: vi.fn((rootNode, textProcessor, trumpMap, mapKeys) => {
      if (!rootNode || !textProcessor || !trumpMap || !mapKeys) {
        return;
      }

      // Create a processing function
      const processTextNode = (textNode) => {
        // Skip if already processed
        if (DOMProcessor.isProcessedNode(textNode)) {
          return;
        }

        // Skip if editable
        if (DOMProcessor.isEditableNode(textNode)) {
          return;
        }

        // Process text
        if (textNode.nodeValue) {
          // Check if should process
          if (!TextProcessor.shouldProcessText(textNode.nodeValue)) {
            return;
          }

          // Check cache
          const cachedResult = TextProcessor.getCachedResult(textNode.nodeValue);
          if (cachedResult !== null) {
            textNode.nodeValue = cachedResult;
            DOMProcessor.markNodeAsProcessed(textNode);
            return;
          }

          // Process text
          const originalText = textNode.nodeValue;
          const processedText = TextProcessor.processText(originalText, trumpMap, mapKeys);

          // Only update if changed
          if (processedText !== originalText) {
            textNode.nodeValue = processedText;
            TextProcessor.setCachedResult(originalText, processedText);
          }

          // Mark as processed
          DOMProcessor.markNodeAsProcessed(textNode);
        }
      };

      // Walk the DOM and process text nodes
      DOMProcessor.walkDOM(rootNode, processTextNode, DOMProcessor.shouldSkipNode);
    }),
  };

  // Mutation handler module
  const MutationHandler = {
    observer: null,
    isActive: false,

    setupMutationObserver: vi.fn((rootNode = document.body) => {
      if (!rootNode) {
        return null;
      }

      // Create observer
      const observer = new MutationObserver((mutations) => {
        MutationHandler.processMutations(mutations);
      });

      // Observe the root node
      observer.observe(rootNode, {
        childList: true,
        subtree: true,
        characterData: true,
      });

      // Store the observer
      MutationHandler.observer = observer;
      MutationHandler.isActive = true;

      return observer;
    }),

    disconnectObserver: vi.fn(() => {
      if (MutationHandler.observer) {
        MutationHandler.observer.disconnect();
        MutationHandler.isActive = false;
      }
    }),

    processMutations: vi.fn((mutations) => {
      if (!mutations || !Array.isArray(mutations)) {
        return;
      }

      mutations.forEach((mutation) => {
        // Process based on mutation type
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          // Process added nodes
          Array.from(mutation.addedNodes).forEach((node) => {
            if (node.nodeType === 1 || node.nodeType === 3) {
              DOMProcessor.processDOM(node, TextProcessor.processText, trumpMap, mapKeys);
            }
          });
        }

        // Process character data changes
        if (mutation.type === 'characterData' && mutation.target.nodeType === 3) {
          if (
            !DOMProcessor.isEditableNode(mutation.target) &&
            !DOMProcessor.isProcessedNode(mutation.target)
          ) {
            DOMProcessor.processDOM(mutation.target, TextProcessor.processText, trumpMap, mapKeys);
          }
        }
      });
    }),
  };

  // ContentScript module - main entry point
  const ContentScript = {
    initialize: vi.fn(() => {
      try {
        // Process the initial DOM
        DOMProcessor.processDOM(document.body, TextProcessor.processText, trumpMap, mapKeys);

        // Set up mutation observer
        MutationHandler.setupMutationObserver(document.body);

        return true;
      } catch (error) {
        console.error('Error initializing content script:', error);
        return false;
      }
    }),

    shutdown: vi.fn(() => {
      try {
        // Disconnect observer
        MutationHandler.disconnectObserver();

        return true;
      } catch (error) {
        console.error('Error shutting down content script:', error);
        return false;
      }
    }),
  };

  return {
    trumpMap,
    mapKeys,
    TextProcessor,
    DOMProcessor,
    MutationHandler,
    ContentScript,
  };
};

describe('Content Script Integration', () => {
  let mockModules;
  let document;

  beforeEach(() => {
    // Create mock modules
    mockModules = createMockModules();

    // Setup JSDOM with a valid URL to avoid opaque origin issues
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
      url: 'https://example.org/',
      referrer: 'https://example.com/',
      contentType: 'text/html',
    });

    document = dom.window.document;
    global.document = document;
    global.window = dom.window;

    // Mock MutationObserver
    const mockObserve = vi.fn();
    const mockDisconnect = vi.fn();
    const mockTakeRecords = vi.fn().mockReturnValue([]);

    const MockObserverClass = vi.fn().mockImplementation((callback) => {
      return {
        observe: mockObserve,
        disconnect: mockDisconnect,
        takeRecords: mockTakeRecords,
        callback: callback, // Store the callback for testing
      };
    });

    global.MutationObserver = MockObserverClass;
  });

  afterEach(() => {
    // Cleanup
    vi.resetAllMocks();
  });

  describe('Initialization Flow', () => {
    it('should initialize the content script and process the DOM', () => {
      // Add test content to document
      const testDOM = createTestDOM(document);
      document.body.appendChild(testDOM);

      // Initialize content script
      const result = mockModules.ContentScript.initialize();

      // Verify initialization
      expect(result).toBe(true);
      expect(mockModules.DOMProcessor.processDOM).toHaveBeenCalledWith(
        document.body,
        mockModules.TextProcessor.processText,
        mockModules.trumpMap,
        mockModules.mapKeys
      );
      expect(mockModules.MutationHandler.setupMutationObserver).toHaveBeenCalledWith(document.body);
    });

    it('should shut down the content script and disconnect observer', () => {
      // Initialize first
      mockModules.ContentScript.initialize();

      // Then shut down
      const result = mockModules.ContentScript.shutdown();

      // Verify shutdown
      expect(result).toBe(true);
      expect(mockModules.MutationHandler.disconnectObserver).toHaveBeenCalled();
    });
  });

  describe('DOM Processing Flow', () => {
    it('should process text nodes in the DOM', () => {
      // Create complex DOM
      const dom = new JSDOM(COMPLEX_HTML);
      const complexDocument = dom.window.document;

      // Count initial replacements
      const beforeCounts = countReplacements(complexDocument.body, mockModules.trumpMap);

      // Process the DOM
      mockModules.DOMProcessor.processDOM(
        complexDocument.body,
        mockModules.TextProcessor.processText,
        mockModules.trumpMap,
        mockModules.mapKeys
      );

      // Verify text processor was called
      expect(mockModules.TextProcessor.processText).toHaveBeenCalled();

      // Count after replacements
      const afterCounts = countReplacements(complexDocument.body, mockModules.trumpMap);

      // Verify replacements were made
      expect(afterCounts.totalReplacements).toBeLessThan(beforeCounts.totalReplacements);
    });

    it('should skip processing of editable elements', () => {
      // Create test content
      const dom = new JSDOM(COMPLEX_HTML);
      const complexDocument = dom.window.document;

      // Find editable elements
      const editableElements = Array.from(
        complexDocument.querySelectorAll('input, textarea, [contenteditable]')
      );
      expect(editableElements.length).toBeGreaterThan(0);

      // Process the DOM
      mockModules.DOMProcessor.processDOM(
        complexDocument.body,
        mockModules.TextProcessor.processText,
        mockModules.trumpMap,
        mockModules.mapKeys
      );

      // Verify editable elements were skipped
      editableElements.forEach((element) => {
        if (element.value && element.value.includes('Trump')) {
          // Input/textarea values should not be changed
          expect(element.value).toContain('Trump');
        } else if (element.textContent && element.textContent.includes('Trump')) {
          // Contenteditable content should not be changed
          expect(element.textContent).toContain('Trump');
        }
      });
    });
  });

  describe('Mutation Handling Flow', () => {
    it('should handle DOM mutations with added nodes', () => {
      // Initialize with empty DOM
      mockModules.ContentScript.initialize();

      // Simulate adding content to the DOM
      const paragraph = document.createElement('p');
      paragraph.textContent = 'Donald Trump announced a new policy';
      document.body.appendChild(paragraph);

      // Create a mock mutation record
      const mutation = {
        type: 'childList',
        target: document.body,
        addedNodes: [paragraph],
        removedNodes: [],
      };

      // Process the mutation
      mockModules.MutationHandler.processMutations([mutation]);

      // Verify DOM processor was called
      expect(mockModules.DOMProcessor.processDOM).toHaveBeenCalledWith(
        paragraph,
        mockModules.TextProcessor.processText,
        mockModules.trumpMap,
        mockModules.mapKeys
      );
    });

    it('should handle DOM mutations with character data changes', () => {
      // Initialize with empty DOM
      mockModules.ContentScript.initialize();

      // Create a text node
      const textNode = document.createTextNode('Initial text');
      document.body.appendChild(textNode);

      // Simulate changing the text
      textNode.nodeValue = 'Donald Trump announced a new policy';

      // Create a mock mutation record
      const mutation = {
        type: 'characterData',
        target: textNode,
        oldValue: 'Initial text',
      };

      // Process the mutation
      mockModules.MutationHandler.processMutations([mutation]);

      // Verify DOM processor was called
      expect(mockModules.DOMProcessor.processDOM).toHaveBeenCalledWith(
        textNode,
        mockModules.TextProcessor.processText,
        mockModules.trumpMap,
        mockModules.mapKeys
      );
    });
  });

  describe('End-to-End Processing', () => {
    it('should process a complete HTML document with dynamic changes', async () => {
      // Create dynamic DOM with a valid URL to avoid opaque origin issues
      const dom = new JSDOM(DYNAMIC_HTML, {
        url: 'https://example.org/',
        referrer: 'https://example.com/',
        contentType: 'text/html',
      });

      // Save references
      const dynamicDocument = dom.window.document;
      const dynamicWindow = dom.window;

      // Setup globals for this test
      const originalDocument = global.document;
      const originalWindow = global.window;
      global.document = dynamicDocument;
      global.window = dynamicWindow;

      try {
        // Initialize content script
        mockModules.ContentScript.initialize();

        // Verify initial processing
        expect(mockModules.DOMProcessor.processDOM).toHaveBeenCalledWith(
          dynamicDocument.body,
          mockModules.TextProcessor.processText,
          mockModules.trumpMap,
          mockModules.mapKeys
        );

        // Reset mock counters
        vi.resetAllMocks();

        // Simulate dynamic content loading
        const container = dynamicDocument.getElementById('dynamic-container');
        const newContent = dynamicDocument.createElement('div');
        newContent.innerHTML = '<p>This is dynamically loaded content mentioning Donald Trump.</p>';
        container.appendChild(newContent);

        // Create a mock mutation record
        const mutation = {
          type: 'childList',
          target: container,
          addedNodes: [newContent],
          removedNodes: [],
        };

        // Process the mutation
        mockModules.MutationHandler.processMutations([mutation]);

        // Verify DOM processor was called with new content
        expect(mockModules.DOMProcessor.processDOM).toHaveBeenCalledWith(
          newContent,
          mockModules.TextProcessor.processText,
          mockModules.trumpMap,
          mockModules.mapKeys
        );
      } finally {
        // Restore original globals
        global.document = originalDocument;
        global.window = originalWindow;
      }
    });
  });
});
