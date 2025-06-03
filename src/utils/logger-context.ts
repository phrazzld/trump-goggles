/**
 * LoggerContext - Singleton class for managing correlation ID stack
 *
 * This class implements the singleton pattern to provide a centralized
 * correlation ID management system for the structured logging framework.
 * It maintains a stack of correlation IDs to support nested operations
 * and ensures consistent correlation tracking across the application.
 */
export class LoggerContext {
  private static instance: LoggerContext;
  // TODO: Will be used in T011 and T012 for correlation ID operations
  // @ts-ignore - correlationStack will be used in upcoming tasks
  private correlationStack: string[];

  /**
   * Private constructor to enforce singleton pattern
   * Initializes an empty correlation stack
   */
  private constructor() {
    this.correlationStack = [];
  }

  /**
   * Gets the singleton instance of LoggerContext
   * Creates the instance if it doesn't exist (lazy initialization)
   * @returns The singleton LoggerContext instance
   */
  public static getInstance(): LoggerContext {
    if (!LoggerContext.instance) {
      LoggerContext.instance = new LoggerContext();
    }
    return LoggerContext.instance;
  }

  /**
   * Generates a new correlation ID using UUID v4 format
   * Uses crypto.randomUUID() when available, falls back to custom implementation
   * @returns A valid UUID v4 string for correlation tracking
   */
  public createCorrelationId(): string {
    try {
      // Use modern browser API if available
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
      }

      // Fallback implementation for older browsers
      return this.generateUUIDFallback();
    } catch (error) {
      // Ultimate fallback for any errors
      return this.generateUUIDFallback();
    }
  }

  /**
   * Generates a UUID v4 string using Math.random() as fallback
   * RFC 4122 compliant implementation for browser compatibility
   * @private
   * @returns A valid UUID v4 string
   */
  private generateUUIDFallback(): string {
    // RFC 4122 compliant UUID v4 implementation
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}
