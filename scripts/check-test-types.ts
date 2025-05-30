#!/usr/bin/env node

/**
 * This script runs TypeScript checks specifically on test files
 * using the test-specific TypeScript configuration.
 */

import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

// Use current directory in TypeScript context
const __dirname = path.resolve(path.dirname(''));

// Parse command line args
const args = process.argv.slice(2);
const VERBOSE = args.includes('--verbose') || args.includes('-v');

// Configuration
const TEST_TSCONFIG = path.resolve(__dirname, '../tsconfig.test.json');
const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

// Verify tsconfig.test.json exists
if (!fs.existsSync(TEST_TSCONFIG)) {
  console.error(`${COLORS.red}${COLORS.bright}Error: ${TEST_TSCONFIG} not found!${COLORS.reset}`);
  process.exit(1);
}

// Heading
console.log(
  `\n${COLORS.blue}${COLORS.bright}==========================================${COLORS.reset}`
);
console.log(
  `${COLORS.blue}${COLORS.bright}  Running TypeScript Check on Test Files  ${COLORS.reset}`
);
console.log(
  `${COLORS.blue}${COLORS.bright}==========================================${COLORS.reset}\n`
);

// Run TypeScript compiler in check mode
const tsc = spawn('npx', ['tsc', '--project', TEST_TSCONFIG, '--noEmit']);

// Collect output to summarize
let output = '';
let errorCount = 0;

// Handle output
tsc.stdout.on('data', (data) => {
  const dataStr = data.toString();
  output += dataStr;

  // Count errors
  const matches = dataStr.match(/error TS\d+/g);
  if (matches) {
    errorCount += matches.length;
  }

  // Print output in verbose mode
  if (VERBOSE) {
    process.stdout.write(dataStr);
  }
});

tsc.stderr.on('data', (data) => {
  const dataStr = data.toString();
  output += dataStr;
  // Always print stderr
  process.stderr.write(`${COLORS.red}${dataStr}${COLORS.reset}`);
});

// Handle process completion
tsc.on('close', (code) => {
  if (code === 0) {
    console.log(
      `\n${COLORS.green}${COLORS.bright}TypeScript check on test files passed successfully!${COLORS.reset}\n`
    );
  } else {
    // Find the most common error types
    const errorTypes: Record<string, number> = {};
    const errorTypeMatches = output.match(/error TS\d+/g) || [];
    errorTypeMatches.forEach((error) => {
      errorTypes[error] = (errorTypes[error] || 0) + 1;
    });

    // Sort by count
    const sortedErrorTypes = Object.entries(errorTypes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Get file count
    const fileCount = new Set(
      (output.match(/[^(]+\(\d+,\d+\)/g) || []).map((match) => match.split('(')[0].trim())
    ).size;

    // Get error descriptions
    const errorDescriptions: Record<string, string> = {};
    const errorDescRegex = /error TS(\d+): ([^\n]+)/g;
    let match: RegExpExecArray | null;
    while ((match = errorDescRegex.exec(output)) !== null) {
      const [, code, desc] = match;
      errorDescriptions[`error TS${code}`] = desc;
    }

    // Show summary
    console.error(
      `\n${COLORS.red}${COLORS.bright}TypeScript check on test files failed${COLORS.reset}\n`
    );
    console.log(`${COLORS.yellow}${COLORS.bright}Summary:${COLORS.reset}`);
    console.log(`${COLORS.yellow}- Total errors: ${errorCount}${COLORS.reset}`);
    console.log(`${COLORS.yellow}- Files with errors: ${fileCount}${COLORS.reset}`);
    console.log(`${COLORS.yellow}- Most common error types:${COLORS.reset}`);

    sortedErrorTypes.forEach(([errorType, count]) => {
      const description = errorDescriptions[errorType] || '';
      console.log(`${COLORS.yellow}  * ${errorType}: ${count} occurrences${COLORS.reset}`);
      if (description) {
        console.log(`${COLORS.dim}    ${description}${COLORS.reset}`);
      }
    });

    console.log(
      `\n${COLORS.yellow}Note: These errors are expected until we fix all test files.${COLORS.reset}`
    );
    console.log(`${COLORS.yellow}This is a work in progress as part of Task T051.${COLORS.reset}`);
    console.log(
      `${COLORS.yellow}Run with --verbose flag to see all errors in detail.${COLORS.reset}\n`
    );
  }
});
