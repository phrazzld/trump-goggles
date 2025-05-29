/**
 * Global test environment type definitions
 */

import { MockLogger } from './fixtures';

// Extend global namespace for test environment
declare global {
  namespace NodeJS {
    interface Global {
      document: Document;
      window: Window & typeof globalThis;
      Logger?: MockLogger;
      chrome?: any;
      browser?: any;
    }
  }
}

// Make this file a module
export {};
