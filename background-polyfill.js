/**
 * Polyfill for browser API compatibility
 * This allows the extension to work in both Chrome and Firefox with a single codebase
 */

// Define browserAPI to be either the Firefox browser API or Chrome's API
// Using explicit cast for type safety
const browserAPISource = typeof browser !== 'undefined' ? browser : chrome;
// Use browserAPISource to avoid unused variable warning

/**
 * Event handler for the extension icon click.
 * Opens the options page when the extension icon is clicked.
 *
 * This version works in both Chrome and Firefox thanks to the polyfill
 *
 * @param {browser.tabs.Tab} [tab] - The active tab when the icon is clicked (unused)
 * @returns {void}
 */
// Use the appropriate API based on manifest version
if (typeof chrome !== 'undefined' && chrome.action) {
  // Manifest V3 (Chrome)
  chrome.action.onClicked.addListener(function () {
    chrome.runtime.openOptionsPage();
  });
} else if (typeof browser !== 'undefined' && browser.browserAction) {
  // Manifest V2 (Firefox)
  browser.browserAction.onClicked.addListener(function () {
    browser.runtime.openOptionsPage();
  });
} else if (typeof chrome !== 'undefined' && chrome.browserAction) {
  // Manifest V2 (Chrome)
  chrome.browserAction.onClicked.addListener(function () {
    chrome.runtime.openOptionsPage();
  });
}
