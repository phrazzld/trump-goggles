#!/usr/bin/env node

// Enforce pnpm usage for all package management operations
if (!/pnpm/i.test(process.env.npm_config_user_agent ?? '')) {
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
