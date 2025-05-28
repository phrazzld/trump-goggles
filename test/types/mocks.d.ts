/**
 * Type definitions for test mock objects
 * This file contains interfaces for mocks used in tests
 */

import { Mock } from 'vitest';

/**
 * Generic Mock type for Vitest functions
 */
export type VitestMock<T extends (...args: any[]) => any> = Mock<T>;

/**
 * Interface for mock elements used in test files
 * This is a simplified version of HTMLElement for testing
 */
export interface MockHTMLElement {
  tagName: string;
  style: Record<string, string>;
  attributes: Record<string, string>;
  className?: string;
  id?: string;
  children: MockHTMLElement[];
  childNodes: (MockHTMLElement | MockText)[];
  parentNode: MockHTMLElement | null;
  dataset: Record<string, string>;
  textContent: string | null;
  innerHTML: string;
  outerHTML: string;

  // Methods
  setAttribute(name: string, value: string): void;
  getAttribute(name: string): string | null;
  removeAttribute(name: string): void;
  hasAttribute(name: string): boolean;

  appendChild<T extends Node>(node: T): T;
  removeChild<T extends Node>(node: T): T;

  addEventListener(
    type: string,
    listener: EventListener,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListener,
    options?: boolean | EventListenerOptions
  ): void;

  querySelector(selectors: string): MockHTMLElement | null;
  querySelectorAll(selectors: string): NodeListOf<MockHTMLElement>;

  closest(selectors: string): MockHTMLElement | null;
  matches(selectors: string): boolean;

  getBoundingClientRect(): DOMRect;
}

/**
 * Interface for mock text nodes
 */
export interface MockText {
  nodeType: number;
  nodeValue: string | null;
  textContent: string | null;
  parentNode: MockHTMLElement | null;

  // Trump Goggles specific properties
  _trumpProcessed?: boolean;
  data?: string;
}

/**
 * Interface for mock document in tests
 */
export interface MockDocument {
  documentElement: MockHTMLElement;
  body: MockHTMLElement;
  head: MockHTMLElement;

  createElement(tagName: string): MockHTMLElement;
  createTextNode(data: string): MockText;
  createComment(data: string): Comment;

  getElementById(id: string): MockHTMLElement | null;
  getElementsByTagName(name: string): HTMLCollectionOf<MockHTMLElement>;
  getElementsByClassName(classNames: string): HTMLCollectionOf<MockHTMLElement>;

  querySelector(selectors: string): MockHTMLElement | null;
  querySelectorAll(selectors: string): NodeListOf<MockHTMLElement>;

  addEventListener(
    type: string,
    listener: EventListener,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListener,
    options?: boolean | EventListenerOptions
  ): void;

  // Additional methods used in testing
  hasFocus(): boolean;
  createElementNS(namespaceURI: string, qualifiedName: string): Element;
}

/**
 * Interface for mock window in tests
 */
export interface MockWindow {
  document: MockDocument;
  navigator: Navigator;
  location: Location;

  addEventListener(
    type: string,
    listener: EventListener,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListener,
    options?: boolean | EventListenerOptions
  ): void;

  setTimeout(handler: TimerHandler, timeout?: number, ...args: any[]): number;
  clearTimeout(timeoutId: number): void;

  setInterval(handler: TimerHandler, timeout?: number, ...args: any[]): number;
  clearInterval(intervalId: number): void;

  requestAnimationFrame(callback: FrameRequestCallback): number;
  cancelAnimationFrame(handle: number): void;

  getComputedStyle(element: Element, pseudoElt?: string | null): CSSStyleDeclaration;

  alert(message?: string): void;
  confirm(message?: string): boolean;
  prompt(message?: string, defaultValue?: string): string | null;

  open(url?: string, target?: string, features?: string): Window | null;
  close(): void;

  // Custom properties for our extension
  chrome?: ChromeNamespace;
  browser?: ChromeNamespace;

