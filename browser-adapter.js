/**
 * Browser Adapter Module - Provides a unified API for browser extension functionality
 *
 * This module abstracts browser-specific differences and provides a consistent
 * interface for extension code to work across browsers.
 *
 * @version 3.0.0
 */

// BrowserAdapter module pattern
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

  // Logger reference (if available)
  let logger = null;

  // ===== PRIVATE METHODS =====

  /**
   * Gets or creates a logger
   *
   * @private
   * @returns {Object} Logger object
   */
  function getLogger() {
    if (logger) {
      return logger;
    }

    if (window.Logger) {
      logger = window.Logger;
      return logger;
    }

    // Create a minimal logger if window.Logger is not available
    logger = {
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

    return logger;
  }

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
    if (window.BrowserDetect) {
      if (window.BrowserDetect.isFirefox()) {
        // @ts-ignore - Firefox global 'browser' object is not recognized by TypeScript
        browserApi = typeof browser !== 'undefined' ? browser : chrome;
      } else {
        browserApi = chrome;
      }
    } else {
      // Fallback detection for when BrowserDetect isn't available
      try {
        // @ts-ignore - Firefox global 'browser' object is not recognized by TypeScript
        browserApi = typeof browser !== 'undefined' ? browser : chrome;
      } catch (e) {
        browserApi = chrome;
      }
    }

    getLogger().debug('Browser API object determined', {
      isFirefox: Boolean(window.BrowserDetect && window.BrowserDetect.isFirefox()),
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
    if (window.BrowserDetect) {
      if (window.BrowserDetect.hasPromiseAPI()) {
        apiType = API_TYPES.PROMISE;
        return apiType;
      }
    }

    // Fallback detection
    try {
      // @ts-ignore - 'browser' is not recognized by TypeScript
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
   * Converts a promise-based API call to a callback-based one
   *
   * @private
   * @param {Function} apiFunction - The promise-based API function
   * @param {...any} args - Arguments for the API function
   * @param {Function} callback - Callback function for the result
   * @returns {void}
   */
  function promiseToCallback(apiFunction, args, callback) {
    try {
      apiFunction(...args)
        .then((result) => {
          if (callback) {
            callback(result);
          }
        })
        .catch((error) => {
          getLogger().error('Error in promiseToCallback', { error });
          if (callback) {
            callback(null, error);
          }
        });
    } catch (error) {
      getLogger().error('Exception in promiseToCallback', { error });
      if (callback) {
        callback(null, error);
      }
    }
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
      getLogger().debug('BrowserAdapter already initialized');
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

    getLogger().info('BrowserAdapter initialized', {
      apiType,
      browserName: window.BrowserDetect ? window.BrowserDetect.getBrowser() : 'unknown',
      manifestVersion: window.BrowserDetect ? window.BrowserDetect.getManifestVersion() : 'unknown',
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
        getLogger().error('Error in promisify for promise API', { error });
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

      getLogger().error('Icon click API not available');
      return false;
    } catch (error) {
      getLogger().error('Error adding icon click listener', { error });
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
   * Sends a message to a tab
   *
   * @public
   * @param {number} tabId - ID of the tab to send the message to
   * @param {any} message - Message to send
   * @returns {Promise<any>} Promise resolving to the response
   */
  function sendMessageToTab(tabId, message) {
    const api = getBrowserApi();

    if (!api || !api.tabs || !api.tabs.sendMessage) {
      return Promise.reject(new Error('sendMessage API not available'));
    }

    if (usesPromises()) {
      return api.tabs.sendMessage(tabId, message);
    } else {
      return new Promise((resolve, reject) => {
        api.tabs.sendMessage(tabId, message, (response) => {
          if (api.runtime.lastError) {
            reject(api.runtime.lastError);
          } else {
            resolve(response);
          }
        });
      });
    }
  }

  /**
   * Sends a message to the extension
   *
   * @public
   * @param {any} message - Message to send
   * @returns {Promise<any>} Promise resolving to the response
   */
  function sendMessage(message) {
    const api = getBrowserApi();

    if (!api || !api.runtime || !api.runtime.sendMessage) {
      return Promise.reject(new Error('sendMessage API not available'));
    }

    if (usesPromises()) {
      return api.runtime.sendMessage(message);
    } else {
      return new Promise((resolve, reject) => {
        api.runtime.sendMessage(message, (response) => {
          if (api.runtime.lastError) {
            reject(api.runtime.lastError);
          } else {
            resolve(response);
          }
        });
      });
    }
  }

  /**
   * Adds a listener for extension messages
   *
   * @public
   * @param {Function} callback - Function to call when a message is received
   * @returns {boolean} Whether the listener was added successfully
   */
  function addMessageListener(callback) {
    if (!callback || typeof callback !== 'function') {
      return false;
    }

    const api = getBrowserApi();

    try {
      if (api.runtime && api.runtime.onMessage) {
        api.runtime.onMessage.addListener(callback);
        return true;
      }

      getLogger().error('Message listener API not available');
      return false;
    } catch (error) {
      getLogger().error('Error adding message listener', { error });
      return false;
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

      getLogger().error('Install listener API not available');
      return false;
    } catch (error) {
      getLogger().error('Error adding install listener', { error });
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
    const browser = window.BrowserDetect ? window.BrowserDetect.getBrowser() : 'unknown';
    const version = window.BrowserDetect ? window.BrowserDetect.getVersion() : 'unknown';
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
    sendMessageToTab: sendMessageToTab,
    sendMessage: sendMessage,
    addMessageListener: addMessageListener,
    addInstallListener: addInstallListener,
    getDebugInfo: getDebugInfo,
  };
})();

// Export the module
window.BrowserAdapter = BrowserAdapter;

// Initialize the adapter when the document is ready
document.addEventListener('DOMContentLoaded', function () {
  // Delay initialization slightly to ensure BrowserDetect is loaded first
  setTimeout(function () {
    if (window.BrowserAdapter) {
      window.BrowserAdapter.initialize({
        debug: window.Logger && window.Logger.debug,
      });
    }
  }, 100);
});
