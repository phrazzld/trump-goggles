/**
 * Unit tests for the walk function in content.js
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';
import type { CreateDomFunction } from '../types/test-utils';
import { NODE_TYPES } from '../types/dom';

// Recreate the isEditableNode function for testing
function isEditableNode(node: Node | null): boolean {
  if (!node) {
    return false;
  }

  // Check if it's a text node
  if (node.nodeType === NODE_TYPES.TEXT_NODE) {
    // For text nodes, check the parent
    return isEditableNode(node.parentNode);
  }

  // Handle non-text nodes
  if (node.nodeType !== NODE_TYPES.ELEMENT_NODE) {
    return false;
  }

  // Cast to Element for element-specific operations
  const element = node as Element;

  // Check for common editable elements
  const nodeName = element.nodeName.toLowerCase();
  if (nodeName === 'textarea' || nodeName === 'input') {
    return true;
  }

  // Check for contenteditable attribute
  if (
    element.getAttribute &&
    (element.getAttribute('contenteditable') === 'true' ||
      element.getAttribute('contenteditable') === '')
  ) {
    return true;
  }

  // Check if any parent is editable (recursively)
  return element.parentNode ? isEditableNode(element.parentNode) : false;
}

// Mock the convert function for testing
const convertMock = vi.fn((_node: Node) => void 0);

// Recreate the walk function for testing
function walk(node: Node): void {
  let child: Node | null;
  let next: Node | null;

  switch (node.nodeType) {
    case NODE_TYPES.ELEMENT_NODE: // Element
    case NODE_TYPES.DOCUMENT_NODE: // Document
    case NODE_TYPES.DOCUMENT_FRAGMENT_NODE: // Document fragment
      child = node.firstChild;
      while (child) {
        next = child.nextSibling;
        walk(child);
        child = next;
      }
      break;
    case NODE_TYPES.TEXT_NODE: // Text node
      // Only convert if the node is not within an editable element
      if (!isEditableNode(node)) {
        convertMock(node);
      }
      break;
  }
}

// Helper function to create DOM elements
const createDom: CreateDomFunction = (html: string): Document => {
  return new JSDOM(html).window.document;
};

describe('walk Function', () => {
  beforeEach(() => {
    // Reset the mock before each test
    convertMock.mockReset();
  });

  it('should traverse all nodes in a simple document', () => {
    const doc = createDom(`
      <div>
        <p>First paragraph</p>
        <p>Second paragraph</p>
      </div>
    `);

    walk(doc.body);

    // In JSDOM, whitespace between tags is also considered text nodes
    // So we'll check if the mock was called at least twice
    expect(convertMock).toHaveBeenCalled();

    // Verify that the paragraph text nodes were processed
    const processedValues = convertMock.mock.calls
      .map((call) => (call[0] as Text).nodeValue?.trim() || '')
      .filter(Boolean);
    expect(processedValues).toContain('First paragraph');
    expect(processedValues).toContain('Second paragraph');
  });

  it('should process nested nodes correctly', () => {
    const doc = createDom(`
      <div>
        <p>Outer paragraph <span>with a span</span> inside it</p>
      </div>
    `);

    walk(doc.body);

    // Check for the expected text content
    const processedValues = convertMock.mock.calls
      .map((call) => (call[0] as Text).nodeValue?.trim() || '')
      .filter(Boolean);
    expect(processedValues).toContain('Outer paragraph');
    expect(processedValues).toContain('with a span');
    expect(processedValues).toContain('inside it');
  });

  it('should skip text nodes in editable elements', () => {
    const doc = createDom(
      '<div><p>Regular paragraph</p><textarea>Text in textarea</textarea><div contenteditable="true">Editable div</div><input type="text" value="Input value"></div>'
    );

    walk(doc.body);

    // Check that at least the regular paragraph was processed
    const processedValues = convertMock.mock.calls
      .map((call) => (call[0] as Text).nodeValue?.trim() || '')
      .filter(Boolean);
    expect(processedValues).toContain('Regular paragraph');

    // Check that none of the editable content was processed
    const editableContent = ['Text in textarea', 'Editable div', 'Input value'];
    for (const content of editableContent) {
      const wasProcessed = processedValues.some((val) => val.includes(content));
      expect(wasProcessed).toBe(false);
    }
  });

  it('should handle complex DOM structures with mixed editable and non-editable elements', () => {
    const doc = createDom(
      '<div><p>First paragraph</p><div contenteditable="true"><p>This is editable</p><span>Also editable</span></div><p>Second paragraph</p><input type="text" value="Input value"><p>Third paragraph</p></div>'
    );

    walk(doc.body);

    // Extract the processed values, filtering out empty strings and whitespace
    const processedValues = convertMock.mock.calls
      .map((call) => (call[0] as Text).nodeValue?.trim() || '')
      .filter(Boolean);

    // Check that non-editable content was processed
    expect(processedValues).toContain('First paragraph');
    expect(processedValues).toContain('Second paragraph');
    expect(processedValues).toContain('Third paragraph');

    // Check that editable content wasn't processed
    const editableContent = ['This is editable', 'Also editable', 'Input value'];
    for (const content of editableContent) {
      const wasProcessed = processedValues.some((val) => val.includes(content));
      expect(wasProcessed).toBe(false);
    }
  });

  it('should handle empty elements correctly', () => {
    // Create a document with empty elements but no text nodes
    const doc = createDom('<div><p></p><span></span><div></div></div>');

    // Reset the mock to ensure we start clean
    convertMock.mockReset();

    walk(doc.body);

    // Check if any of the calls processed a non-whitespace text node
    const nonWhitespaceNodes = convertMock.mock.calls.filter(
      (call) => ((call[0] as Text).nodeValue?.trim() || '').length > 0
    );

    expect(nonWhitespaceNodes.length).toBe(0);
  });

  it('should handle document fragments', () => {
    const doc = createDom('');
    const fragment = doc.createDocumentFragment();
    const p = doc.createElement('p');
    p.textContent = 'Text in fragment';
    fragment.appendChild(p);

    walk(fragment);

    // Should process the text node in the fragment
    expect(convertMock).toHaveBeenCalledTimes(1);
    expect((convertMock.mock.calls[0][0] as Text).nodeValue).toBe('Text in fragment');
  });

  it('should handle text nodes at different levels correctly', () => {
    const doc = createDom(
      '<div>Text outside paragraph<p>Text in paragraph</p><div><span>Text in span</span></div></div>'
    );

    walk(doc.body);

    // Extract all non-empty processed values
    const processedValues = convertMock.mock.calls
      .map((call) => (call[0] as Text).nodeValue?.trim() || '')
      .filter(Boolean);

    // Check that all expected text nodes were processed
    expect(processedValues).toContain('Text outside paragraph');
    expect(processedValues).toContain('Text in paragraph');
    expect(processedValues).toContain('Text in span');
  });
});
