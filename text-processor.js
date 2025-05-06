/**
 * Text Processor Module - Responsible for text replacement operations
 *
 * This module handles the actual text replacement logic, separate from the DOM traversal.
 * It implements efficient pattern matching with early bailout optimizations and proper
 * regex handling for better performance.
 *
 * @version 3.0.0
 */

// TextProcessor module pattern
const TextProcessor = (function () {
  'use strict';

  // ===== CACHE AND OPTIMIZATION =====

  // Cache for processed text to avoid redundant operations
  const processedTextCache = new Map();

  // Cache size limit to prevent memory leaks
  const MAX_CACHE_SIZE = 1000;

  /**
   * Clears the text processing cache
   *
   * @public
   */
  function clearCache() {
    processedTextCache.clear();
  }

  /**
   * Checks if the cache needs trimming and removes oldest entries
   *
   * @private
   */
  function trimCacheIfNeeded() {
    if (processedTextCache.size > MAX_CACHE_SIZE) {
      // Remove oldest entries (approximated by taking first 25% of entries)
      const keysToRemove = Array.from(processedTextCache.keys()).slice(
        0,
        Math.floor(MAX_CACHE_SIZE * 0.25)
      );

      keysToRemove.forEach((key) => processedTextCache.delete(key));
    }
  }

  /**
   * Checks if text is likely to contain any patterns worth processing
   *
   * @private
   * @param {string} text - The text to check
   * @param {Object} replacementMap - The map of patterns to check against
   * @param {string[]} mapKeys - The keys from the replacement map
   * @returns {boolean} - Whether the text likely contains matches
   */
  function isLikelyToContainMatches(text, replacementMap, mapKeys) {
    // Skip very short texts - unlikely to contain our political terms
    if (!text || text.length < 3) {
      return false;
    }

    // Check if text contains any common words that might be part of our patterns
    const commonWords = ['the', 'president', 'trump', 'biden', 'cnn', 'fox', 'news'];
    const lowerText = text.toLowerCase();
    const hasCommonWord = commonWords.some((word) => lowerText.includes(word));

    if (!hasCommonWord) {
      // Quick reject for texts that don't contain common political words
      return false;
    }

    // Sample a few keys to check for potential matches before full processing
    const sampleSize = Math.min(5, mapKeys.length);
    const sampleKeys = mapKeys.slice(0, sampleSize);

    for (let i = 0; i < sampleKeys.length; i++) {
      const key = sampleKeys[i];
      const pattern = replacementMap[key].regex.source.split('|')[0].replace(/[\\()]/g, '');

      // If pattern is substantial and included in the text, it's worth processing
      if (pattern.length > 3 && lowerText.includes(pattern.toLowerCase().replace(/\\b/g, ''))) {
        return true;
      }
    }

    return false;
  }

  // ===== TEXT REPLACEMENT =====

  /**
   * Applies replacement patterns to a string without modifying the DOM
   *
   * @public
   * @param {string} text - The text to process
   * @param {Object} replacementMap - Map of regex patterns to replacements
   * @param {string[]} mapKeys - Keys for the replacement map
   * @param {Object} options - Additional configuration options
   * @param {boolean} options.useCache - Whether to use the text cache
   * @param {boolean} options.earlyBailout - Whether to use early bailout optimization
   * @returns {string} - The processed text with replacements applied
   */
  function processText(text, replacementMap, mapKeys, options = {}) {
    const useCache = options.useCache !== false;
    const earlyBailout = options.earlyBailout !== false;

    // Don't process empty or very short strings
    if (!text || text.length < 2) {
      return text;
    }

    // Check cache first if enabled
    if (useCache && processedTextCache.has(text)) {
      return processedTextCache.get(text);
    }

    // Skip processing with early bailout optimization if enabled
    if (earlyBailout && !isLikelyToContainMatches(text, replacementMap, mapKeys)) {
      // Still cache the result to avoid rechecking
      if (useCache) {
        processedTextCache.set(text, text);
        trimCacheIfNeeded();
      }
      return text;
    }

    // Apply all replacements to create the processed text
    let processedText = text;

    for (let i = 0; i < mapKeys.length; i++) {
      const key = mapKeys[i];

      try {
        // Skip patterns unlikely to match
        const pattern = replacementMap[key].regex.source.split('|')[0].replace(/[\\()]/g, '');
        if (pattern.length > 3 && !processedText.includes(pattern.replace(/\\b/g, ''))) {
          continue;
        }

        // Apply replacement
        processedText = processedText.replace(replacementMap[key].regex, replacementMap[key].nick);

        // Reset the regex lastIndex if it has global flag
        if (replacementMap[key].regex.global) {
          replacementMap[key].regex.lastIndex = 0;
        }
      } catch (regexError) {
        console.error('Trump Goggles: Error applying regex', key, regexError);
      }
    }

    // Cache the result if it changed and caching is enabled
    if (useCache && processedText !== text) {
      processedTextCache.set(text, processedText);
      trimCacheIfNeeded();
    }

    return processedText;
  }

  /**
   * Processes a text node by applying text replacements to its content
   *
   * @public
   * @param {Text} textNode - The text node to process
   * @param {Object} replacementMap - Map of regex patterns to replacements
   * @param {string[]} mapKeys - Keys for the replacement map
   * @param {Object} options - Configuration options
   * @param {boolean} options.useCache - Whether to use text caching
   * @param {boolean} options.earlyBailout - Whether to use early optimization
   * @param {Function} options.onProcessed - Optional callback when processing is complete
   * @returns {boolean} - Whether any replacements were made
   */
  function processTextNode(textNode, replacementMap, mapKeys, options = {}) {
    try {
      // Skip invalid nodes
      if (!textNode || textNode.nodeType !== 3 || !textNode.nodeValue) {
        return false;
      }

      // Get the original text content
      const originalText = textNode.nodeValue;

      // Process the text content
      const processedText = processText(originalText, replacementMap, mapKeys, {
        useCache: options.useCache !== false,
        earlyBailout: options.earlyBailout !== false,
      });

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
    } catch (error) {
      console.error('Trump Goggles: Error processing text node', error);
      return false;
    }
  }

  // ===== PUBLIC API =====

  return {
    // Core text processing methods
    processText: processText,
    processTextNode: processTextNode,

    // Cache management
    clearCache: clearCache,

    // Optimization helpers
    isLikelyToContainMatches: isLikelyToContainMatches,
  };
})();

// Export the module
window.TextProcessor = TextProcessor;
