/**
 * Text Processor Module - Responsible for text replacement operations
 *
 * This module handles the actual text replacement logic, separate from the DOM traversal.
 * It implements efficient pattern matching with advanced optimizations including pattern
 * pre-compilation, incremental processing, improved caching, and smart early bailout.
 *
 * @version 4.0.0
 *
 * @typedef {Object} TextProcessorConfig
 * @property {number} LARGE_TEXT_THRESHOLD - Text length threshold for incremental processing
 * @property {number} CHUNK_SIZE - Size of text chunks for incremental processing
 * @property {number} PROCESSING_DELAY_MS - Delay between processing chunks
 * @property {number} MAX_CACHE_SIZE - Maximum number of cache entries
 *
 * @typedef {Object} TimerInterface
 * @property {Function} stop - Stops the timer and returns elapsed time
 */

// TextProcessor module pattern
const TextProcessor = (function () {
  'use strict';

  // ===== CONSTANTS AND CONFIGURATION =====

  // Cache configuration
  const MAX_CACHE_SIZE = 1000; // Maximum number of cache entries
  const CACHE_TRIM_PERCENT = 25; // Percentage of cache to trim when full

  // Performance configuration
  const LARGE_TEXT_THRESHOLD = 1000; // Text length threshold for incremental processing
  const CHUNK_SIZE = 500; // Size of text chunks for incremental processing
  const PROCESSING_DELAY_MS = 0; // Delay between processing chunks (0 = next tick)

  // Early bailout configuration
  const MIN_TERM_LENGTH = 3; // Minimum length of terms to consider for early bailout
  const COMMON_POLITICAL_WORDS = [
    'trump',
    'biden',
    'hillary',
    'clinton',
    'obama',
    'cruz',
    'rubio',
    'jeb',
    'bush',
    'nancy',
    'pelosi',
    'schumer',
    'chuck',
    'mitch',
    'mcconnell',
    'desantis',
    'ron',
    'haley',
    'nikki',
    'schiff',
    'adam',
    'bernie',
    'sanders',
    'cnn',
    'fox',
    'msnbc',
    'nbc',
    'abc',
    'cbs',
    'news',
    'times',
    'president',
    'senator',
    'congress',
    'pandemic',
    'covid',
    'coronavirus',
  ];

  // Common nickname checks for faster detection
  const COMMON_NICKNAMES = [
    'crooked',
    'lyin',
    'little',
    'low energy',
    'crazy',
    'sleepy',
    'mini',
    'sloppy',
    'rocket man',
    'fake news',
    'failing',
    'animal',
    'pocahontas',
    'goofy',
    'birdbrain',
    'old crow',
    'shifty',
    'cryin',
    'deranged',
  ];

  // ===== CACHE IMPLEMENTATION =====

  /**
   * LRU Cache implementation for text processing results
   * @type {{
   *  entries: Map<string, string>,
   *  hits: number,
   *  misses: number,
   *  get: (key: string) => string|null,
   *  set: (key: string, value: string) => void,
   *  clear: () => void,
   *  trim: () => void,
   *  getStats: () => CacheStats
   * }}
   */
  const cache = {
    // Cache data
    entries: new Map(),

    // Cache stats
    hits: 0,
    misses: 0,

    /**
     * Get a value from the cache
     *
     * @param {string} key - Cache key
     * @returns {string|null} Cached value or null if not found
     */
    get(key) {
      const value = this.entries.get(key);

      if (value !== undefined) {
        // Cache hit - move entry to the "end" to implement LRU
        this.entries.delete(key);
        this.entries.set(key, value);
        this.hits++;
        return value;
      }

      // Cache miss
      this.misses++;
      return null;
    },

    /**
     * Set a value in the cache
     *
     * @param {string} key - Cache key
     * @param {string} value - Value to cache
     */
    set(key, value) {
      // Trim cache if it's at capacity
      if (this.entries.size >= MAX_CACHE_SIZE) {
        this.trim();
      }

      // Add or update entry
      this.entries.set(key, value);
    },

    /**
     * Clear the cache
     */
    clear() {
      this.entries.clear();
      this.hits = 0;
      this.misses = 0;
    },

    /**
     * Trim the cache by removing oldest entries
     */
    trim() {
      const keysToRemove = Array.from(this.entries.keys()).slice(
        0,
        Math.floor(MAX_CACHE_SIZE * (CACHE_TRIM_PERCENT / 100))
      );

      keysToRemove.forEach((key) => this.entries.delete(key));
    },

    /**
     * Get cache statistics
     *
     * @returns {CacheStats} Cache statistics
     */
    getStats() {
      const total = this.hits + this.misses;
      return {
        size: this.entries.size,
        hits: this.hits,
        misses: this.misses,
        hitRate: total > 0 ? this.hits / total : 0,
      };
    },
  };

  // ===== PATTERN OPTIMIZATION =====

  /**
   * Precompiles and optimizes regex patterns for better performance
   *
   * @param {ReplacementMap} replacementMap - Original replacement map
   * @returns {ReplacementMap} Optimized replacement map
   */
  function precompilePatterns(replacementMap) {
    /** @type {ReplacementMap} */
    const optimized = {};

    for (const key in replacementMap) {
      if (!Object.prototype.hasOwnProperty.call(replacementMap, key)) continue;

      // Create a copy of the original entry
      optimized[key] = { ...replacementMap[key] };

      const regex = replacementMap[key].regex;

      // Extract key terms from the regex for faster scanning
      optimized[key].keyTerms = extractKeyTerms(regex);

      // Flag to indicate if this pattern is likely to match within words
      optimized[key].matchesPartialWords = !regex.source.includes('\\b');

      // Ensure case insensitivity for consistent matching
      if (!regex.ignoreCase) {
        optimized[key].regex = new RegExp(regex.source, regex.flags + 'i');
      }
    }

    return optimized;
  }

  /**
   * Extract literal key terms from a regex pattern for fast matching
   *
   * @private
   * @param {RegExp} regex - The regex to extract terms from
   * @returns {string[]} Array of key terms
   */
  function extractKeyTerms(regex) {
    // Get regex source and normalize it
    const source = regex.source
      .replace(/\\\(/g, '(') // Convert \( to ( for easier parsing
      .replace(/\\\)/g, ')') // Convert \) to ) for easier parsing
      .replace(/\\b/g, ''); // Remove word boundaries

    // Extract literal strings that aren't in character classes or complex groups
    const parts = source
      .replace(/\\.|\[.*?\]/g, ' ') // Replace escapes and character classes with space
      .replace(/\((\?:)?.*?\)/g, ' ') // Replace capturing and non-capturing groups with space
      .split(/[\^\$\*\+\?\{\}|\\]/); // Split on regex special chars

    // Filter out short terms, duplicates, and normalize
    return parts
      .map((part) => part.trim())
      .filter(
        (part) => part.length >= MIN_TERM_LENGTH && !part.includes('(') && !part.includes(')')
      )
      .filter((part, index, self) => self.indexOf(part) === index); // Remove duplicates
  }

  // ===== EARLY BAILOUT OPTIMIZATION =====

  /**
   * Checks if text is likely to contain any patterns worth processing (improved version)
   *
   * @private
   * @param {string} text - The text to check
   * @param {ReplacementMap} replacementMap - The map of patterns to check against
   * @param {string[]} mapKeys - The keys from the replacement map
   * @returns {boolean} - Whether the text likely contains matches
   */
  function isLikelyToContainMatches(text, replacementMap, mapKeys) {
    // Skip very short texts
    if (!text || text.length < MIN_TERM_LENGTH) {
      return false;
    }

    // Convert to lowercase for case-insensitive checks
    const lowerText = text.toLowerCase();

    // Check for any of the common nicknames - if present, definitely process this text
    const hasNickname = COMMON_NICKNAMES.some((nickname) => lowerText.includes(nickname));

    if (hasNickname) {
      return true;
    }

    // Quick check for common political words - these are likely to be in our patterns
    const hasCommonWord = COMMON_POLITICAL_WORDS.some((word) => lowerText.includes(word));

    if (!hasCommonWord) {
      return false;
    }

    // More detailed check using key terms from patterns
    for (const key of mapKeys) {
      const entry = replacementMap[key];

      // If we have extracted key terms, check if any are in the text
      if (entry.keyTerms && entry.keyTerms.length > 0) {
        for (const term of entry.keyTerms) {
          if (term.length >= MIN_TERM_LENGTH && lowerText.includes(term.toLowerCase())) {
            return true;
          }
        }
      }
      // Fallback to checking the pattern directly
      else if (entry.regex) {
        const patternTest = entry.regex.test(text);
        if (patternTest) {
          // Reset lastIndex if it's a global regex
          if (entry.regex.global) {
            entry.regex.lastIndex = 0;
          }
          return true;
        }
      }
    }

    return false;
  }

  // ===== TEXT ANALYSIS AND REPLACEMENT =====

  /**
   * Find all conversable segments in a text that match a pattern
   *
   * @private
   * @param {string} text - Text to analyze
   * @param {TrumpMapping} patternEntry - Pattern entry with regex and nickname
   * @returns {TextSegmentConversion[]} - Array of identified segments for conversion
   */
  function findMatchingSegments(text, patternEntry) {
    /** @type {TextSegmentConversion[]} */
    const segments = [];

    try {
      // Early bailout for unlikely matches
      if (patternEntry.keyTerms && patternEntry.keyTerms.length > 0) {
        const lowerText = text.toLowerCase();
        const hasKeyTerm = patternEntry.keyTerms.some((term) =>
          lowerText.includes(term.toLowerCase())
        );

        if (!hasKeyTerm) {
          return segments;
        }
      }

      // Create a copy of the regex with global flag to find all matches
      const regex = new RegExp(
        patternEntry.regex.source,
        patternEntry.regex.global ? patternEntry.regex.flags : patternEntry.regex.flags + 'g'
      );

      // Find all matches
      let match;
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

      // Reset lastIndex
      if (patternEntry.regex.global) {
        patternEntry.regex.lastIndex = 0;
      }

      return segments;
    } catch (error) {
      console.error('Trump Goggles: Error finding matching segments', error);
      return segments;
    }
  }

  /**
   * Apply a single replacement pattern to text
   *
   * @private
   * @param {string} text - Text to process
   * @param {TrumpMapping} patternEntry - Pattern entry with regex and nickname
   * @returns {string} - Processed text
   */
  function applySingleReplacement(text, patternEntry) {
    try {
      // Early bailout for unlikely matches
      if (patternEntry.keyTerms && patternEntry.keyTerms.length > 0) {
        const lowerText = text.toLowerCase();
        const hasKeyTerm = patternEntry.keyTerms.some((term) =>
          lowerText.includes(term.toLowerCase())
        );

        if (!hasKeyTerm) {
          return text;
        }
      }

      // Apply the replacement
      const result = text.replace(patternEntry.regex, patternEntry.nick);

      // Reset lastIndex if it's a global regex
      if (patternEntry.regex.global) {
        patternEntry.regex.lastIndex = 0;
      }

      return result;
    } catch (error) {
      console.error('Trump Goggles: Error applying single replacement', error);
      return text;
    }
  }

  /**
   * Applies replacement patterns to a string without modifying the DOM
   *
   * @public
   * @param {string} text - The text to process
   * @param {ReplacementMap} replacementMap - Map of regex patterns to replacements
   * @param {string[]} mapKeys - Keys for the replacement map
   * @param {ProcessOptions} [options] - Additional configuration options
   * @returns {string} - The processed text with replacements applied
   */
  function processText(
    text,
    replacementMap,
    mapKeys,
    options = {
      useCache: true,
      earlyBailout: true,
      precompilePatterns: true,
    }
  ) {
    const useCache = options.useCache !== false;
    const earlyBailout = options.earlyBailout !== false;
    const shouldPrecompile = options.precompilePatterns !== false;

    // Don't process empty or very short strings
    if (!text || text.length < 2) {
      return text;
    }

    // Check cache first if enabled
    if (useCache) {
      const cachedResult = cache.get(text);
      if (cachedResult !== null) {
        return cachedResult;
      }
    }

    // Skip processing with early bailout optimization if enabled
    if (earlyBailout && !isLikelyToContainMatches(text, replacementMap, mapKeys)) {
      // Still cache the result to avoid rechecking
      if (useCache) {
        cache.set(text, text);
      }
      return text;
    }

    // Precompile patterns if requested (should only happen once per initialization)
    const finalMap = shouldPrecompile ? precompilePatterns(replacementMap) : replacementMap;

    // Check if we should use incremental processing for large texts
    if (text.length > LARGE_TEXT_THRESHOLD) {
      // For large texts, we'll process incrementally but still return synchronously
      // For truly async processing, use processTextAsync method
      return processLargeText(text, finalMap, mapKeys);
    }

    // Apply all replacements to create the processed text
    let processedText = text;

    for (let i = 0; i < mapKeys.length; i++) {
      const key = mapKeys[i];
      processedText = applySingleReplacement(processedText, finalMap[key]);
    }

    // Cache the result if it changed and caching is enabled
    if (useCache && processedText !== text) {
      cache.set(text, processedText);
    }

    return processedText;
  }

  /**
   * Process a large text by splitting it into chunks
   *
   * @private
   * @param {string} text - Text to process
   * @param {ReplacementMap} replacementMap - Map of regex patterns to replacements
   * @param {string[]} mapKeys - Keys for the replacement map
   * @returns {string} - Processed text
   */
  function processLargeText(text, replacementMap, mapKeys) {
    // Split text into chunks to avoid UI freezing
    /** @type {string[]} */
    const chunks = [];
    for (let i = 0; i < text.length; i += CHUNK_SIZE) {
      chunks.push(text.substring(i, i + CHUNK_SIZE));
    }

    // Process each chunk
    const processedChunks = chunks.map((chunk) => {
      let chunkResult = chunk;

      // Apply all replacements to this chunk
      for (let i = 0; i < mapKeys.length; i++) {
        const key = mapKeys[i];
        chunkResult = applySingleReplacement(chunkResult, replacementMap[key]);
      }

      return chunkResult;
    });

    // Join processed chunks
    return processedChunks.join('');
  }

  /**
   * Asynchronously process a text string
   *
   * @public
   * @param {string} text - Text to process
   * @param {ReplacementMap} replacementMap - Map of regex patterns to replacements
   * @param {string[]} mapKeys - Keys for the replacement map
   * @param {ProcessOptions} [options] - Processing options
   * @returns {Promise<string>} - Promise resolving to processed text
   */
  function processTextAsync(text, replacementMap, mapKeys, options = {}) {
    return new Promise((resolve) => {
      // For small texts, process immediately
      if (!text || text.length <= LARGE_TEXT_THRESHOLD) {
        resolve(processText(text, replacementMap, mapKeys, options));
        return;
      }

      // For large texts, split into chunks and process incrementally
      /** @type {string[]} */
      const chunks = [];
      for (let i = 0; i < text.length; i += CHUNK_SIZE) {
        chunks.push(text.substring(i, i + CHUNK_SIZE));
      }

      // Precompile patterns if needed
      const finalMap =
        options.precompilePatterns !== false ? precompilePatterns(replacementMap) : replacementMap;

      // Process chunks incrementally
      let result = '';
      let index = 0;

      function processNextChunk() {
        if (index >= chunks.length) {
          // All chunks processed
          resolve(result);
          return;
        }

        // Process current chunk
        const chunk = chunks[index++];
        let processedChunk = chunk;

        // Apply all replacements to this chunk
        for (let i = 0; i < mapKeys.length; i++) {
          const key = mapKeys[i];
          processedChunk = applySingleReplacement(processedChunk, finalMap[key]);
        }

        // Add to result
        result += processedChunk;

        // Schedule next chunk with a small delay
        setTimeout(processNextChunk, PROCESSING_DELAY_MS);
      }

      // Start processing
      processNextChunk();
    });
  }

  /**
   * Processes a text node by applying text replacements to its content
   *
   * @public
   * @param {Text} textNode - The text node to process
   * @param {ReplacementMap} replacementMap - Map of regex patterns to replacements
   * @param {string[]} mapKeys - Keys for the replacement map
   * @param {ProcessOptions} [options] - Configuration options
   * @returns {boolean|Promise<boolean>} - Whether any replacements were made (or Promise resolving to this value if async)
   */
  function processTextNode(
    textNode,
    replacementMap,
    mapKeys,
    options = {
      useCache: true,
      earlyBailout: true,
      precompilePatterns: true,
      async: false,
      onProcessed: () => {},
    }
  ) {
    try {
      // Skip invalid nodes
      if (!textNode || textNode.nodeType !== 3 || !textNode.nodeValue) {
        return options.async ? Promise.resolve(false) : false;
      }

      // Get the original text content
      const originalText = textNode.nodeValue;

      // Process the text content
      const processFunc = options.async ? processTextAsync : processText;

      const result = processFunc(originalText, replacementMap, mapKeys, {
        useCache: options.useCache !== false,
        earlyBailout: options.earlyBailout !== false,
        precompilePatterns: options.precompilePatterns,
      });

      // Handle async or sync result
      if (result instanceof Promise) {
        return result.then((processedText) => {
          // Only update the DOM if the text actually changed
          if (processedText !== originalText) {
            textNode.nodeValue = processedText;

            // Call the onProcessed callback if provided
            if (typeof options.onProcessed === 'function') {
              options.onProcessed(textNode, originalText, processedText);
            }

            return true;
          }

          return false;
        });
      } else {
        // Synchronous result
        const processedText = result;

        // Only update the DOM if the text actually changed
        if (processedText !== originalText) {
          textNode.nodeValue = processedText;

          // Call the onProcessed callback if provided
          if (typeof options.onProcessed === 'function') {
            options.onProcessed(textNode, originalText, processedText);
          }

          return true;
        }

        return false;
      }
    } catch (error) {
      console.error('Trump Goggles: Error processing text node', error);
      return options.async ? Promise.resolve(false) : false;
    }
  }

  /**
   * Identifies text segments that need conversion without modifying the DOM
   *
   * @public
   * @param {string} textNodeContent - The text content to process
   * @param {ReplacementMap} replacementMap - The map of replacements to apply
   * @param {string[]} mapKeys - The keys of the replacement map to use
   * @returns {TextSegmentConversion[]} - Array of text segments that need conversion
   */
  function identifyConversableSegments(textNodeContent, replacementMap, mapKeys) {
    /** @type {TextSegmentConversion[]} */
    const segments = [];

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
    // This is a simple approach that keeps earlier matches when overlaps occur
    if (segments.length > 1) {
      /** @type {TextSegmentConversion[]} */
      const nonOverlapping = [segments[0]];

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
  }

  // ===== PUBLIC API =====

  /** @type {TextProcessorInterface} */
  return {
    // Core text processing methods
    processText: processText,
    processTextAsync: processTextAsync,
    processTextNode: processTextNode,

    // Segment identification method
    identifyConversableSegments: identifyConversableSegments,

    // Pattern optimization
    precompilePatterns: precompilePatterns,

    // Cache management
    clearCache: () => cache.clear(),
    getCacheStats: () => cache.getStats(),

    // Optimization helpers
    isLikelyToContainMatches: isLikelyToContainMatches,

    // Configuration (exported for testing/debugging)
    config: {
      LARGE_TEXT_THRESHOLD,
      CHUNK_SIZE,
      PROCESSING_DELAY_MS,
      MAX_CACHE_SIZE,
    },
  };
})();

// Export the module
window.TextProcessor = TextProcessor;
