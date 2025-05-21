/**
 * Global type declarations for test environment
 */

import { Mock } from 'vitest';

declare global {
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
  function setupForFirefox(): any;
  function setupForChrome(): any;
}

export {};
