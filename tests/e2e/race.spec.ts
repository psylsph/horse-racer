import { test, expect } from '@playwright/test';
import { clearLocalStorage, waitForAppLoad, selectRace, SELECTORS } from '../helpers/test-utils';
import { RacePage } from '../helpers/page-objects/RacePage';

test.describe('Race Screen', () => {
  let racePage: RacePage;

  test.beforeEach(async ({ page, context }) => {
    // Clear storage at context level before navigation
    await context.clearCookies();
    
    await page.goto('/');
    await waitForAppLoad(page);
    
    // Navigate to form
    await selectRace(page, 0);
    
    // Navigate to race screen
    await page.click(SELECTORS.formStartRaceButton);
    
    // Wait for race screen to be ready
    await page.waitForSelector(SELECTORS.raceStartRaceButton, { timeout: 5000 });
    
    racePage = new RacePage(page);
    await racePage.assertIsVisible();
  });

  test('should display race with title', async ({ page }) => {
    await expect(page.locator('h2:has-text("Race #")')).toBeVisible();
    
    const raceId = await racePage.getRaceId();
    expect(raceId).toBeTruthy();
  });

  test('should display race details', async ({ page }) => {
    const details = await racePage.getRaceDetails();
    
    expect(details.title).toContain('Race #');
    expect(details.details).toBeTruthy();
  });

  test('should display start race button initially', async ({ page }) => {
    await racePage.assertStartRaceButtonVisible();
  });

  test('should start race when clicking start button', async ({ page }) => {
    await racePage.clickStartRace();
    
    // Should show racing indicator
    await racePage.assertRacingIndicatorVisible();
    
    // Start button should be hidden
    await racePage.assertStartRaceButtonHidden();
  });

  test('should display racing indicator during race', async ({ page }) => {
    await racePage.clickStartRace();
    await racePage.assertRacingIndicatorVisible();
    
    // Check for spinner
    await expect(page.locator('.animate-spin')).toBeVisible();
  });

  test('should display progress bar', async ({ page }) => {
    await racePage.assertProgressBarVisible();
  });

  test('should update progress during race', async ({ page }) => {
    await racePage.clickStartRace();
    
    // Wait a bit for progress to start
    await page.waitForTimeout(1000);
    
    const progress = await racePage.getProgress();
    expect(progress).toBeGreaterThan(0);
  });

  test('should complete race and show finished badge', async ({ page }) => {
    await racePage.clickStartRace();
    
    // Wait for race to complete (with longer timeout)
    await racePage.waitForRaceCompletion(60000);
    
    await racePage.assertFinishedBadgeVisible();
  });

  test('should show 100% progress when race completes', async ({ page }) => {
    await racePage.clickStartRace();
    
    // Wait for race to complete
    await racePage.waitForRaceCompletion(60000);
    
    const progress = await racePage.getProgress();
    expect(progress).toBeGreaterThanOrEqual(100);
  });

  test('should display race canvas', async ({ page }) => {
    await racePage.assertRaceCanvasVisible();
  });

  test('should display back button', async ({ page }) => {
    await expect(page.locator('button:has-text("Back")')).toBeVisible();
  });

  test('should navigate back to form when clicking back', async ({ page }) => {
    await page.click('[data-testid="back-button"]');
    
    // Should navigate back to form
    await expect(page.locator('h2:has-text("Race #")')).toBeVisible();
    await expect(page.locator('[data-testid="start-race-button"]')).toBeVisible();
  });

  test('should display horse count in footer', async ({ page }) => {
    const horseCount = await racePage.getHorseCount();
    expect(horseCount).toBeTruthy();
    expect(parseInt(horseCount || '0')).toBeGreaterThan(0);
  });

  test('should display track surface in footer', async ({ page }) => {
    const trackSurface = await racePage.getTrackSurface();
    expect(trackSurface).toBeTruthy();
    expect(['firm', 'soft', 'heavy']).toContain(trackSurface?.toLowerCase());
  });

  test('should display weather in footer', async ({ page }) => {
    const weather = await racePage.getWeather();
    expect(weather).toBeTruthy();
    expect(['clear', 'rain', 'muddy']).toContain(weather?.toLowerCase());
  });

  test('should have responsive layout', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1280, height: 720 });
    await racePage.assertIsVisible();
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await racePage.assertIsVisible();
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await racePage.assertIsVisible();
  });

  test('should handle race restart', async ({ page }) => {
    // Start first race
    await racePage.clickStartRace();
    await racePage.assertRacingIndicatorVisible();
    
    // Go back to form
    await page.click('[data-testid="back-button"]');
    await expect(page.locator('[data-testid="start-race-button"]')).toBeVisible();
    
    // Start race again
    await page.click('[data-testid="start-race-button"]');
    await racePage.assertIsVisible();
    await racePage.assertStartRaceButtonVisible();
  });

  test('should navigate to results after race completes', async ({ page }) => {
    await racePage.clickStartRace();
    
    // Wait for race to complete
    await racePage.waitForRaceCompletion(60000);
    
    // Wait a bit more for navigation
    await page.waitForTimeout(3000);
    
    // Should navigate to results
    await expect(page.locator('h2:has-text("Results")')).toBeVisible();
  });

  test('should have correct accessibility attributes', async ({ page }) => {
    // Check for proper heading structure
    await expect(page.locator('h2')).toBeVisible();
    
    // Check for progress bar accessibility
    const progressBar = page.locator('[role="progressbar"]');
    await expect(progressBar).toBeVisible();
  });

  test('should complete race simulation successfully', async ({ page }) => {
    await racePage.clickStartRace();
    
    // Wait for race to start
    await racePage.assertRacingIndicatorVisible();
    
    // Verify progress increases
    await page.waitForTimeout(1000);
    const progress1 = await racePage.getProgress();
    expect(progress1).toBeGreaterThan(0);
    
    // Wait for more progress
    await page.waitForTimeout(1000);
    const progress2 = await racePage.getProgress();
    expect(progress2).toBeGreaterThan(progress1);
    
    // Wait for completion
    await racePage.waitForRaceCompletion(60000);
    
    // Verify final state
    await racePage.assertFinishedBadgeVisible();
    await racePage.assertStartRaceButtonHidden();
    
    const finalProgress = await racePage.getProgress();
    expect(finalProgress).toBeGreaterThanOrEqual(100);
  });

  test('should show correct horse count during race', async ({ page }) => {
    const horseCount = await racePage.getHorseCount();
    const count = parseInt(horseCount || '0');
    
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThanOrEqual(10);
  });

  test('should maintain race state during progress', async ({ page }) => {
    await racePage.clickStartRace();
    
    // Check multiple times during race
    for (let i = 0; i < 3; i++) {
      await page.waitForTimeout(500);
      const progress = await racePage.getProgress();
      expect(progress).toBeGreaterThanOrEqual(0);
      expect(progress).toBeLessThanOrEqual(100);
    }
    
    // Wait for completion
    await racePage.waitForRaceCompletion(60000);
  });

  test('should navigate to results after race finishes', async ({ page }) => {
    await racePage.clickStartRace();
    
    // Wait for race to complete
    await racePage.waitForRaceCompletion(60000);
    
    // Wait for navigation to results (2 second delay in RaceView)
    await page.waitForTimeout(3000);
    
    // Should be on results screen
    await expect(page.locator('[data-testid="results-title"]')).toBeVisible();
  });

  test('should maintain race state during page reload', async ({ page }) => {
    await racePage.clickStartRace();
    
    // Wait a bit
    await page.waitForTimeout(1000);
    
    // Reload page
    await page.reload();
    await waitForAppLoad(page);
    
    // Should still be on race screen
    await racePage.assertIsVisible();
  });

  test('should display correct race ID', async ({ page }) => {
    const raceId = await racePage.getRaceId();
    expect(raceId).toBeTruthy();
    expect(raceId?.length).toBeGreaterThan(0);
  });

  test('should handle multiple races in sequence', async ({ page }) => {
    // Complete first race
    await racePage.clickStartRace();
    await racePage.waitForRaceCompletion(60000);
    await page.waitForTimeout(3000);
    
    // Go back to lobby
    await page.click('[data-testid="back-button"]');
    await expect(page.locator('[data-testid="lobby-title"]')).toBeVisible();
    
    // Select another race
    await page.locator('[data-testid="race-card"]').nth(1).click();
    await expect(page.locator('h2:has-text("Race #")')).toBeVisible();
    
    // Start second race
    await page.click('[data-testid="start-race-button"]');
    await racePage.assertIsVisible();
  });
});
