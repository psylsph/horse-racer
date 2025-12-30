import { test, expect } from '@playwright/test';
import { waitForAppLoad, SELECTORS } from '../helpers/test-utils';

test.describe('Full User Flow', () => {
  test('should complete full race flow from lobby to results', async ({ page, context }) => {
    // Start fresh
    await context.clearCookies();
    await page.goto('/');
    await waitForAppLoad(page);

    // Step 1: Verify lobby
    await expect(page.locator('[data-testid="lobby-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="race-card"]')).toHaveCount(5);

    // Step 2: Select a race
    await page.locator('[data-testid="race-card"]').first().click();

    // Step 3: Verify form screen
    await page.waitForSelector(SELECTORS.formTitle, { timeout: 5000 });
    await expect(page.locator('h2:has-text("Race #")')).toBeVisible();
    const horseCount = await page.locator('[data-testid="horse-card"]').count();
    expect(horseCount).toBeGreaterThan(0);

    // Step 4: Verify horse details
    const firstHorse = page.locator('[data-testid="horse-card"]').first();
    await expect(firstHorse.locator('[data-testid="horse-name"]')).toBeVisible();
    await expect(firstHorse.locator('[data-testid="odds-badge"]')).toBeVisible();

    // Step 5: Start race (navigates to race screen)
    await page.click(SELECTORS.formStartRaceButton);

    // Step 6: Verify race screen
    await page.waitForSelector(SELECTORS.raceStartRaceButton, { timeout: 5000 });
    await expect(page.locator('h2:has-text("Race #")')).toBeVisible();
    await expect(page.locator(SELECTORS.raceStartRaceButton)).toBeVisible();

    // Step 7: Start race simulation
    await page.click(SELECTORS.raceStartRaceButton);

    // Step 8: Verify race started
    await expect(page.locator(SELECTORS.racingIndicator)).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.animate-spin')).toBeVisible();

    // Step 9: Verify progress bar
    await expect(page.locator('[role="progressbar"]')).toBeVisible();

    // Step 10: Wait for race to complete
    await expect(page.locator('[data-testid="finished-badge"]')).toBeVisible({ timeout: 60000 });

    // Step 11: Wait for navigation to results
    await page.waitForTimeout(3000);

    // Step 12: Verify results screen
    await expect(page.locator('[data-testid="results-title"]')).toBeVisible();
    await expect(page.locator('text=Coming soon...')).toBeVisible();
  });

  test('should handle multiple races in sequence', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/');
    await waitForAppLoad(page);

    // First race
    await page.locator('[data-testid="race-card"]').nth(0).click();
    await expect(page.locator('h2:has-text("Race #")')).toBeVisible();
    await page.click(SELECTORS.formStartRaceButton);
    await page.waitForSelector(SELECTORS.raceStartRaceButton, { timeout: 5000 });
    await page.click(SELECTORS.raceStartRaceButton);
    await expect(page.locator('[data-testid="finished-badge"]')).toBeVisible({ timeout: 60000 });
    await page.waitForTimeout(3000);
    await expect(page.locator('[data-testid="results-title"]')).toBeVisible();

    // Go back to lobby
    await page.click('[data-testid="back-button"]');
    await expect(page.locator('[data-testid="lobby-title"]')).toBeVisible();

    // Second race
    await page.locator('[data-testid="race-card"]').nth(1).click();
    await expect(page.locator('h2:has-text("Race #")')).toBeVisible();
    await page.click(SELECTORS.formStartRaceButton);
    await page.waitForSelector(SELECTORS.raceStartRaceButton, { timeout: 5000 });
    await page.click(SELECTORS.raceStartRaceButton);
    await expect(page.locator('[data-testid="finished-badge"]')).toBeVisible({ timeout: 60000 });
    await page.waitForTimeout(3000);
    await expect(page.locator('[data-testid="results-title"]')).toBeVisible();
  });

  test('should handle navigation between screens', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/');
    await waitForAppLoad(page);

    // Lobby -> Form
    await page.locator('[data-testid="race-card"]').first().click();
    await expect(page.locator('h2:has-text("Race #")')).toBeVisible();

    // Form -> Lobby
    await page.click('[data-testid="back-button"]');
    await expect(page.locator('[data-testid="lobby-title"]')).toBeVisible();

    // Lobby -> Form (different race)
    await page.locator('[data-testid="race-card"]').nth(1).click();
    await expect(page.locator('h2:has-text("Race #")')).toBeVisible();

    // Form -> Race
    await page.click(SELECTORS.formStartRaceButton);
    await page.waitForSelector(SELECTORS.raceStartRaceButton, { timeout: 5000 });
    await expect(page.locator(SELECTORS.raceStartRaceButton)).toBeVisible();

    // Race -> Form
    await page.click('[data-testid="back-button"]');
    await expect(page.locator(SELECTORS.formStartRaceButton)).toBeVisible();
  });

  test('should maintain state across page reloads', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/');
    await waitForAppLoad(page);

    // Navigate to form
    await page.locator('[data-testid="race-card"]').first().click();
    const raceTitleBefore = await page.locator('h2').textContent();

    // Reload
    await page.reload();
    await waitForAppLoad(page);

    // Should still be on form with same race
    await expect(page.locator('h2:has-text("Race #")')).toBeVisible();
    const raceTitleAfter = await page.locator('h2').textContent();
    expect(raceTitleBefore).toBe(raceTitleAfter);

    // Navigate to race
    await page.click('[data-testid="start-race-button"]');
    await page.waitForSelector(SELECTORS.raceStartRaceButton, { timeout: 5000 });
    await page.click(SELECTORS.raceStartRaceButton);

    // Reload during race
    await page.waitForTimeout(1000);
    await page.reload();
    await waitForAppLoad(page);

    // Should still be on race screen
    await expect(page.locator('h2:has-text("Race #")')).toBeVisible();
  });

  test('should handle viewport changes gracefully', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/');
    await waitForAppLoad(page);

    // Desktop
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(page.locator('[data-testid="lobby-title"]')).toBeVisible();

    await page.locator('[data-testid="race-card"]').first().click();
    await expect(page.locator('h2:has-text("Race #")')).toBeVisible();

    // Tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('h2:has-text("Race #")')).toBeVisible();

    await page.click('[data-testid="start-race-button"]');
    await page.waitForSelector(SELECTORS.raceStartRaceButton, { timeout: 5000 });
    await expect(page.locator(SELECTORS.raceStartRaceButton)).toBeVisible();

    // Mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator(SELECTORS.raceStartRaceButton)).toBeVisible();
  });

  test('should verify localStorage persistence', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/');
    await waitForAppLoad(page);

    // Check initial localStorage
    const horsesBefore = await page.evaluate(() => {
      return localStorage.getItem('turf-sprint-horses');
    });
    expect(horsesBefore).toBeNull();

    // Navigate around to trigger horse generation
    await page.locator('[data-testid="race-card"]').first().click();
    await page.waitForTimeout(500);

    // Check localStorage after
    const horsesAfter = await page.evaluate(() => {
      return localStorage.getItem('turf-sprint-horses');
    });
    expect(horsesAfter).toBeTruthy();

    // Verify it's valid JSON
    const parsed = JSON.parse(horsesAfter || '{}');
    expect(parsed.state?.horses).toBeDefined();
    expect(parsed.state?.horses.length).toBeGreaterThan(0);
  });

  test('should verify accessibility throughout flow', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/');
    await waitForAppLoad(page);

    // Check lobby accessibility
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('h2')).toBeVisible();
    await expect(page.locator('[data-testid="app-main"]')).toBeVisible();
    await expect(page.locator('[data-testid="app-header"]')).toBeVisible();
    await expect(page.locator('[data-testid="app-footer"]')).toBeVisible();

    // Navigate to form
    await page.locator('[data-testid="race-card"]').first().click();

    // Check form accessibility
    await expect(page.locator('h2')).toBeVisible();
    await expect(page.locator('button')).toHaveCount(2); // Back and Start Race

    // Navigate to race
    await page.click('[data-testid="start-race-button"]');

    // Check race accessibility
    await expect(page.locator('h2')).toBeVisible();
    await expect(page.locator('[role="progressbar"]')).toBeVisible();
  });

  test('should handle error scenarios gracefully', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/');
    await waitForAppLoad(page);

    // Try to navigate to invalid URL
    await page.goto('/invalid-route');

    // Should still load the app
    await expect(page.locator('#root')).toBeVisible();

    // Should handle gracefully (show lobby or error)
    await page.waitForTimeout(1000);
    const bodyText = await page.locator('body').textContent();
    expect(bodyText).toBeTruthy();
  });

  test('should verify performance expectations', async ({ page, context }) => {
    await context.clearCookies();
    const startTime = Date.now();

    await page.goto('/');
    await waitForAppLoad(page);

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(5000); // Should load in under 5 seconds

    // Navigate to form
    const navStartTime = Date.now();
    await page.locator('[data-testid="race-card"]').first().click();
    await expect(page.locator('h2:has-text("Race #")')).toBeVisible();

    const navTime = Date.now() - navStartTime;
    expect(navTime).toBeLessThan(2000); // Navigation should be under 2 seconds
  });
});
