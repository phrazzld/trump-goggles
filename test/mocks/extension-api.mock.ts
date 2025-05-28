/**
 * Comprehensive mock for Chrome extension APIs
 * This mock can be configured to simulate both Chrome and Firefox extension environments
 */
import { vi } from 'vitest';

// Type definitions for extension API interfaces
interface MockManifest {
  manifest_version: number;
  name: string;
  version: string;
}

interface MockTab {
  id?: number;
  url?: string;
  title?: string;
  active?: boolean;
  highlighted?: boolean;
  index?: number;
  pinned?: boolean;
  windowId?: number;
  incognito?: boolean;
  selected?: boolean;
}

interface MockPort {
  name?: string;
  postMessage: (message: any) => void;
  disconnect: () => void;
  onMessage: MockEventManager<(message: any) => void>;
  onDisconnect: MockEventManager<(port: MockPort) => void>;
}

interface MockLastError {
  message: string;
}

interface MockMessageSender {
  tab?: MockTab;
  frameId?: number;
  id?: string;
  url?: string;
  tlsChannelId?: string;
}

interface MockStorageArea {
  get: (
    keys: string | string[] | Record<string, any> | null | undefined,
    callback?: (items: Record<string, any>) => void
  ) => Promise<Record<string, any>> | undefined;
  set: (items: Record<string, any>, callback?: () => void) => Promise<void> | undefined;
  remove: (keys: string | string[], callback?: () => void) => Promise<void> | undefined;
  clear: (callback?: () => void) => Promise<void> | undefined;
  onChanged: MockEventManager<(changes: Record<string, any>, areaName: string) => void>;
  _getData?: () => Record<string, any>;
  _setData?: (data: Record<string, any>) => void;
  _triggerChanges?: (changes: Record<string, any>) => void;
}

interface MockRuntimeApi {
  id: string;
  getManifest: () => MockManifest;
  sendMessage: (
    message: any,
    options?: any,
    callback?: (response: any) => void
  ) => Promise<any> | undefined;
  connect: () => MockPort;
  getURL: (path: string) => string;
  openOptionsPage: (callback?: () => void) => Promise<void> | undefined;
  lastError: MockLastError | null;
  _setLastError?: (error: MockLastError | null) => void;
  _clearLastError?: () => void;
  onMessage: MockEventManager<
    (
      message: any,
      sender: MockMessageSender,
      sendResponse: (response?: any) => void
    ) => boolean | void
  >;
  onConnect: MockEventManager<(port: MockPort) => void>;
  onInstalled: MockEventManager<(details: any) => void>;
  onStartup: MockEventManager<() => void>;
  onSuspend: MockEventManager<() => void>;
  onUpdateAvailable: MockEventManager<(details: any) => void>;
}

interface MockTabsApi {
  query: (queryInfo: any, callback?: (tabs: MockTab[]) => void) => Promise<MockTab[]> | undefined;
  get: (tabId: number, callback?: (tab: MockTab) => void) => Promise<MockTab> | undefined;
  create: (
    createProperties: any,
    callback?: (tab: MockTab) => void
  ) => Promise<MockTab> | undefined;
  update: (
    tabId: number,
    updateProperties: any,
    callback?: (tab?: MockTab) => void
  ) => Promise<MockTab> | undefined;
  sendMessage: (
    tabId: number,
    message: any,
    options?: any,
    callback?: (response?: any) => void
  ) => Promise<any> | undefined;
  executeScript: (
    tabId: number | any,
    details?: any,
    callback?: (result?: any[]) => void
  ) => Promise<any[]> | undefined;
  onCreated: MockEventManager<(tab: MockTab) => void>;
  onUpdated: MockEventManager<(tabId: number, changeInfo: any, tab: MockTab) => void>;
  onRemoved: MockEventManager<(tabId: number, removeInfo: any) => void>;
  onActivated: MockEventManager<(activeInfo: any) => void>;
}

interface MockBrowserAction {
  setIcon: (details: any, callback?: () => void) => Promise<void> | undefined;
  setTitle: (details: any, callback?: () => void) => Promise<void> | undefined;
  setBadgeText: (details: any, callback?: () => void) => Promise<void> | undefined;
  setBadgeBackgroundColor: (details: any, callback?: () => void) => Promise<void> | undefined;
  onClicked: MockEventManager<(tab: MockTab) => void>;
}

