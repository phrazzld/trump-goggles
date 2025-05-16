/**
 * TooltipManager Module - Responsible for managing tooltip interactions
 *
 * This module handles the event delegation for showing and hiding tooltips
 * when users interact with converted text elements. It provides the coordination
 * between DOM events and the TooltipUI module. It implements the TooltipManagerInterface.
 *
 * Performance optimizations include:
 * - Throttled event handlers to reduce excessive calculations
 * - Element caching to avoid repeated DOM queries
 * - Batched DOM operations to minimize reflows
 *
 * @version 1.1.0
 */

'use strict';

// Check if performance utils are available
// This allows graceful degradation when the utils are not loaded
const performanceUtils = window.PerformanceUtils || null;

// ===== MODULE STATE =====

/**
 * Reference to the TooltipUI instance
 * @type {TooltipUIInterface|null}
 */
let tooltipUI = null;

/**
 * Flag indicating whether event listeners have been initialized
 * @type {boolean}
 */
let isInitialized = false;

/**
 * Selector for converted text elements that should trigger tooltips
 * @type {string}
 */
const CONVERTED_TEXT_SELECTOR = '.tg-converted-text';

/**
 * Attribute containing the original text to display in tooltip
 * @type {string}
 */
const ORIGINAL_TEXT_ATTR = 'data-original-text';

/**
 * Cache for throttled mouse move handler
 * @type {Function|null}
 */
let cachedThrottledMouseMove = null;

/**
 * Cache for throttled scroll handler
 * @type {Function|null}
 */
let cachedThrottledScroll = null;

/**
 * Cache for debounced keyboard handler
 * @type {Function|null}
 */
let cachedDebouncedKeyboard = null;

// ===== PERFORMANCE OPTIMIZATIONS =====

/**
 * Actual logic for mousemove handler
 *
 * @private
 * @param {MouseEvent} event - The mousemove event object
 */
function handleMouseMoveLogic(event) {
  try {
    const target = event.target;

    // Early exit if target is not valid
    // @ts-ignore: using target as HTMLElement
    if (!target || !target.closest) {
      return;
    }

    // Check if we're hovering over a converted text element
    // @ts-ignore: using target as HTMLElement
    const convertedElement = target.closest(CONVERTED_TEXT_SELECTOR);

    if (convertedElement) {
      // We're hovering over converted text that hasn't shown tooltip yet
      // Get original text from data attribute
      const originalText = convertedElement.getAttribute(ORIGINAL_TEXT_ATTR);

      if (originalText && tooltipUI) {
        // Update tooltip text and position
        tooltipUI.setText(originalText);
        tooltipUI.updatePosition(convertedElement);
        tooltipUI.show();

        // Set up ARIA relationship for accessibility
        const tooltipId = tooltipUI.getId();
        convertedElement.setAttribute('aria-describedby', tooltipId);

        // Log activity if Logger is available
        if (window.Logger && typeof window.Logger.debug === 'function') {
          window.Logger.debug('TooltipManager: Showing tooltip', {
            originalText: originalText.substring(0, 30),
          });
        }
      }
    } else if (tooltipUI) {
      // Not hovering over converted text, hide tooltip if it's visible
      hideTooltip();
    }
  } catch (error) {
    // Log any errors during mousemove handling
    if (window.Logger) {
      window.Logger.error('TooltipManager: Error in mousemove handler', { error });
    } else {
      console.error('TooltipManager: Error in mousemove handler', error);
    }
  }
}

/**
 * Helper function to hide the tooltip and clean up ARIA attributes
 *
 * @private
 */
function hideTooltip() {
  try {
    if (tooltipUI) {
      tooltipUI.hide();

      // Remove aria-describedby from any elements that had it
      const tooltipId = tooltipUI.getId();
      if (tooltipId) {
        // Find all elements that reference this tooltip
        // @ts-ignore: TypeScript doesn't recognize that document.querySelectorAll is always available
        const describedElements = document.querySelectorAll(`[aria-describedby="${tooltipId}"]`);

        if (describedElements) {
          describedElements.forEach((element) => {
            if (element && element.removeAttribute) {
              element.removeAttribute('aria-describedby');
            }
          });
        }
      }
    }
  } catch (error) {
    // Log any errors during tooltip hiding
    if (window.Logger) {
      window.Logger.error('TooltipManager: Error hiding tooltip', { error });
    } else {
      console.error('TooltipManager: Error hiding tooltip', error);
    }
  }
}

// ===== HANDLERS =====

/**
 * Handles mouse move events with performance throttling
 * Shows tooltip when hovering over converted text
 *
 * @private
 * @param {MouseEvent} event - The mouse move event object from DOM
 */
function handleMouseMove(event) {
  if (!cachedThrottledMouseMove && performanceUtils) {
    // Create and cache the throttled function
    cachedThrottledMouseMove = performanceUtils.throttle(
      handleMouseMoveLogic,
      // @ts-ignore: TypeScript doesn't recognize PerformanceUtilsInterface.Configs
      performanceUtils.Configs.input || { delay: 32 }
    );
  }

  if (cachedThrottledMouseMove) {
    // Use the cached throttled version
    cachedThrottledMouseMove(event);
  } else {
    // Fallback to direct call if no performance utils
    handleMouseMoveLogic(event);
  }
}

