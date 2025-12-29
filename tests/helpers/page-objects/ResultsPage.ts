import { Page, expect } from '@playwright/test';
import { SELECTORS } from '../test-utils';

/**
 * Page object for the Results screen
 * Encapsulates all interactions and assertions for the results view
 */
export class ResultsPage {
  constructor(private page: Page) {}

  /**
   * Assert that results screen is visible
   */
  async assertIsVisible() {
    await expect(this.page.locator(SELECTORS.resultsTitle)).toBeVisible();
  }

  /**
   * Get results title
   */
  async getResultsTitle(): Promise<string | null> {
    return await this.page.locator(SELECTORS.resultsTitle).textContent();
  }

  /**
   * Assert coming soon message is visible
   */
  async assertComingSoonVisible() {
    await expect(this.page.locator('text=Coming soon...')).toBeVisible();
  }

  /**
   * Click back button to return to lobby
   */
  async clickBack() {
    await this.page.click(SELECTORS.backButton);
  }

  /**
   * Navigate back to lobby
   */
  async navigateToLobby() {
    await this.clickBack();
    await expect(this.page.locator(SELECTORS.lobbyTitle)).toBeVisible();
  }

  /**
   * Take screenshot
   */
  async screenshot(name: string) {
    await this.page.screenshot({ path: `test-results/screenshots/results-${name}.png`, fullPage: true });
  }

  /**
   * Assert results screen has proper heading structure
   */
  async assertHeadingStructure() {
    const heading = this.page.locator(SELECTORS.resultsTitle);
    await expect(heading).toBeVisible();
    
    const text = await heading.textContent();
    expect(text).toContain('Results');
  }

  /**
   * Assert results screen is accessible
   */
  async assertAccessibility() {
    // Check that results heading is present
    await expect(this.page.locator(SELECTORS.resultsTitle)).toBeVisible();
    
    // Check for proper landmarks
    await expect(this.page.locator(SELECTORS.main)).toBeVisible();
    await expect(this.page.locator(SELECTORS.header)).toBeVisible();
    await expect(this.page.locator(SELECTORS.footer)).toBeVisible();
  }

  /**
   * Assert results content is centered
   */
  async assertCenteredContent() {
    const resultsContainer = this.page.locator('.text-center');
    await expect(resultsContainer).toBeVisible();
  }
}
