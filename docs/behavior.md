# Trump Goggles: Extension Behavior Documentation

## Overview

Trump Goggles is a browser extension that automatically replaces references to Donald Trump and related terms with humorous nicknames and phrases throughout web pages you visit. This document explains how the extension works, what to expect, and any limitations you might encounter.

## How It Works

### Text Replacement

The extension uses regular expressions to identify Trump-related terms and replace them with alternative phrases:

| Original Term      | Replacement           |
| ------------------ | --------------------- |
| Donald Trump       | Agent Orange          |
| Trump              | The Orange One        |
| President Trump    | Commandant Bone Spurs |
| Hillary Clinton    | Crooked Hillary       |
| ISIS               | Evil Losers           |
| New York Times     | FAKE NEWS             |
| CNN                | Very Fake News        |
| Covid-19           | China Virus           |
| Coronavirus        | The Invisible Enemy   |
| _And many more..._ |                       |

### Activation

- The extension activates automatically when you visit a web page
- Text replacement happens as the page loads
- New content added to the page dynamically (e.g., through AJAX) is also processed
- The extension icon in your browser toolbar indicates that Trump Goggles is active

### Options

Currently, the extension does not have configurable options. Clicking the extension icon opens a simple page explaining that Trump Goggles is running.

## Expected Behavior

### What Gets Replaced

- Trump-related terms in regular page content
- News headlines, article text, and general web content
- Social media posts and comments (on compatible sites)
- Dynamic content loaded after the page initially loads

### What Doesn't Get Replaced

- Text in form inputs, textareas, and editable fields
- Content in iframes from different domains
- Text in browser UI elements
- Text in images (the extension cannot process image content)
- Code blocks and pre-formatted text
- Secure or private browsing pages (https://chrome.google.com/webstore/_, chrome://_ URLs, etc.)

## Performance Impact

The extension is designed to minimize performance impact:

- Text processing is optimized to use minimal CPU resources
- DOM processing happens in small chunks to avoid freezing the page
- Caching is used to avoid re-processing identical content
- Early bailout prevents unnecessary processing for content unlikely to contain matches

On most websites, you should not notice any performance degradation. However, on extremely large pages with complex DOM structures, you might experience:

- Slight delay in text replacement
- Momentary "flashes" of original text before replacement
- Increased memory usage

## Known Limitations

### Technical Limitations

- **Partial Word Matches**: Some replacements might incorrectly match parts of words (e.g., "Triumph" might become "The Orange Oneph")
- **Case Sensitivity**: While the extension tries to preserve case, it may not always match the original text capitalization
- **Dynamic Content**: Some web applications using complex JavaScript frameworks might load content in ways that bypass detection
- **Browser Compatibility**: Some features might work differently across Chrome, Firefox, and Edge

### Content Limitations

- **Context Awareness**: The extension cannot understand context, so replacements happen regardless of the surrounding content
- **Language Support**: Only English text is fully supported
- **Special Characters**: Text with unusual formatting or special characters might not be processed correctly

## Troubleshooting

### Common Issues

1. **Extension Not Working on Some Sites**

   - Some websites use security measures that prevent content scripts from running
   - Websites loaded in iframes might not be processed
   - Check if you're using private/incognito browsing, which might disable extensions

2. **Inconsistent Replacements**

   - Ensure the extension is enabled and up to date
   - Try refreshing the page to reprocess all content
   - Some dynamic content might load outside the extension's processing scope

3. **Page Performance Issues**
   - On very large pages, try scrolling slowly to allow processing to keep up
   - The extension might have more impact on older computers or browsers

### Reporting Issues

If you encounter problems or have suggestions for improvement:

- Visit the GitHub repository: [Trump Goggles on GitHub](https://github.com/yourusername/trump-goggles)
- Submit an issue with detailed information about the problem
- Include your browser information and steps to reproduce the issue

## Disabling the Extension

If you need to temporarily disable Trump Goggles:

1. Click the extension icon in your browser toolbar
2. Use the toggle switch or disable option provided by your browser
3. Refresh the page to see content without replacements

To completely uninstall:

- Open your browser's extension management page
- Find Trump Goggles and select "Remove" or "Uninstall"
- Confirm when prompted

## Privacy & Data Collection

Trump Goggles respects your privacy:

- No user data is collected or transmitted
- All processing happens locally in your browser
- No analytics or tracking is implemented
- No external services are contacted

## Compatibility

The extension is compatible with:

- Google Chrome (version 88+)
- Mozilla Firefox (version 78+)
- Microsoft Edge (version 88+)

## Conclusion

Trump Goggles is designed to be a lighthearted browser extension that provides a humorous twist on web content. While it strives to be comprehensive, some limitations exist due to the technical constraints of browser extensions and the complexity of web content.
