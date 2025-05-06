# Trump Goggles Visual Verification Checklist

This document provides a standardized checklist for manual visual verification of the Trump Goggles extension. While automated tests cover much of the functionality, some aspects are better verified through manual observation.

## Installation Testing

### Chrome Installation
- [ ] Extension loads without errors in Chrome
- [ ] Extension icon appears in the toolbar
- [ ] No console errors are displayed during installation
- [ ] Extension appears in the chrome://extensions page

### Firefox Installation
- [ ] Extension loads without errors in Firefox
- [ ] Extension icon appears in the toolbar
- [ ] No console errors are displayed during installation
- [ ] Extension appears in the about:addons page

## Basic Functionality Testing

### Icon and Options
- [ ] Clicking the extension icon opens the options page
- [ ] Options page displays correctly
- [ ] All text and elements in options page are properly aligned

### Text Replacement
- [ ] Visit a page with "Donald Trump" references
- [ ] Verify the text is replaced with the nickname
- [ ] Verify standalone "Trump" references are replaced
- [ ] Verify "President Trump" references are replaced

### Static vs. Dynamic Content
- [ ] Text replacement works on initial page load
- [ ] Text replacement works on content loaded via AJAX
- [ ] Text replacement works on content added by JavaScript
- [ ] Text replacement works after page scrolling/lazy loading

## Edge Case Testing

### Form Fields Protection
- [ ] Text in input fields is NOT modified
- [ ] Text in textareas is NOT modified
- [ ] Text in contenteditable elements is NOT modified
- [ ] Placeholder text is NOT modified

### Special Content
- [ ] Text inside code blocks is NOT modified
- [ ] Text within `<pre>` elements is NOT modified
- [ ] Text in hidden elements is NOT processed
- [ ] Text in iframes is NOT processed (due to security restrictions)

### Text Variations
- [ ] Text with HTML entities is properly replaced
- [ ] Text with unusual spacing/formatting is properly replaced
- [ ] Text with mixed casing is properly replaced
- [ ] Text with special characters is properly replaced

## Performance Testing

### Large Pages
- [ ] Extension works on pages with large amounts of text
- [ ] No significant slowdown is observed during page load
- [ ] Scrolling remains smooth after processing

### Dynamic Updates
- [ ] Rapidly updating content is handled properly
- [ ] No flickering is observed during text replacement
- [ ] Extension remains responsive after extended use

## Cross-Browser Consistency

### Visual Consistency
- [ ] Text replacement looks identical in Chrome and Firefox
- [ ] Options page appears identical in Chrome and Firefox
- [ ] Icon appearance is consistent across browsers

### Functional Consistency
- [ ] All features work the same in Chrome and Firefox
- [ ] Error handling works the same in Chrome and Firefox
- [ ] Performance is comparable in Chrome and Firefox

## Error Recovery

### Network Issues
- [ ] Extension works offline after initial load
- [ ] No errors are displayed if options page resources fail to load

### Extension Restart
- [ ] Extension works after browser restart
- [ ] Extension works after being disabled and re-enabled
- [ ] Extension works after being uninstalled and reinstalled

## Testing on Popular Sites

### News Sites
- [ ] Test on CNN.com
- [ ] Test on FoxNews.com
- [ ] Test on New York Times (nytimes.com)

### Social Media
- [ ] Test on Twitter.com
- [ ] Test on Reddit.com
- [ ] Test on Facebook.com

### Other Popular Sites
- [ ] Test on Wikipedia.org articles about Trump
- [ ] Test on news aggregators (Google News, Yahoo News)
- [ ] Test on blogs and personal websites with Trump content

## Reporting Results

For each round of visual verification testing, please document:

1. Date of testing
2. Browser versions tested
3. Extension version tested
4. Any issues observed during testing
5. Screenshots of any visual issues
6. Performance observations
7. Sites where replacement worked particularly well
8. Sites where replacement had issues

This information will be invaluable for improving the extension in future updates.