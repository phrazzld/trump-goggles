/**
 * Trump Goggles - Combined Background Script with Dependencies
 *
 * This file contains all the browser detection, browser adapter,
 * and other utilities needed for the background script to function.
 */

/**
 * Browser Detect Module - Detects and reports browser information
 */
const BrowserDetect = (function () {
  'use strict';

  // Browser identification constants
  const BROWSERS = {
    CHROME: 'chrome',
    FIREFOX: 'firefox',
    EDGE: 'edge',
    SAFARI: 'safari',
    OPERA: 'opera',
    UNKNOWN: 'unknown',
  };

  // Feature support flags
  const FEATURES = {
    PROMISES: 'promises',
    WEB_REQUEST: 'webRequest',
  };

  // Cache detection results
  let detectedBrowser = null;
  let manifestVersion = null;
  let browserVersion = null;

  /**
   * Detects the current browser based on user agent and available APIs
   *
   * @returns {string} The detected browser name
   */
  function detectBrowser() {
    if (detectedBrowser) {
      return detectedBrowser;
    }

    const userAgent = navigator.userAgent.toLowerCase();

    // Edge detection (must be first as it also contains Chrome in UA)
    if (userAgent.indexOf('edg') > -1) {
      detectedBrowser = BROWSERS.EDGE;
      return detectedBrowser;
    }

    // Chrome detection
    if (userAgent.indexOf('chrome') > -1 && userAgent.indexOf('opr') === -1) {
      detectedBrowser = BROWSERS.CHROME;
      return detectedBrowser;
    }

    // Firefox detection
    if (userAgent.indexOf('firefox') > -1) {
      detectedBrowser = BROWSERS.FIREFOX;
      return detectedBrowser;
    }

    // Opera detection
    if (userAgent.indexOf('opr') > -1) {
      detectedBrowser = BROWSERS.OPERA;
      return detectedBrowser;
    }

    // Safari detection
    if (userAgent.indexOf('safari') > -1 && userAgent.indexOf('chrome') === -1) {
      detectedBrowser = BROWSERS.SAFARI;
      return detectedBrowser;
    }

    // Default to unknown
    detectedBrowser = BROWSERS.UNKNOWN;
    return detectedBrowser;
  }

  /**
   * Gets the current browser name
   *
   * @returns {string} The browser name
   */
  function getBrowser() {
    return detectBrowser();
  }

  /**
   * Checks if the current browser is Firefox
   *
   * @returns {boolean} Whether the browser is Firefox
   */
  function isFirefox() {
    return getBrowser() === BROWSERS.FIREFOX;
  }

  /**
   * Checks if the current browser is Chrome
   *
   * @returns {boolean} Whether the browser is Chrome
   */
  function isChrome() {
    return getBrowser() === BROWSERS.CHROME;
  }

  /**
   * Gets the manifest version (2 or 3) from the extension API
   *
   * @returns {number} The manifest version
   */
  function getManifestVersion() {
    if (manifestVersion !== null) {
      return manifestVersion;
    }

    try {
      const manifest = chrome.runtime.getManifest();
      manifestVersion = manifest.manifest_version;
      return manifestVersion;
    } catch (error) {
      console.warn('Error getting manifest version', error);
      return 3; // Default to manifest v3 if we can't determine it
    }
  }

  /**
   * Gets the browser version from the user agent
   *
   * @returns {string} The browser version
   */
  function getVersion() {
    if (browserVersion) {
      return browserVersion;
    }

    const browser = getBrowser();
    const userAgent = navigator.userAgent;
    let version = 'unknown';

    try {
      switch (browser) {
      case BROWSERS.CHROME:
        version = userAgent.match(/Chrome\/([0-9.]+)/)[1];
        break;
      case BROWSERS.FIREFOX:
        version = userAgent.match(/Firefox\/([0-9.]+)/)[1];
        break;
      case BROWSERS.EDGE:
        version = userAgent.match(/Edg\/([0-9.]+)/)[1];
        break;
      case BROWSERS.SAFARI:
        version = userAgent.match(/Version\/([0-9.]+)/)[1];
        break;
      case BROWSERS.OPERA:
        version = userAgent.match(/OPR\/([0-9.]+)/)[1];
        break;
      default:
        version = 'unknown';
      }
    } catch (e) {
      console.warn('Error parsing browser version', e);
    }

    browserVersion = version;
    return browserVersion;
  }

  /**
   * Checks if the browser supports promises for extension APIs
   *
   * @returns {boolean} Whether the browser has promise-based extension APIs
   */
  function hasPromiseAPI() {
    // Firefox always has promises
    if (isFirefox()) {
      return true;
    }

    // For Chrome/Edge, test for the promise API by checking runtime.getPlatformInfo()
    try {
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getPlatformInfo) {
        const result = chrome.runtime.getPlatformInfo();
        if (result && typeof result.then === 'function') {
          return true;
        }
      }
    } catch (e) {
      // Ignore errors during feature detection
    }

    return false;
  }

  /**
   * Checks if a specific browser feature is supported
   *
   * @param {string} feature - The feature to check for
   * @returns {boolean} Whether the feature is supported
   */
  function supportsFeature(feature) {
    let isSupported = false;

    switch (feature) {
    case FEATURES.PROMISES:
      isSupported = hasPromiseAPI();
      break;

    case FEATURES.WEB_REQUEST:
      // Check for Chrome-style web request API
      if (
        typeof chrome === 'object' &&
          chrome !== null &&
          typeof chrome.webRequest === 'object' &&
          chrome.webRequest !== null
      ) {
        isSupported = true;
      }
      // Also check for Firefox-style web request API
      else if (
        typeof browser === 'object' &&
          browser !== null &&
          typeof browser.webRequest === 'object' &&
          browser.webRequest !== null
      ) {
        isSupported = true;
      } else {
        isSupported = false;
      }
      break;

    default:
      isSupported = false;
    }

    return isSupported;
  }

  // Public API
  return {
    // Browser identification
    getBrowser: getBrowser,
    isFirefox: isFirefox,
    isChrome: isChrome,
    getVersion: getVersion,
    getManifestVersion: getManifestVersion,

    // Feature detection
    supportsFeature: supportsFeature,
    hasPromiseAPI: hasPromiseAPI,

    // Constants
    BROWSERS: BROWSERS,
    FEATURES: FEATURES,
  };
})();

