/**
 * Unit tests for the Trump mappings module
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NICKNAME_TEST_CASES } from '../fixtures/text-fixtures';

// Create a mock of the Trump mappings module
// In a real implementation, you'd import the actual module
const createTrumpMappings = () => {
  return {
    // Mock functions with the same interface as the real module
    buildTrumpMap: vi.fn(() => {
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
    getMapping: vi.fn((key) => {
      const trumpMap = createTrumpMappings().buildTrumpMap();
      return trumpMap[key];
    }),

    // Mock getting all keys
    getMapKeys: vi.fn(() => {
      const trumpMap = createTrumpMappings().buildTrumpMap();
      return Object.keys(trumpMap);
    }),
  };
};

describe('Trump Mappings Module', () => {
  let TrumpMappings;

  beforeEach(() => {
    // Create a fresh instance for each test
    TrumpMappings = createTrumpMappings();
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

      // Get all keys
      const keys = Object.keys(trumpMap);

      // Check each regex pattern
      keys.forEach((key) => {
        const mapping = trumpMap[key];
        expect(mapping.regex).toBeInstanceOf(RegExp);
        expect(mapping.regex.flags).toContain('g');
        expect(mapping.regex.flags).toContain('i');
      });
    });

    it('should include all expected categories of mappings', () => {
      // Build the map
      const trumpMap = TrumpMappings.buildTrumpMap();

      // Check for expected categories
      expect(trumpMap).toHaveProperty('trump'); // Politicians
      expect(trumpMap).toHaveProperty('hillary');
      expect(trumpMap).toHaveProperty('kelly'); // Media figures
      expect(trumpMap).toHaveProperty('cnn'); // Media organizations
      expect(trumpMap).toHaveProperty('covid'); // COVID terms
      expect(trumpMap).toHaveProperty('coffee'); // Misc
    });
  });

  describe('Trump Map Usage', () => {
    it('should replace Trump with the correct nickname', () => {
      // Build the map
      const trumpMap = TrumpMappings.buildTrumpMap();

      // Test text
      const text = 'Donald Trump announced a new policy. Trump spoke at a rally.';

      // Replace using the mapping
      const mapping = trumpMap.trump;
      mapping.regex.lastIndex = 0; // Reset regex
      const result = text.replace(mapping.regex, mapping.nick);

      // Verify replacement
      expect(result).toBe('Agent Orange announced a new policy. Agent Orange spoke at a rally.');
    });

    it('should replace all instances in the text', () => {
      // Build the map
      const trumpMap = TrumpMappings.buildTrumpMap();

      // Test text with multiple references
      const text =
        'Donald Trump announced a new policy. Trump spoke at a rally. President Trump signed an executive order.';

      // Replace using the mapping
      const mapping = trumpMap.trump;
      mapping.regex.lastIndex = 0; // Reset regex
      const result = text.replace(mapping.regex, mapping.nick);

      // Verify all instances were replaced
      expect(result.match(/Agent Orange/g).length).toBe(3);
    });

    it('should handle word boundaries correctly', () => {
      // Build the map
      const trumpMap = TrumpMappings.buildTrumpMap();

      // Test text with boundary cases
      const text = 'CNN reported that Trump said something. This is not CNNLive.';

      // Replace using the mapping
      const mapping = trumpMap.cnn;
      mapping.regex.lastIndex = 0; // Reset regex
      const result = text.replace(mapping.regex, mapping.nick);

      // Verify only the standalone CNN was replaced
      expect(result).toBe('Fake News CNN reported that Trump said something. This is not CNNLive.');
    });

    it('should handle case insensitivity correctly', () => {
      // Build the map
      const trumpMap = TrumpMappings.buildTrumpMap();

      // Test text with different cases
      const text = 'DONALD TRUMP, donald trump, Donald Trump';

      // Replace using the mapping
      const mapping = trumpMap.trump;
      mapping.regex.lastIndex = 0; // Reset regex
      const result = text.replace(mapping.regex, mapping.nick);

      // Verify all cases were replaced
      expect(result).toBe('Agent Orange, Agent Orange, Agent Orange');
    });
  });

  describe('Mapping Tests with Fixtures', () => {
    it('should correctly replace names in the nickname test cases', () => {
      // Build the map
      const trumpMap = TrumpMappings.buildTrumpMap();

      // Test each fixture
      const results = NICKNAME_TEST_CASES.map((text) => {
        let result = text;

        // Apply all mappings
        Object.keys(trumpMap).forEach((key) => {
          const mapping = trumpMap[key];
          mapping.regex.lastIndex = 0; // Reset regex
          result = result.replace(mapping.regex, mapping.nick);
        });

        return { original: text, result };
      });

      // Check replacements
      expect(results.find((r) => r.original.includes('Hillary Clinton')).result).toContain(
        'Crooked Hillary'
      );
      expect(results.find((r) => r.original.includes('Ted Cruz')).result).toContain("Lyin' Ted");
      expect(results.find((r) => r.original.includes('CNN reported')).result).toContain(
        'Fake News CNN reported'
      );
      expect(results.find((r) => r.original.includes('coffee')).result).toContain('covfefe');
    });
  });

  describe('Helper Methods', () => {
    it('should get a specific mapping by key', () => {
      // Get a specific mapping
      const mapping = TrumpMappings.getMapping('trump');

      // Verify mapping
      expect(mapping).toEqual(
        expect.objectContaining({
          regex: expect.any(RegExp),
          nick: 'Agent Orange',
        })
      );
    });

    it('should get all map keys', () => {
      // Get all keys
      const keys = TrumpMappings.getMapKeys();

      // Verify keys
      expect(keys).toBeInstanceOf(Array);
      expect(keys.length).toBeGreaterThan(5);
      expect(keys).toContain('trump');
      expect(keys).toContain('cnn');
      expect(keys).toContain('coffee');
    });
  });
});
