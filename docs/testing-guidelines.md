# Playwright Testing Guidelines

## Overview

This document provides comprehensive guidelines for writing, maintaining, and running Playwright tests for the Turf Sprint horse racing game.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Test Structure](#test-structure)
- [Writing Tests](#writing-tests)
- [Best Practices](#best-practices)
- [Selectors](#selectors)
- [Page Objects](#page-objects)
- [Running Tests](#running-tests)
- [Debugging](#debugging)
- [CI/CD Integration](#cicd-integration)

## Prerequisites

### Required Tools
- Node.js 18+ and npm
- Playwright: `npm install @playwright/test`
- Browser binaries: `npm run test:install`

### Environment Setup
```bash
# Install dependencies
npm install

# Install Playwright browsers
npm run test:install

# Run all tests
npm test
```

## Test Structure

### Directory Layout
```
tests/
├── e2e/                    # End-to-end test files
│   ├── accessibility.spec.ts
│   ├── edge-cases.spec.ts
│   ├── form.spec.ts
│   ├── full-flow.spec.ts
│   ├── lobby.spec.ts
│   ├── performance.spec.ts
│   ├── race.spec.ts
│   ├── results.spec.ts
│   └── visual-regression.spec.ts
├── helpers/                  # Test utilities and page objects
│   ├── page-objects/
│   │   ├── FormPage.ts
│   │   ├── LobbyPage.ts
│   │   ├── RacePage.ts
│   │   └── ResultsPage.ts
│   └── test-utils.ts
├── global-setup.ts           # Runs once before all tests
├── global-teardown.ts        # Runs once after all tests
└── .gitignore              # Ignore test artifacts
```

### Test File Template

```typescript
import { test, expect } from '@playwright/test';
import { clearLocalStorage, waitForAppLoad } from '../helpers/test-utils';
import { PageObjectName } from '../helpers/page-objects/PageObjectName';

test.describe('Feature Name', () => {
  let pageObject: PageObjectName;

  test.beforeEach(async ({ page }) => {
    await clearLocalStorage(page);
    await page.goto('/');
    await waitForAppLoad(page);
    
    pageObject = new PageObjectName(page);
  });

  test('should do something', async ({ page }) => {
    // Arrange
    await pageObject.someAction();
    
    // Assert
    await expect(page.locator('selector')).toBeVisible();
  });

  test('should handle edge case', async ({ page }) => {
    // Test implementation
  });
});
```

## Writing Tests

### Test Naming Conventions

- Use descriptive names that explain what is being tested
- Format: `should <expected behavior>` or `should <action> when <condition>`
- Examples:
  - ✅ `should display lobby with title`
  - ✅ `should navigate to form when clicking race card`
  - ✅ `should handle race interruption`
  - ❌ `test1`, `lobby test`, `check button`

### Test Organization

Group related tests using `test.describe()`:

```typescript
test.describe('Lobby Screen', () => {
  test('should display title', async ({ page }) => { });
  test('should display race cards', async ({ page }) => { });
  test('should navigate to form', async ({ page }) => { });
});
```

### Test Structure (AAA Pattern)

Follow the Arrange-Act-Assert pattern:

```typescript
test('should navigate to form when clicking race card', async ({ page }) => {
  // Arrange - Set up the test
  await page.goto('/');
  await waitForAppLoad(page);
  
  // Act - Perform the action
  await page.locator('[data-testid="race-card"]').first().click();
  
  // Assert - Verify the result
  await expect(page.locator('h2:has-text("Race #")')).toBeVisible();
});
```

## Best Practices

### 1. Use data-testid Attributes

Always prefer `data-testid` over CSS selectors or text-based selectors:

```typescript
// ❌ Bad - Brittle, can break with text changes
await page.click('button:has-text("Start Race 🏁")');

// ❌ Bad - Can break with CSS changes
await page.click('.btn-primary');

// ✅ Good - Stable and maintainable
await page.click('[data-testid="start-race-button"]');
```

### 2. Use Page Objects

Encapsulate page interactions in page objects:

```typescript
// Instead of:
await page.click('[data-testid="race-card"]');
await page.click('[data-testid="start-race-button"]');
await page.click('[data-testid="back-button"]');

// Use:
await lobbyPage.selectRace(0);
await formPage.clickStartRace();
await racePage.clickBack();
```

### 3. Wait for Conditions

Use proper waiting strategies:

```typescript
// ❌ Bad - Fixed timeout
await page.waitForTimeout(5000);

// ✅ Good - Wait for specific condition
await expect(page.locator('[data-testid="finished-badge"]')).toBeVisible({ timeout: 60000 });

// ✅ Good - Wait for network idle
await page.waitForLoadState('networkidle');
```

### 4. Clear State Between Tests

Always start with a clean state:

```typescript
test.beforeEach(async ({ page }) => {
  await clearLocalStorage(page);
  await page.goto('/');
  await waitForAppLoad(page);
});
```

### 5. Use Descriptive Assertions

Make assertions clear and specific:

```typescript
// ❌ Vague
expect(element).toBeTruthy();

// ✅ Specific
await expect(page.locator('[data-testid="lobby-title"]')).toBeVisible();
await expect(page.locator('[data-testid="race-card"]')).toHaveCount(5);
```

### 6. Test User Flows, Not Just Components

Test complete user journeys:

```typescript
test('should complete full race flow from lobby to results', async ({ page }) => {
  // Navigate through entire user journey
  await page.locator('[data-testid="race-card"]').first().click();
  await page.click('[data-testid="start-race-button"]');
  await page.click('button:has-text("Start Race")');
  await expect(page.locator('[data-testid="finished-badge"]')).toBeVisible({ timeout: 60000 });
  await expect(page.locator('[data-testid="results-title"]')).toBeVisible();
});
```

## Selectors

### Selector Priority

1. **data-testid** (highest priority) - Most stable
2. **aria attributes** - For accessibility
3. **role** - Semantic elements
4. **text selectors** - Only when necessary
5. **CSS selectors** - Last resort

### Common Selectors

```typescript
// By test ID
page.locator('[data-testid="lobby-title"]')

// By text
page.locator('text=Upcoming Races')
page.locator('h2:has-text("Race #")')

// By role
page.locator('[role="progressbar"]')
page.locator('button')

// By attribute
page.locator('[aria-label="Close"]')

// Combined
page.locator('button:has-text("Start")')
```

### Selector Best Practices

- ✅ Use specific selectors: `[data-testid="start-race-button"]`
- ❌ Avoid overly broad: `button`, `div`
- ✅ Use text selectors sparingly: `text=Submit`
- ❌ Avoid complex CSS: `.container > .row > .col:nth-child(3) button`

## Page Objects

### Purpose

Page objects encapsulate interactions with specific pages/screens, making tests:
- More readable
- Easier to maintain
- Less brittle

### Example Page Object

```typescript
import { Page, expect } from '@playwright/test';
import { SELECTORS } from '../test-utils';

export class LobbyPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/');
    await waitForAppLoad(this.page);
    await this.assertIsVisible();
  }

  async assertIsVisible() {
    await expect(this.page.locator(SELECTORS.lobbyTitle)).toBeVisible();
  }

  async getRaceCount(): Promise<number> {
    const raceCards = this.page.locator(SELECTORS.raceCard);
    return await raceCards.count();
  }

  async selectRace(index: number = 0) {
    const raceCards = this.page.locator(SELECTORS.raceCard);
    await raceCards.nth(index).click();
  }

  async screenshot(name: string) {
    await this.page.screenshot({ 
      path: `test-results/screenshots/lobby-${name}.png` 
    });
  }
}
```

### Using Page Objects

```typescript
import { LobbyPage } from '../helpers/page-objects/LobbyPage';

test.describe('Lobby Screen', () => {
  let lobbyPage: LobbyPage;

  test.beforeEach(async ({ page }) => {
    await clearLocalStorage(page);
    lobbyPage = new LobbyPage(page);
    await lobbyPage.goto();
  });

  test('should display 5 race cards', async ({ page }) => {
    const count = await lobbyPage.getRaceCount();
    expect(count).toBe(5);
  });
});
```

## Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run tests in headed mode (show browser)
npm run test:headed

# Run tests with UI mode
npm run test:ui

# Run tests in debug mode
npm run test:debug

# View test report
npm run test:report
```

### Running Specific Tests

```bash
# Run specific test file
npx playwright test tests/e2e/lobby.spec.ts

# Run specific test
npx playwright test -g "should display lobby with title"

# Run tests matching pattern
npx playwright test -g "lobby"
```

### Running on Specific Browsers

```bash
# Run on Chrome only
npx playwright test --project=chromium

# Run on Firefox only
npx playwright test --project=firefox

# Run on Safari only
npx playwright test --project=webkit
```

### Running with Different Configurations

```bash
# Run tests in parallel (default)
npx playwright test

# Run tests serially
npx playwright test --workers=1

# Run with retries
npx playwright test --retries=3
```

## Debugging

### Debug Mode

```bash
# Run in debug mode with step-by-step execution
npm run test:debug
```

### VS Code Integration

Install the Playwright Test for VS Code extension:
1. Open Extensions panel
2. Search for "Playwright Test for VSCode"
3. Install and reload

### Debugging Tips

1. **Use screenshots on failure** - Already configured in `playwright.config.ts`
2. **Use trace viewer** - Trace files are saved in `test-results/`
3. **Add console.log** - Output appears in test results
4. **Use browser dev tools** - In headed mode, open DevTools (F12)

### Common Issues

**Test times out**
- Increase timeout: `await expect(...).toBeVisible({ timeout: 10000 })`
- Check if element exists: `await expect(locator).toBeAttached()`

**Element not found**
- Verify selector is correct
- Check if element is in DOM: `await page.locator('selector').count()`
- Wait for element: `await page.waitForSelector('selector')`

**Flaky tests**
- Use proper waiting strategies
- Clear state between tests
- Avoid fixed timeouts when possible

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Playwright Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

### Environment Variables

```bash
# Set test environment
NODE_ENV=test

# Run in CI mode (no retries, single worker)
CI=true
```

## Test Coverage

### Current Coverage

| Screen | Tests | Coverage |
|--------|--------|-----------|
| Lobby | 13 | 95% |
| Form | 17 | 95% |
| Race | 19 | 95% |
| Results | 8 | 80% |
| Accessibility | 14 | 90% |
| Visual Regression | 14 | 85% |
| Performance | 10 | 70% |
| Edge Cases | 12 | 80% |

### Coverage Goals

- **Critical paths**: 100% coverage
- **Happy paths**: 95%+ coverage
- **Error paths**: 80%+ coverage
- **Edge cases**: 70%+ coverage

## Maintenance

### Updating Tests

When changing UI:
1. Update `data-testid` attributes in components
2. Update page objects if needed
3. Run affected tests
4. Fix any failing tests

### Adding New Features

1. Write tests first (TDD approach)
2. Implement feature
3. Run tests
4. Refactor as needed

### Removing Deprecated Tests

1. Check if test is still relevant
2. Update or remove if no longer needed
3. Update documentation

## Resources

### Official Documentation
- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-playwright)

### Internal Resources
- [Playwright Test Fixes](../plans/playwright-test-fixes.md)
- [Implementation Plan](../plans/playwright-implementation-plan.md)
- [Test Summary](../plans/playwright-test-summary.md)

## Troubleshooting

### Common Errors

**Error: Test timeout of 30000ms exceeded**
- Increase timeout in test or config
- Check if element is actually present
- Verify network requests are completing

**Error: Target closed**
- Page was closed during test
- Check for navigation or reload in test

**Error: Selector not found**
- Verify selector syntax
- Check if element is rendered
- Use DevTools to inspect element

### Getting Help

1. Check this documentation
2. Review similar tests in codebase
3. Check Playwright documentation
4. Ask in team channel or create issue

## Checklist for New Tests

Before submitting a new test:

- [ ] Test follows naming convention
- [ ] Test uses data-testid selectors
- [ ] Test clears state in beforeEach
- [ ] Test has descriptive assertions
- [ ] Test handles timeouts appropriately
- [ ] Test is not flaky (runs multiple times)
- [ ] Page object is used if applicable
- [ ] Test is documented with comments
- [ ] Test runs locally successfully
- [ ] Test runs in CI successfully

## Version History

- v1.0 (2025-12-29) - Initial guidelines document
