/**
 * TooltipManager Module - Responsible for managing tooltip interactions
 *
 * This module handles the event delegation for showing and hiding tooltips
 * when users interact with converted text elements. It provides the coordination
 * between DOM events and the TooltipUI module. It implements the TooltipManagerInterface.
 *
 * Performance optimizations include:
 * - Throttled event handlers to reduce excessive calculations
 * - Batched DOM operations to minimize reflows
 *
 * @version 1.1.0
 */

'use strict';

// Check if performance utils are available
// This allows graceful degradation when the utils are not loaded
const performanceUtils = window.PerformanceUtils || null;

/**
 * Interface for storing event handler information to ensure proper cleanup
 */
interface EventHandlerInfo {
  /** The element the event listener is attached to */
  element: Document | Window;
  /** The event type (e.g., 'mousemove', 'scroll') */
  event: string;
  /** The actual handler function reference passed to addEventListener */
  handler: EventListener;
  /** Optional event listener options */
  options?: boolean | AddEventListenerOptions;
}

// ===== MODULE STATE =====

/**
 * Reference to the TooltipUI instance
 * @type {TooltipUIInterface|null}
 */
let tooltipUI: any = null; // Will be properly typed once TooltipUIInterface is imported

/**
 * Flag indicating whether event listeners have been initialized
 * @type {boolean}
 */
let isInitialized: boolean = false;

/**
 * Selector for converted text elements that should trigger tooltips
 * @type {string}
 */
const CONVERTED_TEXT_SELECTOR: string = '.tg-converted-text';

/**
 * Attribute containing the original text to display in tooltip
 * @type {string}
 */
const ORIGINAL_TEXT_ATTR: string = 'data-original-text';

/**
 * Store all active event handlers to ensure proper cleanup
 * @type {Array<EventHandlerInfo>}
 */
const activeEventHandlers: EventHandlerInfo[] = [];

/**
 * Private cleanup function reference stored in module scope
 * Used to ensure proper cleanup when the tooltip manager is disposed
 * @type {Function|null}
 */
let cleanupFunction: (() => void) | null = null;

/**
 * Cache for throttled mouse move handler
 * @type {Function|null}
 */
let cachedThrottledMouseMove: ((event: MouseEvent) => void) | null = null;

/**
 * Cache for throttled scroll handler
 * @type {Function|null}
 */
let cachedThrottledScroll: (() => void) | null = null;

/**
 * Cache for debounced keyboard handler
 * @type {Function|null}
 */
let cachedDebouncedKeyboard: ((event: KeyboardEvent) => void) | null = null;

// ===== PERFORMANCE OPTIMIZATIONS =====

/**
 * Actual logic for mousemove handler
 *
 * @private
 * @param {MouseEvent} event - The mousemove event object
 */
