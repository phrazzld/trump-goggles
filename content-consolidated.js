/**
 * Trump Goggles - Chrome extension to see the world through Trump's eyes
 *
 * This content script replaces mentions of politicians, media figures, and other entities
 * with Donald Trump's nicknames for them. It works by traversing the DOM tree and replacing
 * text in non-editable elements. It also observes DOM changes to handle dynamically loaded content.
 *
 * @version 3.0.0
 */

// TrumpGoggles module pattern - provides a self-contained module with proper encapsulation
const TrumpGoggles = (function () {
  'use strict';

  // ===== CONSTANTS AND CONFIGURATION =====

  // Global observer configuration
  const observerConfig = {
    childList: true, // Watch for new nodes
    subtree: true, // Watch the entire subtree
    characterData: true, // Watch for text content changes
  };

  // Performance and safety settings
  const MAX_OPERATIONS_PER_PAGE = 1000; // Safety limit for text replacements
  const TIME_SLICE_MS = 15; // Maximum time to process in one chunk before yielding
  const DEFAULT_CHUNK_SIZE = 50; // Default number of nodes to process per chunk

  // Debug settings (can be enabled via extension option in the future)
  const DEBUG = false;

  // ===== MODULE INTERNAL STATE =====

  // Module state variables - properly scoped inside the module
  let enabled = true; // Main switch to enable/disable functionality
  let processingInProgress = false; // Flag to prevent concurrent processing
  let operationCount = 0; // Counter for operations performed
  let trumpMap = {}; // Mapping object for replacements
  let mapKeys = []; // Array of keys from trumpMap

  // The observer instance
  let mutationObserver = null;

  // WeakSet to track processed nodes (properly scoped in the module)
  const processedNodes = new WeakSet();

  // ===== INITIALIZATION =====

  /**
   * Main initialization function - checks dependencies and starts the extension
   * @public
   */
  function initialize() {
    // Get shared global state, but don't store module state in window object
    // We access window properties for cross-script communication only
    if (window.trumpGogglesInitialized) {
      console.log('Trump Goggles: Already initialized by another script');
      return;
    }

    // Set global initialization flag
    window.trumpGogglesInitialized = true;
    console.log('Trump Goggles: Initializing consolidated script');

    try {
      // First try to use the new TrumpMappings module
      if (window.TrumpMappings && typeof window.TrumpMappings.getReplacementMap === 'function') {
        // Use new module API
        trumpMap = window.TrumpMappings.getReplacementMap();
        mapKeys = window.TrumpMappings.getKeys();
      }
      // Fallback to legacy window.buildTrumpMap function
      else if (typeof window.buildTrumpMap === 'function') {
        // Using deprecated legacy function
        console.warn('Trump Goggles: Using legacy buildTrumpMap function. Consider upgrading.');
        trumpMap = window.buildTrumpMap();
        mapKeys = Object.keys(trumpMap);
      }
      // No mapping functionality available
      else {
        console.error(
          'Trump Goggles Error: No mapping functionality found! ' +
            'This likely means trump-mappings.js failed to load or loaded after content script. ' +
            'Check manifest.json script order. Replacements disabled.'
        );
        enabled = false; // Explicitly disable when dependency is missing
        return;
      }

      // Add kill switch if in debug mode
      if (DEBUG) {
        addKillSwitch();
      }

      // Process in chunks to avoid freezing the browser
      // Delay initial processing to allow page to render first
      setTimeout(() => {
        walkChunked(document.body);
      }, 100);

      // Setup MutationObserver to handle dynamic content
      setupMutationObserver();
    } catch (error) {
      console.error('Trump Goggles: Error initializing extension', error);
    }
  }

  // ===== DOM TRAVERSAL =====

  /**
   * Process DOM in chunks to avoid freezing the browser
   *
   * @private
   * @param {Node} rootNode - Root node to start processing from
   * @param {number} [chunkSize=DEFAULT_CHUNK_SIZE] - Number of nodes to process per chunk
   */
  function walkChunked(rootNode, chunkSize = DEFAULT_CHUNK_SIZE) {
    // Circuit breakers
    if (!enabled || operationCount >= MAX_OPERATIONS_PER_PAGE) {
      return;
    }

    const nodesToProcess = [rootNode];
    let processed = 0;

    function processChunk() {
      // Check circuit breakers before processing each chunk
      if (!enabled || nodesToProcess.length === 0 || operationCount >= MAX_OPERATIONS_PER_PAGE) {
        processingInProgress = false;
        return;
      }

      processingInProgress = true;
      const deadline = Date.now() + TIME_SLICE_MS; // Time slice for this chunk

      // Process nodes until we hit time limit, chunk size, or run out of nodes
      while (nodesToProcess.length > 0 && Date.now() < deadline && processed < chunkSize) {
        const node = nodesToProcess.shift();

        // Skip invalid nodes or already processed nodes
        if (!node || !node.nodeType || processedNodes.has(node)) {
          continue;
        }

        // Mark node as processed to avoid infinite loops
        processedNodes.add(node);

        switch (node.nodeType) {
        case 1: // Element
          // Skip script, style, SVG elements and our own UI elements
          const tagName = node.nodeName ? node.nodeName.toLowerCase() : '';
          if (
            tagName === 'script' ||
              tagName === 'style' ||
              tagName === 'svg' ||
              node.id === 'trump-goggles-kill-switch'
          ) {
            continue;
          }

          // Add child nodes to processing queue
          if (node.childNodes && node.childNodes.length) {
            for (let i = 0; i < node.childNodes.length; i++) {
              nodesToProcess.push(node.childNodes[i]);
            }
          }
          break;

        case 3: // Text node
          // Only convert if node is not within an editable element and has content
          if (!isEditableNode(node) && node.nodeValue && node.nodeValue.trim().length > 0) {
            convert(node);
            processed++;
          }
          break;
        }
      }

      // Schedule next chunk or finish processing
      if (nodesToProcess.length > 0 && processed < chunkSize) {
        setTimeout(processChunk, 0);
      } else {
        processingInProgress = false;
        if (DEBUG) {
          console.log(`Trump Goggles: Processed ${operationCount} operations`);
        }
      }
    }

    // Start processing first chunk
    processChunk();
  }

  /**
   * Determines if a DOM node is editable or within an editable element.
   *
   * @private
   * @param {Node} node - The DOM node to check
   * @returns {boolean} - True if editable, false otherwise
   */
  function isEditableNode(node) {
    // Check if it's a text node
    if (node.nodeType === 3) {
      // For text nodes, check the parent
      return isEditableNode(node.parentNode);
    }

    // Handle non-text nodes
    if (!node || node.nodeType !== 1) {
      return false;
    }

    // Check for common editable elements
    const element = /** @type {Element} */ (node);
    const nodeName = element.nodeName.toLowerCase();
    if (nodeName === 'textarea' || nodeName === 'input') {
      return true;
    }

    // Check for contenteditable attribute
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

  // ===== TEXT REPLACEMENT =====

  /**
   * Applies Trump nickname replacements to the content of a text node.
   *
   * @private
   * @param {Text} textNode - The text node whose content will be modified
   * @returns {void}
   */
  function convert(textNode) {
    try {
      // Circuit breakers
      if (
        !enabled ||
        operationCount >= MAX_OPERATIONS_PER_PAGE ||
        !textNode ||
        !textNode.nodeValue
      ) {
        return;
      }

      // Skip if the node is already in our processed set
      if (processedNodes.has(textNode)) {
        return;
      }

      // Create a temporary variable to avoid multiple DOM updates
      let replacedText = textNode.nodeValue;
      const originalText = replacedText;

      // Apply all replacements to the temporary variable
      mapKeys.forEach(function (key) {
        try {
          // Optimization: Skip patterns unlikely to match
          const pattern = trumpMap[key].regex.source.split('|')[0].replace(/[\\()]/g, '');
          if (pattern.length > 3 && !replacedText.includes(pattern.replace(/\\b/g, ''))) {
            return;
          }

          replacedText = replacedText.replace(trumpMap[key].regex, trumpMap[key].nick);

          // Reset the regex lastIndex if it has global flag
          if (trumpMap[key].regex.global) {
            trumpMap[key].regex.lastIndex = 0;
          }
        } catch (regexError) {
          console.error('Trump Goggles: Error applying regex', key, regexError);
        }
      });

      // Update DOM only once after all replacements are done, and only if text changed
      if (replacedText !== originalText) {
        // Disconnect observer before making changes to avoid infinite loop
        if (mutationObserver) {
          mutationObserver.disconnect();
        }

        textNode.nodeValue = replacedText;

        // Mark this node as processed
        processedNodes.add(textNode);

        // Increment operation counter
        operationCount++;

        // Reconnect observer after changes
        if (mutationObserver && enabled && document.body) {
          mutationObserver.observe(document.body, observerConfig);
        }
      }
    } catch (error) {
      console.error('Trump Goggles: Error converting text node', error);
    }
  }

  // ===== MUTATION OBSERVER =====

  /**
   * Sets up a MutationObserver to handle dynamically added content.
   *
   * @private
   * @returns {void}
   */
  function setupMutationObserver() {
    // Don't run in frames - focus only on the main document
    if (window !== window.top) {
      return;
    }

    // Define a MutationObserver that will process new content
    mutationObserver = new MutationObserver((mutations) => {
      try {
        // Skip if disabled, max operations reached, or already processing
        if (!enabled || operationCount >= MAX_OPERATIONS_PER_PAGE || processingInProgress) {
          return;
        }

        // Filter out mutations caused by our own changes
        const relevantMutations = mutations.filter((mutation) => {
          // Skip if mutation is on our kill switch
          if (mutation.target.id === 'trump-goggles-kill-switch') {
            return false;
          }

          // Skip processed nodes
          if (processedNodes.has(mutation.target)) {
            return false;
          }

          return true;
        });

        if (relevantMutations.length === 0) {
          return;
        }

        // Process new nodes from relevant mutations
        const nodesToProcess = new Set();

        relevantMutations.forEach((mutation) => {
          // Process new nodes (childList mutations)
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            mutation.addedNodes.forEach((node) => {
              // Only add element and text nodes that haven't been processed
              if ((node.nodeType === 1 || node.nodeType === 3) && !processedNodes.has(node)) {
                nodesToProcess.add(node);
              }
            });
          }

          // Process changed text content (characterData mutations)
          if (
            mutation.type === 'characterData' &&
            mutation.target.nodeType === 3 &&
            !processedNodes.has(mutation.target)
          ) {
            if (!isEditableNode(mutation.target)) {
              nodesToProcess.add(mutation.target);
            }
          }
        });

        // Process collected nodes if there are any
        if (nodesToProcess.size > 0) {
          // Disconnect observer to avoid infinite loop
          if (mutationObserver) {
            mutationObserver.disconnect();
          }

          // Process nodes in chunks
          for (const node of nodesToProcess) {
            if (node.nodeType === 1) {
              // Element node - process its children
              walkChunked(node);
            } else if (node.nodeType === 3 && !isEditableNode(node)) {
              // Text node - process directly if not editable
              convert(/** @type {Text} */ (node));
            }
          }

          // Reconnect observer after processing
          if (enabled && mutationObserver && document.body) {
            mutationObserver.observe(document.body, observerConfig);
          }
        }
      } catch (error) {
        console.error('Trump Goggles: Error processing mutations', error);
      }
    });

    // Start observing
    try {
      if (mutationObserver && document.body) {
        mutationObserver.observe(document.body, observerConfig);
      } else {
        console.error(
          'Trump Goggles: Unable to start observer - missing observer or document.body'
        );
      }
    } catch (error) {
      console.error('Trump Goggles: Error setting up MutationObserver', error);
    }
  }

  // ===== DEBUGGING TOOLS =====

  /**
   * Create and add a kill switch to quickly disable the extension if needed
   *
   * @private
   */
  function addKillSwitch() {
    const killSwitch = document.createElement('div');
    killSwitch.id = 'trump-goggles-kill-switch';
    killSwitch.style.position = 'fixed';
    killSwitch.style.bottom = '10px';
    killSwitch.style.right = '10px';
    killSwitch.style.backgroundColor = 'rgba(255, 0, 0, 0.7)';
    killSwitch.style.color = 'white';
    killSwitch.style.padding = '5px 10px';
    killSwitch.style.borderRadius = '5px';
    killSwitch.style.fontSize = '12px';
    killSwitch.style.fontFamily = 'Arial, sans-serif';
    killSwitch.style.cursor = 'pointer';
    killSwitch.style.zIndex = '9999999';
    killSwitch.style.display = DEBUG ? 'block' : 'none'; // Only show in debug mode
    killSwitch.textContent = 'Disable Trump Goggles';

    killSwitch.addEventListener('click', () => {
      enabled = false;
      killSwitch.textContent = 'Trump Goggles Disabled';
      killSwitch.style.backgroundColor = 'rgba(128, 128, 128, 0.7)';
    });

    document.body.appendChild(killSwitch);
  }

  // ===== PUBLIC API =====

  /**
   * Enable the extension
   *
   * @public
   * @returns {void}
   */
  function enable() {
    enabled = true;
    console.log('Trump Goggles: Enabled');
  }

  /**
   * Disable the extension
   *
   * @public
   * @returns {void}
   */
  function disable() {
    enabled = false;
    console.log('Trump Goggles: Disabled');
  }

  /**
   * Check if the extension is enabled
   *
   * @public
   * @returns {boolean} True if enabled, false otherwise
   */
  function isEnabled() {
    return enabled;
  }

  // Public API
  return {
    initialize: initialize,
    enable: enable,
    disable: disable,
    isEnabled: isEnabled,
  };
})();

// Export the module to window for backward compatibility
window.TrumpGoggles = TrumpGoggles;

// Start the extension when the script loads
TrumpGoggles.initialize();
