/**
 * TooltipManager Module - Responsible for managing tooltip interactions
 *
 * This module handles the event delegation for showing and hiding tooltips
 * when users interact with converted text elements. It provides the coordination
 * between DOM events and the TooltipUI module. It implements the TooltipManagerInterface.
 *
 * @version 1.0.0
 */

// TooltipManager module pattern
const TooltipManager = (function () {
  'use strict';

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
   * Optional delay in milliseconds before showing tooltip to prevent flickering
   * @type {number}
   */
  const SHOW_DELAY = 80; // Milliseconds

  /**
   * Track current timeout for delayed showing
   * @type {ReturnType<typeof setTimeout>|null}
   */
  let showDelayTimeout = null;

  // ===== INITIALIZATION & DISPOSAL =====

  /**
   * Initializes the TooltipManager with a TooltipUI instance
   * Must be called before other methods can be used
   *
   * @public
   * @param {TooltipUIInterface} tooltipUIInstance - The TooltipUI instance to use
   */
  function initialize(tooltipUIInstance) {
    try {
      // Validate inputs
      if (!tooltipUIInstance) {
        if (window.Logger) {
          window.Logger.error('TooltipManager: Cannot initialize with null TooltipUI instance');
        }
        return;
      }

      // If already initialized, clean up first
      if (isInitialized) {
        dispose();
      }

      // Store tooltipUI instance
      tooltipUI = tooltipUIInstance;

      // Ensure tooltip element is created
      tooltipUI.ensureCreated();

      // Set up delegated event listeners for converting text elements
      // Use event delegation to handle events for all current and future elements
      document.body.addEventListener('mouseover', handleShowTooltip);
      document.body.addEventListener('mouseout', handleHideTooltip);
      document.body.addEventListener('focusin', handleShowTooltip);
      document.body.addEventListener('focusout', handleHideTooltip);

      // Mark as initialized
      isInitialized = true;

      // Log initialization
      if (window.Logger) {
        window.Logger.info(
          'TooltipManager: Initialized successfully with event listeners attached'
        );
      }
    } catch (error) {
      // Log any errors during initialization
      if (window.Logger) {
        window.Logger.error('TooltipManager: Error during initialization', { error });
      } else {
        console.error('TooltipManager: Error during initialization', error);
      }

      // Reset state on error
      tooltipUI = null;
      isInitialized = false;
    }
  }

  /**
   * Disposes of the TooltipManager, removing event listeners and cleaning up resources
   *
   * @public
   */
  function dispose() {
    try {
      // Check if already initialized
      if (!isInitialized) {
        return;
      }

      // Clear any pending timeout
      if (showDelayTimeout !== null) {
        clearTimeout(showDelayTimeout);
        showDelayTimeout = null;
      }

      // Remove all event listeners
      document.body.removeEventListener('mouseover', handleShowTooltip);
      document.body.removeEventListener('mouseout', handleHideTooltip);
      document.body.removeEventListener('focusin', handleShowTooltip);
      document.body.removeEventListener('focusout', handleHideTooltip);

      // Call tooltipUI.destroy() if available
      if (tooltipUI) {
        tooltipUI.destroy();
      }

      // Reset state
      tooltipUI = null;
      isInitialized = false;

      // Log disposal
      if (window.Logger) {
        window.Logger.info('TooltipManager: Disposed successfully, event listeners removed');
      }
    } catch (error) {
      // Log any errors during disposal
      if (window.Logger) {
        window.Logger.error('TooltipManager: Error during disposal', { error });
      } else {
        console.error('TooltipManager: Error during disposal', error);
      }
    }
  }

  // ===== EVENT HANDLING =====

  /**
   * Utility function to find closest converted text element from the event target
   *
   * @private
   * @param {EventTarget|null} target - Event target to check
   * @returns {HTMLElement|null} The converted text element or null if not found
   */
  function findConvertedTextElement(target) {
    // Check if target exists and is an element node
    if (!target || !(target instanceof HTMLElement)) {
      return null;
    }

    // Check if the target itself is a converted text element
    if (target.matches && target.matches(CONVERTED_TEXT_SELECTOR)) {
      return target;
    }

    // Otherwise, check if any parent is a converted text element (for events bubbling up)
    // This is helpful if the event originated from a child of the span (unlikely but possible)
    if (target.closest) {
      const closestElement = target.closest(CONVERTED_TEXT_SELECTOR);
      return closestElement instanceof HTMLElement ? closestElement : null;
    }

    return null;
  }

  /**
   * Shows the tooltip with the original text when hovering over or focusing on converted text
   *
   * @private
   * @param {MouseEvent|FocusEvent} event - The mouseover or focusin event
   */
  function handleShowTooltip(event) {
    try {
      // Exit early if not initialized
      if (!isInitialized || !tooltipUI) {
        return;
      }

      // Find the converted text element
      const convertedElement = findConvertedTextElement(event.target);
      if (!convertedElement) {
        return; // Not a converted text element or its child
      }

      // Get the original text from the data attribute
      const originalText = convertedElement.getAttribute(ORIGINAL_TEXT_ATTR);

      // Validate original text
      if (!originalText) {
        if (window.Logger) {
          window.Logger.warn('TooltipManager: Missing data-original-text attribute', {
            element: convertedElement.outerHTML.slice(0, 100), // Log a snippet of the element
          });
        }
        return;
      }

      // Clear any existing timeout
      if (showDelayTimeout !== null) {
        clearTimeout(showDelayTimeout);
      }

      // Store a reference to the current tooltipUI to use inside the closure
      // This ensures we're not using the potentially null tooltipUI inside the timeout callback
      const tooltipUIRef = tooltipUI;

      // Implement a small delay to prevent flickering when moving between elements
      showDelayTimeout = setTimeout(() => {
        // Verify tooltipUIRef exists before using it
        if (!tooltipUIRef) {
          return;
        }

        // Set the tooltip text
        tooltipUIRef.setText(originalText);

        // Position the tooltip relative to the element
        tooltipUIRef.updatePosition(convertedElement);

        // Show the tooltip
        tooltipUIRef.show();

        // Set ARIA attribute for accessibility
        const tooltipId = tooltipUIRef.getId();
        convertedElement.setAttribute('aria-describedby', tooltipId);

        // Log showing tooltip if debug logging is enabled
        if (window.Logger && typeof window.Logger.debug === 'function') {
          window.Logger.debug('TooltipManager: Showing tooltip', {
            originalTextSnippet:
              originalText.length > 30 ? `${originalText.substring(0, 30)}...` : originalText,
            elementTag: convertedElement.tagName,
            elementClasses: convertedElement.className,
          });
        }

        // Reset timeout reference
        showDelayTimeout = null;
      }, SHOW_DELAY);
    } catch (error) {
      // Log any errors during tooltip showing
      if (window.Logger) {
        window.Logger.error('TooltipManager: Error showing tooltip', { error });
      } else {
        console.error('TooltipManager: Error showing tooltip', error);
      }
    }
  }

  /**
   * Hides the tooltip when moving away from or blurring a converted text element
   *
   * @private
   * @param {MouseEvent|FocusEvent} event - The mouseout or focusout event
   */
  function handleHideTooltip(event) {
    try {
      // Exit early if not initialized
      if (!isInitialized || !tooltipUI) {
        return;
      }

      // Clear any pending show timeout
      if (showDelayTimeout !== null) {
        clearTimeout(showDelayTimeout);
        showDelayTimeout = null;
      }

      // Find the converted text element
      const convertedElement = findConvertedTextElement(event.target);
      if (!convertedElement) {
        return; // Not a converted text element or its child
      }

      // For mouseout events, check if we're moving to another element inside the converted text element
      // This prevents the tooltip from flickering when moving between child elements
      if (event.type === 'mouseout' && event.relatedTarget) {
        // Safely check if it's a node before using contains
        // Since relatedTarget could be any EventTarget not necessarily a Node
        if (event.relatedTarget instanceof Node && convertedElement.contains(event.relatedTarget)) {
          return;
        }
      }

      // Store a reference to the current tooltipUI to use
      const tooltipUIRef = tooltipUI;
      if (!tooltipUIRef) {
        return;
      }

      // Hide the tooltip
      tooltipUIRef.hide();

      // Remove the ARIA attribute
      convertedElement.removeAttribute('aria-describedby');

      // Log hiding tooltip if debug logging is enabled
      if (window.Logger && typeof window.Logger.debug === 'function') {
        window.Logger.debug('TooltipManager: Hiding tooltip', {
          eventType: event.type,
        });
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

  // The keyboard event handling function will be implemented in T014
  // This comment is a placeholder for the upcoming implementation

  // To be implemented in T014:
  // function handleKeyDown(event) {
  //   // Check for Escape key
  //   // If pressed and tooltip is visible, hide the tooltip
  // }

  // ===== PUBLIC API =====

  /** @type {TooltipManagerInterface} */
  return {
    initialize: initialize,
    dispose: dispose,
  };
})();

// Export the module
window.TooltipManager = TooltipManager;
