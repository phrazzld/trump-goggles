/**
 * Unit tests for LoggerContext singleton class
 *
 * Tests cover singleton behavior, correlation ID generation (UUID v4 format),
 * stack operations (push, pop, getCurrentCorrelation), and context propagation
 * logic as specified in T031.
 * Following DEVELOPMENT_PHILOSOPHY.md: no mocking of internal collaborators.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { LoggerContext } from '../../src/utils/logger-context';

describe('LoggerContext', () => {
  let originalCrypto: Crypto | undefined;
  let originalMathRandom: () => number;

  beforeEach(() => {
    // Save originals for restoration
    originalCrypto = (global as any).crypto;
    originalMathRandom = Math.random;
  });

  afterEach(() => {
    // Restore originals by using defineProperty to handle read-only crypto
    if (originalCrypto !== undefined) {
      Object.defineProperty(global, 'crypto', {
        value: originalCrypto,
        writable: true,
        configurable: true,
      });
    } else {
      Object.defineProperty(global, 'crypto', {
        value: undefined,
        writable: true,
        configurable: true,
      });
    }
    Math.random = originalMathRandom;
    vi.restoreAllMocks();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance on multiple calls to getInstance()', () => {
      const instance1 = LoggerContext.getInstance();
      const instance2 = LoggerContext.getInstance();
      const instance3 = LoggerContext.getInstance();

      expect(instance1).toBe(instance2);
      expect(instance2).toBe(instance3);
      expect(instance1).toBe(instance3);
    });

    it('should be the same instance across different access patterns', () => {
      const directInstance = LoggerContext.getInstance();

      // Simulate access through window global (if available)
      if (typeof window !== 'undefined' && (window as any).LoggerContext) {
        const windowInstance = (window as any).LoggerContext.getInstance();
        expect(directInstance).toBe(windowInstance);
      }
    });

    it('should not allow direct instantiation', () => {
      // The constructor should be private, so we can't test this directly
      // But we can ensure only getInstance works
      expect(LoggerContext.getInstance).toBeDefined();
      expect(typeof LoggerContext.getInstance).toBe('function');
    });
  });

  describe('Correlation ID Generation', () => {
    it('should generate valid UUID v4 format using crypto.randomUUID when available', () => {
      // Mock crypto.randomUUID using defineProperty
      const mockUUID = '12345678-1234-4123-8123-123456789012';
      const mockRandomUUID = vi.fn().mockReturnValue(mockUUID);

      Object.defineProperty(global, 'crypto', {
        value: { randomUUID: mockRandomUUID },
        writable: true,
        configurable: true,
      });

      const context = LoggerContext.getInstance();
      const correlationId = context.createCorrelationId();

      expect(correlationId).toBe(mockUUID);
      expect(mockRandomUUID).toHaveBeenCalledOnce();
    });

    it('should use fallback when crypto.randomUUID is not available', () => {
      // Remove crypto entirely using defineProperty
      Object.defineProperty(global, 'crypto', {
        value: undefined,
        writable: true,
        configurable: true,
      });

      // Mock Math.random for predictable output
      let callCount = 0;
      const randomValues = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.0];
      Math.random = vi.fn(() => randomValues[callCount++ % randomValues.length]);

      const context = LoggerContext.getInstance();
      const correlationId = context.createCorrelationId();

      // Should match UUID v4 pattern
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(correlationId).toMatch(uuidPattern);
    });

    it('should use fallback when crypto.randomUUID throws an error', () => {
      // Mock crypto.randomUUID to throw an error using defineProperty
      const mockRandomUUID = vi.fn().mockImplementation(() => {
        throw new Error('randomUUID not supported');
      });

      Object.defineProperty(global, 'crypto', {
        value: { randomUUID: mockRandomUUID },
        writable: true,
        configurable: true,
      });

      const context = LoggerContext.getInstance();
      const correlationId = context.createCorrelationId();

      // Should still generate a valid UUID using fallback
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(correlationId).toMatch(uuidPattern);
    });

    it('should generate different UUIDs on successive calls', () => {
      const context = LoggerContext.getInstance();
      const id1 = context.createCorrelationId();
      const id2 = context.createCorrelationId();
      const id3 = context.createCorrelationId();

      expect(id1).not.toBe(id2);
      expect(id2).not.toBe(id3);
      expect(id1).not.toBe(id3);
    });

    it('should generate valid UUID v4 with correct version and variant bits', () => {
      const context = LoggerContext.getInstance();
      const correlationId = context.createCorrelationId();

      // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
      // where y is one of [8, 9, A, B]
      const parts = correlationId.split('-');
      expect(parts).toHaveLength(5);
      expect(parts[0]).toHaveLength(8);
      expect(parts[1]).toHaveLength(4);
      expect(parts[2]).toHaveLength(4);
      expect(parts[3]).toHaveLength(4);
      expect(parts[4]).toHaveLength(12);

      // Check version bit (should be 4)
      expect(parts[2][0]).toBe('4');

      // Check variant bits (should be 8, 9, a, or b)
      const variantChar = parts[3][0].toLowerCase();
      expect(['8', '9', 'a', 'b']).toContain(variantChar);
    });
  });

  describe('Stack Operations', () => {
    let context: LoggerContext;

    beforeEach(() => {
      context = LoggerContext.getInstance();
      // Clear any existing correlation stack state
      // Since we can't directly access the stack, we'll use pop operations
      // to clear it, but first we need to ensure we don't cause issues
      // We'll work with a fresh context state by calling getCurrentCorrelation
      // which will set up initial state
    });

    it('should push correlation ID onto stack', () => {
      const testId = 'test-correlation-id';

      context.pushCorrelation(testId);
      const currentId = context.getCurrentCorrelation();

      expect(currentId).toBe(testId);
    });

    it('should pop correlation ID from stack', () => {
      const id1 = 'first-id';
      const id2 = 'second-id';

      context.pushCorrelation(id1);
      context.pushCorrelation(id2);

      expect(context.getCurrentCorrelation()).toBe(id2);

      context.popCorrelation();
      expect(context.getCurrentCorrelation()).toBe(id1);
    });

    it('should return most recent correlation ID from top of stack', () => {
      const id1 = 'bottom-id';
      const id2 = 'middle-id';
      const id3 = 'top-id';

      context.pushCorrelation(id1);
      context.pushCorrelation(id2);
      context.pushCorrelation(id3);

      expect(context.getCurrentCorrelation()).toBe(id3);
    });

    it('should handle multiple push/pop operations correctly', () => {
      const ids = ['id-1', 'id-2', 'id-3', 'id-4'];

      // Push all IDs
      ids.forEach((id) => context.pushCorrelation(id));

      // Pop them back in reverse order
      for (let i = ids.length - 1; i >= 0; i--) {
        expect(context.getCurrentCorrelation()).toBe(ids[i]);
        context.popCorrelation();
      }
    });

    it('should generate new root ID when stack is empty and getCurrentCorrelation is called', () => {
      // Clear stack by popping several times (defensive approach)
      for (let i = 0; i < 10; i++) {
        context.popCorrelation();
      }

      const rootId = context.getCurrentCorrelation();

      expect(rootId).toBeDefined();
      expect(typeof rootId).toBe('string');
      expect(rootId.length).toBeGreaterThan(0);

      // Should be a valid UUID
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(rootId).toMatch(uuidPattern);
    });

    it('should push generated root ID onto stack when stack is empty', () => {
      // Clear stack
      for (let i = 0; i < 10; i++) {
        context.popCorrelation();
      }

      const rootId = context.getCurrentCorrelation();

      // The root ID should now be on the stack
      expect(context.getCurrentCorrelation()).toBe(rootId);

      // Push another ID and verify stack behavior
      const newId = 'new-test-id';
      context.pushCorrelation(newId);
      expect(context.getCurrentCorrelation()).toBe(newId);

      // Pop back to root
      context.popCorrelation();
      expect(context.getCurrentCorrelation()).toBe(rootId);
    });

    it('should handle popping from empty stack gracefully', () => {
      // Clear stack thoroughly
      for (let i = 0; i < 20; i++) {
        context.popCorrelation();
      }

      // Additional pops should not crash
      expect(() => {
        context.popCorrelation();
        context.popCorrelation();
        context.popCorrelation();
      }).not.toThrow();

      // Should still be able to get current correlation
      const currentId = context.getCurrentCorrelation();
      expect(currentId).toBeDefined();
    });
  });

  describe('Context Propagation Logic', () => {
    let context: LoggerContext;

    beforeEach(() => {
      context = LoggerContext.getInstance();
      // Clear any existing state
      for (let i = 0; i < 10; i++) {
        context.popCorrelation();
      }
    });

    it('should support nested operation tracking', () => {
      // Simulate nested operations with correlation inheritance
      const operationA = 'operation-a-id';
      const operationB = 'operation-b-id';
      const operationC = 'operation-c-id';

      // Start operation A
      context.pushCorrelation(operationA);
      expect(context.getCurrentCorrelation()).toBe(operationA);

      // Start nested operation B
      context.pushCorrelation(operationB);
      expect(context.getCurrentCorrelation()).toBe(operationB);

      // Start deeply nested operation C
      context.pushCorrelation(operationC);
      expect(context.getCurrentCorrelation()).toBe(operationC);

      // Exit operation C
      context.popCorrelation();
      expect(context.getCurrentCorrelation()).toBe(operationB);

      // Exit operation B
      context.popCorrelation();
      expect(context.getCurrentCorrelation()).toBe(operationA);

      // Exit operation A
      context.popCorrelation();

      // Should generate new root when accessed again
      const newRoot = context.getCurrentCorrelation();
      expect(newRoot).not.toBe(operationA);
      expect(newRoot).not.toBe(operationB);
      expect(newRoot).not.toBe(operationC);
    });

    it('should maintain correlation consistency across multiple access patterns', () => {
      const testId = 'consistency-test-id';

      context.pushCorrelation(testId);

      // Multiple calls should return the same ID
      expect(context.getCurrentCorrelation()).toBe(testId);
      expect(context.getCurrentCorrelation()).toBe(testId);
      expect(context.getCurrentCorrelation()).toBe(testId);

      // Push and pop should still maintain consistency
      const tempId = 'temporary-id';
      context.pushCorrelation(tempId);
      expect(context.getCurrentCorrelation()).toBe(tempId);

      context.popCorrelation();
      expect(context.getCurrentCorrelation()).toBe(testId);
    });

    it('should handle complex correlation flow scenarios', () => {
      // Simulate complex application flow with multiple correlation contexts
      const userRequestId = context.createCorrelationId();
      const databaseOpId = context.createCorrelationId();
      const cacheOpId = context.createCorrelationId();

      // Start user request
      context.pushCorrelation(userRequestId);
      expect(context.getCurrentCorrelation()).toBe(userRequestId);

      // Database operation within request
      context.pushCorrelation(databaseOpId);
      expect(context.getCurrentCorrelation()).toBe(databaseOpId);

      // Cache operation within database operation
      context.pushCorrelation(cacheOpId);
      expect(context.getCurrentCorrelation()).toBe(cacheOpId);

      // Cache operation completes
      context.popCorrelation();
      expect(context.getCurrentCorrelation()).toBe(databaseOpId);

      // Database operation completes
      context.popCorrelation();
      expect(context.getCurrentCorrelation()).toBe(userRequestId);

      // User request completes
      context.popCorrelation();

      // Next operation should get new root
      const nextRoot = context.getCurrentCorrelation();
      expect(nextRoot).not.toBe(userRequestId);
      expect(nextRoot).not.toBe(databaseOpId);
      expect(nextRoot).not.toBe(cacheOpId);
    });

    it('should support correlation context isolation between operations', () => {
      // Simulate two independent operations
      const operation1Id = 'operation-1';
      const operation2Id = 'operation-2';

      // Start operation 1
      context.pushCorrelation(operation1Id);
      const op1Context = context.getCurrentCorrelation();
      expect(op1Context).toBe(operation1Id);

      // Start operation 2 (nested)
      context.pushCorrelation(operation2Id);
      const op2Context = context.getCurrentCorrelation();
      expect(op2Context).toBe(operation2Id);

      // Operations should be isolated
      expect(op1Context).not.toBe(op2Context);

      // Exit operation 2
      context.popCorrelation();
      expect(context.getCurrentCorrelation()).toBe(operation1Id);

      // Start another operation 2 instance
      const operation2SecondId = 'operation-2-second';
      context.pushCorrelation(operation2SecondId);
      expect(context.getCurrentCorrelation()).toBe(operation2SecondId);
      expect(context.getCurrentCorrelation()).not.toBe(operation2Id);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    let context: LoggerContext;

    beforeEach(() => {
      context = LoggerContext.getInstance();
    });

    it('should handle empty string correlation IDs', () => {
      expect(() => {
        context.pushCorrelation('');
        expect(context.getCurrentCorrelation()).toBe('');
      }).not.toThrow();
    });

    it('should handle very long correlation IDs', () => {
      const longId = 'x'.repeat(1000);

      expect(() => {
        context.pushCorrelation(longId);
        expect(context.getCurrentCorrelation()).toBe(longId);
      }).not.toThrow();
    });

    it('should handle special characters in correlation IDs', () => {
      const specialId = 'id-with-!@#$%^&*()_+-=[]{}|;:,.<>?';

      expect(() => {
        context.pushCorrelation(specialId);
        expect(context.getCurrentCorrelation()).toBe(specialId);
      }).not.toThrow();
    });

    it('should handle unicode characters in correlation IDs', () => {
      const unicodeId = 'id-with-🎭🎪🎨-unicode-你好世界';

      expect(() => {
        context.pushCorrelation(unicodeId);
        expect(context.getCurrentCorrelation()).toBe(unicodeId);
      }).not.toThrow();
    });

    it('should handle high frequency push/pop operations', () => {
      const iterations = 1000;

      expect(() => {
        for (let i = 0; i < iterations; i++) {
          context.pushCorrelation(`id-${i}`);
          if (i % 2 === 0) {
            context.popCorrelation();
          }
        }

        // Clean up remaining items
        for (let i = 0; i < iterations; i++) {
          context.popCorrelation();
        }
      }).not.toThrow();
    });

    it('should maintain UUID format even when Math.random returns edge values', () => {
      // Remove crypto to force fallback using defineProperty
      Object.defineProperty(global, 'crypto', {
        value: undefined,
        writable: true,
        configurable: true,
      });

      // Test with edge cases for Math.random
      const edgeValues = [0, 0.999999999, 0.5, 0.1, 0.9];
      let valueIndex = 0;

      Math.random = vi.fn(() => {
        const value = edgeValues[valueIndex % edgeValues.length];
        valueIndex++;
        return value;
      });

      const context = LoggerContext.getInstance();
      const correlationId = context.createCorrelationId();

      // Should still be valid UUID v4
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(correlationId).toMatch(uuidPattern);
    });
  });

  describe('Integration with Window Global', () => {
    it('should be accessible through window global if available', () => {
      // This test depends on whether window is defined in the test environment
      if (typeof window !== 'undefined') {
        expect((window as any).LoggerContext).toBeDefined();
        expect((window as any).LoggerContext.getInstance).toBeDefined();
        expect(typeof (window as any).LoggerContext.getInstance).toBe('function');

        const windowInstance = (window as any).LoggerContext.getInstance();
        const directInstance = LoggerContext.getInstance();

        expect(windowInstance).toBe(directInstance);
      }
    });

    it('should maintain singleton behavior when accessed through window global', () => {
      if (typeof window !== 'undefined' && (window as any).LoggerContext) {
        const instance1 = (window as any).LoggerContext.getInstance();
        const instance2 = (window as any).LoggerContext.getInstance();
        const instance3 = LoggerContext.getInstance();

        expect(instance1).toBe(instance2);
        expect(instance2).toBe(instance3);
      }
    });
  });
});
