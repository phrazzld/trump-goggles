/**
 * TooltipBrowserAdapter Module - Provides cross-browser compatibility for tooltip features
 *
 * This module handles browser-specific differences in styling, events, and DOM APIs
 * that affect tooltip functionality. It ensures consistent behavior across
 * Chrome, Firefox, Edge, and potentially other browsers.
 *
 * @version 1.0.0
 */

// TooltipBrowserAdapter module pattern
const TooltipBrowserAdapter = (function () {
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

    // Fallback to user agent detection if BrowserDetect is not available
    const ua = navigator.userAgent;
    return {
      browser: getUABrowser(ua),
      version: getUAVersion(ua),
      isFirefox: ua.indexOf('Firefox') !== -1,
      isChrome: ua.indexOf('Chrome') !== -1 && ua.indexOf('Edg') === -1,
      isEdge: ua.indexOf('Edg') !== -1,
      isSafari: ua.indexOf('Safari') !== -1 && ua.indexOf('Chrome') === -1,
    };
  }

  /**
   * Extracts browser name from user agent string
   *
   * @private
   * @param {string} ua - User agent string
   * @returns {string} Browser name
   */
  function getUABrowser(ua) {
    if (ua.indexOf('Firefox') !== -1) return 'firefox';
    if (ua.indexOf('Edg') !== -1) return 'edge';
    if (ua.indexOf('Chrome') !== -1) return 'chrome';
    if (ua.indexOf('Safari') !== -1) return 'safari';
    return 'unknown';
  }

  /**
   * Extracts browser version from user agent string
   *
   * @private
   * @param {string} ua - User agent string
   * @returns {number|null} Browser version
   */
  function getUAVersion(ua) {
    const match =
      ua.match(/Firefox\/(\d+)/) ||
      ua.match(/Edg\/(\d+)/) ||
      ua.match(/Chrome\/(\d+)/) ||
      ua.match(/Version\/(\d+)/);

    return match && match[1] ? parseInt(match[1], 10) : null;
  }

  // ===== FEATURE DETECTION =====

  /**
   * Checks if CSS has high z-index support
   *
   * @private
   * @returns {boolean} True if high z-index values are supported
   */
  function hasHighZIndexSupport() {
    // Most current browsers support the maximum safe z-index,
    // but we'll keep this here for future compatibility
    const browser = getBrowserInfo();

    // Only older browsers might have issues with very high z-index values
    if (browser.isFirefox && browser.version && browser.version < 60) {
      return false;
    }

    return true;
  }

  /**
   * Checks for Page Visibility API support and returns the appropriate event name
   *
   * @private
   * @returns {string} The visibility change event name or empty string if not supported
   */
  function getVisibilityChangeEvent() {
    for (let i = 0; i < VISIBILITY_PREFIXES.length; i++) {
      const prefix = VISIBILITY_PREFIXES[i];
      const hiddenProp = prefix + (prefix ? 'Hidden' : 'hidden');
      const visChangeEvent = prefix + 'visibilitychange';

      if (typeof (/** @type {any} */ (document)[hiddenProp]) !== 'undefined') {
        return visChangeEvent;
      }
    }
    return '';
  }

  /**
   * Checks if pointer events are supported
   *
   * @private
   * @returns {boolean} True if pointer events are supported
   */
  function hasPointerEventsSupport() {
    // Create a test element
    const testEl = document.createElement('div');
    // Check if the style property exists
    if (testEl && testEl.style && 'pointerEvents' in testEl.style) {
      return true;
    }

    // Check if the property is supported with vendor prefixes
    const vendors = ['ms', 'Moz', 'Webkit', 'O'];
    for (let i = 0; i < vendors.length; i++) {
      const vendor = vendors[i];
      const vendorProp = vendor + 'PointerEvents';
      if (testEl && testEl.style && vendorProp in testEl.style) {
        return true;
      }
    }

    return false;
  }

  /**
   * Checks if CSS transitions are supported
   *
   * @private
   * @returns {boolean} True if CSS transitions are supported
   */
  function hasTransitionSupport() {
    const testEl = document.createElement('div');
    const transitions = {
      transition: 'transitionend',
      OTransition: 'oTransitionEnd',
      MozTransition: 'transitionend',
      WebkitTransition: 'webkitTransitionEnd',
    };

    for (const t in transitions) {
      if (/** @type {any} */ (testEl).style[t] !== undefined) {
        return true;
      }
    }

    return false;
  }

  /**
   * Gets the appropriate transition property name with vendor prefix if needed
   *
   * @private
   * @returns {string} The transition property name with vendor prefix if needed
   */
  function getTransitionProperty() {
    const testEl = document.createElement('div');
    const transitions = {
      transition: 'transition',
      OTransition: '-o-transition',
      MozTransition: '-moz-transition',
      WebkitTransition: '-webkit-transition',
    };

    for (const t in transitions) {
      if (/** @type {any} */ (testEl).style[t] !== undefined) {
        return transitions[/** @type {keyof typeof transitions} */ (t)];
      }
    }

    return 'transition'; // Default fallback
  }

  // ===== PUBLIC API =====

  /**
   * Gets the appropriate z-index value based on browser support
   *
   * @public
   * @returns {number} The appropriate z-index value
   */
  function getSafeZIndex() {
    return hasHighZIndexSupport() ? MAX_SAFE_Z_INDEX : DEFAULT_Z_INDEX;
  }

  /**
   * Applies browser-specific styles to the tooltip element
   *
   * @public
   * @param {HTMLElement} tooltipElement - The tooltip element to style
   */
  function applyBrowserSpecificStyles(tooltipElement) {
    const browser = getBrowserInfo();

    try {
      // Base styles that should work across browsers
      if (tooltipElement && tooltipElement.style) {
        tooltipElement.style.position = 'fixed';
        tooltipElement.style.zIndex = String(getSafeZIndex());
      }

      // Apply transition property with vendor prefix if needed
      if (hasTransitionSupport()) {
        /** @type {any} */ (tooltipElement.style)[getTransitionProperty()] =
          'opacity 0.2s ease-in-out';
      }

      // Handle pointer-events for browsers that support it
      if (hasPointerEventsSupport() && tooltipElement && tooltipElement.style) {
        tooltipElement.style.pointerEvents = 'none';
      }

      // Firefox-specific adjustments
      if (browser.isFirefox && tooltipElement && tooltipElement.style) {
        // Add specific styles for Firefox if needed
        tooltipElement.style.willChange = 'opacity, transform';

        // Firefox has better focus styling so we might need less custom focus styles
      }

      // Safari-specific adjustments
      if (browser.isSafari) {
        // Safari sometimes needs explicit opacity transition
        /** @type {any} */ (tooltipElement.style)['webkitTransition'] = 'opacity 0.2s ease-in-out';

        // Fix potential text rendering issues on Safari
        /** @type {any} */ (tooltipElement.style)['webkitFontSmoothing'] = 'antialiased';
      }

      // Edge-specific adjustments
      if (browser.isEdge) {
        // Edge might need additional styles for consistent rendering
        /** @type {any} */ (tooltipElement.style)['msTransform'] = 'translateZ(0)';
      }

      // Log the applied styles if Logger is available
      if (window.Logger && typeof window.Logger.debug === 'function') {
        window.Logger.debug('TooltipBrowserAdapter: Applied browser-specific styles', {
          browser: browser.browser,
          version: browser.version,
        });
      }
    } catch (error) {
      // Log error if Logger is available
      if (window.Logger && typeof window.Logger.error === 'function') {
        window.Logger.error('TooltipBrowserAdapter: Error applying browser-specific styles', {
          error,
        });
      } else {
        console.error('TooltipBrowserAdapter: Error applying browser-specific styles', error);
      }
    }
  }

  /**
   * Converts a CSS string to be compatible with the current browser
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
    const browser = getBrowserInfo();

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
        pointer-events: none;
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

    // Firefox-specific styles
    if (browser.isFirefox) {
      styles += `
        .tg-tooltip {
          will-change: opacity, transform;
        }
        
        .tg-converted-text:focus-visible {
          outline: 2px solid #0066cc !important;
          box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.25) !important;
        }
      `;
    }

    // Safari-specific styles
    if (browser.isSafari) {
      styles += `
        .tg-tooltip {
          -webkit-transition: opacity 0.2s ease-in-out;
          -webkit-font-smoothing: antialiased;
          -webkit-box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
          -webkit-user-select: none;
        }
      `;
    }

    return styles;
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
  return {
    getSafeZIndex,
    applyBrowserSpecificStyles,
    convertCssForBrowser,
    registerBrowserEvents,
    getDefaultTooltipStyles,
    getDebugInfo,
  };
})();

// Export the module
window.TooltipBrowserAdapter = TooltipBrowserAdapter;
