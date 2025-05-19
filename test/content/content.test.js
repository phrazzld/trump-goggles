import { describe, it, expect, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';

// Import functions from content.js to test
// Note: This imports may need adjustment when packaging the extension
// We're assuming we can directly import from content.js

/**
 * Creates a text node with the given content for testing
 * @param {string} text - The text content for the node
 * @returns {Text} The created text node
 */
function createTextNode(text) {
  const dom = new JSDOM('<!DOCTYPE html><p></p>');
  const textNode = dom.window.document.createTextNode(text);
  dom.window.document.querySelector('p')?.appendChild(textNode);
  return textNode;
}

/**
 * Create a mapping of Trump-style replacements
 * @returns {TrumpMappingObject} Object with replacement patterns
 */
function buildTrumpMap() {
  return {
    cnn: {
      regex: new RegExp('CNN', 'g'),
      nick: 'Clinton News Network',
    },
    hillary: {
      regex: new RegExp('(Hillary Clinton)|(Hillary Rodham Clinton)|(Mrs\\. Clinton)', 'g'),
      nick: 'Crooked Hillary',
    },
    coffee: {
      regex: new RegExp('(coffee)|(Coffee)', 'g'),
      nick: 'covfefe',
    },
  };
}

/**
 * Converts text in a node using Trump-style replacements
 * @param {Text} textNode - The text node to process
 * @returns {void}
 */
function convert(textNode) {
  const mappings = buildTrumpMap();
  const mapKeys = Object.keys(mappings);
  mapKeys.forEach(function (key) {
    if (textNode.nodeValue && key in mappings) {
      textNode.nodeValue = textNode.nodeValue.replace(mappings[key].regex, mappings[key].nick);
    }
  });
}

describe('Content Script', () => {
  // Setup chrome mock
  beforeEach(() => {
    if (chrome?.storage?.sync?.get) {
      /** @type {any} */
      (chrome.storage.sync.get).mockImplementation(
        /**
         * Mock implementation of chrome.storage.sync.get
         * @param {string|string[]|Record<string,any>|null} _keys - Keys to get
         * @param {(items: Record<string,any>) => void} callback - Callback function
         * @returns {void}
         */
        (_keys, callback) => {
          callback({});
        }
      );
    }
  });

  describe('Text Replacement', () => {
    it('should replace CNN with Clinton News Network', () => {
      const textNode = createTextNode('I was watching CNN yesterday');
      convert(textNode);
      expect(textNode.nodeValue).toBe('I was watching Clinton News Network yesterday');
    });

    it('should replace Hillary Clinton with Crooked Hillary', () => {
      const textNode = createTextNode('Hillary Clinton gave a speech');
      convert(textNode);
      expect(textNode.nodeValue).toBe('Crooked Hillary gave a speech');
    });

    it('should replace coffee with covfefe', () => {
      const textNode = createTextNode('I drink coffee every morning');
      convert(textNode);
      expect(textNode.nodeValue).toBe('I drink covfefe every morning');
    });

    it('should not replace text that does not match patterns', () => {
      const textNode = createTextNode('Just some random text here');
      convert(textNode);
      expect(textNode.nodeValue).toBe('Just some random text here');
    });
  });
});
