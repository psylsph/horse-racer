import { test, expect } from '@playwright/test';
import { clearLocalStorage, waitForAppLoad, selectRace } from '../helpers/test-utils';

test.describe('Results Screen', () => {
  test.beforeEach(async ({ page, context }) => {
    // Clear storage at context level before navigation
    await context.clearCookies();
    
    await page.goto('/');
    await waitForAppLoad(page);
    
    // Navigate to form and start race
    await selectRace(page, 0);
    await page.click('button:has-text("Start Race 🏁")');
    
    // Start the race
    await page.click('button:has-text("Start Race")');
    
    // Wait for race to complete
    await expect(page.locator('[data-testid="finished-badge"]')).toBeVisible({ timeout: 60000 });
    
    // Wait for navigation to results
    await page.waitForTimeout(3000);
  });

  test('should display results screen', async ({ page }) => {
    await expect(page.locator('h2:has-text("Results")')).toBeVisible();
  });

  test('should display results title', async ({ page }) => {
    await expect(page.locator('h2:has-text("Results")')).toBeVisible();
  });

  test('should display coming soon message', async ({ page }) => {
    await expect(page.locator('text=Coming soon...')).toBeVisible();
  });

  test('should have proper heading structure', async ({ page }) => {
    const heading = page.locator('h2:has-text("Results")');
    await expect(heading).toBeVisible();
    
    const text = await heading.textContent();
    expect(text).toContain('Results');
  });

  test('should be accessible', async ({ page }) => {
    // Check that results heading is present
    await expect(page.locator('h2:has-text("Results")')).toBeVisible();
    
    // Check for proper landmarks
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
  });

  test('should have responsive layout', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(page.locator('h2:has-text("Results")')).toBeVisible();
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('h2:has-text("Results")')).toBeVisible();
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('h2:has-text("Results")')).toBeVisible();
  });

  test('should maintain results state on reload', async ({ page }) => {
    await expect(page.locator('h2:has-text("Results")')).toBeVisible();
    
    // Reload page
    await page.reload();
    await waitForAppLoad(page);
    
    // Should still show results
    await expect(page.locator('h2:has-text("Results")')).toBeVisible();
  });

  test('should display centered content', async ({ page }) => {
    const resultsContainer = page.locator('.text-center');
    await expect(resultsContainer).toBeVisible();
  });
});