/**
 * Handles mouse leave events to hide tooltip when cursor leaves the page/window
 *
 * @private
 */
function handleMouseLeave() {
  try {
    hideTooltip();

    // Log mouse leave if Logger is available
    if (window.Logger && typeof window.Logger.debug === 'function') {
      window.Logger.debug('TooltipManager: Mouse left document, hiding tooltip');
    }
  } catch (error) {
    // Log any errors during mouse leave handling
    if (window.Logger) {
      window.Logger.error('TooltipManager: Error in mouseleave handler', { error });
    } else {
      console.error('TooltipManager: Error in mouseleave handler', error);
    }
  }
}

/**
 * Handles focus events to show tooltip when tabbing to converted text
 *
 * @private
 * @param {FocusEvent} event - The focus event object from DOM
 */
function handleFocus(event) {
  try {
    const target = event.target;

    // Check if the focused element is converted text
    // @ts-ignore: using target as HTMLElement
    if (target && target.matches && target.matches(CONVERTED_TEXT_SELECTOR)) {
      // Get original text from data attribute
      // @ts-ignore: using target as HTMLElement
      const originalText = target.getAttribute(ORIGINAL_TEXT_ATTR);

      if (originalText && tooltipUI) {
        // Show tooltip for focused element
        tooltipUI.setText(originalText);
        // @ts-ignore: target is HTMLElement
        tooltipUI.updatePosition(target);
        tooltipUI.show();

        // Set up ARIA relationship
        const tooltipId = tooltipUI.getId();
        // @ts-ignore: target is HTMLElement
        target.setAttribute('aria-describedby', tooltipId);

        // Log activity if Logger is available
        if (window.Logger && typeof window.Logger.debug === 'function') {
          window.Logger.debug('TooltipManager: Showing tooltip on focus', {
            originalText: originalText.substring(0, 30),
          });
        }
      }
    }
  } catch (error) {
    // Log any errors during focus handling
    if (window.Logger) {
      window.Logger.error('TooltipManager: Error in focus handler', { error });
    } else {
      console.error('TooltipManager: Error in focus handler', error);
    }
  }
}

/**
 * Handles blur events to hide tooltip when tabbing away from converted text
 *
 * @private
 * @param {FocusEvent} event - The blur event object from DOM
 */
function handleBlur(event) {
  try {
    const target = event.target;

    // Check if the blurred element was showing a tooltip
    // @ts-ignore: using target as HTMLElement
    if (target && target.matches && target.matches(CONVERTED_TEXT_SELECTOR)) {
      hideTooltip();

      // Log activity if Logger is available
      if (window.Logger && typeof window.Logger.debug === 'function') {
        window.Logger.debug('TooltipManager: Hiding tooltip on blur');
      }
    }
  } catch (error) {
    // Log any errors during blur handling
    if (window.Logger) {
      window.Logger.error('TooltipManager: Error in blur handler', { error });
    } else {
      console.error('TooltipManager: Error in blur handler', error);
    }
  }
}

/**
 * Handles scroll events with performance throttling
 * Hides tooltip during scrolling to avoid positioning issues
 *
 * @private
 */
function handleScrollLogic() {
  try {
    hideTooltip();

    // Log scroll if debug level logging is enabled
    if (window.Logger && typeof window.Logger.debug === 'function') {
      window.Logger.debug('TooltipManager: Hiding tooltip due to scroll');
    }
  } catch (error) {
    // Log any errors during scroll handling
    if (window.Logger) {
      window.Logger.error('TooltipManager: Error in scroll handler', { error });
    } else {
      console.error('TooltipManager: Error in scroll handler', error);
    }
  }
}

/**
 * Handles scroll events
 * Hides tooltip during scrolling to prevent jarring repositioning
 *
 * @private
 */
function handleScroll() {
  if (!cachedThrottledScroll && performanceUtils) {
    // Create and cache the throttled function
    cachedThrottledScroll = performanceUtils.throttle(
      handleScrollLogic,
      // @ts-ignore: TypeScript doesn't recognize PerformanceUtilsInterface.Configs
      performanceUtils.Configs.scroll || { delay: 150 }
    );
  }

  if (cachedThrottledScroll) {
    // Use the cached throttled version
    cachedThrottledScroll();
  } else {
    // Fallback to direct call if no performance utils
    handleScrollLogic();
  }
}

/**
 * Core keyboard event handler functionality
 * Currently only handles Escape key to close tooltip
 *
 * @private
 * @param {KeyboardEvent} event - The keyboard event
 */
