import { Page, expect } from '@playwright/test';
import { SELECTORS, clearLocalStorage, waitForAppLoad } from '../test-utils';

/**
 * Page object for the Lobby screen
 * Encapsulates all interactions and assertions for the lobby
 */
export class LobbyPage {
  constructor(private page: Page) {}

  /**
   * Navigate to lobby
   */
  async goto() {
    await this.page.goto('/');
    await waitForAppLoad(this.page);
    await this.assertIsVisible();
  }

  /**
   * Assert that lobby is visible
   */
  async assertIsVisible() {
    await expect(this.page.locator(SELECTORS.lobbyTitle)).toBeVisible();
    await expect(this.page.locator('text=Upcoming Races')).toBeVisible();
  }

  /**
   * Get race cards count
   */
  async getRaceCount(): Promise<number> {
    const raceCards = this.page.locator(SELECTORS.raceCard);
    return await raceCards.count();
  }

  /**
   * Select a race by index
   */
  async selectRace(index: number = 0) {
    const raceCards = this.page.locator(SELECTORS.raceCard);
    const count = await raceCards.count();
    
    if (index >= count) {
      throw new Error(`Race index ${index} out of bounds. Only ${count} races available.`);
    }
    
    const raceCard = raceCards.nth(index);
    await raceCard.waitFor({ state: 'attached', timeout: 5000 });
    await raceCard.click();
  }

  /**
   * Get race details by index
   */
  async getRaceDetails(index: number = 0) {
    const raceCard = this.page.locator(SELECTORS.raceCard).nth(index);
    
    const raceId = await raceCard.getAttribute('data-race-id');
    const text = await raceCard.textContent();
    
    return {
      id: raceId,
      text: text || '',
    };
  }

  /**
   * Assert live indicator is visible
   */
  async assertLiveIndicatorVisible() {
    await expect(this.page.locator(SELECTORS.liveIndicator)).toBeVisible();
    await expect(this.page.locator('text=Live')).toBeVisible();
  }

  /**
   * Assert no races available
   */
  async assertNoRacesAvailable() {
    await expect(this.page.locator('text=Loading races...')).toBeVisible();
  }

  /**
   * Clear local storage and reload
   */
  async reset() {
    await clearLocalStorage(this.page);
    await this.page.reload();
    await waitForAppLoad(this.page);
  }

  /**
   * Take screenshot
   */
  async screenshot(name: string) {
    await this.page.screenshot({ path: `test-results/screenshots/lobby-${name}.png` });
  }
}
