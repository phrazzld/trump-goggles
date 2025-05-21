/**
 * Utility functions for security-related operations
 *
 * This module provides helper functions to enhance security in the extension,
 * including protection against XSS and other common web vulnerabilities.
 *
 * @version 1.0.0
 */

'use strict';

/**
 * Escapes HTML special characters in a string to prevent XSS in contexts
 * where the string might be interpreted as HTML (e.g., some log viewers).
 *
 * @param str The string to escape
 * @returns The HTML-escaped string, or empty string if input is null/undefined
 */
export function escapeHTML(str: string | null | undefined): string {
  if (str == null) {
    return '';
  }
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Export the module
export default {
  escapeHTML,
};

// Window interface extension is defined in types.d.ts

// For browser compatibility
if (typeof window !== 'undefined') {
  window.SecurityUtils = { escapeHTML };
}
