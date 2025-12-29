import { Page, expect } from '@playwright/test';

/**
 * Test utilities and helper functions for Playwright tests
 */

export const SELECTORS = {
  // App selectors
  app: '#root',
  header: '[data-testid="app-header"]',
  main: '[data-testid="app-main"]',
  footer: '[data-testid="app-footer"]',

  // Lobby selectors
  lobbyContainer: '[data-testid="lobby-container"]',
  lobbyTitle: '[data-testid="lobby-title"]',
  raceCard: '[data-testid="race-card"]',
  liveIndicator: '.animate-pulse-slow',

  // Form selectors
  formTitle: 'h2:has-text("Race #")',
  horseCard: '[data-testid="horse-card"]',
  horseName: '[data-testid="horse-name"]',
  horseStats: '[data-testid="horse-stats"]',
  oddsBadge: '[data-testid="odds-badge"]',
  formStartRaceButton: '[data-testid="form-start-race-button"]',
  backButton: '[data-testid="back-button"]',

  // Race selectors
  raceTitle: 'h2:has-text("Race #")',
  raceStartRaceButton: '[data-testid="race-start-race-button"]',
  startButton: '[data-testid="race-start-race-button"]', // Alias for raceStartRaceButton
  racingIndicator: '[data-testid="racing-indicator"]',
  finishedBadge: '[data-testid="finished-badge"]',
  progressBar: '[data-testid="progress-bar"]',
  raceCanvas: '[data-testid="race-canvas"]',

  // Results selectors
  resultsTitle: '[data-testid="results-title"]',

  // General UI
  button: 'button',
  card: '[data-testid="card"]',
  badge: '[data-testid="badge"]',
  progress: '[data-testid="progress"]',
};

/**
 * Clear all localStorage data
 * Must be called after page.goto() when a page context exists
 */
export async function clearLocalStorage(page: Page) {
  await page.evaluate(() => {
    try {
      localStorage.clear();
    } catch (e) {
      // localStorage may not be available in all contexts
      console.warn('Could not clear localStorage:', e);
    }
  });
}

/**
 * Seed localStorage with test data
 */
export async function seedTestData(page: Page, data: Record<string, any>) {
  await page.evaluate((data) => {
    Object.entries(data).forEach(([key, value]) => {
      localStorage.setItem(key, JSON.stringify(value));
    });
  }, data);
}

/**
 * Wait for app to be fully loaded
 */
export async function waitForAppLoad(page: Page) {
  await page.waitForSelector('#root', { state: 'attached' });
  await page.waitForLoadState('networkidle');
}

/**
 * Navigate to lobby screen
 */
export async function navigateToLobby(page: Page) {
  await page.goto('/');
  await waitForAppLoad(page);
  await expect(page.locator(SELECTORS.lobbyTitle)).toBeVisible();
}

/**
 * Select a race by index
 */
export async function selectRace(page: Page, index: number = 0) {
  const raceCards = page.locator(SELECTORS.raceCard);
  await raceCards.nth(index).click();
  await page.waitForSelector(SELECTORS.formTitle, { timeout: 5000 });
  await expect(page.locator(SELECTORS.formTitle)).toBeVisible();
}

/**
 * Start the race from race screen
 */
export async function startRace(page: Page) {
  await page.click(SELECTORS.raceStartRaceButton);
  await expect(page.locator(SELECTORS.racingIndicator)).toBeVisible({ timeout: 5000 });
}

/**
 * Wait for race to complete
 */
export async function waitForRaceCompletion(page: Page, timeout: number = 60000) {
  await expect(page.locator(SELECTORS.finishedBadge)).toBeVisible({ timeout });
}

/**
 * Get current screen
 */
export async function getCurrentScreen(page: Page): Promise<string> {
  const url = page.url();
  if (url.includes('lobby')) return 'lobby';
  if (url.includes('form')) return 'form';
  if (url.includes('race')) return 'race';
  if (url.includes('results')) return 'results';
  return 'unknown';
}

/**
 * Get horse count from current race
 */
export async function getHorseCount(page: Page): Promise<number> {
  const horses = page.locator(SELECTORS.horseCard);
  return await horses.count();
}

/**
 * Get race progress value
 */
export async function getRaceProgress(page: Page): Promise<number> {
  const progress = page.locator(SELECTORS.progressBar);
  const value = await progress.getAttribute('aria-valuenow');
  return value ? parseFloat(value) : 0;
}

/**
 * Mock race data for testing
 */
export const mockRaceData = {
  id: 'test-race-001',
  horses: [
    {
      id: 'horse-1',
      name: 'Test Horse 1',
      color: '#8B4513',
      topSpeed: 85,
      acceleration: 80,
      stamina: 90,
      consistency: 85,
      trackPreference: 'firm',
      weatherModifier: 1.0,
      raceHistory: [],
      winRate: 0,
      totalRaces: 0,
      spriteConfig: { width: 80, height: 60, color: '#8B4513' },
    },
    {
      id: 'horse-2',
      name: 'Test Horse 2',
      color: '#000000',
      topSpeed: 90,
      acceleration: 85,
      stamina: 75,
      consistency: 80,
      trackPreference: 'soft',
      weatherModifier: 0.95,
      raceHistory: [],
      winRate: 0,
      totalRaces: 0,
      spriteConfig: { width: 80, height: 60, color: '#000000' },
    },
  ],
  trackSurface: 'firm',
  weather: 'clear',
  distance: 1200,
  status: 'scheduled',
  startTime: Date.now(),
};

/**
 * Mock horse store data
 */
export const mockHorseStore = {
  horses: Array.from({ length: 20 }, (_, i) => ({
    id: `horse-${i}`,
    name: `Test Horse ${i + 1}`,
    color: '#8B4513',
    topSpeed: 70 + Math.floor(Math.random() * 30),
    acceleration: 70 + Math.floor(Math.random() * 30),
    stamina: 70 + Math.floor(Math.random() * 30),
    consistency: 70 + Math.floor(Math.random() * 30),
    trackPreference: ['firm', 'soft', 'heavy'][Math.floor(Math.random() * 3)] as any,
    weatherModifier: 0.9 + Math.random() * 0.2,
    raceHistory: [],
    winRate: 0,
    totalRaces: 0,
    spriteConfig: { width: 80, height: 60, color: '#8B4513' },
  })),
};

/**
 * Take screenshot on failure
 */
export async function takeScreenshotOnFailure(page: Page, testName: string) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await page.screenshot({
    path: `test-results/screenshots/${testName}-${timestamp}.png`,
    fullPage: true,
  });
}

/**
 * Get wallet balance
 */
export async function getWalletBalance(page: Page): Promise<number> {
  const balanceText = await page.locator('text=Balance:').textContent();
  const match = balanceText?.match(/[\d,]+/);
  return match ? parseInt(match[0].replace(/,/g, '')) : 0;
}
