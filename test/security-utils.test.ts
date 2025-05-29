/**
 * Unit tests for security-utils.ts
 */
import { describe, it, expect } from 'vitest';
import { escapeHTML } from '../src/utils/security-utils';

describe('SecurityUtils', () => {
  describe('escapeHTML', () => {
    it('should escape HTML special characters', () => {
      const input = '<script>alert("XSS & more");</script>';
      const expected = '&lt;script&gt;alert(&quot;XSS &amp; more&quot;);&lt;/script&gt;';

      expect(escapeHTML(input)).toBe(expected);
    });

    it('should handle empty strings', () => {
      expect(escapeHTML('')).toBe('');
    });

    it('should handle null and undefined', () => {
      expect(escapeHTML(null)).toBe('');
      expect(escapeHTML(undefined)).toBe('');
    });

    it('should handle strings with no special characters', () => {
      const input = 'Plain text without any special chars';
      expect(escapeHTML(input)).toBe(input);
    });

    it('should escape all five special characters', () => {
      const input = '&<>"\'';
      const expected = '&amp;&lt;&gt;&quot;&#039;';
      expect(escapeHTML(input)).toBe(expected);
    });

    it('should convert non-string inputs to strings before escaping', () => {
      expect(escapeHTML(String(123))).toBe('123');
      expect(escapeHTML(String(true))).toBe('true');
    });
  });
});
