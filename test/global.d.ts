/**
 * Global type declarations for test environment
 */

import { Mock } from 'vitest';
import {
  MockLogger,
  LoggerInterface,
  PerformanceUtilsInterface,
  TooltipManagerInterface,
} from './types/mocks';

// Define node type constants for tests
export const NODE_TYPES = {
  ELEMENT_NODE: 1,
  ATTRIBUTE_NODE: 2,
  TEXT_NODE: 3,
  CDATA_SECTION_NODE: 4,
  COMMENT_NODE: 8,
  DOCUMENT_NODE: 9,
  DOCUMENT_TYPE_NODE: 10,
  DOCUMENT_FRAGMENT_NODE: 11,
} as const;

// Define mutation type constants
export const MUTATION_TYPES = {
  CHILD_LIST: 'childList',
  ATTRIBUTES: 'attributes',
  CHARACTER_DATA: 'characterData',
} as const;

declare global {
  // Browser detection and adapter
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

  // Core extension modules
  var Logger: LoggerInterface | MockLogger;
  var PerformanceUtils: PerformanceUtilsInterface;
  var TooltipManager: TooltipManagerInterface;
  var NODE_TYPES: typeof NODE_TYPES;
  var MUTATION_TYPES: typeof MUTATION_TYPES;

  // Trump Goggles specific globals
  var trumpMap: Record<string, { regex: RegExp; nick: string }>;
  var trumpGogglesInitialized: boolean;

  // Test utility globals
  function createTextNode(text: string): Text;
  var walk: Mock;
  var convert: Mock;
  var isEditableNode: Mock;
  function setupForFirefox(): any;
  function setupForChrome(): any;

  // Performance utilities for testing
  var throttle: <T extends (...args: any[]) => any>(
    fn: T,
    options: { delay: number; maxWait?: number } | number
  ) => (...args: Parameters<T>) => ReturnType<T> | undefined;

  var debounce: <T extends (...args: any[]) => any>(
    fn: T,
    options: { delay: number; maxWait?: number } | number
  ) => (...args: Parameters<T>) => ReturnType<T> | undefined;

  // Extension configuration globals
  var Configs: {
    input: { delay: number; maxWait: number };
    scroll: { delay: number; maxWait: number };
    keyboard: { delay: number; maxWait: number };
    mutation: { delay: number; maxWait: number };
  };

  // Test environment extensions
  interface Window {
    // Extension modules that might be attached to window
    Logger?: LoggerInterface;
    BrowserDetect?: typeof BrowserDetect;
    BrowserAdapter?: typeof BrowserAdapter;
    PerformanceUtils?: PerformanceUtilsInterface;
    TooltipManager?: TooltipManagerInterface;

    // Extension globals
    chrome?: any;
    browser?: any;
    trumpGogglesInitialized?: boolean;
  }
}

export {};
