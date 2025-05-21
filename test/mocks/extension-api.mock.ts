/**
 * Comprehensive mock for Chrome extension APIs
 * This mock can be configured to simulate both Chrome and Firefox extension environments
 */
import { vi } from 'vitest';

/**
 * Creates a mock event manager that can be used with event listeners
 *
 * @returns {Object} Event listener manager with addListener, removeListener, hasListener methods
 */
const createEventManager = () => {
  const listeners = new Set<Function>();

  return {
    addListener: vi.fn((callback: Function) => {
      if (typeof callback === 'function') {
        listeners.add(callback);
      }
    }),

    removeListener: vi.fn((callback: Function) => {
      if (typeof callback === 'function') {
        listeners.delete(callback);
      }
    }),

    hasListener: vi.fn((callback: Function) => {
      return listeners.has(callback);
    }),

    hasListeners: vi.fn(() => listeners.size > 0),

    // Helper for tests to trigger the event
    trigger: (...args: any[]) => {
      const results: any[] = [];
      listeners.forEach((listener) => {
        results.push(listener(...args));
      });
      return results;
    },

    // Helper to get all listeners
    getListeners: () => Array.from(listeners),

    // Helper to clear all listeners
    clearListeners: () => {
      listeners.clear();
    },
  };
};

interface MockExtensionApiOptions {
  browserType?: 'chrome' | 'firefox';
  manifestVersion?: 2 | 3;
  storageData?: Record<string, any>;
}

/**
 * Creates a mock for the Chrome extension API
 *
 * @param {Object} options - Configuration options
 * @returns {Object} Mock Chrome extension API
 */
