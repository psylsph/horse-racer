import { test, expect } from '@playwright/test';
import { clearLocalStorage, waitForAppLoad } from '../helpers/test-utils';

test.describe('Performance Tests', () => {
  test('should load initial page within time limit', async ({ page }) => {
    const startTime = Date.now();
    
    await clearLocalStorage(page);
    await page.goto('/');
    await waitForAppLoad(page);
    
    const loadTime = Date.now() - startTime;
    
    // Should load in under 5 seconds
    expect(loadTime).toBeLessThan(5000);
    
    console.log(`Initial page load time: ${loadTime}ms`);
  });

  test('should navigate to form within time limit', async ({ page }) => {
    await clearLocalStorage(page);
    await page.goto('/');
    await waitForAppLoad(page);
    
    const startTime = Date.now();
    
    await page.locator('[data-testid="race-card"]').first().click();
    await expect(page.locator('h2:has-text("Race #")')).toBeVisible();
    
    const navTime = Date.now() - startTime;
    
    // Navigation should be under 2 seconds
    expect(navTime).toBeLessThan(2000);
    
    console.log(`Form navigation time: ${navTime}ms`);
  });

  test('should navigate to race within time limit', async ({ page }) => {
    await clearLocalStorage(page);
    await page.goto('/');
    await waitForAppLoad(page);
    
    // Navigate to form
    await page.locator('[data-testid="race-card"]').first().click();
    await expect(page.locator('h2:has-text("Race #")')).toBeVisible();
    
    const startTime = Date.now();
    
    await page.click('[data-testid="start-race-button"]');
    await expect(page.locator('button:has-text("Start Race")')).toBeVisible();
    
    const navTime = Date.now() - startTime;
    
    // Navigation should be under 2 seconds
    expect(navTime).toBeLessThan(2000);
    
    console.log(`Race navigation time: ${navTime}ms`);
  });

  test('should complete race animation smoothly', async ({ page }) => {
    await clearLocalStorage(page);
    await page.goto('/');
    await waitForAppLoad(page);
    
    // Navigate to race and start
    await page.locator('[data-testid="race-card"]').first().click();
    await page.click('[data-testid="start-race-button"]');
    await page.click('button:has-text("Start Race")');
    
    const startTime = Date.now();
    
    // Wait for race to complete
    await expect(page.locator('[data-testid="finished-badge"]')).toBeVisible({ timeout: 60000 });
    
    const raceTime = Date.now() - startTime;
    
    // Race should complete in reasonable time (under 30 seconds)
    expect(raceTime).toBeLessThan(30000);
    
    console.log(`Race completion time: ${raceTime}ms`);
  });

  test('should handle rapid navigation without performance degradation', async ({ page }) => {
    await clearLocalStorage(page);
    await page.goto('/');
    await waitForAppLoad(page);
    
    const times: number[] = [];
    
    // Perform multiple rapid navigations
    for (let i = 0; i < 5; i++) {
      const startTime = Date.now();
      
      // Navigate to form
      await page.locator('[data-testid="race-card"]').nth(i % 5).click();
      await expect(page.locator('h2:has-text("Race #")')).toBeVisible();
      
      const navTime = Date.now() - startTime;
      times.push(navTime);
      
      // Go back
      await page.click('[data-testid="back-button"]');
      await expect(page.locator('[data-testid="lobby-title"]')).toBeVisible();
    }
    
    // Average navigation time should be under 2 seconds
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    expect(avgTime).toBeLessThan(2000);
    
    console.log(`Average navigation time: ${avgTime}ms`);
  });

  test('should maintain performance with large DOM', async ({ page }) => {
    await clearLocalStorage(page);
    await page.goto('/');
    await waitForAppLoad(page);
    
    // Navigate to form with 20 horse cards
    await page.locator('[data-testid="race-card"]').first().click();
    await expect(page.locator('[data-testid="horse-card"]')).toHaveCount(20);
    
    const startTime = Date.now();
    
    // Scroll through all horse cards
    for (let i = 0; i < 20; i++) {
      const card = page.locator('[data-testid="horse-card"]').nth(i);
      await card.scrollIntoViewIfNeeded();
    }
    
    const scrollTime = Date.now() - startTime;
    
    // Scrolling should be smooth (under 5 seconds for all cards)
    expect(scrollTime).toBeLessThan(5000);
    
    console.log(`Scroll through all cards time: ${scrollTime}ms`);
  });

  test('should not have memory leaks during race', async ({ page }) => {
    await clearLocalStorage(page);
    await page.goto('/');
    await waitForAppLoad(page);
    
    // Get initial memory usage
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });
    
    // Complete multiple races
    for (let i = 0; i < 3; i++) {
      await page.locator('[data-testid="race-card"]').nth(i % 5).click();
      await page.click('[data-testid="start-race-button"]');
      await page.click('button:has-text("Start Race")');
      await expect(page.locator('[data-testid="finished-badge"]')).toBeVisible({ timeout: 60000 });
      await page.waitForTimeout(3000);
      await page.click('[data-testid="back-button"]');
      await expect(page.locator('[data-testid="lobby-title"]')).toBeVisible();
    }
    
    // Get final memory usage
    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });
    
    // Memory should not grow significantly (less than 50% increase)
    if (initialMemory > 0 && finalMemory > 0) {
      const memoryGrowth = ((finalMemory - initialMemory) / initialMemory) * 100;
      expect(memoryGrowth).toBeLessThan(50);
      
      console.log(`Memory growth: ${memoryGrowth.toFixed(2)}%`);
    }
  });

  test('should handle slow network gracefully', async ({ page }) => {
    // Simulate slow network by adding delay
    await page.route('**/*', async route => {
      // Add 100ms delay
      await new Promise(resolve => setTimeout(resolve, 100));
      route.continue();
    });
    
    const startTime = Date.now();
    
    await clearLocalStorage(page);
    await page.goto('/');
    await waitForAppLoad(page);
    
    const loadTime = Date.now() - startTime;
    
    // Should still load, even if slower
    expect(loadTime).toBeLessThan(10000); // 10 seconds on slow network
    
    console.log(`Slow network load time: ${loadTime}ms`);
  });

  test('should have smooth animations', async ({ page }) => {
    await clearLocalStorage(page);
    await page.goto('/');
    await waitForAppLoad(page);
    
    // Navigate to race
    await page.locator('[data-testid="race-card"]').first().click();
    await page.click('[data-testid="start-race-button"]');
    await page.click('button:has-text("Start Race")');
    
    // Wait for race to start
    await expect(page.locator('text=Racing...')).toBeVisible({ timeout: 5000 });
    
    // Monitor frame rate during race
    const frameTimes: number[] = [];
    const startTime = Date.now();
    
    while (Date.now() - startTime < 3000) {
      const frameStart = Date.now();
      await page.waitForTimeout(16); // ~60fps
      const frameEnd = Date.now();
      frameTimes.push(frameEnd - frameStart);
    }
    
    // Average frame time should be under 30ms (33fps minimum)
    const avgFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
    expect(avgFrameTime).toBeLessThan(30);
    
    console.log(`Average frame time: ${avgFrameTime.toFixed(2)}ms`);
  });

  test('should render quickly on reload', async ({ page }) => {
    await clearLocalStorage(page);
    await page.goto('/');
    await waitForAppLoad(page);
    
    // Navigate to form
    await page.locator('[data-testid="race-card"]').first().click();
    await expect(page.locator('h2:has-text("Race #")')).toBeVisible();
    
    const reloadTimes: number[] = [];
    
    // Test multiple reloads
    for (let i = 0; i < 3; i++) {
      const startTime = Date.now();
      
      await page.reload();
      await waitForAppLoad(page);
      
      const reloadTime = Date.now() - startTime;
      reloadTimes.push(reloadTime);
    }
    
    // Average reload time should be under 3 seconds
    const avgReloadTime = reloadTimes.reduce((a, b) => a + b, 0) / reloadTimes.length;
    expect(avgReloadTime).toBeLessThan(3000);
    
    console.log(`Average reload time: ${avgReloadTime.toFixed(2)}ms`);
  });

  test('should have minimal layout shifts', async ({ page }) => {
    await clearLocalStorage(page);
    
    // Track layout shifts
    const clsScore = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let cls = 0;
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const layoutShiftEntry = entry as any;
            if (!layoutShiftEntry.hadRecentInput) {
              cls += layoutShiftEntry.value || 0;
            }
          }
        });
        observer.observe({ entryTypes: ['layout-shift'] });
        
        // Wait for page to stabilize
        setTimeout(() => {
          observer.disconnect();
          resolve(cls);
        }, 5000);
      });
    });
    
    await page.goto('/');
    await waitForAppLoad(page);
    
    // CLS should be under 0.1 (good score)
    expect(clsScore).toBeLessThan(0.1);
    
    console.log(`Cumulative Layout Shift score: ${clsScore.toFixed(4)}`);
  });
});
