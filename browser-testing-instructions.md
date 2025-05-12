# Browser Testing Instructions for Trump Goggles

This document provides step-by-step instructions for testing the Trump Goggles extension across different browsers.

## Preparation

1. Build the browser-specific extension packages:

   ```bash
   chmod +x build-browser-extensions.sh
   ./build-browser-extensions.sh
   ```

2. Prepare test pages:
   - Use the `test-page.html` file created for performance testing
   - Prepare a few popular news sites for real-world testing

## Chrome Testing Instructions

1. **Installation**:

   - Open Chrome and navigate to `chrome://extensions/`
   - Enable Developer mode (toggle in top-right)
   - Click "Load unpacked" and select the `builds/chrome` directory
   - Verify extension icon appears in toolbar

2. **Functionality Tests**:

   - Open `test-page.html` in Chrome
   - Verify text replacements occur (e.g., "Joe Biden" becomes "Sleepy Joe")
   - Test editable fields (verify no replacements in contenteditable divs and textareas)
   - Click "Load More Content" button to test dynamic content handling
   - Check browser console for any errors

3. **Real-world Testing**:
   - Visit news websites (CNN, New York Times, Washington Post)
   - Verify replacements occur correctly
   - Test scrolling through articles to ensure dynamic content loading works
   - Test comment forms (editable fields) to ensure no replacements occur there

## Firefox Testing Instructions

1. **Installation**:

   - Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
   - Click "Load Temporary Add-on..."
   - Select the `builds/firefox/manifest.json` file
   - Verify extension icon appears in toolbar

2. **Functionality Tests**:

   - Same tests as Chrome
   - Pay particular attention to the browser action (click on icon to open options)
   - Check Firefox console for any Firefox-specific errors

3. **Real-world Testing**:
   - Same as Chrome
   - Take note of any performance differences compared to Chrome

## Edge Testing Instructions

1. **Installation**:

   - Open Edge and navigate to `edge://extensions/`
   - Enable Developer mode (toggle in left sidebar)
   - Click "Load unpacked" and select the `builds/edge` directory
   - Verify extension icon appears in toolbar

2. **Functionality Tests**:

   - Same tests as Chrome
   - Verify options page opens when clicking extension icon
   - Check Edge console for any errors

3. **Real-world Testing**:
   - Same as Chrome

## Verification Checklist

For each browser, verify and document:

- [ ] Extension installs successfully
- [ ] Text replacements work as expected
- [ ] Editable fields are properly skipped
- [ ] Dynamic content is processed correctly
- [ ] Extension icon functionality works
- [ ] No console errors during normal operation
- [ ] Performance is acceptable

## Troubleshooting

### Common Firefox Issues:

- If the browser action doesn't work, check that `background-firefox.js` is properly using the `browser` API
- If content script isn't running, check the manifest permissions

### Common Edge Issues:

- If the extension doesn't load, ensure manifest V3 is properly formatted
- Edge is Chromium-based, so Chrome-specific issues may also appear in Edge

## Reporting Results

Document your findings in the `cross-browser-compatibility-report.md` file, noting:

1. Any browser-specific issues encountered
2. Performance differences between browsers
3. Compatibility recommendations for future development
