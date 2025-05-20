// WebExtension API type definitions
declare namespace browser {
  /**
   * Browser Tab interface representing a browser tab
   */
  interface Tab {
    id?: number;
    url?: string;
    title?: string;
    active?: boolean;
    index?: number;
    windowId?: number;
    highlighted?: boolean;
    incognito?: boolean;
    pinned?: boolean;
    status?: string;
    favIconUrl?: string;
    audible?: boolean;
    discarded?: boolean;
    autoDiscardable?: boolean;
    mutedInfo?: MutedInfo;
    width?: number;
    height?: number;
    sessionId?: string;
  }

  /**
   * Muted information for a tab
   */
  interface MutedInfo {
    muted: boolean;
    reason?: string;
    extensionId?: string;
  }

  /**
   * Installed details for the onInstalled event
   */
  interface InstalledDetails {
    /**
     * The reason that this event is being dispatched
     */
    reason: 'install' | 'update' | 'browser_update' | 'chrome_update';
    /**
     * Indicates the previous version of the extension, which has just been updated.
     * This is present only if 'reason' is 'update'.
     */
    previousVersion?: string;
    /**
     * Indicates whether the extension was installed temporarily.
     * This is present only if 'reason' is 'install'.
     */
    temporary?: boolean;
    /**
     * Indicates the ID of the imported shared module extension which updated.
     * This is present only if 'reason' is 'shared_module_update'.
     */
    id?: string;
  }

  /**
   * Platform information
   */
  interface PlatformInfo {
    /**
     * The operating system the browser is running on.
     */
    os: 'mac' | 'win' | 'android' | 'cros' | 'linux' | 'openbsd';
    /**
     * The architecture the browser is running on.
     */
    arch: 'arm' | 'arm64' | 'x86-32' | 'x86-64' | 'mips' | 'mips64';
    /**
     * The native client architecture. This may be different from arch on some platforms.
     */
    nacl_arch: 'arm' | 'arm64' | 'x86-32' | 'x86-64' | 'mips' | 'mips64';
  }

  /**
   * Messages sent with runtime.sendMessage or tabs.sendMessage
   */
  interface MessageSender {
    /**
     * The ID of the extension that sent the message, if sent from an extension
     */
    id?: string;
    /**
     * The tabs.Tab which opened the connection, if any
     */
    tab?: Tab;
    /**
     * The frame that opened the connection
     */
    frameId?: number;
    /**
     * The URL of the page or frame hosting the script that sent the message
     */
    url?: string;
    /**
     * The TLS channel ID of the page or frame that opened the connection, if requested by the extension
     */
    tlsChannelId?: string;
    /**
     * The origin of the page or frame that opened the connection
     */
    origin?: string;
  }

  /**
   * Browser Action API namespace
   */
  namespace browserAction {
    /**
     * Click event for the browser action
     */
    const onClicked: {
      addListener(callback: (tab?: browser.tabs.Tab) => void): void;
      removeListener(callback: (tab?: browser.tabs.Tab) => void): void;
      hasListener(callback: (tab?: browser.tabs.Tab) => void): boolean;
    };
  }

  /**
   * Runtime API namespace
   */
  namespace runtime {
    /**
     * Opens the extension's options page
     */
    function openOptionsPage(): Promise<void>;

    /**
     * Gets the manifest for the extension
     */
    function getManifest(): chrome.runtime.Manifest;

    /**
     * Gets the platform information
     */
    function getPlatformInfo(): Promise<PlatformInfo>;

    /**
     * Sends a message to the extension
     */
    function sendMessage<T = any, U = any>(message: T): Promise<U>;

    /**
     * Sends a message to the extension with a specific extension ID
     */
    function sendMessage<T = any, U = any>(extensionId: string, message: T): Promise<U>;

    /**
     * Event fired when the extension is installed or updated
     */
    const onInstalled: {
      addListener(callback: (details: InstalledDetails) => void): void;
      removeListener(callback: (details: InstalledDetails) => void): void;
      hasListener(callback: (details: InstalledDetails) => void): boolean;
    };

    /**
     * Event fired when a message is sent to the extension
     */
    const onMessage: {
      addListener(
        callback: (
          message: any,
          sender: MessageSender,
          sendResponse: (response?: any) => void
        ) => boolean | void
      ): void;
      removeListener(
        callback: (
          message: any,
          sender: MessageSender,
          sendResponse: (response?: any) => void
        ) => boolean | void
      ): void;
      hasListener(
        callback: (
          message: any,
          sender: MessageSender,
          sendResponse: (response?: any) => void
        ) => boolean | void
      ): boolean;
    };

