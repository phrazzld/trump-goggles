/**
 * Error Handler Module - Provides global error handling capabilities
 *
 * This module implements centralized error handling for unhandled exceptions
 * and promise rejections, helping to prevent silent failures and improve reliability.
 *
 * @version 3.0.0
 */

// ErrorHandler module pattern
const ErrorHandler = (function () {
  'use strict';

  // ===== CONSTANTS AND CONFIGURATION =====

  // Default configuration
  const DEFAULT_CONFIG = {
    enabled: true, // Master toggle for error handling
    captureGlobalErrors: true, // Capture window.onerror events
    captureRejections: true, // Capture unhandled promise rejections
    logErrors: true, // Log errors to console via Logger
    attemptRecovery: true, // Try to recover from errors when possible
    maxErrors: 10, // Maximum number of errors to handle before disabling
    maxStackTraceDepth: 20, // Maximum depth of stack traces to log
  };

  // ===== MODULE INTERNAL STATE =====

  // Module configuration
  let config = { ...DEFAULT_CONFIG };

  // Module state
  let errorCount = 0;
  let errorHistory = [];
  let isInitialized = false;

  // Original handlers (to restore when disabled)
  let originalOnError = null;
  let originalOnUnhandledRejection = null;

  // ===== PRIVATE METHODS =====

  /**
   * Formats an error for logging
   *
   * @private
   * @param {Error} error - The error to format
   * @returns {Object} Formatted error object
   */
  function formatError(error) {
    // Basic error info
    const formattedError = {
      message: error.message || 'Unknown error',
      name: error.name || 'Error',
      timestamp: new Date().toISOString(),
      stack: null,
    };

    // Process stack trace if available
    if (error.stack) {
      // Get stack trace lines, limiting depth
      const stackLines = error.stack.split('\n').slice(0, config.maxStackTraceDepth);

      formattedError.stack = stackLines;
    }

    // Add additional properties if available
    if (error.fileName) formattedError.fileName = error.fileName;
    if (error.lineNumber) formattedError.lineNumber = error.lineNumber;
    if (error.columnNumber) formattedError.columnNumber = error.columnNumber;
    if (error.code) formattedError.code = error.code;

    return formattedError;
  }

  /**
   * Records an error in history
   *
   * @private
   * @param {Error} error - The error to record
   * @param {string} [source='unknown'] - Source of the error
   * @returns {void}
   */
  function recordError(error, source = 'unknown') {
    // Increment error count
    errorCount++;

    // Format the error
    const formattedError = formatError(error);
    formattedError.source = source;

    // Add to history, limiting size
    errorHistory.unshift(formattedError);
    if (errorHistory.length > 20) {
      errorHistory.pop();
    }

    // Log the error if logging is enabled and Logger is available
    if (config.logErrors && window.Logger) {
      window.Logger.error(`Unhandled error from ${source}`, {
        error: formattedError,
      });
    }

    // Disable error handling if we've hit the max error count
    if (config.maxErrors > 0 && errorCount >= config.maxErrors) {
      if (window.Logger) {
        window.Logger.warn(
          `Maximum error count (${config.maxErrors}) reached, disabling error handler`
        );
      }
      disable();
    }
  }

  /**
   * Handles global window errors
   *
   * @private
   * @param {string} message - Error message
   * @param {string} source - File where the error occurred
   * @param {number} lineno - Line number where the error occurred
   * @param {number} colno - Column number where the error occurred
   * @param {Error} error - The actual error object
   * @returns {boolean} Whether the error was handled
   */
  function handleGlobalError(message, source, lineno, colno, error) {
    // Create an error object if one wasn't provided
    if (!error) {
      error = new Error(message);
      error.fileName = source;
      error.lineNumber = lineno;
      error.columnNumber = colno;
    }

    // Record the error
    recordError(error, 'window.onerror');

    // Call the original handler if it exists
    if (typeof originalOnError === 'function') {
      return originalOnError(message, source, lineno, colno, error);
    }

    // Return true to prevent the error from showing in the console
    // since we've already logged it through the Logger
    return config.logErrors;
  }

  /**
   * Handles unhandled promise rejections
   *
   * @private
   * @param {PromiseRejectionEvent} event - The rejection event
   * @returns {void}
   */
  function handleUnhandledRejection(event) {
    // Get the rejection reason
    const reason = event.reason;

    // Create an error object if the reason isn't already one
    let error;
    if (reason instanceof Error) {
      error = reason;
    } else {
      error = new Error('Unhandled promise rejection');
      error.reason = reason;
    }

    // Record the error
    recordError(error, 'unhandledrejection');

    // Call the original handler if it exists
    if (typeof originalOnUnhandledRejection === 'function') {
      originalOnUnhandledRejection(event);
    }
  }

  // ===== PUBLIC API =====

  /**
   * Configures the error handler with custom options
   *
   * @public
   * @param {Object} options - Custom configuration options
   * @returns {Object} The updated configuration
   */
  function configure(options = {}) {
    // Merge options with current config
    config = { ...config, ...options };

    // Log the configuration change if debug mode is enabled
    if (window.Logger && window.Logger.debug) {
      window.Logger.debug('ErrorHandler configuration updated', config);
    }

    return config;
  }

  /**
   * Initializes the error handler
   *
   * @public
   * @param {Object} [options] - Configuration options
   * @returns {boolean} Whether initialization was successful
   */
  function initialize(options = {}) {
    // If already initialized, just update the config
    if (isInitialized) {
      configure(options);
      return true;
    }

    // Update configuration
    configure(options);

    try {
      // Save original handlers
      originalOnError = window.onerror;
      originalOnUnhandledRejection = window.onunhandledrejection;

      // Set up global error handlers if enabled
      if (config.captureGlobalErrors) {
        window.onerror = handleGlobalError;
      }

      // Set up unhandled promise rejection handler if enabled
      if (config.captureRejections) {
        window.onunhandledrejection = handleUnhandledRejection;
      }

      // Mark as initialized
      isInitialized = true;

      // Log initialization if Logger is available
      if (window.Logger) {
        window.Logger.info('ErrorHandler initialized', config);
      }

      return true;
    } catch (error) {
      // Log initialization error if Logger is available
      if (window.Logger) {
        window.Logger.error('Failed to initialize ErrorHandler', error);
      } else {
        console.error('Failed to initialize ErrorHandler', error);
      }

      return false;
    }
  }

  /**
   * Disables the error handler and restores original handlers
   *
   * @public
   * @returns {void}
   */
  function disable() {
    if (!isInitialized) {
      return;
    }

    // Restore original handlers
    window.onerror = originalOnError;
    window.onunhandledrejection = originalOnUnhandledRejection;

    // Update config and state
    config.enabled = false;
    isInitialized = false;

    // Log disabling if Logger is available
    if (window.Logger) {
      window.Logger.info('ErrorHandler disabled');
    }
  }

  /**
   * Manually report an error to the error handler
   *
   * @public
   * @param {Error} error - The error to report
   * @param {string} [source='manual'] - Source of the error
   * @returns {void}
   */
  function reportError(error, source = 'manual') {
    if (!config.enabled || !isInitialized) {
      return;
    }

    recordError(error, source);
  }

  /**
   * Get error history
   *
   * @public
   * @returns {Array} Array of recorded errors
   */
  function getErrorHistory() {
    return [...errorHistory];
  }

  /**
   * Get error statistics
   *
   * @public
   * @returns {Object} Error statistics
   */
  function getStats() {
    return {
      errorCount,
      recentErrors: errorHistory.length,
      isEnabled: config.enabled && isInitialized,
      maxErrors: config.maxErrors,
    };
  }

  /**
   * Reset error history and counter
   *
   * @public
   * @returns {void}
   */
  function resetStats() {
    errorCount = 0;
    errorHistory = [];

    // Log reset if Logger is available
    if (window.Logger) {
      window.Logger.debug('ErrorHandler stats reset');
    }
  }

  // Return the public API
  return {
    initialize: initialize,
    configure: configure,
    disable: disable,
    reportError: reportError,
    getErrorHistory: getErrorHistory,
    getStats: getStats,
    resetStats: resetStats,
  };
})();

// Export the module
window.ErrorHandler = ErrorHandler;

// Initialize the error handler
document.addEventListener('DOMContentLoaded', function () {
  // Delay initialization slightly to ensure Logger is loaded first
  setTimeout(function () {
    if (window.ErrorHandler && !window.errorHandlerInitialized) {
      window.errorHandlerInitialized = true;
      window.ErrorHandler.initialize();
    }
  }, 50);
});