const createExtensionApiMock = (options: MockExtensionApiOptions = {}) => {
  const {
    browserType = 'chrome', // 'chrome' or 'firefox'
    manifestVersion = 3,
    storageData = {},
  } = options;

  // Mock storage
  const storageData_ = { ...storageData };

  const storage = {
    sync: {
      get: vi.fn((keys: any, callback?: Function) => {
        let result: any = {};

        if (!keys) {
          // If no keys provided, return all storage data
          result = { ...storageData_ };
        } else if (typeof keys === 'string') {
          // Single key
          result = { [keys]: storageData_[keys] };
        } else if (Array.isArray(keys)) {
          // Array of keys
          keys.forEach((key) => {
            if (storageData_[key] !== undefined) {
              result[key] = storageData_[key];
            }
          });
        } else if (typeof keys === 'object') {
          // Object with default values
          Object.keys(keys).forEach((key) => {
            result[key] = storageData_[key] !== undefined ? storageData_[key] : keys[key];
          });
        }

        if (browserType === 'firefox') {
          return Promise.resolve(result);
        }

        if (callback) {
          callback(result);
        }
        return undefined;
      }),

      set: vi.fn((items, callback) => {
        Object.assign(storageData_, items);

        if (browserType === 'firefox') {
          return Promise.resolve();
        }

        if (callback) {
          callback();
        }
        return undefined;
      }),

      remove: vi.fn((keys, callback) => {
        if (typeof keys === 'string') {
          delete storageData_[keys];
        } else if (Array.isArray(keys)) {
          keys.forEach((key) => delete storageData_[key]);
        }

        if (browserType === 'firefox') {
          return Promise.resolve();
        }

        if (callback) {
          callback();
        }
        return undefined;
      }),

      clear: vi.fn((callback) => {
        Object.keys(storageData_).forEach((key) => delete storageData_[key]);

        if (browserType === 'firefox') {
          return Promise.resolve();
        }

        if (callback) {
          callback();
        }
        return undefined;
      }),

      // Event when storage changes
      onChanged: createEventManager(),

      // Helper to get all storage data
      _getData: () => ({ ...storageData_ }),

      // Helper to set storage data
      _setData: (data: any) => {
        Object.keys(storageData_).forEach((key) => delete storageData_[key]);
        Object.assign(storageData_, data);
      },

      // Helper to trigger storage changes
      _triggerChanges: (changes: any) => {
        storage.sync.onChanged.trigger(changes, 'sync');
      },
    },

    // Also add local storage with the same interface
    local: {
      get: vi.fn((_keys: any, callback?: Function) => {
        if (browserType === 'firefox') {
          return Promise.resolve({});
        }

        if (callback) {
          callback({});
        }
        return undefined;
      }),
      set: vi.fn((_items: any, callback?: Function) => {
        if (browserType === 'firefox') {
          return Promise.resolve();
        }

        if (callback) {
          callback();
        }
        return undefined;
      }),
      remove: vi.fn((_keys: string | string[], callback?: Function) => {
        if (browserType === 'firefox') {
          return Promise.resolve();
        }

        if (callback) {
          callback();
        }
        return undefined;
      }),
      clear: vi.fn((callback?: Function) => {
        if (browserType === 'firefox') {
          return Promise.resolve();
        }

        if (callback) {
          callback();
        }
        return undefined;
      }),
      onChanged: createEventManager(),
    },
  };

  // Mock runtime
  const runtime = {
    // The ID of the extension
    id: 'mock-extension-id',

    // Get extension manifest
    getManifest: vi.fn(() => ({
      manifest_version: manifestVersion,
      name: 'Trump Goggles',
      version: '2.0.0',
    })),

    // Send a message
    sendMessage: vi.fn((message, options, callback) => {
      if (browserType === 'firefox') {
        return Promise.resolve({ success: true, message });
      }

      if (typeof options === 'function') {
        callback = options;
      }

      if (callback) {
        callback({ success: true, message });
      }
      return undefined;
    }),

    // Connect to a port
    connect: vi.fn(() => ({
      postMessage: vi.fn(),
      disconnect: vi.fn(),
      onMessage: createEventManager(),
      onDisconnect: createEventManager(),
    })),

    // Get URL for extension resource
    getURL: vi.fn((path) => `chrome-extension://mock-extension-id/${path}`),

    // Open options page
    openOptionsPage: vi.fn((callback) => {
      if (browserType === 'firefox') {
        return Promise.resolve();
      }

      if (callback) {
        callback();
      }
      return undefined;
    }),

    // Last error (for Chrome only)
    lastError: null,

    // Set last error helper (for testing)
    _setLastError: (error: any) => {
      runtime.lastError = error;
    },

    // Clear last error helper
    _clearLastError: () => {
      runtime.lastError = null;
    },

    // Events
    onMessage: createEventManager(),
    onConnect: createEventManager(),
    onInstalled: createEventManager(),
    onStartup: createEventManager(),
    onSuspend: createEventManager(),
    onUpdateAvailable: createEventManager(),
  };

  // Mock tabs API
  const tabs = {
    // Query tabs
    query: vi.fn((_queryInfo: any, callback?: Function) => {
      const tabs = [
        { id: 1, url: 'https://example.com', title: 'Example', active: true },
        { id: 2, url: 'https://test.com', title: 'Test', active: false },
      ];

      if (browserType === 'firefox') {
        return Promise.resolve(tabs);
      }

      if (callback) {
        callback(tabs);
      }
      return undefined;
    }),

    // Get a specific tab
    get: vi.fn((tabId, callback) => {
      const tab = { id: tabId, url: 'https://example.com', title: 'Example' };

      if (browserType === 'firefox') {
        return Promise.resolve(tab);
      }

      if (callback) {
        callback(tab);
      }
      return undefined;
    }),

    // Create a new tab
    create: vi.fn((createProperties, callback) => {
      const tab = { id: Date.now(), ...createProperties };

      if (browserType === 'firefox') {
        return Promise.resolve(tab);
      }

      if (callback) {
        callback(tab);
      }
      return undefined;
    }),

    // Update a tab
    update: vi.fn((tabId, updateProperties, callback) => {
      const tab = { id: tabId, ...updateProperties };

      if (browserType === 'firefox') {
        return Promise.resolve(tab);
      }

      if (callback) {
        callback(tab);
      }
      return undefined;
    }),

    // Send a message to a tab
    sendMessage: vi.fn((tabId, message, options, callback) => {
      if (browserType === 'firefox') {
        return Promise.resolve({ success: true, tabId, message });
      }

      if (typeof options === 'function') {
        callback = options;
      }

      if (callback) {
        callback({ success: true, tabId, message });
      }
      return undefined;
    }),

    // Execute script in a tab
    executeScript: vi.fn((tabId, details, callback) => {
      if (browserType === 'firefox') {
        return Promise.resolve([{ result: 'Script executed' }]);
      }

      if (typeof tabId === 'object') {
        callback = details;
        details = tabId;
        tabId = null;
      }

      if (callback) {
        callback([{ result: 'Script executed' }]);
      }
      return undefined;
    }),

    // Events
    onCreated: createEventManager(),
    onUpdated: createEventManager(),
    onRemoved: createEventManager(),
    onActivated: createEventManager(),
  };

  // Different APIs for MV2 and MV3
  let browserAction = null;
  let action = null;

  if (manifestVersion === 2) {
    // MV2 uses browserAction
    browserAction = {
      setIcon: vi.fn((_details: any, callback?: Function) => {
        if (browserType === 'firefox') {
          return Promise.resolve();
        }

        if (callback) {
          callback();
        }
        return undefined;
      }),

      setTitle: vi.fn((_details: any, callback?: Function) => {
        if (browserType === 'firefox') {
          return Promise.resolve();
        }

        if (callback) {
          callback();
        }
        return undefined;
      }),

      setBadgeText: vi.fn((_details: any, callback?: Function) => {
        if (browserType === 'firefox') {
          return Promise.resolve();
        }

        if (callback) {
          callback();
        }
        return undefined;
      }),

      setBadgeBackgroundColor: vi.fn((_details: any, callback?: Function) => {
        if (browserType === 'firefox') {
          return Promise.resolve();
        }

        if (callback) {
          callback();
        }
        return undefined;
      }),

      // Event for browser action click
      onClicked: createEventManager(),
    };
  } else {
    // MV3 uses action
    action = {
      setIcon: vi.fn((_details: any, callback?: Function) => {
        if (browserType === 'firefox') {
          return Promise.resolve();
        }

        if (callback) {
          callback();
        }
        return undefined;
      }),

      setTitle: vi.fn((_details: any, callback?: Function) => {
        if (browserType === 'firefox') {
          return Promise.resolve();
        }

        if (callback) {
          callback();
        }
        return undefined;
      }),

      setBadgeText: vi.fn((_details: any, callback?: Function) => {
        if (browserType === 'firefox') {
          return Promise.resolve();
        }

        if (callback) {
          callback();
        }
        return undefined;
      }),

      setBadgeBackgroundColor: vi.fn((_details: any, callback?: Function) => {
        if (browserType === 'firefox') {
          return Promise.resolve();
        }

        if (callback) {
          callback();
        }
        return undefined;
      }),

      // Event for action click
      onClicked: createEventManager(),
    };
  }

  // Create the full mock API
  const mockApi = {
    storage,
    runtime,
    tabs,
    browserAction,
    action,

    // Helper methods for testing
    _reset: () => {
      // Reset all mocks
      vi.resetAllMocks();

      // Clear all event listeners
      Object.values(mockApi).forEach((api) => {
        if (api) {
          Object.entries(api).forEach(([_, value]) => {
            if (value && typeof value.clearListeners === 'function') {
              value.clearListeners();
            }
          });
        }
      });

      // Reset storage data
      storage.sync._setData({ ...storageData });

      // Clear last error
      runtime._clearLastError();
    },

    // Helper to switch between Chrome and Firefox behavior
    _setBrowserType: (_type: string) => {
      // This would need to redefine all functions to switch promise vs. callback behavior
      console.warn(
        'Browser type switching is not fully implemented at runtime. Create a new mock instead.'
      );
    },
  };

  return mockApi;
};

// Create default Chrome MV3 mock
const MockExtensionApi = createExtensionApiMock();

// Export functions and default mock
export { MockExtensionApi, createExtensionApiMock, createEventManager };