  // Extension modules
  Logger?: LoggerInterface;
  BrowserDetect?: BrowserDetectInterface;
  BrowserAdapter?: BrowserAdapterInterface;
  TooltipManager?: TooltipManagerInterface;
  TooltipUI?: TooltipUIInterface;
  PerformanceUtils?: PerformanceUtilsInterface;
  SecurityUtils?: SecurityUtilsInterface;
  TrumpMappings?: TrumpMappingsInterface;
  DOMProcessor?: any;
  TextProcessor?: any;
  MutationObserverManager?: any;

  // Additional properties used in tests
  trumpGogglesInitialized?: boolean;

  // Event constructor mocks
  MouseEvent: typeof MouseEvent;
  KeyboardEvent: typeof KeyboardEvent;
  FocusEvent: typeof FocusEvent;
  CustomEvent: typeof CustomEvent;
}

/**
 * Interface for mock logger used in tests
 */
export interface MockLogger {
  debug: VitestMock<(message: string, data?: any) => void>;
  info: VitestMock<(message: string, data?: any) => void>;
  warn: VitestMock<(message: string, data?: any) => void>;
  error: VitestMock<(message: string, data?: any) => void>;

  // Test helper methods
  getMessages: () => {
    debug: Array<{ msg: string; data?: any }>;
    info: Array<{ msg: string; data?: any }>;
    warn: Array<{ msg: string; data?: any }>;
    error: Array<{ msg: string; data?: any }>;
  };
  clear: () => void;
}

/**
 * Interface for Chrome extension API namespace in tests
 */
export interface ChromeNamespace {
  storage: {
    sync: {
      get: VitestMock<Function>;
      set: VitestMock<Function>;
      remove?: VitestMock<Function>;
      clear?: VitestMock<Function>;
      onChanged?: {
        addListener: VitestMock<Function>;
        removeListener: VitestMock<Function>;
        hasListener: VitestMock<Function>;
      };
    };
    local: {
      get: VitestMock<Function>;
      set: VitestMock<Function>;
      remove?: VitestMock<Function>;
      clear?: VitestMock<Function>;
      onChanged?: {
        addListener: VitestMock<Function>;
        removeListener: VitestMock<Function>;
        hasListener: VitestMock<Function>;
      };
    };
  };
  runtime: {
    getManifest: VitestMock<Function>;
    sendMessage: VitestMock<Function>;
    connect: VitestMock<Function>;
    getURL: VitestMock<Function>;
    openOptionsPage: VitestMock<Function>;
    lastError: any;
    onMessage: {
      addListener: VitestMock<Function>;
      removeListener: VitestMock<Function>;
      hasListener: VitestMock<Function>;
    };
    onConnect: {
      addListener: VitestMock<Function>;
      removeListener: VitestMock<Function>;
      hasListener: VitestMock<Function>;
    };
    onInstalled: {
      addListener: VitestMock<Function>;
      removeListener: VitestMock<Function>;
      hasListener: VitestMock<Function>;
    };

    // Helper methods for testing
    _setLastError: (error: any) => void;
    _clearLastError: () => void;
  };
  tabs: {
    query: VitestMock<Function>;
    get: VitestMock<Function>;
    create: VitestMock<Function>;
    update: VitestMock<Function>;
    sendMessage: VitestMock<Function>;
    executeScript: VitestMock<Function>;
    onCreated: {
      addListener: VitestMock<Function>;
      removeListener: VitestMock<Function>;
      hasListener: VitestMock<Function>;
    };
    onUpdated: {
      addListener: VitestMock<Function>;
      removeListener: VitestMock<Function>;
      hasListener: VitestMock<Function>;
    };
    onRemoved: {
      addListener: VitestMock<Function>;
      removeListener: VitestMock<Function>;
      hasListener: VitestMock<Function>;
    };
    onActivated: {
      addListener: VitestMock<Function>;
      removeListener: VitestMock<Function>;
      hasListener: VitestMock<Function>;
    };
  };
  action?: {
    onClicked: {
      addListener: VitestMock<Function>;
      removeListener: VitestMock<Function>;
      hasListener: VitestMock<Function>;
    };
    setIcon?: VitestMock<Function>;
    setTitle?: VitestMock<Function>;
    setBadgeText?: VitestMock<Function>;
    setBadgeBackgroundColor?: VitestMock<Function>;
  };
  browserAction?: {
    onClicked: {
      addListener: VitestMock<Function>;
      removeListener: VitestMock<Function>;
      hasListener: VitestMock<Function>;
    };
    setIcon?: VitestMock<Function>;
    setTitle?: VitestMock<Function>;
    setBadgeText?: VitestMock<Function>;
    setBadgeBackgroundColor?: VitestMock<Function>;
  };