function handleMouseMoveLogic(event: MouseEvent): void {
  try {
    const target = event.target as HTMLElement | null;

    // Early exit if target is not valid
    if (!target || !('closest' in target)) {
      return;
    }

    // Check if we're hovering over a converted text element
    const convertedElement = target.closest(CONVERTED_TEXT_SELECTOR) as HTMLElement | null;

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
          // Use escapeHTML if available, otherwise log a subset of characters
          const safeText = window.SecurityUtils?.escapeHTML 
            ? window.SecurityUtils.escapeHTML(originalText.substring(0, 30))
            : originalText.substring(0, 30);
          
          window.Logger.debug('TooltipManager: Showing tooltip', {
            originalText: safeText,
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
function hideTooltip(): void {
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
function handleMouseMove(event: MouseEvent): void {
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
function handleMouseLeave(): void {
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
function handleFocus(event: FocusEvent): void {
  try {
    const target = event.target as HTMLElement | null;

    // Check if the focused element is converted text
    if (target && 'matches' in target && target.matches(CONVERTED_TEXT_SELECTOR)) {
      // Get original text from data attribute
      const originalText = target.getAttribute(ORIGINAL_TEXT_ATTR);

      if (originalText && tooltipUI) {
        // Show tooltip for focused element
        tooltipUI.setText(originalText);
        tooltipUI.updatePosition(target);
        tooltipUI.show();

        // Set up ARIA relationship
        const tooltipId = tooltipUI.getId();
        target.setAttribute('aria-describedby', tooltipId);

        // Log activity if Logger is available
        if (window.Logger && typeof window.Logger.debug === 'function') {
          // Use escapeHTML if available, otherwise log a subset of characters
          const safeText = window.SecurityUtils?.escapeHTML 
            ? window.SecurityUtils.escapeHTML(originalText.substring(0, 30))
            : originalText.substring(0, 30);
          
          window.Logger.debug('TooltipManager: Showing tooltip on focus', {
            originalText: safeText,
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
function handleBlur(event: FocusEvent): void {
  try {
    const target = event.target as HTMLElement | null;

    // Check if the blurred element was showing a tooltip
    if (target && 'matches' in target && target.matches(CONVERTED_TEXT_SELECTOR)) {
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
function handleScrollLogic(): void {
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
function handleScroll(): void {
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
function handleKeyboardLogic(event: KeyboardEvent): void {
  try {
    // Only handle Escape key for now
    if (event.key === 'Escape' || event.keyCode === 27) {
      if (tooltipUI) {
        tooltipUI.hide();

        // Remove aria-describedby from any elements that had it
        const tooltipId = tooltipUI.getId();
        if (tooltipId) {
          // Find all elements that reference this tooltip
          if (document.querySelectorAll) {
            const describedElements = document.querySelectorAll(
              `[aria-describedby="${tooltipId}"]`
            );

            if (describedElements) {
              Array.from(describedElements).forEach((element) => {
                element.removeAttribute('aria-describedby');
              });
            }
          }
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
function handleKeydown(event: KeyboardEvent): void {
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
 * Helper function to add and track event listeners
 *
 * @private
 * @param element - The element to attach the listener to (document or window)
 * @param eventType - The event type to listen for
 * @param handler - The event handler function
 * @param options - Optional addEventListener options
 */
function addTrackedEventListener(
  element: Document | Window,
  eventType: string,
  handler: any, // Use any to avoid TypeScript event handler compatibility issues
  options?: boolean | AddEventListenerOptions
): void {
  // Add the event listener
  element.addEventListener(eventType, handler as EventListener, options);

  // Store the reference for later cleanup
  activeEventHandlers.push({
    element,
    event: eventType,
    handler: handler as EventListener,
    options,
  });

  // Log if available
  if (window.Logger && typeof window.Logger.debug === 'function') {
    window.Logger.debug('TooltipManager: Added tracked event listener', {
      element: element === document ? 'document' : 'window',
      event: eventType,
    });
  }
}

/**
 * Initializes the TooltipManager with event listeners
 * Sets up all necessary event delegation for tooltip functionality
 *
 * @public
 * @param {TooltipUIInterface} uiModule - The TooltipUI module instance
 */
function initialize(uiModule: any): void {
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

    // Create and cache throttled/debounced handlers if needed
    if (performanceUtils) {
      // Create throttled mouse move handler if not already cached
      if (!cachedThrottledMouseMove) {
        cachedThrottledMouseMove = performanceUtils.throttle(
          handleMouseMoveLogic,
          // @ts-ignore: TypeScript doesn't recognize PerformanceUtilsInterface.Configs
          performanceUtils.Configs.input || { delay: 32 }
        );
      }

      // Create throttled scroll handler if not already cached
      if (!cachedThrottledScroll) {
        cachedThrottledScroll = performanceUtils.throttle(
          handleScrollLogic,
          // @ts-ignore: TypeScript doesn't recognize PerformanceUtilsInterface.Configs
          performanceUtils.Configs.scroll || { delay: 150 }
        );
      }

      // Create debounced keyboard handler if not already cached
      if (!cachedDebouncedKeyboard) {
        cachedDebouncedKeyboard = performanceUtils.debounce(
          handleKeyboardLogic,
          // @ts-ignore: TypeScript doesn't recognize PerformanceUtilsInterface.Configs
          performanceUtils.Configs.keyboard || { delay: 50 }
        );
      }
    }

    // Set up event listeners with proper options for performance
    // Note: using passive where possible to improve scroll performance

    // Use the throttled/debounced handlers where available
    const mouseMoveHandler = cachedThrottledMouseMove || handleMouseMove;
    const scrollHandler = cachedThrottledScroll || handleScroll;
    const keyboardHandler = cachedDebouncedKeyboard || handleKeydown;

    // Add tracked event listeners
    addTrackedEventListener(document, 'mousemove', mouseMoveHandler, { passive: true });
    addTrackedEventListener(document, 'mouseleave', handleMouseLeave, { passive: true });
    addTrackedEventListener(document, 'focusin', handleFocus, { passive: true });
    addTrackedEventListener(document, 'focusout', handleBlur, { passive: true });
    addTrackedEventListener(window, 'scroll', scrollHandler, { passive: true, capture: true });
    addTrackedEventListener(document, 'keydown', keyboardHandler, { passive: false }); // Not passive - we might preventDefault

    // Store cleanup function in module-private variable
    cleanupFunction = () => {
      try {
        // Remove all tracked event listeners
        if (activeEventHandlers.length > 0) {
          if (window.Logger && typeof window.Logger.debug === 'function') {
            window.Logger.debug('TooltipManager: Removing event listeners', {
              count: activeEventHandlers.length,
            });
          }

          // Remove each event listener using the exact same function references
          for (const { element, event, handler, options } of activeEventHandlers) {
            // For capture/once/passive options, we need to ensure the same options object is used
            element.removeEventListener(event, handler, options);
          }

          // Clear the array
          activeEventHandlers.length = 0;
        }

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
    };

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
function dispose(): void {
  try {
    // Call the private cleanup function if it exists
    if (cleanupFunction) {
      cleanupFunction();
      
      // After cleanup, clear the reference to the function itself
      cleanupFunction = null;
    } else {
      // If no cleanup function exists (perhaps initialize wasn't called),
      // log a debug message but don't treat as an error
      if (window.Logger && typeof window.Logger.debug === 'function') {
        window.Logger.debug('TooltipManager: No cleanup function to call during dispose');
      }
      
      // Log successful disposal even without cleanup function
      if (window.Logger && typeof window.Logger.info === 'function') {
        window.Logger.info('TooltipManager: Disposed successfully');
      }
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

interface TooltipManagerInterface {
  initialize: (uiModule: any) => void;
  dispose: () => void;
}

export const TooltipManager: TooltipManagerInterface = {
  initialize: initialize,
  dispose: dispose,
};

export default TooltipManager;
