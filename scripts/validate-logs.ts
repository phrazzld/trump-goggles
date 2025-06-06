#!/usr/bin/env tsx
/**
 * Log Structure Validation Script
 *
 * Validates that extracted structured logs conform to the expected JSON schema.
 * Used by CI pipeline to ensure proper structured log format compliance.
 *
 * Usage: npx tsx scripts/validate-logs.ts <log-file-path>
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

interface LogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  service_name: string;
  correlation_id: string;
  function_name: string;
  component: string;
  context?: Record<string, unknown>;
  error_details?: {
    type: string;
    message: string;
    stack?: string;
  };
}

/**
 * Validates that a string is a valid ISO timestamp
 */
function isValidTimestamp(timestamp: string): boolean {
  const date = new Date(timestamp);
  return !isNaN(date.getTime()) && timestamp.includes('T') && timestamp.includes('Z');
}

/**
 * Validates that a string is a valid UUID v4 correlation ID
 */
function isValidCorrelationId(correlationId: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(correlationId);
}

/**
 * Validates that a log level is one of the expected values
 */
function isValidLogLevel(level: string): level is LogEntry['level'] {
  return ['debug', 'info', 'warn', 'error'].includes(level);
}

/**
 * Validates a single log entry structure
 */
function validateLogEntry(entry: any, lineNumber: number): string[] {
  const errors: string[] = [];

  // Required fields validation
  const requiredFields = [
    'timestamp',
    'level',
    'message',
    'service_name',
    'correlation_id',
    'function_name',
    'component',
  ];

  for (const field of requiredFields) {
    if (!(field in entry)) {
      errors.push(`Line ${lineNumber}: Missing required field '${field}'`);
    } else if (typeof entry[field] !== 'string') {
      errors.push(
        `Line ${lineNumber}: Field '${field}' must be a string, got ${typeof entry[field]}`
      );
    } else if (entry[field].trim() === '') {
      errors.push(`Line ${lineNumber}: Field '${field}' cannot be empty`);
    }
  }

  // Specific field validation
  if (entry.timestamp && !isValidTimestamp(entry.timestamp)) {
    errors.push(`Line ${lineNumber}: Invalid timestamp format '${entry.timestamp}'`);
  }

  if (entry.level && !isValidLogLevel(entry.level)) {
    errors.push(`Line ${lineNumber}: Invalid log level '${entry.level}'`);
  }

  if (entry.correlation_id && !isValidCorrelationId(entry.correlation_id)) {
    errors.push(`Line ${lineNumber}: Invalid correlation ID format '${entry.correlation_id}'`);
  }

  if (entry.service_name && entry.service_name !== 'trump-goggles') {
    errors.push(
      `Line ${lineNumber}: Service name must be 'trump-goggles', got '${entry.service_name}'`
    );
  }

  // Context validation (optional but must be object if present)
  if ('context' in entry && entry.context !== null) {
    if (typeof entry.context !== 'object' || Array.isArray(entry.context)) {
      errors.push(`Line ${lineNumber}: Context must be an object, got ${typeof entry.context}`);
    } else {
      // Validate required context fields
      const requiredContextFields = ['service_name', 'version', 'environment'];
      for (const field of requiredContextFields) {
        if (!(field in entry.context)) {
          errors.push(`Line ${lineNumber}: Missing required context field '${field}'`);
        }
      }
    }
  }

  // Error details validation (optional but must be properly structured if present)
  if ('error_details' in entry && entry.error_details !== null) {
    if (typeof entry.error_details !== 'object' || Array.isArray(entry.error_details)) {
      errors.push(
        `Line ${lineNumber}: error_details must be an object, got ${typeof entry.error_details}`
      );
    } else {
      const requiredErrorFields = ['type', 'message'];
      for (const field of requiredErrorFields) {
        if (!(field in entry.error_details)) {
          errors.push(`Line ${lineNumber}: Missing required error_details field '${field}'`);
        }
      }
    }
  }

  return errors;
}

/**
 * Main validation function
 */
function validateLogs(logFilePath: string): void {
  try {
    const fullPath = resolve(logFilePath);
    const content = readFileSync(fullPath, 'utf-8');
    const lines = content
      .trim()
      .split('\n')
      .filter((line) => line.trim() !== '');

    if (lines.length === 0) {
      console.error('❌ No log entries found in file');
      process.exit(1);
    }

    console.log(`📋 Validating ${lines.length} log entries...`);

    const allErrors: string[] = [];
    let validEntries = 0;
    const correlationIds = new Set<string>();

    for (let i = 0; i < lines.length; i++) {
      const lineNumber = i + 1;
      const line = lines[i].trim();

      // Parse JSON
      let entry: any;
      try {
        entry = JSON.parse(line);
      } catch (error) {
        allErrors.push(
          `Line ${lineNumber}: Invalid JSON - ${error instanceof Error ? error.message : 'Unknown error'}`
        );
        continue;
      }

      // Validate structure
      const errors = validateLogEntry(entry, lineNumber);
      allErrors.push(...errors);

      if (errors.length === 0) {
        validEntries++;
        correlationIds.add(entry.correlation_id);
      }
    }

    // Summary
    console.log(`✅ ${validEntries}/${lines.length} log entries are valid`);
    console.log(`🔗 Found ${correlationIds.size} unique correlation ID(s)`);

    if (allErrors.length > 0) {
      console.error(`\n❌ Found ${allErrors.length} validation errors:`);
      for (const error of allErrors.slice(0, 20)) {
        // Limit to first 20 errors
        console.error(`   ${error}`);
      }
      if (allErrors.length > 20) {
        console.error(`   ... and ${allErrors.length - 20} more errors`);
      }
      process.exit(1);
    }

    // Additional checks
    if (correlationIds.size > 1) {
      console.warn(`⚠️  Multiple correlation IDs found - this may indicate separate test runs`);
    }

    console.log(`\n🎉 All log entries passed validation!`);
    console.log(`📊 Validation Summary:`);
    console.log(`   - Total entries: ${lines.length}`);
    console.log(`   - Valid entries: ${validEntries}`);
    console.log(`   - Correlation IDs: ${correlationIds.size}`);
  } catch (error) {
    console.error(
      `❌ Failed to read log file: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    process.exit(1);
  }
}

// CLI entry point
function main() {
  const args = process.argv.slice(2);

  if (args.length !== 1) {
    console.error('Usage: npx tsx scripts/validate-logs.ts <log-file-path>');
    console.error('');
    console.error('Example:');
    console.error('  npx tsx scripts/validate-logs.ts /tmp/extracted-logs.txt');
    process.exit(1);
  }

  const logFilePath = args[0];
  console.log(`🔍 Validating structured logs from: ${logFilePath}`);

  validateLogs(logFilePath);
}

// Run if called directly (ES module compatible)
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { validateLogs, validateLogEntry };
