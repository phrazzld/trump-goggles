/**
 * TooltipUI Module - Responsible for managing tooltip DOM element
 *
 * This module handles the creation, positioning, and visibility of a tooltip
 * element that displays original unconverted text. It implements the TooltipUIInterface.
 *
 * Styling is delegated to the TooltipBrowserAdapter for cross-browser compatibility.
 *
 * @version 1.0.0
 */

'use strict';

// Add a comment to skip TypeScript checking for window globals (Logger and TooltipBrowserAdapter) 
// since they're already declared in types.d.ts, but TypeScript shows errors when trying to use them
// @ts-ignore

interface TooltipDebugInfo {
  isCreated: boolean;
  tooltipElement: {
    id: string;
    isVisible: boolean;
    zIndex: string;
  } | null;
  constants: {
    TOOLTIP_ID: string;
    TOOLTIP_Z_INDEX: number;
    TOOLTIP_MAX_WIDTH: number;
    TOOLTIP_MAX_HEIGHT: number;
  };
  browserAdapter?: any;
}

// ===== CONSTANTS =====

/**
 * ID for the tooltip element
 * @type {string}
 */
const TOOLTIP_ID = 'tg-tooltip';

/**
 * ARIA role for the tooltip element
 * @type {string}
 */
const TOOLTIP_ROLE = 'tooltip';

/**
 * Z-index for the tooltip element to ensure it appears above other content
 * Always uses the browser adapter's getSafeZIndex method for cross-browser compatibility
 * @type {number}
 */
const TOOLTIP_Z_INDEX = window.TooltipBrowserAdapter
  ? window.TooltipBrowserAdapter.getSafeZIndex()
  : 2147483647; // Fallback to maximum safe z-index value

/**
 * Max width for the tooltip in pixels
 * @type {number}
 */
const TOOLTIP_MAX_WIDTH = 300;

/**
 * Max height for the tooltip in pixels
 * @type {number}
 */
const TOOLTIP_MAX_HEIGHT = 200;

// ===== MODULE STATE =====

/**
 * Reference to the tooltip DOM element
 * @type {HTMLElement|null}
 */
let tooltipElement: HTMLElement | null = null;

/**
 * Flag indicating whether the tooltip has been created
 * @type {boolean}
 */
let isCreated: boolean = false;

// ===== PRIVATE HELPER FUNCTIONS =====

/**
 * Adds global CSS for accessibility styling
 * Fully delegates to TooltipBrowserAdapter for browser-specific styles
 *
 * @private
 */
function addAccessibilityStyles(): void {
  try {
    // Check if accessibility styles have already been added
    if (document.getElementById('tg-accessibility-styles')) {
      return;
    }

    // Create a style element
    const styleElement = document.createElement('style');
    styleElement.id = 'tg-accessibility-styles';

    // Always attempt to use the browser adapter for styles
    if (
      window.TooltipBrowserAdapter &&
      typeof window.TooltipBrowserAdapter.getDefaultTooltipStyles === 'function'
    ) {
      // Get default styles from the adapter
      let cssText = window.TooltipBrowserAdapter.getDefaultTooltipStyles();

      // Convert the CSS for browser compatibility if needed
      if (typeof window.TooltipBrowserAdapter.convertCssForBrowser === 'function') {
        cssText = window.TooltipBrowserAdapter.convertCssForBrowser(cssText);
      }

      styleElement.textContent = cssText;
    } else {
      // Log a warning if adapter is missing - this is important for debugging
      if (window.Logger && typeof window.Logger.warn === 'function') {
        window.Logger.warn('TooltipUI: TooltipBrowserAdapter not available for styles');
      } else {
        console.warn('TooltipUI: TooltipBrowserAdapter not available for styles');
      }

      // Minimal fallback styles if adapter is not available
      styleElement.textContent = `
        .tg-converted-text:focus {
          outline: 2px solid #0066cc !important;
          text-decoration: underline !important;
        }
      `;
    }

    // Append to document head
    document.head.appendChild(styleElement);

    // Log creation if Logger is available
    if (window.Logger && typeof window.Logger.debug === 'function') {
      window.Logger.debug('TooltipUI: Added accessibility styles');
    }
  } catch (error) {
    // Log error if Logger is available
    if (window.Logger && typeof window.Logger.error === 'function') {
      window.Logger.error('TooltipUI: Error adding accessibility styles', { error });
    } else {
      console.error('TooltipUI: Error adding accessibility styles', error);
    }
  }
}

/**
 * Applies all necessary styles to the tooltip element
 * Primarily delegates to TooltipBrowserAdapter for styling, with minimal base styles
 *
 * @private
 * @param {HTMLElement} element - The tooltip element to style
 */
