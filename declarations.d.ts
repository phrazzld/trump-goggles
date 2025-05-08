/**
 * Global type declarations for Trump Goggles extension
 * 
 * This file contains TypeScript declarations for globals and browser extension APIs
 * used throughout the Trump Goggles codebase.
 */

// ===== Service Worker Context =====

// Service worker self context
declare interface ServiceWorkerGlobalScope {
  BrowserDetect: typeof BrowserDetect;
  BrowserAdapter: typeof BrowserAdapter;
  BackgroundLogger: typeof BackgroundLogger;
}

// ===== Browser Extension APIs =====

// Platform information interface
interface PlatformInfo {
  os: string;
  arch: string;
  nacl_arch: string;
}

// Error listener type
interface ErrorListener {
  addListener: (callback: (error: Error) => void) => void;
  removeListener: (callback: (error: Error) => void) => void;
  hasListener: (callback: (error: Error) => void) => boolean;
}

// Firefox Browser API extensions
declare namespace browser {
  namespace runtime {
    function getPlatformInfo(): Promise<PlatformInfo>;
    const onError: ErrorListener;
    function getManifest(): any;
    function openOptionsPage(): Promise<void>;
  }
  
  namespace storage {
    interface StorageArea {
      get(keys?: string | string[] | Record<string, any>): Promise<Record<string, any>>;
      set(items: Record<string, any>): Promise<void>;
    }
    const sync: StorageArea;
  }

  namespace action {
    const onClicked: {
      addListener: (callback: (tab: any) => void) => void;
    };
  }

  namespace browserAction {
    const onClicked: {
      addListener: (callback: (tab: any) => void) => void;
    };
  }
  
  const webRequest: {
    onBeforeRequest: any;
    onBeforeSendHeaders: any;
    onHeadersReceived: any;
  };
}

// Chrome Browser API extensions
declare namespace chrome {
  namespace runtime {
    function getPlatformInfo(callback: (platformInfo: PlatformInfo) => void): void;
    const onError: ErrorListener;
    function getManifest(): any;
    const lastError: Error | undefined;
    function openOptionsPage(callback?: () => void): void;
    const onInstalled: {
      addListener: (callback: (details: { reason: string, previousVersion?: string }) => void) => void;
    };
  }
  
  namespace storage {
    interface StorageArea {
      get(keys: string | string[] | Record<string, any>, callback: (items: Record<string, any>) => void): void;
      set(items: Record<string, any>, callback?: () => void): void;
    }
    const sync: StorageArea;
  }

  namespace action {
    const onClicked: {
      addListener: (callback: (tab: any) => void) => void;
    };
  }

  namespace browserAction {
    const onClicked: {
      addListener: (callback: (tab: any) => void) => void;
    };
  }
  
  const webRequest: {
    onBeforeRequest: any;
    onBeforeSendHeaders: any;
    onHeadersReceived: any;
  };
}

// ===== Browser Detect Module =====
interface BrowserDetectInterface {
  BROWSERS: {
    CHROME: string;
    FIREFOX: string;
    EDGE: string;
    SAFARI: string;
    OPERA: string;
    UNKNOWN: string;
  };
  FEATURES: {
    PROMISES: string;
    WEB_REQUEST: string;
  };
  getBrowser(): string;
  isFirefox(): boolean;
  isChrome(): boolean;
  isEdge?(): boolean;
  isSafari?(): boolean;
  getVersion(): string | number | null;
  getManifestVersion(): number;
  supportsFeature?(feature: string): boolean;
  hasFeature?(featureName: string): boolean;
  hasPromiseAPI(): boolean;
  getDebugInfo?(): any;
}

// ===== Browser Adapter Module =====
interface BrowserAdapterInterface {
  initialize(options?: { debug?: boolean, callbackTimeout?: number }): boolean;
  getAPI(): any;
  usesPromises(): boolean;
  promisify(apiFunction: Function, ...args: any[]): Promise<any>;
  openOptionsPage(): Promise<void>;
  getManifest(): any;
  addIconClickListener(callback: Function): boolean;
  getStorageItem(keys: string | string[] | Record<string, any>): Promise<Record<string, any>>;
  setStorageItem(items: Record<string, any>): Promise<void>;
  addInstallListener(callback: Function): boolean;
  getDebugInfo(): any;
}

