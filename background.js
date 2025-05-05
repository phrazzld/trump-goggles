/**
 * Event handler for the extension icon click.
 * Opens the options page when the extension icon is clicked.
 *
 * @param {browser.tabs.Tab} [tab] - The active tab when the icon is clicked (unused)
 * @returns {void}
 */
chrome.action.onClicked.addListener(function () {
  chrome.runtime.openOptionsPage();
});