function applyTooltipStyles(element: HTMLElement): void {
  try {
    // First apply minimal essential base styles (using proper TypeScript-friendly approach)
    const applyStyle = (property: string, value: string) => {
      if (element.style) {
        element.style.setProperty(property, value);
      }
    };

    // Initial state (hidden)
    applyStyle('position', 'fixed');
    applyStyle('visibility', 'hidden');
    applyStyle('opacity', '0');

    // Size constraints from constants
    applyStyle('max-width', `${TOOLTIP_MAX_WIDTH}px`);
    applyStyle('max-height', `${TOOLTIP_MAX_HEIGHT}px`);

    // Set z-index from adapter or constant
    applyStyle('z-index', String(TOOLTIP_Z_INDEX));

    // Check if browser adapter is available for browser-specific styling
    if (
      window.TooltipBrowserAdapter &&
      typeof window.TooltipBrowserAdapter.applyBrowserSpecificStyles === 'function'
    ) {
      // Let the browser adapter handle all browser-specific styles
      window.TooltipBrowserAdapter.applyBrowserSpecificStyles(element);
    } else {
      // Fallback minimal styling if adapter isn't available
      // Only apply absolutely essential styles needed for the tooltip to function
      applyStyle('pointer-events', 'none');
      applyStyle('overflow', 'auto');
      applyStyle('overflow-wrap', 'break-word');
      applyStyle('white-space', 'pre-wrap');
      applyStyle('background-color', 'rgba(32, 32, 32, 0.95)');
      applyStyle('color', '#ffffff');
      applyStyle('padding', '8px 12px');
      applyStyle('border-radius', '4px');
      applyStyle('font-size', '14px');
      applyStyle('line-height', '1.4');
      applyStyle('transition', 'opacity 0.2s ease-in-out');

      // Log a warning if adapter is missing
      if (window.Logger && typeof window.Logger.warn === 'function') {
        window.Logger.warn(
          'TooltipUI: TooltipBrowserAdapter not available for browser-specific styles'
        );
      } else {
        console.warn('TooltipUI: TooltipBrowserAdapter not available for browser-specific styles');
      }
    }
  } catch (error) {
    // Log the error if Logger is available
    if (window.Logger && typeof window.Logger.error === 'function') {
      window.Logger.error('TooltipUI: Error applying tooltip styles', { error });
    } else {
      console.error('TooltipUI: Error applying tooltip styles', error);
    }
  }
}

// ===== TOOLTIP CORE METHODS =====

/**
 * Ensures the tooltip DOM element is created and ready.
 * Creates the element if it doesn't exist yet and appends it to document.body.
 *
 * @public
 */
function ensureCreated(): void {
  // If tooltip already exists, do nothing
  if (isCreated && tooltipElement) {
    return;
  }

  try {
    // Check if document is available (important for testing environments)
    if (typeof document === 'undefined') {
      return;
    }

    // Create tooltip element
    tooltipElement = document.createElement('div');

    // Set attributes
    tooltipElement.id = TOOLTIP_ID;
    tooltipElement.setAttribute('role', TOOLTIP_ROLE);
    tooltipElement.setAttribute('aria-hidden', 'true');

    // Apply all styles to the tooltip element
    applyTooltipStyles(tooltipElement);

    // Add CSS for focus styles to improve accessibility
    addAccessibilityStyles();

    // Append to document body
    document.body.appendChild(tooltipElement);

    // Mark as created
    isCreated = true;

    // Log creation if Logger is available
    if (window.Logger && typeof window.Logger.debug === 'function') {
      window.Logger.debug('TooltipUI: Tooltip element created', { id: TOOLTIP_ID });
    }
  } catch (error) {
    // Log error if Logger is available
    if (window.Logger && typeof window.Logger.error === 'function') {
      window.Logger.error('TooltipUI: Error creating tooltip element', { error });
    } else {
      console.error('TooltipUI: Error creating tooltip element', error);
    }

    // Reset state on error
    tooltipElement = null;
    isCreated = false;
  }
}

/**
 * Sets the text content of the tooltip.
 * Must use textContent for security to prevent XSS.
 *
 * @public
 * @param {string} text - The text to display in the tooltip
 */
function setText(text: string): void {
  try {
    // Ensure the tooltip element exists
    ensureCreated();

    // If tooltip creation failed or the element doesn't exist, exit early
    if (!tooltipElement) {
      if (window.Logger && typeof window.Logger.warn === 'function') {
        window.Logger.warn('TooltipUI: Cannot set text - tooltip element does not exist');
      }
      return;
    }

    // Convert to string if not already
    const safeText = text != null ? String(text) : '';

    // CRITICAL SECURITY: Always use textContent, never innerHTML, to prevent XSS attacks
    // This ensures any HTML/script tags are rendered as text, not executed
    tooltipElement.textContent = safeText;

    // Log the text setting if Logger is available
    if (window.Logger && typeof window.Logger.debug === 'function') {
      // Log only a snippet of the text to avoid cluttering logs
      const snippet = safeText.length > 30 ? safeText.substring(0, 30) + '...' : safeText;
      window.Logger.debug('TooltipUI: Set tooltip text', { snippet });
    }
  } catch (error) {
    // Log error if Logger is available
    if (window.Logger && typeof window.Logger.error === 'function') {
      window.Logger.error('TooltipUI: Error setting tooltip text', { error });
    } else {
      console.error('TooltipUI: Error setting tooltip text', error);
    }
  }
}

