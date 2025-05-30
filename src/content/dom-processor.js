/**
 * DOM Processor Module - Responsible for traversing the DOM and processing elements
 *
 * This module provides a clean separation between DOM traversal and text processing
 * logic. It implements efficient node traversal with configurable filtering and
 * explicit handling of interactive elements.
 *
 * @version 3.0.0
 */

// Default configuration constants
const DEFAULT_CHUNK_SIZE = 50;
const DEFAULT_TIME_SLICE_MS = 15;

// DOM Processor module pattern
const DOMProcessor = (function () {
  'use strict';

  // ===== CONSTANTS AND CONFIGURATION =====

  // Default configuration for skipping elements
  const DEFAULT_SKIP_TAGS = [
    'script',
    'style',
    'svg',
    'noscript',
    'iframe',
    'object',
    'embed',
    'input',
    'textarea',
    'select',
    'option',
    'pre',
    'code',
  ];

  // Element attribute used to mark processed nodes
  const PROCESSED_ATTR = 'data-tg-processed';

  // ===== NODE TRACKING =====

  /**
   * Checks if a node has been processed
   *
   * @private
   * @param {Node} node - The node to check
   * @returns {boolean} - Whether the node has been processed
   */
  function isProcessed(node) {
    // For text nodes, check for a custom property
    if (node.nodeType === 3) {
      return !!node._trumpProcessed;
    }

    // For elements, check for the data attribute
    if (node.nodeType === 1) {
      return !!node.hasAttribute && node.hasAttribute(PROCESSED_ATTR);
    }

    // Default for other node types
    return false;
  }

  /**
   * Marks a node as processed
   *
   * @private
   * @param {Node} node - The node to mark
   */
  function markProcessed(node) {
    // For text nodes, use a custom property
    if (node.nodeType === 3) {
      node._trumpProcessed = true;
    }

    // For elements, use a data attribute
    if (node.nodeType === 1 && node.setAttribute) {
      node.setAttribute(PROCESSED_ATTR, 'true');
    }
  }

  // ===== ELEMENT FILTERING =====

  /**
   * Checks if an element should be skipped during traversal
   *
   * @private
   * @param {Element} element - The element to check
   * @param {string[]} skipTags - Array of tag names to skip
   * @returns {boolean} - True if the element should be skipped
   */
  function shouldSkipElement(element, skipTags = DEFAULT_SKIP_TAGS) {
    if (!element || element.nodeType !== 1) {
      return false;
    }

    const tagName = element.nodeName ? element.nodeName.toLowerCase() : '';

    // Skip elements with specified tags
    if (skipTags.includes(tagName)) {
      return true;
    }

    // Skip elements with contenteditable
    if (
      element.getAttribute &&
      (element.getAttribute('contenteditable') === 'true' ||
        element.getAttribute('contenteditable') === '')
    ) {
      return true;
    }

    // Skip hidden elements
    if (element.style && element.style.display === 'none') {
      return true;
    }

    // Skip custom UI elements
    if (element.id === 'trump-goggles-kill-switch') {
      return true;
    }

    return false;
  }

  /**
   * Checks if a node is or is within an editable element
   *
   * @private
   * @param {Node} node - The node to check
   * @returns {boolean} - True if the node is editable
   */
  function isEditableNode(node) {
    // Check if it's a text node
    if (node.nodeType === 3) {
      // For text nodes, check the parent - make sure parent exists
      if (node.parentNode) {
        return isEditableNode(node.parentNode);
      }
      return false;
    }

    // Handle non-element nodes
    if (!node || node.nodeType !== 1) {
      return false;
    }

    // Check for common editable elements
    const nodeName = node.nodeName.toLowerCase();
    if (
      nodeName === 'textarea' ||
      nodeName === 'input' ||
      nodeName === 'select' ||
      nodeName === 'option'
    ) {
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

    // Check if any parent is editable (recursively)
    return node.parentNode ? isEditableNode(node.parentNode) : false;
  }

  // ===== DOM TRAVERSAL =====

  /**
   * Traverses the DOM starting from a root node and applying a callback to text nodes
   *
   * @private
   * @param {Node} rootNode - The node to start traversal from
   * @param {Function} textNodeCallback - Callback to apply to text nodes
   * @param {Object} options - Configuration options
   * @param {string[]} options.skipTags - Tags to skip during traversal
   * @param {boolean} options.skipProcessed - Whether to skip already processed nodes
   * @returns {void}
   */
  function traverseDOM(
    rootNode,
    textNodeCallback,
    options = { skipTags: DEFAULT_SKIP_TAGS, skipProcessed: true }
  ) {
    if (!rootNode) {
      return;
    }

    const skipTags = options.skipTags || DEFAULT_SKIP_TAGS;
    const skipProcessed = options.skipProcessed !== false;

    // Stack for depth-first traversal (more efficient than recursion)
    const stack = [rootNode];

    while (stack.length > 0) {
      const node = stack.pop();

      // Skip invalid nodes
      if (!node || !node.nodeType) {
        continue;
      }

      // Skip already processed nodes if configured to do so
      if (skipProcessed && isProcessed(node)) {
        continue;
      }

      // Handle different node types
      switch (node.nodeType) {
      case 1: // Element node
        // Skip element if it matches our filter criteria
        if (shouldSkipElement(/** @type {Element} */ (node), skipTags)) {
          continue;
        }

        // Mark element as processed
        markProcessed(node);

        // Add child nodes to stack in reverse order (to maintain document order when popping)
        if (node.childNodes && node.childNodes.length) {
          for (let i = node.childNodes.length - 1; i >= 0; i--) {
            stack.push(node.childNodes[i]);
          }
        }
        break;

      case 3: // Text node
        // Skip empty text nodes or those within editable elements
        if (!node.nodeValue || node.nodeValue.trim() === '' || isEditableNode(node)) {
          continue;
        }

        // Process the text node with the callback
        if (typeof textNodeCallback === 'function') {
          textNodeCallback(node);
        }

        // Mark text node as processed
        markProcessed(node);
        break;
      }
    }
  }

  /**
   * Processes DOM in chunks to avoid freezing the browser
   *
   * @public
   * @param {Node} rootNode - The node to start traversal from
   * @param {Function} textNodeCallback - Function to call for each text node
   * @param {Object} options - Configuration options
   * @param {number} options.chunkSize - Number of nodes to process per chunk
   * @param {number} options.timeSliceMs - Maximum time to process before yielding
   * @param {boolean} options.skipProcessed - Whether to skip already processed nodes
   * @param {string[]} options.skipTags - Array of tag names to skip
   * @returns {Promise<number>} - Promise resolving to the number of processed nodes
   */
  function processInChunks(
    rootNode,
    textNodeCallback,
    options = {
      chunkSize: DEFAULT_CHUNK_SIZE,
      timeSliceMs: DEFAULT_TIME_SLICE_MS,
      skipProcessed: true,
      skipTags: DEFAULT_SKIP_TAGS,
    }
  ) {
    return new Promise((resolve) => {
      if (!rootNode) {
        resolve(0);
        return;
      }

      const chunkSize = options.chunkSize || 50;
      const timeSliceMs = options.timeSliceMs || 15;
      const skipTags = options.skipTags || DEFAULT_SKIP_TAGS;
      const skipProcessed = options.skipProcessed !== false;

      // Stack for depth-first traversal
      const nodesToProcess = [rootNode];
      let processed = 0;

      function processChunk() {
        // Circuit breakers
        if (nodesToProcess.length === 0) {
          resolve(processed);
          return;
        }
        const deadline = Date.now() + timeSliceMs; // Time slice for this chunk
        const chunkLimit = processed + chunkSize;

        // Process nodes until we hit time limit, chunk size, or run out of nodes
        while (nodesToProcess.length > 0 && Date.now() < deadline && processed < chunkLimit) {
          const node = nodesToProcess.pop();

          // Skip invalid nodes
          if (!node || !node.nodeType) {
            continue;
          }

          // Skip already processed nodes if configured
          if (skipProcessed && isProcessed(node)) {
            continue;
          }

          // Handle different node types
          switch (node.nodeType) {
          case 1: // Element node
            // Skip element if it matches our filter criteria
            if (shouldSkipElement(/** @type {Element} */ (node), skipTags)) {
              continue;
            }

            // Mark element as processed
            markProcessed(node);

            // Add child nodes to stack in reverse order
            if (node.childNodes && node.childNodes.length) {
              for (let i = node.childNodes.length - 1; i >= 0; i--) {
                nodesToProcess.push(node.childNodes[i]);
              }
            }
            break;

          case 3: // Text node
            // Skip empty text nodes or those within editable elements
            if (!node.nodeValue || node.nodeValue.trim() === '' || isEditableNode(node)) {
              continue;
            }

            // Process the text node with the callback
            if (typeof textNodeCallback === 'function') {
              textNodeCallback(node);
              processed++;
            }

            // Mark text node as processed
            markProcessed(node);
            break;
          }
        }

        // Schedule next chunk or finish processing
        if (nodesToProcess.length > 0) {
          setTimeout(processChunk, 0);
        } else {
          resolve(processed);
        }
      }

      // Start processing first chunk
      processChunk();
    });
  }

  /**
   * Resets the processed state for all nodes under the given root
   *
   * @public
   * @param {Node} rootNode - The node to start from
   * @returns {void}
   */
  function resetProcessedState(rootNode) {
    if (!rootNode) {
      return;
    }

    // Use traverseDOM but with a callback that clears the processed state
    traverseDOM(
      rootNode,
      /**
       * @param {Node} node - The node to process
       */
      (node) => {
        // For text nodes
        if (node.nodeType === 3 && node._trumpProcessed) {
          delete node._trumpProcessed;
        }
      },
      {
        skipProcessed: false, // Process all nodes regardless of processed state
        skipTags: [], // Don't skip any tags during this operation
      }
    );

    // Find all elements with our processed attribute and remove it
    const elements = rootNode.querySelectorAll
      ? rootNode.querySelectorAll(`[${PROCESSED_ATTR}]`)
      : [];

    for (let i = 0; i < elements.length; i++) {
      elements[i].removeAttribute(PROCESSED_ATTR);
    }

    // Handle the root element itself if it's an Element
    if (rootNode.nodeType === 1 && rootNode.removeAttribute) {
      rootNode.removeAttribute(PROCESSED_ATTR);
    }
  }

  // ===== PUBLIC API =====

  return {
    // Core DOM traversal methods
    traverseDOM: traverseDOM,
    processInChunks: processInChunks,

    // Node tracking methods
    isProcessed: isProcessed,
    markProcessed: markProcessed,
    resetProcessedState: resetProcessedState,

    // Element filtering methods
    isEditableNode: isEditableNode,
    shouldSkipElement: shouldSkipElement,

    // Constants exported for configuration
    DEFAULT_SKIP_TAGS: DEFAULT_SKIP_TAGS,
    PROCESSED_ATTR: PROCESSED_ATTR,
  };
})();

// Export the module
window.DOMProcessor = DOMProcessor;
