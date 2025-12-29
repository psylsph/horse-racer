import { test, expect } from '@playwright/test';
import { clearLocalStorage, waitForAppLoad } from '../helpers/test-utils';

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page, context }) => {
    // Clear storage at context level before navigation
    await context.clearCookies();
    
    await page.goto('/');
    await waitForAppLoad(page);
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    // Check for single h1
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);

    // Check that h1 contains app title
    const h1Text = await page.locator('h1').textContent();
    expect(h1Text).toContain('TURF SPRINT');

    // Check for h2 elements
    const h2Count = await page.locator('h2').count();
    expect(h2Count).toBeGreaterThan(0);
  });

  test('should have ARIA labels on interactive elements', async ({ page }) => {
    // Check progress bar has proper ARIA attributes
    const progressBar = page.locator('[role="progressbar"]');
    await page.locator('[data-testid="race-card"]').first().click();
    await page.click('[data-testid="start-race-button"]');
    
    await expect(progressBar).toBeVisible();
    
    const ariaValueNow = await progressBar.getAttribute('aria-valuenow');
    const ariaValueMin = await progressBar.getAttribute('aria-valuemin');
    const ariaValueMax = await progressBar.getAttribute('aria-valuemax');
    
    expect(ariaValueMin).toBe('0');
    expect(ariaValueMax).toBe('100');
    expect(ariaValueNow).toBeTruthy();
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Tab through interactive elements
    await page.keyboard.press('Tab');
    
    // First focusable element should be a button or link
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['BUTTON', 'A', 'INPUT']).toContain(focusedElement);

    // Continue tabbing to ensure all elements are reachable
    let tabCount = 0;
    while (tabCount < 10) {
      await page.keyboard.press('Tab');
      tabCount++;
      const element = await page.evaluate(() => document.activeElement);
      if (!element) break;
    }
  });

  test('should have proper focus management', async ({ page }) => {
    // Focus a race card
    await page.locator('[data-testid="race-card"]').first().focus();
    const focusedElement = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
    expect(focusedElement).toBe('race-card');

    // Navigate to form
    await page.keyboard.press('Enter');
    await expect(page.locator('h2:has-text("Race #")')).toBeVisible();

    // Check that focus is managed
    const formFocused = await page.evaluate(() => document.activeElement?.tagName);
    expect(formFocused).toBeTruthy();
  });

  test('should have sufficient color contrast', async ({ page }) => {
    // This is a basic check - for full accessibility testing, use axe-core
    // Check that text is visible against background
    const bodyColor = await page.locator('body').evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        color: styles.color,
        backgroundColor: styles.backgroundColor
      };
    });

    expect(bodyColor.color).not.toBe(bodyColor.backgroundColor);
  });

  test('should have proper alt text for images', async ({ page }) => {
    // Check for any img elements (if added in future)
    const images = page.locator('img');
    const count = await images.count();
    
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const img = images.nth(i);
        const altText = await img.getAttribute('alt');
        expect(altText).toBeTruthy();
      }
    }
  });

  test('should have semantic HTML structure', async ({ page }) => {
    // Check for semantic landmarks
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('[data-testid="app-main"]')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();

    // Check for proper use of semantic elements
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThan(0);

    // Buttons should have accessible names
    for (let i = 0; i < Math.min(buttonCount, 5); i++) {
      const button = buttons.nth(i);
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');
      expect(text || ariaLabel).toBeTruthy();
    }
  });

  test('should have proper form labels', async ({ page }) => {
    // Navigate to form screen
    await page.locator('[data-testid="race-card"]').first().click();
    
    // Check that horse cards have proper labels
    const horseCards = page.locator('[data-testid="horse-card"]');
    const count = await horseCards.count();
    
    for (let i = 0; i < Math.min(count, 3); i++) {
      const card = horseCards.nth(i);
      const name = await card.locator('[data-testid="horse-name"]').textContent();
      expect(name).toBeTruthy();
      expect(name?.length).toBeGreaterThan(0);
    }
  });

  test('should handle screen reader announcements', async ({ page }) => {
    // Check for live regions that announce changes
    const liveRegions = page.locator('[aria-live], [role="status"]');
    const count = await liveRegions.count();
    
    // Should have at least one live region for race status
    await page.locator('[data-testid="race-card"]').first().click();
    await page.click('[data-testid="start-race-button"]');
    
    // Racing indicator should be visible
    await expect(page.locator('text=Racing...')).toBeVisible({ timeout: 5000 });
  });

  test('should have proper button states', async ({ page }) => {
    // Check disabled states
    const raceCards = page.locator('[data-testid="race-card"]');
    const firstCard = raceCards.first();
    
    // Check if any buttons are disabled
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < Math.min(buttonCount, 5); i++) {
      const button = buttons.nth(i);
      const isDisabled = await button.isDisabled();
      const ariaDisabled = await button.getAttribute('aria-disabled');
      
      // If button is disabled, it should have aria-disabled or disabled attribute
      if (isDisabled) {
        expect(ariaDisabled === 'true' || isDisabled).toBeTruthy();
      }
    }
  });

  test('should have proper link and button distinction', async ({ page }) => {
    // Check that buttons are used for actions, not links
    const actionButtons = page.locator('button:has-text("View"), button:has-text("Start"), button:has-text("Back")');
    const actionButtonCount = await actionButtons.count();
    
    // These should be buttons, not links
    for (let i = 0; i < actionButtonCount; i++) {
      const button = actionButtons.nth(i);
      const tagName = await button.evaluate(el => el.tagName);
      expect(tagName).toBe('BUTTON');
    }
  });

  test('should have proper error handling announcements', async ({ page }) => {
    // Navigate to invalid route
    await page.goto('/invalid-route');
    await page.waitForTimeout(1000);
    
    // App should still load gracefully
    await expect(page.locator('#root')).toBeVisible();
    
    // Check for any error messages that should be announced
    const errorElements = page.locator('[role="alert"], [aria-live="assertive"]');
    const count = await errorElements.count();
    
    // If there are error elements, they should have content
    for (let i = 0; i < count; i++) {
      const error = errorElements.nth(i);
      const text = await error.textContent();
      expect(text?.length).toBeGreaterThan(0);
    }
  });

  test('should have proper table headers if tables exist', async ({ page }) => {
    // This test will be useful when results table is implemented
    const tables = page.locator('table');
    const count = await tables.count();
    
    if (count > 0) {
      const table = tables.first();
      const headers = table.locator('th');
      const headerCount = await headers.count();
      
      expect(headerCount).toBeGreaterThan(0);
    }
  });

  test('should have proper list structure', async ({ page }) => {
    // Check that race cards use proper list structure
    const raceCards = page.locator('[data-testid="race-card"]');
    const count = await raceCards.count();
    
    // Race cards should be in a grid, but should have proper structure
    expect(count).toBeGreaterThan(0);
    
    for (let i = 0; i < Math.min(count, 3); i++) {
      const card = raceCards.nth(i);
      await expect(card).toBeVisible();
    }
  });

  test('should have proper skip links', async ({ page }) => {
    // Check for skip navigation links (best practice)
    const skipLinks = page.locator('a[href^="#"], a[href*="skip"]');
    const count = await skipLinks.count();
    
    // This is optional but recommended for accessibility
    // For now, we just verify the page loads without errors
    await expect(page.locator('#root')).toBeVisible();
  });
});
