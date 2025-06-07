#!/usr/bin/env node

/**
 * Pre-test validation script to ensure test independence from build artifacts
 *
 * This script scans test files for potentially problematic patterns that could
 * introduce dependencies on the dist/ directory, causing CI failures.
 *
 * Run automatically before tests via package.json script.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.dirname(__dirname);
const testDir = path.join(projectRoot, 'test');

// Patterns that indicate problematic dependencies on build artifacts
const PROBLEMATIC_PATTERNS = [
  {
    pattern: /['"`]\.\.\/dist\//g,
    description: 'Direct import from dist/ directory',
    severity: 'error',
  },
  {
    pattern: /path\.join\([^)]*['"`]dist['"`]/g,
    description: 'Path joining to dist/ directory',
    severity: 'error',
  },
  {
    pattern: /fs\.readFileSync\([^)]*dist[^)]*\)/g,
    description: 'Reading files from dist/ directory',
    severity: 'error',
  },
  {
    pattern: /require\([^)]*['"`]\.\.\/dist\//g,
    description: 'Requiring modules from dist/ directory',
    severity: 'error',
  },
  {
    pattern: /eval\(/g,
    description: 'Use of eval() - potentially loading compiled code',
    severity: 'warning',
  },
];

/**
 * Recursively find all TypeScript and JavaScript test files
 */
function findTestFiles(dir) {
  const files = [];

  function walk(currentPath) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        // Skip node_modules and other non-test directories
        if (!['node_modules', '.git', 'dist', 'coverage'].includes(entry.name)) {
          walk(fullPath);
        }
      } else if (entry.isFile()) {
        // Include TypeScript and JavaScript files
        if (/\.(ts|js)$/.test(entry.name)) {
          files.push(fullPath);
        }
      }
    }
  }

  walk(dir);
  return files;
}

/**
 * Check a single file for problematic patterns
 */
function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const issues = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNumber = i + 1;

    // Skip commented lines (both // and /* */ style)
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) {
      continue;
    }

    for (const { pattern, description, severity } of PROBLEMATIC_PATTERNS) {
      // Special handling for eval pattern to exclude $$eval
      if (pattern.source.includes('eval')) {
        if (/\beval\(/.test(line) && !/\$\$eval\(/.test(line)) {
          issues.push({
            file: path.relative(projectRoot, filePath),
            line: lineNumber,
            pattern: line.match(/eval\([^)]*\)/)?.[0] || 'eval(',
            description,
            severity,
          });
        }
      } else {
        const matches = line.match(pattern);
        if (matches) {
          for (const match of matches) {
            issues.push({
              file: path.relative(projectRoot, filePath),
              line: lineNumber,
              pattern: match.trim(),
              description,
              severity,
            });
          }
        }
      }
    }
  }

  return issues;
}

/**
 * Main validation function
 */
function validateTestIndependence() {
  console.log('🔍 Validating test independence from build artifacts...\n');

  if (!fs.existsSync(testDir)) {
    console.log('⚠️  Test directory not found, skipping validation.');
    return true;
  }

  const testFiles = findTestFiles(testDir);
  const allIssues = [];

  for (const filePath of testFiles) {
    const issues = checkFile(filePath);
    allIssues.push(...issues);
  }

  // Report results
  if (allIssues.length === 0) {
    console.log('✅ All test files are independent of build artifacts!');
    console.log(`   Scanned ${testFiles.length} test files.`);
    return true;
  }

  // Group issues by severity
  const errors = allIssues.filter((issue) => issue.severity === 'error');
  const warnings = allIssues.filter((issue) => issue.severity === 'warning');

  // Report warnings
  if (warnings.length > 0) {
    console.log('⚠️  Warnings found:');
    for (const issue of warnings) {
      console.log(`   ${issue.file}:${issue.line} - ${issue.description}`);
      console.log(`   Pattern: ${issue.pattern}`);
    }
    console.log('');
  }

  // Report errors
  if (errors.length > 0) {
    console.log('❌ Errors found that could cause CI failures:');
    for (const issue of errors) {
      console.log(`   ${issue.file}:${issue.line} - ${issue.description}`);
      console.log(`   Pattern: ${issue.pattern}`);
    }
    console.log('');
    console.log('🛠️  To fix these issues:');
    console.log('   1. Replace dist/ imports with direct TypeScript imports');
    console.log('   2. Use window globals set up in test/setup.ts');
    console.log('   3. See test/README.md for detailed guidance');
    console.log('');

    return false;
  }

  // Only warnings found
  console.log(`⚠️  Found ${warnings.length} warning(s), but no critical errors.`);
  console.log('   Consider reviewing the warnings above.');
  return true;
}

// Run validation if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const success = validateTestIndependence();
  process.exit(success ? 0 : 1);
}

export { validateTestIndependence };
