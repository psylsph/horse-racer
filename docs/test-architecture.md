# Test Architecture Documentation

## Test File Structure

```
tests/
├── e2e/
│   ├── accessibility.spec.ts       # Accessibility and ARIA tests
│   ├── edge-cases.spec.ts         # Edge case and error handling
│   ├── form.spec.ts              # Form (race details) screen tests
│   ├── full-flow.spec.ts          # Complete user journey tests
│   ├── lobby.spec.ts             # Lobby screen tests
│   ├── performance.spec.ts        # Performance and load time tests
│   ├── race.spec.ts              # Race screen tests
│   ├── race-engine.spec.ts        # Race engine functionality tests
│   ├── results.spec.ts           # Results screen tests
│   └── visual-regression.spec.ts # Visual regression tests
├── helpers/
│   ├── test-utils.ts             # Shared test utilities and SELECTORS
│   └── page-objects/
│       ├── FormPage.ts           # Form screen page object
│       ├── LobbyPage.ts          # Lobby screen page object
│       ├── RacePage.ts           # Race screen page object
│       └── ResultsPage.ts        # Results screen page object
├── global-setup.ts               # Test suite setup
└── global-teardown.ts           # Test suite cleanup
```

## Page Object Pattern

All screen interactions are encapsulated in Page Objects for maintainability and reusability.

### Benefits
- **Encapsulation**: Hide implementation details
- **Reusability**: Share actions across tests
- **Maintainability**: Update selectors in one place
- **Readability**: Tests read like user actions

### Example: LobbyPage

```typescript
export class LobbyPage {
  constructor(private page: Page) {}

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

  async assertIsVisible() {
    await expect(this.page.locator(SELECTORS.lobbyTitle)).toBeVisible();
  }
}
```

## Selector Strategy

### Priority Order
1. **data-testid attributes** - Most reliable, intent-based
2. **ARIA roles** - Accessibility-first
3. **Semantic HTML** - Standard tags (h1, button, etc.)
4. **Text selectors** - Last resort, only for labels

### SELECTORS Object

```typescript
export const SELECTORS = {
  // Use data-testid for interactive elements
  startButton: '[data-testid="start-race-button"]',
  backButton: '[data-testid="back-button"]',
  
  // Use ARIA for progress and feedback
  progressBar: '[role="progressbar"]',
  finishedBadge: '[data-testid="finished-badge"]',
  
  // Use semantic HTML for structure
  raceTitle: 'h2:has-text("Race #")',
  appHeader: '[data-testid="app-header"]',
};
```

### Adding data-testid

Always add `data-testid` attributes to interactive elements:

```tsx
<Button 
  variant="primary" 
  onClick={handleStartRace} 
  data-testid="start-race-button"
>
  Start Race
</Button>

<div 
  className="racing-indicator"
  data-testid="racing-indicator"
>
  Racing...
</div>
```

## Test Organization

### Test Suite Structure

```typescript
test.describe('Feature Name', () => {
  let pageObject: PageObjectType;

  test.beforeEach(async ({ page, context }) => {
    // Setup
    await context.clearCookies();
    await page.goto('/');
    await waitForAppLoad(page);
    pageObject = new PageObjectType(page);
  });

  test('should do X', async ({ page }) => {
    // Arrange
    // Act
    // Assert
  });

  test.afterEach(async ({ page }) => {
    // Cleanup
  });
});
```

### Test Categories

1. **Happy Path** - Normal user flows
2. **Error Cases** - Invalid inputs, edge cases
3. **Accessibility** - ARIA, keyboard navigation
4. **Performance** - Load times, responsiveness
5. **Visual** - Screenshot comparisons
6. **State Management** - Persistence, reloads

## Best Practices

### 1. Explicit Waits

Always wait for elements before interacting:

```typescript
// Good
await page.waitForSelector(SELECTORS.startButton, { timeout: 5000 });
await page.click(SELECTORS.startButton);

// Bad
await page.click(SELECTORS.startButton); // Might fail if not ready
```

### 2. Navigation Waits

Wait for screen transitions:

```typescript
await page.click('[data-testid="race-card"]');
await page.waitForSelector(SELECTORS.formTitle, { timeout: 5000 });
await expect(page.locator(SELECTORS.formTitle)).toBeVisible();
```

### 3. Assertions

Be specific with assertions:

