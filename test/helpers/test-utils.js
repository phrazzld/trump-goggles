/**
 * Test utilities and helpers for Trump Goggles
 * This module provides common test functions to simplify test writing
 */
import { JSDOM } from 'jsdom';

/**
 * Creates a mock document with the specified HTML
 *
 * @param {string} html - HTML content to use for the document
 * @param {Object} options - JSDOM options
 * @returns {Object} Mock window and document objects
 */
export function createMockDocument(html = '<html><body></body></html>', options = {}) {
  const dom = new JSDOM(html, {
    url: 'https://example.org/',
    referrer: 'https://example.com/',
    contentType: 'text/html',
    ...options,
  });

  return {
    window: dom.window,
    document: dom.window.document,
  };
}

/**
 * Creates a DOM tree for testing text replacement
 *
 * @param {Object} document - Document to create elements in
 * @returns {HTMLElement} Root element containing the test DOM structure
 */
export function createTestDOM(document) {
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
 * @param {string} text - Text content for the node (default includes Trump references)
 * @param {Object} document - Document to create the text node in
 * @returns {Text} Text node
 */
export function createTestTextNode(
  text = 'Donald Trump announced that Trump will make America great again',
  document
) {
  return document.createTextNode(text);
}

/**
 * Creates a trumpMap object for testing
 *
 * @returns {Object} A simplified trumpMap object with a few key mappings
 */
export function createTestTrumpMap() {
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
 * @param {string} type - The type of mutation ('childList' or 'characterData')
 * @param {Node} target - The mutation target
 * @param {Array} addedNodes - Nodes added by the mutation (for childList)
 * @param {Array} removedNodes - Nodes removed by the mutation (for childList)
 * @param {string} oldValue - Previous value (for characterData)
 * @returns {Object} Mock MutationRecord
 */
export function createMockMutation(
  type,
  target,
  addedNodes = [],
  removedNodes = [],
  oldValue = null
) {
  return {
    type,
    target,
    addedNodes: Array.isArray(addedNodes) ? addedNodes : [addedNodes].filter(Boolean),
    removedNodes: Array.isArray(removedNodes) ? removedNodes : [removedNodes].filter(Boolean),
    oldValue,
    attributeName: null,
    attributeNamespace: null,
    nextSibling: null,
    previousSibling: null,
  };
}

/**
 * Creates a simulated MutationObserver for testing
 *
 * @param {Function} callback - Function to call with mutations
 * @returns {Object} Mock MutationObserver with helper methods
 */
export function createMockMutationObserver(callback) {
  return {
    callback,
    observe: vi.fn(),
    disconnect: vi.fn(),
    takeRecords: vi.fn(() => []),

    // Helper to simulate mutations
    simulateMutations: (mutations) => {
      if (typeof callback === 'function') {
        callback(mutations, { disconnect: vi.fn(), observe: vi.fn() });
      }
    },
  };
}

/**
 * Waits for any pending DOM updates to complete
 *
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise} Promise that resolves after the timeout
 */
export function waitForDomUpdates(ms = 0) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Creates a mock element with the specified attributes and content
 *
 * @param {Object} document - Document to create the element in
 * @param {string} tagName - Type of element to create
 * @param {Object} attributes - Attributes to set on the element
 * @param {string|Array|Node} content - Content to add to the element
 * @returns {HTMLElement} The created element
 */
export function createElement(document, tagName, attributes = {}, content = '') {
  const element = document.createElement(tagName);

  // Set attributes
  Object.entries(attributes).forEach(([key, value]) => {
    if (value === true) {
      element.setAttribute(key, '');
    } else if (value !== false && value !== null && value !== undefined) {
      element.setAttribute(key, value);
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
 * @param {Node} parent - Parent node to add to
 * @param {Array|Node} nodes - Nodes to add
 * @returns {Array} Added nodes
 */
export function simulateAddedNodes(parent, nodes) {
  const nodeArray = Array.isArray(nodes) ? nodes : [nodes];

  nodeArray.forEach((node) => {
    parent.appendChild(node);
  });

  return nodeArray;
}

/**
 * Tests if a node has been processed (marked to avoid reprocessing)
 *
 * @param {Node} node - Node to check
 * @returns {boolean} Whether the node has been marked as processed
 */
export function isNodeProcessed(node) {
  return (
    node &&
    (node._trumpProcessed === true || (node.dataset && node.dataset.trumpProcessed === 'true'))
  );
}

/**
 * Helper to compare text content across all text nodes in a subtree
 *
 * @param {Node} root - Root node to check
 * @param {Object} trumpMap - The replacement mapping to use
 * @returns {Object} Stats about replacements
 */
export function countReplacements(root, trumpMap = createTestTrumpMap()) {
  let textNodesChecked = 0;
  let nodesWithReplacements = 0;
  let totalReplacements = 0;
  const replacementsByKey = {};

  // Initialize counts for each trumpMap key
  Object.keys(trumpMap).forEach((key) => {
    replacementsByKey[key] = 0;
  });

  // Recursive function to check text nodes
  function checkNode(node) {
    if (!node) return;

    if (node.nodeType === 3) {
      // Text node
      textNodesChecked++;
      let hadReplacement = false;
      let text = node.nodeValue;

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
 * @returns {Object} Test logger with captured messages
 */
export function createTestLogger() {
  const messages = {
    debug: [],
    info: [],
    warn: [],
    error: [],
  };

  const logger = {
    debug: vi.fn((msg, data) => messages.debug.push({ msg, data })),
    info: vi.fn((msg, data) => messages.info.push({ msg, data })),
    warn: vi.fn((msg, data) => messages.warn.push({ msg, data })),
    error: vi.fn((msg, data) => messages.error.push({ msg, data })),

    // Helper to get captured messages
    getMessages: () => ({ ...messages }),

    // Helper to clear captured messages
    clear: () => {
      Object.keys(messages).forEach((key) => {
        messages[key] = [];
      });
    },
  };

  return logger;
}

/**
 * Creates a test error handler
 *
 * @returns {Object} Test error handler with captured errors
 */
export function createTestErrorHandler() {
  const errors = [];

  const errorHandler = {
    handleError: vi.fn((error, context) => {
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
