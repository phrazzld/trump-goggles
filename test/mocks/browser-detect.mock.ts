/**
 * Mock implementation of browser-detect.js for testing
 */
import { vi } from 'vitest';

// Browser constants to match the actual implementation
const BROWSERS = {
  CHROME: 'chrome',
  FIREFOX: 'firefox',
  EDGE: 'edge',
  SAFARI: 'safari',
  OPERA: 'opera',
  UNKNOWN: 'unknown',
};

// Manifest version constants
const MANIFEST = {
  V2: 2,
  V3: 3,
};

// Feature flags
const FEATURES = {
  PROMISES: 'promises',
  MUTATION_OBSERVER: 'mutationObserver',
  MATCH_MEDIA: 'matchMedia',
  WEB_REQUEST: 'webRequest',
  LOCAL_STORAGE: 'localStorage',
  SERVICE_WORKER: 'serviceWorker',
  SHADOW_DOM: 'shadowDom',
};

// Create a mock BrowserDetect module
const createBrowserDetectMock = (browserType = BROWSERS.CHROME, manifestVersion = MANIFEST.V3) => {
  // Create spy functions for all public methods
  const getBrowser = vi.fn(() => browserType);
  const isChrome = vi.fn(() => browserType === BROWSERS.CHROME);
  const isFirefox = vi.fn(() => browserType === BROWSERS.FIREFOX);
  const isEdge = vi.fn(() => browserType === BROWSERS.EDGE);
  const isSafari = vi.fn(() => browserType === BROWSERS.SAFARI);
  const getVersion = vi.fn(() => 100); // Mock a high version number
  const getManifestVersion = vi.fn(() => manifestVersion);
  const hasFeature = vi.fn((_feature?: string) => true); // Default to true for all features
  const hasPromiseAPI = vi.fn(() => browserType === BROWSERS.FIREFOX);
  const getDebugInfo = vi.fn(() => ({
    name: browserType,
    version: 100,
    manifestVersion,
    userAgent: 'Mozilla/5.0 (Mock Browser)',
    features: {
      promises: true,
      mutationObserver: true,
      matchMedia: true,
      webRequest: true,
      localStorage: true,
      serviceWorker: true,
      shadowDom: true,
    },
  }));

  // Create the mock object
  const mockBrowserDetect = {
    // Browser information methods
    getBrowser,
    isChrome,
    isFirefox,
    isEdge,
    isSafari,
    getVersion,
    getManifestVersion,

    // Feature detection methods
    hasFeature,
    hasPromiseAPI,
    getDebugInfo,

    // Constants
    BROWSERS,
    MANIFEST,
    FEATURES,
  };

  return mockBrowserDetect;
};

// Create default instance with Chrome and MV3
const MockBrowserDetect = createBrowserDetectMock();

// Helper to switch the mock to a different browser type
const switchBrowserType = (browserType: string, manifestVersion: number) => {
  // Reset all mocks
  for (const key in MockBrowserDetect) {
    const func = (MockBrowserDetect as any)[key];
    if (typeof func === 'function' && func.mockReset) {
      func.mockReset();
    }
  }

  // Update the mock implementation
  MockBrowserDetect.getBrowser.mockImplementation(() => browserType);
  MockBrowserDetect.isChrome.mockImplementation(() => browserType === BROWSERS.CHROME);
  MockBrowserDetect.isFirefox.mockImplementation(() => browserType === BROWSERS.FIREFOX);
  MockBrowserDetect.isEdge.mockImplementation(() => browserType === BROWSERS.EDGE);
  MockBrowserDetect.isSafari.mockImplementation(() => browserType === BROWSERS.SAFARI);
  MockBrowserDetect.getManifestVersion.mockImplementation(() => manifestVersion);
  MockBrowserDetect.hasPromiseAPI.mockImplementation(() => browserType === BROWSERS.FIREFOX);
  MockBrowserDetect.getDebugInfo.mockImplementation(() => ({
    name: browserType,
    version: 100,
    manifestVersion,
    userAgent: 'Mozilla/5.0 (Mock Browser)',
    features: {
      promises: true,
      mutationObserver: true,
      matchMedia: true,
      webRequest: true,
      localStorage: true,
      serviceWorker: true,
      shadowDom: true,
    },
  }));
};

// For specific feature testing
const setFeatureSupport = (featureName: string, isSupported: boolean) => {
  MockBrowserDetect.hasFeature.mockImplementation((feature?: string) => {
    if (feature === featureName) {
      return isSupported;
    }
    return true; // Default for other features
  });
};

// Export the mock and helpers
export { MockBrowserDetect, switchBrowserType, setFeatureSupport, BROWSERS, MANIFEST, FEATURES };