    /**
     * Event fired when an error occurs in the extension
     */
    const onError: {
      addListener(callback: (error: Error) => void): void;
      removeListener(callback: (error: Error) => void): void;
      hasListener(callback: (error: Error) => void): boolean;
    };
  }

  /**
   * Storage API namespace
   */
  namespace storage {
    /**
     * Storage area interface
     */
    interface StorageArea {
      /**
       * Gets one or more items from storage
       */
      get<T = { [key: string]: any }>(
        keys?: string | string[] | { [key: string]: any } | null
      ): Promise<T>;

      /**
       * Sets multiple items in storage
       */
      set(items: { [key: string]: any }): Promise<void>;

      /**
       * Removes one or more items from storage
       */
      remove(keys: string | string[]): Promise<void>;

      /**
       * Removes all items from storage
       */
      clear(): Promise<void>;
    }

    /**
     * Sync storage area - synced across devices
     */
    const sync: StorageArea;

    /**
     * Local storage area - persistent but local to the device
     */
    const local: StorageArea;

    /**
     * Session storage area - persists only for the current session
     */
    const session: StorageArea;
  }

  /**
   * Tabs API namespace
   */
  namespace tabs {
    type Tab = browser.Tab;

    /**
     * Gets all tabs that match the query parameters
     */
    function query(queryInfo: {
      active?: boolean;
      audible?: boolean;
      autoDiscardable?: boolean;
      currentWindow?: boolean;
      discarded?: boolean;
      highlighted?: boolean;
      index?: number;
      muted?: boolean;
      lastFocusedWindow?: boolean;
      pinned?: boolean;
      status?: string;
      title?: string;
      url?: string | string[];
      windowId?: number;
      windowType?: string;
    }): Promise<Tab[]>;

    /**
     * Gets the tab with the specified ID
     */
    function get(tabId: number): Promise<Tab>;

    /**
     * Sends a message to the specified tab
     */
    function sendMessage<T = any, U = any>(tabId: number, message: T): Promise<U>;

    /**
     * Updates the specified tab
     */
    function update(
      tabId: number,
      updateProperties: {
        active?: boolean;
        autoDiscardable?: boolean;
        highlighted?: boolean;
        muted?: boolean;
        openerTabId?: number;
        pinned?: boolean;
        url?: string;
      }
    ): Promise<Tab>;
  }

  /**
   * WebRequest API namespace
   */
  namespace webRequest {
    /**
     * WebRequest details shared by all events
     */
    interface WebRequestDetails {
      requestId: string;
      url: string;
      method: string;
      frameId: number;
      parentFrameId: number;
      tabId: number;
      type: string;
      timeStamp: number;
      originUrl?: string;
    }

    /**
     * Event fired when a request is about to be made
     */
    const onBeforeRequest: {
      addListener(
        callback: (
          details: WebRequestDetails & {
            requestBody?: {
              raw?: { bytes: ArrayBuffer }[];
              formData?: { [key: string]: string[] };
            };
          }
        ) => void | { cancel: boolean },
        filter: { urls: string[] },
        extraInfoSpec?: string[]
      ): void;
      removeListener(callback: (details: any) => void | { cancel: boolean }): void;
      hasListener(callback: (details: any) => void | { cancel: boolean }): boolean;
    };

    /**
     * Event fired before sending headers for a request
     */
    const onBeforeSendHeaders: {
      addListener(
        callback: (
          details: WebRequestDetails & { requestHeaders?: { name: string; value: string }[] }
        ) => void | { requestHeaders?: { name: string; value: string }[] },
        filter: { urls: string[] },
        extraInfoSpec?: string[]
      ): void;
      removeListener(
        callback: (details: any) => void | { requestHeaders?: { name: string; value: string }[] }
      ): void;
      hasListener(
        callback: (details: any) => void | { requestHeaders?: { name: string; value: string }[] }
      ): boolean;
    };

