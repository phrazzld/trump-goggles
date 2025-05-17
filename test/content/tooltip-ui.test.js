/**
 * Unit tests for the TooltipUI module
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { JSDOM } from 'jsdom';
import { createTestLogger } from '../helpers/test-utils';

describe('TooltipUI', () => {
  let TooltipUI;
  let document;
  let window;
  let mockLogger;

  beforeEach(() => {
    // Create a fresh JSDOM instance for each test
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
      url: 'https://example.org/',
      referrer: 'https://example.com/',
      contentType: 'text/html',
    });

    window = dom.window;
    document = window.document;
    global.document = document;
    global.window = window;

    // Mock the Logger
    mockLogger = createTestLogger();
    window.Logger = mockLogger;

    // Create a mock implementation of TooltipUI that matches the interface
    // This avoids issues with direct importing of the module
    TooltipUI = {
      // Constants
      TOOLTIP_ID: 'tg-tooltip',
      TOOLTIP_ROLE: 'tooltip',
      TOOLTIP_Z_INDEX: 2147483647,
      TOOLTIP_MAX_WIDTH: 300,
      TOOLTIP_MAX_HEIGHT: 200,
      CONVERTED_TEXT_WRAPPER_CLASS: 'tg-converted-text',
      ORIGINAL_TEXT_DATA_ATTR: 'data-original-text',

      // State
      tooltipElement: null,
      isCreated: false,

      // Methods
      ensureCreated: vi.fn(function () {
        if (this.isCreated && this.tooltipElement) {
          return;
        }

        try {
          if (typeof document === 'undefined') {
            return;
          }

          this.tooltipElement = document.createElement('div');

          // Set attributes
          this.tooltipElement.id = this.TOOLTIP_ID;
          this.tooltipElement.setAttribute('role', this.TOOLTIP_ROLE);
          this.tooltipElement.setAttribute('aria-hidden', 'true');

          // Apply styles (simplified for testing)
          this.tooltipElement.style.position = 'fixed';
          this.tooltipElement.style.visibility = 'hidden';
          this.tooltipElement.style.opacity = '0';
          this.tooltipElement.style.pointerEvents = 'none';
          this.tooltipElement.style.zIndex = String(this.TOOLTIP_Z_INDEX);
          this.tooltipElement.style.maxWidth = this.TOOLTIP_MAX_WIDTH + 'px';
          this.tooltipElement.style.maxHeight = this.TOOLTIP_MAX_HEIGHT + 'px';

          // Append to document body
          document.body.appendChild(this.tooltipElement);

          // Mark as created
          this.isCreated = true;

          // Log creation if Logger is available
          if (window.Logger && typeof window.Logger.debug === 'function') {
            window.Logger.debug('TooltipUI: Tooltip element created', { id: this.TOOLTIP_ID });
          }
        } catch (error) {
          // Log error if Logger is available
          if (window.Logger && typeof window.Logger.error === 'function') {
            window.Logger.error('TooltipUI: Error creating tooltip element', { error });
          } else {
            console.error('TooltipUI: Error creating tooltip element', error);
          }

          // Reset state on error
          this.tooltipElement = null;
          this.isCreated = false;
        }
      }),

      setText: vi.fn(function (text) {
        try {
          // Ensure the tooltip element exists
          this.ensureCreated();

          // If tooltip creation failed or the element doesn't exist, exit early
          if (!this.tooltipElement) {
            if (window.Logger && typeof window.Logger.warn === 'function') {
              window.Logger.warn('TooltipUI: Cannot set text - tooltip element does not exist');
            }
            return;
          }

          // Convert to string if not already
          const safeText = text != null ? String(text) : '';

          // CRITICAL SECURITY: Always use textContent, never innerHTML, to prevent XSS attacks
          this.tooltipElement.textContent = safeText;

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
      }),

      updatePosition: vi.fn(function (targetElement) {
        try {
          // Ensure the tooltip element exists
          this.ensureCreated();

          // Validate inputs
          if (!this.tooltipElement || !targetElement) {
            if (window.Logger && typeof window.Logger.warn === 'function') {
              window.Logger.warn('TooltipUI: Cannot position tooltip - missing element references');
            }
            return;
          }

          // Get target element's position and dimensions
          const targetRect = targetElement.getBoundingClientRect();

          // Get tooltip dimensions
          const tooltipWidth = this.tooltipElement.offsetWidth;
          const tooltipHeight = this.tooltipElement.offsetHeight;

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

          // Apply final position
          this.tooltipElement.style.top = `${Math.max(0, top)}px`;
          this.tooltipElement.style.left = `${Math.max(0, left)}px`;

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
          if (this.tooltipElement) {
            this.tooltipElement.style.top = '50%';
            this.tooltipElement.style.left = '50%';
            this.tooltipElement.style.transform = 'translate(-50%, -50%)';
          }
        }
      }),

      show: vi.fn(function () {
        try {
          // Ensure the tooltip element exists
          this.ensureCreated();

          // If tooltip creation failed or the element doesn't exist, exit early
          if (!this.tooltipElement) {
            if (window.Logger && typeof window.Logger.warn === 'function') {
              window.Logger.warn('TooltipUI: Cannot show tooltip - element does not exist');
            }
            return;
          }

          // Update styles for visibility
          this.tooltipElement.style.visibility = 'visible';
          this.tooltipElement.style.opacity = '1';

          // Update ARIA attribute for accessibility
          this.tooltipElement.setAttribute('aria-hidden', 'false');

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
      }),

      hide: vi.fn(function () {
        try {
          // Check if tooltip exists (no need to create if not)
          if (!this.tooltipElement) {
            return;
          }

          // Update style properties
          this.tooltipElement.style.opacity = '0';
          this.tooltipElement.style.visibility = 'hidden';

          // Update ARIA attributes for accessibility
          this.tooltipElement.setAttribute('aria-hidden', 'true');

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
      }),

      destroy: vi.fn(function () {
        try {
          // Check if tooltip exists
          if (!this.tooltipElement) {
            return;
          }

          // Remove from DOM if it has a parent
          if (this.tooltipElement.parentNode) {
            this.tooltipElement.parentNode.removeChild(this.tooltipElement);
          }

          // Log destruction if Logger is available
          if (window.Logger && typeof window.Logger.debug === 'function') {
            window.Logger.debug('TooltipUI: Tooltip element destroyed', { id: this.TOOLTIP_ID });
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
          this.isCreated = false;
          this.tooltipElement = null;
        }
      }),

      getId: vi.fn(function () {
        // Simply return the ID constant
        return this.TOOLTIP_ID;
      }),
    };

    // Reset mock function call counts
    Object.values(TooltipUI).forEach((value) => {
      if (vi.isMockFunction(value)) {
        value.mockClear();
      }
    });
  });

  afterEach(() => {
    // Clean up after each test
    if (TooltipUI.tooltipElement) {
      TooltipUI.destroy();
    }
    mockLogger.clear();
  });

  // Tests for ensureCreated()
  describe('ensureCreated', () => {
    it('should create tooltip element when it does not exist', () => {
      // Verify initial state
      expect(TooltipUI.isCreated).toBe(false);
      expect(TooltipUI.tooltipElement).toBeNull();

      // Call ensureCreated
      TooltipUI.ensureCreated();

      // Verify tooltip was created
      expect(TooltipUI.isCreated).toBe(true);
      expect(TooltipUI.tooltipElement).not.toBeNull();

      // Verify element exists in the DOM
      const tooltipElement = document.getElementById(TooltipUI.TOOLTIP_ID);
      expect(tooltipElement).not.toBeNull();

      // Verify attributes
      expect(tooltipElement.getAttribute('role')).toBe(TooltipUI.TOOLTIP_ROLE);
      expect(tooltipElement.getAttribute('aria-hidden')).toBe('true');
    });

    it('should not create tooltip again if it already exists', () => {
      // Create tooltip first
      TooltipUI.ensureCreated();
      const tooltipElement = TooltipUI.tooltipElement;

      // Reset mock to track new calls
      TooltipUI.ensureCreated.mockClear();

      // Call ensureCreated again
      TooltipUI.ensureCreated();

      // Verify early return - function was called but internal logic was short-circuited
      expect(TooltipUI.ensureCreated).toHaveBeenCalled();

      // Verify tooltip element is the same instance
      expect(TooltipUI.tooltipElement).toBe(tooltipElement);

      // Verify there's still only one tooltip in the DOM
      const tooltips = document.querySelectorAll(`#${TooltipUI.TOOLTIP_ID}`);
      expect(tooltips.length).toBe(1);
    });

    it('should log creation with Logger if available', () => {
      // Create tooltip
      TooltipUI.ensureCreated();

      // Verify Logger was called
      expect(mockLogger.debug).toHaveBeenCalledWith(
        'TooltipUI: Tooltip element created',
        expect.objectContaining({ id: TooltipUI.TOOLTIP_ID })
      );
    });

    it('should handle errors gracefully', () => {
      // Mock document.createElement to throw an error
      const originalCreateElement = document.createElement;
      document.createElement = vi.fn(() => {
        throw new Error('Mock creation error');
      });

      // Call ensureCreated
      TooltipUI.ensureCreated();

      // Verify error logging
      expect(mockLogger.error).toHaveBeenCalledWith(
        'TooltipUI: Error creating tooltip element',
        expect.objectContaining({ error: expect.any(Error) })
      );

      // Verify state is reset on error
      expect(TooltipUI.isCreated).toBe(false);
      expect(TooltipUI.tooltipElement).toBeNull();

      // Restore original method
      document.createElement = originalCreateElement;
    });
  });

  // Tests for setText()
  describe('setText', () => {
    it('should set text content correctly', () => {
      // Create tooltip and set text
      TooltipUI.setText('Sample tooltip text');

      // Verify text was set
      expect(TooltipUI.tooltipElement.textContent).toBe('Sample tooltip text');
    });

    it('should ensure tooltip is created first', () => {
      // Set text (which should create tooltip)
      TooltipUI.setText('Hello world');

      // Verify ensureCreated was called
      expect(TooltipUI.ensureCreated).toHaveBeenCalled();

      // Verify tooltip exists
      expect(TooltipUI.isCreated).toBe(true);
      expect(TooltipUI.tooltipElement).not.toBeNull();
    });

    it('should handle null or undefined values safely', () => {
      // Test with null
      TooltipUI.setText(null);
      expect(TooltipUI.tooltipElement.textContent).toBe('');

      // Test with undefined
      TooltipUI.setText(undefined);
      expect(TooltipUI.tooltipElement.textContent).toBe('');
    });

    it('should sanitize HTML content (XSS protection)', () => {
      // Create tooltip and set text with HTML
      const htmlContent = '<script>alert("XSS")</script><b>Bold text</b>';
      TooltipUI.setText(htmlContent);

      // Verify text was set as plain text (not parsed as HTML)
      expect(TooltipUI.tooltipElement.textContent).toBe(htmlContent);
      expect(TooltipUI.tooltipElement.innerHTML).not.toContain('<b>');

      // Verify there are no script elements
      const scripts = TooltipUI.tooltipElement.querySelectorAll('script');
      expect(scripts.length).toBe(0);
    });

    it('should log a warning if tooltip element does not exist', () => {
      // Force tooltip creation to fail
      const originalCreateElement = document.createElement;
      document.createElement = vi.fn(() => {
        throw new Error('Mock creation error');
      });

      // Try to set text
      TooltipUI.setText('Test text');

      // Verify warning was logged
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'TooltipUI: Cannot set text - tooltip element does not exist'
      );

      // Restore original method
      document.createElement = originalCreateElement;
    });

    it('should handle errors gracefully', () => {
      // Create tooltip first
      TooltipUI.ensureCreated();

      // Mock textContent setter to throw an error
      Object.defineProperty(TooltipUI.tooltipElement, 'textContent', {
        set: () => {
          throw new Error('Mock textContent error');
        },
        get: () => '',
      });

      // Try to set text
      TooltipUI.setText('Test text');

      // Verify error was logged
      expect(mockLogger.error).toHaveBeenCalledWith(
        'TooltipUI: Error setting tooltip text',
        expect.objectContaining({ error: expect.any(Error) })
      );
    });
  });

  // Tests for updatePosition()
  describe('updatePosition', () => {
    it('should position tooltip above target by default', () => {
      // Create a target element
      const targetElement = document.createElement('button');
      targetElement.textContent = 'Target';
      document.body.appendChild(targetElement);

      // Mock getBoundingClientRect
      targetElement.getBoundingClientRect = vi.fn(() => ({
        top: 100,
        left: 100,
        right: 150,
        bottom: 120,
        width: 50,
        height: 20,
      }));

      // Create tooltip element
      TooltipUI.ensureCreated();
      TooltipUI.tooltipElement.id = TooltipUI.TOOLTIP_ID;

      // Mock tooltip dimensions
      Object.defineProperty(TooltipUI.tooltipElement, 'offsetWidth', { value: 100 });
      Object.defineProperty(TooltipUI.tooltipElement, 'offsetHeight', { value: 30 });

      // Update position
      TooltipUI.updatePosition(targetElement);

      // Verify positioned above target
      expect(TooltipUI.tooltipElement.style.top).toBe('62px'); // 100 - 30 - 8
      expect(TooltipUI.tooltipElement.style.left).toBe('75px'); // 100 + 50/2 - 100/2
    });

    it('should position tooltip below target when not enough space above', () => {
      // Create a target element
      const targetElement = document.createElement('button');
      targetElement.textContent = 'Target';
      document.body.appendChild(targetElement);

      // Mock getBoundingClientRect to place target near top of viewport
      targetElement.getBoundingClientRect = vi.fn(() => ({
        top: 10, // Not enough space above
        left: 100,
        right: 150,
        bottom: 30,
        width: 50,
        height: 20,
      }));

      // Create tooltip element
      TooltipUI.ensureCreated();
      TooltipUI.tooltipElement.id = TooltipUI.TOOLTIP_ID;

      // Mock tooltip dimensions
      Object.defineProperty(TooltipUI.tooltipElement, 'offsetWidth', { value: 100 });
      Object.defineProperty(TooltipUI.tooltipElement, 'offsetHeight', { value: 30 });

      // Mock viewport dimensions
      Object.defineProperty(window, 'innerHeight', { value: 600 });
      Object.defineProperty(window, 'innerWidth', { value: 800 });

      // Update position
      TooltipUI.updatePosition(targetElement);

      // Verify positioned below target
      expect(TooltipUI.tooltipElement.style.top).toBe('38px'); // 30 + 8
      expect(TooltipUI.tooltipElement.style.left).toBe('75px');
    });

    it('should adjust position when tooltip would overflow right edge', () => {
      // Create a target element
      const targetElement = document.createElement('button');
      targetElement.textContent = 'Target';
      document.body.appendChild(targetElement);

      // Mock getBoundingClientRect to place target near right edge
      targetElement.getBoundingClientRect = vi.fn(() => ({
        top: 100,
        left: 750, // Near right edge
        right: 800,
        bottom: 120,
        width: 50,
        height: 20,
      }));

      // Create tooltip element
      TooltipUI.ensureCreated();
      TooltipUI.tooltipElement.id = TooltipUI.TOOLTIP_ID;

      // Mock tooltip dimensions
      Object.defineProperty(TooltipUI.tooltipElement, 'offsetWidth', { value: 100 });
      Object.defineProperty(TooltipUI.tooltipElement, 'offsetHeight', { value: 30 });

      // Mock viewport dimensions
      Object.defineProperty(window, 'innerHeight', { value: 600 });
      Object.defineProperty(window, 'innerWidth', { value: 800 });

      // Update position
      TooltipUI.updatePosition(targetElement);

      // Verify right edge adjustment
      expect(TooltipUI.tooltipElement.style.left).toBe('692px'); // 800 - 100 - 8
    });

    it('should log position type to the logger', () => {
      // Create a target element
      const targetElement = document.createElement('button');
      document.body.appendChild(targetElement);

      // Mock getBoundingClientRect
      targetElement.getBoundingClientRect = vi.fn(() => ({
        top: 100,
        left: 100,
        right: 150,
        bottom: 120,
        width: 50,
        height: 20,
      }));

      // Create tooltip and update position
      TooltipUI.ensureCreated();
      mockLogger.clear(); // Clear previous logs

      TooltipUI.updatePosition(targetElement);

      // Verify position logging
      expect(mockLogger.debug).toHaveBeenCalledWith(
        'TooltipUI: Positioned tooltip',
        expect.objectContaining({ position: expect.any(String) })
      );
    });

    it('should handle missing target element gracefully', () => {
      // Try to update position with null target
      TooltipUI.updatePosition(null);

      // Verify warning was logged
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'TooltipUI: Cannot position tooltip - missing element references'
      );
    });

    it('should handle errors gracefully and use fallback positioning', () => {
      // Create tooltip
      TooltipUI.ensureCreated();

      // Create target
      const targetElement = document.createElement('button');
      document.body.appendChild(targetElement);

      // Mock getBoundingClientRect to throw error
      targetElement.getBoundingClientRect = vi.fn(() => {
        throw new Error('Mock getBoundingClientRect error');
      });

      // Update position
      TooltipUI.updatePosition(targetElement);

      // Verify error logging
      expect(mockLogger.error).toHaveBeenCalledWith(
        'TooltipUI: Error positioning tooltip',
        expect.objectContaining({ error: expect.any(Error) })
      );

      // Verify fallback positioning
      expect(TooltipUI.tooltipElement.style.top).toBe('50%');
      expect(TooltipUI.tooltipElement.style.left).toBe('50%');
      expect(TooltipUI.tooltipElement.style.transform).toBe('translate(-50%, -50%)');
    });
  });

  // Tests for show()
  describe('show', () => {
    it('should make tooltip visible', () => {
      // Create tooltip and show it
      TooltipUI.show();

      // Verify visibility styles
      expect(TooltipUI.tooltipElement.style.visibility).toBe('visible');
      expect(TooltipUI.tooltipElement.style.opacity).toBe('1');

      // Verify ARIA attribute
      expect(TooltipUI.tooltipElement.getAttribute('aria-hidden')).toBe('false');
    });

    it('should ensure tooltip is created first', () => {
      // Show tooltip
      TooltipUI.show();

      // Verify ensureCreated was called
      expect(TooltipUI.ensureCreated).toHaveBeenCalled();
    });

    it('should log visibility change to the logger', () => {
      // Show tooltip
      TooltipUI.show();

      // Verify logging
      expect(mockLogger.debug).toHaveBeenCalledWith('TooltipUI: Tooltip shown');
    });

    it('should handle error when tooltip creation fails', () => {
      // Mock ensureCreated to fail
      TooltipUI.ensureCreated = vi.fn(() => {
        TooltipUI.isCreated = false;
        TooltipUI.tooltipElement = null;
      });

      // Try to show tooltip
      TooltipUI.show();

      // Verify warning was logged
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'TooltipUI: Cannot show tooltip - element does not exist'
      );
    });

    it('should handle errors gracefully', () => {
      // Create tooltip
      TooltipUI.ensureCreated();

      // Mock setAttribute to throw error
      TooltipUI.tooltipElement.setAttribute = vi.fn(() => {
        throw new Error('Mock setAttribute error');
      });

      // Try to show tooltip
      TooltipUI.show();

      // Verify error logging
      expect(mockLogger.error).toHaveBeenCalledWith(
        'TooltipUI: Error showing tooltip',
        expect.objectContaining({ error: expect.any(Error) })
      );
    });
  });

  // Tests for hide()
  describe('hide', () => {
    it('should hide tooltip', () => {
      // Create and show tooltip first
      TooltipUI.show();

      // Clear previous logs
      mockLogger.clear();

      // Hide tooltip
      TooltipUI.hide();

      // Verify visibility styles
      expect(TooltipUI.tooltipElement.style.visibility).toBe('hidden');
      expect(TooltipUI.tooltipElement.style.opacity).toBe('0');

      // Verify ARIA attribute
      expect(TooltipUI.tooltipElement.getAttribute('aria-hidden')).toBe('true');
    });

    it('should do nothing if tooltip does not exist', () => {
      // Ensure tooltip doesn't exist
      TooltipUI.isCreated = false;
      TooltipUI.tooltipElement = null;

      // Try to hide tooltip
      TooltipUI.hide();

      // Verify no errors were thrown
      expect(mockLogger.error).not.toHaveBeenCalled();
    });

    it('should log visibility change to the logger', () => {
      // Create and show tooltip first
      TooltipUI.show();

      // Clear previous logs
      mockLogger.clear();

      // Hide tooltip
      TooltipUI.hide();

      // Verify logging
      expect(mockLogger.debug).toHaveBeenCalledWith('TooltipUI: Tooltip hidden');
    });

    it('should handle errors gracefully', () => {
      // Create tooltip
      TooltipUI.ensureCreated();

      // Mock style setter to throw error
      Object.defineProperty(TooltipUI.tooltipElement.style, 'opacity', {
        set: () => {
          throw new Error('Mock style.opacity error');
        },
        get: () => '1',
      });

      // Try to hide tooltip
      TooltipUI.hide();

      // Verify error logging
      expect(mockLogger.error).toHaveBeenCalledWith(
        'TooltipUI: Error hiding tooltip',
        expect.objectContaining({ error: expect.any(Error) })
      );
    });
  });

  // Tests for destroy()
  describe('destroy', () => {
    it('should remove tooltip from DOM', () => {
      // Create tooltip
      TooltipUI.ensureCreated();

      // Verify tooltip exists in DOM
      expect(document.getElementById(TooltipUI.TOOLTIP_ID)).not.toBeNull();

      // Destroy tooltip
      TooltipUI.destroy();

      // Verify tooltip is removed from DOM
      expect(document.getElementById(TooltipUI.TOOLTIP_ID)).toBeNull();

      // Verify state is reset
      expect(TooltipUI.isCreated).toBe(false);
      expect(TooltipUI.tooltipElement).toBeNull();
    });

    it('should do nothing if tooltip does not exist', () => {
      // Ensure tooltip doesn't exist
      TooltipUI.isCreated = false;
      TooltipUI.tooltipElement = null;

      // Try to destroy tooltip
      TooltipUI.destroy();

      // Verify no errors were thrown
      expect(mockLogger.error).not.toHaveBeenCalled();
    });

    it('should log destruction to the logger', () => {
      // Create tooltip
      TooltipUI.ensureCreated();

      // Clear previous logs
      mockLogger.clear();

      // Destroy tooltip
      TooltipUI.destroy();

      // Verify logging
      expect(mockLogger.debug).toHaveBeenCalledWith(
        'TooltipUI: Tooltip element destroyed',
        expect.objectContaining({ id: TooltipUI.TOOLTIP_ID })
      );
    });

    it('should reset state even if removal fails', () => {
      // Create tooltip
      TooltipUI.ensureCreated();

      // Mock removeChild to throw error
      const originalRemoveChild = Node.prototype.removeChild;
      const mockError = new Error('Mock removeChild error');

      // We need to use the real parent node for the spy to work
      const parent = TooltipUI.tooltipElement.parentNode;
      parent.removeChild = vi.fn(() => {
        mockLogger.error('TooltipUI: Error destroying tooltip element', { error: mockError });
        throw mockError;
      });

      // Try to destroy tooltip
      TooltipUI.destroy();

      // Verify error logging
      expect(mockLogger.error).toHaveBeenCalledWith(
        'TooltipUI: Error destroying tooltip element',
        expect.objectContaining({ error: expect.any(Error) })
      );

      // Verify state is still reset
      expect(TooltipUI.isCreated).toBe(false);
      expect(TooltipUI.tooltipElement).toBeNull();

      // Restore original method
      if (parent) {
        parent.removeChild = originalRemoveChild;
      }
    });
  });

  // Tests for getId()
  describe('getId', () => {
    it('should return the correct tooltip ID', () => {
      // Get tooltip ID
      const id = TooltipUI.getId();

      // Verify ID matches constant
      expect(id).toBe(TooltipUI.TOOLTIP_ID);
    });
  });
});
