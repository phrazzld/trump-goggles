# Trump Goggles: Page Crash Fix

## Problem

The extension was causing page crashes after text replacement. Investigation revealed several issues:

1. **Multiple Content Scripts Running Simultaneously**: Both `content.js` and `content-fixed.js` were being loaded and executed, despite only `content-shared.js` and `content.js` being listed in `manifest.json`
2. **Multiple MutationObservers**: Each script created its own MutationObserver, causing competing DOM manipulation
3. **Mutation Loops**: The observers were reacting to each other's DOM changes
4. **Separate Node Tracking**: Each script maintained its own cache of processed nodes

## Solution

We implemented a comprehensive solution to prevent page crashes:

### 1. Global Initialization Flag

Added a global flag (`window.trumpGogglesInitialized`) in `content-shared.js` to ensure only one script initializes:

```javascript
// Global flag to prevent multiple scripts from initializing simultaneously
window.trumpGogglesInitialized = window.trumpGogglesInitialized || false;
```

Both content scripts now check this flag before initializing:

```javascript
if (typeof window.buildTrumpMap !== 'function') {
  // Error handling...
} else if (!window.trumpGogglesInitialized) {
  // Only execute initialization if not already initialized
  window.trumpGogglesInitialized = true;
  // Initialize...
} else {
  console.log('Trump Goggles: Already initialized by another script');
}
```

### 2. Shared MutationObserver

Created a single shared MutationObserver via the `window` object:

```javascript
// Global observer for the MutationObserver
window.trumpObserver = window.trumpObserver || null;
```

Both scripts now use this same observer instance, preventing conflicts.

### 3. Shared Node Tracking

Implemented shared node tracking between scripts using a global WeakSet:

```javascript
// Use a shared global cache of processed nodes
window.trumpProcessedNodes = window.trumpProcessedNodes || new WeakSet();
```

This ensures a node processed by one script won't be reprocessed by another.

### 4. Proper Observer Lifecycle Management

Improved how DOM changes are handled:

```javascript
// Update DOM only once after all replacements are done, and only if text changed
if (replacedText !== originalText) {
  // Disconnect observer before making changes to avoid infinite loop
  if (window.trumpObserver) {
    window.trumpObserver.disconnect();
  }
  
  textNode.nodeValue = replacedText;
  // Mark this node as processed
  textNode._trumpGogglesProcessed = true;
  
  // Reconnect observer after changes
  if (window.trumpObserver) {
    window.trumpObserver.observe(document.body, observerConfig);
  }
}
```

This prevents mutation loops where observers react to their own changes.

### 5. Optimized Text Replacement

Added pattern optimization to avoid unnecessary processing:

```javascript
// Optimization: Skip patterns unlikely to match
const pattern = trumpMap[key].regex.source.split('|')[0].replace(/[\\()]/g, '');
if (pattern.length > 3 && !replacedText.includes(pattern.replace(/\\b/g, ''))) {
  return;
}
```

## Benefits

These changes provide several important benefits:

1. **Prevent Duplicate Processing**: Only one instance of the extension runs at a time
2. **Avoid Infinite Loops**: Proper observer management prevents mutation loops
3. **Maintain Extension Functionality**: Text replacement works correctly without crashing
4. **Better Performance**: Optimized text replacement and shared caching reduce CPU usage
5. **Robust Architecture**: Extension now works correctly regardless of which scripts load

## Future Improvements

For future versions, consider:

1. Consolidating `content.js` and `content-fixed.js` into a single file
2. Adding a more robust extension lifecycle management system
3. Implementing a configuration system for better debugging