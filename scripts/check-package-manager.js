#!/usr/bin/env node

/**
 * Check all project files for npm or yarn usage and enforce pnpm
 */

import fs from 'fs';
import path from 'path';

/** @type {string[]} */
const EXCLUDED_DIRS = [
  'node_modules',
  '.git',
  'dist',
  'coverage',
  '.husky',
  '.claude', // Claude configuration files
  '.github', // GitHub workflows might have references in comments
];

/** @type {string[]} */
const EXCLUDED_FILES = [
  'pnpm-lock.yaml',
  '.npmrc',
  'check-package-manager.js',
  'enforce-pnpm.js',
  'enforce-pnpm.yml', // This file explains the replacements
];

/** @type {RegExp[]} */
const PACKAGE_MANAGER_PATTERNS = [
  /\bnpm install/g,
  /\bnpm run/g,
  /\bnpm ci/g,
  /\bnpm test/g,
  /\bnpm build/g,
  /\bnpm start/g,
  /\bnpm add/g,
  /\bnpm remove/g,
  /\byarn add/g,
  /\byarn install/g,
  /\byarn run/g,
  /\byarn test/g,
  /\byarn build/g,
  /\byarn start/g,
  /\byarn remove/g,
];

/**
 * Represents a violation of pnpm enforcement
 * @typedef {Object} Violation
 * @property {string} file - Path to the file with the violation
 * @property {string} pattern - The pattern that was matched
 * @property {string[]} matches - The matches found in the file
 * @property {string} [message] - Optional message for lockfile violations
 */

/**
 * Checks a file for package manager pattern violations
 * @param {string} filePath - Path to the file to check
 * @returns {Violation[]} Array of violations found in the file
 */
function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  /** @type {Violation[]} */
  const violations = [];

  PACKAGE_MANAGER_PATTERNS.forEach((pattern) => {
    const matches = content.match(pattern);
    if (matches) {
      violations.push({
        file: filePath,
        pattern: pattern.source,
        matches: matches,
      });
    }
  });

  return violations;
}

/**
 * Recursively walks a directory and checks files for violations
 * @param {string} dir - Directory path to walk
 * @param {Violation[]} violations - Accumulator for violations found
 * @returns {Violation[]} Array of all violations found
 */
function walkDirectory(dir, violations = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);

    let stat;
    try {
      stat = fs.statSync(filePath);
    } catch {
      // Skip files we can't stat (symlinks, permission issues, etc.)
      return;
    }

    // Skip excluded directories
    if (stat.isDirectory() && EXCLUDED_DIRS.includes(file)) {
      return;
    }

    // Skip excluded files
    if (EXCLUDED_FILES.includes(file)) {
      return;
    }

    if (stat.isDirectory()) {
      walkDirectory(filePath, violations);
    } else if (
      stat.isFile() &&
      (file.endsWith('.js') ||
        file.endsWith('.ts') ||
        file.endsWith('.json') ||
        file.endsWith('.md') ||
        file.endsWith('.yml'))
    ) {
      violations.push(...checkFile(filePath));
    }
  });

  return violations;
}

/**
 * Checks for npm or yarn lockfiles
 * @returns {Violation[]} Array of lockfile violations
 */
function checkLockfiles() {
  /** @type {Violation[]} */
  const violations = [];

  if (fs.existsSync('package-lock.json')) {
    violations.push({
      file: 'package-lock.json',
      pattern: 'npm lockfile',
      matches: ['package-lock.json'],
      message: 'Found package-lock.json. Please remove it and use pnpm-lock.yaml',
    });
  }

  if (fs.existsSync('yarn.lock')) {
    violations.push({
      file: 'yarn.lock',
      pattern: 'yarn lockfile',
      matches: ['yarn.lock'],
      message: 'Found yarn.lock. Please remove it and use pnpm-lock.yaml',
    });
  }

  return violations;
}

// Main execution
console.log('Checking for npm/yarn usage...\n');

/** @type {Violation[]} */
const violations = [...walkDirectory('.'), ...checkLockfiles()];

if (violations.length === 0) {
  console.log('✅ No npm or yarn usage found. pnpm is properly enforced!');
  process.exit(0);
} else {
  console.error('❌ Found npm or yarn usage in the following files:\n');

  violations.forEach((violation) => {
    console.error(`File: ${violation.file}`);
    if (violation.message) {
      console.error(`  ${violation.message}`);
    } else {
      console.error(`  Pattern: ${violation.pattern}`);
      console.error(`  Matches: ${violation.matches.join(', ')}`);
    }
    console.error('');
  });

  console.error('Please replace all npm/yarn commands with pnpm equivalents:');
  console.error('  npm install → pnpm install');
  console.error('  npm run → pnpm run');
  console.error('  yarn add → pnpm add');
  console.error('  yarn install → pnpm install');
  console.error('\n❌ pnpm enforcement check failed');
  process.exit(1);
}
