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

// Patterns for detecting sensitive data that should be masked
// Order matters - more specific patterns should come first
const SENSITIVE_PATTERNS = [
  // Specific API Keys and tokens (order by specificity)
  { pattern: /\bsk_[a-zA-Z0-9_]{24,}\b/g, name: 'stripe_secret_key' },
  { pattern: /\bpk_[a-zA-Z0-9_]{24,}\b/g, name: 'stripe_public_key' },
  { pattern: /\bAIza[0-9A-Za-z_-]{35}\b/g, name: 'google_api_key' },
  { pattern: /\bAKIA[0-9A-Z]{16}\b/g, name: 'aws_access_key' },
  { pattern: /\bgh[pousr]_[A-Za-z0-9_]{36,255}\b/g, name: 'github_token' },

  // Additional API keys and tokens (T037 enhancement)
  { pattern: /\bxoxb-[0-9]{10,13}-[0-9]{10,13}-[a-zA-Z0-9]{24}\b/g, name: 'slack_bot_token' },
  { pattern: /\bxoxa-[0-9]-[0-9]{10,13}-[0-9]{10,13}-[a-f0-9]{64}\b/g, name: 'slack_oauth_token' },
  { pattern: /\bEAAC[a-zA-Z0-9]{50,}\b/g, name: 'facebook_access_token' },
  { pattern: /\b[0-9]{8,12}:[a-zA-Z0-9]{35,}\b/g, name: 'telegram_bot_token' },
  { pattern: /\bBearer\s+[A-Za-z0-9\-._~+/]+=*\b/gi, name: 'bearer_token' },

  // URLs with potential auth info (before email pattern)
  { pattern: /https?:\/\/[^:\/\s]+:[^@\/\s]+@[^\s]+/g, name: 'url_with_auth' },

  // Full User Agent strings (T037 requirement)
  {
    pattern: /Mozilla\/\d+\.\d+\s*\([^)]*\)\s*[^"'\n\r]*(?:Safari|Chrome|Firefox|Edge)[^"'\n\r]*/g,
    name: 'user_agent_string',
  },
  { pattern: /User-Agent\s*:\s*[^"\n\r]+/gi, name: 'user_agent_header' },

  // Sensitive DOM attributes (T037 requirement)
  {
    pattern:
      /(?:data-[a-z-]*(?:token|key|secret|pass|auth)[a-z-]*|x-[a-z-]*(?:token|key|secret|pass|auth)[a-z-]*)\s*=\s*["'][^"']*["']/gi,
    name: 'sensitive_dom_attr',
  },
  {
    pattern: /(?:authorization|x-api-key|x-auth-token|x-csrf-token)\s*:\s*["']?[^"'\s]+["']?/gi,
    name: 'sensitive_header',
  },

  // Credit card numbers (basic pattern)
  { pattern: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, name: 'credit_card' },

  // Social Security Numbers (US format)
  { pattern: /\b\d{3}-\d{2}-\d{4}\b/g, name: 'ssn' },

  // Private keys and certificates
  {
    pattern:
      /-----BEGIN\s+(?:RSA\s+)?PRIVATE\s+KEY-----[\s\S]*?-----END\s+(?:RSA\s+)?PRIVATE\s+KEY-----/gi,
    name: 'private_key',
  },
  {
    pattern: /-----BEGIN\s+CERTIFICATE-----[\s\S]*?-----END\s+CERTIFICATE-----/gi,
    name: 'certificate',
  },

  // Database connection strings
  {
    pattern: /(?:mongodb|mysql|postgresql|redis):\/\/[^:\s]+:[^@\s]+@[^\s]+/gi,
    name: 'db_connection_string',
  },

  // Email addresses (partial masking)
  { pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, name: 'email' },

  // Generic API keys (before field patterns to catch long tokens)
  { pattern: /\b[A-Za-z0-9]{32,}\b/g, name: 'potential_api_key' },

  // Passwords and secrets (field patterns - exclude specific token formats and masked values)
  {
    pattern: /password\s*[:=]\s*["']?(?!sk_|pk_|AIza|AKIA|gh[pousr]_|\[MASKED_)[^"'\s]+["']?/gi,
    name: 'password_field',
  },
  {
    pattern: /secret\s*[:=]\s*["']?(?!sk_|pk_|AIza|AKIA|gh[pousr]_|\[MASKED_)[^"'\s]+["']?/gi,
    name: 'secret_field',
  },
  {
    pattern: /token\s*[:=]\s*["']?(?!sk_|pk_|AIza|AKIA|gh[pousr]_|\[MASKED_)[^"'\s]+["']?/gi,
    name: 'token_field',
  },
];

// Known sensitive field names that should always be masked
const SENSITIVE_FIELD_NAMES = new Set([
  'password',
  'pwd',
  'pass',
  'secret',
  'token',
  'key',
  'auth',
  'authorization',
  'cookie',
  'session',
  'csrf',
  'api_key',
  'apikey',
  'access_token',
  'refresh_token',
  'private_key',
  'public_key',
  'signature',
  'hash',
  'salt',
  'nonce',
  'credit_card',
  'cc',
  'ssn',
  'social_security',
  'phone',
  'email',
  // T037 enhancements
  'user_agent',
  'useragent',
  'user-agent',
  'bearer_token',
  'bearer-token',
  'x-api-key',
  'x-auth-token',
  'x-csrf-token',
  'client_secret',
  'client-secret',
  'connection_string',
  'database_url',
  'db_url',
  'mongodb_uri',
  'redis_url',
  'certificate',
  'cert',
  'private_cert',
  'public_cert',
  'ssl_cert',
  'slack_token',
  'facebook_token',
  'telegram_token',
  'oauth_token',
  'oauth-token',
]);

/**
 * Maximum depth for object traversal to prevent infinite recursion
 */
const MAX_SANITIZATION_DEPTH = 10;

/**
 * Maximum string length before truncation
 */
const MAX_STRING_LENGTH = 10000;

/**
 * Checks if a string contains sensitive patterns and masks them
 */
function sanitizeString(value: string): string {
  if (typeof value !== 'string') {
    return value;
  }

  // Truncate overly long strings
  let sanitized =
    value.length > MAX_STRING_LENGTH
      ? value.substring(0, MAX_STRING_LENGTH) + '...[TRUNCATED]'
      : value;

  // Apply HTML escaping
  sanitized = escapeHTML(sanitized);

  // Check for and mask sensitive patterns
  for (const { pattern, name } of SENSITIVE_PATTERNS) {
    sanitized = sanitized.replace(pattern, (_match) => `[MASKED_${name.toUpperCase()}]`);
  }

  return sanitized;
}

/**
 * Recursively sanitizes an object, handling circular references and depth limits
 */
function sanitizeObject(
  obj: unknown,
  depth: number = 0,
  seen: WeakSet<object> = new WeakSet()
): unknown {
  // Prevent infinite recursion
  if (depth > MAX_SANITIZATION_DEPTH) {
    return '[MAX_DEPTH_EXCEEDED]';
  }

  // Handle null and undefined
  if (obj == null) {
    return obj;
  }

  // Handle primitive types
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }

  if (typeof obj === 'number' || typeof obj === 'boolean') {
    return obj;
  }

  // Handle functions (convert to string representation)
  if (typeof obj === 'function') {
    return '[FUNCTION]';
  }

  // Handle dates
  if (obj instanceof Date) {
    return obj.toISOString();
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    // Check for circular reference
    if (seen.has(obj)) {
      return '[CIRCULAR_REFERENCE]';
    }
    seen.add(obj);

    const sanitized = obj.map((item) => sanitizeObject(item, depth + 1, seen));
    seen.delete(obj);
    return sanitized;
  }

  // Handle objects
  if (typeof obj === 'object') {
    // Check for circular reference
    if (seen.has(obj)) {
      return '[CIRCULAR_REFERENCE]';
    }
    seen.add(obj);

    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
      const lowerKey = key.toLowerCase();

      // Check if field name indicates sensitive data
      if (SENSITIVE_FIELD_NAMES.has(lowerKey)) {
        sanitized[key] = '[MASKED_SENSITIVE_FIELD]';
      } else {
        sanitized[key] = sanitizeObject(value, depth + 1, seen);
      }
    }

    seen.delete(obj);
    return sanitized;
  }

  // For any other type, convert to string and sanitize
  return sanitizeString(String(obj));
}

/**
 * Sanitizes data for logging to prevent exposure of sensitive information
 * and XSS vulnerabilities in log outputs.
 *
 * This function performs the following sanitization:
 * - HTML escapes strings to prevent XSS in log viewers
 * - Detects and masks sensitive patterns (API keys, passwords, etc.)
 * - Handles deep object sanitization with circular reference protection
 * - Truncates overly long strings
 * - Masks sensitive field names
 *
 * @param data The data to sanitize (can be any type)
 * @returns Sanitized version of the data safe for logging
 */
export function sanitizeForLogging(data: unknown): unknown {
  try {
    return sanitizeObject(data);
  } catch (error) {
    // If sanitization fails, return a safe fallback
    return '[SANITIZATION_ERROR]';
  }
}

// Export the module
export default {
  escapeHTML,
  sanitizeForLogging,
};

// Window interface extension is defined in types.d.ts

// For browser compatibility
if (typeof window !== 'undefined') {
  window.SecurityUtils = { escapeHTML, sanitizeForLogging };
}