/**
 * Calculates and applies the tooltip's position relative to the target element,
 * avoiding viewport overflow.
 *
 * @public
 * @param {HTMLElement} targetElement - The element the tooltip should be positioned relative to
 */
function updatePosition(targetElement: HTMLElement): void {
  try {
    // Ensure the tooltip element exists
    ensureCreated();

    // Validate inputs
    if (!tooltipElement || !targetElement) {
      if (window.Logger && typeof window.Logger.warn === 'function') {
        window.Logger.warn('TooltipUI: Cannot position tooltip - missing element references');
      }
      return;
    }

    // Get target element's position and dimensions
    const targetRect = targetElement.getBoundingClientRect();

    // Get tooltip dimensions - using proper TypeScript approach
    const tooltipWidth = tooltipElement.offsetWidth;
    const tooltipHeight = tooltipElement.offsetHeight;

    // Get viewport dimensions
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

    // Calculate initial position (centered above the target element)
    let top = targetRect.top - tooltipHeight - 8; // 8px offset
    let left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;

    // Position flags to track final position type for logging
    let positionType = 'above';

    // Check if tooltip would overflow top of the viewport
    if (top < 0) {
      // Position below target instead
      top = targetRect.bottom + 8; // 8px offset
      positionType = 'below';

      // If also overflows bottom, position where it fits best
      if (top + tooltipHeight > viewportHeight) {
        // If target is larger than half the viewport height,
        // position at middle of viewport
        if (targetRect.height > viewportHeight / 2) {
          top = (viewportHeight - tooltipHeight) / 2;
          positionType = 'middle';
        } else if (targetRect.top > viewportHeight / 2) {
          // If target is in lower half of viewport, position above
          top = targetRect.top - tooltipHeight - 8;
          positionType = 'above';
        } else {
          // Target is in upper half, position below
          top = targetRect.bottom + 8;
          positionType = 'below';
        }
      }
    }

    // Check if tooltip would overflow left edge of the viewport
    if (left < 0) {
      left = 8; // 8px from left edge
      positionType += '-left-adjusted';
    }

    // Check if tooltip would overflow right edge of the viewport
    if (left + tooltipWidth > viewportWidth) {
      left = viewportWidth - tooltipWidth - 8; // 8px from right edge
      positionType += '-right-adjusted';

      // If still overflows after adjustment (tooltip wider than viewport),
      // center it in the viewport
      if (left < 0) {
        left = (viewportWidth - tooltipWidth) / 2;
        positionType += '-centered';
      }
    }

    // Apply final position using TypeScript-friendly approach with null check
    if (tooltipElement.style) {
      tooltipElement.style.setProperty('top', `${Math.max(0, top)}px`);
      tooltipElement.style.setProperty('left', `${Math.max(0, left)}px`);
    }

    // Log position update if Logger is available
    if (window.Logger && typeof window.Logger.debug === 'function') {
      window.Logger.debug('TooltipUI: Positioned tooltip', {
        position: positionType,
        top,
        left,
      });
    }
  } catch (error) {
    // Log error if Logger is available
    if (window.Logger && typeof window.Logger.error === 'function') {
      window.Logger.error('TooltipUI: Error positioning tooltip', { error });
    } else {
      console.error('TooltipUI: Error positioning tooltip', error);
    }

    // Set fallback position in center of viewport if positioning fails
    if (tooltipElement && tooltipElement.style) {
      // Use TypeScript-friendly approach for style setting with null check
      tooltipElement.style.setProperty('top', '50%');
      tooltipElement.style.setProperty('left', '50%');
      tooltipElement.style.setProperty('transform', 'translate(-50%, -50%)');
    }
  }
}

/**
 * Makes the tooltip visible and updates ARIA attributes.
 * Sets visibility and opacity styles and updates the aria-hidden attribute.
 *
 * @public
 */
