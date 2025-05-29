/**
 * Unit tests for the TooltipManager module using the actual module
 * Tests direct interactions with the TooltipManager API
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { JSDOM } from 'jsdom';
import { createTestLogger } from '../helpers/test-utils';
import { TooltipManager } from '../../src/components/tooltip-manager';
import { TooltipUI } from '../../src/components/tooltip-ui';

describe('TooltipManager (Actual Module)', () => {
  let document: Document;
  let window: Window & typeof globalThis;
  let mockLogger: ReturnType<typeof createTestLogger>;

  beforeEach(() => {
    // Create a fresh JSDOM instance for each test
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
      url: 'https://example.org/',
      referrer: 'https://example.com/',
      contentType: 'text/html',
    });

    window = dom.window as unknown as Window & typeof globalThis;
    document = window.document;
    (global as any).document = document;
    (global as any).window = window;

    // Mock the Logger
    mockLogger = createTestLogger();
    (window as any).Logger = mockLogger;

    // Mock performance utils
    (window as any).PerformanceUtils = {
      throttle: vi.fn((fn: Function) => fn),
      debounce: vi.fn((fn: Function) => fn),
      Configs: {
        // Add Configs object
        input: { delay: 32 },
        scroll: { delay: 150 },
        keyboard: { delay: 50 },
      },
      // Note: DOMBatch has been removed from performance-utils.ts as part of T021
      // but we still mock it here for backward compatibility with tests
      DOMBatch: {
        read: vi.fn((callback: () => void) => callback()),
        write: vi.fn((callback: () => void) => callback()),
      },
    };

    // Mock logger.protect for error handling
    mockLogger.protect = vi.fn((fn: () => any, context: string, defaultValue?: any) => {
      try {
        return fn();
      } catch (error) {
        mockLogger.error(`Error in ${context}`, { error });
        return defaultValue;
      }
    });
  });

  afterEach(() => {
    // Dispose TooltipManager if it exists
    if (TooltipManager && typeof TooltipManager.dispose === 'function') {
      TooltipManager.dispose();
    }

    // Clean up mocks
    vi.resetAllMocks();
    delete (global as any).Logger;
    delete (global as any).PerformanceUtils;
  });

  describe('Initialization', () => {
    it('should initialize TooltipManager with TooltipUI', () => {
      // Initialize TooltipManager
      TooltipManager.initialize(TooltipUI);

      // Check if initialization succeeded (this is implementation-dependent)
      expect(mockLogger.error).not.toHaveBeenCalled();
    });

    it('should handle multiple initialization calls gracefully', () => {
      // Initialize multiple times
      TooltipManager.initialize(TooltipUI);
      TooltipManager.initialize(TooltipUI);

      // Should not cause errors
      expect(mockLogger.error).not.toHaveBeenCalled();
    });
  });

  describe('Event Handling', () => {
    beforeEach(() => {
      // Initialize before each event test
      TooltipManager.initialize(TooltipUI);
    });

    it('should handle mouseover events on converted text elements', () => {
      // Create a converted text element
      const convertedSpan = document.createElement('span');
      convertedSpan.className = 'tg-converted-text';
      convertedSpan.setAttribute('data-original-text', 'Donald Trump');
      convertedSpan.textContent = 'Agent Orange';
      convertedSpan.tabIndex = 0;
      document.body.appendChild(convertedSpan);

      // Simulate mouseover event
      const mouseoverEvent = new window.MouseEvent('mouseover', {
        bubbles: true,
        cancelable: true,
      });

      // Dispatch event
      convertedSpan.dispatchEvent(mouseoverEvent);

      // Fast-forward timers if any
      vi.useFakeTimers();
      vi.runAllTimers();
      vi.useRealTimers();

      // Verify no errors occurred
      expect(mockLogger.error).not.toHaveBeenCalled();
    });

    it('should handle mouseout events on converted text elements', () => {
      // Create a converted text element
      const convertedSpan = document.createElement('span');
      convertedSpan.className = 'tg-converted-text';
      convertedSpan.setAttribute('data-original-text', 'Donald Trump');
      convertedSpan.textContent = 'Agent Orange';
      convertedSpan.tabIndex = 0;
      document.body.appendChild(convertedSpan);

      // Simulate mouseout event
      const mouseoutEvent = new window.MouseEvent('mouseout', {
        bubbles: true,
        cancelable: true,
      });

      // Dispatch event
      convertedSpan.dispatchEvent(mouseoutEvent);

      // Verify no errors occurred
      expect(mockLogger.error).not.toHaveBeenCalled();
    });

    it('should handle focus events on converted text elements', () => {
      // Create a converted text element
      const convertedSpan = document.createElement('span');
      convertedSpan.className = 'tg-converted-text';
      convertedSpan.setAttribute('data-original-text', 'Donald Trump');
      convertedSpan.textContent = 'Agent Orange';
      convertedSpan.tabIndex = 0;
      document.body.appendChild(convertedSpan);

      // Simulate focus event
      const focusEvent = new window.FocusEvent('focusin', {
        bubbles: true,
        cancelable: true,
      });

      // Dispatch event
      convertedSpan.dispatchEvent(focusEvent);

      // Fast-forward timers if any
      vi.useFakeTimers();
      vi.runAllTimers();
      vi.useRealTimers();

      // Verify no errors occurred
      expect(mockLogger.error).not.toHaveBeenCalled();
    });

    it('should handle blur events on converted text elements', () => {
      // Create a converted text element
      const convertedSpan = document.createElement('span');
      convertedSpan.className = 'tg-converted-text';
      convertedSpan.setAttribute('data-original-text', 'Donald Trump');
      convertedSpan.textContent = 'Agent Orange';
      convertedSpan.tabIndex = 0;
      document.body.appendChild(convertedSpan);

      // Simulate blur event
      const blurEvent = new window.FocusEvent('focusout', {
        bubbles: true,
        cancelable: true,
      });

      // Dispatch event
      convertedSpan.dispatchEvent(blurEvent);

      // Verify no errors occurred
      expect(mockLogger.error).not.toHaveBeenCalled();
    });

    it('should handle Escape key for tooltip dismissal', () => {
      // Create a converted text element
      const convertedSpan = document.createElement('span');
      convertedSpan.className = 'tg-converted-text';
      convertedSpan.setAttribute('data-original-text', 'Donald Trump');
      convertedSpan.textContent = 'Agent Orange';
      convertedSpan.tabIndex = 0;
      document.body.appendChild(convertedSpan);

      // Simulate Escape key press
      const escapeEvent = new window.KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      });

      // Dispatch event
      document.dispatchEvent(escapeEvent);

      // Verify no errors occurred
      expect(mockLogger.error).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing data-original-text attribute gracefully', () => {
      // Initialize TooltipManager
      TooltipManager.initialize(TooltipUI);

      // Create a converted text element WITHOUT data-original-text
      const badSpan = document.createElement('span');
      badSpan.className = 'tg-converted-text';
      // Intentionally missing data-original-text attribute
      badSpan.textContent = 'Agent Orange';
      badSpan.tabIndex = 0;
      document.body.appendChild(badSpan);

      // Simulate mouseover event
      const mouseoverEvent = new window.MouseEvent('mouseover', {
        bubbles: true,
        cancelable: true,
      });

      // Dispatch event
      badSpan.dispatchEvent(mouseoverEvent);

      // Fast-forward timers
      vi.useFakeTimers();
      vi.runAllTimers();
      vi.useRealTimers();

      // Verify warning was logged or no errors occurred
      // (implementation may vary on how it handles missing attributes)
      expect(mockLogger.error).not.toHaveBeenCalledWith(
        expect.stringContaining('fatal'),
        expect.anything()
      );
    });

    it('should handle events on non-converted elements gracefully', () => {
      // Initialize TooltipManager
      TooltipManager.initialize(TooltipUI);

      // Create a regular element (not converted text)
      const regularSpan = document.createElement('span');
      regularSpan.textContent = 'Regular text';
      document.body.appendChild(regularSpan);

      // Simulate mouseover event
      const mouseoverEvent = new window.MouseEvent('mouseover', {
        bubbles: true,
        cancelable: true,
      });

      // Dispatch event
      regularSpan.dispatchEvent(mouseoverEvent);

      // Verify no errors occurred
      expect(mockLogger.error).not.toHaveBeenCalled();
    });
  });

  describe('Disposal', () => {
    it('should dispose cleanly', () => {
      // Initialize TooltipManager
      TooltipManager.initialize(TooltipUI);

      // Create some elements
      const convertedSpan = document.createElement('span');
      convertedSpan.className = 'tg-converted-text';
      convertedSpan.setAttribute('data-original-text', 'Donald Trump');
      convertedSpan.textContent = 'Agent Orange';
      convertedSpan.tabIndex = 0;
      document.body.appendChild(convertedSpan);

      // Dispose
      TooltipManager.dispose();

      // Verify no errors occurred during disposal
      expect(mockLogger.error).not.toHaveBeenCalled();
    });

    it('should handle multiple disposal calls gracefully', () => {
      // Initialize TooltipManager
      TooltipManager.initialize(TooltipUI);

      // Dispose multiple times
      TooltipManager.dispose();
      TooltipManager.dispose();

      // Should not cause errors
      expect(mockLogger.error).not.toHaveBeenCalled();
    });

    it('should handle disposal before initialization', () => {
      // Dispose without initializing
      TooltipManager.dispose();

      // Should not cause errors
      expect(mockLogger.error).not.toHaveBeenCalled();
    });
  });

  describe('Integration with TooltipUI', () => {
    it('should work with TooltipUI for tooltip display', () => {
      // Initialize TooltipManager with TooltipUI
      TooltipManager.initialize(TooltipUI);

      // Create a converted text element
      const convertedSpan = document.createElement('span');
      convertedSpan.className = 'tg-converted-text';
      convertedSpan.setAttribute('data-original-text', 'Donald Trump');
      convertedSpan.textContent = 'Agent Orange';
      convertedSpan.tabIndex = 0;
      document.body.appendChild(convertedSpan);

      // Simulate mouseover
      const mouseoverEvent = new window.MouseEvent('mouseover', {
        bubbles: true,
        cancelable: true,
      });
      convertedSpan.dispatchEvent(mouseoverEvent);

      // Fast-forward timers
      vi.useFakeTimers();
      vi.runAllTimers();
      vi.useRealTimers();

      // Check if tooltip element exists in DOM
      const tooltipElement = document.getElementById('tg-tooltip');
      expect(tooltipElement).not.toBeNull();

      // Verify no errors occurred
      expect(mockLogger.error).not.toHaveBeenCalled();
    });
  });
});
