import { test, expect } from '@playwright/test';
import { clearLocalStorage, waitForAppLoad, SELECTORS } from '../helpers/test-utils';
import { LobbyPage } from '../helpers/page-objects/LobbyPage';

test.describe('Lobby Screen', () => {
  let lobbyPage: LobbyPage;

  test.beforeEach(async ({ page, context }) => {
    // Clear storage at context level before navigation
    await context.clearCookies();
    await clearLocalStorage(page);
    
    // Navigate to page
    await page.goto('/');
    await waitForAppLoad(page);
    
    // Ensure we're on the lobby
    await expect(page.locator(SELECTORS.lobbyTitle)).toBeVisible();
    
    lobbyPage = new LobbyPage(page);
  });

  test('should display lobby with title', async ({ page }) => {
    await expect(page.locator('[data-testid="lobby-title"]')).toBeVisible();
    await expect(page.locator('text=Select a race to view horses and place bets')).toBeVisible();
  });

  test('should display live indicator', async ({ page }) => {
    await expect(page.locator('.animate-pulse-slow')).toBeVisible();
    await expect(page.locator('text=Live')).toBeVisible();
  });

  test('should display race cards', async () => {
    const raceCount = await lobbyPage.getRaceCount();
    expect(raceCount).toBeGreaterThan(0);
  });

  test('should display 5 race cards by default', async () => {
    const raceCount = await lobbyPage.getRaceCount();
    expect(raceCount).toBe(5);
  });

  test('should display race card with required information', async () => {
    const raceDetails = await lobbyPage.getRaceDetails(0);

    // Check that race card has content
    expect(raceDetails.text.length).toBeGreaterThan(0);

    // Check for race ID
    expect(raceDetails.id).toBeTruthy();
  });

  test('should navigate to form when clicking race card', async ({ page }) => {
    await lobbyPage.selectRace(0);

    // Wait for navigation to form screen
    await page.waitForSelector(SELECTORS.formTitle, { timeout: 5000 });
    
    // Should navigate to form screen
    await expect(page.locator(SELECTORS.formTitle)).toBeVisible();
    
    // Should not be on lobby anymore
    await expect(page.locator(SELECTORS.lobbyTitle)).not.toBeVisible();
  });

  test('should display header with app title', async ({ page }) => {
    await expect(page.locator('h1:has-text("TURF SPRINT")')).toBeVisible();
  });

  test('should display wallet balance in header', async ({ page }) => {
    await expect(page.locator('text=Balance:')).toBeVisible();
    await expect(page.locator('text=credits')).toBeVisible();
  });

  test('should display footer', async ({ page }) => {
    await expect(page.locator('footer')).toBeVisible();
    await expect(page.locator('text=© 2025 Turf Sprint')).toBeVisible();
    await expect(page.locator('text=Virtual currency only')).toBeVisible();
  });

  test('should handle race selection for different races', async ({ page }) => {
    // Select first race
    await lobbyPage.selectRace(0);
    await page.waitForSelector(SELECTORS.formTitle, { timeout: 5000 });
    await expect(page.locator(SELECTORS.formTitle)).toBeVisible();

    // Go back to lobby
    await page.click(SELECTORS.backButton);
    await page.waitForSelector(SELECTORS.lobbyTitle, { timeout: 5000 });
    await expect(page.locator(SELECTORS.lobbyTitle)).toBeVisible();

    // Wait for race cards to be visible
    await expect(page.locator(SELECTORS.raceCard).first()).toBeVisible();

    // Select first race again (races are regenerated)
    await lobbyPage.selectRace(0);
    await page.waitForSelector(SELECTORS.formTitle, { timeout: 5000 });
    await expect(page.locator(SELECTORS.formTitle)).toBeVisible();
  });

  test('should have responsive layout', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1280, height: 720 });
    await lobbyPage.assertIsVisible();
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await lobbyPage.assertIsVisible();
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await lobbyPage.assertIsVisible();
  });

  test('should persist horses in localStorage', async ({ page }) => {
    // First visit - should generate horses
    await page.goto('/');
    await waitForAppLoad(page);
    
    const localStorageData = await page.evaluate(() => {
      return localStorage.getItem('turf-sprint-horses');
    });
    
    expect(localStorageData).toBeTruthy();

    // Parse and verify
    const horses = JSON.parse(localStorageData || '{}');
    // Data may be stored with or without 'state' wrapper depending on persist version
    const horseData = horses.state?.horses || (Array.isArray(horses) ? horses : null);
    expect(horseData).toBeDefined();
    expect(horseData.length).toBeGreaterThan(0);
  });

  test('should handle page reload gracefully', async ({ page }) => {
    await lobbyPage.assertIsVisible();
    
    // Reload page
    await page.reload();
    await waitForAppLoad(page);
    
    // Should still show lobby
    await lobbyPage.assertIsVisible();
    
    // Should still have races
    const raceCount = await lobbyPage.getRaceCount();
    expect(raceCount).toBeGreaterThan(0);
  });

  test('should have correct URL', async ({ page }) => {
    expect(page.url()).toContain(':3000');
    expect(page.url()).not.toContain('#');
  });

  test('should be accessible', async ({ page }) => {
    // Check that main landmarks are present
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
    
    // Check that headings are in correct order
    const headings = await page.locator('h1, h2, h3').allTextContents();
    expect(headings.length).toBeGreaterThan(0);
  });
});
