/**
 * Test utilities and helpers for Trump Goggles
 * This module provides common test functions to simplify test writing
 */
import { JSDOM } from 'jsdom';
import { vi } from 'vitest';
import type { MockLogger } from '../types/mocks';

// Define missing mutation record type
type MutationRecordType = 'childList' | 'attributes' | 'characterData';

/**
 * Creates a mock document with the specified HTML
 *
 * @param html - HTML content to use for the document
 * @param options - JSDOM options
 * @returns Mock window and document objects
 */
export function createMockDocument(
  html = '<html><body></body></html>',
  options: any = {}
): { window: Window & typeof globalThis; document: Document } {
  const dom = new JSDOM(html, {
    url: 'https://example.org/',
    referrer: 'https://example.com/',
    contentType: 'text/html',
    ...options,
  });

  return {
    window: dom.window as unknown as Window & typeof globalThis,
    document: dom.window.document,
  };
}

/**
 * Creates a DOM tree for testing text replacement
 *
 * @param document - Document to create elements in
 * @returns Root element containing the test DOM structure
 */
export function createTestDOM(document: Document): HTMLElement {
  const root = document.createElement('div');
  root.id = 'test-root';

  // Create a simple article with various types of content
  const article = document.createElement('article');

  // Add a heading
  const heading = document.createElement('h1');
  heading.textContent = 'Donald Trump announced new policy';
  article.appendChild(heading);

  // Add paragraphs with various Trump references
  const p1 = document.createElement('p');
  p1.textContent = 'President Trump stated that this would be the best policy ever created.';
  article.appendChild(p1);

  const p2 = document.createElement('p');
  p2.textContent = 'Critics of Trump argue that the plan lacks concrete details.';
  article.appendChild(p2);

  // Add a list
  const list = document.createElement('ul');

  const li1 = document.createElement('li');
  li1.textContent = 'Trump International Hotel opened a new location';
  list.appendChild(li1);

  const li2 = document.createElement('li');
  li2.textContent = 'The Trump administration announced new regulations';
  list.appendChild(li2);

  article.appendChild(list);

  // Add a form element that should NOT be processed
  const form = document.createElement('form');

  const input = document.createElement('input');
  input.type = 'text';
  input.value = 'Donald Trump';
  form.appendChild(input);

  const textarea = document.createElement('textarea');
  textarea.value = 'Text about Trump that should not be replaced';
  form.appendChild(textarea);

  article.appendChild(form);

  // Add a contenteditable div
  const editableDiv = document.createElement('div');
  editableDiv.setAttribute('contenteditable', 'true');
  editableDiv.textContent = 'Donald Trump editable content';
  article.appendChild(editableDiv);

  // Add the article to root
  root.appendChild(article);

  return root;
}

/**
 * Creates a test text node with Trump references
 *
 * @param text - Text content for the node (default includes Trump references)
 * @param document - Document to create the text node in
 * @returns Text node
 */
export function createTestTextNode(
  text = 'Donald Trump announced that Trump will make America great again',
  document: Document
): Text {
  return document.createTextNode(text);
}

/**
 * Creates a trumpMap object for testing
 *
 * @returns A simplified trumpMap object with a few key mappings
 */
export function createTestTrumpMap(): { [key: string]: { regex: RegExp; nick: string } } {
  return {
    trump: {
      regex: new RegExp('\\b(Donald\\s+Trump|Trump|President\\s+Trump)\\b', 'gi'),
      nick: 'Agent Orange',
    },
    hillary: {
      regex: new RegExp('(Hillary Clinton)|(Hillary Rodham Clinton)|(Mrs\\. Clinton)', 'gi'),
      nick: 'Crooked Hillary',
    },
    cnn: {
      regex: new RegExp('\\bCNN\\b', 'gi'),
      nick: 'Fake News CNN',
    },
    coffee: {
      regex: new RegExp('(coffee)|(Coffee)', 'gi'),
      nick: 'covfefe',
    },
  };
}

/**
 * Creates a mock mutation record for testing MutationObserver
 *
 * @param type - The type of mutation ('childList' or 'characterData')
 * @param target - The mutation target
 * @param addedNodes - Nodes added by the mutation (for childList)
 * @param removedNodes - Nodes removed by the mutation (for childList)
 * @param oldValue - Previous value (for characterData)
 * @returns Mock MutationRecord
 */
