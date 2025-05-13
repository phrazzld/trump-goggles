/**
 * TooltipUI Module - Responsible for managing tooltip DOM element
 *
 * This module handles the creation, positioning, and visibility of a tooltip
 * element that displays original unconverted text. It implements the TooltipUIInterface.
 *
 * @version 1.0.0
 */

// TooltipUI module pattern
const TooltipUI = (function () {
  'use strict';

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

  // ===== MODULE STATE =====

  /**
   * Reference to the tooltip DOM element
   * @type {HTMLElement|null}
   */
  let tooltipElement = null;

  /**
   * Flag indicating whether the tooltip has been created
   * @type {boolean}
   */
  let isCreated = false;

  // ===== TOOLTIP CORE METHODS =====

  /**
   * Ensures the tooltip DOM element is created and ready.
   * Creates the element if it doesn't exist yet and appends it to document.body.
   *
   * @public
   */
  function ensureCreated() {
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

      // Set initial styles - tooltipElement is an HTMLDivElement which definitely has style
      // @ts-ignore: TypeScript doesn't recognize that tooltipElement is an HTMLElement with style
      tooltipElement.style.visibility = 'hidden';
      // @ts-ignore: TypeScript doesn't recognize that tooltipElement is an HTMLElement with style
      tooltipElement.style.opacity = '0';
      // @ts-ignore: TypeScript doesn't recognize that tooltipElement is an HTMLElement with style
      tooltipElement.style.position = 'fixed'; // Ensures initial position
      // @ts-ignore: TypeScript doesn't recognize that tooltipElement is an HTMLElement with style
      tooltipElement.style.pointerEvents = 'none'; // Prevents tooltip from blocking interactions

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
  function setText(text) {
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
   * @param {HTMLElement} _targetElement - The element the tooltip should be positioned relative to
   */
  function updatePosition(_targetElement) {
    // This is a placeholder implementation that will be completed in T009
    // For now, we're just setting up the module structure
    // TODO: Implementation will be added in T009
    // Will use _targetElement parameter when implemented
  }

  /**
   * Makes the tooltip visible and updates ARIA attributes.
   * Sets visibility and opacity styles and updates the aria-hidden attribute.
   *
   * @public
   */
  function show() {
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

      // Update styles for visibility
      // @ts-ignore: TypeScript doesn't recognize that tooltipElement is an HTMLElement with style
      tooltipElement.style.visibility = 'visible';
      // @ts-ignore: TypeScript doesn't recognize that tooltipElement is an HTMLElement with style
      tooltipElement.style.opacity = '1';

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
  function hide() {
    try {
      // Check if tooltip exists (no need to create if not)
      if (!tooltipElement) {
        return;
      }

      // Update style properties
      // @ts-ignore: TypeScript doesn't recognize that tooltipElement is an HTMLElement with style
      tooltipElement.style.opacity = '0';
      // @ts-ignore: TypeScript doesn't recognize that tooltipElement is an HTMLElement with style
      tooltipElement.style.visibility = 'hidden';

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
  function destroy() {
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
  function getId() {
    // Simply return the ID constant
    // This will be used for aria-describedby attributes
    return TOOLTIP_ID;
  }

  // ===== PUBLIC API =====

  /** @type {TooltipUIInterface} */
  return {
    // Core tooltip methods
    ensureCreated: ensureCreated,
    setText: setText,
    updatePosition: updatePosition,
    show: show,
    hide: hide,
    destroy: destroy,
    getId: getId,
  };
})();

// Export the module
window.TooltipUI = TooltipUI;