function handleKeyboardLogic(event) {
  try {
    // Only handle Escape key for now
    if (event.key === 'Escape' || event.keyCode === 27) {
      // @ts-ignore: tooltipUI is checked to be non-null in handleKeydown
      tooltipUI.hide();

      // Remove aria-describedby from any elements that had it
      // @ts-ignore: tooltipUI is checked to be non-null in handleKeydown
      const tooltipId = tooltipUI.getId();
      if (tooltipId) {
        // Find all elements that reference this tooltip
        // @ts-ignore: TypeScript doesn't recognize that document.querySelectorAll is always available
        const describedElements = document.querySelectorAll(`[aria-describedby="${tooltipId}"]`);

        if (describedElements) {
          Array.from(describedElements).forEach((element) => {
            if (element && element.removeAttribute) {
              element.removeAttribute('aria-describedby');
            }
          });
        }
      }

      // Log escape key dismissal if debug logging is enabled
      if (window.Logger && typeof window.Logger.debug === 'function') {
        window.Logger.debug('TooltipManager: Dismissed tooltip with Escape key');
      }
    }
  } catch (error) {
    // Log any errors during keyboard handling
    if (window.Logger) {
      window.Logger.error('TooltipManager: Error during keyboard dismissal', { error });
    } else {
      console.error('TooltipManager: Error during keyboard dismissal', error);
    }
  }
}

/**
 * Handles keyboard events
 * Currently only handles Escape key to dismiss tooltip
 *
 * @private
 * @param {KeyboardEvent} event - The keyboard event
 */
function handleKeydown(event) {
  if (!cachedDebouncedKeyboard && performanceUtils) {
    // Create and cache the debounced function
    cachedDebouncedKeyboard = performanceUtils.debounce(
      handleKeyboardLogic,
      // @ts-ignore: TypeScript doesn't recognize PerformanceUtilsInterface.Configs
      performanceUtils.Configs.keyboard || { delay: 50 }
    );
  }

  if (cachedDebouncedKeyboard) {
    // Use the cached debounced version
    cachedDebouncedKeyboard(event);
  } else {
    // Fallback to direct call if no performance utils
    handleKeyboardLogic(event);
  }
}

// ===== PUBLIC API =====

/**
 * Initializes the TooltipManager with event listeners
 * Sets up all necessary event delegation for tooltip functionality
 *
 * @public
 * @param {TooltipUIInterface} uiModule - The TooltipUI module instance
 */
function initialize(uiModule) {
  try {
    // Validate input
    if (!uiModule) {
      throw new Error('TooltipUI module is required');
    }

    // Prevent multiple initializations
    if (isInitialized) {
      if (window.Logger && typeof window.Logger.warn === 'function') {
        window.Logger.warn('TooltipManager: Already initialized');
      }
      return;
    }

    // Store reference to UI module
    tooltipUI = uiModule;

    // Ensure tooltip element is created before we start
    tooltipUI.ensureCreated();

    // Set up event listeners with proper options for performance
    // Note: using passive where possible to improve scroll performance
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave, { passive: true });
    document.addEventListener('focusin', handleFocus, { passive: true });
    document.addEventListener('focusout', handleBlur, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true, capture: true });
    document.addEventListener('keydown', handleKeydown, { passive: false }); // Not passive - we might preventDefault

    // Update initialization flag
    isInitialized = true;

    // Log successful initialization
    if (window.Logger && typeof window.Logger.info === 'function') {
      window.Logger.info('TooltipManager: Initialized successfully');
    }
  } catch (error) {
    // Log initialization errors
    if (window.Logger && typeof window.Logger.error === 'function') {
      window.Logger.error('TooltipManager: Initialization failed', { error });
    } else {
      console.error('TooltipManager: Initialization failed', error);
    }

    // Re-throw critical errors to prevent silent failure
    throw error;
  }
}

/**
 * Disposes of the TooltipManager by removing all event listeners
 * Should be called when the extension is being disabled or cleaned up
 *
 * @public
 */
function dispose() {
  try {
    // Remove all event listeners
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseleave', handleMouseLeave);
    document.removeEventListener('focusin', handleFocus);
    document.removeEventListener('focusout', handleBlur);
    window.removeEventListener('scroll', handleScroll);
    document.removeEventListener('keydown', handleKeydown);

    // Destroy the tooltip UI element
    if (tooltipUI) {
      tooltipUI.destroy();
    }

    // Reset module state
    tooltipUI = null;
    isInitialized = false;
    cachedThrottledMouseMove = null;
    cachedThrottledScroll = null;
    cachedDebouncedKeyboard = null;

    // Log disposal
    if (window.Logger && typeof window.Logger.info === 'function') {
      window.Logger.info('TooltipManager: Disposed successfully');
    }
  } catch (error) {
    // Log disposal errors
    if (window.Logger && typeof window.Logger.error === 'function') {
      window.Logger.error('TooltipManager: Error during disposal', { error });
    } else {
      console.error('TooltipManager: Error during disposal', error);
    }
  }
}

// ===== PUBLIC API =====

export const TooltipManager = {
  initialize: initialize,
  dispose: dispose,
};

export default TooltipManager;
