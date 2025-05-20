/**
 * Unit tests for the MutationObserver functionality in content.js
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { JSDOM } from 'jsdom';

// Mock MutationObserver
class MockMutationObserver {
  constructor(callback) {
    this.callback = callback;
    this.observe = vi.fn();
    this.disconnect = vi.fn();
    MockMutationObserver.instance = this;
  }

  // Method to trigger mutations
  simulateMutations(mutations) {
    // Clear mocks before simulating mutations to ensure counts are accurate
    global.walk.mockClear();
    global.convert.mockClear();
    global.isEditableNode.mockClear();
    global.console.error.mockClear();

    // Trigger the callback
    this.callback(mutations, this);
  }

  static instance = null;
}

// Create the trumpMap and helper functions needed for testing
function buildTrumpMap() {
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

function isEditableNode(node) {
  // Check if it's a text node
  if (node.nodeType === 3) {
    // For text nodes, check the parent
    return node.parentNode ? isEditableNode(node.parentNode) : false;
  }

  // Handle non-text nodes
  if (!node || node.nodeType !== 1) {
    return false;
  }

  // Check for common editable elements
  const nodeName = node.nodeName.toLowerCase();
  if (nodeName === 'textarea' || nodeName === 'input') {
    return true;
  }

  // Check for contenteditable attribute
  if (
    node.getAttribute &&
    (node.getAttribute('contenteditable') === 'true' || node.getAttribute('contenteditable') === '')
  ) {
    return true;
  }

  // Check if any parent is editable (recursively)
  return node.parentNode ? isEditableNode(node.parentNode) : false;
}

function convert(textNode) {
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

function walk(node) {
  if (!node || !node.nodeType) {
    return;
  }

  switch (node.nodeType) {
  case 1: // Element
  case 9: // Document
  case 11: // Document fragment
    let child = node.firstChild;
    while (child) {
      const next = child.nextSibling;
      walk(child);
      child = next;
    }
    break;
  case 3: // Text node
    if (!isEditableNode(node)) {
      convert(node);
    }
    break;
  }
}

// Mock setupMutationObserver function
function setupMutationObserver() {
  // Skip in frames
  if (window !== window.top) {
    return;
  }

  // Create and configure observer
  const trumpObserver = new MutationObserver((mutations) => {
    try {
      mutations.forEach((mutation) => {
        // Process new nodes
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1 || node.nodeType === 3) {
              walk(node);
            }
          });
        }

        // Process character data changes
        if (mutation.type === 'characterData' && mutation.target.nodeType === 3) {
          if (!isEditableNode(mutation.target)) {
            convert(mutation.target);
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
let originalMutationObserver;

describe('MutationObserver Functionality', () => {
  beforeEach(() => {
    // Create a mock DOM environment with storage support
    const dom = new JSDOM('<!DOCTYPE html><body></body></html>', {
      url: 'https://example.org/',
      referrer: 'https://example.com/',
      contentType: 'text/html',
    });

    global.document = dom.window.document;
    global.window = dom.window;

    // Save the original MutationObserver
    originalMutationObserver = global.MutationObserver;

    // Replace the global MutationObserver with our mock
    global.MutationObserver = MockMutationObserver;
  });

  afterEach(() => {
    // Restore original MutationObserver
    global.MutationObserver = originalMutationObserver;
  });

  it('should set up a MutationObserver that observes document.body', () => {
    // Call the setup function directly
    setupMutationObserver();

    // Check that the observer was initialized and is observing the body
    expect(MockMutationObserver.instance).toBeTruthy();
    expect(MockMutationObserver.instance.observe).toHaveBeenCalledWith(
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
    const observerConfig = MockMutationObserver.instance.observe.mock.calls[0][1];
    expect(observerConfig.childList).toBe(true);
    expect(observerConfig.subtree).toBe(true);
    expect(observerConfig.characterData).toBe(true);
  });
});
