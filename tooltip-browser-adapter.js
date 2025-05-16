/**
 * TooltipBrowserAdapter Module - Provides cross-browser compatibility for tooltip features
 *
 * This module handles browser-specific differences in styling, events, and DOM APIs
 * that affect tooltip functionality. It ensures consistent behavior across
 * Chrome, Firefox, Edge, and potentially other browsers.
 *
 * @version 1.0.0
 */

'use strict';

// ===== CONSTANTS =====

/**
 * Default z-index to use for tooltips if browser has issues with very large values
 * @type {number}
 */
const DEFAULT_Z_INDEX = 9999;

/**
 * Maximum safe z-index across all supported browsers
 * @type {number}
 */
const MAX_SAFE_Z_INDEX = 2147483647;

/**
 * Vendor prefixes for checking visibility API support
 * @type {string[]}
 */
const VISIBILITY_PREFIXES = ['', 'webkit', 'moz', 'ms', 'o'];

// ===== BROWSER DETECTION =====

/**
 * Gets browser information using BrowserDetect if available
 *
 * @private
 * @returns {{browser: string, version: number | null, isFirefox: boolean, isChrome: boolean, isEdge: boolean, isSafari: boolean}} Browser information
 */
function getBrowserInfo() {
  if (window.BrowserDetect) {
    return {
      browser: window.BrowserDetect.getBrowser(),
      version: /** @type {number | null} */ (window.BrowserDetect.getVersion()),
      isFirefox: /** @type {() => boolean} */ (window.BrowserDetect.isFirefox)(),
      isChrome: /** @type {() => boolean} */ (window.BrowserDetect.isChrome)(),
      isEdge: /** @type {() => boolean} */ (window.BrowserDetect.isEdge)(),
      isSafari: /** @type {() => boolean} */ (window.BrowserDetect.isSafari)(),
    };
  }

  // Fallback to simple detection
  const ua = navigator.userAgent || '';
  const isFirefox = ua.indexOf('Firefox') > -1;
  const isChrome = ua.indexOf('Chrome') > -1 && ua.indexOf('Edge') === -1;
  const isEdge = ua.indexOf('Edge') > -1 || ua.indexOf('Edg/') > -1;
  const isSafari = ua.indexOf('Safari') > -1 && !isChrome && !isEdge;

  return {
    browser: isFirefox
      ? 'Firefox'
      : isChrome
        ? 'Chrome'
        : isEdge
          ? 'Edge'
          : isSafari
            ? 'Safari'
            : 'Unknown',
    version: null,
    isFirefox,
    isChrome,
    isEdge,
    isSafari,
  };
}

// ===== FEATURE DETECTION =====

/**
 * Checks if the browser supports high z-index values
 *
 * @private
 * @returns {boolean} Whether high z-index is supported
 */
function hasHighZIndexSupport() {
  try {
    const testElement = document.createElement('div');
    // @ts-ignore: We're testing browser behavior
    testElement.style.zIndex = MAX_SAFE_Z_INDEX;
    // @ts-ignore: We're testing browser behavior
    const computedZIndex = parseInt(window.getComputedStyle(testElement).zIndex || '0', 10);
    return computedZIndex === MAX_SAFE_Z_INDEX;
  } catch {
    return false;
  }
}

/**
 * Checks if the browser supports pointer-events CSS property
 *
 * @private
 * @returns {boolean} Whether pointer-events is supported
 */
function hasPointerEventsSupport() {
  const testElement = document.createElement('div');
  return Boolean(testElement.style && 'pointerEvents' in testElement.style);
}

/**
 * Checks if the browser supports CSS transitions
 *
 * @private
 * @returns {boolean} Whether transitions are supported
 */
function hasTransitionSupport() {
  const testElement = document.createElement('div');
  return Boolean(
    testElement.style &&
      ('transition' in testElement.style ||
        'webkitTransition' in testElement.style ||
        'MozTransition' in testElement.style)
  );
}

