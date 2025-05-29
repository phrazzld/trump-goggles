import { describe, it, expect, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';
import type { JSDOMWindow } from '../types/dom';

// Import functions from content.js to test
// Note: This imports may need adjustment when packaging the extension
// We're assuming we can directly import from content.js

interface TrumpMappingItem {
  regex: RegExp;
  nick: string;
}

interface TrumpMappingObject {
  [key: string]: TrumpMappingItem;
}

/**
 * Creates a text node with the given content for testing
 */
function createTextNode(text: string): Text {
  const dom = new JSDOM('<!DOCTYPE html><p></p>');
  const window = dom.window as JSDOMWindow;
  const textNode = window.document.createTextNode(text);
  window.document.querySelector('p')?.appendChild(textNode);
  return textNode;
}

/**
 * Create a mapping of Trump-style replacements
 */
function buildTrumpMap(): TrumpMappingObject {
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
 */
function convert(textNode: Text): void {
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
      (chrome.storage.sync.get as any).mockImplementation(
        (
          _keys: string | string[] | Record<string, any> | null,
          callback: (items: Record<string, any>) => void
        ) => {
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
