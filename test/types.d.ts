/**
 * Type declarations for test files
 */

// Declare the vi global used by Vitest
declare const vi: {
  fn: () => {
    mockImplementation: (fn: Function) => void;
    mock: {
      calls: any[][];
    };
  };
  mock: (path: string) => any;
};

// Extend Chrome namespace for tests
interface ChromeNamespace {
  storage: {
    sync: {
      get: {
        mockImplementation: (fn: Function) => void;
      };
      set: {
        mockImplementation: (fn: Function) => void;
      };
    };
  };
  action: {
    onClicked: {
      addListener: {
        mock: any;
      };
    };
  };
}

declare global {
  interface Window {
    chrome: ChromeNamespace;
  }
  var chrome: ChromeNamespace;
}