/**
 * Mutation Observer Module - Responsible for observing DOM changes
 *
 * This module provides a clean, efficient implementation of MutationObserver with batched processing,
 * clear lifecycle management, and protection against infinite mutation loops.
 *
 * @version 3.0.0
 *
 * @typedef {Object} MutationObserverOptions
 * @property {Function} callback - Callback function for processing mutations
 * @property {number} [batchSize=20] - Number of mutations to process in a batch
 * @property {number} [debounceMs=50] - Debounce time for mutation processing
 * @property {number} [throttleMs=100] - Throttle time for mutation processing in rapid changes
 * @property {number} [maxBufferSize=100] - Maximum size of the mutation buffer
 * @property {Function|null} [processFilter=null] - Function to filter mutations to process
 * @property {string} [killSwitchId='trump-goggles-kill-switch'] - ID of element to avoid processing
 * @property {boolean} [debug=false] - Enable debug logging
 */

// MutationObserverManager module pattern
const MutationObserverManager = (function () {
  'use strict';

  /**
   * Gets or initializes the logger instance for this module
   *
   * @private
   * @returns Logger instance or null if LoggerFactory unavailable
   */
  function getLogger() {
    // Always check for LoggerFactory first (don't cache for tests)
    if (window.LoggerFactory) {
      try {
        return window.LoggerFactory.getLogger('mutation-observer');
      } catch {
        // Fall back to legacy Logger if available
        if (window.Logger) {
          return window.Logger;
        }
      }
    }

    // If no LoggerFactory, try legacy Logger
    if (window.Logger) {
      return window.Logger;
    }

    return null;
  }

  // ===== CONSTANTS AND CONFIGURATION =====

  // Default mutation observer configuration
  const DEFAULT_CONFIG = {
    childList: true, // Watch for new nodes
    subtree: true, // Watch the entire subtree
    characterData: true, // Watch for text content changes
  };

  // Default performance settings
  const DEFAULT_BATCH_SIZE = 20; // Default number of mutations to process in a batch
  const DEFAULT_DEBOUNCE_MS = 50; // Default debounce time for mutation processing
  const DEFAULT_THROTTLE_MS = 100; // Default throttle time for mutation processing in rapid changes
  const DEFAULT_MAX_BUFFER_SIZE = 100; // Maximum size of the mutation buffer before forced processing

  // Observer states
  const STATES = {
    INACTIVE: 'inactive',
    ACTIVE: 'active',
    PAUSED: 'paused',
    PROCESSING: 'processing',
  };

  // ===== MODULE INTERNAL STATE =====

  // The MutationObserver instance
  /** @type {MutationObserver|null} */
  let observer = null;

  // Observer state
  /** @type {string} */
  let state = STATES.INACTIVE;

  // Target to observe
  /** @type {Node|null} */
  let observationTarget = null;

  // Current observation configuration
  /** @type {MutationObserverInit} */
  let observationConfig = DEFAULT_CONFIG;

  // Mutation buffers
  /** @type {MutationRecord[]} */
  let mutationBuffer = [];
  /** @type {MutationRecord[]} */
  let processingBuffer = [];

  // Processing flags
  /** @type {boolean} */
  let processingInProgress = false;
  /** @type {boolean} */
  let processingScheduled = false;

  // Debounce and throttle handlers
  /** @type {number|null} */
  let debounceTimer = null;
  /** @type {number|null} */
  let throttleTimer = null;
  /** @type {number} */
  let lastProcessingTime = 0;

  // Callback for mutation processing
  /** @type {((mutations: MutationRecord[]) => void)|null} */
  let mutationCallback = null;

  // User-provided options
  /** @type {MutationObserverOptions} */
  let options = {
    callback: () => {},
    batchSize: DEFAULT_BATCH_SIZE,
    debounceMs: DEFAULT_DEBOUNCE_MS,
    throttleMs: DEFAULT_THROTTLE_MS,
    maxBufferSize: DEFAULT_MAX_BUFFER_SIZE,
    processFilter: null, // Optional function to filter mutations to process
    killSwitchId: 'trump-goggles-kill-switch', // ID of element to avoid processing
    debug: false, // Debug mode flag
  };

  // ===== PRIVATE METHODS =====

  /**
   * Logs a debug message if debug mode is enabled
   *
   * @private
   * @param {string} message - The message to log
   * @param {*} [data] - Optional data to include in the log
   */
  function debugLog(message, data) {
    if (options.debug) {
      const currentLogger = getLogger();
      if (currentLogger) {
        currentLogger.debug(`Mutation observer: ${message}`, { data: data || '' });
      }
    }
  }

  /**
   * Handles mutations received from the MutationObserver
   *
   * @private
   * @param {MutationRecord[]} mutations - Array of mutation records
   */
  function handleMutations(mutations) {
    if (state === STATES.INACTIVE || state === STATES.PAUSED) {
      debugLog('Ignoring mutations, observer is', state);
      return;
    }

    debugLog(`Received ${mutations.length} mutations`);

    // Add mutations to the buffer
    mutationBuffer = mutationBuffer.concat(mutations);

    // If buffer exceeds max size, process immediately
    const maxSize = options.maxBufferSize || DEFAULT_MAX_BUFFER_SIZE;
    if (mutationBuffer.length > maxSize) {
      debugLog(`Buffer size ${mutationBuffer.length} exceeds max size, processing immediately`);
      processMutationsImmediately();
      return;
    }

    // Schedule processing with debounce and throttle
    scheduleProcessing();
  }

  /**
   * Schedules processing of mutations with debounce and throttle
   *
   * @private
   */
  function scheduleProcessing() {
    // If processing is already scheduled, do nothing
    if (processingScheduled) {
      return;
    }

    // Mark that processing is scheduled
    processingScheduled = true;

    // Clear any existing debounce timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Check if we should throttle
    const now = Date.now();
    const timeSinceLastProcessing = now - lastProcessingTime;
    const throttleMs = options.throttleMs || DEFAULT_THROTTLE_MS;

    if (timeSinceLastProcessing < throttleMs) {
      // We've processed recently, apply throttling
      const throttleDelay = throttleMs - timeSinceLastProcessing;
      debugLog(`Throttling mutation processing for ${throttleDelay}ms`);

      // @ts-ignore - setTimeout returns number in Node.js but Timeout in browser
      throttleTimer = setTimeout(() => {
        const debounceMs = options.debounceMs || DEFAULT_DEBOUNCE_MS;
        // @ts-ignore - setTimeout returns number in Node.js but Timeout in browser
        debounceTimer = setTimeout(processMutationBatch, debounceMs);
      }, throttleDelay);
    } else {
      // No need to throttle, just apply debounce
      const debounceMs = options.debounceMs || DEFAULT_DEBOUNCE_MS;
      debugLog(`Scheduling mutation processing with ${debounceMs}ms debounce`);
      // @ts-ignore - setTimeout returns number in Node.js but Timeout in browser
      debounceTimer = setTimeout(processMutationBatch, debounceMs);
    }
  }

  /**
   * Process mutations immediately, bypassing debounce and throttle
   *
   * @private
   */
  function processMutationsImmediately() {
    if (processingInProgress) {
      debugLog('Processing already in progress, skipping immediate processing');
      return;
    }

    // Clear any scheduled processing
    processingScheduled = false;
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }
    if (throttleTimer) {
      clearTimeout(throttleTimer);
      throttleTimer = null;
    }

    // Process the mutations
    processMutationBatch();
  }

  /**
   * Processes a batch of mutations from the buffer
   *
   * @private
   */
  function processMutationBatch() {
    // Reset scheduling flags
    processingScheduled = false;
    debounceTimer = null;
    throttleTimer = null;

    // If there are no mutations to process or processing is already in progress, return
    if (mutationBuffer.length === 0 || processingInProgress) {
      return;
    }

    // Update state and flags
    const previousState = state;
    state = STATES.PROCESSING;
    processingInProgress = true;
    lastProcessingTime = Date.now();

    try {
      // Move mutations from the main buffer to the processing buffer
      // This allows new mutations to be added to the main buffer while we process this batch
      processingBuffer = mutationBuffer.splice(0, options.batchSize);

      debugLog(`Processing ${processingBuffer.length} mutations`);

      // Filter the mutations if a filter is provided
      let mutationsToProcess = processingBuffer;
      if (typeof options.processFilter === 'function') {
        // @ts-ignore - Function type compatibility issue with filter predicate
        mutationsToProcess = processingBuffer.filter(options.processFilter);
        debugLog(`Filtered to ${mutationsToProcess.length} mutations`);
      }

      // Filter out mutations we want to ignore (e.g., on kill switch element)
      mutationsToProcess = mutationsToProcess.filter((mutation) => {
        // Skip if mutation is on our kill switch
        if (options.killSwitchId && mutation.target.id === options.killSwitchId) {
          return false;
        }
        return true;
      });

      // If we have a callback and mutations to process, call it
      if (mutationsToProcess.length > 0 && typeof mutationCallback === 'function') {
        // Temporarily disconnect to avoid infinite loops
        // This avoids mutations caused by processing being picked up by the observer
        if (observer) {
          debugLog('Disconnecting observer before processing');
          observer.disconnect();
        }

        // Process the mutations
        mutationCallback(mutationsToProcess);

        // Reconnect observer after processing if it was active
        if (previousState === STATES.ACTIVE && observer && observationTarget) {
          debugLog('Reconnecting observer after processing');
          observer.observe(observationTarget, observationConfig);
        }
      }
    } catch (error) {
      const currentLogger = getLogger();
      if (currentLogger) {
        currentLogger.error('Mutation observer: Error processing mutations', { error });
      }
    } finally {
      // Reset state and flags
      state = previousState;
      processingInProgress = false;

      // Clear the processing buffer
      processingBuffer = [];

      // If there are more mutations in the buffer, schedule another processing batch
      if (mutationBuffer.length > 0) {
        debugLog(`${mutationBuffer.length} mutations remaining in buffer, scheduling next batch`);
        scheduleProcessing();
      }
    }
  }

  /**
   * Creates and initializes the MutationObserver
   *
   * @private
   */
  function createObserver() {
    try {
      // Check if MutationObserver is supported
      if (typeof MutationObserver !== 'function') {
        const currentLogger = getLogger();
        if (currentLogger) {
          currentLogger.error('Mutation observer: MutationObserver not supported in this browser');
        }
        return false;
      }

      // Create a new observer instance
      observer = new MutationObserver(handleMutations);
      return true;
    } catch (error) {
      const currentLogger = getLogger();
      if (currentLogger) {
        currentLogger.error('Mutation observer: Error creating MutationObserver', { error });
      }
      observer = null;
      return false;
    }
  }

  // ===== PUBLIC API =====

  /**
   * Initializes the MutationObserver with custom options
   *
   * @public
   * @param {MutationObserverOptions} [customOptions] - Custom configuration options
   * @returns {boolean} Whether initialization was successful
   */
  function initialize(customOptions = { callback: () => {} }) {
    // Merge custom options with defaults
    options = {
      ...options,
      ...customOptions,
    };

    // Set the mutation callback
    if (typeof customOptions.callback === 'function') {
      // @ts-ignore - Function type compatibility issue
      mutationCallback = customOptions.callback;
    }

    debugLog('Initializing with options', options);

    // Create the observer
    return createObserver();
  }

  /**
   * Starts observing the specified target with optional configuration
   *
   * @public
   * @param {Node} target - The DOM node to observe
   * @param {MutationObserverInit} [config] - MutationObserver configuration
   * @returns {boolean} Whether observation started successfully
   */
  function start(target, config = DEFAULT_CONFIG) {
    // Don't do anything if already active
    if (state === STATES.ACTIVE) {
      debugLog('Observer already active, ignoring start');
      return true;
    }

    // Don't run in frames - focus only on the main document
    if (window !== window.top) {
      debugLog('Observer not starting in frame, only main document allowed');
      return false;
    }

    // Make sure we have a target
    if (!target) {
      const currentLogger = getLogger();
      if (currentLogger) {
        currentLogger.error('Mutation observer: No target specified for observation');
      }
      return false;
    }

    // Make sure we have an observer
    if (!observer) {
      if (!createObserver()) {
        return false;
      }
    }

    try {
      // Save target and config
      observationTarget = target;
      observationConfig = { ...DEFAULT_CONFIG, ...config };

      // Start observing
      // @ts-ignore: TS doesn't properly recognize that observer can't be null here
      observer.observe(target, observationConfig);

      // Update state
      state = STATES.ACTIVE;

      debugLog('Observer started on', target);
      return true;
    } catch (error) {
      const currentLogger = getLogger();
      if (currentLogger) {
        currentLogger.error('Mutation observer: Error starting observer', { error });
      }
      return false;
    }
  }

  /**
   * Stops the observer completely
   *
   * @public
   * @returns {void}
   */
  function stop() {
    debugLog('Stopping observer');

    // Disconnect the observer
    if (observer !== null) {
      // @ts-ignore: TS doesn't properly recognize this null check
      observer.disconnect();
    }

    // Clear any pending timers
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }
    if (throttleTimer) {
      clearTimeout(throttleTimer);
      throttleTimer = null;
    }

    // Reset state
    state = STATES.INACTIVE;
    processingScheduled = false;
    processingInProgress = false;

    // Clear buffers
    mutationBuffer = [];
    processingBuffer = [];
  }

  /**
   * Temporarily pauses observation without disconnecting
   *
   * @public
   * @returns {boolean} Whether pausing was successful
   */
  function pause() {
    if (state !== STATES.ACTIVE) {
      debugLog('Observer not active, cannot pause');
      return false;
    }

    debugLog('Pausing observer');

    // Disconnect the observer
    if (observer) {
      observer.disconnect();
    }

    // Update state
    state = STATES.PAUSED;

    return true;
  }

  /**
   * Resumes observation after pausing
   *
   * @public
   * @returns {boolean} Whether resuming was successful
   */
  function resume() {
    if (state !== STATES.PAUSED) {
      debugLog('Observer not paused, cannot resume');
      return false;
    }

    if (!observer || !observationTarget) {
      debugLog('Observer or target missing, cannot resume');
      return false;
    }

    try {
      debugLog('Resuming observer');

      // Resume observation
      observer.observe(observationTarget, observationConfig);

      // Update state
      state = STATES.ACTIVE;

      return true;
    } catch (error) {
      const currentLogger = getLogger();
      if (currentLogger) {
        currentLogger.error('Mutation observer: Error resuming observer', { error });
      }
      return false;
    }
  }

  /**
   * Processes any pending mutations immediately
   *
   * @public
   * @returns {boolean} Whether flush was successful
   */
  function flush() {
    if (mutationBuffer.length === 0) {
      debugLog('No mutations to flush');
      return true;
    }

    debugLog(`Flushing ${mutationBuffer.length} mutations`);
    processMutationsImmediately();
    return true;
  }

  /**
   * Checks if the observer is currently active
   *
   * @public
   * @returns {boolean} Whether the observer is active
   */
  function isActive() {
    return state === STATES.ACTIVE;
  }

  /**
   * Gets the current state of the observer
   *
   * @public
   * @returns {string} The current state
   */
  function getState() {
    return state;
  }

  /**
   * Gets the number of pending mutations
   *
   * @public
   * @returns {number} The number of pending mutations
   */
  function getPendingCount() {
    return mutationBuffer.length;
  }

  /**
   * Updates the option configuration
   *
   * @public
   * @param {Partial<MutationObserverOptions>} newOptions - New options to apply
   * @returns {MutationObserverOptions} The updated options
   */
  function updateOptions(newOptions) {
    if (!newOptions || typeof newOptions !== 'object') {
      return options;
    }

    debugLog('Updating options', newOptions);
    options = { ...options, ...newOptions };
    return options;
  }

  // Return the public API
  /** @type {MutationObserverManagerInterface} */
  return {
    initialize: initialize,
    start: start,
    stop: stop,
    pause: pause,
    resume: resume,
    flush: flush,
    isActive: isActive,
    getState: getState,
    getPendingCount: getPendingCount,
    updateOptions: updateOptions,
    STATES: STATES,
  };
})();

// Export the module
window.MutationObserverManager = MutationObserverManager;
