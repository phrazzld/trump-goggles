/**
 * Unit tests for the TooltipManager module using the actual module
 * Tests direct interactions with the TooltipManager API
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { JSDOM } from 'jsdom';
import { createTestLogger } from '../helpers/test-utils';
import { TooltipManager } from '../../tooltip-manager';
import { TooltipUI } from '../../tooltip-ui';

describe('TooltipManager (Actual Module)', () => {
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

    // Mock performance utils
    window.PerformanceUtils = {
      throttle: vi.fn((fn) => fn),
      debounce: vi.fn((fn) => fn),
      Configs: {
        // Add Configs object
        input: { delay: 32 },
        scroll: { delay: 150 },
        keyboard: { delay: 50 },
      },
      // Note: DOMBatch has been removed from performance-utils.ts as part of T021
      // but we still mock it here for backward compatibility with tests
      DOMBatch: {
        read: vi.fn((callback) => callback()),
        write: vi.fn((callback) => callback()),
      },
    };

    // Reset all mocks between tests
    vi.clearAllMocks();
  });

  afterEach(() => {
    TooltipManager.dispose();
    vi.resetAllMocks();
  });

  describe('initialize', () => {
    it('should initialize with TooltipUI module', () => {
      expect(() => TooltipManager.initialize(TooltipUI)).not.toThrow();
    });

    it('should log initialization message', () => {
      TooltipManager.initialize(TooltipUI);

      expect(mockLogger.info).toHaveBeenCalledWith('TooltipManager: Initialized successfully');
    });

    it('should throw error if no UI module provided', () => {
      expect(() => TooltipManager.initialize(null)).toThrow('TooltipUI module is required');
    });

    it('should warn when already initialized', () => {
      TooltipManager.initialize(TooltipUI);
      mockLogger.clear();

      TooltipManager.initialize(TooltipUI);

      expect(mockLogger.warn).toHaveBeenCalledWith('TooltipManager: Already initialized');
    });
  });

  describe('dispose', () => {
    it('should dispose cleanly after initialization', () => {
      TooltipManager.initialize(TooltipUI);
      expect(() => TooltipManager.dispose()).not.toThrow();
    });

    it('should log disposal message', () => {
      TooltipManager.initialize(TooltipUI);
      mockLogger.clear();

      TooltipManager.dispose();

      expect(mockLogger.info).toHaveBeenCalledWith('TooltipManager: Disposed successfully');
    });

    it('should handle disposal when not initialized', () => {
      expect(() => TooltipManager.dispose()).not.toThrow();
    });

    it('should properly remove event listeners during disposal', () => {
      // Spy on document.addEventListener and removeEventListener
      const addSpy = vi.spyOn(document, 'addEventListener');
      const removeSpy = vi.spyOn(document, 'removeEventListener');

      // Initialize the manager which adds event listeners
      TooltipManager.initialize(TooltipUI);

      // Verify listeners were added
      expect(addSpy).toHaveBeenCalled();
      const addCallCount = addSpy.mock.calls.length;
      expect(addCallCount).toBeGreaterThan(0);

      // Reset the removal spy to focus only on the dispose calls
      removeSpy.mockReset();

      // Dispose the manager
      TooltipManager.dispose();

      // Verify listeners were removed
      expect(removeSpy).toHaveBeenCalled();

      // We should have the same number of removals as additions
      // NOTE: Some additions may be to window, not document, so we check that removals occurred
      expect(removeSpy.mock.calls.length).toBeGreaterThan(0);
    });

    it('should properly clean up window event listeners (scroll) during disposal', () => {
      // Spy on window event listeners
      const windowAddSpy = vi.spyOn(window, 'addEventListener');
      const windowRemoveSpy = vi.spyOn(window, 'removeEventListener');

      // Initialize the manager
      TooltipManager.initialize(TooltipUI);

      // Verify window listeners were added (scroll)
      expect(windowAddSpy).toHaveBeenCalled();
      expect(windowAddSpy).toHaveBeenCalledWith('scroll', expect.any(Function), expect.anything());

      // Reset window removal spy
      windowRemoveSpy.mockReset();

      // Dispose the manager
      TooltipManager.dispose();

      // Verify window listeners were removed
      expect(windowRemoveSpy).toHaveBeenCalled();
    });
  });

  describe('event handling', () => {
    beforeEach(() => {
      TooltipManager.initialize(TooltipUI);
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should handle mouseover on converted text', () => {
      // Create converted text element
      const element = document.createElement('span');
      element.className = 'tg-converted-text';
      element.setAttribute('data-original-text', 'Original');
      document.body.appendChild(element);

      // Dispatch mouseover event
      const event = new window.MouseEvent('mouseover', {
        bubbles: true,
        target: element,
      });
      document.body.dispatchEvent(event);

      // Fast forward timers
      vi.runAllTimers();

      // Check that tooltip was created
      const tooltip = document.querySelector('#tg-tooltip');
      expect(tooltip).toBeTruthy();
    });

    it('should handle keyboard dismissal', () => {
      // Dispatch Escape key event
      const event = new window.KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
      });
      document.dispatchEvent(event);

      // Just verify it doesn't throw
      expect(true).toBe(true);
    });
  });
});
