/**
 * Simplified unit tests for the TooltipManager module
 * Tests the actual module behavior
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { JSDOM } from 'jsdom';
import { createTestLogger } from '../helpers/test-utils';
import { TooltipUI } from '../../tooltip-ui.ts';
import { TooltipManager } from '../../tooltip-manager.ts';

// Mock TooltipUI module since TooltipManager depends on it
vi.mock('../../tooltip-ui.ts', () => ({
  TooltipUI: {
    ensureCreated: vi.fn(),
    setText: vi.fn(),
    updatePosition: vi.fn(),
    show: vi.fn(),
    hide: vi.fn(),
    destroy: vi.fn(),
    getId: vi.fn(() => 'tg-tooltip'),
  },
}));

describe('TooltipManager (Simplified)', () => {
  let document;
  let window;
  let mockLogger;
  let mockPerformanceUtils;

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
    mockPerformanceUtils = {
      throttle: vi.fn((fn) => fn), // For simplicity, return the function unchanged
      DOMBatch: {
        read: vi.fn((callback) => callback()),
        write: vi.fn((callback) => callback()),
      },
    };
    window.PerformanceUtils = mockPerformanceUtils;

    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up after each test
    TooltipManager.dispose();
    mockLogger.clear();
  });

  describe('initialization', () => {
    it('should initialize with TooltipUI instance', () => {
      // Initialize TooltipManager
      TooltipManager.initialize(TooltipUI);

      // Verify TooltipUI.ensureCreated was called
      expect(TooltipUI.ensureCreated).toHaveBeenCalled();

      // Verify initialization was logged
      expect(mockLogger.info).toHaveBeenCalledWith('TooltipManager: Initialized successfully');
    });

    it('should handle null TooltipUI instance', () => {
      // Initialize with null should throw
      expect(() => TooltipManager.initialize(null)).toThrow('TooltipUI module is required');
    });

    it('should prevent multiple initializations', () => {
      // Initialize first time
      TooltipManager.initialize(TooltipUI);
      vi.clearAllMocks();

      // Initialize again
      TooltipManager.initialize(TooltipUI);

      // Verify warning was logged
      expect(mockLogger.warn).toHaveBeenCalledWith('TooltipManager: Already initialized');
      // Verify ensureCreated was not called again
      expect(TooltipUI.ensureCreated).not.toHaveBeenCalled();
    });
  });

  describe('event handling', () => {
    beforeEach(() => {
      // Initialize TooltipManager
      TooltipManager.initialize(TooltipUI);
    });

    it('should handle focus on converted text element', () => {
      // Create a converted text element
      const convertedElement = document.createElement('span');
      convertedElement.className = 'tg-converted-text';
      convertedElement.setAttribute('data-original-text', 'Obama');
      document.body.appendChild(convertedElement);

      // Simulate focus
      const event = new window.FocusEvent('focusin', { bubbles: true });
      Object.defineProperty(event, 'target', { value: convertedElement });
      document.dispatchEvent(event);

      // Verify tooltip was shown
      expect(TooltipUI.setText).toHaveBeenCalledWith('Obama');
      expect(TooltipUI.updatePosition).toHaveBeenCalledWith(convertedElement);
      expect(TooltipUI.show).toHaveBeenCalled();
    });

    it('should handle mouseleave to hide tooltip', () => {
      // Simulate mouseleave on document
      const event = new window.MouseEvent('mouseleave', { bubbles: true });
      document.dispatchEvent(event);

      // Verify tooltip was hidden
      expect(TooltipUI.hide).toHaveBeenCalled();
    });

    it('should handle keyboard dismissal with Escape key', () => {
      // Simulate Escape key press
      const event = new window.KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(event);

      // Verify tooltip was hidden
      expect(TooltipUI.hide).toHaveBeenCalled();
    });
  });

  describe('disposal', () => {
    it('should clean up event listeners and tooltip on dispose', () => {
      // Initialize first
      TooltipManager.initialize(TooltipUI);
      vi.clearAllMocks();

      // Dispose
      TooltipManager.dispose();

      // Verify cleanup
      expect(TooltipUI.destroy).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith('TooltipManager: Disposed successfully');
    });

    it('should do nothing if not initialized', () => {
      // Dispose without initializing
      TooltipManager.dispose();

      // Verify nothing happened (no error)
      expect(TooltipUI.destroy).not.toHaveBeenCalled();
    });
  });
});
