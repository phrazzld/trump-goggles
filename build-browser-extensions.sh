#!/bin/bash
# Script to build Trump Goggles browser extensions for Chrome, Firefox, and Edge

echo "Building Trump Goggles browser extensions..."

# Create build directory
mkdir -p builds
rm -rf builds/chrome builds/firefox builds/edge

# Build Chrome version (Manifest V3)
echo "Building Chrome version..."
mkdir -p builds/chrome
cp content.js background.js options.html builds/chrome/
cp -r images builds/chrome/
cp manifest.json builds/chrome/
cd builds/chrome && zip -r ../trump-goggles-chrome.zip * && cd ../../

# Build Firefox version (Manifest V2)
echo "Building Firefox version..."
mkdir -p builds/firefox
cp content.js background-firefox.js options.html builds/firefox/
cp background-firefox.js builds/firefox/background.js
cp -r images builds/firefox/
cp manifest-firefox.json builds/firefox/manifest.json
cd builds/firefox && zip -r ../trump-goggles-firefox.zip * && cd ../../

# Build Edge version (Manifest V3, same as Chrome)
echo "Building Edge version..."
mkdir -p builds/edge
cp content.js background.js options.html builds/edge/
cp -r images builds/edge/
cp manifest.json builds/edge/
cd builds/edge && zip -r ../trump-goggles-edge.zip * && cd ../../

# Build Universal version with polyfill (experimental)
echo "Building Universal version with browser API polyfill..."
mkdir -p builds/universal
cp content.js background-polyfill.js options.html builds/universal/
cp background-polyfill.js builds/universal/background.js
cp -r images builds/universal/
cp manifest-universal.json builds/universal/manifest.json
cd builds/universal && zip -r ../trump-goggles-universal.zip * && cd ../../

echo "Build complete! Extension packages are in the builds directory:"
echo "- Chrome: builds/trump-goggles-chrome.zip"
echo "- Firefox: builds/trump-goggles-firefox.zip"
echo "- Edge: builds/trump-goggles-edge.zip"
echo "- Universal (experimental): builds/trump-goggles-universal.zip"