  // Helper methods for testing
  _reset: () => void;
}

/**
 * Interface for mock LocalStorage in tests
 */
export interface MockLocalStorage {
  getItem: VitestMock<(key: string) => string | null>;
  setItem: VitestMock<(key: string, value: string) => void>;
  removeItem: VitestMock<(key: string) => void>;
  clear: VitestMock<() => void>;
  key: VitestMock<(index: number) => string | null>;
  length: number;
}

/**
 * Interface for mock BrowserDetect in tests
 */
export interface MockBrowserDetect {
  getBrowser: VitestMock<() => string>;
  isChrome: VitestMock<() => boolean>;
  isFirefox: VitestMock<() => boolean>;
  isEdge: VitestMock<() => boolean>;
  isSafari: VitestMock<() => boolean>;
  getVersion: VitestMock<() => number | null>;
  getManifestVersion: VitestMock<() => number>;
  hasFeature: VitestMock<(featureName: string) => boolean>;
  hasPromiseAPI: VitestMock<() => boolean>;
  getDebugInfo: VitestMock<() => any>;

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
 * Interface for mock BrowserAdapter in tests
 */
export interface MockBrowserAdapter {
  initialize: VitestMock<(options?: any) => boolean>;
  getAPI: VitestMock<() => any>;
  usesPromises: VitestMock<() => boolean>;
  promisify: VitestMock<(apiFunction: Function, ...args: any[]) => Promise<any>>;
  openOptionsPage: VitestMock<() => Promise<void>>;
  getManifest: VitestMock<() => any>;
  addIconClickListener: VitestMock<(callback: Function) => boolean>;
  getStorageItem: VitestMock<(keys: any) => Promise<any>>;
  setStorageItem: VitestMock<(items: any) => Promise<void>>;
  sendMessageToTab: VitestMock<(tabId: number, message: any) => Promise<any>>;
  sendMessage: VitestMock<(message: any) => Promise<any>>;
  addMessageListener: VitestMock<(callback: Function) => boolean>;
  addInstallListener: VitestMock<(callback: Function) => boolean>;
  getDebugInfo: VitestMock<() => any>;

  // Test helper methods
  _simulateIconClick?: () => void;
  _simulateMessage?: (message: any, sender: any) => any[];
  _simulateInstall?: (details?: any) => void;
  _getConfig?: () => any;
  _isInitialized?: () => boolean;

  // Constants
  API_TYPES: {
    PROMISE: string;
    CALLBACK: string;
  };
}

/**
 * Interface for TooltipUI module in tests
 */
export interface TooltipUIInterface {
  ensureCreated: () => void;
  setText: (text: string) => void;
  updatePosition: (element: HTMLElement) => void;
  show: () => void;
  hide: () => void;
  destroy: () => void;
  getId: () => string;
  getDebugInfo?: () => any;
}

/**
 * Interface for TooltipManager module in tests
 */
export interface TooltipManagerInterface {
  initialize: (uiModule: TooltipUIInterface) => void;
  dispose: () => void;
}

/**
 * Interface for PerformanceUtils module in tests
 */
export interface PerformanceUtilsInterface {
  throttle: <T extends (...args: any[]) => any>(
    fn: T,
    options: { delay: number; maxWait?: number } | number
  ) => (...args: Parameters<T>) => ReturnType<T> | undefined;

