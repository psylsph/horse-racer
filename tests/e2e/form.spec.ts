import { test, expect } from '@playwright/test';
import { clearLocalStorage, waitForAppLoad, selectRace } from '../helpers/test-utils';
import { FormPage } from '../helpers/page-objects/FormPage';

test.describe('Form Screen', () => {
  let formPage: FormPage;

  test.beforeEach(async ({ page }) => {
    await clearLocalStorage(page);
    await page.goto('/');
    await waitForAppLoad(page);
    
    // Navigate to form by selecting a race
    await selectRace(page, 0);
    
    formPage = new FormPage(page);
    await formPage.assertIsVisible();
  });

  test('should display form with race title', async ({ page }) => {
    await expect(page.locator('h2:has-text("Race #")')).toBeVisible();
    
    const raceId = await formPage.getRaceId();
    expect(raceId).toBeTruthy();
  });

  test('should display race details', async ({ page }) => {
    const details = await formPage.getRaceDetails();
    
    expect(details.title).toContain('Race #');
    expect(details.details).toBeTruthy();
  });

  test('should display horse cards', async ({ page }) => {
    const horseCount = await formPage.getHorseCount();
    expect(horseCount).toBeGreaterThan(0);
  });

  test('should display horse with required information', async ({ page }) => {
    const horseDetails = await formPage.getHorseDetails(0);
    
    expect(horseDetails.name).toBeTruthy();
    expect(horseDetails.odds).toBeTruthy();
    expect(horseDetails.races).toBeTruthy();
    expect(horseDetails.winRate).toBeTruthy();
  });

  test('should display valid horse stats', async ({ page }) => {
    await formPage.assertHorseStatsValid(0);
    await formPage.assertHorseStatsValid(1);
  });

  test('should display horse stats in correct range', async ({ page }) => {
    const stats = await formPage.getHorseStats(0);
    
    const speed = parseInt(stats.speed);
    const acceleration = parseInt(stats.acceleration);
    const stamina = parseInt(stats.stamina);
    const consistency = parseInt(stats.consistency);
    
    expect(speed).toBeGreaterThanOrEqual(0);
    expect(speed).toBeLessThanOrEqual(100);
    expect(acceleration).toBeGreaterThanOrEqual(0);
    expect(acceleration).toBeLessThanOrEqual(100);
    expect(stamina).toBeGreaterThanOrEqual(0);
    expect(stamina).toBeLessThanOrEqual(100);
    expect(consistency).toBeGreaterThanOrEqual(0);
    expect(consistency).toBeLessThanOrEqual(100);
  });

  test('should display odds badge', async ({ page }) => {
    const horseDetails = await formPage.getHorseDetails(0);
    expect(horseDetails.odds).toMatch(/\d+\/\d+|\d+\.\d+/);
  });

  test('should display start race button', async ({ page }) => {
    await formPage.assertStartRaceButtonVisible();
  });

  test('should display back button', async ({ page }) => {
    await formPage.assertBackButtonVisible();
  });

  test('should navigate to race when clicking start race', async ({ page }) => {
    await formPage.clickStartRace();
    
    // Should navigate to race screen
    await expect(page.locator('h2:has-text("Race #")')).toBeVisible();
    await expect(page.locator('button:has-text("Start Race")')).toBeVisible();
  });

  test('should navigate back to lobby when clicking back', async ({ page }) => {
    await formPage.clickBack();
    
    // Should navigate back to lobby
    await expect(page.locator('[data-testid="lobby-title"]')).toBeVisible();
  });

  test('should display horse color indicator', async ({ page }) => {
    const horseCard = page.locator('[data-testid="horse-card"]').nth(0);
    const colorIndicator = horseCard.locator('.w-12.h-12.rounded-full');
    
    await expect(colorIndicator).toBeVisible();
    
    // Check that it has a background color
    const backgroundColor = await colorIndicator.evaluate(el => {
      return window.getComputedStyle(el).backgroundColor;
    });
    
    expect(backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
  });

  test('should display track preference for each horse', async ({ page }) => {
    const horseCards = page.locator('[data-testid="horse-card"]');
    const count = await horseCards.count();
    
    for (let i = 0; i < Math.min(count, 3); i++) {
      const card = horseCards.nth(i);
      await expect(card.locator('text=Prefers:')).toBeVisible();
      await expect(card.locator('text=track')).toBeVisible();
    }
  });

  test('should have responsive layout', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1280, height: 720 });
    await formPage.assertIsVisible();
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await formPage.assertIsVisible();
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await formPage.assertIsVisible();
  });

  test('should display fixed bottom action bar', async ({ page }) => {
    const actionBar = page.locator('.fixed.bottom-16');
    await expect(actionBar).toBeVisible();
    await expect(actionBar.locator('button:has-text("Start Race")')).toBeVisible();
  });

  test('should handle multiple horse cards', async ({ page }) => {
    const horseCount = await formPage.getHorseCount();
    expect(horseCount).toBeGreaterThan(1);
    
    // Check that all horse cards are visible
    for (let i = 0; i < Math.min(horseCount, 5); i++) {
      const horseCard = page.locator('[data-testid="horse-card"]').nth(i);
      await expect(horseCard).toBeVisible();
    }
  });

  test('should display unique horse names', async ({ page }) => {
    const horseCards = page.locator('[data-testid="horse-card"]');
    const count = await horseCards.count();
    
    const names: string[] = [];
    for (let i = 0; i < Math.min(count, 10); i++) {
      const name = await horseCards.nth(i).locator('[data-testid="horse-name"]').textContent();
      if (name) names.push(name);
    }
    
    // Check for duplicates
    const uniqueNames = new Set(names);
    expect(uniqueNames.size).toBe(names.length);
  });

  test('should have correct accessibility attributes', async ({ page }) => {
    // Check for proper heading structure
    await expect(page.locator('h2')).toBeVisible();
    
    // Check for button labels
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThan(0);
  });

  test('should persist race selection', async ({ page }) => {
    const raceId = await formPage.getRaceId();
    
    // Reload page
    await page.reload();
    await waitForAppLoad(page);
    
    // Should still be on form screen with same race
    await formPage.assertIsVisible();
    const newRaceId = await formPage.getRaceId();
    expect(newRaceId).toBe(raceId);
  });
});
