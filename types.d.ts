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
}

declare const chrome: Chrome;

// DOM extensions
interface Node {
  _trumpGogglesProcessed?: boolean;
  id?: string;
}

interface Text {
  _trumpGogglesProcessed?: boolean;
}

interface ParentNode {
  _trumpGogglesProcessed?: boolean;
}

// Window extensions
interface Window {
  trumpVersion?: string;
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