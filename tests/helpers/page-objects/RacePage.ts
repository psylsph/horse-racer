import { Page, expect } from '@playwright/test';
import { SELECTORS, getRaceProgress } from '../test-utils';

/**
 * Page object for the Race screen
 * Encapsulates all interactions and assertions for the race view
 */
export class RacePage {
  constructor(private page: Page) {}

  /**
   * Assert that race view is visible
   */
  async assertIsVisible() {
    await expect(this.page.locator(SELECTORS.raceTitle)).toBeVisible();
  }

  /**
   * Get race ID from title
   */
  async getRaceId(): Promise<string | null> {
    const title = await this.page.locator(SELECTORS.raceTitle).textContent();
    const match = title?.match(/Race #(.+)/);
    return match ? match[1] : null;
  }

  /**
   * Get race details
   */
  async getRaceDetails() {
    const titleText = await this.page.locator('h2').textContent();
    const detailsText = await this.page.locator('p.text-slate-400').textContent();
    
    return {
      title: titleText || '',
      details: detailsText || '',
    };
  }

  /**
   * Click start race button
   */
  async clickStartRace() {
    await this.page.click(SELECTORS.startButton);
  }

  /**
   * Assert start race button is visible
   */
  async assertStartRaceButtonVisible() {
    await expect(this.page.locator(SELECTORS.startButton)).toBeVisible();
  }

  /**
   * Assert start race button is hidden
   */
  async assertStartRaceButtonHidden() {
    await expect(this.page.locator(SELECTORS.startButton)).not.toBeVisible();
  }

  /**
   * Assert racing indicator is visible
   */
  async assertRacingIndicatorVisible() {
    await expect(this.page.locator(SELECTORS.racingIndicator)).toBeVisible();
  }

  /**
   * Assert finished badge is visible
   */
  async assertFinishedBadgeVisible() {
    await expect(this.page.locator(SELECTORS.finishedBadge)).toBeVisible();
  }

  /**
   * Wait for race to complete
   */
  async waitForRaceCompletion(timeout: number = 60000) {
    await expect(this.page.locator(SELECTORS.finishedBadge)).toBeVisible({ timeout });
  }

  /**
   * Get race progress
   */
  async getProgress(): Promise<number> {
    return await getRaceProgress(this.page);
  }

  /**
   * Assert progress is greater than zero
   */
  async assertProgressStarted() {
    const progress = await this.getProgress();
    expect(progress).toBeGreaterThan(0);
  }

  /**
   * Assert progress is complete
   */
  async assertProgressComplete() {
    const progress = await this.getProgress();
    expect(progress).toBeGreaterThanOrEqual(100);
  }

  /**
   * Click back button
   */
  async clickBack() {
    await this.page.click(SELECTORS.backButton);
  }

  /**
   * Assert race canvas is visible
   */
  async assertRaceCanvasVisible() {
    await expect(this.page.locator(SELECTORS.raceCanvas)).toBeVisible();
  }

  /**
   * Assert progress bar is visible
   */
  async assertProgressBarVisible() {
    await expect(this.page.locator(SELECTORS.progressBar)).toBeVisible();
  }

  /**
   * Get horse count from footer
   */
  async getHorseCount(): Promise<string | null> {
    const text = await this.page.locator('text=horses competing').textContent();
    const match = text?.match(/(\d+)\s+horses/);
    return match ? match[1] : null;
  }

  /**
   * Get track surface
   */
  async getTrackSurface(): Promise<string | null> {
    const text = await this.page.locator('text=Track:').textContent();
    const match = text?.match(/Track:\s*(\w+)/);
    return match ? match[1] : null;
  }

  /**
   * Get weather
   */
  async getWeather(): Promise<string | null> {
    const text = await this.page.locator('text=Weather:').textContent();
    const match = text?.match(/Weather:\s*(\w+)/);
    return match ? match[1] : null;
  }

  /**
   * Take screenshot
   */
  async screenshot(name: string) {
    await this.page.screenshot({ path: `test-results/screenshots/race-${name}.png`, fullPage: true });
  }
}