```typescript
// Good
await expect(page.locator(SELECTORS.finishedBadge)).toBeVisible({ timeout: 60000 });
await expect(page.locator(SELECTORS.startButton)).not.toBeVisible();

// Bad
await page.waitForTimeout(60000); // Unreliable
```

### 4. Test Isolation

Each test should be independent:

```typescript
test.beforeEach(async ({ context }) => {
  await context.clearCookies();
  await clearLocalStorage(page);
});
```

### 5. Descriptive Test Names

Use "should" pattern:

```typescript
// Good
test('should navigate to race when clicking start button', async ({ page }) => {
});

// Bad
test('navigation', async ({ page }) => {
});
```

## State Management Testing

### Persistence Tests

Verify state is maintained across reloads:

```typescript
test('should persist race selection', async ({ page }) => {
  const raceId = await page.locator('h2').textContent();
  
  await page.reload();
  await waitForAppLoad(page);
  
  const newRaceId = await page.locator('h2').textContent();
  expect(raceId).toBe(newRaceId);
});
```

### Race Completion Tests

Test full race lifecycle:

```typescript
test('should complete race and show results', async ({ page }) => {
  // Navigate to race
  await page.click('[data-testid="start-race-button"]');
  await page.waitForSelector(SELECTORS.raceButton, { timeout: 5000 });
  
  // Start race
  await page.click(SELECTORS.raceButton);
  
  // Wait for completion
  await expect(page.locator(SELECTORS.finishedBadge)).toBeVisible({ timeout: 60000 });
  
  // Wait for navigation
  await page.waitForTimeout(3000);
  
  // Verify results
  await expect(page.locator('[data-testid="results-title"]')).toBeVisible();
});
```

## Async Race Handling

Races are asynchronous and need careful waiting:

### 1. Wait for Race Screen

```typescript
await page.click('[data-testid="start-race-button"]');
await page.waitForSelector('[data-testid="race-view"]', { timeout: 5000 });
```

### 2. Wait for Race Start

```typescript
await page.click('[data-testid="start-race-button"]');
await expect(page.locator('[data-testid="racing-indicator"]')).toBeVisible({ timeout: 5000 });
```

### 3. Wait for Completion

```typescript
await expect(page.locator('[data-testid="finished-badge"]')).toBeVisible({ timeout: 60000 });
```

### 4. Wait for Results Navigation

```typescript
// RaceView has 2-second delay before navigation
await page.waitForTimeout(3000);
await expect(page.locator('[data-testid="results-title"]')).toBeVisible();
```

## Race Speed for Testing

For faster tests, adjust race engine speed:

```typescript
// In RaceEngine.ts
const distancePerFrame = velocity * 0.003; // 3x faster than 0.001
```

This allows tests to complete in ~15-20 seconds instead of ~60 seconds.

## Debugging Tests

### Run Specific Test

```bash
npm test -- --grep "should complete race"
```

### Run with UI

```bash
npm run test:ui
```

### Debug Mode

```bash
npm run test:debug
```

### Headed Mode

```bash
npm run test:headed
```

## Coverage Goals

### Lobby
- ✅ Display races
- ✅ Select race
- ✅ Live indicator
- ✅ Responsive layout

### Form
- ✅ Display horse details
- ✅ Navigate to race
- ✅ Navigate back
- ✅ Horse stats

### Race
- ✅ Start race
- ✅ Show progress
- ✅ Complete race
- ✅ Navigate to results
- ✅ Back button

### Results
- ⏳ Display winners
- ⏳ Race statistics
- ⏳ Navigation

## Troubleshooting

### Common Issues

1. **Element not found**
   - Add `waitForSelector()` before interaction
   - Check data-testid exists in component

2. **Test timeout**
   - Increase timeout for async operations
   - Check race completion speed
   - Verify navigation completes

3. **Flaky tests**
   - Add proper waits for state changes
   - Check test isolation (clear storage)
   - Verify element stability

4. **Wrong element clicked**
   - Use specific data-testid selectors
   - Check for duplicate elements
   - Use nth() to target specific instances

## Running Tests

### All Tests

```bash
npm test
```

### Specific File

```bash
npm test race.spec.ts
```

### With Coverage

```bash
npm test -- --coverage
```

### CI/CD

```bash
# Run tests in CI (with retries)
CI=true npm test
```

## Continuous Improvement

### Test Metrics
- Pass rate
- Average execution time
- Flakiness rate
- Coverage percentage

### Maintenance
- Update selectors when components change
- Add tests for new features
- Remove tests for deprecated features
- Refactor common patterns into utilities
