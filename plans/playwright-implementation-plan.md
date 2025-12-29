# Playwright Test Implementation Plan

## Overview
This plan details the steps needed to fix existing Playwright tests and add new test coverage for the Turf Sprint horse racing game.

## Phase 1: Fix Core Issues

### 1.1 Update test-utils.ts
**File**: `tests/helpers/test-utils.ts`

**Changes**:
- Update SELECTORS object with correct selectors
- Fix getRaceProgress() to properly read aria-valuenow
- Add new selectors for better testability

```typescript
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
  startRaceButton: '[data-testid="start-race-button"]',
  backButton: '[data-testid="back-button"]',
  
  // Race selectors
  raceTitle: 'h2:has-text("Race #")',
  startButton: 'button:has-text("Start Race")',
  racingIndicator: 'text=Racing...',
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
```

### 1.2 Add data-testid to Components

#### App.tsx
```tsx
<header data-testid="app-header" className="...">
<main data-testid="app-main" className="...">
<footer data-testid="app-footer" className="...">
```

#### Lobby.tsx
```tsx
<div data-testid="lobby-container" className="...">
<h2 data-testid="lobby-title" className="...">
```

#### Form.tsx
```tsx
<Button variant="secondary" onClick={handleBack} data-testid="back-button">
```

#### RaceView.tsx
```tsx
<Button variant="secondary" onClick={handleBack} data-testid="back-button">
```

## Phase 2: Create New Page Objects

### 2.1 ResultsPage.ts
**File**: `tests/helpers/page-objects/ResultsPage.ts`

**Features**:
- Assert results screen is visible
- Get results title
- Get race results
- Navigate back to lobby
- Take screenshots

```typescript
export class ResultsPage {
  constructor(private page: Page) {}

  async assertIsVisible() {
    await expect(this.page.locator(SELECTORS.resultsTitle)).toBeVisible();
  }

  async getResultsTitle(): Promise<string | null> {
    return await this.page.locator(SELECTORS.resultsTitle).textContent();
  }

  async clickBack() {
    await this.page.click(SELECTORS.backButton);
  }

  async screenshot(name: string) {
    await this.page.screenshot({ path: `test-results/screenshots/results-${name}.png`, fullPage: true });
  }
}
```

## Phase 3: Update Existing Test Files

### 3.1 lobby.spec.ts
**Changes**:
- Update selectors to use data-testid where available
- Fix any hardcoded text selectors
- Improve test reliability

### 3.2 form.spec.ts
**Changes**:
- Fix backButton selector to use data-testid
- Update startRaceButton selector
- Ensure all assertions use consistent selectors

### 3.3 race.spec.ts
**Changes**:
- Fix backButton selector
- Fix startRaceButton selector
- Update race completion checks

### 3.4 full-flow.spec.ts
**Changes**:
- Replace all hardcoded text selectors with data-testid selectors
- Fix emoji and arrow character selectors
- Improve test reliability

## Phase 4: Create New Test Files

### 4.1 accessibility.spec.ts
**Purpose**: Test accessibility features and compliance

**Tests**:
- Check for proper heading hierarchy
- Verify ARIA labels on interactive elements
- Test keyboard navigation
- Verify color contrast (visual check)
- Check for proper alt text on images
- Verify focus management
- Test screen reader compatibility

### 4.2 visual-regression.spec.ts
**Purpose**: Ensure UI consistency across changes

**Tests**:
- Screenshot lobby screen
- Screenshot form screen
- Screenshot race screen
- Screenshot results screen
- Compare against baseline images
- Test responsive layouts (desktop, tablet, mobile)

### 4.3 performance.spec.ts
**Purpose**: Ensure application performance meets expectations

**Tests**:
- Measure initial page load time
- Measure navigation time between screens
- Check for memory leaks
- Verify race animation performance
- Test with slow network conditions

### 4.4 edge-cases.spec.ts
**Purpose**: Test unusual scenarios and error conditions

**Tests**:
- Test with no races available
- Test with corrupted localStorage data
- Test race with all horses having same stats
- Test rapid screen switching
- Test race interruption
- Test browser refresh during race
- Test with very large horse names
- Test with extreme stat values (0, 100)

## Phase 5: Documentation

### 5.1 Testing Guidelines
**File**: `docs/testing-guidelines.md`

**Contents**:
- Test naming conventions
- Selector best practices
- When to use page objects vs direct selectors
- How to write maintainable tests
- Debugging failed tests
- Running tests locally
- CI/CD integration

## Implementation Order

1. **Week 1: Core Fixes**
   - Update test-utils.ts
   - Add data-testid attributes to components
   - Create ResultsPage page object

2. **Week 2: Test Updates**
   - Update lobby.spec.ts
   - Update form.spec.ts
   - Update race.spec.ts
   - Update full-flow.spec.ts

3. **Week 3: New Tests**
   - Create accessibility.spec.ts
   - Create visual-regression.spec.ts
   - Create performance.spec.ts
   - Create edge-cases.spec.ts

4. **Week 4: Documentation & Polish**
   - Create testing guidelines
   - Update README with test instructions
   - Fix any remaining issues
   - Ensure all tests pass

## Test Coverage Goals

| Feature | Current Coverage | Target Coverage |
|---------|-----------------|-----------------|
| Lobby Screen | 80% | 95% |
| Form Screen | 75% | 95% |
| Race Screen | 70% | 95% |
| Results Screen | 20% | 80% |
| Accessibility | 10% | 90% |
| Performance | 0% | 70% |
| Edge Cases | 5% | 80% |

## Success Criteria

- All existing tests pass with 100% reliability
- New tests provide comprehensive coverage
- Tests run in under 5 minutes total
- Visual regression tests have baseline images
- Documentation is complete and clear
- CI/CD integration works correctly

## Risk Mitigation

1. **Flaky Tests**: Use proper waiting strategies and avoid hardcoded timeouts
2. **Selector Fragility**: Use data-testid attributes for critical elements
3. **Test Maintenance**: Keep tests DRY and use page objects
4. **Performance**: Run tests in parallel and optimize where possible
5. **Browser Compatibility**: Test on all configured browsers

## Tools and Dependencies

- Playwright: ^1.57.0 (already installed)
- @axe-core/playwright: for accessibility testing (add if needed)
- No additional dependencies required for basic implementation

## Notes

- All tests should be run before merging to main branch
- Visual regression tests should be reviewed manually
- Performance tests should establish baselines for comparison
- Accessibility tests should follow WCAG 2.1 AA guidelines
