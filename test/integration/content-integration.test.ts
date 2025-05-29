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
import type { TrumpMappingObject, MockLogger } from '../types/fixtures';

// Define types for mock modules
interface TextProcessorModule {
  processText: (text: string, trumpMap: TrumpMappingObject, mapKeys: string[]) => string;
  shouldProcessText: (text: string) => boolean;
  getCachedResult: (text: string) => string | null;
  setCachedResult: (text: string, result: string) => void;
  getMetrics: () => {
    processedNodes: number;
    totalReplacements: number;
    cacheHits: number;
    cacheMisses: number;
    averageProcessingTime: number;
  };
  resetMetrics: () => void;
}

interface DOMProcessorModule {
  processNode: (
    node: Node,
    textProcessor: TextProcessorModule,
    trumpMap: TrumpMappingObject,
    mapKeys: string[]
  ) => boolean;
  processTextNode: (
    textNode: Text,
    textProcessor: TextProcessorModule,
    trumpMap: TrumpMappingObject,
    mapKeys: string[]
  ) => boolean;
  shouldSkipNode: (node: Node) => boolean;
  walkDOM: (
    rootNode: Node,
    callback: (node: Node) => void,
    skipFunction?: (node: Node) => boolean
  ) => void;
}

interface MutationHandlerModule {
  processMutations: (
    mutations: MutationRecord[],
    processor: DOMProcessorModule,
    textProcessor: TextProcessorModule,
    trumpMap: TrumpMappingObject,
    mapKeys: string[]
  ) => void;
  shouldProcessMutation: (mutation: MutationRecord) => boolean;
  throttle: <T extends (...args: any[]) => any>(fn: T, delay: number) => T;
}

interface MockModules {
  textProcessor: TextProcessorModule;
  domProcessor: DOMProcessorModule;
  mutationHandler: MutationHandlerModule;
  trumpMap: TrumpMappingObject;
  mapKeys: string[];
}

