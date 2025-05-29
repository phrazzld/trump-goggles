/**
 * Simplified unit tests for the TooltipManager module
 * Tests the actual module behavior
 */
import { describe, it, expect, beforeEach, vi, afterEach, type MockedFunction } from 'vitest';
import { JSDOM } from 'jsdom';
import { createTestLogger } from '../helpers/test-utils';
import { TooltipUI } from '../../tooltip-ui';
import { TooltipManager } from '../../tooltip-manager';

// Mock TooltipUI module since TooltipManager depends on it
vi.mock('../../tooltip-ui', () => ({
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

interface MockPerformanceUtils {
  throttle: MockedFunction<any>;
  debounce: MockedFunction<any>;
  Configs: {
    input: { delay: number };
    scroll: { delay: number };
    keyboard: { delay: number };
  };
  DOMBatch: {
    read: MockedFunction<any>;
    write: MockedFunction<any>;
  };
}

describe('TooltipManager (Simplified)', () => {
  let document: Document;
  let window: Window & typeof globalThis;
  let mockLogger: ReturnType<typeof createTestLogger>;
  let mockPerformanceUtils: MockPerformanceUtils;

  beforeEach(() => {
    // Create a fresh JSDOM instance for each test
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
      url: 'https://example.org/',
      referrer: 'https://example.com/',
      contentType: 'text/html',
    });

    window = dom.window as unknown as Window & typeof globalThis;
    document = window.document;
    global.document = document;
    global.window = window;

    // Mock the Logger
    mockLogger = createTestLogger();
    (window as any).Logger = mockLogger;

    // Mock performance utils
    mockPerformanceUtils = {
      throttle: vi.fn((fn: any) => fn), // For simplicity, return the function unchanged
      debounce: vi.fn((fn: any) => fn), // Add debounce function
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
    (window as any).PerformanceUtils = mockPerformanceUtils;

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
      expect(vi.mocked(TooltipUI).ensureCreated).toHaveBeenCalled();

      // Verify initialization was logged
      expect(mockLogger.info).toHaveBeenCalledWith('TooltipManager: Initialized successfully');
    });

    it('should handle null TooltipUI instance', () => {
      // Initialize with null should throw
      expect(() => TooltipManager.initialize(null as any)).toThrow('TooltipUI module is required');
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
      expect(vi.mocked(TooltipUI).ensureCreated).not.toHaveBeenCalled();
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
      expect(vi.mocked(TooltipUI).setText).toHaveBeenCalledWith('Obama');
      expect(vi.mocked(TooltipUI).updatePosition).toHaveBeenCalledWith(convertedElement);
      expect(vi.mocked(TooltipUI).show).toHaveBeenCalled();
    });

    it('should handle mouseleave to hide tooltip', () => {
      // Simulate mouseleave on document
      const event = new window.MouseEvent('mouseleave', { bubbles: true });
      document.dispatchEvent(event);

      // Verify tooltip was hidden
      expect(vi.mocked(TooltipUI).hide).toHaveBeenCalled();
    });

    it('should handle keyboard dismissal with Escape key', () => {
      // Simulate Escape key press
      const event = new window.KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(event);

      // Verify tooltip was hidden
      expect(vi.mocked(TooltipUI).hide).toHaveBeenCalled();
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
      expect(vi.mocked(TooltipUI).destroy).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith('TooltipManager: Disposed successfully');
    });

    it('should do nothing if not initialized', () => {
      // Dispose without initializing
      TooltipManager.dispose();

      // Verify nothing happened (no error)
      expect(vi.mocked(TooltipUI).destroy).not.toHaveBeenCalled();
    });
  });
});
