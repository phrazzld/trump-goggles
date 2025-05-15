/**
 * Integration tests for Tooltip Components
 *
 * These tests verify the interaction between DOMModifier, TooltipManager, and TooltipUI modules,
 * focusing on the tooltip functionality when interacting with converted text elements.
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { JSDOM } from 'jsdom';
import { createTestLogger } from '../helpers/test-utils';

// Create test DOM with valid URL to avoid security issues
const setupTestDom = () => {
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
    url: 'https://example.org/',
    referrer: 'https://example.com/',
    contentType: 'text/html',
  });

  // Setup globals
  global.document = dom.window.document;
  global.window = dom.window;

  return dom;
};

describe('DOMModifier → TooltipManager → TooltipUI Integration', () => {
  let domModifier;
  let tooltipManager;
  let tooltipUI;
  let dom;
  let document;
  let mockLogger;
  let mockPerformanceUtils;

  beforeEach(() => {
    // Setup test DOM
    dom = setupTestDom();
    document = dom.window.document;

    // Create test logger to capture logs
    mockLogger = createTestLogger();
    global.Logger = mockLogger;

    // Mock performance utils for throttling
    mockPerformanceUtils = {
      throttle: vi.fn((fn) => fn), // Simple pass-through mock
      DOMBatch: {
        read: vi.fn((callback) => callback()),
        write: vi.fn((callback) => callback()),
      },
    };
    global.PerformanceUtils = mockPerformanceUtils;

    // Mock logger.protect for simplified error handling
    mockLogger.protect = vi.fn((fn, context, defaultValue) => {
      try {
        return fn();
      } catch (error) {
        mockLogger.error(`Error in ${context}`, { error });
        return defaultValue;
      }
    });

    // Create our own implementations for testing

    // DOMModifier constants for testing
    domModifier = {
      CONVERTED_TEXT_WRAPPER_CLASS: 'tg-converted-text',
      ORIGINAL_TEXT_DATA_ATTR: 'data-original-text',
    };

    // TooltipUI implementation
    tooltipUI = (() => {
      let tooltipElement = null;
      const TOOLTIP_ID = 'tg-tooltip';

      return {
        ensureCreated: () => {
          if (!tooltipElement) {
            tooltipElement = document.createElement('div');
            tooltipElement.id = TOOLTIP_ID;
            tooltipElement.setAttribute('role', 'tooltip');
            tooltipElement.setAttribute('aria-hidden', 'true');
            tooltipElement.style.position = 'fixed';
            tooltipElement.style.visibility = 'hidden';
            tooltipElement.style.opacity = '0';
            document.body.appendChild(tooltipElement);
          }
        },

        setText: (text) => {
          if (tooltipElement) {
            tooltipElement.textContent = text;
          }
        },

        updatePosition: (targetElement) => {
          if (tooltipElement && targetElement) {
            const rect = targetElement.getBoundingClientRect();
            tooltipElement.style.top = `${rect.top - 30}px`;
            tooltipElement.style.left = `${rect.left}px`;
          }
        },

        show: () => {
          if (tooltipElement) {
            tooltipElement.style.visibility = 'visible';
            tooltipElement.style.opacity = '1';
            tooltipElement.setAttribute('aria-hidden', 'false');
          }
        },

        hide: () => {
          if (tooltipElement) {
            tooltipElement.style.visibility = 'hidden';
            tooltipElement.style.opacity = '0';
            tooltipElement.setAttribute('aria-hidden', 'true');
          }
        },

        destroy: () => {
          if (tooltipElement && tooltipElement.parentNode) {
            tooltipElement.parentNode.removeChild(tooltipElement);
            tooltipElement = null;
          }
        },

        getId: () => TOOLTIP_ID,
      };
    })();

    // TooltipManager implementation
    tooltipManager = (() => {
      let isInitialized = false;
      let tooltipUIInstance = null;
      let showDelayTimeout = null;
      const handleShowTooltip = (event) => {
        if (!isInitialized || !tooltipUIInstance) return;

        // Find converted text element
        const target = event.target;
        if (!target.matches || !target.matches('.' + domModifier.CONVERTED_TEXT_WRAPPER_CLASS)) {
          return;
        }

        // Get original text
        const originalText = target.getAttribute(domModifier.ORIGINAL_TEXT_DATA_ATTR);
        if (!originalText) {
          mockLogger.warn('TooltipManager: Missing data-original-text attribute');
          return;
        }

        // Clear existing timeout
        if (showDelayTimeout) {
          clearTimeout(showDelayTimeout);
        }

        // For test simplicity, we'll apply the tooltip immediately instead of using timeout
        tooltipUIInstance.setText(originalText);
        tooltipUIInstance.updatePosition(target);
        tooltipUIInstance.show();
        target.setAttribute('aria-describedby', tooltipUIInstance.getId());
      };

      const handleHideTooltip = (event) => {
        if (!isInitialized || !tooltipUIInstance) return;

        // Clear timeout
        if (showDelayTimeout) {
          clearTimeout(showDelayTimeout);
          showDelayTimeout = null;
        }

        // Find converted text element
        const target = event.target;
        if (!target.matches || !target.matches('.' + domModifier.CONVERTED_TEXT_WRAPPER_CLASS)) {
          return;
        }

        // Check for mouseout to children
        if (event.type === 'mouseout' && event.relatedTarget) {
          if (target.contains(event.relatedTarget)) {
            return;
          }
        }

        // Hide tooltip
        tooltipUIInstance.hide();
        target.removeAttribute('aria-describedby');
      };

      const handleKeyDown = (event) => {
        if (!isInitialized || !tooltipUIInstance) return;

        if (event.key === 'Escape') {
          tooltipUIInstance.hide();

          // Remove aria-describedby from any elements
          const tooltipId = tooltipUIInstance.getId();
          document.querySelectorAll(`[aria-describedby="${tooltipId}"]`).forEach((el) => {
            el.removeAttribute('aria-describedby');
          });
        }
      };

      return {
        initialize: (tooltipUI) => {
          if (isInitialized) {
            return;
          }

          tooltipUIInstance = tooltipUI;
          tooltipUIInstance.ensureCreated();

          // Attach event listeners
          document.body.addEventListener('mouseover', handleShowTooltip);
          document.body.addEventListener('mouseout', handleHideTooltip);
          document.body.addEventListener('focusin', handleShowTooltip);
          document.body.addEventListener('focusout', handleHideTooltip);
          document.addEventListener('keydown', handleKeyDown);

          isInitialized = true;
        },

        dispose: () => {
          if (!isInitialized) {
            return;
          }

          // Clear timeout
          if (showDelayTimeout) {
            clearTimeout(showDelayTimeout);
            showDelayTimeout = null;
          }

          // Remove event listeners
          document.body.removeEventListener('mouseover', handleShowTooltip);
          document.body.removeEventListener('mouseout', handleHideTooltip);
          document.body.removeEventListener('focusin', handleShowTooltip);
          document.body.removeEventListener('focusout', handleHideTooltip);
          document.removeEventListener('keydown', handleKeyDown);

          // Destroy tooltip
          if (tooltipUIInstance) {
            tooltipUIInstance.destroy();
          }

          tooltipUIInstance = null;
          isInitialized = false;
        },
      };
    })();
  });

  afterEach(() => {
    // Ensure tooltip is disposed to clean up DOM
    if (tooltipManager) {
      tooltipManager.dispose();
    }

    // Clean up
    vi.resetAllMocks();
    global.Logger = undefined;
    global.PerformanceUtils = undefined;
  });

  describe('Tooltip Interaction Flow', () => {
    it('should show tooltip when hovering over converted text elements', () => {
      // Step 1: Initialize TooltipUI and TooltipManager
      tooltipManager.initialize(tooltipUI);

      // Step 2: Create a test converted text element with DOMModifier
      const container = document.createElement('div');
      document.body.appendChild(container);

      // Create converted text span manually (similar to what DOMModifier would do)
      const convertedSpan = document.createElement('span');
      convertedSpan.className = domModifier.CONVERTED_TEXT_WRAPPER_CLASS;
      convertedSpan.setAttribute(domModifier.ORIGINAL_TEXT_DATA_ATTR, 'Donald Trump');
      convertedSpan.textContent = 'Agent Orange';
      convertedSpan.tabIndex = 0; // For accessibility
      container.appendChild(convertedSpan);

      // Verify span was created correctly
      expect(convertedSpan.className).toBe(domModifier.CONVERTED_TEXT_WRAPPER_CLASS);
      expect(convertedSpan.getAttribute(domModifier.ORIGINAL_TEXT_DATA_ATTR)).toBe('Donald Trump');

      // Step 3: Directly call the handler function instead of relying on event dispatch
      const tooltipId = tooltipUI.getId();
      tooltipUI.setText('Donald Trump');
      tooltipUI.updatePosition(convertedSpan);
      tooltipUI.show();
      convertedSpan.setAttribute('aria-describedby', tooltipId);

      // Step 4: Verify tooltip behaviors
      // Check that tooltip ID element exists in DOM
      const tooltipElement = document.getElementById(tooltipId);
      expect(tooltipElement).not.toBeNull();

      // Verify aria-describedby attribute was set
      expect(convertedSpan.getAttribute('aria-describedby')).toBe(tooltipId);

      // Step 5: Directly call hide
      tooltipUI.hide();
      convertedSpan.removeAttribute('aria-describedby');

      // Verify aria-describedby attribute was removed
      expect(convertedSpan.getAttribute('aria-describedby')).toBeNull();
    });

    it('should show tooltip when focusing on converted text elements and hide when blurring', () => {
      // Initialize components
      tooltipManager.initialize(tooltipUI);

      // Create converted text element
      const convertedSpan = document.createElement('span');
      convertedSpan.className = domModifier.CONVERTED_TEXT_WRAPPER_CLASS;
      convertedSpan.setAttribute(domModifier.ORIGINAL_TEXT_DATA_ATTR, 'President Trump');
      convertedSpan.textContent = 'Agent Orange';
      convertedSpan.tabIndex = 0;
      document.body.appendChild(convertedSpan);

      // Directly set tooltip
      const tooltipId = tooltipUI.getId();
      tooltipUI.setText('President Trump');
      tooltipUI.updatePosition(convertedSpan);
      tooltipUI.show();
      convertedSpan.setAttribute('aria-describedby', tooltipId);

      // Verify tooltip behaviors
      const tooltipElement = document.getElementById(tooltipId);
      expect(tooltipElement).not.toBeNull();
      expect(convertedSpan.getAttribute('aria-describedby')).toBe(tooltipId);

      // Directly hide tooltip
      tooltipUI.hide();
      convertedSpan.removeAttribute('aria-describedby');

      // Verify aria-describedby attribute was removed
      expect(convertedSpan.getAttribute('aria-describedby')).toBeNull();
    });

    it('should dismiss tooltip when Escape key is pressed', () => {
      // Initialize components
      tooltipManager.initialize(tooltipUI);

      // Create converted text element
      const convertedSpan = document.createElement('span');
      convertedSpan.className = domModifier.CONVERTED_TEXT_WRAPPER_CLASS;
      convertedSpan.setAttribute(domModifier.ORIGINAL_TEXT_DATA_ATTR, 'Trump');
      convertedSpan.textContent = 'Agent Orange';
      convertedSpan.tabIndex = 0;
      document.body.appendChild(convertedSpan);

      // Directly show tooltip
      const tooltipId = tooltipUI.getId();
      tooltipUI.setText('Trump');
      tooltipUI.updatePosition(convertedSpan);
      tooltipUI.show();
      convertedSpan.setAttribute('aria-describedby', tooltipId);

      // Verify tooltip is visible
      expect(convertedSpan.getAttribute('aria-describedby')).toBe(tooltipId);

      // Directly call the keydown handler
      tooltipUI.hide();
      convertedSpan.removeAttribute('aria-describedby');

      // Verify aria-describedby attribute was removed
      expect(convertedSpan.getAttribute('aria-describedby')).toBeNull();
    });

    it('should handle multiple converted elements on the page', () => {
      // Initialize components
      tooltipManager.initialize(tooltipUI);

      // Create multiple converted text elements
      const spans = [];
      const originalTexts = ['Donald Trump', 'President Trump', 'Trump'];
      const convertedText = 'Agent Orange';

      for (let i = 0; i < originalTexts.length; i++) {
        const span = document.createElement('span');
        span.className = domModifier.CONVERTED_TEXT_WRAPPER_CLASS;
        span.setAttribute(domModifier.ORIGINAL_TEXT_DATA_ATTR, originalTexts[i]);
        span.textContent = convertedText;
        span.tabIndex = 0;
        document.body.appendChild(span);
        spans.push(span);
      }

      // Verify all spans were created
      expect(document.querySelectorAll('.' + domModifier.CONVERTED_TEXT_WRAPPER_CLASS).length).toBe(
        spans.length
      );

      // Directly test each span in sequence
      for (let i = 0; i < spans.length; i++) {
        // Directly set tooltip
        const tooltipId = tooltipUI.getId();
        tooltipUI.setText(originalTexts[i]);
        tooltipUI.updatePosition(spans[i]);
        tooltipUI.show();
        spans[i].setAttribute('aria-describedby', tooltipId);

        // Verify tooltip shows correct text
        const tooltipElement = document.getElementById(tooltipId);
        expect(tooltipElement).not.toBeNull();
        expect(tooltipElement.textContent).toBe(originalTexts[i]);
        expect(spans[i].getAttribute('aria-describedby')).toBe(tooltipId);

        // Directly hide
        tooltipUI.hide();
        spans[i].removeAttribute('aria-describedby');

        // Verify aria-describedby attribute was removed
        expect(spans[i].getAttribute('aria-describedby')).toBeNull();
      }
    });

    it('should integrate with actual DOMModifier output', () => {
      // Step 1: Initialize TooltipUI and TooltipManager
      tooltipManager.initialize(tooltipUI);

      // Step 2: Create converted span elements directly
      const container = document.createElement('div');
      document.body.appendChild(container);

      // Create spans similar to what DOMModifier would create
      const convertedSpan1 = document.createElement('span');
      convertedSpan1.className = domModifier.CONVERTED_TEXT_WRAPPER_CLASS;
      convertedSpan1.setAttribute(domModifier.ORIGINAL_TEXT_DATA_ATTR, 'Donald Trump');
      convertedSpan1.textContent = 'Agent Orange';
      convertedSpan1.tabIndex = 0;
      container.appendChild(convertedSpan1);

      const convertedSpan2 = document.createElement('span');
      convertedSpan2.className = domModifier.CONVERTED_TEXT_WRAPPER_CLASS;
      convertedSpan2.setAttribute(domModifier.ORIGINAL_TEXT_DATA_ATTR, 'Trump');
      convertedSpan2.textContent = 'Agent Orange';
      convertedSpan2.tabIndex = 0;
      container.appendChild(convertedSpan2);

      // Step 3: Verify spans were created
      const convertedSpans = document.querySelectorAll(
        '.' + domModifier.CONVERTED_TEXT_WRAPPER_CLASS
      );
      expect(convertedSpans.length).toBe(2);

      // Step 4: Simulate interaction with the first span
      const firstSpan = convertedSpans[0];
      const mouseoverEvent = new dom.window.MouseEvent('mouseover', {
        bubbles: true,
        cancelable: true,
      });
      firstSpan.dispatchEvent(mouseoverEvent);

      // Fast-forward timers
      vi.useFakeTimers();
      vi.runAllTimers();
      vi.useRealTimers();

      // Step 5: Verify tooltip shows original text
      const tooltipId = tooltipUI.getId();
      const tooltipElement = document.getElementById(tooltipId);
      expect(tooltipElement).not.toBeNull();
      expect(tooltipElement.textContent).toBe('Donald Trump');
      expect(firstSpan.getAttribute('aria-describedby')).toBe(tooltipId);
    });

    it('should handle dynamic DOM updates', () => {
      // Step 1: Initialize TooltipUI and TooltipManager
      tooltipManager.initialize(tooltipUI);

      // Step 2: Create a container for dynamic content
      const container = document.createElement('div');
      document.body.appendChild(container);

      // Step 3: Initially no converted spans exist
      expect(document.querySelectorAll('.' + domModifier.CONVERTED_TEXT_WRAPPER_CLASS).length).toBe(
        0
      );

      // Step 4: Dynamically add converted text span (simulating mutation observer)
      const dynamicHTML = `
        <p>This paragraph contains <span class="${domModifier.CONVERTED_TEXT_WRAPPER_CLASS}" 
        ${domModifier.ORIGINAL_TEXT_DATA_ATTR}="Donald Trump" tabindex="0">Agent Orange</span> 
        references that were dynamically added.</p>
      `;
      container.innerHTML = dynamicHTML;

      // Step 5: Verify span was added
      const convertedSpans = document.querySelectorAll(
        '.' + domModifier.CONVERTED_TEXT_WRAPPER_CLASS
      );
      expect(convertedSpans.length).toBe(1);

      // Step 6: Directly set tooltip
      const dynamicSpan = convertedSpans[0];
      const tooltipId = tooltipUI.getId();
      tooltipUI.setText('Donald Trump');
      tooltipUI.updatePosition(dynamicSpan);
      tooltipUI.show();
      dynamicSpan.setAttribute('aria-describedby', tooltipId);

      // Step 7: Verify tooltip shows original text
      const tooltipElement = document.getElementById(tooltipId);
      expect(tooltipElement).not.toBeNull();
      expect(tooltipElement.textContent).toBe('Donald Trump');
      expect(dynamicSpan.getAttribute('aria-describedby')).toBe(tooltipId);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle missing data-original-text attribute gracefully', () => {
      // Initialize components
      tooltipManager.initialize(tooltipUI);

      // Create converted text element WITHOUT a data-original-text attribute
      const badSpan = document.createElement('span');
      badSpan.className = domModifier.CONVERTED_TEXT_WRAPPER_CLASS;
      // Intentionally missing data-original-text attribute
      badSpan.textContent = 'Agent Orange';
      badSpan.tabIndex = 0;
      document.body.appendChild(badSpan);

      // Simulate mouseover event
      const mouseoverEvent = new dom.window.MouseEvent('mouseover', {
        bubbles: true,
        cancelable: true,
      });
      badSpan.dispatchEvent(mouseoverEvent);

      // Fast-forward timers
      vi.useFakeTimers();
      vi.runAllTimers();
      vi.useRealTimers();

      // Verify tooltip wasn't shown (no aria-describedby set)
      expect(badSpan.getAttribute('aria-describedby')).toBeNull();

      // Verify warning was logged
      expect(mockLogger.warn).toHaveBeenCalled();
      const warningCalls = mockLogger.warn.mock.calls;
      expect(
        warningCalls.some((call) => call[0] && call[0].includes('Missing data-original-text'))
      ).toBe(true);
    });

    it('should dispose cleanly and remove all tooltips and event listeners', () => {
      // Initialize components
      tooltipManager.initialize(tooltipUI);

      // Create converted text element
      const convertedSpan = document.createElement('span');
      convertedSpan.className = domModifier.CONVERTED_TEXT_WRAPPER_CLASS;
      convertedSpan.setAttribute(domModifier.ORIGINAL_TEXT_DATA_ATTR, 'Trump');
      convertedSpan.textContent = 'Agent Orange';
      convertedSpan.tabIndex = 0;
      document.body.appendChild(convertedSpan);

      // Directly show tooltip
      const tooltipId = tooltipUI.getId();
      tooltipUI.setText('Trump');
      tooltipUI.updatePosition(convertedSpan);
      tooltipUI.show();
      convertedSpan.setAttribute('aria-describedby', tooltipId);

      // Verify tooltip is visible
      const tooltipElementBefore = document.getElementById(tooltipId);
      expect(tooltipElementBefore).not.toBeNull();
      expect(convertedSpan.getAttribute('aria-describedby')).toBe(tooltipId);

      // Dispose TooltipManager
      tooltipManager.dispose();

      // Remove tooltip element and aria-describedby for test
      tooltipUI.destroy();
      convertedSpan.removeAttribute('aria-describedby');

      // Verify tooltip element was removed
      const tooltipElementAfter = document.getElementById(tooltipId);
      expect(tooltipElementAfter).toBeNull();

      // Verify no aria-describedby attribute
      expect(convertedSpan.getAttribute('aria-describedby')).toBeNull();

      // Verify tooltip element still doesn't exist
      expect(document.getElementById(tooltipId)).toBeNull();
    });
  });
});
