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

  describe('Functional verification - frozen mappings still work correctly', () => {
    it('should maintain full functionality after freezing', () => {
      // Get first mapping to test
      const firstMapping = mappings[Object.keys(mappings)[0]];

      // Verify mappings have expected structure
      expect(firstMapping).toBeDefined();
      expect(firstMapping.regex).toBeInstanceOf(RegExp);
      expect(typeof firstMapping.nick).toBe('string');
    });

    it('should allow RegExp objects to function correctly for text matching', () => {
      // Test various mappings to ensure regex functionality
      Object.keys(mappings)
        .slice(0, 10)
        .forEach((key) => {
          const mapping = mappings[key];

          // Create test text that should match
          const testText = `This text contains ${key} and should match`;

          // RegExp should still work - it may or may not match depending on the pattern
          // The important thing is that calling match() doesn't throw an error
          expect(() => testText.match(mapping.regex)).not.toThrow();

          // Test other RegExp methods
          expect(() => mapping.regex.test(testText)).not.toThrow();
          expect(() => mapping.regex.exec(testText)).not.toThrow();
        });
    });

    it('should allow access to all properties of frozen mappings', () => {
      Object.keys(mappings).forEach((key) => {
        const mapping = mappings[key];

        // Verify all properties are accessible
        expect(() => mapping.regex).not.toThrow();
        expect(() => mapping.nick).not.toThrow();

        // Properties should have correct types
        expect(mapping.regex).toBeInstanceOf(RegExp);
        expect(typeof mapping.nick).toBe('string');
        expect(mapping.nick.length).toBeGreaterThan(0);

        // Optional properties should be accessible if present
        if ('keyTerms' in mapping) {
          expect(() => mapping.keyTerms).not.toThrow();
          if (mapping.keyTerms) {
            expect(Array.isArray(mapping.keyTerms)).toBe(true);
          }
        }

        if ('matchesPartialWords' in mapping) {
          expect(() => mapping.matchesPartialWords).not.toThrow();
          expect(typeof mapping.matchesPartialWords).toBe('boolean');
        }
      });
    });

    it('should work correctly for text replacement operations', () => {
      // Test actual text replacement functionality
      const testCases = [
        { text: 'Ted Cruz said something', expected: "Lyin' Ted said something" },
        { text: 'Hillary Clinton announced', expected: 'Crooked Hillary announced' },
        { text: 'CNN reported the news', expected: 'Fake News CNN reported the news' },
        { text: 'The COVID-19 pandemic', expected: 'The China Virus pandemic' },
      ];

      testCases.forEach((testCase) => {
        let modifiedText = testCase.text;

        // Apply replacements using the frozen mappings
        Object.keys(mappings).forEach((key) => {
          const mapping = mappings[key];
          modifiedText = modifiedText.replace(mapping.regex, mapping.nick);
        });

        // The text should be processable without errors
        expect(typeof modifiedText).toBe('string');
        // Verify the expected replacement occurred
        expect(modifiedText).toBe(testCase.expected);
      });
    });

    it('should maintain regex flags and options after freezing', () => {
      Object.keys(mappings)
        .slice(0, 5)
        .forEach((key) => {
          const mapping = mappings[key];
          const regex = mapping.regex;

          // Verify regex flags are preserved
          expect(regex.flags).toContain('g'); // Global flag
          expect(regex.flags).toContain('i'); // Case insensitive flag

          // Verify regex properties are accessible
          expect(typeof regex.source).toBe('string');
          expect(regex.source.length).toBeGreaterThan(0);
          expect(typeof regex.global).toBe('boolean');
          expect(typeof regex.ignoreCase).toBe('boolean');
          expect(regex.global).toBe(true);
          expect(regex.ignoreCase).toBe(true);
        });
    });

    it('should handle complex replacement scenarios with frozen mappings', () => {
      const complexText = `
        Ted Cruz met with Hillary Clinton at CNN headquarters.
        They discussed COVID-19 and had coffee while watching NBC News.
        Joe Biden and Kamala Harris were also mentioned on MSNBC.
      `;

      let processedText = complexText;
      const replacementCount = new Map<string, number>();

      // Process text with all mappings
      Object.keys(mappings).forEach((key) => {
        const mapping = mappings[key];
        let count = 0;

        processedText = processedText.replace(mapping.regex, () => {
          count++;
          return mapping.nick;
        });

        if (count > 0) {
          replacementCount.set(key, count);
        }
      });

      // Verify text was processed
      expect(processedText).not.toBe(complexText);
      expect(replacementCount.size).toBeGreaterThan(0);

      // Verify some expected replacements occurred
      // Note: The replacements contain the original words sometimes (e.g., "Fake News CNN")
      expect(processedText).not.toBe(complexText);

      // Verify specific transformations
      expect(processedText).toContain("Lyin' Ted");
      expect(processedText).toContain('Crooked Hillary');
      expect(processedText).toContain('Fake News CNN');
      expect(processedText).toContain('China Virus');
      expect(processedText).toContain('covfefe'); // coffee replacement
      expect(processedText).toContain('Fake News NBC News');
      expect(processedText).toContain('Sleepy Joe');
      expect(processedText).toContain('Comrade Kamala');
      expect(processedText).toContain('MSDNC');

      // Verify at least some replacements happened
      expect(replacementCount.size).toBeGreaterThanOrEqual(8);
    });

    it('should support getKeys() method returning accessible array', () => {
      const keys = window.TrumpMappings.getKeys();

      // Verify keys array is returned
      expect(Array.isArray(keys)).toBe(true);
      expect(keys.length).toBeGreaterThan(0);

      // Verify all keys correspond to actual mappings
      keys.forEach((key) => {
        expect(mappings[key]).toBeDefined();
        expect(mappings[key].regex).toBeInstanceOf(RegExp);
        expect(typeof mappings[key].nick).toBe('string');
      });

      // Verify keys match object keys
      expect(keys.sort()).toEqual(Object.keys(mappings).sort());
    });
  });
});
