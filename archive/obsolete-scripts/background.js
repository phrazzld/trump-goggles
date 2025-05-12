/**
 * Trump Goggles - Background Script
 *
 * Handles browser extension functionality in the background context,
 * including icon clicks and extension lifecycle events.
 *
 * @version 3.0.0
 */

// Create a simple logger for the background script
// (Since we don't have access to the main Logger module in the background script)
const BackgroundLogger = {
  DEBUG: false,

  /**
   * Log a message to the console
   * @param {string} level - The log level (info, warn, error, debug)
   * @param {string} message - The message to log
   * @param {any} [data] - Optional data to include
   */
  log: function (level, message, data) {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] TrumpGoggles (background):`;

    if (level === 'debug' && !this.DEBUG) {
      return;
    }

    if (data) {
      console[level](`${prefix} ${message}`, data);
    } else {
      console[level](`${prefix} ${message}`);
    }
  },

  info: function (message, data) {
    this.log('info', message, data);
  },

  warn: function (message, data) {
    this.log('warn', message, data);
  },

  error: function (message, data) {
    this.log('error', message, data);
  },

  debug: function (message, data) {
    this.log('debug', message, data);
  },
};

/**
 * Event handler for the extension icon click.
 * Opens the options page when the extension icon is clicked.
 *
 * @param {browser.tabs.Tab} [tab] - The active tab when the icon is clicked (unused)
 * @returns {void}
 */
chrome.action.onClicked.addListener(function () {
  try {
    BackgroundLogger.info('Extension icon clicked, opening options page');
    chrome.runtime.openOptionsPage();
  } catch (error) {
    BackgroundLogger.error('Error opening options page', error);
  }
});

/**
 * Event handler for extension installation or update
 * Logs installation/update events
 *
 * @param {Object} details - Installation details
 * @returns {void}
 */
chrome.runtime.onInstalled.addListener(function (details) {
  try {
    if (details.reason === 'install') {
      BackgroundLogger.info('Extension installed', {
        version: chrome.runtime.getManifest().version,
      });
    } else if (details.reason === 'update') {
      const oldVersion = details.previousVersion;
      const newVersion = chrome.runtime.getManifest().version;
      BackgroundLogger.info('Extension updated', { oldVersion, newVersion });
    }
  } catch (error) {
    BackgroundLogger.error('Error handling extension installation/update', error);
  }
});

/**
 * Handles runtime errors in the extension
 *
 * @param {string} message - Error message
 * @param {string} source - Script source URL
 * @param {number} lineno - Line number where error occurred
 * @param {number} colno - Column number where error occurred
 * @param {Error} error - Error object
 * @returns {boolean} True if the error was handled
 */
chrome.runtime.onError = function (message, source, lineno, colno, error) {
  BackgroundLogger.error('Runtime error', { message, source, lineno, colno, error });
  return true; // Prevents the error from being displayed in the console
};
