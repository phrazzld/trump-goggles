/**
 * Logger Factory - Centralized factory for obtaining logger instances
 *
 * This module provides a factory pattern implementation for creating and managing
 * logger instances across the application. It ensures consistent logger configuration
 * and provides a centralized point for logger initialization.
 */

import { StructuredLogger, Logger } from './structured-logger';
import { createLegacyShim } from './logger-adapter';

/**
 * Factory class for creating and managing logger instances.
 * Provides centralized initialization and component-specific logger creation.
 */
export class LoggerFactory {
  /**
   * The singleton StructuredLogger instance used by the factory
   * @internal Will be used in T017/T018 implementations
   */
  private static _structured: StructuredLogger;

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
    // Create the root structured logger with application metadata
    this._structured = new StructuredLogger('trump-goggles', {
      service_name: 'trump-goggles',
      version: '18.5.0',
      environment: 'extension',
    });

    // Create and assign the legacy compatibility shim
    const legacyShim = createLegacyShim(this._structured);
    // Type assertion needed due to existing LoggerInterface declaration
    // This will be resolved when we complete the migration to structured logging
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
