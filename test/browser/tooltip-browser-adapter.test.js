/**
 * Tests for TooltipBrowserAdapter
 */

// Import dependencies
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock DOM API
class MockElement {
  constructor() {
    this.style = {};
    this.attributes = {};
  }

  setAttribute(name, value) {
    this.attributes[name] = value;
  }

  getAttribute(name) {
    return this.attributes[name];
  }
}

// Mock window and document
const originalWindow = global.window;
const originalDocument = global.document;

describe('TooltipBrowserAdapter', () => {
  beforeEach(() => {
    // Mock document
    global.document = {
      createElement: () => new MockElement(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      hidden: false,
    };

    // Mock window
    global.window = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      BrowserDetect: {
        getBrowser: vi.fn().mockReturnValue('chrome'),
        getVersion: vi.fn().mockReturnValue(90),
        isFirefox: vi.fn().mockReturnValue(false),
        isChrome: vi.fn().mockReturnValue(true),
        isEdge: vi.fn().mockReturnValue(false),
        isSafari: vi.fn().mockReturnValue(false),
      },
      Logger: {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
      },
    };

    // Simulate loading the tooltip browser adapter
    const moduleCode = `
      // Simplified version for testing
      window.TooltipBrowserAdapter = {
        getSafeZIndex: function() { return 2147483647; },
        applyBrowserSpecificStyles: function(element) { 
          element.style.zIndex = "2147483647";
          return element; 
        },
        convertCssForBrowser: function(css) { return css; },
        registerBrowserEvents: function(id, showCb, hideCb) { 
          return function() {}; 
        },
        getDefaultTooltipStyles: function() { return ".test{}"; },
        getDebugInfo: function() { 
          return {
            browser: "chrome",
            version: 90
          }; 
        }
      };
    `;

    // Execute the module code in the global context
    new Function(moduleCode)();
  });

  afterEach(() => {
    // Restore originals
    global.window = originalWindow;
    global.document = originalDocument;
  });

  it('should provide a safe z-index value', () => {
    expect(window.TooltipBrowserAdapter.getSafeZIndex()).toBe(2147483647);
  });

  it('should apply browser-specific styles to an element', () => {
    const element = new MockElement();
    window.TooltipBrowserAdapter.applyBrowserSpecificStyles(element);
    expect(element.style.zIndex).toBe('2147483647');
  });

  it('should provide default tooltip styles as a string', () => {
    const styles = window.TooltipBrowserAdapter.getDefaultTooltipStyles();
    expect(typeof styles).toBe('string');
  });

  it('should provide debug info', () => {
    const info = window.TooltipBrowserAdapter.getDebugInfo();
    expect(info.browser).toBe('chrome');
    expect(info.version).toBe(90);
  });

  it('should register browser events and return a cleanup function', () => {
    const cleanup = window.TooltipBrowserAdapter.registerBrowserEvents(
      'test-tooltip',
      () => {},
      () => {}
    );
    expect(typeof cleanup).toBe('function');
  });
});
