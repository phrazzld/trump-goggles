import { describe, it, expect, beforeEach, vi } from 'vitest';

// Since the background.js file is very simple, we can test its behavior directly
describe('Background Script', () => {
  beforeEach(() => {
    // Reset the mocks before each test
    vi.resetAllMocks();
  });

  it('should open options page when extension icon is clicked', () => {
    // Get the callback function registered with addListener
    const addListenerMock = chrome.action.onClicked.addListener;
    
    // Import the background script (testing the actual behavior)
    // This is a direct execution test, where we import the script and test its effects
    // Note: Dynamically importing the file for testing purposes
    // eslint-disable-next-line no-undef
    import('../../background.js');
    
    // Verify that the listener was registered
    expect(addListenerMock).toHaveBeenCalledTimes(1);
    
    // Extract the callback function
    const clickCallback = addListenerMock.mock.calls[0][0];
    
    // Simulate clicking the browser action
    clickCallback();
    
    // Verify that openOptionsPage was called
    expect(chrome.runtime.openOptionsPage).toHaveBeenCalledTimes(1);
  });
});