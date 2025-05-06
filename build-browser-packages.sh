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
# Copy all files for Chrome
cp -r *.js *.html *.json images "$CHROME_DIR"
# Remove Firefox-specific files
rm -f "$CHROME_DIR/background-firefox.js" "$CHROME_DIR/manifest-firefox.json"
# Ensure the correct manifest is used
mv "$CHROME_DIR/manifest.json" "$CHROME_DIR/manifest.json.bak"
jq '.background.service_worker = "background-cross-browser.js"' "$CHROME_DIR/manifest.json.bak" > "$CHROME_DIR/manifest.json"
rm "$CHROME_DIR/manifest.json.bak"

echo "=== Building Firefox extension package ==="
# Copy all files for Firefox
cp -r *.js *.html *.json images "$FIREFOX_DIR"
# Remove Chrome-specific files
rm -f "$FIREFOX_DIR/background.js"
# Ensure the correct manifest is used
cp "$FIREFOX_DIR/manifest-firefox.json" "$FIREFOX_DIR/manifest.json"
rm "$FIREFOX_DIR/manifest-firefox.json"

echo "=== Creating browser-specific zip packages ==="
# Create zip archives for each browser
(cd "$CHROME_DIR" && zip -r "../chrome-package.zip" .)
(cd "$FIREFOX_DIR" && zip -r "../firefox-package.zip" .)

echo "=== Browser packages built successfully ==="
echo "Chrome package: dist/chrome-package.zip"
echo "Firefox package: dist/firefox-package.zip"