    /**
     * Event fired when headers are received
     */
    const onHeadersReceived: {
      addListener(
        callback: (
          details: WebRequestDetails & {
            responseHeaders?: { name: string; value: string }[];
            statusCode: number;
            statusLine: string;
          }
        ) => void | { responseHeaders?: { name: string; value: string }[] },
        filter: { urls: string[] },
        extraInfoSpec?: string[]
      ): void;
      removeListener(
        callback: (details: any) => void | { responseHeaders?: { name: string; value: string }[] }
      ): void;
      hasListener(
        callback: (details: any) => void | { responseHeaders?: { name: string; value: string }[] }
      ): boolean;
    };

    /**
     * Event fired when a request is completed
     */
    const onCompleted: {
      addListener(
        callback: (
          details: WebRequestDetails & {
            responseHeaders?: { name: string; value: string }[];
            statusCode: number;
            statusLine: string;
            fromCache: boolean;
            ip?: string;
          }
        ) => void,
        filter: { urls: string[] },
        extraInfoSpec?: string[]
      ): void;
      removeListener(callback: (details: any) => void): void;
      hasListener(callback: (details: any) => void): boolean;
    };

    /**
     * Event fired when a request errors
     */
    const onErrorOccurred: {
      addListener(
        callback: (details: WebRequestDetails & { error: string }) => void,
        filter: { urls: string[] }
      ): void;
      removeListener(callback: (details: any) => void): void;
      hasListener(callback: (details: any) => void): boolean;
    };
  }
}

// Chrome extension API compatibility
interface Chrome {
  /**
   * Runtime namespace for manifest and message handling
   */
  runtime: {
    /**
     * Opens the extension's options page
     */
    openOptionsPage(callback?: () => void): void;

    /**
     * Gets the manifest for the extension
     */
    getManifest(): chrome.runtime.Manifest;

    /**
     * Gets platform information
     */
    getPlatformInfo(callback: (platformInfo: browser.PlatformInfo) => void): void;

    /**
     * Sends a message to the extension
     */
    sendMessage<T = any>(message: T, callback?: (response: any) => void): void;

    /**
     * Sends a message to a specific extension
     */
    sendMessage<T = any>(extensionId: string, message: T, callback?: (response: any) => void): void;

    /**
     * Last error that occurred
     */
    lastError?: {
      message?: string;
    };

    /**
     * Event fired when the extension is installed or updated
     */
    onInstalled?: {
      addListener(callback: (details: browser.InstalledDetails) => void): void;
      removeListener(callback: (details: browser.InstalledDetails) => void): void;
      hasListener(callback: (details: browser.InstalledDetails) => void): boolean;
    };

    /**
     * Event fired when a message is sent to the extension
     */
    onMessage?: {
      addListener(
        callback: (
          message: any,
          sender: browser.MessageSender,
          sendResponse: (response?: any) => void
        ) => boolean | void
      ): void;
      removeListener(
        callback: (
          message: any,
          sender: browser.MessageSender,
          sendResponse: (response?: any) => void
        ) => boolean | void
      ): void;
      hasListener(
        callback: (
          message: any,
          sender: browser.MessageSender,
          sendResponse: (response?: any) => void
        ) => boolean | void
      ): boolean;
    };

    /**
     * Event fired when an error occurs
     */
    onError?: {
      addListener(callback: (error: Error) => void): void;
      removeListener(callback: (error: Error) => void): void;
      hasListener(callback: (error: Error) => void): boolean;
    };
  };

  /**
   * Browser action API (for Manifest V2)
   */
  browserAction: {
    /**
     * Event fired when the browser action icon is clicked
     */
    onClicked: {
      addListener(callback: (tab?: browser.tabs.Tab) => void): void;
      removeListener(callback: (tab?: browser.tabs.Tab) => void): void;
      hasListener(callback: (tab?: browser.tabs.Tab) => void): boolean;
    };
  };

  /**
   * Action API (for Manifest V3)
   */
  action: {
    /**
     * Event fired when the action icon is clicked
     */
    onClicked: {
      addListener(callback: (tab?: browser.tabs.Tab) => void): void;
      removeListener(callback: (tab?: browser.tabs.Tab) => void): void;
      hasListener(callback: (tab?: browser.tabs.Tab) => void): boolean;
    };
  };

