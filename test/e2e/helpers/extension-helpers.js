/**
 * Helper functions for working with the Trump Goggles extension in E2E tests
 */
import { expect } from '@playwright/test';

/**
 * Waits for the extension to initialize and process a page
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {Object} options - Options for waiting
 * @param {number} options.timeout - Timeout in milliseconds
 * @returns {Promise<void>}
 */
export async function waitForExtensionInitialization(page, { timeout = 5000 } = {}) {
  // Wait for the extension's content script to be injected and initialize
  // This can be detected by looking for elements with the tg-converted-text class
  try {
    // First, we need to give the page some time to load and the extension to initialize
    await page.waitForTimeout(1000);

    // Then, look for any converted text elements
    await page.waitForSelector('.tg-converted-text', { timeout });

    // Additional wait to ensure everything is stable
    await page.waitForTimeout(500);
  } catch {
    // If we couldn't find any converted text, the extension might not have found any text to convert
    // or might not be working properly. Log this for debugging.
    console.warn(
      'No converted text elements found. The extension may not have processed this page.'
    );
  }
}

/**
 * Verifies that the tooltip element exists in the DOM
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @returns {Promise<void>}
 */
export async function verifyTooltipExists(page) {
  const tooltipElement = await page.$('#tg-tooltip');
  expect(tooltipElement).not.toBeNull();
}

/**
 * Checks if the tooltip is visible
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @returns {Promise<boolean>}
 */
export async function isTooltipVisible(page) {
  const tooltipElement = await page.$('#tg-tooltip');
  if (!tooltipElement) return false;

  // Check if the tooltip is visible by checking its CSS visibility and opacity
  const isVisible = await tooltipElement.evaluate((el) => {
    const styles = window.getComputedStyle(el);
    return styles.visibility === 'visible' && styles.opacity !== '0';
  });

  return isVisible;
}

/**
 * Gets the text content of the tooltip
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @returns {Promise<string|null>}
 */
export async function getTooltipText(page) {
  const tooltipElement = await page.$('#tg-tooltip');
  if (!tooltipElement) return null;

  return await tooltipElement.textContent();
}

/**
 * Hovers over a converted text element
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {number} index - Index of the converted text element to hover (0-based)
 * @returns {Promise<void>}
 */
export async function hoverConvertedText(page, index = 0) {
  const convertedElements = await page.$$('.tg-converted-text');
  expect(convertedElements.length).toBeGreaterThan(index);

  await convertedElements[index].hover();
  // Give time for the tooltip to appear
  await page.waitForTimeout(100);
}

/**
 * Gets the original text from a converted element
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {number} index - Index of the converted text element (0-based)
 * @returns {Promise<string|null>}
 */
export async function getOriginalTextFromElement(page, index = 0) {
  const convertedElements = await page.$$('.tg-converted-text');
  if (convertedElements.length <= index) return null;

  return await convertedElements[index].getAttribute('data-original-text');
}

/**
 * Focuses on a converted text element using the Tab key
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {number} tabCount - Number of Tab key presses to reach the element
 * @returns {Promise<void>}
 */
export async function focusWithTab(page, tabCount = 1) {
  // First focus on the body
  await page.focus('body');

  // Press Tab the specified number of times
  for (let i = 0; i < tabCount; i++) {
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);
  }
}

/**
 * Presses the Escape key
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @returns {Promise<void>}
 */
export async function pressEscape(page) {
  await page.keyboard.press('Escape');
  await page.waitForTimeout(100);
}
