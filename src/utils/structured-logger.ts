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
 * Supports hierarchical loggers with context inheritance through child() and withContext() methods.
 * Child loggers inherit all context from their parent, and contexts can be merged with new values.
 */
export class StructuredLogger implements Logger {
  private readonly component: string;
  private readonly context: Record<string, unknown>;

  /**
   * Creates a new StructuredLogger instance
   * @param component - Component name for this logger instance
   * @param context - Logger-level context data
   */
  constructor(component: string = 'placeholder-component', context: Record<string, unknown> = {}) {
    this.component = component;
    this.context = context;
  }

  /**
   * Extracts the calling function name from the JavaScript call stack
   * @private
   * @returns The function name or a fallback value
   */
  private extractCallerFunctionName(): string {
    try {
      const stack = new Error().stack;
      if (!stack) return 'unknown-function';

      const lines = stack.split('\n');
      // Skip first 3 lines: Error, extractCallerFunctionName, createLogEntry
      const callerLine = lines[3] || '';

      // Extract function name using regex that handles different browser formats
      const match = callerLine.match(/at\s+([^\s]+)/);
      return match?.[1] || 'anonymous-function';
    } catch (error) {
      return 'parse-error';
    }
  }

  /**
   * Serializes Error objects from context into error_details format
   * @private
   * @param context - Context object that may contain Error instances
   * @returns Serialized error details or undefined if no Error found
   */
  private serializeError(context?: Record<string, unknown>): LogEntry['error_details'] | undefined {
    if (!context) return undefined;

    try {
      // Look for Error objects in context values
      const errorObj = Object.values(context).find((value) => value instanceof Error);
      if (!errorObj) return undefined;

      return {
        type: errorObj.constructor.name,
        message: errorObj.message,
        ...(errorObj.stack && { stack: errorObj.stack }),
      };
    } catch (error) {
      // If error serialization fails, return undefined to avoid breaking logging
      return undefined;
    }
  }

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
    methodContext?: Record<string, unknown>
  ): LogEntry {
    // Merge logger context with method context (method context overrides)
    const finalContext = {
      ...this.context,
      ...(methodContext || {}),
    };

    // Serialize error details for error-level logs
    const errorDetails = level === 'error' ? this.serializeError(finalContext) : undefined;

    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      service_name: 'trump-goggles',
      correlation_id: 'placeholder-correlation-id', // TODO: T004 - implement correlation ID
      function_name: this.extractCallerFunctionName(),
      component: this.component,
      ...(errorDetails && { error_details: errorDetails }),
      ...(Object.keys(finalContext).length > 0 && { context: finalContext }),
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
   * Create a new logger instance with additional context merged in.
   * The new context is merged with the existing context, with new values
   * overriding existing ones for the same keys.
   * @param newContext - Context to merge with existing context
   * @returns New logger instance with merged context
   */
  withContext(newContext: Record<string, unknown>): Logger {
    const mergedContext = { ...this.context, ...newContext };
    return new StructuredLogger(this.component, mergedContext);
  }

  /**
   * Create a child logger for a specific component.
   * The child logger inherits all context from the parent logger.
   * @param component - Component name for the child logger
   * @returns New logger instance configured for the specified component with inherited context
   */
  child(component: string): Logger {
    return new StructuredLogger(component, this.context);
  }
}