  /**
   * Tabs API
   */
  tabs: {
    /**
     * Queries for tabs that match the specified criteria
     */
    query(
      queryInfo: {
        active?: boolean;
        audible?: boolean;
        autoDiscardable?: boolean;
        currentWindow?: boolean;
        discarded?: boolean;
        highlighted?: boolean;
        index?: number;
        muted?: boolean;
        lastFocusedWindow?: boolean;
        pinned?: boolean;
        status?: string;
        title?: string;
        url?: string | string[];
        windowId?: number;
        windowType?: string;
      },
      callback: (tabs: browser.tabs.Tab[]) => void
    ): void;

    /**
     * Gets the tab with the specified ID
     */
    get(tabId: number, callback: (tab: browser.tabs.Tab) => void): void;

    /**
     * Sends a message to a specific tab
     */
    sendMessage<T = any>(tabId: number, message: T, callback?: (response: any) => void): void;

    /**
     * Updates the specified tab
     */
    update(
      tabId: number,
      updateProperties: {
        active?: boolean;
        autoDiscardable?: boolean;
        highlighted?: boolean;
        muted?: boolean;
        openerTabId?: number;
        pinned?: boolean;
        url?: string;
      },
      callback?: (tab?: browser.tabs.Tab) => void
    ): void;
  };

  /**
   * Storage API
   */
  storage: {
    /**
     * Sync storage area - synced across devices
     */
    sync: {
      /**
       * Gets one or more items from storage
       */
      get<T = { [key: string]: any }>(
        keys: string | string[] | { [key: string]: any } | null,
        callback: (items: T) => void
      ): void;

      /**
       * Sets multiple items in storage
       */
      set(items: { [key: string]: any }, callback?: () => void): void;

      /**
       * Removes one or more items from storage
       */
      remove(keys: string | string[], callback?: () => void): void;

      /**
       * Removes all items from storage
       */
      clear(callback?: () => void): void;
    };

    /**
     * Local storage area - persistent but local to the device
     */
    local: {
      /**
       * Gets one or more items from storage
       */
      get<T = { [key: string]: any }>(
        keys: string | string[] | { [key: string]: any } | null,
        callback: (items: T) => void
      ): void;

      /**
       * Sets multiple items in storage
       */
      set(items: { [key: string]: any }, callback?: () => void): void;

      /**
       * Removes one or more items from storage
       */
      remove(keys: string | string[], callback?: () => void): void;

      /**
       * Removes all items from storage
       */
      clear(callback?: () => void): void;
    };
  };

  /**
   * Web Request API
   */
  webRequest?: {
    /**
     * Event fired when a request is about to be made
     */
    onBeforeRequest: {
      addListener(
        callback: (
          details: browser.webRequest.WebRequestDetails & {
            requestBody?: {
              raw?: { bytes: ArrayBuffer }[];
              formData?: { [key: string]: string[] };
            };
          }
        ) => void | { cancel: boolean },
        filter: { urls: string[] },
        extraInfoSpec?: string[]
      ): void;
      removeListener(callback: (details: any) => void | { cancel: boolean }): void;
      hasListener(callback: (details: any) => void | { cancel: boolean }): boolean;
    };

    /**
     * Event fired before sending headers for a request
     */
    onBeforeSendHeaders: {
      addListener(
        callback: (
          details: browser.webRequest.WebRequestDetails & {
            requestHeaders?: { name: string; value: string }[];
          }
        ) => void | { requestHeaders?: { name: string; value: string }[] },
        filter: { urls: string[] },
        extraInfoSpec?: string[]
      ): void;
      removeListener(
        callback: (details: any) => void | { requestHeaders?: { name: string; value: string }[] }
      ): void;
      hasListener(
        callback: (details: any) => void | { requestHeaders?: { name: string; value: string }[] }
      ): boolean;
    };

    /**
     * Event fired when headers are received
     */
    onHeadersReceived: {
      addListener(
        callback: (
          details: browser.webRequest.WebRequestDetails & {
            responseHeaders?: { name: string; value: string }[];
            statusCode: number;
            statusLine: string;
          }
        ) => void | { responseHeaders?: { name: string; value: string }[] },
        filter: { urls: string[] },
        extraInfoSpec?: string[]
      ): void;
      removeListener(
        callback: (details: any) => void | { responseHeaders?: { name: string; value: string }[] }
      ): void;
      hasListener(
        callback: (details: any) => void | { responseHeaders?: { name: string; value: string }[] }
      ): boolean;
    };

    /**
     * Event fired when a request is completed
     */
    onCompleted: {
      addListener(
        callback: (
          details: browser.webRequest.WebRequestDetails & {
            responseHeaders?: { name: string; value: string }[];
            statusCode: number;
            statusLine: string;
            fromCache: boolean;
            ip?: string;
          }
        ) => void,
        filter: { urls: string[] },
        extraInfoSpec?: string[]
      ): void;
      removeListener(callback: (details: any) => void): void;
      hasListener(callback: (details: any) => void): boolean;
    };

    /**
     * Event fired when a request errors
     */
    onErrorOccurred: {
      addListener(
        callback: (details: browser.webRequest.WebRequestDetails & { error: string }) => void,
        filter: { urls: string[] }
      ): void;
      removeListener(callback: (details: any) => void): void;
      hasListener(callback: (details: any) => void): boolean;
    };
  };
}

