import { FullConfig } from '@playwright/test';

/**
 * Global teardown for Playwright tests
 * This runs once after all tests
 */
async function globalTeardown(config: FullConfig) {
  console.log('✅ Playwright test suite completed');
}

export default globalTeardown;
