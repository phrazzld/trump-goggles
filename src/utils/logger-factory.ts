/**
 * Logger Factory - Centralized factory for obtaining logger instances
 *
 * This module provides a factory pattern implementation for creating and managing
 * logger instances across the application. It ensures consistent logger configuration
 * and provides a centralized point for logger initialization.
 */

/// <reference path="../types/globals.d.ts" />

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
 * Factory class for creating and managing logger instances.
 * Provides centralized initialization and component-specific logger creation.
 */
class LoggerFactory {
  /**
   * The singleton StructuredLogger instance used by the factory
   * @internal Will be used in T017/T018 implementations
   */
  private static _structured: Logger;

  /**
   * Initializes the logger factory with a configured StructuredLogger instance.
   * Must be called once at application startup before any loggers are requested.
   *
   * @remarks
   * This method will:
   * - Create a new StructuredLogger with application configuration
   * - Set up legacy compatibility shim for window.Logger
   * - Prepare the factory for logger creation
   */
  public static initialize(): void {
    // Ensure dependencies are loaded
    if (!(window as any).StructuredLogger || !(window as any).LoggerAdapter) {
      throw new Error(
        'LoggerFactory dependencies not loaded: StructuredLogger and LoggerAdapter required'
      );
    }

    // Create the root structured logger with application metadata
    this._structured = new (window as any).StructuredLogger.Logger('trump-goggles', {
      service_name: 'trump-goggles',
      version: '18.5.0',
      environment: 'extension',
    });

    // Create and assign the legacy compatibility shim
    const legacyShim = (window as any).LoggerAdapter.createLegacyShim(this._structured);
    (window as any).Logger = legacyShim;
  }

  /**
   * Gets a logger instance configured for a specific component.
   *
   * @param component - The name of the component requesting the logger
   * @returns A Logger instance configured for the specified component
   *
   * @throws {Error} If called before initialize() or if structured logger is not available
   *
   * @example
   * ```typescript
   * const logger = LoggerFactory.getLogger('tooltip-manager');
   * logger.info('Tooltip initialized');
   * ```
   */
  public static getLogger(component: string): Logger {
    if (!this._structured) {
      throw new Error('LoggerFactory.initialize() must be called before getLogger()');
    }

    return this._structured.child(component);
  }
}

// Export types for module system
export { LoggerFactory };
export type { Logger };

// Export to window for global access
declare global {
  interface Window {
    LoggerFactory: {
      initialize: () => void;
      getLogger: (component: string) => Logger;
    };
  }
}

if (typeof window !== 'undefined') {
  (window as any).LoggerFactory = {
    initialize: () => LoggerFactory.initialize(),
    getLogger: (component: string) => LoggerFactory.getLogger(component),
  };
}
