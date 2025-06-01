/**
 * Structured Logger Interfaces
 *
 * Defines TypeScript interfaces for the structured JSON logging system.
 * These interfaces establish contracts for log entries and logger behavior
 * in compliance with DEVELOPMENT_PHILOSOPHY.md logging requirements.
 */

/**
 * Represents a single structured log entry with all mandatory fields
 * for JSON logging as specified in DEVELOPMENT_PHILOSOPHY.md
 */
export interface LogEntry {
  readonly timestamp: string; // ISO 8601 UTC format
  readonly level: 'debug' | 'info' | 'warn' | 'error';
  readonly message: string;
  readonly service_name: string; // 'trump-goggles'
  readonly correlation_id: string; // Request/operation ID (UUID v4)
  readonly function_name: string; // Calling function name
  readonly component: string; // Module/component name
  readonly error_details?: {
    // Present for ERROR level logs
    readonly type: string; // Error class name
    readonly message: string; // Error message
    readonly stack?: string; // Stack trace if available
  };
  readonly context?: Record<string, unknown>; // Additional contextual data
}

/**
 * Logger interface defining the contract for structured logging operations.
 * Supports hierarchical loggers with context inheritance and component naming.
 */
export interface Logger {
  /**
   * Log a debug message with optional context
   * @param message - The message to log
   * @param context - Optional additional context data
   */
  debug(message: string, context?: Record<string, unknown>): void;

  /**
   * Log an info message with optional context
   * @param message - The message to log
   * @param context - Optional additional context data
   */
  info(message: string, context?: Record<string, unknown>): void;

  /**
   * Log a warning message with optional context
   * @param message - The message to log
   * @param context - Optional additional context data
   */
  warn(message: string, context?: Record<string, unknown>): void;

  /**
   * Log an error message with optional context
   * @param message - The message to log
   * @param context - Optional additional context data
   */
  error(message: string, context?: Record<string, unknown>): void;

  /**
   * Create a new logger instance with additional context merged in
   * @param context - Context to merge with existing context
   * @returns New logger instance with merged context
   */
  withContext(context: Record<string, unknown>): Logger;

  /**
   * Create a child logger for a specific component
   * @param component - Component name for the child logger
   * @returns New logger instance configured for the specified component
   */
  child(component: string): Logger;
}
