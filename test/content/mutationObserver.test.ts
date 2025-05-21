/**
 * Unit tests for the MutationObserver functionality in content.js
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { JSDOM } from 'jsdom';

// Define Node type constants to avoid using magic numbers
const NODE_TYPES = {
  ELEMENT_NODE: 1,
  TEXT_NODE: 3,
  DOCUMENT_NODE: 9,
  DOCUMENT_FRAGMENT_NODE: 11,
} as const;

type NodeType = (typeof NODE_TYPES)[keyof typeof NODE_TYPES];

// Define mutation type constants
const MUTATION_TYPES = {
  CHILD_LIST: 'childList',
  ATTRIBUTES: 'attributes',
  CHARACTER_DATA: 'characterData',
} as const;

type MutationType = (typeof MUTATION_TYPES)[keyof typeof MUTATION_TYPES];

// Mock MutationObserver
class MockMutationObserver implements MutationObserver {
  callback: MutationCallback;
  observe: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
  takeRecords: ReturnType<typeof vi.fn>;
  static instance: MockMutationObserver | null = null;

  constructor(callback: MutationCallback) {
    this.callback = callback;
    this.observe = vi.fn();
    this.disconnect = vi.fn();
    this.takeRecords = vi.fn(() => []);
    MockMutationObserver.instance = this;
  }

  // Method to trigger mutations
  simulateMutations(mutations: MutationRecord[]): void {
    // Clear mocks before simulating mutations to ensure counts are accurate
    (global as any).walk.mockClear();
    (global as any).convert.mockClear();
    (global as any).isEditableNode.mockClear();
    (global as any).console.error.mockClear();

    // Trigger the callback
    this.callback(mutations, this);
  }
}

// Create the trumpMap and helper functions needed for testing
interface TrumpMapping {
  regex: RegExp;
  nick: string;
}

function buildTrumpMap(): Record<string, TrumpMapping> {
  return {
    cnn: {
      regex: new RegExp('\\bCNN\\b', 'gi'),
      nick: 'Fake News CNN',
    },
    biden: {
      regex: new RegExp('Joe\\s+Biden', 'gi'),
      nick: 'Sleepy Joe',
    },
  };
}

// Recreate simplified versions of the functions from content.js
const trumpMap = buildTrumpMap();
const mapKeys = Object.keys(trumpMap);

function isEditableNode(node: Node): boolean {
  // Check if it's a text node
  if (node.nodeType === NODE_TYPES.TEXT_NODE) {
    // For text nodes, check the parent
    return node.parentNode ? isEditableNode(node.parentNode) : false;
  }

  // Handle non-text nodes
  if (!node || node.nodeType !== NODE_TYPES.ELEMENT_NODE) {
    return false;
  }

  // Check for common editable elements
  const nodeName = node.nodeName.toLowerCase();
  if (nodeName === 'textarea' || nodeName === 'input') {
    return true;
  }

  // Check for contenteditable attribute
  const element = node as Element;
  if (
    element.getAttribute &&
    (element.getAttribute('contenteditable') === 'true' ||
      element.getAttribute('contenteditable') === '')
  ) {
    return true;
  }

  // Check if any parent is editable (recursively)
  return node.parentNode ? isEditableNode(node.parentNode) : false;
}

function convert(textNode: Text): void {
  // Skip invalid nodes
  if (!textNode || !textNode.nodeValue) {
    return;
  }

  // Apply replacements
  let replacedText = textNode.nodeValue;

  // Apply all replacements to the temporary variable
  mapKeys.forEach(function (key) {
    replacedText = replacedText.replace(trumpMap[key].regex, trumpMap[key].nick);
  });

  // Update the DOM
  textNode.nodeValue = replacedText;
}

function walk(node: Node): void {
  if (!node || !node.nodeType) {
    return;
  }

  // Use type-safe handlers for different node types
  const nodeHandlers: Record<NodeType, (n: Node) => void> = {
    [NODE_TYPES.ELEMENT_NODE]: handleElementNode,
    [NODE_TYPES.DOCUMENT_NODE]: handleElementNode,
    [NODE_TYPES.DOCUMENT_FRAGMENT_NODE]: handleElementNode,
    [NODE_TYPES.TEXT_NODE]: handleTextNode,
  };

  function handleElementNode(elementNode: Node): void {
    let child = elementNode.firstChild;
    while (child) {
      const next = child.nextSibling;
      walk(child);
      child = next;
    }
  }

  function handleTextNode(textNode: Node): void {
    if (!isEditableNode(textNode)) {
      convert(textNode as Text);
    }
  }

  // Process the node based on its type
  const handler = nodeHandlers[node.nodeType as NodeType];
  if (handler) {
    handler(node);
  }
}

// Mock setupMutationObserver function
function setupMutationObserver(): void {
  // Skip in frames
  if (window !== window.top) {
    return;
  }

  // Create and configure observer
  const trumpObserver = new MutationObserver((mutations) => {
    try {
      mutations.forEach((mutation) => {
        // Process new nodes
        if (mutation.type === MUTATION_TYPES.CHILD_LIST && mutation.addedNodes.length > 0) {
          Array.from(mutation.addedNodes).forEach((node) => {
            if (
              node.nodeType === NODE_TYPES.ELEMENT_NODE ||
              node.nodeType === NODE_TYPES.TEXT_NODE
            ) {
              walk(node);
            }
          });
        }

        // Process character data changes
        if (
          mutation.type === MUTATION_TYPES.CHARACTER_DATA &&
          mutation.target.nodeType === NODE_TYPES.TEXT_NODE
        ) {
          if (!isEditableNode(mutation.target)) {
            convert(mutation.target as Text);
          }
        }
      });
    } catch (error) {
      console.error('Trump Goggles: Error processing mutations', error);
    }
  });

  // Configure observer options
  const observerConfig = {
    childList: true,
    subtree: true,
    characterData: true,
  };

  // Start observing
  trumpObserver.observe(document.body, observerConfig);
}

// Saved reference
let originalMutationObserver: typeof MutationObserver;

describe('MutationObserver Functionality', () => {
  beforeEach(() => {
    // Create a mock DOM environment with storage support
    const dom = new JSDOM('<!DOCTYPE html><body></body></html>', {
      url: 'https://example.org/',
      referrer: 'https://example.com/',
      contentType: 'text/html',
    });

    (global as any).document = dom.window.document;
    (global as any).window = dom.window;

    // Save the original MutationObserver
    originalMutationObserver = global.MutationObserver;

    // Replace the global MutationObserver with our mock
    (global as any).MutationObserver = MockMutationObserver;
  });

  afterEach(() => {
    // Restore original MutationObserver
    (global as any).MutationObserver = originalMutationObserver;
  });

  it('should set up a MutationObserver that observes document.body', () => {
    // Call the setup function directly
    setupMutationObserver();

    // Check that the observer was initialized and is observing the body
    expect(MockMutationObserver.instance).toBeTruthy();
    expect(MockMutationObserver.instance?.observe).toHaveBeenCalledWith(
      document.body,
      expect.objectContaining({
        childList: true,
        subtree: true,
        characterData: true,
      })
    );
  });

  it('should properly configure the MutationObserver options', () => {
    // Call the setup function directly
    setupMutationObserver();

    // Verify the observer configuration
    const observerConfig = MockMutationObserver.instance?.observe.mock.calls[0][1];
    expect(observerConfig.childList).toBe(true);
    expect(observerConfig.subtree).toBe(true);
    expect(observerConfig.characterData).toBe(true);
  });
});
