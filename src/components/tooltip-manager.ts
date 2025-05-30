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

// Include the reference to types for editor tooling
/// <reference path="../types/types.d.ts" />
// Import dependencies properly instead of using global window properties
import { escapeHTML } from '../utils/security-utils';

// Define interfaces for strict type checking
interface TooltipUIInterface {
  ensureCreated: () => void;
  setText: (text: string) => void;
  updatePosition: (element: HTMLElement) => void;
  show: () => void;
  hide: () => void;
  destroy: () => void;
  getId: () => string;
  getDebugInfo?: () => any;
}

interface LoggerInterface {
  debug: (message: string, data?: any) => void;
  info: (message: string, data?: any) => void;
  warn: (message: string, data?: any) => void;
  error: (message: string, data?: any) => void;
  LEVELS?: Record<string, string>;
}

interface PerformanceUtilsInterface {
  throttle: <T extends (...args: any[]) => any>(
    fn: T,
    options: { delay: number; maxWait?: number } | number
  ) => (...args: Parameters<T>) => ReturnType<T> | undefined;

  debounce: <T extends (...args: any[]) => any>(
    fn: T,
    options: { delay: number; maxWait?: number } | number
  ) => (...args: Parameters<T>) => ReturnType<T> | undefined;

  Configs?: {
    input?: { delay: number; maxWait?: number };
    scroll?: { delay: number; maxWait?: number };
    keyboard?: { delay: number; maxWait?: number };
    mutation?: { delay: number; maxWait?: number };
  };
}

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

// Default throttle/debounce option configurations
const DEFAULT_CONFIGS = {
  input: { delay: 32 }, // ~2 frames at 60fps
  scroll: { delay: 150 },
  keyboard: { delay: 50 },
};

// Window interface extension is defined in types.d.ts

// Get Logger from window for backward compatibility
// Will be properly injected in a future refactor
// This avoids the need to update all call sites at once
const getLogger = (): LoggerInterface | undefined => {
  return window.Logger;
};

// Get PerformanceUtils from window for backward compatibility
// Will be properly injected in a future refactor
const getPerformanceUtils = (): PerformanceUtilsInterface | null => {
  return window.PerformanceUtils || null;
};

// ===== MODULE STATE =====

/**
 * Reference to the TooltipUI instance
 */
let tooltipUI: TooltipUIInterface | null = null;

/**
 * Flag indicating whether event listeners have been initialized
 */
let isInitialized: boolean = false;

/**
 * Selector for converted text elements that should trigger tooltips
 */
const CONVERTED_TEXT_SELECTOR: string = '.tg-converted-text';

/**
 * Attribute containing the original text to display in tooltip
 */
const ORIGINAL_TEXT_ATTR: string = 'data-original-text';

/**
 * Store all active event handlers to ensure proper cleanup
 */
const activeEventHandlers: EventHandlerInfo[] = [];

/**
 * Private cleanup function reference stored in module scope
 * Used to ensure proper cleanup when the tooltip manager is disposed
 */
let cleanupFunction: (() => void) | null = null;

/**
 * Cache for throttled mouse move handler
 */
let cachedThrottledMouseMove: ((event: MouseEvent) => void) | null = null;

/**
 * Cache for throttled scroll handler
 */
let cachedThrottledScroll: (() => void) | null = null;

