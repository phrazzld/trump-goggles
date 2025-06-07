/**
 * Test setup file for Trump Goggles
 * This file is loaded by Vitest before running tests
 *
 * CRITICAL DESIGN CONSTRAINT: Tests must be independent of build artifacts
 *
 * This setup uses direct TypeScript imports instead of loading compiled JavaScript
 * from the dist/ directory. This ensures tests can run reliably in any environment
 * without requiring a prior build step, which is essential for CI pipeline success.
 *
 * See test/README.md for comprehensive documentation on test setup architecture.
 */
import { vi, beforeEach } from 'vitest';
import { MockExtensionApi } from './mocks/extension-api.mock';
import { MockBrowserDetect } from './mocks/browser-detect.mock';
import { MockBrowserAdapter } from './mocks/browser-adapter.mock';

// Import type only for better type inference
import type { ChromeNamespace, LocalStorageMock } from './types';

// Setup global extension API mocks
(global as any).chrome = MockExtensionApi;

// Setup browser global for Firefox tests
(global as any).browser = undefined; // Default to undefined, will be set when testing Firefox

// Add mocks for browser-specific modules
(global as any).BrowserDetect = MockBrowserDetect;
(global as any).BrowserAdapter = MockBrowserAdapter;

// ============================================================================
// LOGGING MODULE SETUP - CRITICAL: NO BUILD DEPENDENCIES ALLOWED
// ============================================================================
//
// This section initializes logging components using direct TypeScript imports.
// This approach is MANDATORY to prevent CI failures.
//
// ❌ WRONG APPROACH (causes CI failures):
//   const distPath = path.join(__dirname, '../dist');
//   const moduleCode = fs.readFileSync(path.join(distPath, 'structured-logger.js'));
//   eval(moduleCode); // FAILS: dist/ doesn't exist during CI test execution
//
// ✅ CORRECT APPROACH (used below):
//   Import TypeScript modules directly. Each module automatically exports to
//   window globals when imported, providing the same API as the browser extension.
//
// Benefits of this approach:
// - Tests run without requiring build step (CI friendly)
// - Same window global pattern as browser extension
// - Fast test startup (no file I/O operations)
// - Environment independent (works locally and in CI)
//
// IMPORTANT: If you modify this section, ensure tests still pass without
// running `pnpm build` first. Test with: `pnpm test`
//
// ============================================================================

// Ensure window object exists for modules to attach to
if (typeof (global as any).window === 'undefined') {
  (global as any).window = {};
}

// Import logging modules in dependency order to set up window globals
// Each module will automatically export to window globals when imported
import '../src/utils/security-utils'; // Required by structured-logger
import '../src/utils/structured-logger'; // Exports window.StructuredLogger
import '../src/utils/logger-context'; // Exports window.LoggerContext
import '../src/utils/logger-adapter'; // Exports window.LoggerAdapter
import '../src/utils/logger-factory'; // Exports window.LoggerFactory and window.Logger

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

(global as any).walk = vi.fn();
(global as any).convert = vi.fn();
(global as any).isEditableNode = vi.fn().mockReturnValue(false);

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
  (global as any).browser = firefoxMock as unknown as ChromeNamespace;

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
  (global as any).browser = undefined;

  return MockExtensionApi as unknown as ChromeNamespace;
};
