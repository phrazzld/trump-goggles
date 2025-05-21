/**
 * Type declarations for test files
 */

import { Mock } from 'vitest';

/**
 * Interface for mock elements used in test files
 * This allows us to have simplified versions of DOM elements
 * without having to implement the full HTMLElement interface
 */
interface MockHTMLElement {
  style: Record<string, string>;
  attributes: Record<string, string>;
  setAttribute(name: string, value: string): void;
  getAttribute(name: string): string | null;
  // Add other methods as needed for testing
}

/**
 * Extended Performance interface with memory property
 * This is used in Chrome but not defined in standard TypeScript DOM lib
 */
interface ExtendedPerformance extends Performance {
  memory?: {
    jsHeapSizeLimit: number;
    totalJSHeapSize: number;
    usedJSHeapSize: number;
  };
}

/**
 * Define test types for type checking
 * @typedef {'small'|'medium'|'large'|'extreme'} TestSizeType
 */

/**
 * Test configuration for performance tests
 * @typedef {Object} TestConfig
 * @property {number} paragraphs - Number of paragraphs to generate
 * @property {number} referencesPerParagraph - Number of references per paragraph
 */

/**
 * Performance metrics for different test sizes
 * @typedef {Object} PerformanceMetrics
 * @property {number[]} small - Metrics for small test
 * @property {number[]} medium - Metrics for medium test
 * @property {number[]} large - Metrics for large test
 * @property {number[]} extreme - Metrics for extreme test
 */

/**
 * All performance metrics
 * @typedef {Object} AllMetrics
 * @property {PerformanceMetrics} generationTime - Time to generate content
 * @property {PerformanceMetrics} processingTime - Time to process content
 * @property {PerformanceMetrics} tooltipShowTime - Time to show tooltip
 * @property {PerformanceMetrics} memory - Memory usage
 */

