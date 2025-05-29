/**
 * Helper functions for working with the Trump Goggles extension in E2E tests
 */
import { expect, Page } from '@playwright/test';

interface WaitOptions {
  timeout?: number;
}

/**
 * Waits for the extension to initialize and process a page
 */
export async function waitForExtensionInitialization(
  page: Page,
  { timeout = 5000 }: WaitOptions = {}
): Promise<void> {
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
 */
export async function verifyTooltipExists(page: Page): Promise<void> {
  const tooltipElement = await page.$('#tg-tooltip');
  expect(tooltipElement).not.toBeNull();
}

/**
 * Checks if the tooltip is visible
 */
export async function isTooltipVisible(page: Page): Promise<boolean> {
  const tooltipElement = await page.$('#tg-tooltip');
  if (!tooltipElement) return false;

  // Check if the tooltip is visible by checking its CSS visibility and opacity
  const isVisible = await tooltipElement.evaluate((el: HTMLElement) => {
    const styles = window.getComputedStyle(el);
    return styles.visibility === 'visible' && styles.opacity !== '0';
  });

  return isVisible;
}

/**
 * Gets the text content of the tooltip
 */
export async function getTooltipText(page: Page): Promise<string | null> {
  const tooltipElement = await page.$('#tg-tooltip');
  if (!tooltipElement) return null;

  return await tooltipElement.textContent();
}

/**
 * Hovers over a converted text element
 */
export async function hoverConvertedText(page: Page, index: number = 0): Promise<void> {
  const convertedElements = await page.$$('.tg-converted-text');
  expect(convertedElements.length).toBeGreaterThan(index);

  await convertedElements[index].hover();
  // Give time for the tooltip to appear
  await page.waitForTimeout(100);
}

/**
 * Gets the original text from a converted element
 */
export async function getOriginalTextFromElement(
  page: Page,
  index: number = 0
): Promise<string | null> {
  const convertedElements = await page.$$('.tg-converted-text');
  if (convertedElements.length <= index) return null;

  return await convertedElements[index].getAttribute('data-original-text');
}

/**
 * Focuses on a converted text element using the Tab key
 */
export async function focusWithTab(page: Page, tabCount: number = 1): Promise<void> {
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
 */
export async function pressEscape(page: Page): Promise<void> {
  await page.keyboard.press('Escape');
  await page.waitForTimeout(100);
}
