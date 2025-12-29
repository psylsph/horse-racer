import { Page, expect } from '@playwright/test';
import { SELECTORS } from '../test-utils';

/**
 * Page object for the Form (race details) screen
 * Encapsulates all interactions and assertions for the form
 */
export class FormPage {
  constructor(private page: Page) {}

  /**
   * Assert that form is visible
   */
  async assertIsVisible() {
    await expect(this.page.locator(SELECTORS.formTitle)).toBeVisible();
  }

  /**
   * Get race ID from title
   */
  async getRaceId(): Promise<string | null> {
    const title = await this.page.locator(SELECTORS.formTitle).textContent();
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
   * Get horse count
   */
  async getHorseCount(): Promise<number> {
    const horseCards = this.page.locator(SELECTORS.horseCard);
    return await horseCards.count();
  }

  /**
   * Get horse details by index
   */
  async getHorseDetails(index: number) {
    const horseCard = this.page.locator(SELECTORS.horseCard).nth(index);
    
    const name = await horseCard.locator(SELECTORS.horseName).textContent();
    const odds = await horseCard.locator(SELECTORS.oddsBadge).textContent();
    const races = await horseCard.locator('text=races').textContent();
    const winRate = await horseCard.locator('text=% win rate').textContent();
    
    return {
      name: name || '',
      odds: odds || '',
      races: races || '',
      winRate: winRate || '',
    };
  }

  /**
   * Get horse stats by index
   */
  async getHorseStats(index: number) {
    const horseCard = this.page.locator(SELECTORS.horseCard).nth(index);
    const stats = horseCard.locator(SELECTORS.horseStats);
    
    const statLabels = await stats.locator('span:first-child').allTextContents();
    const statValues = await stats.locator('span:last-child').allTextContents();
    
    return {
      speed: statValues[0] || '0',
      acceleration: statValues[1] || '0',
      stamina: statValues[2] || '0',
      consistency: statValues[3] || '0',
    };
  }

  /**
   * Assert horse has valid stats
   */
  async assertHorseStatsValid(index: number) {
    const stats = await this.getHorseStats(index);
    
    expect(parseInt(stats.speed)).toBeGreaterThanOrEqual(0);
    expect(parseInt(stats.speed)).toBeLessThanOrEqual(100);
    expect(parseInt(stats.acceleration)).toBeGreaterThanOrEqual(0);
    expect(parseInt(stats.acceleration)).toBeLessThanOrEqual(100);
    expect(parseInt(stats.stamina)).toBeGreaterThanOrEqual(0);
    expect(parseInt(stats.stamina)).toBeLessThanOrEqual(100);
    expect(parseInt(stats.consistency)).toBeGreaterThanOrEqual(0);
    expect(parseInt(stats.consistency)).toBeLessThanOrEqual(100);
  }

  /**
   * Click start race button
   */
  async clickStartRace() {
    await this.page.click(SELECTORS.formStartRaceButton);
  }

  /**
   * Click back button
   */
  async clickBack() {
    await this.page.click(SELECTORS.backButton);
  }

  /**
   * Assert start race button is visible
   */
  async assertStartRaceButtonVisible() {
    await expect(this.page.locator(SELECTORS.formStartRaceButton)).toBeVisible();
  }

  /**
   * Assert back button is visible
   */
  async assertBackButtonVisible() {
    await expect(this.page.locator(SELECTORS.backButton)).toBeVisible();
  }

  /**
   * Take screenshot
   */
  async screenshot(name: string) {
    await this.page.screenshot({ path: `test-results/screenshots/form-${name}.png`, fullPage: true });
  }
}
