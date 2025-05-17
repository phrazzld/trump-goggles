import { defineConfig } from '@playwright/test';

/**
 * Playwright configuration for Trump Goggles E2E tests
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './test/e2e',
  timeout: 30000,
  fullyParallel: false, // We don't want to run browser extension tests in parallel
  forbidOnly: !!process.env.CI, // Fail if there are tests with .only in CI
  retries: process.env.CI ? 2 : 0, // More retries in CI
  workers: 1, // Run tests one at a time for browser extension tests
  reporter: [['html'], ['list']],

  use: {
    // Base URL for our test pages
    baseURL: 'file://' + process.cwd() + '/test/e2e/pages/',

    // Browser options
    headless: false, // Extensions require headful mode
    viewport: { width: 1280, height: 720 },

    // Record traces and screenshots for debugging
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'Chrome',
      use: {
        browserName: 'chromium',
        // Chrome-specific options for extension testing
        launchOptions: {
          args: [
            // Path to the browser extension
            `--disable-extensions-except=${process.cwd()}`,
            `--load-extension=${process.cwd()}`,
            // Required for extension testing
            '--no-sandbox',
          ],
        },
      },
    },

    /* Firefox extension testing requires different approach and
       Firefox may require the extension to be signed or in dev mode */
    // Uncomment when Firefox testing is set up
    /*
    {
      name: 'Firefox',
      use: {
        browserName: 'firefox',
        // Firefox-specific options will go here
      },
    },
    */
  ],

  // Folder for test artifacts (screenshots, traces, etc.)
  outputDir: 'test-results',

  // Web server for test pages if needed in the future
  // webServer: {
  //   command: 'pnpm run serve-test-pages',
  //   port: 3000,
  //   reuseExistingServer: !process.env.CI,
  // },
});
