import { test, expect } from '@playwright/test';
import { clearLocalStorage, waitForAppLoad } from '../helpers/test-utils';

test.describe('Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    await clearLocalStorage(page);
    await page.goto('/');
    await waitForAppLoad(page);
  });

  test('should match lobby screenshot', async ({ page }) => {
    // Wait for all content to load
    await page.waitForLoadState('networkidle');
    
    // Take full page screenshot
    await expect(page).toHaveScreenshot('lobby.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('should match form screenshot', async ({ page }) => {
    // Navigate to form
    await page.locator('[data-testid="race-card"]').first().click();
    await page.waitForLoadState('networkidle');
    
    // Take full page screenshot
    await expect(page).toHaveScreenshot('form.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('should match race screenshot before start', async ({ page }) => {
    // Navigate to race
    await page.locator('[data-testid="race-card"]').first().click();
    await page.click('[data-testid="start-race-button"]');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot before race starts
    await expect(page).toHaveScreenshot('race-before-start.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('should match race screenshot during race', async ({ page }) => {
    // Navigate to race and start
    await page.locator('[data-testid="race-card"]').first().click();
    await page.click('[data-testid="start-race-button"]');
    await page.click('button:has-text("Start Race")');
    
    // Wait for race to start
    await expect(page.locator('text=Racing...')).toBeVisible({ timeout: 5000 });
    
    // Take screenshot during race
    await expect(page).toHaveScreenshot('race-during.png', {
      fullPage: true,
      maxDiffPixels: 1000, // Allow some pixel differences due to animation
    });
  });

  test('should match race screenshot after completion', async ({ page }) => {
    // Navigate to race and complete
    await page.locator('[data-testid="race-card"]').first().click();
    await page.click('[data-testid="start-race-button"]');
    await page.click('button:has-text("Start Race")');
    
    // Wait for race to complete
    await expect(page.locator('[data-testid="finished-badge"]')).toBeVisible({ timeout: 60000 });
    await page.waitForTimeout(1000);
    
    // Take screenshot after race completes
    await expect(page).toHaveScreenshot('race-completed.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('should match results screenshot', async ({ page }) => {
    // Complete a race to get to results
    await page.locator('[data-testid="race-card"]').first().click();
    await page.click('[data-testid="start-race-button"]');
    await page.click('button:has-text("Start Race")');
    await expect(page.locator('[data-testid="finished-badge"]')).toBeVisible({ timeout: 60000 });
    await page.waitForTimeout(3000);
    
    // Take results screenshot
    await expect(page).toHaveScreenshot('results.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('should match desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('lobby-desktop.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('should match tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('lobby-tablet.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('should match mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('lobby-mobile.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('should match race card hover state', async ({ page }) => {
    const raceCard = page.locator('[data-testid="race-card"]').first();
    await raceCard.hover();
    await page.waitForTimeout(500);
    
    // Screenshot the specific card
    await expect(raceCard).toHaveScreenshot('race-card-hover.png');
  });

  test('should match horse card layout', async ({ page }) => {
    // Navigate to form
    await page.locator('[data-testid="race-card"]').first().click();
    await page.waitForLoadState('networkidle');
    
    const horseCard = page.locator('[data-testid="horse-card"]').first();
    await expect(horseCard).toHaveScreenshot('horse-card.png');
  });

  test('should match progress bar states', async ({ page }) => {
    // Navigate to race
    await page.locator('[data-testid="race-card"]').first().click();
    await page.click('[data-testid="start-race-button"]');
    await page.click('button:has-text("Start Race")');
    
    // Wait for progress to start
    await page.waitForTimeout(2000);
    
    const progressBar = page.locator('[role="progressbar"]');
    await expect(progressBar).toHaveScreenshot('progress-bar.png');
  });

  test('should match header across screens', async ({ page }) => {
    const header = page.locator('[data-testid="app-header"]');
    
    // Screenshot header on lobby
    await expect(header).toHaveScreenshot('header-lobby.png');
    
    // Navigate to form
    await page.locator('[data-testid="race-card"]').first().click();
    await expect(header).toHaveScreenshot('header-form.png');
  });

  test('should match footer across screens', async ({ page }) => {
    const footer = page.locator('[data-testid="app-footer"]');
    
    // Screenshot footer on lobby
    await expect(footer).toHaveScreenshot('footer.png');
  });

  test('should match button states', async ({ page }) => {
    await page.locator('[data-testid="race-card"]').first().click();
    
    const startButton = page.locator('[data-testid="start-race-button"]');
    
    // Normal state
    await expect(startButton).toHaveScreenshot('button-normal.png');
    
    // Hover state
    await startButton.hover();
    await page.waitForTimeout(300);
    await expect(startButton).toHaveScreenshot('button-hover.png');
  });
});
