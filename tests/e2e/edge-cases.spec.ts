import { test, expect } from '@playwright/test';
import { waitForAppLoad, seedTestData } from '../helpers/test-utils';

test.describe('Edge Cases and Error Scenarios', () => {
  test('should handle no races available', async ({ page, context }) => {
    await context.clearCookies();
    
    // Seed empty race data
    await seedTestData(page, {
      'turf-sprint-races': JSON.stringify({ races: [] }),
    });
    
    await page.goto('/');
    await waitForAppLoad(page);
    
    // Should show loading or empty state
    await expect(page.locator('#root')).toBeVisible();
  });

  test('should handle corrupted localStorage data', async ({ page, context }) => {
    await context.clearCookies();
    
    // Seed invalid JSON data
    await page.evaluate(() => {
      localStorage.setItem('turf-sprint-horses', 'invalid json');
    });
    
    await page.goto('/');
    await waitForAppLoad(page);
    
    // Should still load app gracefully
    await expect(page.locator('#root')).toBeVisible();
    await expect(page.locator('[data-testid="lobby-title"]')).toBeVisible();
  });

  test('should handle missing localStorage data', async ({ page, context }) => {
    await context.clearCookies();
    
    // Don't seed any data
    await page.goto('/');
    await waitForAppLoad(page);
    
    // Should generate default data
    await expect(page.locator('[data-testid="lobby-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="race-card"]')).toHaveCount(5);
  });

  test('should handle race with all horses having same stats', async ({ page, context }) => {
    await context.clearCookies();
    
    // Create horses with identical stats
    const identicalHorses = {
      horses: Array.from({ length: 20 }, (_, i) => ({
        id: `horse-${i}`,
        name: `Horse ${i + 1}`,
        color: '#8B4513',
        topSpeed: 80,
        acceleration: 80,
        stamina: 80,
        consistency: 80,
        trackPreference: 'firm',
        weatherModifier: 1.0,
        raceHistory: [],
        winRate: 0,
        totalRaces: 0,
        spriteConfig: { width: 80, height: 60, color: '#8B4513' },
      })),
    };
    
    await seedTestData(page, {
      'turf-sprint-horses': JSON.stringify({ state: identicalHorses }),
    });
    
    await page.goto('/');
    await waitForAppLoad(page);
    
    // Should still work
    await page.locator('[data-testid="race-card"]').first().click();
    await expect(page.locator('[data-testid="horse-card"]')).toHaveCount(20);
  });

  test('should handle extreme stat values (0)', async ({ page, context }) => {
    await context.clearCookies();
    
    // Create horses with minimum stats
    const minHorses = {
      horses: Array.from({ length: 20 }, (_, i) => ({
        id: `horse-${i}`,
        name: `Slow Horse ${i + 1}`,
        color: '#8B4513',
        topSpeed: 0,
        acceleration: 0,
        stamina: 0,
        consistency: 0,
        trackPreference: 'firm',
        weatherModifier: 1.0,
        raceHistory: [],
        winRate: 0,
        totalRaces: 0,
        spriteConfig: { width: 80, height: 60, color: '#8B4513' },
      })),
    };
    
    await seedTestData(page, {
      'turf-sprint-horses': JSON.stringify({ state: minHorses }),
    });
    
    await page.goto('/');
    await waitForAppLoad(page);
    
    // Should handle gracefully
    await page.locator('[data-testid="race-card"]').first().click();
    await expect(page.locator('[data-testid="horse-card"]')).toHaveCount(20);
  });

  test('should handle extreme stat values (100)', async ({ page, context }) => {
    await context.clearCookies();
    
    // Create horses with maximum stats
    const maxHorses = {
      horses: Array.from({ length: 20 }, (_, i) => ({
        id: `horse-${i}`,
        name: `Super Horse ${i + 1}`,
        color: '#8B4513',
        topSpeed: 100,
        acceleration: 100,
        stamina: 100,
        consistency: 100,
        trackPreference: 'firm',
        weatherModifier: 1.0,
        raceHistory: [],
        winRate: 0,
        totalRaces: 0,
        spriteConfig: { width: 80, height: 60, color: '#8B4513' },
      })),
    };
    
    await seedTestData(page, {
      'turf-sprint-horses': JSON.stringify({ state: maxHorses }),
    });
    
    await page.goto('/');
    await waitForAppLoad(page);
    
    // Should handle gracefully
    await page.locator('[data-testid="race-card"]').first().click();
    await expect(page.locator('[data-testid="horse-card"]')).toHaveCount(20);
  });

  test('should handle very long horse names', async ({ page, context }) => {
    await context.clearCookies();
    
    // Create horse with very long name
    const longName = 'A'.repeat(200);
    const longNameHorses = {
      horses: Array.from({ length: 20 }, (_, i) => ({
        id: `horse-${i}`,
        name: i === 0 ? longName : `Horse ${i + 1}`,
        color: '#8B4513',
        topSpeed: 80,
        acceleration: 80,
        stamina: 80,
        consistency: 80,
        trackPreference: 'firm',
        weatherModifier: 1.0,
        raceHistory: [],
        winRate: 0,
        totalRaces: 0,
        spriteConfig: { width: 80, height: 60, color: '#8B4513' },
      })),
    };
    
    await seedTestData(page, {
      'turf-sprint-horses': JSON.stringify({ state: longNameHorses }),
    });
    
    await page.goto('/');
    await waitForAppLoad(page);
    
    // Should handle long names without breaking layout
    await page.locator('[data-testid="race-card"]').first().click();
    await expect(page.locator('[data-testid="horse-card"]')).toHaveCount(20);
  });

  test('should handle rapid screen switching', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/');
    await waitForAppLoad(page);
    
    // Rapidly switch between screens
    for (let i = 0; i < 10; i++) {
      await page.locator('[data-testid="race-card"]').nth(i % 5).click();
      await page.click('[data-testid="back-button"]');
      await expect(page.locator('[data-testid="lobby-title"]')).toBeVisible();
    }
    
    // Should still work correctly
    await expect(page.locator('[data-testid="lobby-title"]')).toBeVisible();
  });

  test('should handle race interruption', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/');
    await waitForAppLoad(page);
    
    // Start race
    await page.locator('[data-testid="race-card"]').first().click();
    await page.click('[data-testid="start-race-button"]');
    await page.click('button:has-text("Start Race")');
    
    // Wait for race to start
    await expect(page.locator('text=Racing...')).toBeVisible({ timeout: 5000 });
    
    // Interrupt by going back
    await page.click('[data-testid="back-button"]');
    
    // Should navigate back to form
    await expect(page.locator('[data-testid="start-race-button"]')).toBeVisible();
  });

  test('should handle browser refresh during race', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/');
    await waitForAppLoad(page);
    
    // Start race
    await page.locator('[data-testid="race-card"]').first().click();
    await page.click('[data-testid="start-race-button"]');
    await page.click('button:has-text("Start Race")');
    
    // Wait for race to start
    await expect(page.locator('text=Racing...')).toBeVisible({ timeout: 5000 });
    
    // Refresh page
    await page.reload();
    await waitForAppLoad(page);
    
    // Should still be on race screen
    await expect(page.locator('h2:has-text("Race #")')).toBeVisible();
  });

  test('should handle invalid URL routes', async ({ page, context }) => {
    await context.clearCookies();
    
    // Try various invalid routes
    const invalidRoutes = [
      '/invalid',
      '/race/invalid-id',
      '/form/invalid-id',
      '/results/invalid-id',
    ];
    
    for (const route of invalidRoutes) {
      await page.goto(route);
      await page.waitForTimeout(500);
      
      // Should still load app
      await expect(page.locator('#root')).toBeVisible();
    }
  });

  test('should handle very large localStorage', async ({ page, context }) => {
    await context.clearCookies();
    
    // Create large amount of data
    const largeHorses = {
      horses: Array.from({ length: 100 }, (_, i) => ({
        id: `horse-${i}`,
        name: `Horse ${i + 1}`,
        color: '#8B4513',
        topSpeed: 70 + Math.floor(Math.random() * 30),
        acceleration: 70 + Math.floor(Math.random() * 30),
        stamina: 70 + Math.floor(Math.random() * 30),
        consistency: 70 + Math.floor(Math.random() * 30),
        trackPreference: ['firm', 'soft', 'heavy'][Math.floor(Math.random() * 3)],
        weatherModifier: 0.9 + Math.random() * 0.2,
        raceHistory: Array.from({ length: 100 }, () => ({
          position: Math.floor(Math.random() * 20) + 1,
          time: 60 + Math.random() * 30,
        })),
        winRate: Math.random(),
        totalRaces: 100,
        spriteConfig: { width: 80, height: 60, color: '#8B4513' },
      })),
    };
    
    await seedTestData(page, {
      'turf-sprint-horses': JSON.stringify({ state: largeHorses }),
    });
    
    const startTime = Date.now();
    await page.goto('/');
    await waitForAppLoad(page);
    const loadTime = Date.now() - startTime;
    
    // Should still load in reasonable time
    expect(loadTime).toBeLessThan(10000);
    
    await expect(page.locator('[data-testid="lobby-title"]')).toBeVisible();
  });

  test('should handle network timeout gracefully', async ({ page, context }) => {
    await context.clearCookies();
    
    // Block some requests to simulate network issues
    await page.route('**/*', async route => {
      // Simulate timeout for some requests
      if (Math.random() > 0.7) {
        await route.abort('failed');
      } else {
        await route.continue();
      }
    });
    
    await page.goto('/');
    
    // Should still show something
    await expect(page.locator('#root')).toBeVisible();
  });

  test('should handle race with single horse', async ({ page, context }) => {
    await context.clearCookies();
    
    // Create race with only one horse
    const singleHorse = {
      horses: [{
        id: 'horse-1',
        name: 'Lone Horse',
        color: '#8B4513',
        topSpeed: 80,
        acceleration: 80,
        stamina: 80,
        consistency: 80,
        trackPreference: 'firm',
        weatherModifier: 1.0,
        raceHistory: [],
        winRate: 0,
        totalRaces: 0,
        spriteConfig: { width: 80, height: 60, color: '#8B4513' },
      }],
    };
    
    await seedTestData(page, {
      'turf-sprint-horses': JSON.stringify({ state: singleHorse }),
    });
    
    await page.goto('/');
    await waitForAppLoad(page);
    
    // Should handle single horse
    await page.locator('[data-testid="race-card"]').first().click();
    await expect(page.locator('[data-testid="horse-card"]')).toHaveCount(1);
  });

  test('should handle concurrent race attempts', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/');
    await waitForAppLoad(page);
    
    // Try to start multiple races rapidly
    await page.locator('[data-testid="race-card"]').first().click();
    await page.click('[data-testid="start-race-button"]');
    
    // Try to click start again
    await page.click('button:has-text("Start Race")');
    
    // Should handle gracefully (button should be disabled or race should start once)
    const racingLocator = page.locator('text=Racing...');
    const startButtonLocator = page.locator('button:has-text("Start Race")');
    
    // At least one should be visible
    const isRacingVisible = await racingLocator.isVisible().catch(() => false);
    const isStartButtonVisible = await startButtonLocator.isVisible().catch(() => false);
    
    expect(isRacingVisible || isStartButtonVisible).toBeTruthy();
  });
});
