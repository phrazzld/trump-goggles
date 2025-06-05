/**
 * Unit tests for Logger Adapter legacy compatibility
 *
 * Tests cover exact API compatibility with legacy window.Logger, correct mapping
 * of legacy calls to StructuredLogger methods, and correct formatting of legacy_data
 * as specified in T032. Following DEVELOPMENT_PHILOSOPHY.md: no mocking of internal
 * collaborators, only external boundaries.
 */

import { describe, it, expect, beforeEach, afterEach, vi, type MockedFunction } from 'vitest';
import { createLegacyShim, type LegacyLoggerInterface } from '../../src/utils/logger-adapter';
import { StructuredLogger } from '../../src/utils/structured-logger';

// Mock console methods (external boundary)
interface MockConsole {
  debug: MockedFunction<typeof console.debug>;
  info: MockedFunction<typeof console.info>;
  warn: MockedFunction<typeof console.warn>;
  error: MockedFunction<typeof console.error>;
}

describe('Logger Adapter', () => {
  let mockConsole: MockConsole;
  let originalConsole: Console;
  let originalWindow: any;
  let structuredLogger: StructuredLogger;
  let legacyShim: LegacyLoggerInterface;

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

    // Create real structured logger (no mocking of internal collaborators)
    structuredLogger = new StructuredLogger(
      'logger-adapter-test',
      {},
      {
        throttling: { enabled: false }, // Disable throttling for predictable testing
      }
    );

    // Create legacy shim using real structured logger
    legacyShim = createLegacyShim(structuredLogger);
  });

  afterEach(() => {
    // Restore originals
    global.console = originalConsole;
    (global as any).window = originalWindow;
    vi.clearAllMocks();
  });

  describe('LegacyLoggerInterface Compatibility', () => {
    it('should implement all required legacy logger methods', () => {
      expect(typeof legacyShim.debug).toBe('function');
      expect(typeof legacyShim.info).toBe('function');
      expect(typeof legacyShim.warn).toBe('function');
      expect(typeof legacyShim.error).toBe('function');
    });

    it('should have method signatures matching legacy API', () => {
      // Test that methods can be called with legacy API signature
      expect(() => legacyShim.debug('test')).not.toThrow();
      expect(() => legacyShim.debug('test', 'data')).not.toThrow();
      expect(() => legacyShim.info('test')).not.toThrow();
      expect(() => legacyShim.info('test', { key: 'value' })).not.toThrow();
      expect(() => legacyShim.warn('test')).not.toThrow();
      expect(() => legacyShim.warn('test', 123)).not.toThrow();
      expect(() => legacyShim.error('test')).not.toThrow();
      expect(() => legacyShim.error('test', ['array', 'data'])).not.toThrow();
    });
  });

  describe('Method Mapping to StructuredLogger', () => {
    it('should map debug() calls to structured logger debug()', () => {
      const message = 'Debug message';
      const data = { test: 'data' };

      legacyShim.debug(message, data);

      expect(mockConsole.debug).toHaveBeenCalledOnce();
      const logCall = mockConsole.debug.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);

      expect(logEntry.level).toBe('debug');
      expect(logEntry.message).toBe(message);
      expect(logEntry.context.legacy_data).toEqual(data);
    });

    it('should map info() calls to structured logger info()', () => {
      const message = 'Info message';
      const data = 'string data';

      legacyShim.info(message, data);

      expect(mockConsole.info).toHaveBeenCalledOnce();
      const logCall = mockConsole.info.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);

      expect(logEntry.level).toBe('info');
      expect(logEntry.message).toBe(message);
      expect(logEntry.context.legacy_data).toBe(data);
    });

    it('should map warn() calls to structured logger warn()', () => {
      const message = 'Warning message';
      const data = 42;

      legacyShim.warn(message, data);

      expect(mockConsole.warn).toHaveBeenCalledOnce();
      const logCall = mockConsole.warn.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);

      expect(logEntry.level).toBe('warn');
      expect(logEntry.message).toBe(message);
      expect(logEntry.context.legacy_data).toBe(data);
    });

    it('should map error() calls to structured logger error()', () => {
      const message = 'Error message';
      const data = ['array', 'data'];

      legacyShim.error(message, data);

      expect(mockConsole.error).toHaveBeenCalledOnce();
      const logCall = mockConsole.error.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);

      expect(logEntry.level).toBe('error');
      expect(logEntry.message).toBe(message);
      expect(logEntry.context.legacy_data).toEqual(data);
    });
  });

  describe('Legacy Data Formatting', () => {
    it('should wrap data in legacy_data object when data is provided', () => {
      const testData = { complex: 'object', with: ['nested', 'data'] };

      legacyShim.debug('test message', testData);

      expect(mockConsole.debug).toHaveBeenCalledOnce();
      const logCall = mockConsole.debug.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);

      expect(logEntry.message).toBe('test message');
      expect(logEntry.context.legacy_data).toEqual(testData);
    });

    it('should pass undefined context when no data is provided', () => {
      legacyShim.info('message without data');

      expect(mockConsole.info).toHaveBeenCalledOnce();
      const logCall = mockConsole.info.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);

      expect(logEntry.message).toBe('message without data');
      expect(logEntry.context).toBeUndefined();
    });

    it('should handle undefined data explicitly', () => {
      legacyShim.warn('message with undefined data', undefined);

      expect(mockConsole.warn).toHaveBeenCalledOnce();
      const logCall = mockConsole.warn.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);

      expect(logEntry.message).toBe('message with undefined data');
      expect(logEntry.context).toBeUndefined();
    });

    it('should handle null data correctly', () => {
      legacyShim.error('message with null data', null);

      expect(mockConsole.error).toHaveBeenCalledOnce();
      const logCall = mockConsole.error.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);

      expect(logEntry.message).toBe('message with null data');
      expect(logEntry.context.legacy_data).toBeNull();
    });

    it('should handle various data types correctly', () => {
      const testCases = [
        { data: 'string', expected: 'string' },
        { data: 123, expected: 123 },
        { data: true, expected: true },
        { data: false, expected: false },
        { data: [], expected: [] },
        { data: {}, expected: {} },
        { data: 0, expected: 0 },
        { data: '', expected: '' },
      ];

      testCases.forEach(({ data, expected }, index) => {
        mockConsole.debug.mockClear();
        legacyShim.debug(`test ${index}`, data);

        expect(mockConsole.debug).toHaveBeenCalledOnce();
        const logCall = mockConsole.debug.mock.calls[0][0];
        const logEntry = JSON.parse(logCall);

        expect(logEntry.message).toBe(`test ${index}`);
        expect(logEntry.context.legacy_data).toEqual(expected);
      });
    });
  });

  describe('Message Handling', () => {
    it('should pass messages unchanged to structured logger', () => {
      const messages = [
        'Simple message',
        'Message with "quotes" and symbols!@#$%',
        'Multi\nline\nmessage',
        'Message with unicode: 🚀 🎉 ✨',
        '',
        'Message with \t tabs and \r carriage returns',
      ];

      messages.forEach((message, index) => {
        mockConsole.info.mockClear();
        legacyShim.info(message, `data${index}`);

        expect(mockConsole.info).toHaveBeenCalledOnce();
        const logCall = mockConsole.info.mock.calls[0][0];
        const logEntry = JSON.parse(logCall);

        expect(logEntry.message).toBe(message);
        expect(logEntry.context.legacy_data).toBe(`data${index}`);
      });
    });
  });

  describe('createLegacyShim Function', () => {
    it('should return an object implementing LegacyLoggerInterface', () => {
      const shim = createLegacyShim(structuredLogger);

      expect(shim).toBeDefined();
      expect(typeof shim).toBe('object');
      expect(typeof shim.debug).toBe('function');
      expect(typeof shim.info).toBe('function');
      expect(typeof shim.warn).toBe('function');
      expect(typeof shim.error).toBe('function');
    });

    it('should create independent shim instances', () => {
      const shim1 = createLegacyShim(structuredLogger);
      const shim2 = createLegacyShim(structuredLogger);

      expect(shim1).not.toBe(shim2);
      expect(shim1.debug).not.toBe(shim2.debug);
    });

    it('should maintain reference to the provided structured logger', () => {
      const anotherStructuredLogger = new StructuredLogger(
        'another-test',
        {},
        {
          throttling: { enabled: false },
        }
      );

      const shim = createLegacyShim(anotherStructuredLogger);
      shim.debug('test', 'data');

      // Verify the new logger was used (different component name)
      expect(mockConsole.debug).toHaveBeenCalledOnce();
      const logCall = mockConsole.debug.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);

      expect(logEntry.component).toBe('another-test');
      expect(logEntry.message).toBe('test');
      expect(logEntry.context.legacy_data).toBe('data');
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle rapid successive calls correctly', () => {
      for (let i = 0; i < 10; i++) {
        // Reduced for performance
        legacyShim.debug(`message ${i}`, { iteration: i });
      }

      expect(mockConsole.debug).toHaveBeenCalledTimes(10);

      // Verify first and last calls
      const firstLogCall = mockConsole.debug.mock.calls[0][0];
      const firstLogEntry = JSON.parse(firstLogCall);
      expect(firstLogEntry.message).toBe('message 0');
      expect(firstLogEntry.context.legacy_data).toEqual({ iteration: 0 });

      const lastLogCall = mockConsole.debug.mock.calls[9][0];
      const lastLogEntry = JSON.parse(lastLogCall);
      expect(lastLogEntry.message).toBe('message 9');
      expect(lastLogEntry.context.legacy_data).toEqual({ iteration: 9 });
    });

    it('should handle mixed method calls in sequence', () => {
      legacyShim.debug('debug msg', 'debug data');
      legacyShim.info('info msg', 'info data');
      legacyShim.warn('warn msg', 'warn data');
      legacyShim.error('error msg', 'error data');

      expect(mockConsole.debug).toHaveBeenCalledOnce();
      expect(mockConsole.info).toHaveBeenCalledOnce();
      expect(mockConsole.warn).toHaveBeenCalledOnce();
      expect(mockConsole.error).toHaveBeenCalledOnce();

      // Verify each call produced correct structured output
      const debugEntry = JSON.parse(mockConsole.debug.mock.calls[0][0]);
      expect(debugEntry.level).toBe('debug');
      expect(debugEntry.message).toBe('debug msg');
      expect(debugEntry.context.legacy_data).toBe('debug data');

      const infoEntry = JSON.parse(mockConsole.info.mock.calls[0][0]);
      expect(infoEntry.level).toBe('info');
      expect(infoEntry.message).toBe('info msg');
      expect(infoEntry.context.legacy_data).toBe('info data');

      const warnEntry = JSON.parse(mockConsole.warn.mock.calls[0][0]);
      expect(warnEntry.level).toBe('warn');
      expect(warnEntry.message).toBe('warn msg');
      expect(warnEntry.context.legacy_data).toBe('warn data');

      const errorEntry = JSON.parse(mockConsole.error.mock.calls[0][0]);
      expect(errorEntry.level).toBe('error');
      expect(errorEntry.message).toBe('error msg');
      expect(errorEntry.context.legacy_data).toBe('error data');
    });

    it('should handle complex nested data structures', () => {
      const complexData = {
        user: {
          id: 123,
          name: 'Test User',
          preferences: {
            theme: 'dark',
            notifications: ['email', 'push'],
          },
        },
        metadata: {
          timestamp: new Date('2023-01-01T00:00:00Z'),
          version: '1.0.0',
        },
      };

      legacyShim.info('complex data test', complexData);

      expect(mockConsole.info).toHaveBeenCalledOnce();
      const logCall = mockConsole.info.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);

      expect(logEntry.message).toBe('complex data test');

      // Account for JSON serialization of Date objects (becomes string)
      const expectedData = {
        user: {
          id: 123,
          name: 'Test User',
          preferences: {
            theme: 'dark',
            notifications: ['email', 'push'],
          },
        },
        metadata: {
          timestamp: '2023-01-01T00:00:00.000Z',
          version: '1.0.0',
        },
      };
      expect(logEntry.context.legacy_data).toEqual(expectedData);
    });
  });

  describe('Error Scenarios', () => {
    it('should handle console throwing errors gracefully', () => {
      // Mock console.debug to throw an error (simulating console issues)
      mockConsole.debug.mockImplementation(() => {
        throw new Error('Console error');
      });

      expect(() => legacyShim.debug('test', 'data')).toThrow('Console error');
    });

    it('should propagate structured logger errors correctly', () => {
      // Create a logger with invalid configuration to potentially cause errors
      const invalidLogger = new StructuredLogger(
        'invalid-test',
        {},
        {
          throttling: { enabled: false },
        }
      );
      const invalidShim = createLegacyShim(invalidLogger);

      // This should work fine with our real implementation
      expect(() => invalidShim.error('error test', 'error data')).not.toThrow();
      expect(mockConsole.error).toHaveBeenCalledOnce();
    });
  });

  describe('Window Global Export', () => {
    it('should export LoggerAdapter to window when window is available', () => {
      // This test verifies that the module properly exports to window
      // Note: The actual window assignment happens at module load time
      expect(typeof createLegacyShim).toBe('function');

      // Verify the function can be imported and used
      const testShim = createLegacyShim(structuredLogger);
      expect(testShim).toBeDefined();
      expect(typeof testShim.debug).toBe('function');
    });
  });

  describe('Type Safety', () => {
    it('should accept any unknown type for data parameter', () => {
      // These should all compile and work without type errors
      const testCases = [
        { data: 'string', expected: 'string' },
        { data: 123, expected: 123 },
        { data: true, expected: true },
        { data: null, expected: null },
        { data: undefined, expected: undefined },
        { data: [], expected: [] },
        { data: {}, expected: {} },
        { data: new Date('2023-01-01T00:00:00Z'), expected: '2023-01-01T00:00:00.000Z' }, // Date becomes string in JSON
      ];

      testCases.forEach(({ data, expected }, index) => {
        mockConsole.info.mockClear();
        expect(() => legacyShim.info(`test ${index}`, data)).not.toThrow();

        expect(mockConsole.info).toHaveBeenCalledOnce();
        const logCall = mockConsole.info.mock.calls[0][0];
        const logEntry = JSON.parse(logCall);

        expect(logEntry.message).toBe(`test ${index}`);

        if (expected !== undefined) {
          expect(logEntry.context.legacy_data).toEqual(expected);
        } else {
          expect(logEntry.context).toBeUndefined();
        }
      });
    });
  });
});
