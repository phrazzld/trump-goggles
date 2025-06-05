/**
 * Structured Logger Implementation
 *
 * Provides structured JSON logging functionality for the extension.
 * Implements structured logging with correlation ID propagation and context inheritance
 * in compliance with DEVELOPMENT_PHILOSOPHY.md logging requirements.
 */

/// <reference path="../types/globals.d.ts" />

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
 * Configuration for logger throttling behavior
 */
export interface ThrottlingConfig {
  /** Whether throttling is enabled (default: true) */
  enabled?: boolean;
  /** Maximum logs per second allowed (default: 100) */
  maxLogsPerSecond?: number;
  /** Interval between throttling warning messages in ms (default: 10000) */
  warningInterval?: number;
}

/**
 * Configuration for context size limiting behavior
 */
export interface ContextSizeLimitConfig {
  /** Whether context size limiting is enabled (default: true) */
  enabled?: boolean;
  /** Maximum context size in bytes (default: 1024) */
  maxSizeBytes?: number;
  /** Action to take when limit exceeded: 'truncate' or 'warn' (default: 'truncate') */
  onExceed?: 'truncate' | 'warn';
  /** Whether to emit warnings when truncating (default: true) */
  emitWarnings?: boolean;
}

/**
 * Configuration options for StructuredLogger
 */
export interface LoggerConfig {
  /** Throttling configuration */
  throttling?: ThrottlingConfig;
  /** Context size limiting configuration */
  contextSizeLimit?: ContextSizeLimitConfig;
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
 * Includes configurable throttling to prevent performance issues under high load.
 */
export class StructuredLogger implements Logger {
  private readonly component: string;
  private readonly context: Record<string, unknown>;
  private readonly throttlingConfig: ThrottlingConfig;
  private readonly contextSizeLimitConfig: ContextSizeLimitConfig;

  // Throttling state
  private logTimestamps: number[] = [];
  private throttledCount: number = 0;
  private lastWarningTime: number = -1; // Use -1 as sentinel for "never warned"

  /**
   * Creates a new StructuredLogger instance
   * @param component - Component name for this logger instance
   * @param context - Logger-level context data
   * @param config - Logger configuration options including throttling
   */
  constructor(
    component: string = 'placeholder-component',
    context: Record<string, unknown> = {},
    config: LoggerConfig = {}
  ) {
    this.component = component;
    this.context = context;

    // Set up throttling configuration with defaults
    this.throttlingConfig = {
      enabled: config.throttling?.enabled !== false, // Default to enabled
      maxLogsPerSecond: Math.max(1, config.throttling?.maxLogsPerSecond || 100),
      warningInterval: Math.max(1000, config.throttling?.warningInterval || 10000),
    };

    // Set up context size limiting configuration with defaults
    this.contextSizeLimitConfig = {
      enabled: config.contextSizeLimit?.enabled !== false, // Default to enabled
      maxSizeBytes: Math.max(100, config.contextSizeLimit?.maxSizeBytes || 1024), // Default 1KB
      onExceed: config.contextSizeLimit?.onExceed || 'truncate', // Default to truncate
      emitWarnings: config.contextSizeLimit?.emitWarnings !== false, // Default to enabled
    };
  }

  /**
   * Gets current timestamp for throttling calculations
   * @private
   * @returns Current timestamp in milliseconds
   */
  private getCurrentTime(): number {
    try {
      return performance.now();
    } catch {
      // Fallback to Date.now() if performance.now() is not available
      return Date.now();
    }
  }

  /**
   * Checks if a log should be allowed based on throttling configuration
   * @private
   * @returns True if log should be allowed, false if throttled
   */
  private shouldAllowLog(): boolean {
    if (!this.throttlingConfig.enabled) {
      return true;
    }

    const now = this.getCurrentTime();
    const oneSecondAgo = now - 1000;

    // Remove timestamps older than 1 second
    this.logTimestamps = this.logTimestamps.filter((timestamp) => timestamp > oneSecondAgo);

    // Check if we're under the rate limit
    if (this.logTimestamps.length < this.throttlingConfig.maxLogsPerSecond!) {
      this.logTimestamps.push(now);
      return true;
    }

    // Rate limit exceeded
    this.throttledCount++;
    this.emitThrottlingWarningIfNeeded(now);
    return false;
  }

