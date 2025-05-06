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
}

declare const chrome: Chrome;

// DOM extensions
interface Node {
  _trumpGogglesProcessed?: boolean;
  _trumpProcessed?: boolean;
  id?: string;
}

interface Text {
  _trumpGogglesProcessed?: boolean;
  _trumpProcessed?: boolean;
}

interface ParentNode {
  _trumpGogglesProcessed?: boolean;
  _trumpProcessed?: boolean;
}

// Window extensions
interface Window {
  trumpVersion?: string;
  trumpGogglesInitialized?: boolean;
  trumpProcessedNodes?: WeakSet<Node>;
  trumpObserver?: MutationObserver;
  errorHandlerInitialized?: boolean;
  
  // Module exports
  Logger?: any;
  ErrorHandler?: any;
  BrowserDetect?: any;
  BrowserAdapter?: any;
  TrumpMappings?: any;
  DOMProcessor?: any;
  TextProcessor?: any;
  MutationObserverManager?: any;
  TrumpGoggles?: any;
  
  // Legacy functions
  buildTrumpMap?: () => TrumpMappingObject;
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