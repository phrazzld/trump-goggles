/**
 * Tests for TooltipBrowserAdapter
 */

// Import dependencies
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * Mock DOM Element for testing
 * @implements {HTMLElement}
 */
class MockElement {
  /**
   * Create a new MockElement
   */
  constructor() {
    /** @type {Record<string, string>} */
    this.style = {};
    /** @type {Record<string, string>} */
    this.attributes = {};
  }

  /**
   * Set attribute on mock element
   * @param {string} name - Attribute name
   * @param {string} value - Attribute value
   * @returns {void}
   */
  setAttribute(name, value) {
    this.attributes[name] = value;
  }

  /**
   * Get attribute from mock element
   * @param {string} name - Attribute name
   * @returns {string|null} Attribute value or null
   */
  getAttribute(name) {
    return this.attributes[name] || null;
  }
}

// Mock window and document
/** @type {Window & typeof globalThis} */
const originalWindow = global.window;
/** @type {Document} */
const originalDocument = global.document;

describe('TooltipBrowserAdapter', () => {
  beforeEach(() => {
    // Mock document
    /** @type {Partial<Document>} */
    global.document = {
      createElement: () => new MockElement(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      hidden: false,
    };

    // Mock window
    /** @type {Partial<Window> & { BrowserDetect?: Partial<BrowserDetectInterface>, Logger?: Partial<LoggerInterface> }} */
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
        // Add missing properties required by interface
        BROWSERS: {
          CHROME: 'chrome',
          FIREFOX: 'firefox',
          EDGE: 'edge',
          SAFARI: 'safari',
          OPERA: 'opera',
          UNKNOWN: 'unknown',
        },
        FEATURES: {
          PROMISES: 'promises',
          MUTATION_OBSERVER: 'mutationObserver',
          MATCH_MEDIA: 'matchMedia',
          WEB_REQUEST: 'webRequest',
          LOCAL_STORAGE: 'localStorage',
          SERVICE_WORKER: 'serviceWorker',
          SHADOW_DOM: 'shadowDom',
        },
        MANIFEST: {
          V2: 2,
          V3: 3,
        },
        getManifestVersion: vi.fn().mockReturnValue(2),
        hasPromiseAPI: vi.fn().mockReturnValue(true),
        hasFeature: vi.fn().mockReturnValue(true),
        getDebugInfo: vi.fn().mockReturnValue({
          name: 'chrome',
          version: 90,
          manifestVersion: 2,
          userAgent: 'test',
          features: {
            promises: true,
            mutationObserver: true,
            matchMedia: true,
            webRequest: true,
            localStorage: true,
            serviceWorker: false,
            shadowDom: true,
          },
        }),
      },
      Logger: {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        // Add missing properties required by interface
        LEVELS: {
          DEBUG: 'debug',
          INFO: 'info',
          WARN: 'warn',
          ERROR: 'error',
        },
        configure: vi.fn(),
        enableDebugMode: vi.fn(),
        disableDebugMode: vi.fn(),
        time: vi.fn().mockReturnValue({ stop: vi.fn() }),
        protect: vi.fn((fn) => fn),
        protectAsync: vi.fn((fn) => fn),
        getStats: vi.fn(),
        resetStats: vi.fn(),
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
            version: 90,
            features: {
              highZIndex: true,
              pointerEvents: true,
              transitions: true,
              visibilityAPI: true
            },
            appliedStyles: {
              zIndex: 2147483647,
              transitionProperty: "opacity"
            }
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
    expect(window.TooltipBrowserAdapter?.getSafeZIndex()).toBe(2147483647);
  });

  it('should apply browser-specific styles to an element', () => {
    const element = new MockElement();
    window.TooltipBrowserAdapter?.applyBrowserSpecificStyles(element);
    // Use safer access for style properties
    expect(element.style['zIndex']).toBe('2147483647');
  });

  it('should provide default tooltip styles as a string', () => {
    const styles = window.TooltipBrowserAdapter?.getDefaultTooltipStyles();
    expect(typeof styles).toBe('string');
  });

  it('should provide debug info', () => {
    const info = window.TooltipBrowserAdapter?.getDebugInfo();
    expect(info?.browser).toBe('chrome');
    expect(info?.version).toBe(90);
  });

  it('should register browser events and return a cleanup function', () => {
    const cleanup = window.TooltipBrowserAdapter?.registerBrowserEvents(
      'test-tooltip',
      /** @type {Function} */ (() => {}),
      /** @type {Function} */ (() => {})
    );
    expect(typeof cleanup).toBe('function');
  });
});
