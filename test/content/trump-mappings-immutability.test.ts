/**
 * Immutability tests for the Trump mappings module
 *
 * These tests verify that the trump-mappings object is properly frozen
 * and cannot be modified at runtime, ensuring data integrity and
 * preventing accidental mutations.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import type { ImmutableTrumpMappingsRecord } from '../../src/data/trump-mappings';

// Import the trump-mappings module directly
import '../../src/data/trump-mappings.js';

describe('Trump Mappings Immutability', () => {
  let mappings: ImmutableTrumpMappingsRecord;

  beforeAll(() => {
    // Get the mappings object once for all tests
    mappings = window.TrumpMappings.getReplacementMap();
  });

  describe('Root object immutability', () => {
    it('should prevent modification of the mappings object', () => {
      expect(() => {
        (mappings as any).newKey = { regex: /test/, nick: 'test' };
      }).toThrow(TypeError);
    });

    it('should prevent deletion of existing mappings', () => {
      // First verify the key exists
      const keysBeforeDeletion = Object.keys(mappings);
      const keyToDelete = keysBeforeDeletion[0];
      expect(mappings[keyToDelete]).toBeDefined();

      // Delete on frozen object throws TypeError
      expect(() => {
        delete (mappings as any)[keyToDelete];
      }).toThrow(TypeError);

      // Verify the key still exists
      expect(mappings[keyToDelete]).toBeDefined();
      expect(Object.keys(mappings)).toEqual(keysBeforeDeletion);
    });

    it('should prevent modification of existing mappings', () => {
      const existingKey = Object.keys(mappings)[0];
      expect(() => {
        (mappings as any)[existingKey] = { regex: /modified/, nick: 'modified' };
      }).toThrow(TypeError);
    });

    it('should report the root object as frozen', () => {
      expect(Object.isFrozen(mappings)).toBe(true);
    });

    it('should report the root object as sealed', () => {
      expect(Object.isSealed(mappings)).toBe(true);
    });

    it('should report the root object as not extensible', () => {
      expect(Object.isExtensible(mappings)).toBe(false);
    });
  });

  describe('Nested object immutability', () => {
    it('should prevent modification of individual mapping objects', () => {
      const firstKey = Object.keys(mappings)[0];
      const mapping = mappings[firstKey];

      expect(() => {
        (mapping as any).nick = 'Modified Nickname';
      }).toThrow(TypeError);
    });

    it('should prevent adding properties to individual mapping objects', () => {
      const firstKey = Object.keys(mappings)[0];
      const mapping = mappings[firstKey];

      expect(() => {
        (mapping as any).newProperty = 'test';
      }).toThrow(TypeError);
    });

    it('should prevent deletion of properties from individual mapping objects', () => {
      const firstKey = Object.keys(mappings)[0];
      const mapping = mappings[firstKey];

      expect(() => {
        delete (mapping as any).nick;
      }).toThrow(TypeError);
    });

    it('should freeze all nested mapping objects', () => {
      Object.keys(mappings).forEach((key) => {
        const mapping = mappings[key];
        expect(Object.isFrozen(mapping)).toBe(true);
        expect(Object.isSealed(mapping)).toBe(true);
        expect(Object.isExtensible(mapping)).toBe(false);
      });
    });

    it('should not freeze RegExp objects to maintain functionality', () => {
      Object.keys(mappings).forEach((key) => {
        const mapping = mappings[key];
        // RegExp objects should not be frozen as they need internal state for matching
        expect(Object.isFrozen(mapping.regex)).toBe(false);
      });
    });
  });

  describe('Deep freeze verification', () => {
    it('should freeze nested arrays if present', () => {
      Object.keys(mappings).forEach((key) => {
        const mapping = mappings[key];
        if (mapping.keyTerms && Array.isArray(mapping.keyTerms)) {
          expect(Object.isFrozen(mapping.keyTerms)).toBe(true);

          // Verify array elements cannot be modified
          expect(() => {
            (mapping.keyTerms as any)[0] = 'modified';
          }).toThrow(TypeError);

          // Verify new elements cannot be added
          expect(() => {
            (mapping.keyTerms as any).push('new item');
          }).toThrow(TypeError);
        }
      });
    });
  });

  describe('Multiple access consistency', () => {
    it('should return the same object reference on multiple calls', () => {
      const mappings1 = window.TrumpMappings.getReplacementMap();
      const mappings2 = window.TrumpMappings.getReplacementMap();

      // Should be the exact same object reference
      expect(mappings1).toBe(mappings2);
    });

    it('should maintain immutability across multiple accesses', () => {
      const mappings1 = window.TrumpMappings.getReplacementMap();

      // Try to modify through first reference
      expect(() => {
        (mappings1 as any).newKey = { regex: /test/, nick: 'test' };
      }).toThrow(TypeError);

      // Get new reference and verify it's still immutable
      const mappings2 = window.TrumpMappings.getReplacementMap();
      expect(() => {
        (mappings2 as any).anotherKey = { regex: /test2/, nick: 'test2' };
      }).toThrow(TypeError);
    });
  });

  describe('Error handling edge cases', () => {
    it('should handle strict mode behavior correctly', () => {
      'use strict';
      const strictMappings = window.TrumpMappings.getReplacementMap();

      // In strict mode, assignments to frozen objects throw TypeError
      expect(() => {
        strictMappings.newKey = { regex: /test/, nick: 'test' } as any;
      }).toThrow(TypeError);
    });

    it('should prevent Object.defineProperty modifications', () => {
      expect(() => {
        Object.defineProperty(mappings, 'newProp', {
          value: 'test',
          writable: true,
          enumerable: true,
          configurable: true,
        });
      }).toThrow(TypeError);
    });

    it('should prevent Object.setPrototypeOf modifications', () => {
      expect(() => {
        Object.setPrototypeOf(mappings, {});
      }).toThrow(TypeError);
    });
  });
});
