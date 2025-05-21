import { test, expect } from '@playwright/test';
import {
  waitForExtensionInitialization,
  isTooltipVisible,
  verifyTooltipExists,
} from './helpers/extension-helpers';

test.describe('Trump Goggles Tooltip Dynamic Content', () => {
  let page;

  test.beforeEach(async ({ browser }) => {
    // Create a new page for each test
    page = await browser.newPage();

    // Navigate to the test page
    await page.goto('tooltip-test.html');

    // Wait for the extension to initialize and process the page
    await waitForExtensionInitialization(page);
  });

  test('tooltip works with dynamically added content', async () => {
    // Verify that the tooltip element exists in the DOM
    await verifyTooltipExists(page);

    // Get count of converted text elements before adding new content
    const initialConvertedCount = await page.$$eval(
      '.tg-converted-text',
      (elements) => elements.length
    );

    // Click the button to add dynamic content that contains convertible text
    await page.click('#add-content-btn');

    // Wait for the extension to process the new content
    // This might take some time as the extension needs to detect and process mutations
    await page.waitForTimeout(1000);

    // Check if there are more converted text elements after adding content
    const newConvertedCount = await page.$$eval(
      '.tg-converted-text',
      (elements) => elements.length
    );
    expect(newConvertedCount).toBeGreaterThan(initialConvertedCount);

    // Find the new converted text elements (ones that weren't there before)
    const newConvertedElements = await page.$$('#dynamic-content-container .tg-converted-text');
    expect(newConvertedElements.length).toBeGreaterThan(0);

    // Hover over one of the new converted text elements
    await newConvertedElements[0].hover();
    await page.waitForTimeout(100);

    // The tooltip should now be visible
    const tooltipVisible = await isTooltipVisible(page);
    expect(tooltipVisible).toBe(true);
  });

  test('tooltip shows correct original text for dynamic content', async () => {
    // Click the button to add dynamic content
    await page.click('#add-content-btn');

    // Wait for the extension to process the new content
    await page.waitForTimeout(1000);

    // Find the new converted text elements
    const newConvertedElements = await page.$$('#dynamic-content-container .tg-converted-text');
    expect(newConvertedElements.length).toBeGreaterThan(0);

    // Get the original text from the first new converted element
    const originalText = await newConvertedElements[0].getAttribute('data-original-text');
    expect(originalText).toBeTruthy();
    expect(originalText).toMatch(/Trump|Donald/); // It should be either "Trump" or "Donald..."

    // Hover over the new converted text to show the tooltip
    await newConvertedElements[0].hover();
    await page.waitForTimeout(100);

    // Get the text shown in the tooltip
    const tooltipText = await page.textContent('#tg-tooltip');

    // The tooltip text should match the original text
    expect(tooltipText).toBe(originalText);
  });

  test('tooltip works after multiple DOM changes', async () => {
    // Add dynamic content multiple times
    for (let i = 0; i < 3; i++) {
      await page.click('#add-content-btn');
      await page.waitForTimeout(300); // Wait a bit between clicks
    }

    // Wait for the extension to process all the changes
    await page.waitForTimeout(1000);

    // Find all converted text elements
    const allConvertedElements = await page.$$('.tg-converted-text');
    expect(allConvertedElements.length).toBeGreaterThan(0);

    // Try hovering over different converted elements and verify tooltip each time
    for (let i = 0; i < Math.min(3, allConvertedElements.length); i++) {
      // Hover over the converted text
      await allConvertedElements[i].hover();
      await page.waitForTimeout(100);

      // Verify tooltip is visible
      const tooltipVisible = await isTooltipVisible(page);
      expect(tooltipVisible).toBe(true);

      // Move away to hide tooltip
      await page.hover('h1');
      await page.waitForTimeout(100);
    }
  });

  test.afterEach(async () => {
    await page.close();
  });
});
