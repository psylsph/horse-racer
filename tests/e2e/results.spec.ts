import { test, expect } from '@playwright/test';
import { waitForAppLoad, selectRace, clearLocalStorage } from '../helpers/test-utils';

test.describe('Results Screen', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.clearCookies();
    await clearLocalStorage(page);
    await page.goto('/');
    await waitForAppLoad(page);
    
    await selectRace(page, 0);
    await page.click('button:has-text("Start Race 🏁")');
    await page.click('button:has-text("Start Race")');
    await expect(page.locator('[data-testid="finished-badge"]')).toBeVisible({ timeout: 60000 });
    await page.waitForTimeout(3000);
  });

  test('should display results screen', async ({ page }) => {
    await expect(page.locator('[data-testid="results-title"]')).toBeVisible();
    await expect(page.locator('text=Results - Race #')).toBeVisible();
  });

  test('should display top 3 positions', async ({ page }) => {
    await expect(page.locator('text=🥇1st Place')).toBeVisible();
    await expect(page.locator('text=🥈2nd Place')).toBeVisible();
    await expect(page.locator('text=🥉3rd Place')).toBeVisible();
  });

  test('should display horse names and colors', async ({ page }) => {
    const horseNames = await page.locator('[data-testid="results-title"]').textContent();
    expect(horseNames).toBeTruthy();
    
    await expect(page.locator('.rounded-full.border-gold-600')).toBeVisible();
    await expect(page.locator('.rounded-full.border-slate-500')).toBeVisible();
    await expect(page.locator('.rounded-full.border-orange-600')).toBeVisible();
  });

  test('should display race statistics', async ({ page }) => {
    await expect(page.locator('text=Time:')).toBeVisible();
    await expect(page.locator('text=Speed:')).toBeVisible();
    
    const timeElement = page.locator('text=Time:').locator('..').locator('.font-mono');
    const timeText = await timeElement.textContent();
    expect(timeText).toMatch(/\d+\.\d{2}s/);
    
    const speedElement = page.locator('text=Speed:').locator('..').locator('.font-mono');
    const speedText = await speedElement.textContent();
    expect(speedText).toMatch(/\d+\.\d+ km\/h/);
  });

  test('should display full results table', async ({ page }) => {
    await expect(page.locator('text=Full Results')).toBeVisible();
    
    await expect(page.locator('th:text-is("Pos")')).toBeVisible();
    await expect(page.locator('th:text-is("Horse")')).toBeVisible();
    await expect(page.locator('th:text-is("Time")')).toBeVisible();
    await expect(page.locator('th:text-is("Speed")')).toBeVisible();
    
    const rows = page.locator('tbody tr');
    await expect(rows).toHaveCount(6);
  });

  test('should have back to lobby button', async ({ page }) => {
    const backButton = page.locator('[data-testid="back-button"]');
    await expect(backButton).toBeVisible();
    await expect(backButton).toHaveText('Back to Lobby');
  });

  test('should be accessible', async ({ page }) => {
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
    await expect(page.locator('h2')).toBeVisible();
  });

  test('should have responsive layout', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(page.locator('[data-testid="results-title"]')).toBeVisible();
    
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('[data-testid="results-title"]')).toBeVisible();
    
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('[data-testid="results-title"]')).toBeVisible();
  });

  test('should navigate back to lobby when clicking back button', async ({ page }) => {
    await page.click('[data-testid="back-button"]');
    await waitForAppLoad(page);
    
    await expect(page.locator('[data-testid="lobby-title"]')).toBeVisible();
  });
});