interface MockAction {
  setIcon: (details: any, callback?: () => void) => Promise<void> | undefined;
  setTitle: (details: any, callback?: () => void) => Promise<void> | undefined;
  setBadgeText: (details: any, callback?: () => void) => Promise<void> | undefined;
  setBadgeBackgroundColor: (details: any, callback?: () => void) => Promise<void> | undefined;
  onClicked: MockEventManager<(tab: MockTab) => void>;
}

/**
 * Event manager interface for mock browser extension events
 */
interface MockEventManager<T extends (...args: any[]) => any = (...args: any[]) => any> {
  addListener: (callback: T) => void;
  removeListener: (callback: T) => void;
  hasListener: (callback: T) => boolean;
  hasListeners: () => boolean;
  trigger: (...args: Parameters<T>) => ReturnType<T>[];
  getListeners: () => T[];
  clearListeners: () => void;
}

/**
 * Creates a mock event manager that can be used with event listeners
 */
const createEventManager = <
  T extends (...args: any[]) => any = (...args: any[]) => any,
>(): MockEventManager<T> => {
  const listeners = new Set<T>();

  return {
    addListener: vi.fn((callback: T): void => {
      if (typeof callback === 'function') {
        listeners.add(callback);
      }
    }),

    removeListener: vi.fn((callback: T): void => {
      if (typeof callback === 'function') {
        listeners.delete(callback);
      }
    }),

    hasListener: vi.fn((callback: T): boolean => {
      return listeners.has(callback);
    }),

    hasListeners: vi.fn((): boolean => listeners.size > 0),

    // Helper for tests to trigger the event
    trigger: (...args: Parameters<T>): ReturnType<T>[] => {
      const results: ReturnType<T>[] = [];
      listeners.forEach((listener) => {
        results.push(listener(...args));
      });
      return results;
    },

    // Helper to get all listeners
    getListeners: (): T[] => Array.from(listeners),

    // Helper to clear all listeners
    clearListeners: (): void => {
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
 * Mock Chrome extension API type definitions
 */
interface MockExtensionApi {
  storage: {
    sync: MockStorageArea;
    local: MockStorageArea;
  };
  runtime: MockRuntimeApi;
  tabs: MockTabsApi;
  browserAction: MockBrowserAction | null;
  action: MockAction | null;
  _reset: () => void;
  _setBrowserType: (type: string) => void;
}

/**
 * Creates a mock for the Chrome extension API
 */
const createExtensionApiMock = (options: MockExtensionApiOptions = {}): MockExtensionApi => {
  const {
    browserType = 'chrome', // 'chrome' or 'firefox'
    manifestVersion = 3,
    storageData = {},
  } = options;

  // Mock storage
  const storageData_ = { ...storageData };

  const storage = {
    sync: {
      get: vi.fn(
        (
          keys: string | string[] | Record<string, any> | null | undefined,
          callback?: (items: Record<string, any>) => void
        ): Promise<Record<string, any>> | undefined => {
          let result: Record<string, any> = {};

          if (!keys) {
            // If no keys provided, return all storage data
            result = { ...storageData_ };
          } else if (typeof keys === 'string') {
            // Single key
            result = { [keys]: storageData_[keys] };
          } else if (Array.isArray(keys)) {
            // Array of keys
            keys.forEach((key: string) => {
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
        }
      ),

      set: vi.fn((items: Record<string, any>, callback?: () => void): Promise<void> | undefined => {
        Object.assign(storageData_, items);

        if (browserType === 'firefox') {
          return Promise.resolve();
        }

        if (callback) {
          callback();
        }
        return undefined;
      }),

      remove: vi.fn((keys: string | string[], callback?: () => void): Promise<void> | undefined => {
        if (typeof keys === 'string') {
          delete storageData_[keys];
        } else if (Array.isArray(keys)) {
          keys.forEach((key: string) => delete storageData_[key]);
        }

        if (browserType === 'firefox') {
          return Promise.resolve();
        }

        if (callback) {
          callback();
        }
        return undefined;
      }),

      clear: vi.fn((callback?: () => void): Promise<void> | undefined => {
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
      _getData: (): Record<string, any> => ({ ...storageData_ }),

      // Helper to set storage data
      _setData: (data: Record<string, any>): void => {
        Object.keys(storageData_).forEach((key) => delete storageData_[key]);
        Object.assign(storageData_, data);
      },

      // Helper to trigger storage changes
      _triggerChanges: (changes: Record<string, any>): void => {
        storage.sync.onChanged.trigger(changes, 'sync');
      },
    },

    // Also add local storage with the same interface
    local: {
      get: vi.fn(
        (
          _keys: string | string[] | Record<string, any> | null | undefined,
          callback?: (items: Record<string, any>) => void
        ): Promise<Record<string, any>> | undefined => {
          if (browserType === 'firefox') {
            return Promise.resolve({});
          }

          if (callback) {
            callback({});
          }
          return undefined;
        }
      ),
      set: vi.fn(
        (_items: Record<string, any>, callback?: () => void): Promise<void> | undefined => {
          if (browserType === 'firefox') {
            return Promise.resolve();
          }

          if (callback) {
            callback();
          }
          return undefined;
        }
      ),
      remove: vi.fn(
        (_keys: string | string[], callback?: () => void): Promise<void> | undefined => {
          if (browserType === 'firefox') {
            return Promise.resolve();
          }

          if (callback) {
            callback();
          }
          return undefined;
        }
      ),
      clear: vi.fn((callback?: () => void): Promise<void> | undefined => {
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
    getManifest: vi.fn(
      (): MockManifest => ({
        manifest_version: manifestVersion,
        name: 'Trump Goggles',
        version: '2.0.0',
      })
    ),

    // Send a message
    sendMessage: vi.fn(
      (
        message: any,
        options?: any,
        callback?: (response: any) => void
      ): Promise<any> | undefined => {
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
      }
    ),

    // Connect to a port
    connect: vi.fn(
      (): MockPort => ({
        name: 'test-port',
        postMessage: vi.fn(),
        disconnect: vi.fn(),
        onMessage: createEventManager(),
        onDisconnect: createEventManager(),
      })
    ),

    // Get URL for extension resource
    getURL: vi.fn((path: string): string => `chrome-extension://mock-extension-id/${path}`),

    // Open options page
    openOptionsPage: vi.fn((callback?: () => void): Promise<void> | undefined => {
      if (browserType === 'firefox') {
        return Promise.resolve();
      }

      if (callback) {
        callback();
      }
      return undefined;
    }),

    // Last error (for Chrome only)
    lastError: null as MockLastError | null,

    // Set last error helper (for testing)
    _setLastError: (error: MockLastError | null): void => {
      runtime.lastError = error;
    },

    // Clear last error helper
    _clearLastError: (): void => {
      runtime.lastError = null;
    },

    // Events
    onMessage:
      createEventManager<
        (
          message: any,
          sender: MockMessageSender,
          sendResponse: (response?: any) => void
        ) => boolean | void
      >(),
    onConnect: createEventManager<(port: MockPort) => void>(),
    onInstalled: createEventManager<(details: any) => void>(),
    onStartup: createEventManager<() => void>(),
    onSuspend: createEventManager<() => void>(),
    onUpdateAvailable: createEventManager<(details: any) => void>(),
  };

  // Mock tabs API
  const tabs = {
    // Query tabs
    query: vi.fn(
      (_queryInfo: any, callback?: (tabs: MockTab[]) => void): Promise<MockTab[]> | undefined => {
        const mockTabs: MockTab[] = [
          {
            id: 1,
            url: 'https://example.com',
            title: 'Example',
            active: true,
            highlighted: true,
            index: 0,
            pinned: false,
            windowId: 1,
            incognito: false,
            selected: true,
          },
          {
            id: 2,
            url: 'https://test.com',
            title: 'Test',
            active: false,
            highlighted: false,
            index: 1,
            pinned: false,
            windowId: 1,
            incognito: false,
            selected: false,
          },
        ];

        if (browserType === 'firefox') {
          return Promise.resolve(mockTabs);
        }

        if (callback) {
          callback(mockTabs);
        }
        return undefined;
      }
    ),

    // Get a specific tab
    get: vi.fn((tabId: number, callback?: (tab: MockTab) => void): Promise<MockTab> | undefined => {
      const tab: MockTab = {
        id: tabId,
        url: 'https://example.com',
        title: 'Example',
        active: true,
        highlighted: true,
        index: 0,
        pinned: false,
        windowId: 1,
        incognito: false,
        selected: true,
      };

      if (browserType === 'firefox') {
        return Promise.resolve(tab);
      }

      if (callback) {
        callback(tab);
      }
      return undefined;
    }),

    // Create a new tab
    create: vi.fn(
      (createProperties: any, callback?: (tab: MockTab) => void): Promise<MockTab> | undefined => {
        const tab: MockTab = {
          id: Date.now(),
          active: true,
          highlighted: true,
          index: 0,
          pinned: false,
          windowId: 1,
          incognito: false,
          selected: true,
          ...createProperties,
        };

        if (browserType === 'firefox') {
          return Promise.resolve(tab);
        }

        if (callback) {
          callback(tab);
        }
        return undefined;
      }
    ),

    // Update a tab
    update: vi.fn(
      (
        tabId: number,
        updateProperties: any,
        callback?: (tab?: MockTab) => void
      ): Promise<MockTab> | undefined => {
        const tab: MockTab = {
          id: tabId,
          active: true,
          highlighted: true,
          index: 0,
          pinned: false,
          windowId: 1,
          incognito: false,
          selected: true,
          ...updateProperties,
        };

        if (browserType === 'firefox') {
          return Promise.resolve(tab);
        }

        if (callback) {
          callback(tab);
        }
        return undefined;
      }
    ),

    // Send a message to a tab
    sendMessage: vi.fn(
      (
        tabId: number,
        message: any,
        options?: any,
        callback?: (response?: any) => void
      ): Promise<any> | undefined => {
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
      }
    ),

    // Execute script in a tab
    executeScript: vi.fn(
      (
        tabId: number | any,
        details?: any,
        callback?: (result?: any[]) => void
      ): Promise<any[]> | undefined => {
        if (browserType === 'firefox') {
          return Promise.resolve([{ result: 'Script executed' }]);
        }

        if (typeof tabId === 'object') {
          callback = details as (result?: any[]) => void;
          details = tabId;
          tabId = 0; // Use default tab ID
        }

        if (callback) {
          callback([{ result: 'Script executed' }]);
        }
        return undefined;
      }
    ),

    // Events
    onCreated: createEventManager<(tab: MockTab) => void>(),
    onUpdated: createEventManager<(tabId: number, changeInfo: any, tab: MockTab) => void>(),
    onRemoved: createEventManager<(tabId: number, removeInfo: any) => void>(),
    onActivated: createEventManager<(activeInfo: any) => void>(),
  };

  // Different APIs for MV2 and MV3
  let browserAction: any = null;
  let action: any = null;

  if (manifestVersion === 2) {
    // MV2 uses browserAction
    browserAction = {
      setIcon: vi.fn((_details: any, callback?: () => void): Promise<void> | undefined => {
        if (browserType === 'firefox') {
          return Promise.resolve();
        }

        if (callback) {
          callback();
        }
        return undefined;
      }),

      setTitle: vi.fn((_details: any, callback?: () => void): Promise<void> | undefined => {
        if (browserType === 'firefox') {
          return Promise.resolve();
        }

        if (callback) {
          callback();
        }
        return undefined;
      }),

      setBadgeText: vi.fn((_details: any, callback?: () => void): Promise<void> | undefined => {
        if (browserType === 'firefox') {
          return Promise.resolve();
        }

        if (callback) {
          callback();
        }
        return undefined;
      }),

      setBadgeBackgroundColor: vi.fn(
        (_details: any, callback?: () => void): Promise<void> | undefined => {
          if (browserType === 'firefox') {
            return Promise.resolve();
          }

          if (callback) {
            callback();
          }
          return undefined;
        }
      ),

      // Event for browser action click
      onClicked: createEventManager<(tab: MockTab) => void>(),
    };
  } else {
    // MV3 uses action
    action = {
      setIcon: vi.fn((_details: any, callback?: () => void) => {
        if (browserType === 'firefox') {
          return Promise.resolve();
        }

        if (callback) {
          callback();
        }
        return undefined;
      }),

      setTitle: vi.fn((_details: any, callback?: () => void) => {
        if (browserType === 'firefox') {
          return Promise.resolve();
        }

        if (callback) {
          callback();
        }
        return undefined;
      }),

      setBadgeText: vi.fn((_details: any, callback?: () => void) => {
        if (browserType === 'firefox') {
          return Promise.resolve();
        }

        if (callback) {
          callback();
        }
        return undefined;
      }),

      setBadgeBackgroundColor: vi.fn((_details: any, callback?: () => void) => {
        if (browserType === 'firefox') {
          return Promise.resolve();
        }

        if (callback) {
          callback();
        }
        return undefined;
      }),

      // Event for action click
      onClicked: createEventManager<(tab: MockTab) => void>(),
    };
  }

  // Create the full mock API
  const mockApi: MockExtensionApi = {
    storage,
    runtime,
    tabs,
    browserAction,
    action,

    // Helper methods for testing
    _reset: (): void => {
      // Reset all mocks
      vi.resetAllMocks();

      // Clear all event listeners
      Object.values(mockApi).forEach((api: any) => {
        if (api) {
          Object.entries(api).forEach(([_, value]: [string, any]) => {
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
    _setBrowserType: (_type: string): void => {
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