  debounce: <T extends (...args: any[]) => any>(
    fn: T,
    options: { delay: number; maxWait?: number } | number
  ) => (...args: Parameters<T>) => ReturnType<T> | undefined;

  // Optional batching utility (removed in some versions but kept for tests)
  DOMBatch?: {
    read: (callback: () => any) => any;
    write: (callback: () => any) => any;
  };

  Configs?: {
    input?: { delay: number; maxWait?: number };
    scroll?: { delay: number; maxWait?: number };
    keyboard?: { delay: number; maxWait?: number };
    mutation?: { delay: number; maxWait?: number };
  };
}

/**
 * Interface for SecurityUtils module in tests
 */
export interface SecurityUtilsInterface {
  escapeHTML: (str: string | null | undefined) => string;
}

/**
 * Interface for LoggerInterface in tests
 */
export interface LoggerInterface {
  // Core logging methods
  debug: (message: string, data?: any) => void;
  info: (message: string, data?: any) => void;
  warn: (message: string, data?: any) => void;
  error: (message: string, data?: any) => void;

  // Optional configuration methods
  configure?: (options?: any) => any;
  enableDebugMode?: () => void;
  disableDebugMode?: () => void;

  // Optional error protection methods
  protect?: <T, R>(fn: (...args: T[]) => R, context: string, fallback?: R) => (...args: T[]) => R;
  protectAsync?: <T, R>(
    fn: (...args: T[]) => Promise<R>,
    context: string,
    fallback?: R
  ) => (...args: T[]) => Promise<R>;

  // Optional performance monitoring
  time?: (operationName: string) => { stop: (status?: string, additionalData?: object) => number };

  // Optional statistics
  getStats?: () => {
    counts: { [level: string]: number };
    lastError: string | null;
    lastErrorTime: Date | null;
  };
  resetStats?: () => void;

  // Optional constants
  LEVELS?: {
    DEBUG: string;
    INFO: string;
    WARN: string;
    ERROR: string;
  };
}

/**
 * Interface for TrumpMappings module in tests
 */
export interface TrumpMappingsInterface {
  getReplacementMap: () => { [key: string]: TrumpMapping };
  getKeys: () => string[];
}

/**
 * Interface for TrumpMapping in tests
 */
export interface TrumpMapping {
  regex: RegExp;
  nick: string;
  keyTerms?: string[];
  matchesPartialWords?: boolean;
}

/**
 * Augment Vitest's test environment globals
 */
declare global {
  // Vitest globals are already defined
  var chrome: ChromeNamespace;
  var browser: ChromeNamespace | undefined;

  // Browser detection and adapter globals
  var BrowserDetect: MockBrowserDetect;
  var BrowserAdapter: MockBrowserAdapter;

  // Logger and other extension modules
  var Logger: LoggerInterface;
  var PerformanceUtils: PerformanceUtilsInterface;
  var SecurityUtils: SecurityUtilsInterface;
  var TooltipManager: TooltipManagerInterface;
  var TooltipUI: TooltipUIInterface;
  var TrumpMappings: TrumpMappingsInterface;

  // Test utility globals
  function createTextNode(text: string): Text;
  var walk: VitestMock<Function>;
  var convert: VitestMock<Function>;
  var isEditableNode: VitestMock<Function>;
  function setupForFirefox(): ChromeNamespace;
  function setupForChrome(): ChromeNamespace;

  // Mock console
  interface Console {
    log: VitestMock<Function>;
    info: VitestMock<Function>;
    warn: VitestMock<Function>;
    error: VitestMock<Function>;
    debug: VitestMock<Function>;
  }
}
