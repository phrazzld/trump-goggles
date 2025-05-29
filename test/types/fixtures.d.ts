/**
 * Type definitions for test fixtures
 */

// Trump mapping types
export interface TrumpMapping {
  regex: RegExp;
  nick: string;
}

export type TrumpMappingObject = { [key: string]: TrumpMapping };

// Text segment types for testing
export interface TextSegment {
  originalText: string;
  convertedText: string;
  startIndex: number;
  endIndex: number;
}

// Test fixture data types
export type TextFixture = string[];
export type MediaReference = string;
export type EdgeCase = string;
export type ComplexParagraph = string;

// Mock Logger interface for tests
export interface MockLogger {
  debug: (...args: any[]) => void;
  info: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  error: (...args: any[]) => void;
  protect: <T extends (...args: any[]) => any>(fn: T) => T;
  protectAsync: <T extends (...args: any[]) => any>(fn: T) => T;
  time: (label?: string) => { stop: () => void };
  getStats: () => any;
  resetStats: () => void;
  configure: (options: any) => void;
  enableDebugMode: () => void;
  disableDebugMode: () => void;
  LEVELS: {
    DEBUG: string;
    INFO: string;
    WARN: string;
    ERROR: string;
  };
}
