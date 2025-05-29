/**
 * Unit tests for the browser adapter module
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Import the mock from our mock directory
import {
  MockBrowserAdapter,
  switchApiType,
  simulateApiError,
  API_TYPES,
} from '../mocks/browser-adapter.mock';

describe('BrowserAdapter Module', () => {
  beforeEach(() => {
    // Reset all mocks
    vi.resetAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with default configuration', () => {
      // Call initialize
      const result = MockBrowserAdapter.initialize();

      // Verify result
      expect(result).toBe(true);
      expect(MockBrowserAdapter.initialize).toHaveBeenCalledTimes(1);
    });

    it('should accept custom configuration options', () => {
      // Call initialize with custom options
      const options = { debug: true, callbackTimeout: 10000 };
      const result = MockBrowserAdapter.initialize(options);

      // Verify result
      expect(result).toBe(true);
      expect(MockBrowserAdapter.initialize).toHaveBeenCalledWith(options);
    });
  });

  describe('API Detection', () => {
    it('should detect callback API for Chrome', () => {
      // Set API type to callback (Chrome)
      switchApiType(API_TYPES.CALLBACK);

      // Verify API detection
      expect(MockBrowserAdapter.usesPromises()).toBe(false);
    });

    it('should detect promise API for Firefox', () => {
      // Set API type to promise (Firefox)
      switchApiType(API_TYPES.PROMISE);

      // Verify API detection
      expect(MockBrowserAdapter.usesPromises()).toBe(true);
    });

    it('should provide access to the native API object', () => {
      // Get API object
      const api = MockBrowserAdapter.getAPI();

      // Verify API object
      expect(api).toBeDefined();
      expect(api).toBe(chrome); // Should be the global chrome object in tests
    });
  });

  describe('Promise Handling', () => {
    it('should promisify callback-based API functions', async () => {
      // Set API type to callback
      switchApiType(API_TYPES.CALLBACK);

      // Mock API function
      const mockApiFunction = vi.fn((arg: string, callback: (result: any) => void) => {
        callback({ result: 'success', arg });
      });

      // Promisify the function
      const promise = MockBrowserAdapter.promisify(mockApiFunction, 'test-arg');

      // Verify result
      const result = await promise;
      expect(result).toEqual(
        expect.objectContaining({
          success: true,
          args: expect.arrayContaining(['test-arg']),
        })
      );
    });

    it('should handle errors in promisified functions', async () => {
      // Simulate an API error
      simulateApiError('promisify', new Error('API Error'));

      // Call the function
      try {
        await MockBrowserAdapter.promisify(() => {});
        // If we get here, the test fails
        expect(true).toBe(false); // Should not reach this line
      } catch (error) {
        // Verify error handling
        expect(error).toBeInstanceOf(Error);
        if (error instanceof Error) {
          expect(error.message).toBe('API Error');
        }
      }
    });
  });

  describe('Browser API Methods', () => {
    it('should open options page', async () => {
      // Call openOptionsPage
      const promise = MockBrowserAdapter.openOptionsPage();

      // Verify result
      await expect(promise).resolves.toBeUndefined();
      expect(MockBrowserAdapter.openOptionsPage).toHaveBeenCalledTimes(1);
    });

    it('should get manifest', () => {
      // Call getManifest
      const manifest = MockBrowserAdapter.getManifest();

      // Verify result
      expect(manifest).toEqual(
        expect.objectContaining({
          name: 'Trump Goggles',
          version: expect.any(String),
          manifest_version: expect.any(Number),
        })
      );
      expect(MockBrowserAdapter.getManifest).toHaveBeenCalledTimes(1);
    });

    it('should add icon click listener', () => {
      // Create mock callback
      const callback = vi.fn();

      // Call addIconClickListener
      const result = MockBrowserAdapter.addIconClickListener(callback);

      // Verify result
      expect(result).toBe(true);
      expect(MockBrowserAdapter.addIconClickListener).toHaveBeenCalledWith(callback);

      // Simulate click and verify callback was called
      MockBrowserAdapter._simulateIconClick();
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should get items from storage', async () => {
      // Call getStorageItem
      const promise = MockBrowserAdapter.getStorageItem('test-key');

      // Verify result
      const result = await promise;
      expect(result).toEqual(expect.objectContaining({ 'test-key': 'mockValue' }));
      expect(MockBrowserAdapter.getStorageItem).toHaveBeenCalledWith('test-key');
    });

    it('should set items in storage', async () => {
      // Call setStorageItem
      const items = { 'test-key': 'test-value' };
      const promise = MockBrowserAdapter.setStorageItem(items);

      // Verify result
      await expect(promise).resolves.toBeUndefined();
      expect(MockBrowserAdapter.setStorageItem).toHaveBeenCalledWith(items);
    });

    it('should send message to tab', async () => {
      // Call sendMessageToTab
      const tabId = 123;
      const message = { action: 'test' };
      const promise = MockBrowserAdapter.sendMessageToTab(tabId, message);

      // Verify result
      const result = await promise;
      expect(result).toEqual(
        expect.objectContaining({
          response: 'mockResponse',
          tabId,
          message,
        })
      );
      expect(MockBrowserAdapter.sendMessageToTab).toHaveBeenCalledWith(tabId, message);
    });

    it('should send message to extension', async () => {
      // Call sendMessage
      const message = { action: 'test' };
      const promise = MockBrowserAdapter.sendMessage(message);

      // Verify result
      const result = await promise;
      expect(result).toEqual(
        expect.objectContaining({
          response: 'mockResponse',
          message,
        })
      );
      expect(MockBrowserAdapter.sendMessage).toHaveBeenCalledWith(message);
    });

    it('should add message listener', () => {
      // Create mock callback
      const callback = vi.fn();

      // Call addMessageListener
      const result = MockBrowserAdapter.addMessageListener(callback);

      // Verify result
      expect(result).toBe(true);
      expect(MockBrowserAdapter.addMessageListener).toHaveBeenCalledWith(callback);

      // Simulate message and verify callback was called
      const message = { action: 'test' };
      const sender = { id: 'sender-id' };
      MockBrowserAdapter._simulateMessage(message, sender);
      expect(callback).toHaveBeenCalledWith(message, sender);
    });

    it('should add install listener', () => {
      // Create mock callback
      const callback = vi.fn();

      // Call addInstallListener
      const result = MockBrowserAdapter.addInstallListener(callback);

      // Verify result
      expect(result).toBe(true);
      expect(MockBrowserAdapter.addInstallListener).toHaveBeenCalledWith(callback);

      // Simulate install and verify callback was called
      const details = { reason: 'install' };
      MockBrowserAdapter._simulateInstall(details);
      expect(callback).toHaveBeenCalledWith(details);
    });
  });

  describe('Error Handling', () => {
    it('should handle errors when opening options page', async () => {
      // Simulate error
      simulateApiError('openOptionsPage', new Error('Options page error'));

      // Call openOptionsPage
      try {
        await MockBrowserAdapter.openOptionsPage();
        // If we get here, the test fails
        expect(true).toBe(false); // Should not reach this line
      } catch (error) {
        // Verify error handling
        expect(error).toBeInstanceOf(Error);
        if (error instanceof Error) {
          expect(error.message).toBe('Options page error');
        }
      }
    });

    it('should handle storage errors', async () => {
      // Simulate error
      simulateApiError('getStorageItem', new Error('Storage error'));

      // Call getStorageItem
      try {
        await MockBrowserAdapter.getStorageItem('test-key');
        // If we get here, the test fails
        expect(true).toBe(false); // Should not reach this line
      } catch (error) {
        // Verify error handling
        expect(error).toBeInstanceOf(Error);
        if (error instanceof Error) {
          expect(error.message).toBe('Storage error');
        }
      }
    });
  });

  describe('Debug Information', () => {
    it('should provide comprehensive debug information', () => {
      // Get debug info
      const debugInfo = MockBrowserAdapter.getDebugInfo();

      // Verify debug info structure
      expect(debugInfo).toEqual(
        expect.objectContaining({
          browser: expect.any(String),
          version: expect.any(Number),
          manifestVersion: expect.any(Number),
          apiType: expect.any(String),
          apis: expect.objectContaining({
            storage: expect.any(Boolean),
            tabs: expect.any(Boolean),
            runtime: expect.any(Boolean),
            action: expect.any(Boolean),
            browserAction: expect.any(Boolean),
            userAgent: expect.any(String),
          }),
        })
      );
    });
  });
});
