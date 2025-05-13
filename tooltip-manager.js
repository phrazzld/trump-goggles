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

  // These constants will be used in the event handling implementation (T013)
  // They are defined here as part of the module structure

  /* Will be used in T013 */
  // const CONVERTED_TEXT_SELECTOR = '.tg-converted-text';

  /* Will be used in T013 */
  // const ORIGINAL_TEXT_ATTR = 'data-original-text';

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

      // Mark as initialized
      isInitialized = true;

      // Log initialization
      if (window.Logger) {
        window.Logger.info('TooltipManager: Initialized successfully');
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

      // Call tooltipUI.destroy() if available
      if (tooltipUI) {
        tooltipUI.destroy();
      }

      // Reset state
      tooltipUI = null;
      isInitialized = false;

      // Log disposal
      if (window.Logger) {
        window.Logger.info('TooltipManager: Disposed successfully');
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

  // Event handling functions will be implemented in subsequent tasks
  // T013 will implement mouse and focus handlers
  // T014 will implement keyboard event handling

  /* Will be implemented in T013 */
  // function handleShowTooltip(event) {}

  /* Will be implemented in T013 */
  // function handleHideTooltip(event) {}

  /* Will be implemented in T014 */
  // function handleKeyDown(event) {}

  // ===== PUBLIC API =====

  /** @type {TooltipManagerInterface} */
  return {
    initialize: initialize,
    dispose: dispose,
  };
})();

// Export the module
window.TooltipManager = TooltipManager;