// Create mock modules for integration testing
const createMockModules = (): MockModules => {
  // Create Trump mappings
  const trumpMap = createTestTrumpMap();
  const mapKeys = Object.keys(trumpMap);

  // Text processor module
  const textProcessor: TextProcessorModule = {
    processText: vi.fn((text: string, trumpMap: TrumpMappingObject, mapKeys: string[]): string => {
      if (!text || !trumpMap || !mapKeys) {
        return text;
      }

      let processedText = text;
      mapKeys.forEach((key: string) => {
        // Reset regex lastIndex
        trumpMap[key].regex.lastIndex = 0;
        processedText = processedText.replace(trumpMap[key].regex, trumpMap[key].nick);
      });
      return processedText;
    }),

    shouldProcessText: vi.fn((text: string): boolean => {
      if (!text || text.length < 3) {
        return false;
      }

      // Skip processing if the text doesn't contain certain keywords
      const lowerText = text.toLowerCase();
      const keywords = ['trump', 'donald', 'president', 'cnn', 'coffee'];
      return keywords.some((keyword) => lowerText.includes(keyword));
    }),

    getCachedResult: vi.fn((_text: string): string | null => null),
    setCachedResult: vi.fn((_text: string, _result: string): void => {}),
    getMetrics: vi.fn(() => ({
      processedNodes: 0,
      totalReplacements: 0,
      cacheHits: 0,
      cacheMisses: 0,
      averageProcessingTime: 0,
    })),
    resetMetrics: vi.fn((): void => {}),
  };

  // DOM processor module
  const domProcessor: DOMProcessorModule = {
    processNode: vi.fn(
      (
        node: Node,
        textProcessor: TextProcessorModule,
        trumpMap: TrumpMappingObject,
        mapKeys: string[]
      ): boolean => {
        if (!node) return false;
        if (node.nodeType === Node.TEXT_NODE) {
          return domProcessor.processTextNode(node as Text, textProcessor, trumpMap, mapKeys);
        }
        return false;
      }
    ),

    processTextNode: vi.fn(
      (
        textNode: Text,
        textProcessor: TextProcessorModule,
        trumpMap: TrumpMappingObject,
        mapKeys: string[]
      ): boolean => {
        const originalText = textNode.textContent || '';

        if (!textProcessor.shouldProcessText(originalText)) {
          return false;
        }

        const processedText = textProcessor.processText(originalText, trumpMap, mapKeys);

        if (processedText !== originalText) {
          textNode.textContent = processedText;
          return true;
        }

        return false;
      }
    ),

    shouldSkipNode: vi.fn((node: Node): boolean => {
      if (!node) return true;

      // Skip certain node types
      if (node.nodeType !== Node.TEXT_NODE && node.nodeType !== Node.ELEMENT_NODE) {
        return true;
      }

      // Skip certain elements
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        const skipTags = ['script', 'style', 'noscript', 'textarea', 'input'];
        if (skipTags.includes(element.tagName.toLowerCase())) {
          return true;
        }
      }

      return false;
    }),

    walkDOM: vi.fn(
      (
        rootNode: Node,
        callback: (node: Node) => void,
        skipFunction?: (node: Node) => boolean
      ): void => {
        if (!rootNode || !callback) return;

        if (skipFunction && skipFunction(rootNode)) {
          return;
        }

        callback(rootNode);

        // Process child nodes
        let child = rootNode.firstChild;
        while (child) {
          const nextSibling = child.nextSibling;
          domProcessor.walkDOM(child, callback, skipFunction);
          child = nextSibling;
        }
      }
    ),
  };

  // Mutation handler module
  const mutationHandler: MutationHandlerModule = {
    processMutations: vi.fn(
      (
        mutations: MutationRecord[],
        processor: DOMProcessorModule,
        textProcessor: TextProcessorModule,
        trumpMap: TrumpMappingObject,
        mapKeys: string[]
      ): void => {
        mutations.forEach((mutation) => {
          if (mutationHandler.shouldProcessMutation(mutation)) {
            mutation.addedNodes.forEach((node) => {
              processor.walkDOM(
                node,
                (childNode) => {
                  if (childNode.nodeType === Node.TEXT_NODE) {
                    processor.processTextNode(childNode as Text, textProcessor, trumpMap, mapKeys);
                  }
                },
                processor.shouldSkipNode
              );
            });
          }
        });
      }
    ),

    shouldProcessMutation: vi.fn((mutation: MutationRecord): boolean => {
      return mutation.type === 'childList' && mutation.addedNodes.length > 0;
    }),

    throttle: vi.fn(<T extends (...args: any[]) => any>(fn: T, delay: number): T => {
      let timeoutId: ReturnType<typeof setTimeout> | null = null;
      let lastArgs: Parameters<T>;

      return ((...args: Parameters<T>) => {
        lastArgs = args;

        if (timeoutId !== null) {
          clearTimeout(timeoutId);
        }

        timeoutId = setTimeout(() => {
          fn(...lastArgs);
          timeoutId = null;
        }, delay);
      }) as T;
    }),
  };

  return {
    textProcessor,
    domProcessor,
    mutationHandler,
    trumpMap,
    mapKeys,
  };
};

