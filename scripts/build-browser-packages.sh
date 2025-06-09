#!/bin/bash
# Script to build browser-specific packages

# Exit on error
set -e

# Output directories
CHROME_DIR="dist/chrome"
FIREFOX_DIR="dist/firefox"

# Create output directories
mkdir -p "$CHROME_DIR"
mkdir -p "$FIREFOX_DIR"

echo "=== Building Chrome extension package ==="
# First run rollup build
pnpm run build:prod
# Copy built files for Chrome
cp -r dist/* "$CHROME_DIR"
# Remove Firefox-specific files if any
rm -f "$CHROME_DIR/background-firefox.js" "$CHROME_DIR/manifest-firefox.json"

echo "=== Building Firefox extension package ==="
# Copy built files for Firefox
cp -r dist/* "$FIREFOX_DIR"
# Use Firefox-specific manifest
cp extension/manifest-firefox.json "$FIREFOX_DIR/manifest.json"
# Update background script reference for Firefox
sed -i '' 's/background.js/background-firefox.js/g' "$FIREFOX_DIR/manifest.json"

echo "=== Creating browser-specific zip packages ==="
# Create zip archives for each browser
(cd "$CHROME_DIR" && zip -r "../chrome-package.zip" .)
(cd "$FIREFOX_DIR" && zip -r "../firefox-package.zip" .)

echo "=== Browser packages built successfully ==="
echo "Chrome package: dist/chrome-package.zip"
echo "Firefox package: dist/firefox-package.zip"