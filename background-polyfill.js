/**
 * Polyfill for browser API compatibility (Chrome/Firefox, MV2/MV3)
 * This allows the extension to work in both Chrome and Firefox with a single codebase
 */

/**
 * Determine the correct browser API namespace ('chrome' or 'browser').
 * This variable holds the API root object for consistent cross-browser access.
 *
 * The @ts-ignore is necessary because:
 * 1. In Firefox, the global 'browser' object exists but isn't recognized by TypeScript
 * 2. We need to check for its existence at runtime rather than compile time
 * 3. TypeScript's type definitions don't account for browser-specific globals
 * 4. This polyfill pattern is a common browser extension cross-compatibility technique
 * 5. The WebExtension API type definitions are incomplete for this use case
 */
// @ts-ignore - 'browser' is defined in Firefox, 'chrome' in Chrome environments, but TypeScript only knows about 'chrome'
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

/**
 * Opens the extension's options page.
 * The event handler expects a tab parameter but we don't use it.
 */
function openOptionsOnClick() {
  if (browserAPI && browserAPI.runtime && browserAPI.runtime.openOptionsPage) {
    browserAPI.runtime.openOptionsPage();
  } else {
    console.error(
      'Trump Goggles: Cannot open options page - browserAPI.runtime.openOptionsPage not found.'
    );
  }
}

/**
 * Attach the click listener using the appropriate API via the polyfill.
 * The following @ts-ignore directives are necessary because:
 * 1. TypeScript cannot properly type the dynamic browserAPI variable across browser contexts
 * 2. The browserAPI object differs between Chrome (Manifest V3) and Firefox (Manifest V2)
 * 3. Chrome uses 'action' (MV3) while Firefox uses 'browserAction' (MV2)
 * 4. TypeScript's static analysis can't account for these runtime browser differences
 * 5. The polyfill pattern is required for cross-browser extension compatibility
 */
// @ts-ignore - TypeScript cannot infer the correct object structure for the dynamically determined browserAPI
if (browserAPI && browserAPI.action && browserAPI.action.onClicked) {
  // Manifest V3 API (chrome.action)
  // @ts-ignore - TypeScript cannot verify that browserAPI.action.onClicked matches the expected listener type
  browserAPI.action.onClicked.addListener(openOptionsOnClick);
} else if (browserAPI && browserAPI.browserAction && browserAPI.browserAction.onClicked) {
  // Manifest V2 API (browser.browserAction or chrome.browserAction)
  browserAPI.browserAction.onClicked.addListener(openOptionsOnClick);
} else {
  console.error(
    'Trump Goggles: Could not attach listener - browserAPI.action/browserAction.onClicked not found.'
  );
}
