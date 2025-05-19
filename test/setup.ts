/**
 * Test setup file for Trump Goggles
 * This file is loaded by Vitest before running tests
 */
import { vi, beforeEach } from 'vitest';
import { MockExtensionApi } from './mocks/extension-api.mock';
import { MockBrowserDetect } from './mocks/browser-detect.mock';
import { MockBrowserAdapter } from './mocks/browser-adapter.mock';

// Import type only for better type inference
import type { ChromeNamespace, LocalStorageMock } from './types';

// Setup global extension API mocks
// @ts-expect-error - Chrome API mock has different shape than full Chrome API
global.chrome = MockExtensionApi;

// Setup browser global for Firefox tests
// @ts-expect-error - Browser API is optionally defined
global.browser = undefined; // Default to undefined, will be set when testing Firefox

// Add mocks for browser-specific modules
// @ts-expect-error - Adding test globals
global.BrowserDetect = MockBrowserDetect;
// @ts-expect-error - Adding test globals
global.BrowserAdapter = MockBrowserAdapter;

// Mock for console.* methods
global.console = {
  ...console,
  log: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
};

// Mock for window.matchMedia
global.matchMedia = vi.fn().mockImplementation((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

// Mock for IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock for localStorage
const localStorageMock: LocalStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
    get length() {
      return Object.keys(store).length;
    },
  };
})();

// Fix for localStorage in JSDOM
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Also expose it as a global
global.localStorage = localStorageMock as unknown as Storage;

// Helper function to reset all mocks between tests
beforeEach(() => {
  // Reset all mock implementations
  vi.resetAllMocks();

  // Reset extension API mock
  MockExtensionApi._reset();

  // Initialize BrowserAdapter for testing
  if ('BrowserAdapter' in global) {
    (global as any).BrowserAdapter.initialize({ debug: false });
  }
});

// Helper functions for common text processing operations
global.createTextNode = (text: string): Text => {
  const node = document.createTextNode(text);
  return node;
};

// @ts-expect-error - Extending global for test utilities
global.walk = vi.fn();
// @ts-expect-error - Extending global for test utilities
global.convert = vi.fn();
// @ts-expect-error - Extending global for test utilities
global.isEditableNode = vi.fn().mockReturnValue(false);

// Expose helper to switch between Chrome and Firefox testing
global.setupForFirefox = () => {
  // Create Firefox extension API mock
  const firefoxMock = MockExtensionApi; // Reuse existing mock for now

  // Update BrowserDetect to simulate Firefox
  if ('BrowserDetect' in global) {
    const browserDetect = (global as any).BrowserDetect;
    browserDetect.getBrowser.mockReturnValue('firefox');
    browserDetect.isChrome.mockReturnValue(false);
    browserDetect.isFirefox.mockReturnValue(true);
    browserDetect.getManifestVersion.mockReturnValue(2);
    browserDetect.hasPromiseAPI.mockReturnValue(true);
  }

  // Update BrowserAdapter to use promise-based API
  if ('BrowserAdapter' in global) {
    (global as any).BrowserAdapter.usesPromises.mockReturnValue(true);
  }

  // Setup browser global for Firefox
  // @ts-expect-error - Browser API assignment
  global.browser = firefoxMock as unknown as ChromeNamespace;

  return firefoxMock as unknown as ChromeNamespace;
};

global.setupForChrome = () => {
  // Update BrowserDetect to simulate Chrome
  if ('BrowserDetect' in global) {
    const browserDetect = (global as any).BrowserDetect;
    browserDetect.getBrowser.mockReturnValue('chrome');
    browserDetect.isChrome.mockReturnValue(true);
    browserDetect.isFirefox.mockReturnValue(false);
    browserDetect.getManifestVersion.mockReturnValue(3);
    browserDetect.hasPromiseAPI.mockReturnValue(false);
  }

  // Update BrowserAdapter to use callback-based API
  if ('BrowserAdapter' in global) {
    (global as any).BrowserAdapter.usesPromises.mockReturnValue(false);
  }

  // Clear Firefox global
  // @ts-expect-error - Browser API assignment
  global.browser = undefined;

  return MockExtensionApi as unknown as ChromeNamespace;
};
