/**
 * Vitest global definitions for the test environment
 * This file makes Vitest's global functions available in all test files
 */

import 'vitest/globals';

// Ensure all of Vitest's global functions are available
declare global {
  // Vitest globals
  const describe: (typeof import('vitest'))['describe'];
  const it: (typeof import('vitest'))['it'];
  const test: (typeof import('vitest'))['test'];
  const expect: (typeof import('vitest'))['expect'];
  const vi: (typeof import('vitest'))['vi'];
  const beforeEach: (typeof import('vitest'))['beforeEach'];
  const afterEach: (typeof import('vitest'))['afterEach'];
  const beforeAll: (typeof import('vitest'))['beforeAll'];
  const afterAll: (typeof import('vitest'))['afterAll'];

  // Additional test helpers specific to our project
  const createTestTextNode: (text?: string, document?: Document) => Text;
  const isEditableNode: (node: Node) => boolean;
  const walk: (node: Node, callback: (node: Node) => void) => void;
  const convert: (text: string) => string;

  // Browser extension-specific globals
  const setupForFirefox: () => any;
  const setupForChrome: () => any;
}
