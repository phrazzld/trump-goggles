/**
 * Logger Adapter - Legacy compatibility interface for structured logging
 *
 * This module provides interfaces and adapters to maintain backward compatibility
 * with the existing window.Logger API while transitioning to structured logging.
 * Ensures a smooth migration path without breaking existing code.
 */

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