export function createMockMutation(
  type: MutationRecordType,
  target: Node,
  addedNodes: Node | Node[] = [],
  removedNodes: Node | Node[] = [],
  oldValue: string | null = null
): MutationRecord {
  // Create NodeList-like objects with proper length and item() method
  const createNodeListLike = (nodes: Node[]): NodeList => {
    const nodeArray = [...nodes];
    const nodeListLike = {
      length: nodeArray.length,
      item: (index: number) => nodeArray[index] || null,
      [Symbol.iterator]: function* () {
        for (let i = 0; i < nodeArray.length; i++) {
          yield nodeArray[i];
        }
      },
    };

    // Add indexed properties
    nodeArray.forEach((node, index) => {
      Object.defineProperty(nodeListLike, index, {
        value: node,
        enumerable: true,
      });
    });

    return nodeListLike as unknown as NodeList;
  };

  // Process added and removed nodes
  const processedAddedNodes = Array.isArray(addedNodes)
    ? createNodeListLike(addedNodes)
    : createNodeListLike([addedNodes].filter(Boolean) as Node[]);

  const processedRemovedNodes = Array.isArray(removedNodes)
    ? createNodeListLike(removedNodes)
    : createNodeListLike([removedNodes].filter(Boolean) as Node[]);

  return {
    type,
    target,
    addedNodes: processedAddedNodes,
    removedNodes: processedRemovedNodes,
    oldValue,
    attributeName: null,
    attributeNamespace: null,
    nextSibling: null,
    previousSibling: null,
  } as MutationRecord;
}

/**
 * Creates a simulated MutationObserver for testing
 *
 * @param callback - Function to call with mutations
 * @returns Mock MutationObserver with helper methods
 */
export function createMockMutationObserver(callback: MutationCallback): MutationObserver & {
  simulateMutations: (mutations: MutationRecord[]) => void;
} {
  const mockObserver = {
    callback,
    observe: vi.fn(),
    disconnect: vi.fn(),
    takeRecords: vi.fn(() => []),

    // Helper to simulate mutations
    simulateMutations: (mutations: MutationRecord[]) => {
      if (typeof callback === 'function') {
        callback(mutations, mockObserver);
      }
    },
  };

  return mockObserver as MutationObserver & {
    simulateMutations: (mutations: MutationRecord[]) => void;
  };
}

/**
 * Waits for any pending DOM updates to complete
 *
 * @param ms - Milliseconds to wait
 * @returns Promise that resolves after the timeout
 */
export function waitForDomUpdates(ms = 0): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Creates a mock element with the specified attributes and content
 *
 * @param document - Document to create the element in
 * @param tagName - Type of element to create
 * @param attributes - Attributes to set on the element
 * @param content - Content to add to the element
 * @returns The created element
 */
export function createElement(
  document: Document,
  tagName: string,
  attributes: Record<string, string | boolean | number | null | undefined> = {},
  content: string | Array<string | Node> | Node = ''
): HTMLElement {
  const element = document.createElement(tagName);

  // Set attributes
  Object.entries(attributes).forEach(([key, value]) => {
    if (value === true) {
      element.setAttribute(key, '');
    } else if (value !== false && value !== null && value !== undefined) {
      element.setAttribute(key, String(value));
    }
  });

  // Add content
  if (typeof content === 'string') {
    element.textContent = content;
  } else if (Array.isArray(content)) {
    content.forEach((child) => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else if (child instanceof Node) {
        element.appendChild(child);
      }
    });
  } else if (content instanceof Node) {
    element.appendChild(content);
  }

  return element;
}

/**
 * Simulates a DOM mutation by adding nodes to a parent
 *
 * @param parent - Parent node to add to
 * @param nodes - Nodes to add
 * @returns Added nodes
 */
export function simulateAddedNodes(parent: Node, nodes: Node | Node[]): Node[] {
  const nodeArray = Array.isArray(nodes) ? nodes : [nodes];

  nodeArray.forEach((node) => {
    parent.appendChild(node);
  });

  return nodeArray;
}

/**
 * Tests if a node has been processed (marked to avoid reprocessing)
 *
 * @param node - Node to check
 * @returns Whether the node has been marked as processed
 */
export function isNodeProcessed(node: Node): boolean {
  if (!node) return false;

  // Check for the _trumpProcessed property
  const hasInternalFlag = (node as any)._trumpProcessed;
  if (hasInternalFlag === true) return true;

  // Check for the dataset property
  if ('dataset' in node) {
    const htmlNode = node as HTMLElement;
    return htmlNode.dataset.trumpProcessed === 'true';
  }

  return false;
}

/**
 * Helper to compare text content across all text nodes in a subtree
 *
 * @param root - Root node to check
 * @param trumpMap - The replacement mapping to use
 * @returns Stats about replacements
 */
