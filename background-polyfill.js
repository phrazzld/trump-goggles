/**
 * Polyfill for browser API compatibility (Chrome/Firefox, MV2/MV3)
 * This allows the extension to work in both Chrome and Firefox with a single codebase
 */

// Determine the correct browser API namespace ('chrome' or 'browser').
// This variable holds the API root object for consistent access.
// @ts-ignore - 'browser' is defined in Firefox, 'chrome' in Chrome environments.
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

/**
 * Opens the extension's options page.
 * @param {browser.tabs.Tab} [_tab] - The tab where the action occurred (unused).
 */
function openOptionsOnClick(_tab) {
  if (browserAPI && browserAPI.runtime && browserAPI.runtime.openOptionsPage) {
    browserAPI.runtime.openOptionsPage();
  } else {
    console.error(
      'Trump Goggles: Cannot open options page - browserAPI.runtime.openOptionsPage not found.'
    );
  }
}

// Attach the click listener using the appropriate API via the polyfill
// @ts-ignore - Types for browserAPI are not fully recognized by TypeScript
if (browserAPI && browserAPI.action && browserAPI.action.onClicked) {
  // Manifest V3 API (chrome.action)
  // @ts-ignore - Types for browserAPI.action are not fully recognized by TypeScript
  browserAPI.action.onClicked.addListener(openOptionsOnClick);
} else if (browserAPI && browserAPI.browserAction && browserAPI.browserAction.onClicked) {
  // Manifest V2 API (browser.browserAction or chrome.browserAction)
  browserAPI.browserAction.onClicked.addListener(openOptionsOnClick);
} else {
  console.error(
    'Trump Goggles: Could not attach listener - browserAPI.action/browserAction.onClicked not found.'
  );
}
