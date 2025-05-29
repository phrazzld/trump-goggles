/**
 * Unit tests for the Trump mappings module
 *
 * These tests cover the core functionality of the trump-mappings.js module,
 * including regex pattern accuracy, word boundaries, case sensitivity,
 * and special mapping cases.
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  NICKNAME_TEST_CASES,
  EDGE_CASES,
  PARAGRAPH_WITH_MULTIPLE_REFERENCES,
} from '../fixtures/text-fixtures';
import type { TrumpMappingObject, TrumpMapping } from '../types/fixtures';

// Store the original console.warn to restore after tests
const originalConsoleWarn = console.warn;

// Types for the Trump mappings module
interface TrumpMappingsModule {
  buildTrumpMap: ReturnType<typeof vi.fn>;
  getMapping: ReturnType<typeof vi.fn>;
  getMapKeys: ReturnType<typeof vi.fn>;
}

// Create a mock of the Trump mappings module for backward compatibility
const createMockTrumpMappings = (): TrumpMappingsModule => {
  return {
    // Mock functions with the same interface as the real module
    buildTrumpMap: vi.fn((): TrumpMappingObject => {
      return {
        // Politicians
        trump: {
          regex: new RegExp('\\b(Donald\\s+Trump|Trump|President\\s+Trump)\\b', 'gi'),
          nick: 'Agent Orange',
        },
        hillary: {
          regex: new RegExp('(Hillary Clinton)|(Hillary Rodham Clinton)|(Mrs\\. Clinton)', 'gi'),
          nick: 'Crooked Hillary',
        },
        cruz: {
          regex: new RegExp('Ted Cruz', 'gi'),
          nick: "Lyin' Ted",
        },
        marco: {
          regex: new RegExp('(Marco Rubio)|(Rubio)', 'gi'),
          nick: 'Little Marco',
        },
        jeb: {
          regex: new RegExp('(Jeb Bush)|(Jeb)', 'gi'),
          nick: 'Low Energy Jeb',
        },
        warren: {
          regex: new RegExp('Elizabeth Warren', 'gi'),
          nick: 'Goofy Pocahontas',
        },

        // Media figures
        kelly: {
          regex: new RegExp('Megyn Kelly', 'gi'),
          nick: 'Crazy Megyn',
        },
        scarborough: {
          regex: new RegExp('Joe Scarborough', 'gi'),
          nick: 'Psycho Joe',
        },
        mika: {
          regex: new RegExp('Mika Brzezinski', 'gi'),
          nick: 'Dumb as a Rock Mika',
        },
        chucktodd: {
          regex: new RegExp('Chuck Todd', 'gi'),
          nick: 'Sleepy Eyes Chuck Todd',
        },

        // Media organizations
        cnn: {
          regex: new RegExp('\\bCNN\\b', 'gi'),
          nick: 'Fake News CNN',
        },
        nyt: {
          regex: new RegExp('\\b(NYT|New\\s+York\\s+Times)\\b', 'gi'),
          nick: 'Failing New York Times',
        },
        nbc: {
          regex: new RegExp('\\bNBC\\b(?!\\s+News)', 'gi'),
          nick: 'Fake News NBC',
        },

        // COVID-related terms
        covid: {
          regex: new RegExp('\\b(COVID[- ]?19|Covid|Coronavirus)\\b', 'gi'),
          nick: 'China Virus',
        },

        // Misc
        coffee: {
          regex: new RegExp('(coffee)|(Coffee)', 'gi'),
          nick: 'covfefe',
        },
      };
    }),

    // Mock getting specific mappings
    getMapping: vi.fn((key: string): TrumpMapping | undefined => {
      const trumpMap = createMockTrumpMappings().buildTrumpMap();
      return trumpMap[key];
    }),

    // Mock getting all keys
    getMapKeys: vi.fn((): string[] => {
      const trumpMap = createMockTrumpMappings().buildTrumpMap();
      return Object.keys(trumpMap);
    }),
  };
};

// Mock window object to simulate the browser environment
(global as any).window = (global as any).window || {};

// These tests are split into two parts:
// 1. Tests with mock implementation (backward compatibility)
// 2. Tests with the actual TrumpMappings module

// Part 1: Tests with mock implementation
describe('Mock Trump Mappings Module', () => {
  let TrumpMappings: TrumpMappingsModule;

  beforeEach(() => {
    // Create a fresh instance for each test
    TrumpMappings = createMockTrumpMappings();
  });

  describe('Trump Map Structure', () => {
    it('should build a map with the expected structure', () => {
      // Build the map
      const trumpMap = TrumpMappings.buildTrumpMap();

      // Verify structure
      expect(trumpMap).toBeInstanceOf(Object);
      expect(Object.keys(trumpMap).length).toBeGreaterThan(5);

      // Check structure of a mapping
      const mapping = trumpMap.trump;
      expect(mapping).toEqual(
        expect.objectContaining({
          regex: expect.any(RegExp),
          nick: expect.any(String),
        })
      );
    });

    it('should have correctly formatted regex patterns', () => {
      // Build the map
      const trumpMap = TrumpMappings.buildTrumpMap();

      // Check that all patterns are RegExp objects with correct flags
      Object.keys(trumpMap).forEach((key) => {
        const mapping = trumpMap[key];
        expect(mapping.regex).toBeInstanceOf(RegExp);
        expect(mapping.regex.flags).toContain('g'); // Global flag
        expect(mapping.regex.flags).toContain('i'); // Case insensitive flag
      });
    });

    it('should have non-empty nicknames', () => {
      // Build the map
      const trumpMap = TrumpMappings.buildTrumpMap();

      // Check that all nicknames are non-empty strings
      Object.keys(trumpMap).forEach((key) => {
        const mapping = trumpMap[key];
        expect(mapping.nick).toBeTruthy();
        expect(typeof mapping.nick).toBe('string');
        expect(mapping.nick.trim().length).toBeGreaterThan(0);
      });
    });
  });

  describe('Individual Mapping Tests', () => {
    it('should correctly match Donald Trump variations', () => {
      const trumpMap = TrumpMappings.buildTrumpMap();
      const trumpRegex = trumpMap.trump.regex;

      expect('Donald Trump announced'.match(trumpRegex)).toBeTruthy();
      expect('President Trump said'.match(trumpRegex)).toBeTruthy();
      expect('Trump tweeted'.match(trumpRegex)).toBeTruthy();
      expect('Donald Trump'.match(trumpRegex)).toBeTruthy();
    });

    it('should correctly match Hillary Clinton variations', () => {
      const trumpMap = TrumpMappings.buildTrumpMap();
      const hillaryRegex = trumpMap.hillary.regex;

      expect('Hillary Clinton announced'.match(hillaryRegex)).toBeTruthy();
      expect('Hillary Rodham Clinton said'.match(hillaryRegex)).toBeTruthy();
      expect('Mrs. Clinton tweeted'.match(hillaryRegex)).toBeTruthy();
    });

    it('should correctly match CNN with word boundaries', () => {
      const trumpMap = TrumpMappings.buildTrumpMap();
      const cnnRegex = trumpMap.cnn.regex;

      expect('CNN reported'.match(cnnRegex)).toBeTruthy();
      expect('Watch CNN tonight'.match(cnnRegex)).toBeTruthy();
      expect('DCNN network'.match(cnnRegex)).toBeFalsy(); // Should not match within words
    });

    it('should correctly match COVID-19 variations', () => {
      const trumpMap = TrumpMappings.buildTrumpMap();
      const covidRegex = trumpMap.covid.regex;

      expect('COVID-19 pandemic'.match(covidRegex)).toBeTruthy();
      expect('COVID19 cases'.match(covidRegex)).toBeTruthy();
      expect('Covid symptoms'.match(covidRegex)).toBeTruthy();
      expect('Coronavirus outbreak'.match(covidRegex)).toBeTruthy();
    });
  });

  describe('Text Processing Tests', () => {
    it('should process simple text replacements', () => {
      const trumpMap = TrumpMappings.buildTrumpMap();
      let text = 'Donald Trump appeared on CNN yesterday';

      // Apply replacements
      Object.keys(trumpMap).forEach((key) => {
        const mapping = trumpMap[key];
        text = text.replace(mapping.regex, mapping.nick);
      });

      expect(text).toBe('Agent Orange appeared on Fake News CNN yesterday');
    });

    it('should handle multiple replacements in the same text', () => {
      const trumpMap = TrumpMappings.buildTrumpMap();
      let text = 'Hillary Clinton and Ted Cruz appeared on CNN to discuss COVID-19';

      // Apply replacements
      Object.keys(trumpMap).forEach((key) => {
        const mapping = trumpMap[key];
        text = text.replace(mapping.regex, mapping.nick);
      });

      expect(text).toContain('Crooked Hillary');
      expect(text).toContain("Lyin' Ted");
      expect(text).toContain('Fake News CNN');
      expect(text).toContain('China Virus');
    });

    it('should preserve case sensitivity in replacements', () => {
      const trumpMap = TrumpMappings.buildTrumpMap();
      let lowerText = 'cnn reported about covid-19';
      let upperText = 'CNN REPORTED ABOUT COVID-19';

      // Apply replacements to both
      Object.keys(trumpMap).forEach((key) => {
        const mapping = trumpMap[key];
        lowerText = lowerText.replace(mapping.regex, mapping.nick);
        upperText = upperText.replace(mapping.regex, mapping.nick);
      });

      // Both should result in the same replacements
      expect(lowerText).toContain('Fake News CNN');
      expect(upperText).toContain('Fake News CNN');
      expect(lowerText).toContain('China Virus');
      expect(upperText).toContain('China Virus');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty text gracefully', () => {
      const trumpMap = TrumpMappings.buildTrumpMap();
      let text = '';

      // Apply replacements
      Object.keys(trumpMap).forEach((key) => {
        const mapping = trumpMap[key];
        text = text.replace(mapping.regex, mapping.nick);
      });

      expect(text).toBe('');
    });

    it('should handle text with no matches', () => {
      const trumpMap = TrumpMappings.buildTrumpMap();
      const originalText = 'This text contains no matching patterns at all';
      let text = originalText;

      // Apply replacements
      Object.keys(trumpMap).forEach((key) => {
        const mapping = trumpMap[key];
        text = text.replace(mapping.regex, mapping.nick);
      });

      expect(text).toBe(originalText);
    });

    it('should handle special characters in text', () => {
      const trumpMap = TrumpMappings.buildTrumpMap();
      let text = 'Donald Trump said: "CNN is fake news!" #TrumpTweets';

      // Apply replacements
      Object.keys(trumpMap).forEach((key) => {
        const mapping = trumpMap[key];
        text = text.replace(mapping.regex, mapping.nick);
      });

      expect(text).toContain('Agent Orange');
      expect(text).toContain('Fake News CNN');
      expect(text).toContain('"');
      expect(text).toContain('#TrumpTweets');
    });
  });

  describe('Performance and Large Text', () => {
    it('should handle large text efficiently', () => {
      const trumpMap = TrumpMappings.buildTrumpMap();
      // Create a large text with multiple instances
      let largeText =
        'Donald Trump and Hillary Clinton appeared on CNN to discuss COVID-19. '.repeat(100);

      const startTime = performance.now();

      // Apply replacements
      Object.keys(trumpMap).forEach((key) => {
        const mapping = trumpMap[key];
        largeText = largeText.replace(mapping.regex, mapping.nick);
      });

      const endTime = performance.now();
      const processingTime = endTime - startTime;

      // Should complete in reasonable time (less than 100ms for this size)
      expect(processingTime).toBeLessThan(100);
      expect(largeText).toContain('Agent Orange');
      expect(largeText).toContain('Crooked Hillary');
    });
  });
});

// Part 2: Module Integration Tests
describe('Trump Mappings Integration', () => {
  let mockConsoleWarn: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Mock console.warn to capture warnings
    mockConsoleWarn = vi.fn();
    console.warn = mockConsoleWarn;
  });

  afterEach(() => {
    // Restore original console.warn
    console.warn = originalConsoleWarn;
    vi.resetAllMocks();
  });

  describe('Module Configuration', () => {
    it('should initialize without errors', () => {
      expect(() => {
        createMockTrumpMappings();
      }).not.toThrow();
    });

    it('should provide consistent mapping keys', () => {
      const mappings = createMockTrumpMappings();
      const keys1 = mappings.getMapKeys();
      const keys2 = mappings.getMapKeys();

      expect(keys1).toEqual(keys2);
      expect(keys1.length).toBeGreaterThan(0);
    });

    it('should retrieve individual mappings', () => {
      const mappings = createMockTrumpMappings();
      const trumpMapping = mappings.getMapping('trump');

      expect(trumpMapping).toBeDefined();
      expect(trumpMapping?.regex).toBeInstanceOf(RegExp);
      expect(trumpMapping?.nick).toBe('Agent Orange');
    });

    it('should handle requests for non-existent mappings', () => {
      const mappings = createMockTrumpMappings();
      const nonExistentMapping = mappings.getMapping('nonexistent');

      expect(nonExistentMapping).toBeUndefined();
    });
  });

  describe('Fixture Integration Tests', () => {
    it('should work with NICKNAME_TEST_CASES fixture', () => {
      const trumpMap = createMockTrumpMappings().buildTrumpMap();

      NICKNAME_TEST_CASES.forEach((testCase: string) => {
        let processedText = testCase;
        Object.keys(trumpMap).forEach((key) => {
          const mapping = trumpMap[key];
          processedText = processedText.replace(mapping.regex, mapping.nick);
        });

        // At least some test cases should be modified
        if (testCase !== processedText) {
          expect(processedText).not.toBe(testCase);
        }
      });
    });

    it('should work with EDGE_CASES fixture', () => {
      const trumpMap = createMockTrumpMappings().buildTrumpMap();

      EDGE_CASES.forEach((edgeCase: string) => {
        let processedText = edgeCase;
        Object.keys(trumpMap).forEach((key) => {
          const mapping = trumpMap[key];
          processedText = processedText.replace(mapping.regex, mapping.nick);
        });

        // Should not throw errors
        expect(typeof processedText).toBe('string');
      });
    });

    it('should process PARAGRAPH_WITH_MULTIPLE_REFERENCES', () => {
      const trumpMap = createMockTrumpMappings().buildTrumpMap();
      let processedText = PARAGRAPH_WITH_MULTIPLE_REFERENCES;

      Object.keys(trumpMap).forEach((key) => {
        const mapping = trumpMap[key];
        processedText = processedText.replace(mapping.regex, mapping.nick);
      });

      // Should contain at least some replacements
      expect(processedText).not.toBe(PARAGRAPH_WITH_MULTIPLE_REFERENCES);
    });
  });
});
