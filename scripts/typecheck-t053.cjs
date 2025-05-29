#!/usr/bin/env node

/**
 * Type check script for T053 files only
 */

const { execSync } = require('child_process');
const path = require('path');

const files = [
  'test/mocks/extension-api.mock.ts',
  'test/mocks/browser-adapter.mock.ts',
  'test/browser/tooltip-browser-adapter.test.ts',
  'test/content/dom-modifier.test.ts',
  'test/content/dom-processor.test.ts',
];

console.log('Checking TypeScript for T053 files...\n');

try {
  // Create a temporary tsconfig that excludes node_modules issues
  const tmpConfig = {
    extends: './tsconfig.test.json',
    compilerOptions: {
      skipLibCheck: true,
      types: [], // Don't include global types that cause conflicts
    },
    include: files,
    exclude: ['node_modules'],
  };

  require('fs').writeFileSync('tsconfig.t053.json', JSON.stringify(tmpConfig, null, 2));

  const result = execSync('npx tsc --project tsconfig.t053.json --noEmit', {
    cwd: path.resolve(__dirname, '..'),
    encoding: 'utf8',
  });

  console.log('✅ All T053 files pass TypeScript checks!');
} catch (error) {
  console.error('❌ TypeScript errors found:');
  console.error(error.stdout || error.message);
  process.exit(1);
} finally {
  // Clean up temp file
  try {
    require('fs').unlinkSync('tsconfig.t053.json');
  } catch (e) {
    // Ignore cleanup errors
  }
}