declare const chrome: Chrome;

/**
 * Manifest interface for browser extension manifest.json
 */
declare namespace chrome.runtime {
  interface Manifest {
    // Required fields
    manifest_version: number;
    name: string;
    version: string;

    // Optional fields
    action?: {
      default_icon?: string | { [size: string]: string };
      default_title?: string;
      default_popup?: string;
    };
    author?: string;
    background?: {
      service_worker?: string;
      scripts?: string[];
      page?: string;
      persistent?: boolean;
    };
    browser_action?: {
      default_icon?: string | { [size: string]: string };
      default_title?: string;
      default_popup?: string;
    };
    chrome_url_overrides?: {
      bookmarks?: string;
      history?: string;
      newtab?: string;
    };
    commands?: {
      [name: string]: {
        suggested_key?: {
          default?: string;
          mac?: string;
          windows?: string;
          chromeos?: string;
          linux?: string;
        };
        description?: string;
      };
    };
    content_scripts?: Array<{
      matches: string[];
      css?: string[];
      js?: string[];
      match_about_blank?: boolean;
      run_at?: 'document_start' | 'document_end' | 'document_idle';
      all_frames?: boolean;
      include_globs?: string[];
      exclude_globs?: string[];
    }>;
    content_security_policy?:
      | {
          extension_pages?: string;
          sandbox?: string;
        }
      | string;
    description?: string;
    devtools_page?: string;
    host_permissions?: string[];
    homepage_url?: string;
    icons?: { [size: string]: string };
    incognito?: 'spanning' | 'split' | 'not_allowed';
    minimum_chrome_version?: string;
    offline_enabled?: boolean;
    omnibox?: {
      keyword: string;
    };
    optional_permissions?: string[];
    options_page?: string;
    options_ui?: {
      page?: string;
      open_in_tab?: boolean;
      chrome_style?: boolean;
    };
    permissions?: string[];
    storage?: {
      managed_schema?: string;
    };
    update_url?: string;
    version_name?: string;
    web_accessible_resources?:
      | Array<{
          resources: string[];
          matches: string[];
        }>
      | string[];
  }
}

// DOM extensions
interface Node {
  // _trumpProcessed is still needed for text nodes as they can't have data attributes
  _trumpProcessed?: boolean;
  id?: string;
  nodeType: number;
  hasAttribute?: (name: string) => boolean;
  setAttribute?: (name: string, value: string) => void;
  getAttribute?: (name: string) => string | null;
  removeAttribute?: (name: string) => void;
  querySelectorAll?: (selectors: string) => NodeListOf<Element>;
  style?: CSSStyleDeclaration;
}

interface Text {
  // _trumpProcessed is still needed for text nodes as they can't have data attributes
  _trumpProcessed?: boolean;
}

interface ParentNode {
  // No custom properties needed - using data-tg-processed attribute instead
}

/**
 * Logger interface for the Logger module
 */
interface LoggerInterface {
  // Configuration
  configure: (options?: object) => object;
  enableDebugMode: () => void;
  disableDebugMode: () => void;

  // Core logging methods
  debug: (message: string, data?: any) => void;
  info: (message: string, data?: any) => void;
  warn: (message: string, data?: any) => void;
  error: (message: string, data?: any) => void;

  // Error protection
  protect: <T, R>(fn: (...args: T[]) => R, context: string, fallback?: R) => (...args: T[]) => R;
  protectAsync: <T, R>(
    fn: (...args: T[]) => Promise<R>,
    context: string,
    fallback?: R
  ) => (...args: T[]) => Promise<R>;

  // Performance monitoring
  time: (operationName: string) => { stop: (status?: string, additionalData?: object) => number };

  // Statistics
  getStats: () => {
    counts: { [level: string]: number };
    lastError: string | null;
    lastErrorTime: Date | null;
  };
  resetStats: () => void;