  /**
   * Emits a warning when throttling occurs, but throttles the warnings themselves
   * @private
   * @param currentTime - Current timestamp
   */
  private emitThrottlingWarningIfNeeded(currentTime: number): void {
    // Only emit warning if enough time has passed since last warning
    // OR if this is the very first warning (lastWarningTime === -1)
    if (this.lastWarningTime === -1) {
      // First warning - emit immediately
      this.emitThrottlingWarning(currentTime);
    } else {
      // Check if enough time has passed for subsequent warnings
      const timeSinceLastWarning = currentTime - this.lastWarningTime;
      if (timeSinceLastWarning >= this.throttlingConfig.warningInterval!) {
        this.emitThrottlingWarning(currentTime);
      }
      // Otherwise, silently increment throttled count but don't emit warning
    }
  }

  /**
   * Emits the actual throttling warning message
   * @private
   * @param currentTime - Current timestamp for recording warning time
   */
  private emitThrottlingWarning(currentTime: number): void {
    // Create warning log entry directly to avoid recursion
    const warningEntry = this.createLogEntry(
      'warn',
      `Logger throttling active: ${this.throttledCount} logs dropped`,
      {
        throttled_count: this.throttledCount,
        rate_limit: this.throttlingConfig.maxLogsPerSecond,
        time_window: '1 second',
        component: this.component,
      }
    );

    console.warn(JSON.stringify(warningEntry));

    // Update last warning time and reset throttled count
    this.lastWarningTime = currentTime;
    this.throttledCount = 0;
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
   * Sanitizes data for safe logging using the security utils
   * @private
   * @param data - Data to sanitize
   * @returns Sanitized data
   */
  private sanitizeData(data: unknown): unknown {
    try {
      // Import sanitizeForLogging dynamically to avoid circular dependencies
      if ((window as any).SecurityUtils?.sanitizeForLogging) {
        return (window as any).SecurityUtils.sanitizeForLogging(data);
      }
      // Fallback if SecurityUtils not available
      return data;
    } catch (error) {
      // If sanitization fails, return safe fallback
      return '[SANITIZATION_FAILED]';
    }
  }

  /**
   * Calculates the byte size of a context object using JSON serialization
   * @private
   * @param context - Context object to measure
   * @returns Size in bytes
   */
  private calculateContextSize(context: Record<string, unknown>): number {
    try {
      return JSON.stringify(context).length;
    } catch (error) {
      // If serialization fails, assume it's oversized
      return Number.MAX_SAFE_INTEGER;
    }
  }

  /**
   * Applies context size limiting based on configuration
   * @private
   * @param context - Context object to potentially limit
   * @returns Limited context object
   */
  private limitContextSize(context: Record<string, unknown>): Record<string, unknown> {
    if (!this.contextSizeLimitConfig.enabled) {
      return context;
    }

    const contextSize = this.calculateContextSize(context);
    const maxSize = this.contextSizeLimitConfig.maxSizeBytes!;

    if (contextSize <= maxSize) {
      return context;
    }

    // Size limit exceeded
    if (this.contextSizeLimitConfig.onExceed === 'warn') {
      // Log warning but keep full context
      if (this.contextSizeLimitConfig.emitWarnings) {
        this.emitContextSizeWarning(contextSize, maxSize);
      }
      return context;
    } else {
      // Truncate context
      if (this.contextSizeLimitConfig.emitWarnings) {
        this.emitContextSizeWarning(contextSize, maxSize);
      }
      return this.truncateContext(context, maxSize);
    }
  }

  /**
   * Emits a warning when context size limit is exceeded
   * @private
   * @param actualSize - Actual size of context in bytes
   * @param maxSize - Maximum allowed size in bytes
   */
  private emitContextSizeWarning(actualSize: number, maxSize: number): void {
    const warningEntry = this.createLogEntryDirect(
      'warn',
      `Context size limit exceeded: ${actualSize} bytes > ${maxSize} bytes`,
      {
        actual_size_bytes: actualSize,
        max_size_bytes: maxSize,
        action: this.contextSizeLimitConfig.onExceed,
        component: this.component,
      }
    );

    console.warn(JSON.stringify(warningEntry));
  }

  /**
   * Truncates context to fit within size limit
   * @private
   * @param context - Original context object
   * @param maxSize - Maximum allowed size in bytes
   * @returns Truncated context object
   */
  private truncateContext(
    context: Record<string, unknown>,
    maxSize: number
  ): Record<string, unknown> {
    const truncatedContext: Record<string, unknown> = {};
    let currentSize = 2; // Start with empty object "{}"

    // Add the truncation marker first
    const truncationMarker = { _truncated: true };
    const markerSize = JSON.stringify(truncationMarker).length - 2; // Subtract "{}"
    currentSize += markerSize;
    Object.assign(truncatedContext, truncationMarker);

    // Add fields one by one until we approach the limit
    for (const [key, value] of Object.entries(context)) {
      try {
        const fieldEntry = { [key]: value };
        const fieldSize = JSON.stringify(fieldEntry).length - 2; // Subtract "{}"

        // Leave some buffer for JSON formatting (commas, etc.)
        if (currentSize + fieldSize + 10 <= maxSize) {
          truncatedContext[key] = value;
          currentSize += fieldSize + 1; // +1 for comma
        } else {
          break;
        }
      } catch (error) {
        // Skip fields that can't be serialized
        continue;
      }
    }

    return truncatedContext;
  }

  /**
   * Creates a log entry directly without context size limiting (used for internal warnings)
   * @private
   * @param level - The log level
   * @param message - The log message
   * @param context - Context data (assumed to be small)
   * @returns Complete LogEntry object
   */
  private createLogEntryDirect(
    level: 'debug' | 'info' | 'warn' | 'error',
    message: string,
    context: Record<string, unknown>
  ): LogEntry {
    // Sanitize the message and context for safe logging
    const sanitizedMessage = this.sanitizeData(message) as string;
    const sanitizedContext = this.sanitizeData(context) as Record<string, unknown>;

    return {
      timestamp: new Date().toISOString(),
      level,
      message: sanitizedMessage,
      service_name: 'trump-goggles',
      correlation_id:
        (window as any).LoggerContext?.getInstance().getCurrentCorrelation() || 'no-correlation',
      function_name: this.extractCallerFunctionName(),
      component: this.component,
      context: sanitizedContext,
    };
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

    // Sanitize the message for safe logging
    const sanitizedMessage = this.sanitizeData(message) as string;

    // Sanitize the context for safe logging
    const sanitizedContext = this.sanitizeData(finalContext) as Record<string, unknown>;

    // Apply context size limiting
    const limitedContext = this.limitContextSize(sanitizedContext);

    // Serialize error details for error-level logs (applied to limited context)
    const errorDetails = level === 'error' ? this.serializeError(limitedContext) : undefined;

    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message: sanitizedMessage,
      service_name: 'trump-goggles',
      correlation_id:
        (window as any).LoggerContext?.getInstance().getCurrentCorrelation() || 'no-correlation',
      function_name: this.extractCallerFunctionName(),
      component: this.component,
      ...(errorDetails && { error_details: errorDetails }),
      ...(Object.keys(limitedContext).length > 0 && { context: limitedContext }),
    };

    return logEntry;
  }

