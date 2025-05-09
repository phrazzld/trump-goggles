// WebExtension API type definitions
declare namespace browser {
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
  }

  namespace browserAction {
    const onClicked: {
      addListener(callback: (tab?: browser.tabs.Tab) => void): void;
      removeListener(callback: (tab?: browser.tabs.Tab) => void): void;
      hasListener(callback: (tab?: browser.tabs.Tab) => void): boolean;
    };
  }

  namespace runtime {
    function openOptionsPage(): Promise<void>;
  }

  namespace tabs {
    type Tab = browser.Tab;
  }
}

// Chrome extension API compatibility
interface Chrome {
  browserAction: {
    onClicked: {
      addListener(callback: (tab?: browser.tabs.Tab) => void): void;
      removeListener(callback: (tab?: browser.tabs.Tab) => void): void;
      hasListener(callback: (tab?: browser.tabs.Tab) => void): boolean;
    };
  };
  // Manifest V3 action
  action: {
    onClicked: {
      addListener(callback: (tab?: browser.tabs.Tab) => void): void;
      removeListener(callback: (tab?: browser.tabs.Tab) => void): void;
      hasListener(callback: (tab?: browser.tabs.Tab) => void): boolean;
    };
  };
  runtime: {
    openOptionsPage(callback?: () => void): void;
    getManifest?(): any;
    lastError?: {
      message?: string;
    };
    onInstalled?: {
      addListener(callback: (details: any) => void): void;
    };
    onError?: {
      addListener(callback: (error: Error) => void): void;
    };
  };
  tabs: {
    query(queryInfo: object, callback: (tabs: browser.tabs.Tab[]) => void): void;
  };
  storage: {
    sync: {
      get: (keys: any, callback: (items: { [key: string]: any }) => void) => void;
      set: (items: { [key: string]: any }, callback?: () => void) => void;
    };
  };
  webRequest?: any;
}

declare const chrome: Chrome;

// DOM extensions
interface Node {
  _trumpGogglesProcessed?: boolean;
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
  _trumpGogglesProcessed?: boolean;
  _trumpProcessed?: boolean;
}

interface ParentNode {
  _trumpGogglesProcessed?: boolean;
  _trumpProcessed?: boolean;
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
  protectAsync: <T, R>(fn: (...args: T[]) => Promise<R>, context: string, fallback?: R) => (...args: T[]) => Promise<R>;

  // Performance monitoring
  time: (operationName: string) => { stop: (status?: string, additionalData?: object) => number };

  // Statistics
  getStats: () => { counts: { [level: string]: number }, lastError: string | null, lastErrorTime: Date | null };
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
  addMessageListener: (callback: (message: any, sender: any, sendResponse: Function) => void) => boolean;
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

// Window extensions
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
  TextProcessor?: any;
  MutationObserverManager?: any;
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