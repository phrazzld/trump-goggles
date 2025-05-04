/**
 * Unit tests for the convert function in content.js
 */
import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';

// Recreate the necessary functions for testing
function buildTrumpMap() {
  return {
    // Sample mappings for testing
    cnn: {
      regex: new RegExp('\\bCNN\\b', 'gi'),
      nick: 'Fake News CNN',
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
    biden: {
      regex: new RegExp('Joe\\s+Biden', 'gi'),
      nick: 'Sleepy Joe',
    },
    coffee: {
      regex: new RegExp('(coffee)|(Coffee)', 'gi'),
      nick: 'covfefe',
    },
    nyt: {
      regex: new RegExp('\\b(NYT|New\\s+York\\s+Times)\\b', 'gi'),
      nick: 'Failing New York Times',
    },
    covid: {
      regex: new RegExp('\\b(COVID[- ]?19|Covid|Coronavirus)\\b', 'gi'),
      nick: 'China Virus',
    },
  };
}

// Cache the Trump mappings
const trumpMap = buildTrumpMap();
const mapKeys = Object.keys(trumpMap);

// Convert function to test
function convert(textNode) {
  // Create a temporary variable to avoid multiple DOM updates
  let replacedText = textNode.nodeValue;

  // Apply all replacements to the temporary variable
  mapKeys.forEach(function (key) {
    replacedText = replacedText.replace(trumpMap[key].regex, trumpMap[key].nick);
  });

  // Update DOM only once after all replacements are done
  textNode.nodeValue = replacedText;
}

// Helper function to create text nodes for testing
function createTextNode(text) {
  const dom = new JSDOM('<!DOCTYPE html><p></p>');
  const textNode = dom.window.document.createTextNode(text);
  dom.window.document.querySelector('p').appendChild(textNode);
  return textNode;
}

describe('convert Function', () => {
  it('should replace single pattern in a text node', () => {
    const textNode = createTextNode('I was watching CNN yesterday');
    convert(textNode);
    expect(textNode.nodeValue).toBe('I was watching Fake News CNN yesterday');
  });

  it('should replace multiple instances of the same pattern', () => {
    const textNode = createTextNode('CNN reported that CNN is fake news according to some');
    convert(textNode);
    expect(textNode.nodeValue).toBe(
      'Fake News CNN reported that Fake News CNN is fake news according to some'
    );
  });

  it('should replace multiple different patterns in a text node', () => {
    const textNode = createTextNode('Hillary Clinton and Ted Cruz appeared on CNN');
    convert(textNode);
    expect(textNode.nodeValue).toBe("Crooked Hillary and Lyin' Ted appeared on Fake News CNN");
  });

  it('should handle replacements at the beginning of text', () => {
    const textNode = createTextNode('CNN is reporting about Joe Biden');
    convert(textNode);
    expect(textNode.nodeValue).toBe('Fake News CNN is reporting about Sleepy Joe');
  });

  it('should handle replacements at the end of text', () => {
    const textNode = createTextNode('The press conference was held by Joe Biden');
    convert(textNode);
    expect(textNode.nodeValue).toBe('The press conference was held by Sleepy Joe');
  });

  it('should not modify text if no patterns match', () => {
    const textNode = createTextNode('This text contains no matching patterns');
    convert(textNode);
    expect(textNode.nodeValue).toBe('This text contains no matching patterns');
  });

  it('should work with empty text nodes', () => {
    const textNode = createTextNode('');
    convert(textNode);
    expect(textNode.nodeValue).toBe('');
  });

  it('should handle case insensitivity correctly', () => {
    const textNode = createTextNode('cnn, CNN, Cnn, and cNn should all be replaced');
    convert(textNode);
    expect(textNode.nodeValue).toBe(
      'Fake News CNN, Fake News CNN, Fake News CNN, and Fake News CNN should all be replaced'
    );
  });

  it('should handle very long text content', () => {
    // Create a long string with multiple replacements
    let longText =
      'This is a very long article from CNN about Hillary Clinton and the Coronavirus pandemic. ';
    longText = longText.repeat(20); // Repeat to make it longer

    const textNode = createTextNode(longText);
    convert(textNode);

    // Check that all original terms were replaced with nicknames
    expect(textNode.nodeValue).toContain('Fake News CNN');
    expect(textNode.nodeValue).toContain('Crooked Hillary');
    expect(textNode.nodeValue).toContain('China Virus');

    // Original string for comparison - we can't use direct .not.toContain because
    // 'CNN' appears in 'Fake News CNN', etc.
    const originalText =
      'This is a very long article from CNN about Hillary Clinton and the Coronavirus pandemic.';
    expect(textNode.nodeValue).not.toContain(originalText);
  });

  it('should handle partial word matches correctly', () => {
    // Test that 'coffee' in 'coffeeshop' is replaced, as the regex doesn't use word boundaries
    const textNode = createTextNode('I went to the coffeeshop this morning');
    convert(textNode);
    expect(textNode.nodeValue).toBe('I went to the covfefeshop this morning');

    // But CNN in ACNNBC should not be replaced because it uses word boundaries
    const textNode2 = createTextNode('The ACNNBC network is not real');
    convert(textNode2);
    expect(textNode2.nodeValue).toBe('The ACNNBC network is not real');
  });

  it('should handle overlapping patterns correctly', () => {
    // Create a specific case where patterns could potentially overlap
    // For example, if we had overlapping patterns like "New York" and "New York Times"
    const textNode = createTextNode('I read the New York Times today');
    convert(textNode);

    // The full "New York Times" should be replaced, not just "New York"
    expect(textNode.nodeValue).toBe('I read the Failing New York Times today');
  });
});
