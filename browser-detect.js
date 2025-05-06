/**
 * Browser Detection Module - Provides utilities for detecting the current browser
 * and its capabilities.
 *
 * This module helps the extension adapt to different browser environments and
 * handle browser-specific quirks appropriately.
 *
 * @version 3.0.0
 */

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
  let detectedBrowser = null;
  let detectedVersion = null;
  let manifestVersion = null;
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

    // Check for Firefox-specific properties
    if (typeof InstallTrigger !== 'undefined') {
      detectedBrowser = BROWSERS.FIREFOX;
      return detectedBrowser;
    }

    // Check for Edge
    if (navigator.userAgent.indexOf('Edg') !== -1) {
      detectedBrowser = BROWSERS.EDGE;
      return detectedBrowser;
    }

    // Check for Chrome
    if (window.chrome && navigator.userAgent.indexOf('Chrome') !== -1) {
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
      if (chrome && chrome.runtime && chrome.runtime.getManifest) {
        const manifest = chrome.runtime.getManifest();
        if (manifest && manifest.manifest_version) {
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
      (browser === BROWSERS.CHROME && version >= 88) ||
      (browser === BROWSERS.EDGE && version >= 88)
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
    if (featureSupport[featureName] !== undefined) {
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
      isSupported = typeof window.matchMedia !== 'undefined';
      break;

    case FEATURES.WEB_REQUEST:
      isSupported = !!(chrome && chrome.webRequest);
      break;

    case FEATURES.LOCAL_STORAGE:
      try {
        isSupported = typeof localStorage !== 'undefined';

        // Test if localStorage is actually available
        if (isSupported) {
          localStorage.setItem('__test', '__test');
          localStorage.removeItem('__test');
        }
      } catch (/* eslint-disable-line no-unused-vars */ _e) {
        isSupported = false;
      }
      break;

    case FEATURES.SERVICE_WORKER:
      isSupported = typeof navigator.serviceWorker !== 'undefined';
      break;

    case FEATURES.SHADOW_DOM:
      isSupported = typeof Element.prototype.attachShadow !== 'undefined';
      break;

    default:
      isSupported = false;
    }

    // Cache the result
    featureSupport[featureName] = isSupported;
    return isSupported;
  }

  /**
   * Checks if the browser API uses promises (Firefox) or callbacks (Chrome)
   *
   * @private
   * @returns {boolean} Whether the browser uses promises for extension APIs
   */
  function usesPromises() {
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
   * Gets all browser information for debugging
   *
   * @public
   * @returns {Object} Browser information
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

  // Return the public API
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