// Make the module available in the global scope
(typeof self !== 'undefined' ? self : window).BrowserDetect = BrowserDetect;

/**
 * Browser Adapter Module - Provides a unified API for browser extension functionality
 */
const BrowserAdapter = (function () {
  'use strict';

  // ===== CONSTANTS =====
  const API_TYPES = {
    PROMISE: 'promise',
    CALLBACK: 'callback',
  };

  // ===== MODULE INTERNAL STATE =====

  // Cache API checks
  let apiType = null;
  let browserApi = null;
  let hasBeenInitialized = false;
  let config = {
    debug: false, // Enable debug logging
    callbackTimeout: 5000, // Timeout for callbacks in ms
  };

  // Simple logger for background context
  const logger = {
    debug: function (msg, data) {
      if (config.debug) {
        if (data) {
          console.debug(`BrowserAdapter: ${msg}`, data);
        } else {
          console.debug(`BrowserAdapter: ${msg}`);
        }
      }
    },
    info: function (msg, data) {
      if (data) {
        console.info(`BrowserAdapter: ${msg}`, data);
      } else {
        console.info(`BrowserAdapter: ${msg}`);
      }
    },
    warn: function (msg, data) {
      if (data) {
        console.warn(`BrowserAdapter: ${msg}`, data);
      } else {
        console.warn(`BrowserAdapter: ${msg}`);
      }
    },
    error: function (msg, data) {
      if (data) {
        console.error(`BrowserAdapter: ${msg}`, data);
      } else {
        console.error(`BrowserAdapter: ${msg}`);
      }
    },
  };

  /**
   * Determines the appropriate browser API object (chrome or browser)
   *
   * @private
   * @returns {Object} The browser API object
   */
  function getBrowserApi() {
    if (browserApi) {
      return browserApi;
    }

    // Check if BrowserDetect is available
    if (self.BrowserDetect) {
      if (self.BrowserDetect.isFirefox()) {
        browserApi = typeof browser !== 'undefined' ? browser : chrome;
      } else {
        browserApi = chrome;
      }
    } else {
      // Fallback detection for when BrowserDetect isn't available
      try {
        browserApi = typeof browser !== 'undefined' ? browser : chrome;
      } catch (e) {
        browserApi = chrome;
      }
    }

    logger.debug('Browser API object determined', {
      isFirefox: Boolean(self.BrowserDetect && self.BrowserDetect.isFirefox()),
      isPromiseApi: getApiType() === API_TYPES.PROMISE,
    });

    return browserApi;
  }

  /**
   * Determines the API type (promise or callback)
   *
   * @private
   * @returns {string} The API type
   */
  function getApiType() {
    if (apiType) {
      return apiType;
    }

    // Use BrowserDetect if available
    if (self.BrowserDetect) {
      if (self.BrowserDetect.hasPromiseAPI()) {
        apiType = API_TYPES.PROMISE;
        return apiType;
      }
    }

    // Fallback detection
    try {
      if (typeof browser !== 'undefined' && browser.runtime && browser.runtime.getPlatformInfo) {
        const api = getBrowserApi();
        // Test if the API returns a promise
        const test = api.runtime.getPlatformInfo();
        if (test && typeof test.then === 'function') {
          apiType = API_TYPES.PROMISE;
          return apiType;
        }
      }
    } catch (e) {
      // Ignore errors during detection
    }

    // Default to callback API
    apiType = API_TYPES.CALLBACK;
    return apiType;
  }

  /**
   * Converts a callback-based API call to a promise-based one
   *
   * @private
   * @param {Function} apiFunction - The callback-based API function
   * @param {...any} args - Arguments for the API function
   * @returns {Promise<any>} Promise resolving to the API result
   */
  function callbackToPromise(apiFunction, args) {
    return new Promise((resolve, reject) => {
      try {
        // Add the callback to the args
        const callback = (result, error) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        };

        apiFunction(...args, callback);

        // Add a timeout to avoid hanging promises
        setTimeout(() => {
          reject(new Error(`API call timed out after ${config.callbackTimeout}ms`));
        }, config.callbackTimeout);
      } catch (error) {
        reject(error);
      }
    });
  }

  // ===== PUBLIC API =====

  /**
   * Initializes the adapter with configuration options
   *
   * @public
   * @param {Object} [options] - Configuration options
   * @param {boolean} [options.debug] - Enable debug logging
   * @param {number} [options.callbackTimeout] - Timeout for callbacks in ms
   * @returns {boolean} Whether initialization was successful
   */
  function initialize(options = {}) {
    if (hasBeenInitialized) {
      logger.debug('BrowserAdapter already initialized');
      return true;
    }

    // Update config with provided options
    if (options.debug !== undefined) {
      config.debug = Boolean(options.debug);
    }

    if (options.callbackTimeout !== undefined && typeof options.callbackTimeout === 'number') {
      config.callbackTimeout = options.callbackTimeout;
    }

    // Initialize the browser API and type
    getBrowserApi();
    getApiType();

    logger.info('BrowserAdapter initialized', {
      apiType,
      browserName: self.BrowserDetect ? self.BrowserDetect.getBrowser() : 'unknown',
      manifestVersion: self.BrowserDetect ? self.BrowserDetect.getManifestVersion() : 'unknown',
    });

    hasBeenInitialized = true;
    return true;
  }

  /**
   * Gets the native browser API object
   *
   * @public
   * @returns {Object} The native browser API object (chrome or browser)
   */
  function getAPI() {
    return getBrowserApi();
  }

  /**
   * Checks if the browser uses promises for extension APIs
   *
   * @public
   * @returns {boolean} Whether the browser uses promises
   */
  function usesPromises() {
    return getApiType() === API_TYPES.PROMISE;
  }

  /**
   * Wraps a browser API function to ensure it returns a promise
   *
   * @public
   * @param {Function} apiFunction - The API function to wrap
   * @param {...any} args - Arguments for the API function
   * @returns {Promise<any>} Promise resolving to the API result
   */
  function promisify(apiFunction, ...args) {
    if (!apiFunction) {
      return Promise.reject(new Error('Invalid API function'));
    }

    if (usesPromises()) {
      // If it's already a promise API, just call it
      try {
        return apiFunction(...args);
      } catch (error) {
        logger.error('Error in promisify for promise API', { error });
        return Promise.reject(error);
      }
    } else {
      // Convert callback API to promise
      return callbackToPromise(apiFunction, args);
    }
  }

  /**
   * Opens the extension's options page
   *
   * @public
   * @returns {Promise<void>} Promise that resolves when the options page is opened
   */
  function openOptionsPage() {
    const api = getBrowserApi();

    if (!api || !api.runtime || !api.runtime.openOptionsPage) {
      return Promise.reject(new Error('openOptionsPage API not available'));
    }

    if (usesPromises()) {
      return api.runtime.openOptionsPage();
    } else {
      return new Promise((resolve, reject) => {
        try {
          api.runtime.openOptionsPage(() => {
            if (api.runtime.lastError) {
              reject(api.runtime.lastError);
            } else {
              resolve();
            }
          });
        } catch (error) {
          reject(error);
        }
      });
    }
  }

  /**
   * Gets the extension's manifest
   *
   * @public
   * @returns {Object} The extension manifest
   */
  function getManifest() {
    const api = getBrowserApi();

    if (!api || !api.runtime || !api.runtime.getManifest) {
      return null;
    }

    return api.runtime.getManifest();
  }

  /**
   * Adds a click listener to the extension icon
   *
   * @public
   * @param {Function} callback - Function to call when the icon is clicked
   * @returns {boolean} Whether the listener was added successfully
   */
  function addIconClickListener(callback) {
    if (!callback || typeof callback !== 'function') {
      return false;
    }

    const api = getBrowserApi();

    try {
      // Manifest V3 API
      if (api.action && api.action.onClicked) {
        api.action.onClicked.addListener(callback);
        return true;
      }

      // Manifest V2 API
      if (api.browserAction && api.browserAction.onClicked) {
        api.browserAction.onClicked.addListener(callback);
        return true;
      }

      logger.error('Icon click API not available');
      return false;
    } catch (error) {
      logger.error('Error adding icon click listener', { error });
      return false;
    }
  }

  /**
   * Gets a value from storage
   *
   * @public
   * @param {string|string[]|Object} keys - Key(s) to retrieve
   * @returns {Promise<Object>} Promise resolving to the storage items
   */
  function getStorageItem(keys) {
    const api = getBrowserApi();

    if (!api || !api.storage || !api.storage.sync) {
      return Promise.reject(new Error('Storage API not available'));
    }

    if (usesPromises()) {
      return api.storage.sync.get(keys);
    } else {
      return new Promise((resolve, reject) => {
        api.storage.sync.get(keys, (items) => {
          if (api.runtime.lastError) {
            reject(api.runtime.lastError);
          } else {
            resolve(items);
          }
        });
      });
    }
  }

  /**
   * Sets a value in storage
   *
   * @public
   * @param {Object} items - Items to store
   * @returns {Promise<void>} Promise that resolves when the items are stored
   */
  function setStorageItem(items) {
    const api = getBrowserApi();

    if (!api || !api.storage || !api.storage.sync) {
      return Promise.reject(new Error('Storage API not available'));
    }

    if (usesPromises()) {
      return api.storage.sync.set(items);
    } else {
      return new Promise((resolve, reject) => {
        api.storage.sync.set(items, () => {
          if (api.runtime.lastError) {
            reject(api.runtime.lastError);
          } else {
            resolve();
          }
        });
      });
    }
  }

  /**
   * Adds a listener for installation events
   *
   * @public
   * @param {Function} callback - Function to call when the extension is installed
   * @returns {boolean} Whether the listener was added successfully
   */
  function addInstallListener(callback) {
    if (!callback || typeof callback !== 'function') {
      return false;
    }

    const api = getBrowserApi();

    try {
      if (api.runtime && api.runtime.onInstalled) {
        api.runtime.onInstalled.addListener(callback);
        return true;
      }

      logger.error('Install listener API not available');
      return false;
    } catch (error) {
      logger.error('Error adding install listener', { error });
      return false;
    }
  }

  /**
   * Gets browser-specific details for debugging
   *
   * @public
   * @returns {Object} Browser debug information
   */
  function getDebugInfo() {
    const api = getBrowserApi();
    const browser = self.BrowserDetect ? self.BrowserDetect.getBrowser() : 'unknown';
    const version = self.BrowserDetect ? self.BrowserDetect.getVersion() : 'unknown';
    const manifest = getManifest();

    return {
      browser,
      version,
      manifestVersion: manifest ? manifest.manifest_version : 'unknown',
      apiType: getApiType(),
      apis: {
        storage: Boolean(api && api.storage && api.storage.sync),
        tabs: Boolean(api && api.tabs),
        runtime: Boolean(api && api.runtime),
        action: Boolean(api && api.action),
        browserAction: Boolean(api && api.browserAction),
        userAgent: navigator.userAgent,
      },
    };
  }

  // Return the public API
  return {
    initialize: initialize,
    getAPI: getAPI,
    usesPromises: usesPromises,
    promisify: promisify,
    openOptionsPage: openOptionsPage,
    getManifest: getManifest,
    addIconClickListener: addIconClickListener,
    getStorageItem: getStorageItem,
    setStorageItem: setStorageItem,
    addInstallListener: addInstallListener,
    getDebugInfo: getDebugInfo,
  };
})();

// Make the module available in the global scope
(typeof self !== 'undefined' ? self : window).BrowserAdapter = BrowserAdapter;

// Initialize BrowserAdapter
BrowserAdapter.initialize({ debug: true });

/**
 * Trump Goggles - Background Script Logic
 *
 * Handles browser extension functionality in the background context,
 * supporting multiple browsers through the BrowserAdapter.
 *
 * @version 3.0.0
 */

// Create a simple logger for the background script
const BackgroundLogger = {
  DEBUG: true,

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
      });
    }
  } catch (error) {
    BackgroundLogger.error('Error setting up direct error handler', error);
  }
}

// Start initialization once the script loads
initializeBackgroundScript();