  // Constants
  LEVELS: {
    DEBUG: string;
    INFO: string;
    WARN: string;
    ERROR: string;
  };
}

/**
 * ErrorHandler interface for the ErrorHandler module
 */
interface ErrorHandlerInterface {
  initialize: (options?: object) => boolean;
  configure: (options?: object) => object;
  disable: () => void;
  reportError: (error: Error, source?: string) => void;
  getErrorHistory: () => Array<object>;
  getStats: () => {
    errorCount: number;
    recentErrors: number;
    isEnabled: boolean;
    maxErrors: number;
  };
  resetStats: () => void;
}

/**
 * BrowserDetect interface for the BrowserDetect module
 */
interface BrowserDetectInterface {
  // Browser information
  getBrowser: () => string;
  isChrome: () => boolean;
  isFirefox: () => boolean;
  isEdge: () => boolean;
  isSafari: () => boolean;
  getVersion: () => number | null;
  getManifestVersion: () => number;

  // Feature detection
  hasFeature: (featureName: string) => boolean;
  hasPromiseAPI: () => boolean;
  getDebugInfo: () => {
    name: string;
    version: number | null;
    manifestVersion: number;
    userAgent: string;
    features: {
      promises: boolean;
      mutationObserver: boolean;
      matchMedia: boolean;
      webRequest: boolean;
      localStorage: boolean;
      serviceWorker: boolean;
      shadowDom: boolean;
    };
  };

  // Constants
  BROWSERS: {
    CHROME: string;
    FIREFOX: string;
    EDGE: string;
    SAFARI: string;
    OPERA: string;
    UNKNOWN: string;
  };
  MANIFEST: {
    V2: number;
    V3: number;
  };
  FEATURES: {
    PROMISES: string;
    MUTATION_OBSERVER: string;
    MATCH_MEDIA: string;
    WEB_REQUEST: string;
    LOCAL_STORAGE: string;
    SERVICE_WORKER: string;
    SHADOW_DOM: string;
  };
}

/**
 * BrowserAdapter interface for the BrowserAdapter module
 */
interface BrowserAdapterInterface {
  initialize: (options?: { debug?: boolean; callbackTimeout?: number }) => boolean;
  getAPI: () => any; // Chrome or browser object
  usesPromises: () => boolean;
  promisify: <T>(apiFunction: Function, ...args: any[]) => Promise<T>;
  openOptionsPage: () => Promise<void>;
  getManifest: () => any;
  addIconClickListener: (callback: (tab?: browser.tabs.Tab) => void) => boolean;
  getStorageItem: <T>(keys: string | string[] | object) => Promise<T>;
  setStorageItem: (items: { [key: string]: any }) => Promise<void>;
  sendMessageToTab: <T>(tabId: number, message: any) => Promise<T>;
  sendMessage: <T>(message: any) => Promise<T>;
  addMessageListener: (
    callback: (message: any, sender: any, sendResponse: Function) => void
  ) => boolean;
  addInstallListener: (callback: (details: any) => void) => boolean;
  getDebugInfo: () => {
    browser: string;
    version: string | number;
    manifestVersion: string | number;
    apiType: string;
    apis: {
      storage: boolean;
      tabs: boolean;
      runtime: boolean;
      action: boolean;
      browserAction: boolean;
      userAgent: string;
    };
  };
}

/**
 * TrumpMappings interface for the TrumpMappings module
 */
interface TrumpMappingsInterface {
  getReplacementMap: () => { [key: string]: TrumpMapping };
  getKeys: () => string[];
}

/**
 * TextProcessor interface for the TextProcessor module
 */
/**
 * Text segment conversion information for a portion of text that needs to be converted
 */
interface TextSegmentConversion {
  /** The original text before conversion */
  readonly originalText: string;
  /** The converted text to display */
  readonly convertedText: string;
  /** Starting index within the original text node */
  readonly startIndex: number;
  /** Ending index within the original text node */
  readonly endIndex: number;
}

interface TextProcessorInterface {
  // Core text processing methods
  processText: (
    text: string,
    replacementMap: ReplacementMap,
    mapKeys: string[],
    options?: ProcessOptions
  ) => string;
  processTextAsync: (
    text: string,
    replacementMap: ReplacementMap,
    mapKeys: string[],
    options?: ProcessOptions
  ) => Promise<string>;
  processTextNode: (
    textNode: Text,
    replacementMap: ReplacementMap,
    mapKeys: string[],
    options?: ProcessOptions
  ) => boolean | Promise<boolean>;

