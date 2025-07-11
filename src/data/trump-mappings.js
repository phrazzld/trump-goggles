/**
 * Trump Mappings - Immutable Map of phrases to Trump's nicknames
 *
 * This module provides Trump nickname mappings and associated utilities
 * for text replacement functionality. It uses a proper module pattern with
 * encapsulated functionality and a clean public API.
 *
 * **Immutability Guarantee:**
 * All mappings returned by this module are deeply frozen using Object.freeze()
 * to prevent accidental mutations and ensure data integrity. This includes:
 * - Root mapping objects are frozen
 * - Individual mapping objects are frozen
 * - Nested arrays and objects are frozen
 * - RegExp objects remain unfrozen to maintain functionality
 *
 * @version 3.0.0
 */

// TrumpMappings module pattern
const TrumpMappings = (function () {
  'use strict';

  // Global initialization flag - maintained for backward compatibility
  // This flag helps prevent multiple content scripts from initializing simultaneously
  window.trumpGogglesInitialized = window.trumpGogglesInitialized || false;

  // Module internal state and constants
  const mappings = {
    // Original mappings - Politicians
    isis: {
      regex: new RegExp('\\b(ISIS|ISIL|Islamic State)\\b', 'gi'),
      nick: 'Evil Losers',
    },
    hillary: {
      regex: new RegExp('\\b(Hillary Clinton|Hillary Rodham Clinton|Mrs\\. Clinton)\\b', 'gi'),
      nick: 'Crooked Hillary',
    },
    cruz: {
      regex: new RegExp('\\bTed Cruz\\b', 'gi'),
      nick: "Lyin' Ted",
    },
    marco: {
      regex: new RegExp('\\b(Marco Rubio|Rubio)\\b', 'gi'),
      nick: 'Little Marco',
    },
    jeb: {
      regex: new RegExp('\\b(Jeb Bush|Jeb)\\b', 'gi'),
      nick: 'Low Energy Jeb',
    },
    warren: {
      regex: new RegExp('\\bElizabeth Warren\\b', 'gi'),
      nick: 'Goofy Pocahontas',
    },
    lamb: {
      regex: new RegExp('\\bConor Lamb\\b', 'gi'),
      nick: 'Lamb the Sham',
    },
    bannon: {
      regex: new RegExp('\\bSteve Bannon\\b', 'gi'),
      nick: 'Sloppy Steve',
    },
    durbin: {
      regex: new RegExp('\\bDick Durbin\\b', 'gi'),
      nick: 'Dicky Durbin',
    },
    feinstein: {
      regex: new RegExp('\\bDianne Feinstein\\b', 'gi'),
      nick: 'Sneaky Dianne Feinstein',
    },
    flake: {
      regex: new RegExp('\\bJeff Flake\\b', 'gi'),
      nick: 'Jeff Flakey',
    },
    franken: {
      regex: new RegExp('\\bAl Franken\\b', 'gi'),
      nick: 'Al Frankenstein',
    },
    corker: {
      regex: new RegExp('\\bBob Corker\\b', 'gi'),
      nick: "Liddle' Bob Corker",
    },
    kasich: {
      regex: new RegExp('\\bJohn Kasich\\b', 'gi'),
      nick: '1 for 38 Kasich',
    },
    assad: {
      regex: new RegExp('\\bBashar (Hafez )?al-Assad\\b', 'gi'),
      nick: 'Animal Assad',
    },

    // Original mappings - Media
    kelly: {
      regex: new RegExp('\\bMegyn Kelly\\b', 'gi'),
      nick: 'Crazy Megyn',
    },
    scarborough: {
      regex: new RegExp('\\bJoe Scarborough\\b', 'gi'),
      nick: 'Psycho Joe',
    },
    mika: {
      regex: new RegExp('\\bMika Brzezinski\\b', 'gi'),
      nick: 'Dumb as a Rock Mika',
    },
    chucktodd: {
      regex: new RegExp('\\bChuck Todd\\b', 'gi'),
      nick: 'Sleepy Eyes Chuck Todd',
    },
    jimacosta: {
      regex: new RegExp('\\bJim Acosta\\b', 'gi'),
      nick: 'Crazy Jim Acosta',
    },

    // Misc
    coffee: {
      regex: new RegExp('\\bcoffee\\b', 'gi'),
      nick: 'covfefe',
    },

    // 2025 Upgrade Pack - Politicians & Prosecutors
    biden: {
      regex: new RegExp('\\bJoe\\s+Biden\\b', 'gi'),
      nick: 'Sleepy Joe',
    },
    kamala: {
      regex: new RegExp('\\bKamala\\s+Harris\\b', 'gi'),
      nick: 'Comrade Kamala',
    },
    desantis: {
      regex: new RegExp('\\bRon\\s+DeSantis\\b', 'gi'),
      nick: 'Ron DeSanctimonious',
    },
    haley: {
      regex: new RegExp('\\bNikki\\s+Haley\\b', 'gi'),
      nick: 'Birdbrain Nikki',
    },
    mcconnell: {
      regex: new RegExp('\\bMitch\\s+McConnell\\b', 'gi'),
      nick: 'Old Crow Mitch',
    },
    chao: {
      regex: new RegExp('\\bElaine\\s+Chao\\b', 'gi'),
      nick: 'Coco Chow',
    },
    schiff: {
      regex: new RegExp('\\bAdam\\s+Schiff\\b', 'gi'),
      nick: 'Shifty Schiff',
    },
    pelosi: {
      regex: new RegExp('\\bNancy\\s+Pelosi\\b', 'gi'),
      nick: 'Crazy Nancy',
    },
    schumer: {
      regex: new RegExp('\\bChuck\\s+Schumer\\b', 'gi'),
      nick: "Cryin' Chuck",
    },
    bloomberg: {
      regex: new RegExp('\\b(Michael|Mike)\\s+Bloomberg\\b', 'gi'),
      nick: 'Mini Mike',
    },
    cheney: {
      regex: new RegExp('\\bLiz\\s+Cheney\\b', 'gi'),
      nick: "Lyin' Liz",
    },
    christie: {
      regex: new RegExp('\\bChris\\s+Christie\\b', 'gi'),
      nick: 'Sloppy Chris',
    },
    bernie: {
      regex: new RegExp('\\bBernie\\s+Sanders\\b', 'gi'),
      nick: 'Crazy Bernie',
    },
    jacksmith: {
      regex: new RegExp('\\bJack\\s+Smith\\b', 'gi'),
      nick: 'Deranged Jack Smith',
    },
    bragg: {
      regex: new RegExp('\\bAlvin\\s+Bragg\\b', 'gi'),
      nick: 'Fat Alvin',
    },
    letitiajames: {
      regex: new RegExp('\\bLetitia\\s+James\\b', 'gi'),
      nick: 'Peekaboo',
    },

    // Foreign Leaders
    kimjongun: {
      regex: new RegExp('\\b(Kim Jong-un|Kim Jong Un)\\b', 'gi'),
      nick: 'Little Rocket Man',
    },

    // Media & Organizations - Fixed to avoid overlaps
    cnn: {
      regex: new RegExp('\\bCNN\\b', 'gi'),
      nick: 'Fake News CNN',
    },
    nyt: {
      regex: new RegExp('\\b(NYT|New\\s+York\\s+Times)\\b', 'gi'),
      nick: 'Failing New York Times',
    },
    washingtonpost: {
      regex: new RegExp('\\b(Washington\\s+Post|WaPo)\\b', 'gi'),
      nick: 'Amazon Washington Post',
    },
    msnbc: {
      regex: new RegExp('\\bMSNBC\\b', 'gi'),
      nick: 'MSDNC',
    },
    nbc: {
      regex: new RegExp('\\bNBC\\b(?!\\s+News)', 'gi'), // NBC but not NBC News
      nick: 'Fake News NBC',
    },
    nbcnews: {
      regex: new RegExp('\\bNBC\\s+News\\b', 'gi'),
      nick: 'Fake News NBC News',
    },
    abc: {
      regex: new RegExp('\\bABC\\b(?!\\s+News)', 'gi'), // ABC but not ABC News
      nick: 'Fake News ABC',
    },
    abcnews: {
      regex: new RegExp('\\bABC\\s+News\\b', 'gi'),
      nick: 'Fake News ABC News',
    },
    cbs: {
      regex: new RegExp('\\bCBS\\b', 'gi'),
      nick: 'Fake News CBS',
    },
    huffpo: {
      regex: new RegExp('\\b(HuffPo|Huffington\\s+Post)\\b', 'gi'),
      nick: 'Liberal Huffington Post',
    },
    comcast: {
      regex: new RegExp('\\bComcast\\b', 'gi'),
      nick: 'Concast',
    },
    forbes: {
      regex: new RegExp('\\bForbes\\b', 'gi'),
      nick: 'Failing Forbes Magazine',
    },

    // COVID-related terms
    covid: {
      regex: new RegExp('\\b(COVID[- ]?19|Covid|Coronavirus)\\b', 'gi'),
      nick: 'China Virus',
    },
    covidalt: {
      regex: new RegExp('\\b(SARS[- ]CoV[- ]?2|Wuhan\\s+Virus)\\b', 'gi'),
      nick: 'Kung Flu',
    },
  };

  // Apply deep freeze to ensure complete immutability at module initialization
  const frozenMappings = deepFreeze(mappings);

  // Create and freeze the keys array once for consistent returns
  const frozenKeys = Object.freeze(Object.keys(frozenMappings));

  /**
   * Recursively freezes an object and all its nested properties
   *
   * This utility function provides deep immutability by freezing objects
   * and recursively freezing all nested properties. Special handling is
   * provided for different object types:
   * - Primitives (string, number, boolean) are returned as-is
   * - null/undefined values are returned as-is
   * - RegExp objects are returned unfrozen to maintain functionality
   * - Arrays are frozen after recursively freezing all items
   * - Objects are frozen after recursively freezing all property values
   *
   * @private
   * @param {*} obj - Object to deep freeze
   * @returns {*} The frozen object (same reference, but immutable)
   */
  function deepFreeze(obj) {
    // Handle null/undefined
    if (obj === null || obj === undefined) {
      return obj;
    }

    // Handle primitive types (string, number, boolean, symbol, bigint)
    if (typeof obj !== 'object') {
      return obj;
    }

    // Handle RegExp objects - don't freeze them as they need to maintain functionality
    // RegExp.prototype.test(), .exec(), and other methods may modify internal state
    if (obj instanceof RegExp) {
      return obj;
    }

    // Handle Arrays - recursively freeze all items, then freeze the array itself
    if (Array.isArray(obj)) {
      obj.forEach((item) => deepFreeze(item));
      return Object.freeze(obj);
    }

    // Handle Objects - recursively freeze all property values, then freeze the object
    Object.values(obj).forEach((value) => deepFreeze(value));
    return Object.freeze(obj);
  }

  /**
   * Gets the keys of all available mappings
   *
   * Returns a frozen array containing all mapping keys. The returned array
   * is deeply immutable and cannot be modified. Multiple calls return the
   * same frozen array reference for optimal performance.
   *
   * @private
   * @returns {string[]} Frozen array of mapping keys (immutable)
   */
  function getMappingKeys() {
    return frozenKeys;
  }

  /**
   * Returns regex-nickname pairs for text replacement
   *
   * Returns a deeply frozen object containing all Trump nickname mappings.
   * The returned object and all nested mapping objects are immutable and
   * cannot be modified. RegExp objects within mappings remain unfrozen to
   * maintain their functionality for text matching operations.
   *
   * **Immutability Contract:**
   * - Root mappings object: frozen and immutable
   * - Individual mapping objects: frozen and immutable
   * - RegExp objects: unfrozen for functionality
   * - Multiple calls return the same frozen object reference
   *
   * @public
   * @returns {Object.<string, {regex: RegExp, nick: string}>} Deeply frozen immutable mappings object
   */
  function getReplacementMap() {
    return frozenMappings;
  }

  // Backward compatibility: provide global buildTrumpMap function
  // This is maintained for compatibility with existing code, but usage
  // of the proper module API is preferred in new code
  if (typeof window.buildTrumpMap !== 'function') {
    // Add deprecation notice in console during development
    const originalConsoleWarn = console.warn;
    console.warn = function (...args) {
      if (args[0] === 'TRUMP_MAPPINGS_DEPRECATION_WARNING') {
        // Avoid showing this warning repeatedly
        return;
      }
      originalConsoleWarn.apply(console, args);
    };

    /**
     * Legacy function for backward compatibility - returns immutable mappings
     *
     * This function returns the same deeply frozen, immutable mappings object
     * as TrumpMappings.getReplacementMap(). All immutability guarantees apply.
     *
     * @deprecated Use TrumpMappings.getReplacementMap() instead
     * @returns {Object.<string, {regex: RegExp, nick: string}>} Deeply frozen immutable mappings object
     */
    // @ts-ignore: Complex function type overload for legacy compatibility
    window.buildTrumpMap = function buildTrumpMap() {
      console.warn(
        'TRUMP_MAPPINGS_DEPRECATION_WARNING',
        'window.buildTrumpMap is deprecated. ' +
          'Please use TrumpMappings.getReplacementMap() instead.'
      );
      return getReplacementMap();
    };
  }

  // Public API
  return {
    getReplacementMap: getReplacementMap,
    getKeys: getMappingKeys,
  };
})();

// Export the module
window.TrumpMappings = TrumpMappings;