/**
 * Cache for debounced keyboard handler
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
        const logger = getLogger();
        if (logger && typeof logger.debug === 'function') {
          // Use escapeHTML to sanitize logging output
          const safeText = escapeHTML(originalText.substring(0, 30));

          logger.debug('TooltipManager: Showing tooltip', {
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
    const logger = getLogger();
    if (logger) {
      logger.error('TooltipManager: Error in mousemove handler', { error });
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
    const logger = getLogger();
    if (logger) {
      logger.error('TooltipManager: Error hiding tooltip', { error });
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
  const performanceUtils = getPerformanceUtils();

  if (!cachedThrottledMouseMove && performanceUtils) {
    // Create and cache the throttled function
    const config = performanceUtils.Configs?.input || DEFAULT_CONFIGS.input;
    cachedThrottledMouseMove = performanceUtils.throttle(handleMouseMoveLogic, config);
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
    const logger = getLogger();
    if (logger && typeof logger.debug === 'function') {
      logger.debug('TooltipManager: Mouse left document, hiding tooltip');
    }
  } catch (error) {
    // Log any errors during mouse leave handling
    const logger = getLogger();
    if (logger) {
      logger.error('TooltipManager: Error in mouseleave handler', { error });
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
        const logger = getLogger();
        if (logger && typeof logger.debug === 'function') {
          // Use escapeHTML for log safety
          const safeText = escapeHTML(originalText.substring(0, 30));

          logger.debug('TooltipManager: Showing tooltip on focus', {
            originalText: safeText,
          });
        }
      }
    }
  } catch (error) {
    // Log any errors during focus handling
    const logger = getLogger();
    if (logger) {
      logger.error('TooltipManager: Error in focus handler', { error });
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
      const logger = getLogger();
      if (logger && typeof logger.debug === 'function') {
        logger.debug('TooltipManager: Hiding tooltip on blur');
      }
    }
  } catch (error) {
    // Log any errors during blur handling
    const logger = getLogger();
    if (logger) {
      logger.error('TooltipManager: Error in blur handler', { error });
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
    const logger = getLogger();
    if (logger && typeof logger.debug === 'function') {
      logger.debug('TooltipManager: Hiding tooltip due to scroll');
    }
  } catch (error) {
    // Log any errors during scroll handling
    const logger = getLogger();
    if (logger) {
      logger.error('TooltipManager: Error in scroll handler', { error });
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
  const performanceUtils = getPerformanceUtils();

  if (!cachedThrottledScroll && performanceUtils) {
    // Create and cache the throttled function
    const config = performanceUtils.Configs?.scroll || DEFAULT_CONFIGS.scroll;
    cachedThrottledScroll = performanceUtils.throttle(handleScrollLogic, config);
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
      const logger = getLogger();
      if (logger && typeof logger.debug === 'function') {
        logger.debug('TooltipManager: Dismissed tooltip with Escape key');
      }
    }
  } catch (error) {
    // Log any errors during keyboard handling
    const logger = getLogger();
    if (logger) {
      logger.error('TooltipManager: Error during keyboard dismissal', { error });
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
  const performanceUtils = getPerformanceUtils();

  if (!cachedDebouncedKeyboard && performanceUtils) {
    // Create and cache the debounced function
    const config = performanceUtils.Configs?.keyboard || DEFAULT_CONFIGS.keyboard;
    cachedDebouncedKeyboard = performanceUtils.debounce(handleKeyboardLogic, config);
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
  handler: EventListener,
  options?: boolean | AddEventListenerOptions
): void {
  // Add the event listener
  element.addEventListener(eventType, handler, options);

  // Store the reference for later cleanup
  activeEventHandlers.push({
    element,
    event: eventType,
    handler,
    options,
  });

  // Log if available
  const logger = getLogger();
  if (logger && typeof logger.debug === 'function') {
    logger.debug('TooltipManager: Added tracked event listener', {
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
function initialize(uiModule: TooltipUIInterface): void {
  try {
    // Validate input
    if (!uiModule) {
      throw new Error('TooltipUI module is required');
    }

    // Prevent multiple initializations
    if (isInitialized) {
      const logger = getLogger();
      if (logger && typeof logger.warn === 'function') {
        logger.warn('TooltipManager: Already initialized');
      }
      return;
    }

    // Store reference to UI module
    tooltipUI = uiModule;

    // Ensure tooltip element is created before we start
    tooltipUI.ensureCreated();

    const performanceUtils = getPerformanceUtils();

    // Create and cache throttled/debounced handlers if needed
    if (performanceUtils) {
      // Create throttled mouse move handler if not already cached
      if (!cachedThrottledMouseMove) {
        const inputConfig = performanceUtils.Configs?.input || DEFAULT_CONFIGS.input;
        cachedThrottledMouseMove = performanceUtils.throttle(handleMouseMoveLogic, inputConfig);
      }

      // Create throttled scroll handler if not already cached
      if (!cachedThrottledScroll) {
        const scrollConfig = performanceUtils.Configs?.scroll || DEFAULT_CONFIGS.scroll;
        cachedThrottledScroll = performanceUtils.throttle(handleScrollLogic, scrollConfig);
      }

      // Create debounced keyboard handler if not already cached
      if (!cachedDebouncedKeyboard) {
        const keyboardConfig = performanceUtils.Configs?.keyboard || DEFAULT_CONFIGS.keyboard;
        cachedDebouncedKeyboard = performanceUtils.debounce(handleKeyboardLogic, keyboardConfig);
      }
    }

    // Set up event listeners with proper options for performance
    // Note: using passive where possible to improve scroll performance

    // Use the throttled/debounced handlers where available
    const mouseMoveHandler = cachedThrottledMouseMove || handleMouseMove;
    const scrollHandler = cachedThrottledScroll || handleScroll;
    const keyboardHandler = cachedDebouncedKeyboard || handleKeydown;

    // Add tracked event listeners
    addTrackedEventListener(document, 'mousemove', mouseMoveHandler as EventListener, {
      passive: true,
    });
    addTrackedEventListener(document, 'mouseleave', handleMouseLeave, { passive: true });
    addTrackedEventListener(document, 'focusin', handleFocus as EventListener, { passive: true });
    addTrackedEventListener(document, 'focusout', handleBlur as EventListener, { passive: true });
    addTrackedEventListener(window, 'scroll', scrollHandler as EventListener, {
      passive: true,
      capture: true,
    });
    addTrackedEventListener(document, 'keydown', keyboardHandler as EventListener, {
      passive: false,
    }); // Not passive - we might preventDefault

    // Store cleanup function in module-private variable
    cleanupFunction = () => {
      try {
        // Remove all tracked event handlers
        if (activeEventHandlers.length > 0) {
          const logger = getLogger();
          if (logger && typeof logger.debug === 'function') {
            logger.debug('TooltipManager: Removing event listeners', {
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
        const logger = getLogger();
        if (logger && typeof logger.info === 'function') {
          logger.info('TooltipManager: Disposed successfully');
        }
      } catch (error) {
        // Log disposal errors
        const logger = getLogger();
        if (logger && typeof logger.error === 'function') {
          logger.error('TooltipManager: Error during disposal', { error });
        } else {
          console.error('TooltipManager: Error during disposal', error);
        }
      }
    };

    // Update initialization flag
    isInitialized = true;

    // Log successful initialization
    const logger = getLogger();
    if (logger && typeof logger.info === 'function') {
      logger.info('TooltipManager: Initialized successfully');
    }
  } catch (error) {
    // Log initialization errors
    const logger = getLogger();
    if (logger && typeof logger.error === 'function') {
      logger.error('TooltipManager: Initialization failed', { error });
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
      const logger = getLogger();
      if (logger && typeof logger.debug === 'function') {
        logger.debug('TooltipManager: No cleanup function to call during dispose');
      }

      // Log successful disposal even without cleanup function
      if (logger && typeof logger.info === 'function') {
        logger.info('TooltipManager: Disposed successfully');
      }
    }
  } catch (error) {
    // Log disposal errors
    const logger = getLogger();
    if (logger && typeof logger.error === 'function') {
      logger.error('TooltipManager: Error during disposal', { error });
    } else {
      console.error('TooltipManager: Error during disposal', error);
    }
  }
}

// ===== PUBLIC API =====

/**
 * TooltipManager interface - Public API for the tooltip manager
 */
export interface TooltipManagerInterface {
  initialize: (uiModule: TooltipUIInterface) => void;
  dispose: () => void;
}

export const TooltipManager: TooltipManagerInterface = {
  initialize: initialize,
  dispose: dispose,
};

// For backward compatibility with global window access
// This is needed until all instances are updated to use imports
if (typeof window !== 'undefined') {
  window.TooltipManager = TooltipManager;
}

export default TooltipManager;
