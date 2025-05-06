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

  // Performance and safety settings
  const MAX_OPERATIONS_PER_PAGE = 1000; // Safety limit for text replacements
  const TIME_SLICE_MS = 15; // Maximum time to process in one chunk before yielding
  const DEFAULT_CHUNK_SIZE = 50; // Default number of nodes to process per chunk
  const DEFAULT_DEBOUNCE_MS = 50; // Default debounce time for mutation processing

  // Debug settings (can be enabled via extension option in the future)
  const DEBUG = false;

  // ===== MODULE INTERNAL STATE =====

  // Module state variables - properly scoped inside the module
  let enabled = true; // Main switch to enable/disable functionality
  let processingInProgress = false; // Flag to prevent concurrent processing
  let operationCount = 0; // Counter for operations performed
  let trumpMap = {}; // Mapping object for replacements
  let mapKeys = []; // Array of keys from trumpMap

  // ===== INITIALIZATION =====

  /**
   * Main initialization function - checks dependencies and starts the extension
   * @public
   */
  function initialize() {
    // Initialize Logger with proper configuration based on DEBUG setting
    if (!window.Logger) {
      console.error('Trump Goggles Error: Logger module not found! Check script loading order.');
      return;
    }

    // Configure logger based on debug mode
    window.Logger.configure({
      enabled: true,
      debug: DEBUG,
      minLevel: DEBUG ? window.Logger.LEVELS.DEBUG : window.Logger.LEVELS.INFO,
      prefix: 'TrumpGoggles',
      useTimestamps: true,
      enhancedDisplay: true,
    });

    // Get shared global state, but don't store module state in window object
    // We access window properties for cross-script communication only
    if (window.trumpGogglesInitialized) {
      window.Logger.info('Already initialized by another script');
      return;
    }

    // Set global initialization flag
    window.trumpGogglesInitialized = true;
    window.Logger.info('Initializing with modular architecture');

    try {
      const initTimer = window.Logger.time('initialization');

      // Verify that required modules are available
      if (!window.DOMProcessor) {
        window.Logger.error('DOMProcessor module not found! Check script loading order.');
        return;
      }

      if (!window.TextProcessor) {
        window.Logger.error('TextProcessor module not found! Check script loading order.');
        return;
      }

      // First try to use the TrumpMappings module
      if (window.TrumpMappings && typeof window.TrumpMappings.getReplacementMap === 'function') {
        // Use new module API
        window.Logger.debug('Using TrumpMappings module API');
        trumpMap = window.TrumpMappings.getReplacementMap();
        mapKeys = window.TrumpMappings.getKeys();
      }
      // Fallback to legacy window.buildTrumpMap function
      else if (typeof window.buildTrumpMap === 'function') {
        // Using deprecated legacy function
        window.Logger.warn('Using legacy buildTrumpMap function. Consider upgrading.');
        trumpMap = window.buildTrumpMap();
        mapKeys = Object.keys(trumpMap);
      }
      // No mapping functionality available
      else {
        window.Logger.error(
          'No mapping functionality found! ' +
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

      // Record initialization completion time
      initTimer.stop('completed', {
        mapKeys: mapKeys.length,
        debug: DEBUG,
      });
    } catch (error) {
      window.Logger.error('Error initializing extension', error);
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
      if (window.Logger) {
        window.Logger.debug('Skipping page processing', {
          enabled,
          processingInProgress,
          operationCount,
          limit: MAX_OPERATIONS_PER_PAGE,
        });
      }
      return;
    }

    // Set the processing flag to prevent concurrent processing
    processingInProgress = true;

    // Create a performance timer if Logger is available
    const processTimer = window.Logger ? window.Logger.time('page_processing') : null;

    try {
      window.Logger.info('Processing page content', {
        rootNodeId: rootNode.id || 'unknown',
        operationCount,
      });

      // Create protected callback for text node processing
      const processTextNodeSafely = window.Logger.protect(
        (textNode) => {
          // Skip if we've hit the operation limit
          if (operationCount >= MAX_OPERATIONS_PER_PAGE) {
            return false;
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
        'text node processing',
        false // fallback to no processing on error
      );

      // Process the DOM in chunks with the protected callback
      await window.DOMProcessor.processInChunks(rootNode, processTextNodeSafely, {
        chunkSize: DEFAULT_CHUNK_SIZE,
        timeSliceMs: TIME_SLICE_MS,
        skipProcessed: true,
      });

      // Log processing completion
      window.Logger.info(`Page processing completed with ${operationCount} operations`);

      // Stop the performance timer if we created one
      if (processTimer) {
        processTimer.stop('completed', { operationCount });
      }
    } catch (error) {
      window.Logger.error('Error processing page', error);

      // Stop the performance timer with error status if we created one
      if (processTimer) {
        processTimer.stop('failed', { error: error.message });
      }
    } finally {
      // Reset the processing flag when done
      processingInProgress = false;
    }
  }

  // ===== MUTATION OBSERVER =====

  /**
   * Sets up the MutationObserverManager to handle dynamically added content.
   *
   * @private
   * @returns {void}
   */
  function setupMutationObserver() {
    // Verify that the MutationObserverManager module is available
    if (!window.MutationObserverManager) {
      window.Logger.error('MutationObserverManager module not found! Check script loading order.');
      return;
    }

    window.Logger.debug('Setting up mutation observer');

    // Helper function to process collected nodes from mutations
    const processMutationNodes = window.Logger.protect(function (nodesToProcess) {
      // Don't process if disabled or max operations reached
      if (!enabled || operationCount >= MAX_OPERATIONS_PER_PAGE) {
        window.Logger.debug('Skipping mutation processing', {
          enabled,
          operationCount,
          limit: MAX_OPERATIONS_PER_PAGE,
        });
        return;
      }

      // Track if we're already processing to prevent concurrent processing
      if (processingInProgress) {
        window.Logger.debug('Skipping mutation processing, already in progress');
        return;
      }

      processingInProgress = true;
      const mutationTimer = window.Logger.time('mutation_processing');

      try {
        window.Logger.debug(`Processing ${nodesToProcess.size} mutation nodes`);

        // Process all nodes in the set
        for (const node of nodesToProcess) {
          // Skip if we've hit the operation limit
          if (operationCount >= MAX_OPERATIONS_PER_PAGE) {
            window.Logger.debug('Operation limit reached, stopping mutation processing');
            break;
          }

          // Process based on node type
          if (node.nodeType === 1) {
            // Element node - process its subtree
            window.Logger.debug('Processing element node subtree', {
              nodeType: 'element',
              nodeId: node.id || 'unknown',
            });
            processPage(node);
          } else if (node.nodeType === 3 && !window.DOMProcessor.isEditableNode(node)) {
            // Text node - process directly if not editable
            window.Logger.debug('Processing text node directly', {
              nodeType: 'text',
              nodeValue: node.nodeValue ? node.nodeValue.substring(0, 20) + '...' : 'empty',
              parentId: node.parentNode ? node.parentNode.id || 'unknown' : 'unknown',
            });

            // Protect text processing with error boundary
            window.Logger.protect(
              () => {
                window.TextProcessor.processTextNode(node, trumpMap, mapKeys, {
                  useCache: true,
                  earlyBailout: true,
                  onProcessed: () => {
                    operationCount++;
                    window.DOMProcessor.markProcessed(node);
                  },
                });
              },
              'text node mutation processing',
              null // no fallback needed
            )();
          }
        }

        mutationTimer.stop('completed', { nodeCount: nodesToProcess.size });
      } catch (error) {
        window.Logger.error('Error processing mutation nodes', error);
        mutationTimer.stop('failed', { error: error.message });
      } finally {
        processingInProgress = false;
      }
    }, 'mutation nodes processing');

    // Create a filter function to identify which mutations to process
    const mutationFilter = window.Logger.protect(
      function (mutation) {
        // Skip if mutation is on our kill switch
        if (mutation.target.id === 'trump-goggles-kill-switch') {
          return false;
        }

        // Skip processed nodes
        if (window.DOMProcessor.isProcessed(mutation.target)) {
          return false;
        }

        // Keep mutation if it's a childList mutation with added nodes or a characterData mutation
        return (
          (mutation.type === 'childList' && mutation.addedNodes.length > 0) ||
          (mutation.type === 'characterData' &&
            mutation.target.nodeType === 3 &&
            !window.DOMProcessor.isEditableNode(mutation.target))
        );
      },
      'mutation filtering',
      false
    );

    // Create a callback function to handle batched mutations
    const handleMutations = window.Logger.protect(function (mutations) {
      // Skip if disabled or max operations reached
      if (!enabled || operationCount >= MAX_OPERATIONS_PER_PAGE) {
        window.Logger.debug('Skipping mutations handling', {
          enabled,
          operationCount,
          mutationCount: mutations.length,
        });
        return;
      }

      window.Logger.debug(`Handling ${mutations.length} mutations`);
      const handleTimer = window.Logger.time('mutations_handling');

      try {
        // Collect nodes to process from mutations
        const nodesToProcess = new Set();

        // Process each mutation
        for (const mutation of mutations) {
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
        }

        // Process collected nodes if there are any
        if (nodesToProcess.size > 0) {
          window.Logger.debug(`Collected ${nodesToProcess.size} nodes to process`);
          processMutationNodes(nodesToProcess);
        } else {
          window.Logger.debug('No nodes to process from mutations');
        }

        handleTimer.stop('completed', {
          nodeCount: nodesToProcess.size,
          mutationCount: mutations.length,
        });
      } catch (error) {
        window.Logger.error('Error handling mutations', error);
        handleTimer.stop('failed', { error: error.message });
      }
    }, 'mutations handling');

    // Initialize the MutationObserverManager with protected callbacks
    const initResult = window.MutationObserverManager.initialize({
      callback: handleMutations,
      processFilter: mutationFilter,
      batchSize: DEFAULT_CHUNK_SIZE,
      debounceMs: DEFAULT_DEBOUNCE_MS,
      killSwitchId: 'trump-goggles-kill-switch',
      debug: DEBUG,
    });

    if (!initResult) {
      window.Logger.error('Failed to initialize MutationObserverManager');
      return;
    }

    window.Logger.info('MutationObserverManager initialized successfully');

    // Start observing the document body
    if (document.body) {
      const startResult = window.MutationObserverManager.start(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
      });

      if (startResult) {
        window.Logger.info('Started observing document body');
      } else {
        window.Logger.error('Failed to start observing document body');
      }
    } else {
      // If document.body is not available yet, wait for it
      window.Logger.info('Document body not available, adding DOMContentLoaded listener');

      document.addEventListener('DOMContentLoaded', () => {
        window.Logger.info('DOMContentLoaded fired, starting observation');

        const startResult = window.MutationObserverManager.start(document.body, {
          childList: true,
          subtree: true,
          characterData: true,
        });

        if (startResult) {
          window.Logger.info('Started observing document body after DOMContentLoaded');
        } else {
          window.Logger.error('Failed to start observing document body after DOMContentLoaded');
        }
      });
    }
  }

  // ===== DEBUGGING TOOLS =====

  /**
   * Create and add a kill switch to quickly disable the extension if needed
   *
   * @private
   */
  function addKillSwitch() {
    window.Logger.debug('Adding kill switch for debug mode');

    try {
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

      // Add debug stats button next to kill switch
      const statsButton = document.createElement('div');
      statsButton.id = 'trump-goggles-stats';
      statsButton.style.position = 'fixed';
      statsButton.style.bottom = '10px';
      statsButton.style.right = '160px';
      statsButton.style.backgroundColor = 'rgba(0, 0, 255, 0.7)';
      statsButton.style.color = 'white';
      statsButton.style.padding = '5px 10px';
      statsButton.style.borderRadius = '5px';
      statsButton.style.fontSize = '12px';
      statsButton.style.fontFamily = 'Arial, sans-serif';
      statsButton.style.cursor = 'pointer';
      statsButton.style.zIndex = '9999999';
      statsButton.style.display = DEBUG ? 'block' : 'none'; // Only show in debug mode
      statsButton.textContent = 'Show Stats';

      // Protected event handler for kill switch
      const onKillSwitchClick = window.Logger.protect(() => {
        enabled = false;
        killSwitch.textContent = 'Trump Goggles Disabled';
        killSwitch.style.backgroundColor = 'rgba(128, 128, 128, 0.7)';

        // Stop the mutation observer
        if (window.MutationObserverManager && window.MutationObserverManager.isActive()) {
          window.MutationObserverManager.stop();
        }

        window.Logger.warn('Extension disabled via kill switch');
      }, 'kill switch click handler');

      // Protected event handler for stats button
      const onStatsButtonClick = window.Logger.protect(() => {
        const stats = window.Logger.getStats();
        const timestamp = new Date().toISOString();

        const statsText = `
          Trump Goggles Stats (${timestamp})
          --------------------------------
          Operations: ${operationCount}/${MAX_OPERATIONS_PER_PAGE}
          Observer State: ${window.MutationObserverManager ? window.MutationObserverManager.getState() : 'unknown'}
          Pending Mutations: ${window.MutationObserverManager ? window.MutationObserverManager.getPendingCount() : 'unknown'}
          
          Log Counts:
            DEBUG: ${stats.counts.debug}
            INFO: ${stats.counts.info}
            WARN: ${stats.counts.warn}
            ERROR: ${stats.counts.error}
            
          Last Error: ${stats.lastError || 'none'}
          Last Error Time: ${stats.lastErrorTime || 'none'}
        `;

        console.group('Trump Goggles Stats');
        console.log(statsText);
        console.groupEnd();

        // Create a popup with stats
        const popup = document.createElement('pre');
        popup.style.position = 'fixed';
        popup.style.top = '50%';
        popup.style.left = '50%';
        popup.style.transform = 'translate(-50%, -50%)';
        popup.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        popup.style.color = 'white';
        popup.style.padding = '20px';
        popup.style.borderRadius = '5px';
        popup.style.fontSize = '14px';
        popup.style.fontFamily = 'monospace';
        popup.style.whiteSpace = 'pre';
        popup.style.zIndex = '9999999';
        popup.style.maxHeight = '80vh';
        popup.style.overflow = 'auto';
        popup.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.5)';
        popup.textContent = statsText;

        // Add close button
        const closeButton = document.createElement('button');
        closeButton.textContent = 'Close';
        closeButton.style.position = 'absolute';
        closeButton.style.top = '10px';
        closeButton.style.right = '10px';
        closeButton.style.padding = '5px 10px';
        closeButton.style.backgroundColor = 'rgba(255, 0, 0, 0.7)';
        closeButton.style.border = 'none';
        closeButton.style.borderRadius = '3px';
        closeButton.style.color = 'white';
        closeButton.style.cursor = 'pointer';

        closeButton.addEventListener('click', () => {
          document.body.removeChild(popup);
        });

        popup.appendChild(closeButton);
        document.body.appendChild(popup);

        window.Logger.debug('Displayed stats popup');
      }, 'stats button click handler');

      // Add event listeners
      killSwitch.addEventListener('click', onKillSwitchClick);
      statsButton.addEventListener('click', onStatsButtonClick);

      // Add to document
      document.body.appendChild(killSwitch);
      document.body.appendChild(statsButton);

      window.Logger.debug('Kill switch and stats button added to the page');
    } catch (error) {
      window.Logger.error('Error adding kill switch', error);
    }
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
    window.Logger.info('Extension enabled');

    // Resume mutation observation if MutationObserverManager exists
    if (window.MutationObserverManager && !window.MutationObserverManager.isActive()) {
      try {
        // If it's paused, resume it
        if (
          window.MutationObserverManager.getState() === window.MutationObserverManager.STATES.PAUSED
        ) {
          window.Logger.debug('Resuming paused mutation observer');
          const resumed = window.MutationObserverManager.resume();

          if (resumed) {
            window.Logger.info('Mutation observer resumed successfully');
          } else {
            window.Logger.error('Failed to resume mutation observer');
          }
        }
        // Otherwise start it fresh
        else {
          window.Logger.debug('Starting new mutation observer');
          const started = window.MutationObserverManager.start(document.body, {
            childList: true,
            subtree: true,
            characterData: true,
          });

          if (started) {
            window.Logger.info('Mutation observer started successfully');
          } else {
            window.Logger.error('Failed to start mutation observer');
          }
        }
      } catch (error) {
        window.Logger.error('Error enabling mutation observer', error);
      }
    }

    // Reset stats when enabled
    if (window.Logger) {
      window.Logger.resetStats();
    }
  }

  /**
   * Disable the extension
   *
   * @public
   * @returns {void}
   */
  function disable() {
    enabled = false;
    window.Logger.info('Extension disabled');

    // Pause mutation observation if MutationObserverManager exists
    if (window.MutationObserverManager && window.MutationObserverManager.isActive()) {
      try {
        window.Logger.debug('Pausing mutation observer');
        const paused = window.MutationObserverManager.pause();

        if (paused) {
          window.Logger.info('Mutation observer paused successfully');
        } else {
          window.Logger.error('Failed to pause mutation observer');
        }
      } catch (error) {
        window.Logger.error('Error disabling mutation observer', error);
      }
    }
  }

  /**
   * Check if the extension is enabled
   *
   * @public
   * @returns {boolean} True if enabled, false otherwise
   */
  function isEnabled() {
    window.Logger.debug(`Extension status checked: ${enabled ? 'enabled' : 'disabled'}`);
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
    // Use the Logger.protectAsync to wrap the entire function
    return await window.Logger.protectAsync(
      async () => {
        const root = options.root || document.body;
        const skipInteractiveElements = options.skipInteractiveElements !== false;
        const chunkSize = options.chunkSize || DEFAULT_CHUNK_SIZE;
        const processingDelay = options.processingDelay || TIME_SLICE_MS;

        // Skip if disabled
        if (!enabled) {
          window.Logger.debug('Processing skipped, extension is disabled');
          return 0;
        }

        window.Logger.info('Processing DOM subtree', {
          rootId: root.id || 'unknown',
          skipInteractiveElements,
          chunkSize,
          processingDelay,
        });

        const processTimer = window.Logger.time('custom_process');
        let replacementCount = 0;

        try {
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

          // Create protected callback for text node processing
          const processTextNode = window.Logger.protect(
            (textNode) => {
              const replaced = window.TextProcessor.processTextNode(textNode, trumpMap, mapKeys, {
                useCache: true,
                earlyBailout: true,
              });

              if (replaced) {
                replacementCount++;
              }
            },
            'custom process text node',
            null // no fallback needed
          );

          // Process the DOM tree
          await window.DOMProcessor.processInChunks(root, processTextNode, {
            chunkSize: chunkSize,
            timeSliceMs: processingDelay,
            skipProcessed: true,
            skipTags: skipTags,
          });

          window.Logger.info(`Custom processing completed with ${replacementCount} replacements`);
          processTimer.stop('completed', { replacementCount });

          return replacementCount;
        } catch (error) {
          window.Logger.error('Error during custom processing', error);
          processTimer.stop('failed', { error: error.message });
          throw error;
        }
      },
      'process function',
      0
    )();
  }

  /**
   * Reprocess all nodes, including those already processed
   *
   * @public
   * @param {Node} [root=document.body] - Root node to reprocess
   * @returns {Promise<number>} - Promise resolving to the number of replacements made
   */
  async function reprocessAll(root = document.body) {
    // Use the Logger.protectAsync to wrap the entire function
    return await window.Logger.protectAsync(
      async () => {
        // Skip if disabled
        if (!enabled) {
          window.Logger.debug('Reprocessing skipped, extension is disabled');
          return 0;
        }

        window.Logger.info('Reprocessing all nodes', {
          rootId: root.id || 'unknown',
        });

        const reprocessTimer = window.Logger.time('reprocess_all');

        try {
          // Reset the processed state for all nodes
          window.Logger.debug('Resetting processed state for all nodes');
          window.DOMProcessor.resetProcessedState(root);

          // Clear the text processor cache
          window.Logger.debug('Clearing text processor cache');
          window.TextProcessor.clearCache();

          // Reset operation count to allow full reprocessing
          window.Logger.debug('Resetting operation count');
          operationCount = 0;

          // Process the DOM tree
          const replacementCount = await process({
            root: root,
            skipInteractiveElements: true,
            chunkSize: DEFAULT_CHUNK_SIZE,
            processingDelay: TIME_SLICE_MS,
          });

          window.Logger.info(`Reprocessing completed with ${replacementCount} replacements`);
          reprocessTimer.stop('completed', { replacementCount });

          return replacementCount;
        } catch (error) {
          window.Logger.error('Error during reprocessing', error);
          reprocessTimer.stop('failed', { error: error.message });
          throw error;
        }
      },
      'reprocessAll function',
      0
    )();
  }

  /**
   * Enables debug mode with enhanced logging and UI controls
   *
   * @public
   * @returns {void}
   */
  function enableDebugMode() {
    // Enable debug mode for Logger
    if (window.Logger) {
      window.Logger.enableDebugMode();
    }

    // Show the kill switch and stats button if they exist
    const killSwitch = document.getElementById('trump-goggles-kill-switch');
    if (killSwitch) {
      killSwitch.style.display = 'block';
    } else {
      // Create kill switch if it doesn't exist
      addKillSwitch();
    }

    const statsButton = document.getElementById('trump-goggles-stats');
    if (statsButton) {
      statsButton.style.display = 'block';
    }

    // Update internal debug flag
    window.Logger.info('Debug mode enabled');
  }

  /**
   * Disables debug mode
   *
   * @public
   * @returns {void}
   */
  function disableDebugMode() {
    // Disable debug mode for Logger
    if (window.Logger) {
      window.Logger.disableDebugMode();
    }

    // Hide the kill switch and stats button
    const killSwitch = document.getElementById('trump-goggles-kill-switch');
    if (killSwitch) {
      killSwitch.style.display = 'none';
    }

    const statsButton = document.getElementById('trump-goggles-stats');
    if (statsButton) {
      statsButton.style.display = 'none';
    }

    window.Logger.info('Debug mode disabled');
  }

  /**
   * Gets diagnostic information about the extension
   *
   * @public
   * @returns {Object} Diagnostic information
   */
  function getDiagnostics() {
    const diagnostics = {
      enabled,
      operationCount,
      timestamp: new Date().toISOString(),
      modules: {
        Logger: !!window.Logger,
        ErrorHandler: !!window.ErrorHandler,
        TrumpMappings: !!window.TrumpMappings,
        DOMProcessor: !!window.DOMProcessor,
        TextProcessor: !!window.TextProcessor,
        MutationObserverManager: !!window.MutationObserverManager,
      },
    };

    // Add Logger stats if available
    if (window.Logger) {
      diagnostics.loggerStats = window.Logger.getStats();
    }

    // Add ErrorHandler stats if available
    if (window.ErrorHandler) {
      diagnostics.errorStats = window.ErrorHandler.getStats();
    }

    // Add MutationObserver stats if available
    if (window.MutationObserverManager) {
      diagnostics.observerState = window.MutationObserverManager.getState();
      diagnostics.pendingMutations = window.MutationObserverManager.getPendingCount();
    }

    return diagnostics;
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

    // Debug and diagnostics
    enableDebugMode: enableDebugMode,
    disableDebugMode: disableDebugMode,
    getDiagnostics: getDiagnostics,
  };
})();

// Export the module to window for backward compatibility
window.TrumpGoggles = TrumpGoggles;

// Start the extension when the script loads
TrumpGoggles.initialize();
