/**
 * Logger Module Type Declarations
 *
 * This file provides TypeScript type definitions for the Logger module.
 */

/**
 * Timer interface for performance measurement
 */
export interface TimerInterface {
  /**
   * Stops the timer and returns elapsed time in milliseconds
   * @param status - Optional status message
   * @param additionalData - Optional additional data to log
   * @returns Elapsed time in milliseconds
   */
  stop: (status?: string, additionalData?: any) => number;
}

/**
 * Logger statistics object
 */
export interface LoggerStats {
  /** Count of logs by level */
  counts: Record<string, number>;
  /** Last error message */
  lastError: string | null;
  /** Time of last error */
  lastErrorTime: Date | null;
}

/**
 * Logger interface for the Logger module
 */
export interface LoggerInterface {
  /** Configure the logger */
  configure: (options?: object) => object;
  /** Enable debug mode */
  enableDebugMode: () => void;
  /** Disable debug mode */
  disableDebugMode: () => void;
  /** Log debug message */
  debug: (message: string, data?: any) => void;
  /** Log info message */
  info: (message: string, data?: any) => void;
  /** Log warning message */
  warn: (message: string, data?: any) => void;
  /** Log error message */
  error: (message: string, data?: any) => void;
  /** Wrap function with error boundary */
  protect: <T, R>(fn: (...args: T[]) => R, context: string, fallback?: R) => (...args: T[]) => R;
  /** Wrap async function with error boundary */
  protectAsync: <T, R>(
    fn: (...args: T[]) => Promise<R>,
    context: string,
    fallback?: R
  ) => (...args: T[]) => Promise<R>;
  /** Create performance timer */
  time: (operationName: string) => TimerInterface;
  /** Get logger statistics */
  getStats: () => LoggerStats;
  /** Reset logger statistics */
  resetStats: () => void;
  /** Log levels constants */
  LEVELS: {
    DEBUG: string;
    INFO: string;
    WARN: string;
    ERROR: string;
  };
}

declare global {
  interface Window {
    Logger: LoggerInterface;
  }
}

/**
 * The Logger module provides structured logging and error handling capabilities.
 */
declare const Logger: LoggerInterface;

export default Logger;