  /**
   * Processes a text node content and returns an array of segments that need conversion.
   * Does NOT modify the DOM.
   *
   * @param textNodeContent - The text content to process
   * @param replacementMap - The map of replacements to apply
   * @param mapKeys - The keys of the replacement map to use
   * @returns An array of text segments that need conversion
   */
  identifyConversableSegments?: (
    textNodeContent: string,
    replacementMap: ReplacementMap,
    mapKeys: string[]
  ) => TextSegmentConversion[];

  // Pattern optimization
  precompilePatterns: (replacementMap: ReplacementMap) => ReplacementMap;

  // Cache management
  clearCache: () => void;
  getCacheStats: () => CacheStats;

  // Optimization helpers
  isLikelyToContainMatches: (
    text: string,
    replacementMap: ReplacementMap,
    mapKeys: string[]
  ) => boolean;

  // Configuration
  config: {
    LARGE_TEXT_THRESHOLD: number;
    CHUNK_SIZE: number;
    PROCESSING_DELAY_MS: number;
    MAX_CACHE_SIZE: number;
  };
}

/**
 * MutationObserverManager interface for the MutationObserver module
 */
interface MutationObserverManagerInterface {
  initialize: (customOptions?: any) => boolean;
  start: (target: Node, config?: MutationObserverInit) => boolean;
  stop: () => void;
  pause: () => boolean;
  resume: () => boolean;
  flush: () => boolean;
  isActive: () => boolean;
  getState: () => string;
  getPendingCount: () => number;
  updateOptions: (newOptions: any) => any;
  STATES: {
    INACTIVE: string;
    ACTIVE: string;
    PAUSED: string;
    PROCESSING: string;
  };
}

/**
 * Process options for text processing
 */
interface ProcessOptions {
  useCache?: boolean;
  earlyBailout?: boolean;
  precompilePatterns?: boolean;
  async?: boolean;
  onProcessed?: (textNode: Text, originalText: string, processedText: string) => void;
}

/**
 * Cache statistics interface
 */
interface CacheStats {
  size: number;
  hits: number;
  misses: number;
  hitRate: number;
}

/**
 * Replacement map for text processing
 */
interface ReplacementMap {
  [key: string]: TrumpMapping;
}

/**
 * DOMModifier interface for modifying DOM elements with text conversions
 */
interface DOMModifierInterface {
  /**
   * Processes a text node, replacing segments based on conversion info.
   * Wraps converted segments in spans with data attributes.
   * Returns true if modifications were made, false otherwise.
   *
   * @param textNode - The text node to process
   * @param segments - The segments to convert and wrap
   * @returns True if modifications were made, false otherwise
   */
  processTextNodeAndWrapSegments(textNode: Text, segments: TextSegmentConversion[]): boolean;
}

/**
 * TooltipUI interface for managing tooltip DOM element
 */
interface TooltipUIInterface {
  /**
   * Ensures the tooltip DOM element is created and ready.
   */
  ensureCreated(): void;

  /**
   * Sets the text content of the tooltip. Must use textContent for security.
   *
   * @param text - The text to display in the tooltip
   */
  setText(text: string): void;

  /**
   * Calculates and applies the tooltip's position relative to the target element,
   * avoiding viewport overflow.
   *
   * @param targetElement - The element the tooltip should be positioned relative to
   */
  updatePosition(targetElement: HTMLElement): void;

  /**
   * Makes the tooltip visible and updates ARIA attributes.
   */
  show(): void;

  /**
   * Hides the tooltip and updates ARIA attributes.
   */
  hide(): void;

  /**
   * Removes the tooltip element from the DOM.
   */
  destroy(): void;

  /**
   * Returns the ID of the tooltip element for ARIA linking.
   *
   * @returns The ID of the tooltip element
   */
  getId(): string;

  /**
   * Gets debug information about the tooltip component and browser support.
   *
   * @returns Debug information object
   */
  getDebugInfo?(): {
    isCreated: boolean;
    tooltipElement: {
      id: string;
      isVisible: boolean;
      zIndex: string;
    } | null;
    constants: {
      TOOLTIP_ID: string;
      TOOLTIP_Z_INDEX: number;
      TOOLTIP_MAX_WIDTH: number;
      TOOLTIP_MAX_HEIGHT: number;
    };
    browserAdapter?: {
      browser: string;
      version: number | null;
      features: {
        highZIndex: boolean;
        pointerEvents: boolean;
        transitions: boolean;
        visibilityAPI: boolean;
      };
      appliedStyles: {
        zIndex: number;
        transitionProperty: string;
      };
    };
  };
}

