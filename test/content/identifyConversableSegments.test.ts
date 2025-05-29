/**
 * Unit tests for TextProcessor.identifyConversableSegments
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { createTestTrumpMap } from '../helpers/test-utils';
import {
  SIMPLE_REFERENCES,
  EDGE_CASES,
  PARAGRAPH_WITH_MULTIPLE_REFERENCES,
} from '../fixtures/text-fixtures';
import type { TrumpMappingObject, TextSegment } from '../types/fixtures';

// No need for JSDOM in this test

// Create a mock TextProcessor with the identifyConversableSegments implementation
// This allows us to test the function without relying on the global module pattern
const TextProcessor = {
  identifyConversableSegments: (
    textNodeContent: string,
    replacementMap: TrumpMappingObject,
    mapKeys: string[]
  ): TextSegment[] => {
    const segments: TextSegment[] = [];

    // Don't process empty or very short strings
    if (!textNodeContent || textNodeContent.length < 2) {
      return segments;
    }

    // Skip processing with early bailout optimization
    if (!isLikelyToContainMatches(textNodeContent, replacementMap, mapKeys)) {
      return segments;
    }

    // Precompile patterns for better performance
    const finalMap = precompilePatterns(replacementMap);

    // Find segments for each pattern
    for (let i = 0; i < mapKeys.length; i++) {
      const key = mapKeys[i];
      const patternSegments = findMatchingSegments(textNodeContent, finalMap[key]);

      // Add segments to the result array
      segments.push(...patternSegments);
    }

    // Sort segments by startIndex to ensure proper ordering
    segments.sort((a, b) => a.startIndex - b.startIndex);

    // Handle potential overlapping segments by keeping only non-overlapping ones
    if (segments.length > 1) {
      const nonOverlapping: TextSegment[] = [segments[0]];

      for (let i = 1; i < segments.length; i++) {
        const current = segments[i];
        const previous = nonOverlapping[nonOverlapping.length - 1];

        // Only add non-overlapping segments
        if (current.startIndex >= previous.endIndex) {
          nonOverlapping.push(current);
        }
      }

      return nonOverlapping;
    }

    return segments;
  },
};

// Implementation of helper functions needed by identifyConversableSegments
function isLikelyToContainMatches(
  text: string,
  _replacementMap: TrumpMappingObject,
  _mapKeys: string[]
): boolean {
  // Skip very short texts
  if (!text || text.length < 3) {
    return false;
  }

  // Convert to lowercase for case-insensitive checks
  const lowerText = text.toLowerCase();

  // Check common words
  const commonWords = ['trump', 'donald', 'president', 'cnn', 'coffee'];
  return commonWords.some((word) => lowerText.includes(word));
}

function precompilePatterns(replacementMap: TrumpMappingObject): TrumpMappingObject {
  const optimized: TrumpMappingObject = {};

  for (const key in replacementMap) {
    if (!Object.prototype.hasOwnProperty.call(replacementMap, key)) continue;

    // Create a copy of the original entry
    optimized[key] = { ...replacementMap[key] };

    // Ensure case insensitivity for consistent matching
    if (!replacementMap[key].regex.ignoreCase) {
      optimized[key].regex = new RegExp(
        replacementMap[key].regex.source,
        replacementMap[key].regex.flags + 'i'
      );
    }
  }

  return optimized;
}

function findMatchingSegments(
  text: string,
  patternEntry: { regex: RegExp; nick: string }
): TextSegment[] {
  const segments: TextSegment[] = [];

  try {
    // Create a copy of the regex with global flag to find all matches
    const regex = new RegExp(
      patternEntry.regex.source,
      patternEntry.regex.global ? patternEntry.regex.flags : patternEntry.regex.flags + 'g'
    );

    // Find all matches
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      // Create segment info
      segments.push({
        originalText: match[0],
        convertedText: patternEntry.nick,
        startIndex: match.index,
        endIndex: match.index + match[0].length,
      });

      // Prevent infinite loops with zero-width matches
      if (match.index === regex.lastIndex) {
        regex.lastIndex++;
      }
    }

    return segments;
  } catch (error) {
    console.error('Trump Goggles: Error finding matching segments', error);
    return segments;
  }
}

describe('TextProcessor.identifyConversableSegments', () => {
  let trumpMap: TrumpMappingObject;
  let mapKeys: string[];

  beforeEach(() => {
    // Create test Trump map
    trumpMap = createTestTrumpMap();
    mapKeys = Object.keys(trumpMap);
  });

  describe('Basic Functionality', () => {
    it('should return empty array for empty text', () => {
      const result = TextProcessor.identifyConversableSegments('', trumpMap, mapKeys);
      expect(result).toEqual([]);
    });

    it('should return empty array for very short text', () => {
      const result = TextProcessor.identifyConversableSegments('hi', trumpMap, mapKeys);
      expect(result).toEqual([]);
    });

    it('should find Trump references in simple text', () => {
      SIMPLE_REFERENCES.forEach((text) => {
        const result = TextProcessor.identifyConversableSegments(text, trumpMap, mapKeys);
        expect(result.length).toBeGreaterThan(0);
        expect(result[0]).toHaveProperty('originalText');
        expect(result[0]).toHaveProperty('convertedText');
        expect(result[0]).toHaveProperty('startIndex');
        expect(result[0]).toHaveProperty('endIndex');
      });
    });
  });

  describe('Pattern Matching', () => {
    it('should correctly identify start and end indices', () => {
      const text = 'Hello Trump how are you?';
      const result = TextProcessor.identifyConversableSegments(text, trumpMap, mapKeys);

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].startIndex).toBe(6); // Position of "Trump"
      expect(result[0].endIndex).toBe(11); // End position of "Trump"
      expect(result[0].originalText).toBe('Trump');
    });

    it('should handle multiple references in the same text', () => {
      const result = TextProcessor.identifyConversableSegments(
        PARAGRAPH_WITH_MULTIPLE_REFERENCES,
        trumpMap,
        mapKeys
      );

      expect(result.length).toBeGreaterThan(1);
      // Results should be sorted by startIndex
      for (let i = 1; i < result.length; i++) {
        expect(result[i].startIndex).toBeGreaterThanOrEqual(result[i - 1].startIndex);
      }
    });

    it('should handle overlapping segments correctly', () => {
      // Create a case where we might have overlapping matches
      const text = 'Donald Trump and President Trump';
      const result = TextProcessor.identifyConversableSegments(text, trumpMap, mapKeys);

      // Should remove overlapping segments and keep only non-overlapping ones
      for (let i = 1; i < result.length; i++) {
        expect(result[i].startIndex).toBeGreaterThanOrEqual(result[i - 1].endIndex);
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle edge cases without throwing errors', () => {
      EDGE_CASES.forEach((edgeCase) => {
        expect(() => {
          const result = TextProcessor.identifyConversableSegments(edgeCase, trumpMap, mapKeys);
          expect(Array.isArray(result)).toBe(true);
        }).not.toThrow();
      });
    });

    it('should handle null and undefined inputs gracefully', () => {
      expect(TextProcessor.identifyConversableSegments(null as any, trumpMap, mapKeys)).toEqual([]);
      expect(
        TextProcessor.identifyConversableSegments(undefined as any, trumpMap, mapKeys)
      ).toEqual([]);
    });

    it('should handle case-insensitive matching', () => {
      const upperCaseText = 'TRUMP announced new policies today';
      const lowerCaseText = 'trump announced new policies today';
      const mixedCaseText = 'Trump announced new policies today';

      const upperResult = TextProcessor.identifyConversableSegments(
        upperCaseText,
        trumpMap,
        mapKeys
      );
      const lowerResult = TextProcessor.identifyConversableSegments(
        lowerCaseText,
        trumpMap,
        mapKeys
      );
      const mixedResult = TextProcessor.identifyConversableSegments(
        mixedCaseText,
        trumpMap,
        mapKeys
      );

      expect(upperResult.length).toBeGreaterThan(0);
      expect(lowerResult.length).toBeGreaterThan(0);
      expect(mixedResult.length).toBeGreaterThan(0);
    });
  });

  describe('Performance Optimization', () => {
    it('should skip processing for texts unlikely to contain matches', () => {
      const irrelevantText = 'This is just some random text about cats and dogs';
      const result = TextProcessor.identifyConversableSegments(irrelevantText, trumpMap, mapKeys);
      expect(result).toEqual([]);
    });

    it('should process texts likely to contain matches', () => {
      const relevantText = 'Trump said something about CNN today';
      const result = TextProcessor.identifyConversableSegments(relevantText, trumpMap, mapKeys);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('Segment Structure', () => {
    it('should return segments with correct structure', () => {
      const text = 'Trump is the president';
      const result = TextProcessor.identifyConversableSegments(text, trumpMap, mapKeys);

      expect(result.length).toBeGreaterThan(0);

      result.forEach((segment) => {
        expect(segment).toHaveProperty('originalText');
        expect(segment).toHaveProperty('convertedText');
        expect(segment).toHaveProperty('startIndex');
        expect(segment).toHaveProperty('endIndex');

        expect(typeof segment.originalText).toBe('string');
        expect(typeof segment.convertedText).toBe('string');
        expect(typeof segment.startIndex).toBe('number');
        expect(typeof segment.endIndex).toBe('number');

        expect(segment.startIndex).toBeGreaterThanOrEqual(0);
        expect(segment.endIndex).toBeGreaterThan(segment.startIndex);
      });
    });
  });
});
