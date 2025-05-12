/**
 * Test setup file for Trump Goggles
 * This file is loaded by Vitest before running tests
 */
import { vi } from 'vitest';
import { MockExtensionApi } from './mocks/extension-api.mock';
import { MockBrowserDetect } from './mocks/browser-detect.mock';
import { MockBrowserAdapter } from './mocks/browser-adapter.mock';

// Setup global extension API mocks
global.chrome = MockExtensionApi;

// Setup browser global for Firefox tests
global.browser = undefined; // Default to undefined, will be set when testing Firefox

// Add mocks for browser-specific modules
global.BrowserDetect = MockBrowserDetect;
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
global.matchMedia = vi.fn().mockImplementation((query) => ({
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
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    key: vi.fn((index) => Object.keys(store)[index] || null),
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
global.localStorage = localStorageMock;

// Helper function to reset all mocks between tests
beforeEach(() => {
  // Reset all mock implementations
  vi.resetAllMocks();

  // Reset extension API mock
  MockExtensionApi._reset();

  // Initialize BrowserAdapter for testing
  if (BrowserAdapter && BrowserAdapter.initialize) {
    BrowserAdapter.initialize({ debug: false });
  }
});

// Helper functions for common text processing operations
global.createTextNode = (text) => {
  const node = document.createTextNode(text);
  return node;
};

global.walk = vi.fn();
global.convert = vi.fn();
global.isEditableNode = vi.fn().mockReturnValue(false);

// Expose helper to switch between Chrome and Firefox testing
global.setupForFirefox = () => {
  // Create Firefox extension API mock
  const firefoxMock = MockExtensionApi; // Reuse existing mock for now

  // Update BrowserDetect to simulate Firefox
  if (BrowserDetect) {
    BrowserDetect.getBrowser.mockReturnValue('firefox');
    BrowserDetect.isChrome.mockReturnValue(false);
    BrowserDetect.isFirefox.mockReturnValue(true);
    BrowserDetect.getManifestVersion.mockReturnValue(2);
    BrowserDetect.hasPromiseAPI.mockReturnValue(true);
  }

  // Update BrowserAdapter to use promise-based API
  if (BrowserAdapter) {
    BrowserAdapter.usesPromises.mockReturnValue(true);
  }

  // Setup browser global for Firefox
  global.browser = firefoxMock;

  return firefoxMock;
};

global.setupForChrome = () => {
  // Update BrowserDetect to simulate Chrome
  if (BrowserDetect) {
    BrowserDetect.getBrowser.mockReturnValue('chrome');
    BrowserDetect.isChrome.mockReturnValue(true);
    BrowserDetect.isFirefox.mockReturnValue(false);
    BrowserDetect.getManifestVersion.mockReturnValue(3);
    BrowserDetect.hasPromiseAPI.mockReturnValue(false);
  }

  // Update BrowserAdapter to use callback-based API
  if (BrowserAdapter) {
    BrowserAdapter.usesPromises.mockReturnValue(false);
  }

  // Clear Firefox global
  global.browser = undefined;

  return MockExtensionApi;
};
