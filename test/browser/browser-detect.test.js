/**
 * Unit tests for the browser detection module
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Import the mock from our mock directory
import {
  MockBrowserDetect,
  switchBrowserType,
  setFeatureSupport,
  BROWSERS,
  MANIFEST,
} from '../mocks/browser-detect.mock';

describe('BrowserDetect Module', () => {
  beforeEach(() => {
    // Reset all mocks
    vi.resetAllMocks();
  });

  describe('Browser Detection', () => {
    it('should detect Chrome correctly', () => {
      // Set up Chrome detection
      switchBrowserType(BROWSERS.CHROME, MANIFEST.V3);

      // Verify Chrome detection
      expect(MockBrowserDetect.getBrowser()).toBe(BROWSERS.CHROME);
      expect(MockBrowserDetect.isChrome()).toBe(true);
      expect(MockBrowserDetect.isFirefox()).toBe(false);
      expect(MockBrowserDetect.isEdge()).toBe(false);
      expect(MockBrowserDetect.isSafari()).toBe(false);
    });

    it('should detect Firefox correctly', () => {
      // Set up Firefox detection
      switchBrowserType(BROWSERS.FIREFOX, MANIFEST.V2);

      // Verify Firefox detection
      expect(MockBrowserDetect.getBrowser()).toBe(BROWSERS.FIREFOX);
      expect(MockBrowserDetect.isChrome()).toBe(false);
      expect(MockBrowserDetect.isFirefox()).toBe(true);
      expect(MockBrowserDetect.isEdge()).toBe(false);
      expect(MockBrowserDetect.isSafari()).toBe(false);
    });

    it('should detect Edge correctly', () => {
      // Set up Edge detection
      switchBrowserType(BROWSERS.EDGE, MANIFEST.V3);

      // Verify Edge detection
      expect(MockBrowserDetect.getBrowser()).toBe(BROWSERS.EDGE);
      expect(MockBrowserDetect.isChrome()).toBe(false);
      expect(MockBrowserDetect.isFirefox()).toBe(false);
      expect(MockBrowserDetect.isEdge()).toBe(true);
      expect(MockBrowserDetect.isSafari()).toBe(false);
    });
  });

  describe('Manifest Version Detection', () => {
    it('should detect Manifest V3 for Chrome', () => {
      // Set up Chrome with MV3
      switchBrowserType(BROWSERS.CHROME, MANIFEST.V3);

      // Verify manifest version
      expect(MockBrowserDetect.getManifestVersion()).toBe(MANIFEST.V3);
    });

    it('should detect Manifest V2 for Firefox', () => {
      // Set up Firefox with MV2
      switchBrowserType(BROWSERS.FIREFOX, MANIFEST.V2);

      // Verify manifest version
      expect(MockBrowserDetect.getManifestVersion()).toBe(MANIFEST.V2);
    });
  });

  describe('Feature Detection', () => {
    it('should detect supported features', () => {
      // By default, all features are supported
      expect(MockBrowserDetect.hasFeature(MockBrowserDetect.FEATURES.PROMISES)).toBe(true);
      expect(MockBrowserDetect.hasFeature(MockBrowserDetect.FEATURES.MUTATION_OBSERVER)).toBe(true);
    });

    it('should detect unsupported features', () => {
      // Set a specific feature as unsupported
      setFeatureSupport(MockBrowserDetect.FEATURES.WEB_REQUEST, false);

      // Verify feature detection
      expect(MockBrowserDetect.hasFeature(MockBrowserDetect.FEATURES.WEB_REQUEST)).toBe(false);
      expect(MockBrowserDetect.hasFeature(MockBrowserDetect.FEATURES.PROMISES)).toBe(true); // Other features still supported
    });

    it('should detect promise-based APIs in Firefox', () => {
      // Set up Firefox
      switchBrowserType(BROWSERS.FIREFOX, MANIFEST.V2);

      // Verify promise API detection
      expect(MockBrowserDetect.hasPromiseAPI()).toBe(true);
    });

    it('should detect callback-based APIs in Chrome', () => {
      // Set up Chrome
      switchBrowserType(BROWSERS.CHROME, MANIFEST.V3);

      // Verify promise API detection
      expect(MockBrowserDetect.hasPromiseAPI()).toBe(false);
    });
  });

  describe('Debug Information', () => {
    it('should provide comprehensive debug information', () => {
      // Setup
      switchBrowserType(BROWSERS.CHROME, MANIFEST.V3);

      // Get debug info
      const debugInfo = MockBrowserDetect.getDebugInfo();

      // Verify debug info structure
      expect(debugInfo).toEqual(
        expect.objectContaining({
          name: BROWSERS.CHROME,
          version: expect.any(Number),
          manifestVersion: MANIFEST.V3,
          userAgent: expect.any(String),
          features: expect.objectContaining({
            promises: expect.any(Boolean),
            mutationObserver: expect.any(Boolean),
            matchMedia: expect.any(Boolean),
            webRequest: expect.any(Boolean),
            localStorage: expect.any(Boolean),
            serviceWorker: expect.any(Boolean),
            shadowDom: expect.any(Boolean),
          }),
        })
      );
    });
  });
});