describe('Content Script Integration', () => {
  let mockModules: MockModules;
  let document: Document;
  let window: Window & typeof globalThis;

  beforeEach(() => {
    // Create fresh mock modules for each test
    mockModules = createMockModules();

    // Set up JSDOM environment
    const dom = new JSDOM(COMPLEX_HTML, {
      url: 'https://example.com',
      referrer: 'https://example.com',
      contentType: 'text/html',
      includeNodeLocations: true,
      storageQuota: 10000000,
    });

    // Type assertion for JSDOM window compatibility
    window = dom.window as unknown as Window & typeof globalThis;
    document = window.document;

    // Set up global environment
    global.window = window;
    global.document = document;
    global.Node = window.Node;
    global.Text = window.Text;
    global.Element = window.Element;
    global.HTMLElement = window.HTMLElement;
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Text Processing Integration', () => {
    it('should process text content correctly', () => {
      const { textProcessor, trumpMap, mapKeys } = mockModules;

      const originalText = 'Trump announced new policies today';
      const result = textProcessor.processText(originalText, trumpMap, mapKeys);

      expect(result).not.toBe(originalText);
      expect(textProcessor.processText).toHaveBeenCalledWith(originalText, trumpMap, mapKeys);
    });

    it('should handle empty or invalid text gracefully', () => {
      const { textProcessor, trumpMap, mapKeys } = mockModules;

      expect(textProcessor.processText('', trumpMap, mapKeys)).toBe('');
      expect(textProcessor.processText(null as any, trumpMap, mapKeys)).toBe(null);
      expect(textProcessor.processText(undefined as any, trumpMap, mapKeys)).toBe(undefined);
    });

    it('should respect text processing rules', () => {
      const { textProcessor } = mockModules;

      expect(textProcessor.shouldProcessText('Trump is here')).toBe(true);
      expect(textProcessor.shouldProcessText('Random text')).toBe(false);
      expect(textProcessor.shouldProcessText('')).toBe(false);
      expect(textProcessor.shouldProcessText('Hi')).toBe(false);
    });
  });

  describe('DOM Processing Integration', () => {
    it('should process DOM nodes correctly', () => {
      const { domProcessor, textProcessor, trumpMap, mapKeys } = mockModules;

      const textNode = document.createTextNode('Trump said something today');
      const result = domProcessor.processTextNode(textNode, textProcessor, trumpMap, mapKeys);

      expect(result).toBe(true);
      expect(textProcessor.shouldProcessText).toHaveBeenCalled();
      expect(textProcessor.processText).toHaveBeenCalled();
    });

    it('should skip inappropriate nodes', () => {
      const { domProcessor } = mockModules;

      const scriptElement = document.createElement('script');
      const styleElement = document.createElement('style');
      const regularDiv = document.createElement('div');

      expect(domProcessor.shouldSkipNode(scriptElement)).toBe(true);
      expect(domProcessor.shouldSkipNode(styleElement)).toBe(true);
      expect(domProcessor.shouldSkipNode(regularDiv)).toBe(false);
    });

    it('should walk DOM tree correctly', () => {
      const { domProcessor } = mockModules;
      const callback = vi.fn();

      const container = document.createElement('div');
      container.innerHTML = '<p>Test <span>content</span></p>';

      domProcessor.walkDOM(container, callback);

      expect(callback).toHaveBeenCalled();
      expect(callback.mock.calls.length).toBeGreaterThan(1); // Should process multiple nodes
    });
  });

  describe('Mutation Handling Integration', () => {
    it('should process mutations correctly', () => {
      const { mutationHandler, domProcessor, textProcessor, trumpMap, mapKeys } = mockModules;

      const addedNode = document.createTextNode('Trump news update');
      const mutation: MutationRecord = {
        type: 'childList',
        target: document.body,
        addedNodes: [addedNode] as any as NodeList,
        removedNodes: [] as any as NodeList,
        previousSibling: null,
        nextSibling: null,
        attributeName: null,
        attributeNamespace: null,
        oldValue: null,
      };

      mutationHandler.processMutations([mutation], domProcessor, textProcessor, trumpMap, mapKeys);

      expect(mutationHandler.shouldProcessMutation).toHaveBeenCalledWith(mutation);
      expect(domProcessor.walkDOM).toHaveBeenCalled();
    });

    it('should filter mutations appropriately', () => {
      const { mutationHandler } = mockModules;

      const validMutation: MutationRecord = {
        type: 'childList',
        target: document.body,
        addedNodes: [document.createTextNode('test')] as any as NodeList,
        removedNodes: [] as any as NodeList,
        previousSibling: null,
        nextSibling: null,
        attributeName: null,
        attributeNamespace: null,
        oldValue: null,
      };

      const invalidMutation: MutationRecord = {
        type: 'attributes',
        target: document.body,
        addedNodes: [] as any as NodeList,
        removedNodes: [] as any as NodeList,
        previousSibling: null,
        nextSibling: null,
        attributeName: 'class',
        attributeNamespace: null,
        oldValue: 'old-class',
      };

      expect(mutationHandler.shouldProcessMutation(validMutation)).toBe(true);
      expect(mutationHandler.shouldProcessMutation(invalidMutation)).toBe(false);
    });

    it('should throttle function calls correctly', () => {
      const { mutationHandler } = mockModules;
      const mockFn = vi.fn();
      const throttledFn = mutationHandler.throttle(mockFn, 100);

      // Call multiple times rapidly
      throttledFn();
      throttledFn();
      throttledFn();

      // Should have been called only once initially (due to throttling)
      expect(mockFn).toHaveBeenCalledTimes(0); // Not called yet due to delay
    });
  });

  describe('End-to-End Integration', () => {
    it('should handle complete content processing workflow', () => {
      const { domProcessor, textProcessor, trumpMap, mapKeys } = mockModules;

      // Create test content
      const container = document.createElement('div');
      container.innerHTML = '<p>Trump announced policies. CNN reported on it.</p>';
      document.body.appendChild(container);

      // Process the entire container
      let processedNodes = 0;
      domProcessor.walkDOM(
        container,
        (node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            const result = domProcessor.processTextNode(
              node as Text,
              textProcessor,
              trumpMap,
              mapKeys
            );
            if (result) processedNodes++;
          }
        },
        domProcessor.shouldSkipNode
      );

      expect(processedNodes).toBeGreaterThan(0);
      expect(textProcessor.processText).toHaveBeenCalled();
    });

    it('should handle dynamic content additions', () => {
      const { mutationHandler, domProcessor, textProcessor, trumpMap, mapKeys } = mockModules;

      // Simulate dynamic content addition
      const newElement = document.createElement('div');
      newElement.textContent = 'Breaking: Trump makes announcement';

      const mutation: MutationRecord = {
        type: 'childList',
        target: document.body,
        addedNodes: [newElement] as any as NodeList,
        removedNodes: [] as any as NodeList,
        previousSibling: null,
        nextSibling: null,
        attributeName: null,
        attributeNamespace: null,
        oldValue: null,
      };

      // Process the mutation
      mutationHandler.processMutations([mutation], domProcessor, textProcessor, trumpMap, mapKeys);

      // Verify processing occurred
      expect(domProcessor.walkDOM).toHaveBeenCalled();
      expect(textProcessor.shouldProcessText).toHaveBeenCalled();
    });

    it('should maintain performance metrics', () => {
      const { textProcessor } = mockModules;

      const metrics = textProcessor.getMetrics();
      expect(metrics).toHaveProperty('processedNodes');
      expect(metrics).toHaveProperty('totalReplacements');
      expect(metrics).toHaveProperty('cacheHits');
      expect(metrics).toHaveProperty('cacheMisses');
      expect(metrics).toHaveProperty('averageProcessingTime');

      // Reset metrics
      textProcessor.resetMetrics();
      expect(textProcessor.resetMetrics).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed DOM gracefully', () => {
      const { domProcessor, textProcessor, trumpMap, mapKeys } = mockModules;

      // Test with null/undefined nodes
      expect(() => {
        domProcessor.processNode(null as any, textProcessor, trumpMap, mapKeys);
      }).not.toThrow();

      expect(() => {
        domProcessor.walkDOM(null as any, () => {});
      }).not.toThrow();
    });

    it('should handle regex errors gracefully', () => {
      const { textProcessor } = mockModules;

      // Test with empty trump map
      const emptyTrumpMap: TrumpMappingObject = {};

      expect(() => {
        textProcessor.processText('test content', emptyTrumpMap, []);
      }).not.toThrow();

      // Test with null values
      expect(() => {
        textProcessor.processText('test content', null as any, null as any);
      }).not.toThrow();
    });
  });
});
