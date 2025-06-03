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
}
