/**
 * Trump Goggles - Chrome extension to see the world through Trump's eyes
 *
 * This content script replaces mentions of politicians, media figures, and other entities
 * with Donald Trump's nicknames for them. It uses a clean modular architecture with separate
 * components for DOM traversal, text processing, and mutation observation.
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
    console.log('Trump Goggles: Initializing with modular architecture');

    try {
      // Verify that required modules are available
      if (!window.DOMProcessor) {
        console.error(
          'Trump Goggles Error: DOMProcessor module not found! Check script loading order.'
        );
        return;
      }

      if (!window.TextProcessor) {
        console.error(
          'Trump Goggles Error: TextProcessor module not found! Check script loading order.'
        );
        return;
      }

      // First try to use the TrumpMappings module
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
        processPage();
      }, 100);

      // Setup MutationObserver to handle dynamic content
      setupMutationObserver();
    } catch (error) {
      console.error('Trump Goggles: Error initializing extension', error);
    }
  }

  // ===== PAGE PROCESSING =====

  /**
   * Process the current page, replacing text according to Trump mappings
   *
   * @private
   * @param {Node} [rootNode=document.body] - Root node to process
   * @returns {Promise<void>} Promise that resolves when processing is complete
   */
  async function processPage(rootNode = document.body) {
    // Skip if disabled or processing is already in progress
    if (!enabled || processingInProgress || operationCount >= MAX_OPERATIONS_PER_PAGE) {
      return;
    }

    // Set the processing flag to prevent concurrent processing
    processingInProgress = true;

    try {
      // Process the DOM in chunks
      await window.DOMProcessor.processInChunks(
        rootNode,
        // Callback to apply to each text node
        (textNode) => {
          // Skip if we've hit the operation limit
          if (operationCount >= MAX_OPERATIONS_PER_PAGE) {
            return;
          }

          // Process the text node
          const processed = window.TextProcessor.processTextNode(textNode, trumpMap, mapKeys, {
            useCache: true,
            earlyBailout: true,
            onProcessed: () => {
              // Increment operation counter when a replacement actually happens
              operationCount++;
            },
          });

          return processed;
        },
        {
          chunkSize: DEFAULT_CHUNK_SIZE,
          timeSliceMs: TIME_SLICE_MS,
          skipProcessed: true,
        }
      );

      if (DEBUG) {
        console.log(`Trump Goggles: Processed ${operationCount} operations`);
      }
    } catch (error) {
      console.error('Trump Goggles: Error processing page', error);
    } finally {
      // Reset the processing flag when done
      processingInProgress = false;
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
          if (window.DOMProcessor.isProcessed(mutation.target)) {
            return false;
          }

          return true;
        });

        if (relevantMutations.length === 0) {
          return;
        }

        // Collect nodes to process from mutations
        const nodesToProcess = new Set();

        // Disconnect observer to avoid infinite loop while processing
        if (mutationObserver) {
          mutationObserver.disconnect();
        }

        // Process mutations
        relevantMutations.forEach((mutation) => {
          // Process new nodes (childList mutations)
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            mutation.addedNodes.forEach((node) => {
              // Only add element and text nodes that haven't been processed
              if (
                (node.nodeType === 1 || node.nodeType === 3) &&
                !window.DOMProcessor.isProcessed(node)
              ) {
                nodesToProcess.add(node);
              }
            });
          }

          // Process changed text content (characterData mutations)
          if (
            mutation.type === 'characterData' &&
            mutation.target.nodeType === 3 &&
            !window.DOMProcessor.isProcessed(mutation.target) &&
            !window.DOMProcessor.isEditableNode(mutation.target)
          ) {
            nodesToProcess.add(mutation.target);
          }
        });

        // Process collected nodes if there are any
        if (nodesToProcess.size > 0) {
          // Process each root node from the mutations
          for (const node of nodesToProcess) {
            if (node.nodeType === 1) {
              // Element node - process its subtree
              processPage(node);
            } else if (node.nodeType === 3 && !window.DOMProcessor.isEditableNode(node)) {
              // Text node - process directly if not editable
              window.TextProcessor.processTextNode(node, trumpMap, mapKeys, {
                useCache: true,
                earlyBailout: true,
                onProcessed: () => {
                  operationCount++;
                  window.DOMProcessor.markProcessed(node);
                },
              });
            }
          }
        }

        // Reconnect observer after processing
        if (enabled && mutationObserver && document.body) {
          mutationObserver.observe(document.body, observerConfig);
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

  /**
   * Process a specific DOM subtree with custom options
   *
   * @public
   * @param {Object} options - Processing options
   * @param {Node} options.root - Root node to process (defaults to document.body)
   * @param {boolean} options.skipInteractiveElements - Whether to skip interactive elements
   * @param {number} options.chunkSize - Number of nodes to process per chunk
   * @param {number} options.processingDelay - Delay between processing chunks in ms
   * @returns {Promise<number>} - Promise resolving to the number of replacements made
   */
  async function process(options = {}) {
    const root = options.root || document.body;
    const skipInteractiveElements = options.skipInteractiveElements !== false;
    const chunkSize = options.chunkSize || DEFAULT_CHUNK_SIZE;
    const processingDelay = options.processingDelay || TIME_SLICE_MS;

    // Skip if disabled
    if (!enabled) {
      return 0;
    }

    let replacementCount = 0;

    // Configure the skip tags based on options
    const skipTags = [...window.DOMProcessor.DEFAULT_SKIP_TAGS];
    if (!skipInteractiveElements) {
      // Remove interactive elements from skip list if specified
      const interactiveElements = ['input', 'textarea', 'select', 'option'];
      interactiveElements.forEach((tag) => {
        const index = skipTags.indexOf(tag);
        if (index !== -1) {
          skipTags.splice(index, 1);
        }
      });
    }

    // Process the DOM tree
    await window.DOMProcessor.processInChunks(
      root,
      (textNode) => {
        const replaced = window.TextProcessor.processTextNode(textNode, trumpMap, mapKeys, {
          useCache: true,
          earlyBailout: true,
        });

        if (replaced) {
          replacementCount++;
        }
      },
      {
        chunkSize: chunkSize,
        timeSliceMs: processingDelay,
        skipProcessed: true,
        skipTags: skipTags,
      }
    );

    return replacementCount;
  }

  /**
   * Reprocess all nodes, including those already processed
   *
   * @public
   * @param {Node} [root=document.body] - Root node to reprocess
   * @returns {Promise<number>} - Promise resolving to the number of replacements made
   */
  async function reprocessAll(root = document.body) {
    // Skip if disabled
    if (!enabled) {
      return 0;
    }

    // Reset the processed state for all nodes
    window.DOMProcessor.resetProcessedState(root);

    // Clear the text processor cache
    window.TextProcessor.clearCache();

    // Reset operation count to allow full reprocessing
    operationCount = 0;

    // Process the DOM tree
    return await process({
      root: root,
      skipInteractiveElements: true,
      chunkSize: DEFAULT_CHUNK_SIZE,
      processingDelay: TIME_SLICE_MS,
    });
  }

  // Public API
  return {
    // Core functionality
    initialize: initialize,
    enable: enable,
    disable: disable,
    isEnabled: isEnabled,

    // Enhanced API
    process: process,
    reprocessAll: reprocessAll,
  };
})();

// Export the module to window for backward compatibility
window.TrumpGoggles = TrumpGoggles;

// Start the extension when the script loads
TrumpGoggles.initialize();
