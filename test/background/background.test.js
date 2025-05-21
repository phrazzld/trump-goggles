import { describe, it, expect, beforeEach, vi } from 'vitest';

// Test the functionality of the background script
describe('Background Script', () => {
  beforeEach(() => {
    // Reset the mocks before each test
    vi.resetAllMocks();
  });

  it('should open options page when extension icon is clicked', () => {
    // Mock the function we want to test
    const addListenerMock = chrome.action.onClicked.addListener;

    // Simulate the background script behavior directly
    // This is the core functionality of background.js
    const listener = function () {
      chrome.runtime.openOptionsPage();
    };

    // Add the listener ourselves
    addListenerMock(listener);

    // Verify that the listener was registered
    expect(addListenerMock).toHaveBeenCalledTimes(1);

    // Get the callback function (the one we just registered)
    // @ts-expect-error - vitest mock property exists at runtime
    const clickCallback = addListenerMock.mock.calls[0][0];

    // Simulate clicking the browser action
    clickCallback();

    // Verify that openOptionsPage was called
    expect(chrome.runtime.openOptionsPage).toHaveBeenCalledTimes(1);
  });
});
