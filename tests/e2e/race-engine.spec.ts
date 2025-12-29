import { test, expect } from '@playwright/test';
import { clearLocalStorage, waitForAppLoad, SELECTORS } from '../helpers/test-utils';

test.describe('Race Engine Functionality', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/');
    await waitForAppLoad(page);
  });

  test('should start race from form and navigate to race view', async ({ page }) => {
    // Navigate to form
    await page.locator('[data-testid="race-card"]').first().click();
    await expect(page.locator('h2:has-text("Race #")')).toBeVisible();
    
    // Click start race button on form
    await page.click('[data-testid="start-race-button"]');
    
    // Should navigate to race view
    await page.waitForSelector(SELECTORS.startButton, { timeout: 5000 });
    await expect(page.locator('h2:has-text("Race #")')).toBeVisible();
    await expect(page.locator(SELECTORS.startButton)).toBeVisible();
  });

  test('should display racing indicator after starting race', async ({ page }) => {
    // Navigate to race
    await page.locator('[data-testid="race-card"]').first().click();
    await page.click('[data-testid="start-race-button"]');
    await page.waitForSelector(SELECTORS.startButton, { timeout: 5000 });
    
    // Start race
    await page.click(SELECTORS.startButton);
    
    // Should show racing indicator
    await expect(page.locator(SELECTORS.racingIndicator)).toBeVisible({ timeout: 5000 });
    
    // Start button should be hidden
    await expect(page.locator(SELECTORS.startButton)).not.toBeVisible();
  });

  test('should update progress bar during race', async ({ page }) => {
    // Navigate to race
    await page.locator('[data-testid="race-card"]').first().click();
    await page.click('[data-testid="start-race-button"]');
    await page.waitForSelector(SELECTORS.startButton, { timeout: 5000 });
    await page.click(SELECTORS.startButton);
    
    // Initial progress should be 0
    let progress = await page.locator(SELECTORS.progressBar).getAttribute('aria-valuenow');
    expect(parseInt(progress || '0')).toBeGreaterThanOrEqual(0);
    
    // Wait a moment
    await page.waitForTimeout(2000);
    
    // Progress should have increased
    progress = await page.locator(SELECTORS.progressBar).getAttribute('aria-valuenow');
    expect(parseInt(progress || '0')).toBeGreaterThan(0);
  });

  test('should complete race and show finished badge', async ({ page }) => {
    // Navigate to race
    await page.locator('[data-testid="race-card"]').first().click();
    await page.click('[data-testid="start-race-button"]');
    await page.waitForSelector(SELECTORS.startButton, { timeout: 5000 });
    await page.click(SELECTORS.startButton);
    
    // Wait for race to complete
    await expect(page.locator(SELECTORS.finishedBadge)).toBeVisible({ timeout: 60000 });
    
    // Racing indicator should be hidden
    await expect(page.locator(SELECTORS.racingIndicator)).not.toBeVisible();
    
    // Start button should remain hidden
    await expect(page.locator(SELECTORS.startButton)).not.toBeVisible();
  });

  test('should navigate to results after race completes', async ({ page }) => {
    // Navigate and complete race
    await page.locator('[data-testid="race-card"]').first().click();
    await page.click('[data-testid="start-race-button"]');
    await page.waitForSelector(SELECTORS.startButton, { timeout: 5000 });
    await page.click(SELECTORS.startButton);
    
    // Wait for race to complete
    await expect(page.locator(SELECTORS.finishedBadge)).toBeVisible({ timeout: 60000 });
    
    // Wait for navigation to results (2 second delay in RaceView)
    await page.waitForTimeout(3000);
    
    // Should be on results screen
    await expect(page.locator('[data-testid="results-title"]')).toBeVisible();
  });

  test('should be able to go back from race to form', async ({ page }) => {
    // Navigate to race
    await page.locator('[data-testid="race-card"]').first().click();
    await page.click('[data-testid="start-race-button"]');
    await page.waitForSelector(SELECTORS.startButton, { timeout: 5000 });
    
    // Click back before starting race
    await page.click('[data-testid="back-button"]');
    
    // Should be back on form
    await expect(page.locator('[data-testid="start-race-button"]')).toBeVisible();
    await expect(page.locator('h2:has-text("Race #")')).toBeVisible();
  });

  test('should go back from race to form during race', async ({ page }) => {
    // Navigate to race
    await page.locator('[data-testid="race-card"]').first().click();
    await page.click('[data-testid="start-race-button"]');
    await page.waitForSelector(SELECTORS.startButton, { timeout: 5000 });
    await page.click(SELECTORS.startButton);
    
    // Wait for race to start
    await page.waitForTimeout(1000);
    await expect(page.locator(SELECTORS.racingIndicator)).toBeVisible();
    
    // Go back
    await page.click('[data-testid="back-button"]');
    
    // Should be back on form
    await expect(page.locator('[data-testid="start-race-button"]')).toBeVisible();
    await expect(page.locator('h2:has-text("Race #")')).toBeVisible();
  });

  test('should display correct race information', async ({ page }) => {
    // Navigate to race
    await page.locator('[data-testid="race-card"]').first().click();
    await page.click('[data-testid="start-race-button"]');
    await page.waitForSelector(SELECTORS.startButton, { timeout: 5000 });
    
    // Check race details
    const raceTitle = await page.locator('h2').textContent();
    expect(raceTitle).toContain('Race #');
    
    const raceDetails = await page.locator('p.text-slate-400').textContent();
    expect(raceDetails).toBeTruthy();
    expect(raceDetails?.length).toBeGreaterThan(10);
  });

  test('should display track and weather info', async ({ page }) => {
    // Navigate to race
    await page.locator('[data-testid="race-card"]').first().click();
    await page.click('[data-testid="start-race-button"]');
    await page.waitForSelector(SELECTORS.startButton, { timeout: 5000 });
    
    // Check footer info
    const horseText = await page.locator('text=horses competing').textContent();
    expect(horseText).toBeTruthy();
    
    const trackText = await page.locator('text=Track:').textContent();
    expect(trackText).toBeTruthy();
    expect(['firm', 'soft', 'heavy']).toContain(trackText?.split(':')[1]?.trim().toLowerCase());
    
    const weatherText = await page.locator('text=Weather:').textContent();
    expect(weatherText).toBeTruthy();
    expect(['clear', 'rain', 'muddy']).toContain(weatherText?.split(':')[1]?.trim().toLowerCase());
  });

  test('should handle multiple races in same session', async ({ page }) => {
    // First race
    await page.locator('[data-testid="race-card"]').nth(0).click();
    await page.click('[data-testid="start-race-button"]');
    await page.waitForSelector(SELECTORS.startButton, { timeout: 5000 });
    await page.click(SELECTORS.startButton);
    await expect(page.locator(SELECTORS.finishedBadge)).toBeVisible({ timeout: 60000 });
    await page.waitForTimeout(3000);
    
    // Go back to lobby
    await page.click('[data-testid="back-button"]');
    await expect(page.locator('[data-testid="lobby-title"]')).toBeVisible();
    
    // Second race
    await page.locator('[data-testid="race-card"]').nth(1).click();
    await page.click('[data-testid="start-race-button"]');
    await page.waitForSelector(SELECTORS.startButton, { timeout: 5000 });
    await page.click(SELECTORS.startButton);
    await expect(page.locator(SELECTORS.finishedBadge)).toBeVisible({ timeout: 60000 });
    await page.waitForTimeout(3000);
    
    // Go back to lobby
    await page.click('[data-testid="back-button"]');
    await expect(page.locator('[data-testid="lobby-title"]')).toBeVisible();
    
    // Third race
    await page.locator('[data-testid="race-card"]').nth(2).click();
    await page.click('[data-testid="start-race-button"]');
    await page.waitForSelector(SELECTORS.startButton, { timeout: 5000 });
    await page.click(SELECTORS.startButton);
    await expect(page.locator(SELECTORS.finishedBadge)).toBeVisible({ timeout: 60000 });
  });

  test('should maintain race state on page reload', async ({ page }) => {
    // Navigate to race
    await page.locator('[data-testid="race-card"]').first().click();
    await page.click('[data-testid="start-race-button"]');
    await page.waitForSelector(SELECTORS.startButton, { timeout: 5000 });
    
    // Reload before starting
    await page.reload();
    await waitForAppLoad(page);
    
    // Should still be on race screen
    await expect(page.locator('h2:has-text("Race #")')).toBeVisible();
    await expect(page.locator(SELECTORS.startButton)).toBeVisible();
  });
});