// ===== Text Processor Module =====
interface TextProcessorInterface {
  processText(text: string, replacementMap: any, mapKeys: string[], options?: any): string;
  processTextAsync(text: string, replacementMap: any, mapKeys: string[], options?: any): Promise<string>;
  processTextNode(textNode: Text, replacementMap: any, mapKeys: string[], options?: any): boolean | Promise<boolean>;
  precompilePatterns(replacementMap: any): any;
  clearCache(): void;
  getCacheStats(): any;
  isLikelyToContainMatches(text: string, replacementMap: any, mapKeys: string[]): boolean;
  config: {
    LARGE_TEXT_THRESHOLD: number;
    CHUNK_SIZE: number;
    PROCESSING_DELAY_MS: number;
    MAX_CACHE_SIZE: number;
  };
}

// ===== DOM Processor Module =====
interface DOMProcessorInterface {
  processInChunks(root: Node, callback: Function, options?: any): Promise<number>;
  isEditableNode(node: Node): boolean;
  isProcessed(node: Node): boolean;
  markProcessed(node: Node): void;
  resetProcessedState(root: Node): void;
  DEFAULT_SKIP_TAGS: string[];
  traverseDOM(rootNode: Node, textNodeCallback: Function, options?: any): void;
  PROCESSED_ATTR: string;
}

// ===== Mutation Observer Manager =====
interface MutationObserverManagerInterface {
  initialize(options: any): boolean;
  start(target: Node, options: MutationObserverInit): boolean;
  stop(): void;
  pause(): boolean;
  resume(): boolean;
  isActive(): boolean;
  getState(): string;
  getPendingCount(): number;
  STATES: {
    INACTIVE: string;
    ACTIVE: string;
    PAUSED: string;
  };
}

// ===== Logger Module =====
interface LoggerInterface {
  LEVELS: {
    DEBUG: any;
    INFO: any;
    WARN: any;
    ERROR: any;
  };
  configure(options: any): any;
  debug(message: string, data?: any): void;
  info(message: string, data?: any): void;
  warn(message: string, data?: any): void;
  error(message: string, data?: any): void;
  time(label: string): { stop: (status: string, data?: any) => void };
  protect(fn: Function, description: string, fallback?: any): Function;
  protectAsync(fn: Function, description: string, fallback?: any): Function;
  getStats(): any;
  resetStats(): void;
  enableDebugMode(): void;
  disableDebugMode(): void;
}

// ===== Trump Goggles Module =====
interface TrumpGogglesInterface {
  initialize(): void;
  enable(): void;
  disable(): void;
  isEnabled(): boolean;
  process(options?: any): Promise<number>;
  reprocessAll(root?: Node): Promise<number>;
  enableDebugMode(): void;
  disableDebugMode(): void;
  getDiagnostics(): any;
}

// ===== Trump Mappings Module =====
interface TrumpMappingsInterface {
  getReplacementMap(): any;
  getKeys(): string[];
}

// ===== Global Declarations =====

// Explicitly declare globals for accessing browser APIs
declare var browser: typeof browser;
declare var chrome: typeof chrome;

// Declare module globals for type checking but use 'var' to 
// prevent block-scoped redeclaration errors
declare var BrowserDetect: BrowserDetectInterface;
declare var BrowserAdapter: BrowserAdapterInterface;
declare var BackgroundLogger: any;

// ===== Window Extensions =====

// Extend Window interface for globals shared between content scripts
interface Window {
  // Extension modules
  Logger?: LoggerInterface;
  ErrorHandler?: any;
  BrowserDetect?: BrowserDetectInterface;
  BrowserAdapter?: BrowserAdapterInterface;
  BackgroundLogger?: any;
  TrumpMappings?: TrumpMappingsInterface;
  TrumpGoggles?: TrumpGogglesInterface;
  DOMProcessor?: DOMProcessorInterface;
  TextProcessor?: TextProcessorInterface;
  MutationObserverManager?: MutationObserverManagerInterface;
  
  // Extension state
  trumpGogglesInitialized?: boolean;
  trumpProcessedNodes?: WeakSet<Node>;
  trumpObserver?: MutationObserver;
  
  // Legacy globals
  buildTrumpMap?: () => any;
}