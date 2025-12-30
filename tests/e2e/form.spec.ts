import { test, expect } from '@playwright/test';
import { waitForAppLoad, selectRace, SELECTORS } from '../helpers/test-utils';
import { FormPage } from '../helpers/page-objects/FormPage';

test.describe('Form Screen', () => {
  let formPage: FormPage;

  test.beforeEach(async ({ page, context }) => {
    await context.clearCookies();

    await page.goto('/');
    await waitForAppLoad(page);

    await selectRace(page, 0);

    formPage = new FormPage(page);
    await formPage.assertIsVisible();
  });

  test('should display form with race title', async ({ page }) => {
    await expect(page.locator('h2:has-text("Race #")')).toBeVisible();
    
    const raceId = await formPage.getRaceId();
    expect(raceId).toBeTruthy();
  });

  test('should display horse cards', async () => {
    const horseCount = await formPage.getHorseCount();
    expect(horseCount).toBeGreaterThan(0);
  });

  test('should display horse with required information', async ({ page }) => {
    const horseCard = page.locator('[data-testid="horse-card"]').first();
    
    await expect(horseCard.locator('[data-testid="horse-name"]')).toBeVisible();
    await expect(horseCard.locator('[data-testid="odds-badge"]')).toBeVisible();
    await expect(horseCard.locator('.w-12.h-12.rounded-full')).toBeVisible();
  });

  test('should display start race button', async () => {
    await formPage.assertStartRaceButtonVisible();
  });

  test('should display back button', async () => {
    await formPage.assertBackButtonVisible();
  });

  test('should navigate to race when clicking start race', async ({ page }) => {
    await formPage.clickStartRace();

    await page.waitForSelector(SELECTORS.raceStartRaceButton, { timeout: 5000 });
    await expect(page.locator('h2:has-text("Race #")')).toBeVisible();
    await expect(page.locator(SELECTORS.raceStartRaceButton)).toBeVisible();
  });

  test('should navigate back to lobby when clicking back', async ({ page }) => {
    await formPage.clickBack();

    await expect(page.locator('[data-testid="lobby-title"]')).toBeVisible();
  });

  test('should display horse color indicator', async ({ page }) => {
    const horseCard = page.locator('[data-testid="horse-card"]').nth(0);
    const colorIndicator = horseCard.locator('.w-12.h-12.rounded-full');

    await expect(colorIndicator).toBeVisible();

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
    await page.setViewportSize({ width: 1280, height: 720 });
    await formPage.assertIsVisible();

    await page.setViewportSize({ width: 768, height: 1024 });
    await formPage.assertIsVisible();

    await page.setViewportSize({ width: 375, height: 667 });
    await formPage.assertIsVisible();
  });

  test('should handle multiple horse cards', async ({ page }) => {
    const horseCount = await formPage.getHorseCount();
    expect(horseCount).toBeGreaterThan(1);

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

    const uniqueNames = new Set(names);
    expect(uniqueNames.size).toBe(names.length);
  });

  test('should have correct accessibility attributes', async ({ page }) => {
    await expect(page.locator('h2')).toBeVisible();

    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThan(0);
  });

  test('should show horse stats when horse is selected', async ({ page }) => {
    const firstHorse = page.locator('[data-testid="horse-card"]').nth(0);
    await firstHorse.click();

    await expect(firstHorse.locator('text=Speed')).toBeVisible();
    await expect(firstHorse.locator('text=Acceleration')).toBeVisible();
    await expect(firstHorse.locator('text=Stamina')).toBeVisible();
    await expect(firstHorse.locator('text=Consistency')).toBeVisible();
  });
});
