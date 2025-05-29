/**
 * DOM and JSDOM compatibility type definitions
 */

import { DOMWindow } from 'jsdom';

// JSDOM window casting helper type
export type JSDOMWindow = DOMWindow & typeof globalThis;

// Node type constants
export const NODE_TYPES = {
  ELEMENT_NODE: 1,
  TEXT_NODE: 3,
  COMMENT_NODE: 8,
  DOCUMENT_NODE: 9,
  DOCUMENT_TYPE_NODE: 10,
  DOCUMENT_FRAGMENT_NODE: 11,
} as const;

export type NodeType = (typeof NODE_TYPES)[keyof typeof NODE_TYPES];

// Helper type for elements with specific attributes
export interface EditableElement extends HTMLElement {
  contentEditable: string;
}

// Type guard for editable elements
export function isEditableElement(node: Node): node is EditableElement {
  return node.nodeType === NODE_TYPES.ELEMENT_NODE && 'contentEditable' in node;
}

// Type guard for text nodes
export function isTextNode(node: Node): node is Text {
  return node.nodeType === NODE_TYPES.TEXT_NODE;
}

// Type guard for element nodes
export function isElementNode(node: Node): node is Element {
  return node.nodeType === NODE_TYPES.ELEMENT_NODE;
}