/**
 * Gets the appropriate visibility change event name
 *
 * @private
 * @returns {string | null} The visibility change event name or null if not supported
 */
function getVisibilityChangeEvent() {
  for (const prefix of VISIBILITY_PREFIXES) {
    const eventName = prefix ? `${prefix}visibilitychange` : 'visibilitychange';
    if (`${prefix}hidden` in document || prefix === '') {
      // @ts-ignore: We're checking for existence
      if (typeof document[`${prefix}hidden`] !== 'undefined' || prefix === '') {
        return eventName;
      }
    }
  }
  return null;
}

// ===== BROWSER-SPECIFIC ADJUSTMENTS =====

/**
 * Gets a safe z-index value for the current browser
 *
 * @public
 * @returns {number} A z-index value that's safe for the current browser
 */
function getSafeZIndex() {
  // Test if browser supports high z-index values
  if (hasHighZIndexSupport()) {
    return MAX_SAFE_Z_INDEX;
  }

  // Fallback to a safer value
  return DEFAULT_Z_INDEX;
}

/**
 * Gets the appropriate transition property name for the browser
 *
 * @private
 * @returns {string} The transition property name
 */
function getTransitionProperty() {
  const testElement = document.createElement('div');

  if (testElement.style) {
    if ('transition' in testElement.style) {
      return 'transition';
    } else if ('webkitTransition' in testElement.style) {
      return 'webkitTransition';
    } else if ('MozTransition' in testElement.style) {
      return 'MozTransition';
    }
  }

  return 'transition'; // Fallback
}

/**
 * Applies browser-specific style adjustments to tooltip element
 *
 * @public
 * @param {HTMLElement} element - The tooltip element to style
 */
function applyBrowserSpecificStyles(element) {
  const browser = getBrowserInfo();

  // Firefox adjustments
  if (browser.isFirefox) {
    // Firefox may have issues with subpixel rendering
    // @ts-ignore: We're applying browser-specific styles
    element.style.backfaceVisibility = 'hidden';
    // @ts-ignore: We're applying browser-specific styles
    element.style.transform = 'translateZ(0)';
  }

  // Safari adjustments
  if (browser.isSafari) {
    // Safari may need prefixed properties
    // @ts-ignore: We're applying browser-specific styles
    element.style.webkitBackfaceVisibility = 'hidden';
    // @ts-ignore: We're applying browser-specific styles
    element.style.webkitTransform = 'translateZ(0)';
  }

  // Edge (legacy) adjustments
  if (browser.isEdge && browser.version && browser.version < 80) {
    // Legacy Edge specific adjustments
    // @ts-ignore: We're applying browser-specific styles
    element.style.msTransform = 'translateZ(0)';
  }

  // Check for pointer-events support
  if (!hasPointerEventsSupport()) {
    // If pointer-events not supported, use alternative approach
    element.addEventListener('mouseenter', (e) => e.preventDefault());
    element.addEventListener('click', (e) => e.preventDefault());
  }

  // Apply appropriate transition property
  const transitionProp = getTransitionProperty();
  if (transitionProp !== 'transition') {
    // @ts-ignore: We're applying browser-specific styles
    element.style[transitionProp] = 'opacity 0.2s ease-in-out';
  }

  // High contrast mode support
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    // @ts-ignore: We're applying browser-specific styles
    element.style.borderColor = 'rgba(255, 255, 255, 0.1)';
  }
}

/**
 * Converts CSS text for browser compatibility
 *
 * @public
 * @param {string} cssText - The CSS text to convert
 * @returns {string} Browser-compatible CSS text
 */