  /**
   * Log a debug message with optional context
   * @param message - The message to log
   * @param context - Optional additional context data
   */
  debug(message: string, context?: Record<string, unknown>): void {
    if (!this.shouldAllowLog()) {
      return;
    }
    const logEntry = this.createLogEntry('debug', message, context);
    console.debug(JSON.stringify(logEntry));
  }

  /**
   * Log an info message with optional context
   * @param message - The message to log
   * @param context - Optional additional context data
   */
  info(message: string, context?: Record<string, unknown>): void {
    if (!this.shouldAllowLog()) {
      return;
    }
    const logEntry = this.createLogEntry('info', message, context);
    console.info(JSON.stringify(logEntry));
  }

  /**
   * Log a warning message with optional context
   * @param message - The message to log
   * @param context - Optional additional context data
   */
  warn(message: string, context?: Record<string, unknown>): void {
    if (!this.shouldAllowLog()) {
      return;
    }
    const logEntry = this.createLogEntry('warn', message, context);
    console.warn(JSON.stringify(logEntry));
  }

  /**
   * Log an error message with optional context
   * @param message - The message to log
   * @param context - Optional additional context data
   */
  error(message: string, context?: Record<string, unknown>): void {
    if (!this.shouldAllowLog()) {
      return;
    }
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
    return new StructuredLogger(this.component, mergedContext, {
      throttling: this.throttlingConfig,
      contextSizeLimit: this.contextSizeLimitConfig,
    });
  }

  /**
   * Create a child logger for a specific component.
   * The child logger inherits all context from the parent logger.
   * @param component - Component name for the child logger
   * @returns New logger instance configured for the specified component with inherited context
   */
  child(component: string): Logger {
    return new StructuredLogger(component, this.context, {
      throttling: this.throttlingConfig,
      contextSizeLimit: this.contextSizeLimitConfig,
    });
  }
}

// Export to window for global access
declare global {
  interface Window {
    StructuredLogger: {
      Logger: typeof StructuredLogger;
    };
  }
}

if (typeof window !== 'undefined') {
  (window as any).StructuredLogger = {
    Logger: StructuredLogger,
  };
}
