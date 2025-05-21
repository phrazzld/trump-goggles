#!/usr/bin/env node

/**
 * Script to enforce pnpm usage by checking npm_config_user_agent env variable
 * This is run during install to prevent usage of npm or yarn
 */

/**
 * Checks if pnpm is being used based on environment variables
 * @returns {boolean} True if pnpm is being used, false otherwise
 */
function isPnpmBeingUsed() {
  /** @type {string} */
  const userAgent = process.env.npm_config_user_agent ?? '';
  return /pnpm/i.test(userAgent);
}

// Enforce pnpm usage for all package management operations
if (!isPnpmBeingUsed()) {
  console.error('\n' + '='.repeat(50));
  console.error('ERROR: You must use pnpm for this project!');
  console.error('='.repeat(50));
  console.error('\nThis project requires pnpm for package management.');
  console.error('pnpm ensures consistent dependencies and faster installs.');
  console.error('\nTo install pnpm, run:');
  console.error('  npm install -g pnpm');
  console.error('\nThen run:');
  console.error('  pnpm install');
  console.error('\n' + '='.repeat(50) + '\n');
  process.exit(1);
}
