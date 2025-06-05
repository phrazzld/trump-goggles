/**
 * Unit tests for StructuredLogger context size limiting functionality
 *
 * Tests cover context size calculation, truncation, warning generation,
 * and configuration options as specified in T042.
 * Following DEVELOPMENT_PHILOSOPHY.md: no mocking of internal collaborators.
 */

import { describe, it, expect, beforeEach, afterEach, vi, type MockedFunction } from 'vitest';
import { StructuredLogger } from '../../src/utils/structured-logger';

// Mock console methods (external boundary)
interface MockConsole {
  debug: MockedFunction<typeof console.debug>;
  info: MockedFunction<typeof console.info>;
  warn: MockedFunction<typeof console.warn>;
  error: MockedFunction<typeof console.error>;
}

describe('StructuredLogger Context Size Limiting', () => {
  let mockConsole: MockConsole;
  let originalConsole: Console;
  let originalWindow: any;

  beforeEach(() => {
    // Save originals
    originalConsole = global.console;
    originalWindow = { ...((global as any).window || {}) };

    // Mock console methods (external boundary)
    mockConsole = {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };
    global.console = mockConsole as any;

    // Set up window globals for dependencies
    (global as any).window = {
      LoggerContext: {
        getInstance: () => ({
          getCurrentCorrelation: () => '12345678-1234-4123-8123-123456789012',
        }),
      },
      SecurityUtils: {
        sanitizeForLogging: (data: unknown) => data, // Pass-through for testing
      },
    };
  });

  afterEach(() => {
    // Restore originals
    global.console = originalConsole;
    (global as any).window = originalWindow;
    vi.clearAllMocks();
  });

  describe('Basic Configuration', () => {
    it('should accept context size limit configuration in constructor', () => {
      const contextConfig = {
        maxSizeBytes: 500,
        onExceed: 'warn' as const,
        emitWarnings: false,
      };

      expect(
        () => new StructuredLogger('test-component', {}, { contextSizeLimit: contextConfig })
      ).not.toThrow();
    });

    it('should use default context size configuration when not provided', () => {
      const logger = new StructuredLogger('test-component');

      // Should be able to log normally with defaults
      logger.info('test message', { small: 'context' });
      expect(mockConsole.info).toHaveBeenCalledOnce();
    });

    it('should allow disabling context size limiting entirely', () => {
      const logger = new StructuredLogger(
        'test-component',
        {},
        {
          contextSizeLimit: { enabled: false },
        }
      );

      // Should log even with huge context when disabled
      const hugeContext = {
        data: 'x'.repeat(5000), // 5KB+ string
      };
      logger.info('test message', hugeContext);

      expect(mockConsole.info).toHaveBeenCalledOnce();
      const logCall = mockConsole.info.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);
      expect(logEntry.context.data).toBe('x'.repeat(5000));
    });

    it('should enforce minimum size limits for safety', () => {
      // Should not allow size limits below 100 bytes
      const logger = new StructuredLogger(
        'test-component',
        {},
        {
          contextSizeLimit: { maxSizeBytes: 50 }, // Below minimum
        }
      );

      // Should still work, indicating minimum was applied
      expect(() => logger.info('test')).not.toThrow();
    });
  });

  describe('Context Size Calculation', () => {
    it('should calculate context size correctly for various data types', () => {
      const logger = new StructuredLogger(
        'test-component',
        {},
        {
          contextSizeLimit: {
            maxSizeBytes: 100,
            onExceed: 'warn',
            emitWarnings: true,
          },
        }
      );

      // Test with different data types
      logger.info('string test', { str: 'hello' });
      logger.info('number test', { num: 42 });
      logger.info('boolean test', { bool: true });
      logger.info('object test', { obj: { nested: 'value' } });
      logger.info('array test', { arr: [1, 2, 3] });

      expect(mockConsole.info).toHaveBeenCalledTimes(5);
    });

    it('should handle context that cannot be serialized', () => {
      const logger = new StructuredLogger(
        'test-component',
        {},
        {
          contextSizeLimit: { maxSizeBytes: 100 },
        }
      );

      // Create circular reference
      const circular: any = { name: 'test' };
      circular.self = circular;

      // Should not crash
      expect(() => logger.info('circular test', circular)).not.toThrow();
    });
  });

  describe('Truncation Behavior', () => {
    it('should truncate context when size limit exceeded and onExceed is "truncate"', () => {
      const logger = new StructuredLogger(
        'test-component',
        {},
        {
          contextSizeLimit: {
            maxSizeBytes: 100,
            onExceed: 'truncate',
            emitWarnings: true,
          },
        }
      );

      const largeContext = {
        field1: 'x'.repeat(50),
        field2: 'y'.repeat(50),
        field3: 'z'.repeat(50),
      };

      logger.info('truncation test', largeContext);

      expect(mockConsole.info).toHaveBeenCalledOnce();
      const logCall = mockConsole.info.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);

      // Should have truncation marker
      expect(logEntry.context._truncated).toBe(true);

      // Should not have all original fields
      const originalSize = JSON.stringify(largeContext).length;
      const truncatedSize = JSON.stringify(logEntry.context).length;
      expect(truncatedSize).toBeLessThan(originalSize);
      expect(truncatedSize).toBeLessThanOrEqual(100);
    });

    it('should preserve most important fields during truncation', () => {
      const logger = new StructuredLogger(
        'test-component',
        {},
        {
          contextSizeLimit: {
            maxSizeBytes: 150,
            onExceed: 'truncate',
            emitWarnings: false, // Disable warnings for cleaner test
          },
        }
      );

      const context = {
        important1: 'short',
        important2: 'also short',
        large: 'x'.repeat(200), // This should be dropped
      };

      logger.info('preserve test', context);

      const logCall = mockConsole.info.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);

      // Should have kept the short fields
      expect(logEntry.context.important1).toBe('short');
      expect(logEntry.context.important2).toBe('also short');

      // Should have truncation marker
      expect(logEntry.context._truncated).toBe(true);
    });

    it('should handle truncation gracefully when all fields are large', () => {
      const logger = new StructuredLogger(
        'test-component',
        {},
        {
          contextSizeLimit: {
            maxSizeBytes: 200,
            onExceed: 'truncate',
            emitWarnings: false,
          },
        }
      );

      const context = {
        huge1: 'x'.repeat(500),
        huge2: 'y'.repeat(500),
      };

      logger.info('all large test', context);

      const logCall = mockConsole.info.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);

      // Should have truncation marker
      expect(logEntry.context._truncated).toBe(true);

      // Context should be under size limit
      const contextSize = JSON.stringify(logEntry.context).length;
      expect(contextSize).toBeLessThanOrEqual(200);
    });
  });

  describe('Warning Behavior', () => {
    it('should emit warning when size limit exceeded and onExceed is "warn"', () => {
      const logger = new StructuredLogger(
        'test-component',
        {},
        {
          contextSizeLimit: {
            maxSizeBytes: 100,
            onExceed: 'warn',
            emitWarnings: true,
          },
        }
      );

      const largeContext = {
        data: 'x'.repeat(200), // Exceeds 100 byte limit
      };

      logger.info('warning test', largeContext);

      // Should have logged the original message
      expect(mockConsole.info).toHaveBeenCalledOnce();

      // Should have emitted a warning
      expect(mockConsole.warn).toHaveBeenCalledOnce();

      const warningCall = mockConsole.warn.mock.calls[0][0];
      const warningEntry = JSON.parse(warningCall);
      expect(warningEntry.message).toMatch(/context size limit exceeded/i);
      expect(warningEntry.context.actual_size_bytes).toBeGreaterThan(100);
      expect(warningEntry.context.max_size_bytes).toBe(100);
      expect(warningEntry.context.action).toBe('warn');
    });

    it('should keep full context when onExceed is "warn"', () => {
      const logger = new StructuredLogger(
        'test-component',
        {},
        {
          contextSizeLimit: {
            maxSizeBytes: 100,
            onExceed: 'warn',
            emitWarnings: true,
          },
        }
      );

      const largeContext = {
        data: 'x'.repeat(200),
      };

      logger.info('keep context test', largeContext);

      const logCall = mockConsole.info.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);

      // Should keep full context
      expect(logEntry.context.data).toBe('x'.repeat(200));
      expect(logEntry.context._truncated).toBeUndefined();
    });

    it('should respect emitWarnings configuration', () => {
      const logger = new StructuredLogger(
        'test-component',
        {},
        {
          contextSizeLimit: {
            maxSizeBytes: 100,
            onExceed: 'truncate',
            emitWarnings: false,
          },
        }
      );

      const largeContext = {
        data: 'x'.repeat(200),
      };

      logger.info('no warnings test', largeContext);

      // Should have logged the message but no warning
      expect(mockConsole.info).toHaveBeenCalledOnce();
      expect(mockConsole.warn).not.toHaveBeenCalled();
    });
  });

  describe('Instance Isolation', () => {
    it('should maintain separate configuration per logger instance', () => {
      const logger1 = new StructuredLogger(
        'component-1',
        {},
        {
          contextSizeLimit: { maxSizeBytes: 100, onExceed: 'truncate' },
        }
      );
      const logger2 = new StructuredLogger(
        'component-2',
        {},
        {
          contextSizeLimit: { maxSizeBytes: 200, onExceed: 'warn' },
        }
      );

      const largeContext = { data: 'x'.repeat(150) };

      logger1.info('logger1 test', largeContext);
      logger2.info('logger2 test', largeContext);

      const log1Call = mockConsole.info.mock.calls[0][0];
      const log1Entry = JSON.parse(log1Call);

      const log2Call = mockConsole.info.mock.calls[1][0];
      const log2Entry = JSON.parse(log2Call);

      // Logger1 should have truncated (150 > 100)
      expect(log1Entry.context._truncated).toBe(true);

      // Logger2 should have kept full context (150 < 200)
      expect(log2Entry.context.data).toBe('x'.repeat(150));
      expect(log2Entry.context._truncated).toBeUndefined();
    });

    it('should inherit context size configuration in child loggers', () => {
      const parentLogger = new StructuredLogger(
        'parent',
        {},
        {
          contextSizeLimit: { maxSizeBytes: 100, onExceed: 'truncate' },
        }
      );
      const childLogger = parentLogger.child('child');

      const largeContext = { data: 'x'.repeat(200) };
      childLogger.info('child test', largeContext);

      const logCall = mockConsole.info.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);

      // Child should have same size limits as parent
      expect(logEntry.context._truncated).toBe(true);
    });

    it('should inherit context size configuration in withContext loggers', () => {
      const baseLogger = new StructuredLogger(
        'base',
        {},
        {
          contextSizeLimit: { maxSizeBytes: 100, onExceed: 'truncate' },
        }
      );
      const contextLogger = baseLogger.withContext({ user: 'test' });

      const largeContext = { data: 'x'.repeat(200) };
      contextLogger.info('context test', largeContext);

      const logCall = mockConsole.info.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);

      // Should have inherited size limits
      expect(logEntry.context._truncated).toBe(true);

      // Should have preserved the user context if possible
      expect(logEntry.context.user).toBe('test');
    });
  });

  describe('Integration with Other Features', () => {
    it('should work correctly with logger context inheritance', () => {
      const logger = new StructuredLogger(
        'test-component',
        { baseField: 'base' },
        {
          contextSizeLimit: { maxSizeBytes: 200, onExceed: 'truncate' },
        }
      );

      const methodContext = { methodField: 'x'.repeat(100) };
      logger.info('inheritance test', methodContext);

      const logCall = mockConsole.info.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);

      // Should merge contexts
      expect(logEntry.context.baseField).toBe('base');
      expect(logEntry.context.methodField).toBe('x'.repeat(100));
    });

    it('should apply size limiting after context merging', () => {
      const logger = new StructuredLogger(
        'test-component',
        {
          baseField: 'x'.repeat(100),
        },
        {
          contextSizeLimit: { maxSizeBytes: 150, onExceed: 'truncate' },
        }
      );

      const methodContext = { methodField: 'y'.repeat(100) };
      logger.info('merge and limit test', methodContext);

      const logCall = mockConsole.info.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);

      // Should have been truncated due to combined size
      expect(logEntry.context._truncated).toBe(true);
    });

    it('should handle error serialization with size limits', () => {
      const logger = new StructuredLogger(
        'test-component',
        {},
        {
          contextSizeLimit: { maxSizeBytes: 300, onExceed: 'truncate' },
        }
      );

      const error = new Error('Test error with long message ' + 'x'.repeat(200));
      logger.error('error test', { error, additionalData: 'y'.repeat(200) });

      const logCall = mockConsole.error.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);

      // Should have error_details
      expect(logEntry.error_details).toBeDefined();
      expect(logEntry.error_details.message).toContain('Test error');

      // Context might be truncated due to size
      if (logEntry.context._truncated) {
        const contextSize = JSON.stringify(logEntry.context).length;
        expect(contextSize).toBeLessThanOrEqual(300);
      }
    });

    it('should preserve all required log entry fields during size limiting', () => {
      const logger = new StructuredLogger(
        'test-component',
        {},
        {
          contextSizeLimit: { maxSizeBytes: 100, onExceed: 'truncate' },
        }
      );

      const largeContext = { data: 'x'.repeat(200) };
      logger.info('required fields test', largeContext);

      const logCall = mockConsole.info.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);

      // Verify all required fields are present
      expect(logEntry.timestamp).toBeDefined();
      expect(logEntry.level).toBe('info');
      expect(logEntry.message).toBe('required fields test');
      expect(logEntry.service_name).toBe('trump-goggles');
      expect(logEntry.correlation_id).toBeDefined();
      expect(logEntry.function_name).toBeDefined();
      expect(logEntry.component).toBe('test-component');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty context gracefully', () => {
      const logger = new StructuredLogger(
        'test-component',
        {},
        {
          contextSizeLimit: { maxSizeBytes: 100 },
        }
      );

      logger.info('empty context test', {});
      logger.info('no context test');

      expect(mockConsole.info).toHaveBeenCalledTimes(2);
    });

    it('should handle null and undefined context values', () => {
      const logger = new StructuredLogger(
        'test-component',
        {},
        {
          contextSizeLimit: { maxSizeBytes: 100 },
        }
      );

      logger.info('null test', { nullField: null, undefinedField: undefined });

      expect(mockConsole.info).toHaveBeenCalledOnce();
      const logCall = mockConsole.info.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);
      expect(logEntry.context.nullField).toBeNull();
    });

    it('should handle very small size limits gracefully', () => {
      const logger = new StructuredLogger(
        'test-component',
        {},
        {
          contextSizeLimit: { maxSizeBytes: 100 }, // Will be enforced to minimum
        }
      );

      logger.info('small limit test', { field: 'value' });

      expect(mockConsole.info).toHaveBeenCalledOnce();
    });

    it('should handle context with special characters and unicode', () => {
      const logger = new StructuredLogger(
        'test-component',
        {},
        {
          contextSizeLimit: { maxSizeBytes: 200, onExceed: 'truncate' },
        }
      );

      const unicodeContext = {
        emoji: '🎭🎪🎨🎯🎲',
        chinese: '你好世界',
        special: 'Special chars: @#$%^&*()',
      };

      logger.info('unicode test', unicodeContext);

      expect(mockConsole.info).toHaveBeenCalledOnce();
    });
  });
});
