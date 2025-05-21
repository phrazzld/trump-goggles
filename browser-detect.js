/**
 * Browser Detection Module - Provides utilities for detecting the current browser
 * and its capabilities.
 *
 * This module helps the extension adapt to different browser environments and
 * handle browser-specific quirks appropriately.
 *
 * @version 3.0.0
 */

// TypeScript declarations for Firefox WebExtension API
// @ts-ignore - The global browser namespace is not recognized by TypeScript
// but it exists in Firefox extensions environment

// BrowserDetect module pattern
const BrowserDetect = (function () {
  'use strict';

  // ===== CONSTANTS AND CONFIGURATION =====

  // Browser types
  const BROWSERS = {
    CHROME: 'chrome',
    FIREFOX: 'firefox',
    EDGE: 'edge',
    SAFARI: 'safari',
    OPERA: 'opera',
    UNKNOWN: 'unknown',
  };

  // Manifest versions
  const MANIFEST = {
    V2: 2,
    V3: 3,
  };

  // Feature flags for tracking support
  const FEATURES = {
    PROMISES: 'promises',
    MUTATION_OBSERVER: 'mutationObserver',
    MATCH_MEDIA: 'matchMedia',
    WEB_REQUEST: 'webRequest',
    LOCAL_STORAGE: 'localStorage',
    SERVICE_WORKER: 'serviceWorker',
    SHADOW_DOM: 'shadowDom',
  };

  // ===== MODULE INTERNAL STATE =====

  // Cache detection results
  /** @type {string|null} */
  let detectedBrowser = null;
  /** @type {number|null} */
  let detectedVersion = null;
  /** @type {number|null} */
  let manifestVersion = null;
  /** @type {Record<string, boolean>} */
  let featureSupport = {};

  // ===== PRIVATE METHODS =====

  /**
   * Detects the current browser using multiple approaches
   *
   * @private
   * @returns {string} The detected browser type
   */
  function detectBrowser() {
    if (detectedBrowser) {
      return detectedBrowser;
    }

    // Check for Firefox using user agent
    if (navigator.userAgent.indexOf('Firefox') !== -1) {
      detectedBrowser = BROWSERS.FIREFOX;
      return detectedBrowser;
    }

    // Check for Edge
    if (navigator.userAgent.indexOf('Edg') !== -1) {
      detectedBrowser = BROWSERS.EDGE;
      return detectedBrowser;
    }

    // Check for Chrome - using type guard
    // This is safer than just checking window.chrome which might not be defined
    if (
      typeof window.chrome === 'object' &&
      window.chrome !== null &&
      navigator.userAgent.indexOf('Chrome') !== -1
    ) {
      // Check for Opera which uses Chrome engine
      if (navigator.userAgent.indexOf('OPR') !== -1) {
        detectedBrowser = BROWSERS.OPERA;
        return detectedBrowser;
      }

      detectedBrowser = BROWSERS.CHROME;
      return detectedBrowser;
    }

    // Check for Safari
    if (
      navigator.userAgent.indexOf('Safari') !== -1 &&
      navigator.userAgent.indexOf('Chrome') === -1
    ) {
      detectedBrowser = BROWSERS.SAFARI;
      return detectedBrowser;
    }

    // Fallback
    detectedBrowser = BROWSERS.UNKNOWN;
    return detectedBrowser;
  }

  /**
   * Gets the browser major version
   *
   * @private
   * @returns {number|null} The major version number
   */
  function getBrowserVersion() {
    if (detectedVersion) {
      return detectedVersion;
    }

    const browser = detectBrowser();
    const ua = navigator.userAgent;
    let match;

    switch (browser) {
    case BROWSERS.CHROME:
      match = ua.match(/Chrome\/(\d+)/);
      break;
    case BROWSERS.FIREFOX:
      match = ua.match(/Firefox\/(\d+)/);
      break;
    case BROWSERS.EDGE:
      match = ua.match(/Edg\/(\d+)/);
      break;
    case BROWSERS.SAFARI:
      match = ua.match(/Version\/(\d+)/);
      break;
    case BROWSERS.OPERA:
      match = ua.match(/OPR\/(\d+)/);
      break;
    default:
      detectedVersion = null;
      return null;
    }

    if (match && match[1]) {
      detectedVersion = parseInt(match[1], 10);
      return detectedVersion;
    }

    detectedVersion = null;
    return null;
  }

  /**
   * Detects the manifest version based on the browser
   *
   * @private
   * @returns {number} The manifest version (2 or 3)
   */
  function detectManifestVersion() {
    if (manifestVersion) {
      return manifestVersion;
    }

    try {
      // Try to get the manifest version directly (this works in MV3)
      // Use proper type guards to ensure chrome and its properties exist
      if (
        typeof chrome === 'object' &&
        chrome !== null &&
        typeof chrome.runtime === 'object' &&
        chrome.runtime !== null &&
        typeof chrome.runtime.getManifest === 'function'
      ) {
        const manifest = chrome.runtime.getManifest();
        if (manifest && typeof manifest === 'object' && 'manifest_version' in manifest) {
          manifestVersion = manifest.manifest_version;
          return manifestVersion;
        }
      }
    } catch (/* eslint-disable-line no-unused-vars */ _e) {
      // Ignore errors
    }

    // Fallback detection based on browser capabilities and type
    const browser = detectBrowser();
    const version = getBrowserVersion();

    // Default to MV2 for older browsers and Firefox
    // Firefox still primarily uses MV2 as of early 2023
    if (browser === BROWSERS.FIREFOX) {
      manifestVersion = MANIFEST.V2;
      return manifestVersion;
    }

    // Chrome 88+ and Edge (Chromium-based) should be MV3 capable
    if (
      (browser === BROWSERS.CHROME && version !== null && version >= 88) ||
      (browser === BROWSERS.EDGE && version !== null && version >= 88)
    ) {
      manifestVersion = MANIFEST.V3;
      return manifestVersion;
    }

    // Default to MV2 as a fallback
    manifestVersion = MANIFEST.V2;
    return manifestVersion;
  }

  /**
   * Checks if a specific feature is supported
   *
   * @private
   * @param {string} featureName - The name of the feature to check
   * @returns {boolean} Whether the feature is supported
   */
  function isFeatureSupported(featureName) {
    // Return cached result if we have one
    if (Object.prototype.hasOwnProperty.call(featureSupport, featureName)) {
      return featureSupport[featureName];
    }

    let isSupported = false;

    // Check for specific features
    switch (featureName) {
    case FEATURES.PROMISES:
      isSupported = typeof Promise !== 'undefined';
      break;

    case FEATURES.MUTATION_OBSERVER:
      isSupported = typeof MutationObserver !== 'undefined';
      break;

    case FEATURES.MATCH_MEDIA:
      isSupported =
          typeof window === 'object' && window !== null && typeof window.matchMedia === 'function';
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
          // @ts-ignore - Firefox WebExtension API not recognized by TypeScript
          typeof browser.webRequest === 'object' &&
          // @ts-ignore - Firefox WebExtension API not recognized by TypeScript
          browser.webRequest !== null
      ) {
        isSupported = true;
      } else {
        isSupported = false;
      }
      break;

    case FEATURES.LOCAL_STORAGE:
      try {
        isSupported =
            typeof window === 'object' &&
            window !== null &&
            typeof window.localStorage === 'object' &&
            window.localStorage !== null;

        // Test if localStorage is actually available by attempting to use it
        if (isSupported) {
          window.localStorage.setItem('__test', '__test');
          window.localStorage.removeItem('__test');
        }
      } catch (/* eslint-disable-line no-unused-vars */ _e) {
        isSupported = false;
      }
      break;

    case FEATURES.SERVICE_WORKER:
      isSupported =
          typeof navigator === 'object' &&
          navigator !== null &&
          typeof navigator.serviceWorker === 'object' &&
          navigator.serviceWorker !== null;
      break;

    case FEATURES.SHADOW_DOM:
      isSupported =
          typeof Element === 'function' &&
          Element.prototype &&
          typeof Element.prototype.attachShadow === 'function';
      break;

    default:
      isSupported = false;
    }

    // Cache the result
    featureSupport = { ...featureSupport, [featureName]: isSupported };
    return isSupported;
  }

  /**
   * Checks if the browser API uses promises (Firefox) or callbacks (Chrome)
   * Uses feature detection as the primary approach, with browser detection as fallback
   *
   * @private
   * @returns {boolean} Whether the browser uses promises for extension APIs
   */
  function usesPromises() {
    // First try to detect using feature detection - this is the most reliable approach
    // Check if the browser global is available (Firefox WebExtension API)
    if (typeof browser === 'object' && browser !== null) {
      // Check for Firefox-style promise-based APIs
      if (typeof browser.runtime === 'object' && browser.runtime !== null) {
        // Option 1: Check if runtime.getBrowserInfo exists (Firefox specific promise-based API)
        // @ts-ignore - Firefox WebExtension API not recognized by TypeScript
        if (typeof browser.runtime.getBrowserInfo === 'function') {
          return true;
        }

        // Option 2: Try to detect if openOptionsPage returns a Promise
        // @ts-ignore - Firefox WebExtension API not recognized by TypeScript
        if (typeof browser.runtime.openOptionsPage === 'function') {
          try {
            // @ts-ignore - Firefox WebExtension API not recognized by TypeScript
            const result = browser.runtime.openOptionsPage();
            // If this is a promise, it will have a then method
            if (result && typeof result.then === 'function') {
              return true;
            }
          } catch (/* eslint-disable-line no-unused-vars */ _e) {
            // Ignore errors - they don't tell us about promise support
          }
        }
      }
    }

    // Fallback to browser detection if feature detection is inconclusive
    // Firefox uses promise-based WebExtension API
    return detectBrowser() === BROWSERS.FIREFOX;
  }

  // ===== PUBLIC API =====

  /**
   * Gets the current browser
   *
   * @public
   * @returns {string} The browser name
   */
  function getBrowser() {
    return detectBrowser();
  }

  /**
   * Checks if the current browser is Chrome
   *
   * @public
   * @returns {boolean} Whether the browser is Chrome
   */
  function isChrome() {
    return detectBrowser() === BROWSERS.CHROME;
  }

  /**
   * Checks if the current browser is Firefox
   *
   * @public
   * @returns {boolean} Whether the browser is Firefox
   */
  function isFirefox() {
    return detectBrowser() === BROWSERS.FIREFOX;
  }

  /**
   * Checks if the current browser is Edge
   *
   * @public
   * @returns {boolean} Whether the browser is Edge
   */
  function isEdge() {
    return detectBrowser() === BROWSERS.EDGE;
  }

  /**
   * Checks if the current browser is Safari
   *
   * @public
   * @returns {boolean} Whether the browser is Safari
   */
  function isSafari() {
    return detectBrowser() === BROWSERS.SAFARI;
  }

  /**
   * Gets the current browser version
   *
   * @public
   * @returns {number|null} The browser version
   */
  function getVersion() {
    return getBrowserVersion();
  }

  /**
   * Gets the manifest version
   *
   * @public
   * @returns {number} The manifest version (2 or 3)
   */
  function getManifestVersion() {
    return detectManifestVersion();
  }

  /**
   * Checks if a feature is supported
   *
   * @public
   * @param {string} featureName - The name of the feature to check
   * @returns {boolean} Whether the feature is supported
   */
  function hasFeature(featureName) {
    return isFeatureSupported(featureName);
  }

  /**
   * Checks if the browser uses promises for extension APIs
   *
   * @public
   * @returns {boolean} Whether the browser uses promises
   */
  function hasPromiseAPI() {
    return usesPromises();
  }

  /**
   * The debug info object with a standardized structure
   * @typedef {Object} BrowserDebugInfo
   * @property {string} name - The browser name
   * @property {number|null} version - The browser version
   * @property {number} manifestVersion - The manifest version
   * @property {string} userAgent - The user agent string
   * @property {Object} features - Features supported by the browser
   * @property {boolean} features.promises - Whether Promises are supported
   * @property {boolean} features.mutationObserver - Whether MutationObserver is supported
   * @property {boolean} features.matchMedia - Whether matchMedia is supported
   * @property {boolean} features.webRequest - Whether webRequest is supported
   * @property {boolean} features.localStorage - Whether localStorage is supported
   * @property {boolean} features.serviceWorker - Whether serviceWorker is supported
   * @property {boolean} features.shadowDom - Whether shadowDom is supported
   */

  /**
   * Gets all browser information for debugging
   *
   * @public
   * @returns {BrowserDebugInfo} Browser information
   */
  function getDebugInfo() {
    return {
      name: detectBrowser(),
      version: getBrowserVersion(),
      manifestVersion: detectManifestVersion(),
      userAgent: navigator.userAgent,
      features: {
        promises: isFeatureSupported(FEATURES.PROMISES),
        mutationObserver: isFeatureSupported(FEATURES.MUTATION_OBSERVER),
        matchMedia: isFeatureSupported(FEATURES.MATCH_MEDIA),
        webRequest: isFeatureSupported(FEATURES.WEB_REQUEST),
        localStorage: isFeatureSupported(FEATURES.LOCAL_STORAGE),
        serviceWorker: isFeatureSupported(FEATURES.SERVICE_WORKER),
        shadowDom: isFeatureSupported(FEATURES.SHADOW_DOM),
      },
    };
  }

  // Return the public API that matches BrowserDetectInterface
  return {
    // Browser information
    getBrowser: getBrowser,
    isChrome: isChrome,
    isFirefox: isFirefox,
    isEdge: isEdge,
    isSafari: isSafari,
    getVersion: getVersion,
    getManifestVersion: getManifestVersion,

    // Feature detection
    hasFeature: hasFeature,
    hasPromiseAPI: hasPromiseAPI,
    getDebugInfo: getDebugInfo,

    // Constants
    BROWSERS: BROWSERS,
    MANIFEST: MANIFEST,
    FEATURES: FEATURES,
  };
})();

// Export the module
window.BrowserDetect = BrowserDetect;