function convertCssForBrowser(cssText) {
  const browser = getBrowserInfo();
  let result = cssText;

  // Firefox needs explicit focus outline
  if (browser.isFirefox) {
    result = result.replace(/:focus {/g, ':focus, :focus-visible {');
  }

  // Safari may need prefixed animation properties
  if (browser.isSafari) {
    result = result
      .replace(/transition:/g, '-webkit-transition:')
      .replace(/box-shadow:/g, '-webkit-box-shadow:')
      .replace(/user-select:/g, '-webkit-user-select:');
  }

  return result;
}

/**
 * Registers browser-specific event listeners
 *
 * @public
 * @param {string} tooltipId - The tooltip element ID
 * @param {Function} showCallback - Callback to show the tooltip
 * @param {Function} hideCallback - Callback to hide the tooltip
 * @returns {Function} Function to remove the event listeners
 */
function registerBrowserEvents(tooltipId, showCallback, hideCallback) {
  const visibilityChangeEvent = getVisibilityChangeEvent();
  /** @type {Array<{element: Document | Window, event: string, handler: Function}>} */
  const handlers = [];

  // Handle page visibility changes
  if (visibilityChangeEvent) {
    const visibilityHandler = function () {
      if (document.hidden) {
        hideCallback();
      }
    };

    document.addEventListener(
      visibilityChangeEvent,
      /** @type {EventListener} */ (visibilityHandler)
    );
    handlers.push({
      element: document,
      event: visibilityChangeEvent,
      handler: visibilityHandler,
    });
  }

  // Handle window blur on all browsers (fallback for page visibility)
  const blurHandler = function () {
    hideCallback();
  };

  window.addEventListener('blur', /** @type {EventListener} */ (blurHandler));
  handlers.push({ element: window, event: 'blur', handler: blurHandler });

  // Return cleanup function
  return function cleanup() {
    handlers.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, /** @type {EventListener} */ (handler));
    });
  };
}

/**
 * Gets the default tooltip styles as a string
 * adjusted for the current browser
 *
 * @public
 * @returns {string} CSS styles for the tooltip
 */
function getDefaultTooltipStyles() {
  // Base styles for all browsers
  let styles = `
    .tg-tooltip {
      position: fixed;
      visibility: hidden;
      opacity: 0;
      z-index: ${getSafeZIndex()};
      max-width: 300px;
      max-height: 200px;
      overflow: auto;
      overflow-wrap: break-word;
      white-space: pre-wrap;
      background-color: rgba(32, 32, 32, 0.95);
      color: #ffffff;
      padding: 8px 12px;
      border-radius: 4px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
      font-size: 14px;
      line-height: 1.4;
      text-align: left;
      transition: opacity 0.2s ease-in-out;
    }
    
    .tg-converted-text:focus {
      outline: 2px solid #0066cc !important;
      box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.25) !important;
      border-radius: 2px !important;
      text-decoration: underline !important;
      background-color: rgba(255, 239, 213, 0.7) !important;
    }
    
    /* High contrast mode support */
    @media (forced-colors: active) {
      .tg-converted-text:focus {
        outline: 2px solid HighlightText !important;
        outline-offset: 2px !important;
      }
    }
  `;

  // Convert for browser compatibility
  return convertCssForBrowser(styles);
}

/**
 * Gets browser compatibility information for debugging
 *
 * @public
 * @returns {{browser: string, version: number | null, features: {highZIndex: boolean, pointerEvents: boolean, transitions: boolean, visibilityAPI: boolean}, appliedStyles: {zIndex: number, transitionProperty: string}}} Browser compatibility information
 */
function getDebugInfo() {
  const browser = getBrowserInfo();

  return {
    browser: browser.browser,
    version: browser.version,
    features: {
      highZIndex: hasHighZIndexSupport(),
      pointerEvents: hasPointerEventsSupport(),
      transitions: hasTransitionSupport(),
      visibilityAPI: Boolean(getVisibilityChangeEvent()),
    },
    appliedStyles: {
      zIndex: getSafeZIndex(),
      transitionProperty: getTransitionProperty(),
    },
  };
}

// Export the public API
export const TooltipBrowserAdapter = {
  getSafeZIndex,
  applyBrowserSpecificStyles,
  convertCssForBrowser,
  registerBrowserEvents,
  getDefaultTooltipStyles,
  getDebugInfo,
};

export default TooltipBrowserAdapter;
