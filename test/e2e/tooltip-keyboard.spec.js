import { test, expect } from '@playwright/test';
import {
  waitForExtensionInitialization,
  isTooltipVisible,
  getTooltipText,
  focusWithTab,
  pressEscape,
  verifyTooltipExists,
} from './helpers/extension-helpers';

test.describe('Trump Goggles Tooltip Keyboard Navigation', () => {
  let page;

  test.beforeEach(async ({ browser }) => {
    // Create a new page for each test
    page = await browser.newPage();

    // Navigate to the test page
    await page.goto('tooltip-test.html');

    // Wait for the extension to initialize and process the page
    await waitForExtensionInitialization(page);
  });

  test('tooltip appears when focusing on converted text with Tab key', async () => {
    // Verify that the tooltip element exists in the DOM
    await verifyTooltipExists(page);

    // Initially, the tooltip should not be visible
    const initialTooltipVisibility = await isTooltipVisible(page);
    expect(initialTooltipVisibility).toBe(false);

    // Focus on the page and press Tab until we reach a converted text element
    // The number of tabs needed will depend on the page structure
    // We'll use our helper that will start from body and press Tab multiple times
    for (let tabCount = 1; tabCount <= 10; tabCount++) {
      await focusWithTab(page, tabCount);

      // Check if a converted text element is focused
      const isFocusedElementConverted = await page.evaluate(() => {
        const activeElement = document.activeElement;
        return activeElement && activeElement.classList.contains('tg-converted-text');
      });

      if (isFocusedElementConverted) {
        // If we've reached a converted text element, the tooltip should be visible
        const tooltipVisible = await isTooltipVisible(page);
        expect(tooltipVisible).toBe(true);

        // We found a converted text element, so we can exit the loop
        break;
      }

      // If we've tried 10 times and haven't found a converted text element,
      // there might be an issue with the tabbing or the converted text elements
      if (tabCount === 10) {
        test.fail(true, 'Could not focus on a converted text element after 10 Tab presses');
      }
    }
  });

  test('tooltip dismisses when pressing Escape key', async () => {
    // Focus on the page and press Tab until we reach a converted text element
    for (let tabCount = 1; tabCount <= 10; tabCount++) {
      await focusWithTab(page, tabCount);

      // Check if a converted text element is focused
      const isFocusedElementConverted = await page.evaluate(() => {
        const activeElement = document.activeElement;
        return activeElement && activeElement.classList.contains('tg-converted-text');
      });

      if (isFocusedElementConverted) {
        // If we've reached a converted text element, the tooltip should be visible
        const tooltipVisible = await isTooltipVisible(page);
        expect(tooltipVisible).toBe(true);

        // Press Escape key
        await pressEscape(page);

        // The tooltip should now be hidden
        const tooltipVisibleAfterEscape = await isTooltipVisible(page);
        expect(tooltipVisibleAfterEscape).toBe(false);

        // We can exit the loop after testing
        break;
      }

      if (tabCount === 10) {
        test.fail(true, 'Could not focus on a converted text element after 10 Tab presses');
      }
    }
  });

  test('tooltip contains the same text as original', async () => {
    // Focus on the page and press Tab until we reach a converted text element
    for (let tabCount = 1; tabCount <= 10; tabCount++) {
      await focusWithTab(page, tabCount);

      // Check if a converted text element is focused
      const isFocusedElementConverted = await page.evaluate(() => {
        const activeElement = document.activeElement;
        return activeElement && activeElement.classList.contains('tg-converted-text');
      });

      if (isFocusedElementConverted) {
        // Get the original text from the focused element
        const originalText = await page.evaluate(() => {
          const activeElement = document.activeElement;
          return activeElement.getAttribute('data-original-text');
        });

        // Get the text shown in the tooltip
        const tooltipText = await getTooltipText(page);

        // The tooltip text should match the original text
        expect(tooltipText).toBe(originalText);

        break;
      }

      if (tabCount === 10) {
        test.fail(true, 'Could not focus on a converted text element after 10 Tab presses');
      }
    }
  });

  test('tooltip hides when focus moves away', async () => {
    // Focus on the page and press Tab until we reach a converted text element
    for (let tabCount = 1; tabCount <= 10; tabCount++) {
      await focusWithTab(page, tabCount);

      // Check if a converted text element is focused
      const isFocusedElementConverted = await page.evaluate(() => {
        const activeElement = document.activeElement;
        return activeElement && activeElement.classList.contains('tg-converted-text');
      });

      if (isFocusedElementConverted) {
        // If we've reached a converted text element, the tooltip should be visible
        const tooltipVisible = await isTooltipVisible(page);
        expect(tooltipVisible).toBe(true);

        // Press Tab again to move focus away
        await page.keyboard.press('Tab');
        await page.waitForTimeout(100);

        // The tooltip should now be hidden
        const tooltipVisibleAfterTabbing = await isTooltipVisible(page);
        expect(tooltipVisibleAfterTabbing).toBe(false);

        break;
      }

      if (tabCount === 10) {
        test.fail(true, 'Could not focus on a converted text element after 10 Tab presses');
      }
    }
  });

  test.afterEach(async () => {
    await page.close();
  });
});
