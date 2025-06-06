/**
 * CI Log Validation Test
 *
 * This test specifically generates structured logs without mocking console
 * to allow CI pipeline to capture and validate log output structure.
 * Used by CI pipeline for automated log structure validation.
 */

import { describe, it, beforeEach, afterEach } from 'vitest';

describe('CI Log Structure Validation', () => {
  let originalWindow: any;
  let originalConsole: any;

  beforeEach(() => {
    // Save original window and console
    originalWindow = { ...((global as any).window || {}) };
    originalConsole = { ...global.console };

    // Override console methods to write directly to stdout/stderr for CI capture
    global.console = {
      ...global.console,
      debug: (...args: any[]) => process.stdout.write(args.join(' ') + '\n'),
      info: (...args: any[]) => process.stdout.write(args.join(' ') + '\n'),
      warn: (...args: any[]) => process.stderr.write(args.join(' ') + '\n'),
      error: (...args: any[]) => process.stderr.write(args.join(' ') + '\n'),
      log: (...args: any[]) => process.stdout.write(args.join(' ') + '\n'),
    };

    // Set up window globals for dependencies WITHOUT mocking console
    // Note: Core logging modules already loaded by test setup
    (global as any).window = {
      ...(global as any).window, // Preserve existing globals from test setup
      SecurityUtils: {
        sanitizeForLogging: (data: unknown) => data, // Pass-through for testing
      },
    };

    // Reset (window as any).LoggerFactory state
    ((window as any).LoggerFactory as any)._structured = null;

    // Clear any existing window.Logger
    delete (global as any).window.Logger;

    // Initialize logger factory
    (window as any).LoggerFactory.initialize();
  });

  afterEach(() => {
    // Restore original window and console
    (global as any).window = originalWindow;
    global.console = originalConsole;

    // Reset (window as any).LoggerFactory state
    ((window as any).LoggerFactory as any)._structured = null;
  });

  it('should generate valid structured logs for CI validation', () => {
    // Generate various types of logs that the CI pipeline will capture and validate

    // Basic logger usage
    const basicLogger = (window as any).LoggerFactory.getLogger('ci-validation-basic');
    basicLogger.info('CI validation test - basic info log', { test_data: 'basic_test' });
    basicLogger.debug('CI validation test - debug log');
    basicLogger.warn('CI validation test - warning log', { warning_type: 'test_warning' });

    // Child logger usage
    const childLogger = basicLogger.child('child-component');
    childLogger.info('CI validation test - child logger info');

    // Logger with context
    const contextLogger = basicLogger.withContext({ operation: 'ci_validation', step: 1 });
    contextLogger.info('CI validation test - context logger');

    // Error logging with error details
    const errorLogger = (window as any).LoggerFactory.getLogger('ci-validation-error');
    const testError = new Error('Test error for CI validation');
    errorLogger.error('CI validation test - error with details', {
      error: testError,
      operation_id: 'test_op_123',
    });

    // Multiple components demonstrating correlation ID propagation
    const componentA = (window as any).LoggerFactory.getLogger('component-a');
    const componentB = (window as any).LoggerFactory.getLogger('component-b');
    const componentC = (window as any).LoggerFactory.getLogger('component-c');

    componentA.info('CI validation - component A operation start');
    componentB.debug('CI validation - component B processing');
    componentC.warn('CI validation - component C warning');

    // Legacy logger compatibility
    const legacyLogger = (global as any).window.Logger;
    legacyLogger.info('CI validation - legacy logger test', { legacy_data: { key: 'value' } });

    // Nested child loggers
    const parentLogger = (window as any).LoggerFactory.getLogger('parent-service');
    const nestedChild = parentLogger.child('nested').child('deep-nested');
    nestedChild.info('CI validation - deeply nested logger');

    // Logger with complex context
    const complexLogger = (window as any).LoggerFactory.getLogger('complex-service');
    const richContextLogger = complexLogger
      .withContext({ user_id: 'user123', session_id: 'session456' })
      .withContext({ transaction_id: 'txn789', operation: 'complex_test' });
    richContextLogger.info('CI validation - complex context logger');

    // High-level workflow simulation
    const workflowLogger = (window as any).LoggerFactory.getLogger('workflow-manager');
    workflowLogger.info('CI validation - workflow started', {
      workflow_id: 'ci_test_workflow',
      user_id: 'test_user',
      timestamp: new Date().toISOString(),
    });

    const stepLogger = workflowLogger.withContext({ step: 'data_processing' });
    stepLogger.debug('CI validation - processing user data');

    const resultLogger = stepLogger.withContext({ step: 'completion' });
    resultLogger.info('CI validation - workflow completed successfully');

    // Note: All console output from these loggers will be captured by CI
    // and validated using scripts/validate-logs.ts
  });

  it('should generate logs with proper error serialization', () => {
    const errorLogger = (window as any).LoggerFactory.getLogger('error-test-service');

    // Test different types of errors
    const standardError = new Error('Standard error for CI test');
    const customError = new TypeError('Type error for CI test');

    errorLogger.error('CI validation - standard error test', { error: standardError });
    errorLogger.error('CI validation - custom error test', {
      error: customError,
      additional_context: 'test_context',
    });

    // Error with stack trace
    try {
      throw new Error('Thrown error for CI test');
    } catch (error) {
      errorLogger.error('CI validation - caught error with stack', {
        error,
        catch_location: 'ci_test',
      });
    }
  });

  it('should generate logs demonstrating all log levels', () => {
    const levelLogger = (window as any).LoggerFactory.getLogger('level-test-service');

    // Test all log levels
    levelLogger.debug('CI validation - debug level test', {
      level: 'debug',
      test_id: 'level_test_1',
    });
    levelLogger.info('CI validation - info level test', { level: 'info', test_id: 'level_test_2' });
    levelLogger.warn('CI validation - warn level test', { level: 'warn', test_id: 'level_test_3' });
    levelLogger.error('CI validation - error level test', {
      level: 'error',
      test_id: 'level_test_4',
    });
  });

  it('should generate logs with various context types', () => {
    const contextLogger = (window as any).LoggerFactory.getLogger('context-test-service');

    // Different context types
    contextLogger
      .withContext({
        string_value: 'test_string',
        number_value: 42,
        boolean_value: true,
        array_value: ['item1', 'item2'],
        object_value: { nested: 'value' },
        null_value: null,
      })
      .info('CI validation - mixed context types');

    // Large context object
    contextLogger
      .withContext({
        large_context: {
          user: { id: 'user123', name: 'Test User', roles: ['admin', 'user'] },
          session: { id: 'session456', started: '2023-01-01T00:00:00Z' },
          operation: { type: 'ci_test', version: '1.0.0', metadata: { key: 'value' } },
        },
      })
      .info('CI validation - large context object');

    // Empty context
    contextLogger.withContext({}).info('CI validation - empty context');
  });
});