// Declare Vitest globals - augment the existing types
declare global {
  // Vitest types are already declared by vitest/globals
  const vi: (typeof import('vitest'))['vi'];
  const describe: (typeof import('vitest'))['describe'];
  const it: (typeof import('vitest'))['it'];
  const expect: (typeof import('vitest'))['expect'];
  const beforeEach: (typeof import('vitest'))['beforeEach'];
  const afterEach: (typeof import('vitest'))['afterEach'];
  const beforeAll: (typeof import('vitest'))['beforeAll'];
  const afterAll: (typeof import('vitest'))['afterAll'];

  // Chrome extension API types
  interface ChromeStorageArea {
    get: Mock;
    set: Mock;
    remove?: Mock;
    clear?: Mock;
    onChanged?: {
      addListener: Mock;
      removeListener: Mock;
      hasListener: Mock;
    };
  }

  interface ChromeStorage {
    sync: ChromeStorageArea;
    local: ChromeStorageArea;
  }

  interface ChromeAction {
    onClicked: {
      addListener: Mock;
      removeListener: Mock;
      hasListener: Mock;
    };
    setIcon?: Mock;
    setTitle?: Mock;
    setBadgeText?: Mock;
    setBadgeBackgroundColor?: Mock;
  }

  interface ChromeBrowserAction {
    onClicked: {
      addListener: Mock;
      removeListener: Mock;
      hasListener: Mock;
    };
    setIcon?: Mock;
    setTitle?: Mock;
    setBadgeText?: Mock;
    setBadgeBackgroundColor?: Mock;
  }

  interface ChromeRuntime {
    getManifest: Mock;
    sendMessage: Mock;
    connect: Mock;
    getURL: Mock;
    openOptionsPage: Mock;
    lastError: any;
    _setLastError: (error: any) => void;
    _clearLastError: () => void;
    onMessage: {
      addListener: Mock;
      removeListener: Mock;
      hasListener: Mock;
    };
    onConnect: {
      addListener: Mock;
      removeListener: Mock;
      hasListener: Mock;
    };
    onInstalled: {
      addListener: Mock;
      removeListener: Mock;
      hasListener: Mock;
    };
  }

  interface ChromeTabs {
    query: Mock;
    get: Mock;
    create: Mock;
    update: Mock;
    sendMessage: Mock;
    executeScript: Mock;
    onCreated: {
      addListener: Mock;
      removeListener: Mock;
      hasListener: Mock;
    };
    onUpdated: {
      addListener: Mock;
      removeListener: Mock;
      hasListener: Mock;
    };
    onRemoved: {
      addListener: Mock;
      removeListener: Mock;
      hasListener: Mock;
    };
    onActivated: {
      addListener: Mock;
      removeListener: Mock;
      hasListener: Mock;
    };
  }

  interface ChromeNamespace {
    storage: ChromeStorage;
    runtime: ChromeRuntime;
    tabs: ChromeTabs;
    action?: ChromeAction;
    browserAction?: ChromeBrowserAction;
    _reset: () => void;
  }

  // Used for tests where we mock global elements
  interface MockDocumentInterface extends Partial<Document> {
    createElement?: (tagName: string) => MockHTMLElement;
    addEventListener?: (...args: any[]) => void;
    removeEventListener?: (...args: any[]) => void;
    querySelectorAll?: (selector: string) => NodeListOf<Element>;
    querySelector?: (selector: string) => Element | null;
    hidden?: boolean;
  }

  interface Window {
    chrome: ChromeNamespace;
    browser: ChromeNamespace | undefined;
    performance: ExtendedPerformance;
    BrowserDetect?: any;
    Logger?: any;
    TooltipBrowserAdapter?: any;
    TextProcessor?: any;
    DOMProcessor?: any;
    MutationObserverManager?: any;
    TrumpMappings?: any;
    buildTrumpMap?: () => Record<string, string>;
    trumpGogglesInitialized?: boolean;
    PerformanceUtils?: any;
    SecurityUtils?: any;
    TooltipUI?: any;
    TooltipManager?: any;
    TrumpGoggles?: any;
    ContentGenerator?: any;
    PerformanceTestRunner?: any;
  }

  var chrome: ChromeNamespace;
  var browser: ChromeNamespace | undefined;

  // Browser detection and adapter globals
  var BrowserDetect: {
    getBrowser: Mock;
    isChrome: Mock;
    isFirefox: Mock;
    isEdge: Mock;
    isSafari: Mock;
    getVersion: Mock;
    getManifestVersion: Mock;
    hasFeature: Mock;
    hasPromiseAPI: Mock;
    getDebugInfo: Mock;
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
  };

  var BrowserAdapter: {
    initialize: Mock;
    getAPI: Mock;
    usesPromises: Mock;
    promisify: Mock;
    openOptionsPage: Mock;
    getManifest: Mock;
    addIconClickListener: Mock;
    getStorageItem: Mock;
    setStorageItem: Mock;
    sendMessageToTab: Mock;
    sendMessage: Mock;
    addMessageListener: Mock;
    addInstallListener: Mock;
    getDebugInfo: Mock;
    _simulateIconClick?: () => void;
    _simulateMessage?: (message: any, sender: any) => any[];
    _simulateInstall?: (details?: any) => void;
    _getConfig?: () => any;
    _isInitialized?: () => boolean;
    API_TYPES: {
      PROMISE: string;
      CALLBACK: string;
    };
  };

  // Test utility globals
  function createTextNode(text: string): Text;
  const walk: Mock;
  const convert: Mock;
  const isEditableNode: Mock;
  function setupForFirefox(): ChromeNamespace;
  function setupForChrome(): ChromeNamespace;

  // Console mock
  interface Console {
    log: Mock;
    info: Mock;
    warn: Mock;
    error: Mock;
    debug: Mock;
  }

  // LocalStorage mock type
  interface LocalStorageMock {
    getItem: Mock;
    setItem: Mock;
    removeItem: Mock;
    clear: Mock;
    key: Mock;
    length: number;
  }
}

// Export types for use in other files
export type { ChromeNamespace, LocalStorageMock };

// Ensure module is treated as a module
export {};
