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

  /**
   * Pushes a correlation ID onto the correlation stack
   * Used to track nested operations and maintain correlation context
   * @param id - The correlation ID to push onto the stack
   */
  public pushCorrelation(id: string): void {
    this.correlationStack.push(id);
  }

  /**
   * Removes the top correlation ID from the correlation stack
   * Used when exiting a nested operation context
   */
  public popCorrelation(): void {
    this.correlationStack.pop();
  }

  /**
   * Gets the current correlation ID from the top of the stack
   * If the stack is empty, generates a new root correlation ID,
   * pushes it onto the stack, and returns it
   * @returns The current correlation ID for logging operations
   */
  public getCurrentCorrelation(): string {
    if (this.correlationStack.length === 0) {
      // Generate new root ID, push it, and return it
      const rootId = this.createCorrelationId();
      this.correlationStack.push(rootId);
      return rootId;
    }
    // Return ID from top of stack
    return this.correlationStack[this.correlationStack.length - 1];
  }
}
