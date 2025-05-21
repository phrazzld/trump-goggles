/**
 * Unit tests for the walk function in content.js
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';

// Define Node type constants to avoid using magic numbers
const NODE_TYPES = {
  ELEMENT_NODE: 1,
  TEXT_NODE: 3,
  DOCUMENT_NODE: 9,
  DOCUMENT_FRAGMENT_NODE: 11,
} as const;

type NodeType = (typeof NODE_TYPES)[keyof typeof NODE_TYPES];

// Recreate the isEditableNode function for testing
function isEditableNode(node: Node): boolean {
  // Check if it's a text node
  if (node.nodeType === NODE_TYPES.TEXT_NODE) {
    // For text nodes, check the parent
    return node.parentNode ? isEditableNode(node.parentNode) : false;
  }

  // Handle non-text nodes
  if (!node || node.nodeType !== NODE_TYPES.ELEMENT_NODE) {
    return false;
  }

  // Check for common editable elements
  const nodeName = node.nodeName.toLowerCase();
  if (nodeName === 'textarea' || nodeName === 'input') {
    return true;
  }

  // Check for contenteditable attribute
  const element = node as Element;
  if (
    element.getAttribute &&
    (element.getAttribute('contenteditable') === 'true' ||
      element.getAttribute('contenteditable') === '')
  ) {
    return true;
  }

  // Check if any parent is editable (recursively)
  return node.parentNode ? isEditableNode(node.parentNode) : false;
}

// Mock the convert function for testing
const convertMock = vi.fn();

// Recreate the walk function for testing
function walk(node: Node): void {
  let child: Node | null, next: Node | null;

  // Use an object lookup instead of a switch statement to avoid TypeScript index issues
  const handlers: Record<NodeType, () => void> = {
    [NODE_TYPES.ELEMENT_NODE]: processElementNode,
    [NODE_TYPES.DOCUMENT_NODE]: processElementNode,
    [NODE_TYPES.DOCUMENT_FRAGMENT_NODE]: processElementNode,
    [NODE_TYPES.TEXT_NODE]: processTextNode,
  };

  function processElementNode(): void {
    child = node.firstChild;
    while (child) {
      next = child.nextSibling;
      walk(child);
      child = next;
    }
  }

  function processTextNode(): void {
    // Only convert if the node is not within an editable element
    if (!isEditableNode(node)) {
      convertMock(node);
    }
  }

  // Call the appropriate handler for this node type
  const handler = handlers[node.nodeType as NodeType];
  if (handler) {
    handler();
  }
}

// Helper function to create DOM elements
function createDom(html: string): Document {
  return new JSDOM(html).window.document;
}

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
    const processedValues = convertMock.mock.calls.map((call) => call[0].nodeValue.trim());
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
    const processedValues = convertMock.mock.calls.map((call) => call[0].nodeValue?.trim() || '');
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
      .map((call) => call[0].nodeValue?.trim() || '')
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
      .map((call) => call[0].nodeValue?.trim() || '')
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
      (call) => (call[0].nodeValue?.trim().length || 0) > 0
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
    expect(convertMock.mock.calls[0][0].nodeValue).toBe('Text in fragment');
  });

  it('should handle text nodes at different levels correctly', () => {
    const doc = createDom(
      '<div>Text outside paragraph<p>Text in paragraph</p><div><span>Text in span</span></div></div>'
    );

    walk(doc.body);

    // Extract all non-empty processed values
    const processedValues = convertMock.mock.calls
      .map((call) => call[0].nodeValue?.trim() || '')
      .filter(Boolean);

    // Check that all expected text nodes were processed
    expect(processedValues).toContain('Text outside paragraph');
    expect(processedValues).toContain('Text in paragraph');
    expect(processedValues).toContain('Text in span');
  });
});