/**
 * TooltipManager interface for managing tooltip lifecycle and events
 */
interface TooltipManagerInterface {
  /**
   * Initializes event listeners and dependencies.
   *
   * @param tooltipUI - The TooltipUI instance to use
   */
  initialize(tooltipUI: TooltipUIInterface): void;

  /**
   * Cleans up event listeners and resources.
   */
  dispose(): void;
}

/**
 * TooltipBrowserAdapter interface for browser-specific tooltip adaptations
 */
interface TooltipBrowserAdapterInterface {
  /**
   * Gets the appropriate z-index value based on browser support
   *
   * @returns The appropriate z-index value
   */
  getSafeZIndex(): number;

  /**
   * Applies browser-specific styles to the tooltip element
   *
   * @param tooltipElement - The tooltip element to style
   */
  applyBrowserSpecificStyles(tooltipElement: HTMLElement): void;

  /**
   * Converts a CSS string to be compatible with the current browser
   *
   * @param cssText - The CSS text to convert
   * @returns Browser-compatible CSS text
   */
  convertCssForBrowser(cssText: string): string;

  /**
   * Registers browser-specific event listeners
   *
   * @param tooltipElement - The tooltip element ID or element
   * @param showCallback - Callback to show the tooltip
   * @param hideCallback - Callback to hide the tooltip
   * @returns Function to remove the event listeners
   */
  registerBrowserEvents(
    tooltipId: string,
    showCallback: Function,
    hideCallback: Function
  ): Function;

  /**
   * Gets the default tooltip styles as a string adjusted for the current browser
   *
   * @returns CSS styles for the tooltip
   */
  getDefaultTooltipStyles(): string;

  /**
   * Gets browser compatibility information for debugging
   *
   * @returns Browser compatibility information
   */
  getDebugInfo(): {
    browser: string;
    version: number | null;
    features: {
      highZIndex: boolean;
      pointerEvents: boolean;
      transitions: boolean;
      visibilityAPI: boolean;
    };
    appliedStyles: {
      zIndex: number;
      transitionProperty: string;
    };
  };
}

// Window extensions
/**
 * SecurityUtils interface for utility functions related to security
 */
interface SecurityUtilsInterface {
  /**
   * Escapes HTML special characters in a string to prevent XSS in contexts
   * where the string might be interpreted as HTML (e.g., log viewers)
   */
  escapeHTML: (str: string | null | undefined) => string;
}

interface Window {
  trumpVersion?: string;
  trumpGogglesInitialized?: boolean;
  trumpProcessedNodes?: WeakSet<Node>;
  trumpObserver?: MutationObserver;
  errorHandlerInitialized?: boolean;

  // Module exports
  Logger?: LoggerInterface;
  ErrorHandler?: ErrorHandlerInterface;
  BrowserDetect?: BrowserDetectInterface;
  BrowserAdapter?: BrowserAdapterInterface;
  TrumpMappings?: TrumpMappingsInterface;
  DOMProcessor?: any;
  DOMModifier?: DOMModifierInterface;
  TextProcessor?: TextProcessorInterface;
  MutationObserverManager?: MutationObserverManagerInterface;
  TooltipUI?: TooltipUIInterface;
  TooltipManager?: TooltipManagerInterface;
  TooltipBrowserAdapter?: TooltipBrowserAdapterInterface;
  SecurityUtils?: SecurityUtilsInterface;
  tooltipManagerBrowserEventsCleanup?: Function;
  TrumpGoggles?: any;

  // Legacy functions
  buildTrumpMap?: (() => TrumpMappingObject) & (() => { [key: string]: TrumpMapping });
}

// Performance extensions
interface Performance {
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit?: number;
  };
}

// Define TrumpMapping type for content.js and content-fixed.js
interface TrumpMapping {
  regex: RegExp;
  nick: string;
  keyTerms?: string[];
  matchesPartialWords?: boolean;
}

// Define TrumpMappingObject type
interface TrumpMappingObject {
  [key: string]: TrumpMapping;
}

// Extended Error Interface
interface Error {
  fileName?: string;
  lineNumber?: number;
  columnNumber?: number;
  code?: string;
  reason?: any;
}
