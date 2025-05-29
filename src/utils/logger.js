/**
 * Logger Module - Provides structured logging and error handling capabilities
 *
 * This module implements a centralized logging system with multiple severity levels,
 * configurable debug mode, and error boundaries for more robust extension operation.
 *
 * @version 3.0.0
 */

// Logger module pattern
const Logger = (function () {
  'use strict';

  // ===== CONSTANTS AND CONFIGURATION =====

  // Log severity levels
  const LEVELS = {
    DEBUG: 'debug',
    INFO: 'info',
    WARN: 'warn',
    ERROR: 'error',
  };

  // Current minimum log level
  // (DEBUG shows all logs, ERROR shows only errors)
  const LOG_LEVEL_PRIORITY = {
    [LEVELS.DEBUG]: 0,
    [LEVELS.INFO]: 1,
    [LEVELS.WARN]: 2,
    [LEVELS.ERROR]: 3,
  };

  // Default configuration
  const DEFAULT_CONFIG = {
    enabled: true, // Master toggle for logging
    minLevel: LEVELS.INFO, // Default minimum level to display
    debug: false, // Debug mode toggle
    prefix: 'TrumpGoggles', // Prefix for all log messages
    useTimestamps: true, // Add timestamps to log messages
    enhancedDisplay: true, // Use enhanced console formatting when available
    consoleOutput: true, // Log to console
    errorReporting: true, // Report errors
  };

  // ===== MODULE INTERNAL STATE =====

  // Module configuration
  let config = { ...DEFAULT_CONFIG };

  // Module statistics
  /** @type {{
    counts: {[key: string]: number},
    lastError: string | null,
    lastErrorTime: Date | null
  }} */
  const stats = {
    counts: {
      [LEVELS.DEBUG]: 0,
      [LEVELS.INFO]: 0,
      [LEVELS.WARN]: 0,
      [LEVELS.ERROR]: 0,
    },
    lastError: null,
    lastErrorTime: null,
  };

  // ===== PRIVATE METHODS =====

  /**
   * Checks if the given log level meets the minimum level threshold
   *
   * @private
   * @param {string} level - The log level to check
   * @returns {boolean} Whether this level should be logged
   */
  function shouldLog(level) {
    // If logging is disabled, don't log anything
    if (!config.enabled) {
      return false;
    }

    // Check if level meets or exceeds minimum level
    return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[config.minLevel];
  }

  /**
   * Formats a log message with prefix and optional timestamp
   *
   * @private
   * @param {string} message - The log message
   * @returns {string} The formatted message
   */
  function formatMessage(message) {
    let formattedMessage = `${config.prefix}: ${message}`;

    if (config.useTimestamps) {
      const now = new Date();
      const timestamp = now.toISOString();
      formattedMessage = `[${timestamp}] ${formattedMessage}`;
    }

    return formattedMessage;
  }

  /**
   * Core logging function
   *
   * @private
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {any} [data] - Optional data to include
   * @returns {void}
   */
  function logToConsole(level, message, data) {
    if (!shouldLog(level) || !config.consoleOutput) {
      return;
    }

    // Increment stats counter for this level
    stats.counts[level]++;

    // Get appropriate console method
    // @ts-ignore - Console methods can be accessed by string index
    const consoleMethod = console[level] || console.log;

    // Format the message
    const formattedMessage = formatMessage(message);

    // Log with or without data
    if (data !== undefined) {
      if (config.enhancedDisplay) {
        const styles =
          level === LEVELS.ERROR
            ? 'color: red; font-weight: bold;'
            : level === LEVELS.WARN
              ? 'color: orange; font-weight: bold;'
              : level === LEVELS.INFO
                ? 'color: blue;'
                : 'color: gray;';

        consoleMethod(`%c${formattedMessage}`, styles, data);
      } else {
        consoleMethod(formattedMessage, data);
      }
    } else {
      if (config.enhancedDisplay && (level === LEVELS.ERROR || level === LEVELS.WARN)) {
        const styles =
          level === LEVELS.ERROR
            ? 'color: red; font-weight: bold;'
            : 'color: orange; font-weight: bold;';
        consoleMethod(`%c${formattedMessage}`, styles);
      } else {
        consoleMethod(formattedMessage);
      }
    }

    // Store last error info
    if (level === LEVELS.ERROR) {
      stats.lastError = message;
      stats.lastErrorTime = new Date();
    }
  }

  // ===== ERROR BOUNDARY HELPERS =====

  /**
   * Creates an error boundary function to safely execute code
   *
   * @private
   * @template T
   * @param {(...args: any[]) => T} fn - The function to wrap with error boundary
   * @param {string} context - Description of the operation for error reporting
   * @param {T} [fallback] - Optional fallback value to return on error
   * @returns {(...args: any[]) => T} Wrapped function with error handling
   */
  function createErrorBoundary(fn, context, fallback) {
    /**
     * @this {any}
     * @returns {T}
     */
    // @ts-ignore: implicit undefined return issue
    return function (...args) {
      try {
        return fn.apply(this, args);
      } catch (error) {
        // Log the error with context
        if (error instanceof Error) {
          logToConsole(LEVELS.ERROR, `Error in ${context}: ${error.message}`, { error, args });
        } else {
          logToConsole(LEVELS.ERROR, `Error in ${context}: Unknown error`, { error, args });
        }

        // Return fallback value if provided
        // @ts-ignore: T|undefined compatibility issue with T
        return fallback;
      }
    };
  }

  /**
   * Creates an error boundary for async functions
   *
   * @private
   * @template T
   * @param {(...args: any[]) => Promise<T>} fn - Async function to wrap with error boundary
   * @param {string} context - Description of the operation for error reporting
   * @param {T} [fallback] - Optional fallback value to return on error
   * @returns {(...args: any[]) => Promise<T>} Wrapped async function with error handling
   */
  function createAsyncErrorBoundary(fn, context, fallback) {
    /**
     * @this {any}
     * @returns {Promise<T>}
     */
    // @ts-ignore: implicit undefined return issue
    return async function (...args) {
      try {
        return await fn.apply(this, args);
      } catch (error) {
        // Log the error with context
        if (error instanceof Error) {
          logToConsole(LEVELS.ERROR, `Error in async ${context}: ${error.message}`, {
            error,
            args,
          });
        } else {
          logToConsole(LEVELS.ERROR, `Error in async ${context}: Unknown error`, { error, args });
        }

        // Return fallback value if provided
        // @ts-ignore: T|undefined compatibility issue with T
        return fallback;
      }
    };
  }

  // ===== PERFORMANCE MONITORING =====

  /**
   * Creates a performance timer for measuring operation duration
   *
   * @private
   * @param {string} operationName - Name of the operation being timed
   * @returns {{ stop: (status?: string, additionalData?: any) => number }} Timer object with stop method
   */
  function createPerformanceTimer(operationName) {
    const startTime = performance.now();
    // Start date is not being used currently, removing to fix ESLint warning

    return {
      /**
       * Stops the timer and logs the elapsed time
       *
       * @param {string} [status='completed'] - Status of the operation
       * @param {any} [additionalData] - Additional data to log
       * @returns {number} Elapsed time in milliseconds
       */
      stop: function (status = 'completed', additionalData) {
        const endTime = performance.now();
        const elapsed = endTime - startTime;

        if (config.debug) {
          logToConsole(
            LEVELS.DEBUG,
            `Performance: ${operationName} ${status} in ${elapsed.toFixed(2)}ms`,
            additionalData
          );
        }

        return elapsed;
      },
    };
  }

  // ===== PUBLIC API =====

  /**
   * Configures the logger with custom options
   *
   * @public
   * @param {Object} options - Custom configuration options
   * @returns {Object} The updated configuration
   */
  function configure(options = {}) {
    // Merge options with current config
    config = { ...config, ...options };

    // Log the configuration change if debug mode is enabled
    if (config.debug) {
      logToConsole(LEVELS.DEBUG, 'Logger configuration updated', config);
    }

    return config;
  }

  /**
   * Enables debug mode, which shows all log levels and additional details
   *
   * @public
   * @returns {void}
   */
  function enableDebugMode() {
    configure({
      debug: true,
      minLevel: LEVELS.DEBUG,
    });

    logToConsole(LEVELS.INFO, 'Debug mode enabled');
  }

  /**
   * Disables debug mode, returning to default log levels
   *
   * @public
   * @returns {void}
   */
  function disableDebugMode() {
    const wasDebugEnabled = config.debug;

    configure({
      debug: false,
      minLevel: DEFAULT_CONFIG.minLevel,
    });

    if (wasDebugEnabled) {
      logToConsole(LEVELS.INFO, 'Debug mode disabled');
    }
  }

  /**
   * Logs a message at DEBUG level
   *
   * @public
   * @param {string} message - The message to log
   * @param {any} [data] - Optional data to include
   * @returns {void}
   */
  function debug(message, data) {
    logToConsole(LEVELS.DEBUG, message, data);
  }

  /**
   * Logs a message at INFO level
   *
   * @public
   * @param {string} message - The message to log
   * @param {any} [data] - Optional data to include
   * @returns {void}
   */
  function info(message, data) {
    logToConsole(LEVELS.INFO, message, data);
  }

  /**
   * Logs a message at WARN level
   *
   * @public
   * @param {string} message - The message to log
   * @param {any} [data] - Optional data to include
   * @returns {void}
   */
  function warn(message, data) {
    logToConsole(LEVELS.WARN, message, data);
  }

  /**
   * Logs a message at ERROR level
   *
   * @public
   * @param {string} message - The message to log
   * @param {any} [data] - Optional data to include
   * @returns {void}
   */
  function error(message, data) {
    logToConsole(LEVELS.ERROR, message, data);
  }

  /**
   * Wraps a function with error boundary protection
   *
   * @public
   * @template T
   * @template R
   * @param {(...args: T[]) => R} fn - The function to protect
   * @param {string} context - Description of the operation
   * @param {R} [fallback] - Optional fallback value to return on error
   * @returns {(...args: T[]) => R} Protected function
   */
  function protect(fn, context, fallback) {
    return createErrorBoundary(fn, context, fallback);
  }

  /**
   * Wraps an async function with error boundary protection
   *
   * @public
   * @template T
   * @template R
   * @param {(...args: T[]) => Promise<R>} fn - The async function to protect
   * @param {string} context - Description of the operation
   * @param {R} [fallback] - Optional fallback value to return on error
   * @returns {(...args: T[]) => Promise<R>} Protected async function
   */
  function protectAsync(fn, context, fallback) {
    return createAsyncErrorBoundary(fn, context, fallback);
  }

  /**
   * Creates a performance timer for measuring operation duration
   *
   * @public
   * @param {string} operationName - Name of the operation being timed
   * @returns {TimerInterface} Timer object with stop method
   */
  function time(operationName) {
    return createPerformanceTimer(operationName);
  }

  /**
   * Gets statistics about logger usage
   *
   * @public
   * @returns {LoggerStats} Statistics object
   */
  function getStats() {
    return { ...stats };
  }

  /**
   * Resets the logger statistics
   *
   * @public
   * @returns {void}
   */
  function resetStats() {
    Object.keys(stats.counts).forEach((level) => {
      stats.counts[level] = 0;
    });

    stats.lastError = null;
    stats.lastErrorTime = null;

    if (config.debug) {
      logToConsole(LEVELS.DEBUG, 'Logger statistics reset');
    }
  }

  /**
   * Timer interface for performance measurement
   * @typedef {Object} TimerInterface
   * @property {(status?: string, additionalData?: any) => number} stop - Stops the timer and returns elapsed time in milliseconds
   */

  /**
   * Logger statistics object
   * @typedef {Object} LoggerStats
   * @property {Record<string, number>} counts - Count of logs by level
   * @property {string|null} lastError - Last error message
   * @property {Date|null} lastErrorTime - Time of last error
   */

  /**
   * Logger interface for the Logger module
   * @typedef {Object} LoggerInterface
   * @property {(options?: object) => object} configure - Configure the logger
   * @property {() => void} enableDebugMode - Enable debug mode
   * @property {() => void} disableDebugMode - Disable debug mode
   * @property {(message: string, data?: any) => void} debug - Log debug message
   * @property {(message: string, data?: any) => void} info - Log info message
   * @property {(message: string, data?: any) => void} warn - Log warning message
   * @property {(message: string, data?: any) => void} error - Log error message
   * @property {<T, R>(fn: (...args: T[]) => R, context: string, fallback?: R) => (...args: T[]) => R} protect - Wrap function with error boundary
   * @property {<T, R>(fn: (...args: T[]) => Promise<R>, context: string, fallback?: R) => (...args: T[]) => Promise<R>} protectAsync - Wrap async function with error boundary
   * @property {(operationName: string) => TimerInterface} time - Create performance timer
   * @property {() => LoggerStats} getStats - Get logger statistics
   * @property {() => void} resetStats - Reset logger statistics
   * @property {{ DEBUG: string, INFO: string, WARN: string, ERROR: string }} LEVELS - Log levels constants
   */

  /** @type {LoggerInterface} */
  const loggerAPI = {
    // Configuration
    configure: configure,
    enableDebugMode: enableDebugMode,
    disableDebugMode: disableDebugMode,

    // Core logging methods
    debug: debug,
    info: info,
    warn: warn,
    error: error,

    // Error protection
    // @ts-ignore: Function type compatibility issue
    protect: protect,
    // @ts-ignore: Function type compatibility issue
    protectAsync: protectAsync,

    // Performance monitoring
    time: time,

    // Statistics
    getStats: getStats,
    resetStats: resetStats,

    // Constants
    LEVELS: LEVELS,
  };

  // Return the public API
  return loggerAPI;
})();

// Export the module
window.Logger = Logger;
