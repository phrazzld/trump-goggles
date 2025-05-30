#!/usr/bin/env node
/**
 * Quick Chrome Store Package Builder (Development Mode)
 *
 * Skips tests and linting for faster iteration during development.
 * Use this for quick testing, but always use the full package:chrome script for actual submissions.
 */

const { execSync } = require('child_process');

console.log('⚡ Quick Chrome Store package (dev mode)...\n');

try {
  console.log('🧹 Cleaning...');
  execSync('pnpm run build:clean', { stdio: 'inherit' });

  console.log('🏗️  Building...');
  execSync('NODE_ENV=production pnpm run build', { stdio: 'inherit' });

  console.log('📦 Packaging...');
  execSync('node scripts/package-chrome-store.js', { stdio: 'inherit' });

  console.log('\n✨ Quick package complete!');
  console.log('⚠️  Remember to run "pnpm run package:chrome" for production submissions');
} catch (error) {
  console.error('❌ Quick package failed:', error.message);
  process.exit(1);
}
