/**
 * Unit tests for the isEditableNode function in content.js
 */
import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import type { CreateDomFunction } from '../types/test-utils';
import { NODE_TYPES } from '../types/dom';

// Recreate the isEditableNode function for testing
function isEditableNode(node: Node | null): boolean {
  // Check if node exists
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

// Helper function to create DOM elements
const createDom: CreateDomFunction = (html: string): Document => {
  return new JSDOM(html).window.document;
};

describe('isEditableNode Function', () => {
  it('should identify input elements as editable', () => {
    const doc = createDom('<input type="text" value="test">');
    const input = doc.querySelector('input');

    expect(isEditableNode(input)).toBe(true);
  });

  it('should identify textarea elements as editable', () => {
    const doc = createDom('<textarea>test content</textarea>');
    const textarea = doc.querySelector('textarea');

    expect(isEditableNode(textarea)).toBe(true);
  });

  it('should identify contenteditable elements as editable', () => {
    const doc = createDom('<div contenteditable="true">Editable content</div>');
    const div = doc.querySelector('div');

    expect(isEditableNode(div)).toBe(true);
  });

  it('should identify elements with empty contenteditable as editable', () => {
    const doc = createDom('<div contenteditable="">Editable content</div>');
    const div = doc.querySelector('div');

    expect(isEditableNode(div)).toBe(true);
  });

  it('should identify text nodes within editable elements as editable', () => {
    const doc = createDom('<div contenteditable="true">Editable content</div>');
    const div = doc.querySelector('div');
    const textNode = div?.firstChild;

    expect(isEditableNode(textNode as Node)).toBe(true);
  });

  it('should identify nested elements within editable containers as editable', () => {
    const doc = createDom('<div contenteditable="true"><span>Nested content</span></div>');
    const span = doc.querySelector('span');

    expect(isEditableNode(span)).toBe(true);
  });

  it('should NOT identify regular div elements as editable', () => {
    const doc = createDom('<div>Regular content</div>');
    const div = doc.querySelector('div');

    expect(isEditableNode(div)).toBe(false);
  });

  it('should NOT identify contenteditable="false" as editable', () => {
    const doc = createDom('<div contenteditable="false">Non-editable content</div>');
    const div = doc.querySelector('div');

    expect(isEditableNode(div)).toBe(false);
  });

  it('should handle null nodes gracefully', () => {
    expect(isEditableNode(null)).toBe(false);
  });

  it('should handle comment nodes as non-editable', () => {
    const doc = createDom('<!-- comment -->');
    const comment = doc.createComment('test comment');

    expect(isEditableNode(comment)).toBe(false);
  });

  it('should handle document nodes as non-editable', () => {
    const doc = createDom('<div>test</div>');

    expect(isEditableNode(doc)).toBe(false);
  });

  it('should handle deeply nested editable elements', () => {
    const doc = createDom(`
      <div>
        <div>
          <div contenteditable="true">
            <span>
              <strong>Deeply nested</strong>
            </span>
          </div>
        </div>
      </div>
    `);
    const strong = doc.querySelector('strong');

    expect(isEditableNode(strong)).toBe(true);
  });
});
