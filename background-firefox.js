/**
 * Event handler for the extension icon click.
 * Opens the options page when the extension icon is clicked.
 *
 * This version uses the browser API for Firefox compatibility.
 *
 * @param {browser.tabs.Tab} [tab] - The active tab when the icon is clicked (unused)
 * @returns {void}
 */
browser.browserAction.onClicked.addListener(function () {
  browser.runtime.openOptionsPage();
});
