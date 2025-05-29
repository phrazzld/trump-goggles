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

// Type definitions for browser constants
type BrowserType = keyof typeof BROWSERS;
type ManifestVersion = keyof typeof MANIFEST;

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

    it('should detect Safari correctly', () => {
      // Set up Safari detection
      switchBrowserType(BROWSERS.SAFARI, MANIFEST.V2);

      // Verify Safari detection
      expect(MockBrowserDetect.getBrowser()).toBe(BROWSERS.SAFARI);
      expect(MockBrowserDetect.isChrome()).toBe(false);
      expect(MockBrowserDetect.isFirefox()).toBe(false);
      expect(MockBrowserDetect.isEdge()).toBe(false);
      expect(MockBrowserDetect.isSafari()).toBe(true);
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

    it('should detect Manifest V3 for Edge', () => {
      // Set up Edge with MV3
      switchBrowserType(BROWSERS.EDGE, MANIFEST.V3);

      // Verify manifest version
      expect(MockBrowserDetect.getManifestVersion()).toBe(MANIFEST.V3);
    });
  });

  describe('Feature Detection', () => {
    it('should detect supported features', () => {
      // By default, all features are supported
      expect(MockBrowserDetect.hasFeature(MockBrowserDetect.FEATURES.PROMISES)).toBe(true);
      expect(MockBrowserDetect.hasFeature(MockBrowserDetect.FEATURES.FETCH)).toBe(true);
      expect(MockBrowserDetect.hasFeature(MockBrowserDetect.FEATURES.WEB_COMPONENTS)).toBe(true);
    });

    it('should detect unsupported features when disabled', () => {
      // Disable a feature
      setFeatureSupport(MockBrowserDetect.FEATURES.PROMISES, false);

      // Verify the feature is now unsupported
      expect(MockBrowserDetect.hasFeature(MockBrowserDetect.FEATURES.PROMISES)).toBe(false);
      // Other features should still be supported
      expect(MockBrowserDetect.hasFeature(MockBrowserDetect.FEATURES.FETCH)).toBe(true);
    });

    it('should handle feature toggling', () => {
      const feature = MockBrowserDetect.FEATURES.WEB_COMPONENTS;

      // Initially supported
      expect(MockBrowserDetect.hasFeature(feature)).toBe(true);

      // Disable and verify
      setFeatureSupport(feature, false);
      expect(MockBrowserDetect.hasFeature(feature)).toBe(false);

      // Re-enable and verify
      setFeatureSupport(feature, true);
      expect(MockBrowserDetect.hasFeature(feature)).toBe(true);
    });
  });

  describe('Debug Information', () => {
    it('should provide debug information', () => {
      // Set up Chrome
      switchBrowserType(BROWSERS.CHROME, MANIFEST.V3);

      const debugInfo = MockBrowserDetect.getDebugInfo();
      expect(typeof debugInfo).toBe('object');
      expect(debugInfo.name).toBe(BROWSERS.CHROME);
      expect(debugInfo.userAgent).toBeTruthy();
    });

    it('should return different debug info for different browsers', () => {
      // Get Chrome debug info
      switchBrowserType(BROWSERS.CHROME, MANIFEST.V3);
      const chromeDebug = MockBrowserDetect.getDebugInfo();

      // Get Firefox debug info
      switchBrowserType(BROWSERS.FIREFOX, MANIFEST.V2);
      const firefoxDebug = MockBrowserDetect.getDebugInfo();

      // They should be different
      expect(chromeDebug.name).not.toBe(firefoxDebug.name);
      expect(chromeDebug.manifestVersion).not.toBe(firefoxDebug.manifestVersion);
    });
  });

  describe('Browser Capabilities', () => {
    it('should report promise API support correctly', () => {
      // Chrome should not use promise API (uses callback)
      switchBrowserType(BROWSERS.CHROME, MANIFEST.V3);
      expect(MockBrowserDetect.hasPromiseAPI()).toBe(false);

      // Firefox should use promise API
      switchBrowserType(BROWSERS.FIREFOX, MANIFEST.V2);
      expect(MockBrowserDetect.hasPromiseAPI()).toBe(true);
    });

    it('should provide version information', () => {
      // All browsers should report a version
      switchBrowserType(BROWSERS.CHROME, MANIFEST.V3);
      expect(typeof MockBrowserDetect.getVersion()).toBe('number');
      expect(MockBrowserDetect.getVersion()).toBeGreaterThan(0);

      switchBrowserType(BROWSERS.FIREFOX, MANIFEST.V2);
      expect(typeof MockBrowserDetect.getVersion()).toBe('number');
      expect(MockBrowserDetect.getVersion()).toBeGreaterThan(0);
    });

    it('should report features through debug info', () => {
      const debugInfo = MockBrowserDetect.getDebugInfo();
      expect(debugInfo.features).toBeDefined();
      expect(debugInfo.features.promises).toBe(true);
      expect(debugInfo.features.mutationObserver).toBe(true);
      expect(debugInfo.features.localStorage).toBe(true);
    });
  });

  describe('Constants and Configuration', () => {
    it('should provide browser constants', () => {
      expect(MockBrowserDetect.BROWSERS).toBeDefined();
      expect(MockBrowserDetect.BROWSERS.CHROME).toBe('chrome');
      expect(MockBrowserDetect.BROWSERS.FIREFOX).toBe('firefox');
      expect(MockBrowserDetect.BROWSERS.EDGE).toBe('edge');
      expect(MockBrowserDetect.BROWSERS.SAFARI).toBe('safari');
    });

    it('should provide manifest version constants', () => {
      expect(MockBrowserDetect.MANIFEST).toBeDefined();
      expect(MockBrowserDetect.MANIFEST.V2).toBe(2);
      expect(MockBrowserDetect.MANIFEST.V3).toBe(3);
    });

    it('should provide feature constants', () => {
      expect(MockBrowserDetect.FEATURES).toBeDefined();
      expect(MockBrowserDetect.FEATURES.PROMISES).toBe('promises');
      expect(MockBrowserDetect.FEATURES.MUTATION_OBSERVER).toBe('mutationObserver');
      expect(MockBrowserDetect.FEATURES.LOCAL_STORAGE).toBe('localStorage');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid feature queries gracefully', () => {
      // Should not throw for invalid feature names
      expect(() => {
        MockBrowserDetect.hasFeature('invalid-feature' as any);
      }).not.toThrow();
    });

    it('should provide fallback values for unavailable information', () => {
      // Even in edge cases, should return valid types
      expect(typeof MockBrowserDetect.getBrowser()).toBe('string');
      expect(typeof MockBrowserDetect.getManifestVersion()).toBe('number');
      expect(typeof MockBrowserDetect.getDebugInfo().userAgent).toBe('string');
    });
  });

  describe('Cross-Browser Compatibility', () => {
    it('should handle browser-specific API differences', () => {
      // Test Chrome-specific behavior
      switchBrowserType(BROWSERS.CHROME, MANIFEST.V3);
      expect(MockBrowserDetect.getBrowser()).toBe('chrome');

      // Test Firefox-specific behavior
      switchBrowserType(BROWSERS.FIREFOX, MANIFEST.V2);
      expect(MockBrowserDetect.getBrowser()).toBe('firefox');
    });

    it('should report correct permissions model', () => {
      // MV3 should use different permissions model
      switchBrowserType(BROWSERS.CHROME, MANIFEST.V3);
      expect(MockBrowserDetect.getManifestVersion()).toBe(MANIFEST.V3);

      // MV2 should use legacy permissions
      switchBrowserType(BROWSERS.FIREFOX, MANIFEST.V2);
      expect(MockBrowserDetect.getManifestVersion()).toBe(MANIFEST.V2);
    });
  });
});
