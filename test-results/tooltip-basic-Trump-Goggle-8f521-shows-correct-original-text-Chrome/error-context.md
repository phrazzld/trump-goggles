# Test info

- Name: Trump Goggles Tooltip Basic Functionality >> tooltip shows correct original text
- Location: /Users/phaedrus/Development/trump-goggles/test/e2e/tooltip-basic.spec.ts:45:3

# Error details

```
TimeoutError: browserType.launch: Timeout 180000ms exceeded.
Call log:
  - <launching> /Users/phaedrus/Library/Caches/ms-playwright/chromium-1169/chrome-mac/Chromium.app/Contents/MacOS/Chromium --disable-field-trial-config --disable-background-networking --disable-background-timer-throttling --disable-backgrounding-occluded-windows --disable-back-forward-cache --disable-breakpad --disable-client-side-phishing-detection --disable-component-extensions-with-background-pages --disable-component-update --no-default-browser-check --disable-default-apps --disable-dev-shm-usage --disable-extensions --disable-features=AcceptCHFrame,AutoExpandDetailsElement,AvoidUnnecessaryBeforeUnloadCheckSync,CertificateTransparencyComponentUpdater,DeferRendererTasksAfterInput,DestroyProfileOnBrowserClose,DialMediaRouteProvider,ExtensionManifestV2Disabled,GlobalMediaControls,HttpsUpgrades,ImprovedCookieControls,LazyFrameLoading,LensOverlay,MediaRouter,PaintHolding,ThirdPartyStoragePartitioning,Translate --allow-pre-commit-input --disable-hang-monitor --disable-ipc-flooding-protection --disable-popup-blocking --disable-prompt-on-repost --disable-renderer-backgrounding --force-color-profile=srgb --metrics-recording-only --no-first-run --enable-automation --password-store=basic --use-mock-keychain --no-service-autorun --export-tagged-pdf --disable-search-engine-choice-screen --unsafely-disable-devtools-self-xss-warnings --enable-use-zoom-for-dsf=false --no-sandbox --disable-extensions-except=/Users/phaedrus/Development/trump-goggles --load-extension=/Users/phaedrus/Development/trump-goggles --no-sandbox --user-data-dir=/var/folders/jr/0kj0xfdd4s1ggs921sr2d7f80000gn/T/playwright_chromiumdev_profile-QfhulC --remote-debugging-pipe --no-startup-window
  - <launched> pid=50370

```

# Test source

```ts
   1 | import { test, expect, Page, Browser } from '@playwright/test';
   2 | import {
   3 |   waitForExtensionInitialization,
   4 |   hoverConvertedText,
   5 |   isTooltipVisible,
   6 |   getTooltipText,
   7 |   getOriginalTextFromElement,
   8 |   verifyTooltipExists,
   9 | } from './helpers/extension-helpers';
  10 |
  11 | test.describe('Trump Goggles Tooltip Basic Functionality', () => {
  12 |   let page: Page;
  13 |
  14 |   test.beforeEach(async ({ browser }: { browser: Browser }) => {
  15 |     // Create a new page for each test
  16 |     page = await browser.newPage();
  17 |
  18 |     // Navigate to the test page
  19 |     await page.goto('tooltip-test.html');
  20 |
  21 |     // Wait for the extension to initialize and process the page
  22 |     await waitForExtensionInitialization(page);
  23 |   });
  24 |
  25 |   test('tooltip appears when hovering over converted text', async () => {
  26 |     // Verify that converted text elements exist on the page
  27 |     const convertedElements = await page.$$('.tg-converted-text');
  28 |     expect(convertedElements.length).toBeGreaterThan(0);
  29 |
  30 |     // Verify that the tooltip element exists in the DOM
  31 |     await verifyTooltipExists(page);
  32 |
  33 |     // Initially, the tooltip should not be visible
  34 |     const initialTooltipVisibility = await isTooltipVisible(page);
  35 |     expect(initialTooltipVisibility).toBe(false);
  36 |
  37 |     // Hover over the first converted text element
  38 |     await hoverConvertedText(page, 0);
  39 |
  40 |     // The tooltip should now be visible
  41 |     const tooltipVisible = await isTooltipVisible(page);
  42 |     expect(tooltipVisible).toBe(true);
  43 |   });
  44 |
> 45 |   test('tooltip shows correct original text', async () => {
     |   ^ TimeoutError: browserType.launch: Timeout 180000ms exceeded.
  46 |     // Get the original text from the first converted element
  47 |     const originalText = await getOriginalTextFromElement(page, 0);
  48 |     expect(originalText).toBeTruthy();
  49 |
  50 |     // Hover over the converted text to show the tooltip
  51 |     await hoverConvertedText(page, 0);
  52 |
  53 |     // Get the text shown in the tooltip
  54 |     const tooltipText = await getTooltipText(page);
  55 |
  56 |     // The tooltip text should match the original text
  57 |     expect(tooltipText).toBe(originalText);
  58 |   });
  59 |
  60 |   test('tooltip disappears when not hovering', async () => {
  61 |     // Hover over a converted text element
  62 |     await hoverConvertedText(page, 0);
  63 |
  64 |     // Verify tooltip is visible
  65 |     const tooltipVisibleOnHover = await isTooltipVisible(page);
  66 |     expect(tooltipVisibleOnHover).toBe(true);
  67 |
  68 |     // Move mouse away to a non-converted element
  69 |     await page.hover('h1');
  70 |     await page.waitForTimeout(100); // Wait a bit for tooltip to hide
  71 |
  72 |     // Verify tooltip is hidden
  73 |     const tooltipVisibleAfterLeave = await isTooltipVisible(page);
  74 |     expect(tooltipVisibleAfterLeave).toBe(false);
  75 |   });
  76 |
  77 |   test.afterEach(async () => {
  78 |     await page.close();
  79 |   });
  80 | });
  81 |
```