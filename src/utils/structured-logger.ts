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

/**
 * Implementation of the Logger interface that produces structured JSON logs.
 * This is a skeleton implementation with stubbed methods for future development.
 */
export class StructuredLogger implements Logger {
  /**
   * Creates a structured log entry with all required fields
   * @private
   * @param level - The log level
   * @param message - The log message
   * @param context - Optional context data
   * @returns Complete LogEntry object
   */
  private createLogEntry(
    level: 'debug' | 'info' | 'warn' | 'error',
    message: string,
    context?: Record<string, unknown>
  ): LogEntry {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      service_name: 'trump-goggles',
      correlation_id: 'placeholder-correlation-id', // TODO: T004 - implement correlation ID
      function_name: 'placeholder-function-name', // TODO: T008 - implement caller detection
      component: 'placeholder-component', // TODO: T005 - implement component hierarchy
      ...(context && Object.keys(context).length > 0 && { context }),
    };

    return logEntry;
  }

  /**
   * Log a debug message with optional context
   * @param message - The message to log
   * @param context - Optional additional context data
   */
  debug(message: string, context?: Record<string, unknown>): void {
    const logEntry = this.createLogEntry('debug', message, context);
    console.debug(JSON.stringify(logEntry));
  }

  /**
   * Log an info message with optional context
   * @param message - The message to log
   * @param context - Optional additional context data
   */
  info(message: string, context?: Record<string, unknown>): void {
    const logEntry = this.createLogEntry('info', message, context);
    console.info(JSON.stringify(logEntry));
  }

  /**
   * Log a warning message with optional context
   * @param message - The message to log
   * @param context - Optional additional context data
   */
  warn(message: string, context?: Record<string, unknown>): void {
    const logEntry = this.createLogEntry('warn', message, context);
    console.warn(JSON.stringify(logEntry));
  }

  /**
   * Log an error message with optional context
   * @param message - The message to log
   * @param context - Optional additional context data
   */
  error(message: string, context?: Record<string, unknown>): void {
    const logEntry = this.createLogEntry('error', message, context);
    console.error(JSON.stringify(logEntry));
  }

  /**
   * Create a new logger instance with additional context merged in
   * @param context - Context to merge with existing context
   * @returns New logger instance with merged context
   */
  withContext(_context: Record<string, unknown>): Logger {
    // TODO: Implement context merging
    return this;
  }

  /**
   * Create a child logger for a specific component
   * @param component - Component name for the child logger
   * @returns New logger instance configured for the specified component
   */
  child(_component: string): Logger {
    // TODO: Implement child logger creation
    return this;
  }
}
