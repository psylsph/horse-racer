import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Playwright configuration for Turf Sprint horse racing game
 *
 * This configuration sets up Playwright to work with Vite's dev server,
 * provides consistent test environments, and includes visual regression testing.
 */

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  use: {
    baseURL: 'http://0.0.0.0:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // Use consistent viewport for tests
    viewport: { width: 1280, height: 720 },
    // Ignore HTTPS errors for local development
    ignoreHTTPSErrors: true,
    // Wait for network idle before considering actions complete
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // Run your local dev server before starting the tests
  webServer: {
    command: 'npm run dev -- --host 0.0.0.0',
    url: 'http://0.0.0.0:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },

  // Global setup for test data
  globalSetup: path.join(__dirname, 'tests/global-setup.ts'),
  globalTeardown: path.join(__dirname, 'tests/global-teardown.ts'),
});
