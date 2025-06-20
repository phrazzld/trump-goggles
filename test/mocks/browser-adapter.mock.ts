/**
 * Mock implementation of browser-adapter.js for testing
 */
import { vi } from 'vitest';

// API Types to match the actual implementation
const API_TYPES = {
  PROMISE: 'promise',
  CALLBACK: 'callback',
};

// Create mock for BrowserAdapter
const createBrowserAdapterMock = (apiType = API_TYPES.CALLBACK) => {
  // Mock internal state
  let initialized = false;
  let mockConfig = {
    debug: false,
    callbackTimeout: 5000,
  };

  // Create mock API functions
  const initialize = vi.fn((options = {}) => {
    if (options.debug !== undefined) {
      mockConfig.debug = Boolean(options.debug);
    }
    if (options.callbackTimeout !== undefined && typeof options.callbackTimeout === 'number') {
      mockConfig.callbackTimeout = options.callbackTimeout;
    }
    initialized = true;
    return true;
  });

  const getAPI = vi.fn(() => (global as any).chrome);
  const usesPromises = vi.fn(() => apiType === API_TYPES.PROMISE);

  const promisify = vi.fn((apiFunction, ...args) => {
    if (!apiFunction) {
      return Promise.reject(new Error('Invalid API function'));
    }
    return Promise.resolve({ success: true, args });
  });

  const openOptionsPage = vi.fn(() => Promise.resolve());
  const getManifest = vi.fn(() => ({
    name: 'Trump Goggles',
    version: '2.0.0',
    manifest_version: 3,
  }));

  // Store callbacks outside the function
  const iconClickCallbacks: Function[] = [];

  const addIconClickListener = vi.fn((callback: any) => {
    if (typeof callback === 'function') {
      // Store the callback for testing
      iconClickCallbacks.push(callback);
      return true;
    }
    return false;
  });

  // Helper to simulate icon click
  const simulateIconClick = () => {
    iconClickCallbacks.forEach((callback) => callback());
  };

  const getStorageItem = vi.fn((keys: any) => Promise.resolve({ [keys]: 'mockValue' }));
  const setStorageItem = vi.fn((_items: any) => Promise.resolve());

  const sendMessageToTab = vi.fn((tabId: any, message: any) =>
    Promise.resolve({ response: 'mockResponse', tabId, message })
  );
  const sendMessage = vi.fn((message: any) =>
    Promise.resolve({ response: 'mockResponse', message })
  );

  // Store message listener callbacks
  const messageListenerCallbacks: Function[] = [];

  const addMessageListener = vi.fn((callback: any) => {
    if (typeof callback === 'function') {
      // Store the callback for testing
      messageListenerCallbacks.push(callback);
      return true;
    }
    return false;
  });

  // Helper to simulate receiving a message
  const simulateMessage = (message: any, sender: any) => {
    return messageListenerCallbacks.map((callback) => callback(message, sender));
  };

  // Store install listener callbacks
  const installListenerCallbacks: Function[] = [];

  const addInstallListener = vi.fn((callback: any) => {
    if (typeof callback === 'function') {
      // Store the callback for testing
      installListenerCallbacks.push(callback);
      return true;
    }
    return false;
  });

  // Helper to simulate installation event
  const simulateInstall = (details = { reason: 'install' }) => {
    installListenerCallbacks.forEach((callback) => callback(details));
  };

  const getDebugInfo = vi.fn(() => ({
    browser: 'chrome',
    version: 100,
    manifestVersion: 3,
    apiType,
    apis: {
      storage: true,
      tabs: true,
      runtime: true,
      action: true,
      browserAction: true,
      userAgent: 'Mozilla/5.0 (Mock Browser)',
    },
  }));

  // Create the mock object
  const mockBrowserAdapter = {
    initialize,
    getAPI,
    usesPromises,
    promisify,
    openOptionsPage,
    getManifest,
    addIconClickListener,
    getStorageItem,
    setStorageItem,
    sendMessageToTab,
    sendMessage,
    addMessageListener,
    addInstallListener,
    getDebugInfo,

    // Testing helpers
    _simulateIconClick: simulateIconClick,
    _simulateMessage: simulateMessage,
    _simulateInstall: simulateInstall,
    _getConfig: () => mockConfig,
    _isInitialized: () => initialized,

    // Constants
    API_TYPES,
  };

  return mockBrowserAdapter;
};

// Create default instance with callback API
const MockBrowserAdapter = createBrowserAdapterMock();

// Helper to switch API type
const switchApiType = (apiType: string) => {
  MockBrowserAdapter.usesPromises.mockImplementation(() => apiType === API_TYPES.PROMISE);
  MockBrowserAdapter.getDebugInfo.mockImplementation(() => ({
    browser: apiType === API_TYPES.PROMISE ? 'firefox' : 'chrome',
    version: 100,
    manifestVersion: apiType === API_TYPES.PROMISE ? 2 : 3,
    apiType,
    apis: {
      storage: true,
      tabs: true,
      runtime: true,
      action: apiType !== API_TYPES.PROMISE,
      browserAction: apiType === API_TYPES.PROMISE,
      userAgent: 'Mozilla/5.0 (Mock Browser)',
    },
  }));
};

// Helper to simulate API errors
const simulateApiError = (methodName: string, error = new Error('API Error')) => {
  const method = (MockBrowserAdapter as any)[methodName];
  if (method && typeof method === 'function') {
    method.mockImplementationOnce(() => Promise.reject(error));
  }
};

// Export the mock and helpers
export { MockBrowserAdapter, switchApiType, simulateApiError, API_TYPES };