function show(): void {
  try {
    // Ensure the tooltip element exists
    ensureCreated();

    // If tooltip creation failed or the element doesn't exist, exit early
    if (!tooltipElement) {
      if (window.Logger && typeof window.Logger.warn === 'function') {
        window.Logger.warn('TooltipUI: Cannot show tooltip - element does not exist');
      }
      return;
    }

    // Update styles for visibility using TypeScript-friendly approach with null check
    if (tooltipElement.style) {
      tooltipElement.style.setProperty('visibility', 'visible');
      tooltipElement.style.setProperty('opacity', '1');
    }

    // Update ARIA attribute for accessibility
    tooltipElement.setAttribute('aria-hidden', 'false');

    // Log the visibility change if Logger is available
    if (window.Logger && typeof window.Logger.debug === 'function') {
      window.Logger.debug('TooltipUI: Tooltip shown');
    }
  } catch (error) {
    // Log error if Logger is available
    if (window.Logger && typeof window.Logger.error === 'function') {
      window.Logger.error('TooltipUI: Error showing tooltip', { error });
    } else {
      console.error('TooltipUI: Error showing tooltip', error);
    }
  }
}

/**
 * Hides the tooltip and updates ARIA attributes
 *
 * @public
 */
function hide(): void {
  try {
    // Check if tooltip exists (no need to create if not)
    if (!tooltipElement) {
      return;
    }

    // Update style properties using TypeScript-friendly approach with null check
    if (tooltipElement.style) {
      tooltipElement.style.setProperty('opacity', '0');
      tooltipElement.style.setProperty('visibility', 'hidden');
    }

    // Update ARIA attributes for accessibility
    tooltipElement.setAttribute('aria-hidden', 'true');

    // Log the visibility change if Logger is available
    if (window.Logger && typeof window.Logger.debug === 'function') {
      window.Logger.debug('TooltipUI: Tooltip hidden');
    }
  } catch (error) {
    // Log error if Logger is available
    if (window.Logger && typeof window.Logger.error === 'function') {
      window.Logger.error('TooltipUI: Error hiding tooltip', { error });
    } else {
      console.error('TooltipUI: Error hiding tooltip', error);
    }
  }
}

/**
 * Removes the tooltip element from the DOM
 *
 * @public
 */
function destroy(): void {
  try {
    // Check if tooltip exists
    if (!tooltipElement) {
      return;
    }

    // Remove from DOM if it has a parent
    if (tooltipElement.parentNode) {
      tooltipElement.parentNode.removeChild(tooltipElement);
    }

    // Log destruction if Logger is available
    if (window.Logger && typeof window.Logger.debug === 'function') {
      window.Logger.debug('TooltipUI: Tooltip element destroyed', { id: TOOLTIP_ID });
    }
  } catch (error) {
    // Log error if Logger is available
    if (window.Logger && typeof window.Logger.error === 'function') {
      window.Logger.error('TooltipUI: Error destroying tooltip element', { error });
    } else {
      console.error('TooltipUI: Error destroying tooltip element', error);
    }
  } finally {
    // Reset state regardless of success or failure
    isCreated = false;
    tooltipElement = null;
  }
}

/**
 * Returns the ID of the tooltip element for ARIA linking
 *
 * @public
 * @returns {string} The ID of the tooltip element
 */
function getId(): string {
  // Simply return the ID constant
  // This will be used for aria-describedby attributes
  return TOOLTIP_ID;
}

/**
 * Gets debug information about the tooltip component and browser support
 *
 * @public
 * @returns {TooltipDebugInfo} Debug information
 */
function getDebugInfo(): TooltipDebugInfo {
  const info: TooltipDebugInfo = {
    isCreated: isCreated,
    tooltipElement: tooltipElement
      ? {
          id: tooltipElement.id,
          isVisible: window.getComputedStyle(tooltipElement).visibility === 'visible',
          zIndex: window.getComputedStyle(tooltipElement).zIndex,
        }
      : null,
    constants: {
      TOOLTIP_ID,
      TOOLTIP_Z_INDEX,
      TOOLTIP_MAX_WIDTH,
      TOOLTIP_MAX_HEIGHT,
    },
  };

  // Add browser adapter info if available
  if (
    window.TooltipBrowserAdapter &&
    typeof window.TooltipBrowserAdapter.getDebugInfo === 'function'
  ) {
    info.browserAdapter = window.TooltipBrowserAdapter.getDebugInfo();
  }

  return info;
}

// ===== PUBLIC API =====

interface TooltipUIInterface {
  ensureCreated: () => void;
  setText: (text: string) => void;
  updatePosition: (targetElement: HTMLElement) => void;
  show: () => void;
  hide: () => void;
  destroy: () => void;
  getId: () => string;
  getDebugInfo: () => TooltipDebugInfo;
}

export const TooltipUI: TooltipUIInterface = {
  // Core tooltip methods
  ensureCreated: ensureCreated,
  setText: setText,
  updatePosition: updatePosition,
  show: show,
  hide: hide,
  destroy: destroy,
  getId: getId,

  // Debug methods
  getDebugInfo: getDebugInfo,
};

export default TooltipUI;
