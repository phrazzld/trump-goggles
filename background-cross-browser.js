/**
 * Trump Goggles - Cross-Browser Background Script
 *
 * Handles browser extension functionality in the background context,
 * supporting multiple browsers through the BrowserAdapter.
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
 * Initializes the background script
 * This function sets up event handlers for various browser events
 */
function initializeBackgroundScript() {
  try {
    BackgroundLogger.info('Initializing background script');

    // Check if we have the BrowserAdapter available
    if (typeof BrowserAdapter === 'undefined') {
      BackgroundLogger.error('BrowserAdapter not found! Using direct Chrome API.');
      setupDirectAPIHandlers();
      return;
    }

    // Initialize browser adapter
    BrowserAdapter.initialize({ debug: BackgroundLogger.DEBUG });

    // Set up icon click handler
    setupIconClickHandler();

    // Set up install handler
    setupInstallHandler();

    // Set up error handler
    setupErrorHandler();

    BackgroundLogger.info('Background script initialized successfully');
  } catch (error) {
    BackgroundLogger.error('Error initializing background script', error);

    // Fallback to direct API handlers
    setupDirectAPIHandlers();
  }
}

/**
 * Sets up the icon click handler using BrowserAdapter
 */
function setupIconClickHandler() {
  BackgroundLogger.debug('Setting up icon click handler');

  const success = BrowserAdapter.addIconClickListener(function () {
    BackgroundLogger.info('Extension icon clicked, opening options page');

    BrowserAdapter.openOptionsPage().catch(function (error) {
      BackgroundLogger.error('Error opening options page', error);
    });
  });

  if (!success) {
    BackgroundLogger.error('Failed to add icon click listener');
  }
}

/**
 * Sets up the installation handler using BrowserAdapter
 */
function setupInstallHandler() {
  BackgroundLogger.debug('Setting up install handler');

  const success = BrowserAdapter.addInstallListener(function (details) {
    try {
      const manifest = BrowserAdapter.getManifest();
      const version = manifest ? manifest.version : 'unknown';

      if (details.reason === 'install') {
        BackgroundLogger.info('Extension installed', { version });
      } else if (details.reason === 'update') {
        const oldVersion = details.previousVersion;
        BackgroundLogger.info('Extension updated', { oldVersion, newVersion: version });
      }
    } catch (error) {
      BackgroundLogger.error('Error handling installation event', error);
    }
  });

  if (!success) {
    BackgroundLogger.error('Failed to add install listener');
  }
}

/**
 * Sets up the error handler for runtime errors
 */
function setupErrorHandler() {
  BackgroundLogger.debug('Setting up error handler');

  // We can't use BrowserAdapter for this since it's a special case
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onError) {
    chrome.runtime.onError.addListener(function (error) {
      BackgroundLogger.error('Runtime error', error);
      // Chrome expects this handler not to return anything (void)
      // The "return true" was incorrect as it's not needed for runtime.onError
    });
  }
}

/**
 * Sets up direct API handlers for when BrowserAdapter is not available
 * This is a fallback method that uses Chrome APIs directly
 */
function setupDirectAPIHandlers() {
  BackgroundLogger.info('Setting up direct API handlers');

  // Direct Chrome API usage for icon click
  try {
    if (chrome.action && chrome.action.onClicked) {
      // Manifest V3
      chrome.action.onClicked.addListener(function () {
        BackgroundLogger.info('Extension icon clicked (direct API), opening options page');
        chrome.runtime.openOptionsPage();
      });
    } else if (chrome.browserAction && chrome.browserAction.onClicked) {
      // Manifest V2
      chrome.browserAction.onClicked.addListener(function () {
        BackgroundLogger.info('Extension icon clicked (direct API), opening options page');
        chrome.runtime.openOptionsPage();
      });
    }
  } catch (error) {
    BackgroundLogger.error('Error setting up direct icon click handler', error);
  }

  // Direct Chrome API usage for install events
  try {
    chrome.runtime.onInstalled.addListener(function (details) {
      if (details.reason === 'install') {
        BackgroundLogger.info('Extension installed (direct API)', {
          version: chrome.runtime.getManifest().version,
        });
      } else if (details.reason === 'update') {
        const oldVersion = details.previousVersion;
        const newVersion = chrome.runtime.getManifest().version;
        BackgroundLogger.info('Extension updated (direct API)', { oldVersion, newVersion });
      }
    });
  } catch (error) {
    BackgroundLogger.error('Error setting up direct install handler', error);
  }

  // Direct Chrome API usage for error handling
  try {
    if (chrome.runtime.onError) {
      chrome.runtime.onError.addListener(function (error) {
        BackgroundLogger.error('Runtime error (direct API)', error);
        // Chrome expects this handler not to return anything (void)
        // The "return true" was incorrect as it's not needed for runtime.onError
      });
    }
  } catch (error) {
    BackgroundLogger.error('Error setting up direct error handler', error);
  }
}

// Start initialization once the script loads
initializeBackgroundScript();
