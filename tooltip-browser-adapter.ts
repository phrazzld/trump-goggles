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

// Define interfaces for browser modules
interface BrowserDetectInterface {
  // Core methods for browser detection
  getBrowser: () => string;
  getVersion: () => number | null;
  isFirefox: () => boolean;
  isChrome: () => boolean;
  isEdge?: () => boolean;
  isSafari?: () => boolean;
}

interface TooltipBrowserAdapterInterface {
  getSafeZIndex: () => number;
  applyBrowserSpecificStyles: (element: HTMLElement) => void;
  convertCssForBrowser: (cssText: string) => string;
  registerBrowserEvents: (
    tooltipId: string,
    showCallback: () => void,
    hideCallback: () => void
  ) => () => void;
  getDefaultTooltipStyles: () => string;
  getDebugInfo: () => object;
}

// Rather than extending the global Window interface directly,
// we'll use module-level type declarations
type ExtendedWindow = Window & {
  BrowserDetect?: BrowserDetectInterface;
  TooltipBrowserAdapter?: TooltipBrowserAdapterInterface;
};

// ===== CONSTANTS =====

/**
 * Default z-index to use for tooltips if browser has issues with very large values
 */
const DEFAULT_Z_INDEX: number = 9999;

/**
 * Maximum safe z-index across all supported browsers
 */
const MAX_SAFE_Z_INDEX: number = 2147483647;

/**
 * Vendor prefixes for checking visibility API support
 */
const VISIBILITY_PREFIXES: string[] = ['', 'webkit', 'moz', 'ms', 'o'];

// ===== TYPE DEFINITIONS =====

// Declare CSS properties that aren't standard in TypeScript's DOM definitions
// Use a type rather than an interface to avoid issues with readonly properties
type CSSStyleDeclarationWithVendorProps = CSSStyleDeclaration & {
  webkitBackfaceVisibility?: string;
  webkitTransform?: string;
  msTransform?: string;
  [key: string]: string | number | CSSRule | ((s: string) => string) | (() => string) | undefined;
};

interface BrowserInfo {
  browser: string;
  version: number | null;
  isFirefox: boolean;
  isChrome: boolean;
  isEdge: boolean;
  isSafari: boolean;
}

interface PrefixedDocument extends Document {
  webkitHidden?: boolean;
  mozHidden?: boolean;
  msHidden?: boolean;
  oHidden?: boolean;
}

// ===== BROWSER DETECTION =====

/**
 * Gets browser information using BrowserDetect if available
 *
 * @private
 * @returns Browser information
 */
