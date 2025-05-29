/**
 * Test utility function type definitions
 */

import { JSDOM } from 'jsdom';

// DOM creation helper types
export type CreateDomFunction = (html: string) => Document;

// Mock function types
export type MockFunction<T extends (...args: any[]) => any> = T & {
  mock: {
    calls: Array<Parameters<T>>;
    results: Array<{ value: ReturnType<T> }>;
  };
  mockClear: () => void;
  mockReset: () => void;
  mockRestore: () => void;
  mockImplementation: (impl: T) => void;
  mockImplementationOnce: (impl: T) => void;
  mockReturnValue: (value: ReturnType<T>) => void;
  mockReturnValueOnce: (value: ReturnType<T>) => void;
  mockResolvedValue: <U>(value: U) => void;
  mockResolvedValueOnce: <U>(value: U) => void;
  mockRejectedValue: (value: any) => void;
  mockRejectedValueOnce: (value: any) => void;
};

// Test context helper
export interface TestContext {
  document: Document;
  window: Window & typeof globalThis;
  cleanup: () => void;
}
