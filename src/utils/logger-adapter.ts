/**
 * Logger Adapter - Legacy compatibility interface for structured logging
 *
 * This module provides interfaces and adapters to maintain backward compatibility
 * with the existing window.Logger API while transitioning to structured logging.
 * Ensures a smooth migration path without breaking existing code.
 */

/// <reference path="../types/globals.d.ts" />

/**
 * Interface that matches the existing window.Logger API structure
 * for backward compatibility during the structured logging migration.
 *
 * This interface defines the core logging methods that existing code
 * expects from window.Logger, enabling a seamless transition.
 */
export interface LegacyLoggerInterface {
  /**
   * Log a debug message with optional data
   * @param message - The message to log
   * @param data - Optional additional data to include
   */
  debug(message: string, data?: unknown): void;

  /**
   * Log an info message with optional data
   * @param message - The message to log
   * @param data - Optional additional data to include
   */
  info(message: string, data?: unknown): void;

  /**
   * Log a warning message with optional data
   * @param message - The message to log
   * @param data - Optional additional data to include
   */
  warn(message: string, data?: unknown): void;

  /**
   * Log an error message with optional data
   * @param message - The message to log
   * @param data - Optional additional data to include
   */
  error(message: string, data?: unknown): void;
}

/**
 * Logger interface type definition (matches structured-logger.ts)
 */
interface Logger {
  debug(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
  withContext(context: Record<string, unknown>): Logger;
  child(component: string): Logger;
}

/**
 * Creates a legacy shim that adapts a StructuredLogger to the LegacyLoggerInterface.
 * This enables existing code using window.Logger to work seamlessly with the new
 * structured logging system during the migration period.
 *
 * @param structuredLogger - The StructuredLogger instance to wrap
 * @returns An object implementing LegacyLoggerInterface that delegates to the StructuredLogger
 */
export function createLegacyShim(structuredLogger: Logger): LegacyLoggerInterface {
  return {
    /**
     * Log a debug message with optional data
     * @param message - The message to log
     * @param data - Optional additional data to include
     */
    debug(message: string, data?: unknown): void {
      const context = data !== undefined ? { legacy_data: data } : undefined;
      structuredLogger.debug(message, context);
    },

    /**
     * Log an info message with optional data
     * @param message - The message to log
     * @param data - Optional additional data to include
     */
    info(message: string, data?: unknown): void {
      const context = data !== undefined ? { legacy_data: data } : undefined;
      structuredLogger.info(message, context);
    },

    /**
     * Log a warning message with optional data
     * @param message - The message to log
     * @param data - Optional additional data to include
     */
    warn(message: string, data?: unknown): void {
      const context = data !== undefined ? { legacy_data: data } : undefined;
      structuredLogger.warn(message, context);
    },

    /**
     * Log an error message with optional data
     * @param message - The message to log
     * @param data - Optional additional data to include
     */
    error(message: string, data?: unknown): void {
      const context = data !== undefined ? { legacy_data: data } : undefined;
      structuredLogger.error(message, context);
    },
  };
}

// Export to window for global access
declare global {
  interface Window {
    LoggerAdapter: {
      createLegacyShim: (structuredLogger: Logger) => LegacyLoggerInterface;
    };
  }
}

if (typeof window !== 'undefined') {
  (window as any).LoggerAdapter = {
    createLegacyShim,
  };
}