function getBrowserInfo(): BrowserInfo {
  // Check if BrowserDetect is available on window
  const extendedWindow = window as ExtendedWindow;
  const browserDetect = extendedWindow.BrowserDetect;
  if (browserDetect) {
    return {
      browser: browserDetect.getBrowser(),
      version: browserDetect.getVersion(),
      isFirefox: browserDetect.isFirefox(),
      isChrome: browserDetect.isChrome(),
      isEdge: typeof browserDetect.isEdge === 'function' ? browserDetect.isEdge() : false,
      isSafari: typeof browserDetect.isSafari === 'function' ? browserDetect.isSafari() : false,
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
 * @returns Whether high z-index is supported
 */
function hasHighZIndexSupport(): boolean {
  try {
    const testElement = document.createElement('div');
    const style = testElement.style;

    // Check if style exists before accessing properties
    if (style) {
      style.zIndex = String(MAX_SAFE_Z_INDEX);
      const computedZIndex = parseInt(window.getComputedStyle(testElement).zIndex || '0', 10);
      return computedZIndex === MAX_SAFE_Z_INDEX;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Checks if the browser supports pointer-events CSS property
 *
 * @private
 * @returns Whether pointer-events is supported
 */
function hasPointerEventsSupport(): boolean {
  const testElement = document.createElement('div');
  const style = testElement.style;

  // Check if style exists before checking for property
  return Boolean(style && 'pointerEvents' in style);
}

/**
 * Checks if the browser supports CSS transitions
 *
 * @private
 * @returns Whether transitions are supported
 */
function hasTransitionSupport(): boolean {
  const testElement = document.createElement('div');
  const style = testElement.style;

  // Check if style exists before checking for properties
  return Boolean(
    style && ('transition' in style || 'webkitTransition' in style || 'MozTransition' in style)
  );
}

/**
 * Gets the appropriate visibility change event name
 *
 * @private
 * @returns The visibility change event name or null if not supported
 */
function getVisibilityChangeEvent(): string | null {
  for (const prefix of VISIBILITY_PREFIXES) {
    const eventName = prefix ? `${prefix}visibilitychange` : 'visibilitychange';
    const prop = prefix ? `${prefix}hidden` : 'hidden';

    // Check if the property exists on document
    const doc = document as PrefixedDocument;
    if (prop in doc || prefix === '') {
      if (typeof doc[prop as keyof PrefixedDocument] !== 'undefined' || prefix === '') {
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
 * @returns A z-index value that's safe for the current browser
 */
function getSafeZIndex(): number {
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
 * @returns The transition property name
 */
function getTransitionProperty(): string {
  const testElement = document.createElement('div');
  const style = testElement.style;

  if (style) {
    if ('transition' in style) {
      return 'transition';
    } else if ('webkitTransition' in style) {
      return 'webkitTransition';
    } else if ('MozTransition' in style) {
      return 'MozTransition';
    }
  }

  return 'transition'; // Fallback
}

/**
 * Applies browser-specific style adjustments to tooltip element
 *
 * @public
 * @param element - The tooltip element to style
 */
function applyBrowserSpecificStyles(element: HTMLElement): void {
  const browser = getBrowserInfo();
  const style = element.style as CSSStyleDeclarationWithVendorProps;

  // Only proceed if style is available
  if (!style) {
    return;
  }

  // Firefox adjustments
  if (browser.isFirefox) {
    // Firefox may have issues with subpixel rendering
    style.backfaceVisibility = 'hidden';
    style.transform = 'translateZ(0)';
  }

  // Safari adjustments
  if (browser.isSafari) {
    // Safari may need prefixed properties
    if (style.webkitBackfaceVisibility !== undefined) {
      style.webkitBackfaceVisibility = 'hidden';
    }
    if (style.webkitTransform !== undefined) {
      style.webkitTransform = 'translateZ(0)';
    }
  }

  // Edge (legacy) adjustments
  if (browser.isEdge && browser.version && browser.version < 80) {
    // Legacy Edge specific adjustments
    if (style.msTransform !== undefined) {
      style.msTransform = 'translateZ(0)';
    }
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
    try {
      // Set the custom transition property using safe approach
      // Use explicit verification and assignment to handle read-only properties
      if (transitionProp === 'webkitTransition' && style.webkitTransition !== undefined) {
        style.webkitTransition = 'opacity 0.2s ease-in-out';
      } else if (transitionProp === 'MozTransition' && 'MozTransition' in style) {
        // Cast to any to avoid TypeScript errors with read-only properties
        (style as any).MozTransition = 'opacity 0.2s ease-in-out';
      }
    } catch (err) {
      // Fallback: if we can't set the prefixed property, use the standard one
      if (style.transition !== undefined) {
        style.transition = 'opacity 0.2s ease-in-out';
      }
    }
  } else if (style.transition !== undefined) {
    // Set standard transition property
    style.transition = 'opacity 0.2s ease-in-out';
  }

  // High contrast mode support
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    style.borderColor = 'rgba(255, 255, 255, 0.1)';
  }
}

/**
 * Converts CSS text for browser compatibility
 *
 * @public
 * @param cssText - The CSS text to convert
 * @returns Browser-compatible CSS text
 */
function convertCssForBrowser(cssText: string): string {
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
 * Event handler info for cleanup
 */
interface EventHandlerInfo {
  element: Document | Window;
  event: string;
  handler: EventListener;
}

/**
 * Registers browser-specific event listeners
 *
 * @public
 * @param tooltipId - The tooltip element ID
 * @param showCallback - Callback to show the tooltip
 * @param hideCallback - Callback to hide the tooltip
 * @returns Function to remove the event listeners
 */
function registerBrowserEvents(
  _tooltipId: string,
  _showCallback: () => void,
  hideCallback: () => void
): () => void {
  const visibilityChangeEvent = getVisibilityChangeEvent();
  const handlers: EventHandlerInfo[] = [];

  // Handle page visibility changes
  if (visibilityChangeEvent) {
    const visibilityHandler = function () {
      if (document.hidden) {
        hideCallback();
      }
    };

    document.addEventListener(visibilityChangeEvent, visibilityHandler);
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

  window.addEventListener('blur', blurHandler);
  handlers.push({ element: window, event: 'blur', handler: blurHandler });

  // Return cleanup function
  return function cleanup() {
    handlers.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
  };
}

/**
 * Gets the default tooltip styles as a string
 * adjusted for the current browser
 *
 * @public
 * @returns CSS styles for the tooltip
 */
function getDefaultTooltipStyles(): string {
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
 * @returns Browser compatibility information
 */
function getDebugInfo(): {
  browser: string;
  version: number | null;
  features: {
    highZIndex: boolean;
    pointerEvents: boolean;
    transitions: boolean;
    visibilityAPI: boolean;
  };
  appliedStyles: {
    zIndex: number;
    transitionProperty: string;
  };
} {
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

// Browser compatibility export
if (typeof window !== 'undefined') {
  // Safely assign to window object using our ExtendedWindow type
  (window as ExtendedWindow).TooltipBrowserAdapter = TooltipBrowserAdapter;
}

export default TooltipBrowserAdapter;
