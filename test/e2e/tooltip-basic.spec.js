import { test, expect } from '@playwright/test';
import {
  waitForExtensionInitialization,
  hoverConvertedText,
  isTooltipVisible,
  getTooltipText,
  getOriginalTextFromElement,
  verifyTooltipExists,
} from './helpers/extension-helpers';

test.describe('Trump Goggles Tooltip Basic Functionality', () => {
  let page;

  test.beforeEach(async ({ browser }) => {
    // Create a new page for each test
    page = await browser.newPage();

    // Navigate to the test page
    await page.goto('tooltip-test.html');

    // Wait for the extension to initialize and process the page
    await waitForExtensionInitialization(page);
  });

  test('tooltip appears when hovering over converted text', async () => {
    // Verify that converted text elements exist on the page
    const convertedElements = await page.$$('.tg-converted-text');
    expect(convertedElements.length).toBeGreaterThan(0);

    // Verify that the tooltip element exists in the DOM
    await verifyTooltipExists(page);

    // Initially, the tooltip should not be visible
    const initialTooltipVisibility = await isTooltipVisible(page);
    expect(initialTooltipVisibility).toBe(false);

    // Hover over the first converted text element
    await hoverConvertedText(page, 0);

    // The tooltip should now be visible
    const tooltipVisible = await isTooltipVisible(page);
    expect(tooltipVisible).toBe(true);
  });

  test('tooltip shows correct original text', async () => {
    // Get the original text from the first converted element
    const originalText = await getOriginalTextFromElement(page, 0);
    expect(originalText).toBeTruthy();

    // Hover over the converted text to show the tooltip
    await hoverConvertedText(page, 0);

    // Get the text shown in the tooltip
    const tooltipText = await getTooltipText(page);

    // The tooltip text should match the original text
    expect(tooltipText).toBe(originalText);
  });

  test('tooltip disappears when not hovering', async () => {
    // Hover over a converted text element
    await hoverConvertedText(page, 0);

    // Verify tooltip is visible
    const tooltipVisibleOnHover = await isTooltipVisible(page);
    expect(tooltipVisibleOnHover).toBe(true);

    // Move mouse away to a non-converted element
    await page.hover('h1');
    await page.waitForTimeout(100); // Wait a bit for tooltip to hide

    // Verify tooltip is hidden
    const tooltipVisibleAfterLeave = await isTooltipVisible(page);
    expect(tooltipVisibleAfterLeave).toBe(false);
  });

  test.afterEach(async () => {
    await page.close();
  });
});