export function countReplacements(
  root: Node,
  trumpMap = createTestTrumpMap()
): {
  textNodesChecked: number;
  nodesWithReplacements: number;
  totalReplacements: number;
  replacementsByKey: Record<string, number>;
} {
  let textNodesChecked = 0;
  let nodesWithReplacements = 0;
  let totalReplacements = 0;
  const replacementsByKey: Record<string, number> = {};

  // Initialize counts for each trumpMap key
  Object.keys(trumpMap).forEach((key) => {
    replacementsByKey[key] = 0;
  });

  // Recursive function to check text nodes
  function checkNode(node: Node | null): void {
    if (!node) return;

    if (node.nodeType === 3) {
      // Text node
      textNodesChecked++;
      let hadReplacement = false;
      const text = node.nodeValue || '';

      // Check for each replacement
      Object.entries(trumpMap).forEach(([key, mapping]) => {
        // Reset regex lastIndex
        mapping.regex.lastIndex = 0;

        // Count matches
        const matches = text.match(mapping.regex);
        if (matches && matches.length > 0) {
          replacementsByKey[key] += matches.length;
          totalReplacements += matches.length;
          hadReplacement = true;
        }
      });

      if (hadReplacement) {
        nodesWithReplacements++;
      }
    } else if (node.nodeType === 1) {
      // Element node
      // Process child nodes
      Array.from(node.childNodes).forEach(checkNode);
    }
  }

  checkNode(root);

  return {
    textNodesChecked,
    nodesWithReplacements,
    totalReplacements,
    replacementsByKey,
  };
}

/**
 * Creates a test logger that captures log messages
 *
 * @returns Test logger with captured messages
 */
export function createTestLogger(): MockLogger {
  const messages: {
    debug: Array<{ msg: string; data?: any }>;
    info: Array<{ msg: string; data?: any }>;
    warn: Array<{ msg: string; data?: any }>;
    error: Array<{ msg: string; data?: any }>;
  } = {
    debug: [],
    info: [],
    warn: [],
    error: [],
  };

  // Stats for logger
  const stats = {
    counts: {
      debug: 0,
      info: 0,
      warn: 0,
      error: 0,
    },
    lastError: null as string | null,
    lastErrorTime: null as Date | null,
  };

  const logger = {
    // Core logging methods
    debug: vi.fn((msg: string, data?: any) => {
      messages.debug.push({ msg, data });
      stats.counts.debug++;
    }),
    info: vi.fn((msg: string, data?: any) => {
      messages.info.push({ msg, data });
      stats.counts.info++;
    }),
    warn: vi.fn((msg: string, data?: any) => {
      messages.warn.push({ msg, data });
      stats.counts.warn++;
    }),
    error: vi.fn((msg: string, data?: any) => {
      messages.error.push({ msg, data });
      stats.counts.error++;
      stats.lastError = msg;
      stats.lastErrorTime = new Date();
    }),

    // Configuration methods
    configure: vi.fn((options?: any) => options),
    enableDebugMode: vi.fn(),
    disableDebugMode: vi.fn(),

    // Error protection methods
    protect: vi.fn(
      <T, R>(fn: (...args: T[]) => R, context: string, fallback?: R) =>
        (...args: T[]): R => {
          try {
            return fn(...args);
          } catch (e) {
            logger.error(`Error in ${context}: ${(e as Error).message}`);
            return fallback as R;
          }
        }
    ),
    protectAsync: vi.fn(
      <T, R>(fn: (...args: T[]) => Promise<R>, context: string, fallback?: R) =>
        async (...args: T[]): Promise<R> => {
          try {
            return await fn(...args);
          } catch (e) {
            logger.error(`Error in ${context}: ${(e as Error).message}`);
            return fallback as R;
          }
        }
    ),

    // Performance monitoring
    time: vi.fn((operationName: string) => {
      const start = Date.now();
      return {
        stop: (status?: string, additionalData?: object) => {
          const duration = Date.now() - start;
          logger.debug(`Operation ${operationName} took ${duration}ms`, {
            status,
            duration,
            ...additionalData,
          });
          return duration;
        },
      };
    }),

    // Statistics
    getStats: vi.fn(() => ({ ...stats })),
    resetStats: vi.fn(() => {
      stats.counts.debug = 0;
      stats.counts.info = 0;
      stats.counts.warn = 0;
      stats.counts.error = 0;
      stats.lastError = null;
      stats.lastErrorTime = null;
    }),

    // Constants
    LEVELS: {
      DEBUG: 'debug',
      INFO: 'info',
      WARN: 'warn',
      ERROR: 'error',
    },

    // Test helper methods
    getMessages: vi.fn(() => ({ ...messages })),
    clear: vi.fn(() => {
      Object.keys(messages).forEach((key) => {
        messages[key as keyof typeof messages] = [];
      });
      logger.resetStats();
    }),
  };

  return logger;
}

/**
 * Creates a test error handler
 *
 * @returns Test error handler with captured errors
 */
export function createTestErrorHandler(): {
  handleError: ReturnType<typeof vi.fn>;
  getErrors: () => Array<{ error: any; context?: string }>;
  clear: () => void;
} {
  const errors: Array<{ error: any; context?: string }> = [];

  const errorHandler = {
    handleError: vi.fn((error: any, context?: string) => {
      errors.push({ error, context });
    }),

    // Helper to get captured errors
    getErrors: () => [...errors],

    // Helper to clear captured errors
    clear: () => {
      errors.length = 0;
    },
  };

  return errorHandler;
}
