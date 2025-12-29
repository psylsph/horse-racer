# Playwright Test Fixes - Executive Summary

## Current State

Your Turf Sprint horse racing game has a comprehensive Playwright test suite with 5 test files covering:
- Lobby screen (13 tests)
- Form screen (17 tests)
- Race screen (19 tests)
- Results screen (8 tests)
- Full user flow (9 tests)

**Total: 66 tests**

## Problems Found

### Critical Issues (Must Fix)
1. **Selector Mismatches**: Tests use hardcoded text selectors that don't match actual component text
   - Example: Tests look for "Start Race" but button says "Start Race 🏁"
   - Example: Tests look for "Back" but button says "← Back to Lobby"

2. **Missing data-testid Attributes**: Critical interactive elements lack test IDs
   - Back buttons in Form and RaceView
   - Main app containers (header, main, footer)
   - Lobby container

3. **Flaky Selectors**: Using text-based selectors with emojis and special characters
   - `button:has-text("Start Race 🏁")`
   - `button:has-text("← Back")`

### Moderate Issues
4. **Missing Page Objects**: No ResultsPage page object exists
5. **Limited Test Coverage**: No accessibility, visual regression, or performance tests
6. **Edge Cases**: No tests for error scenarios or unusual conditions

## Proposed Solution

### Phase 1: Fix Core Issues (Foundation)
1. Update [`test-utils.ts`](../tests/helpers/test-utils.ts) with correct selectors
2. Add data-testid attributes to:
   - [`App.tsx`](../src/App.tsx) - header, main, footer
   - [`Lobby.tsx`](../src/components/lobby/Lobby.tsx) - container, title
   - [`Form.tsx`](../src/components/form/Form.tsx) - back button
   - [`RaceView.tsx`](../src/components/race/RaceView.tsx) - back button
3. Create [`ResultsPage.ts`](../tests/helpers/page-objects/ResultsPage.ts) page object

### Phase 2: Update Existing Tests
4. Fix all selector issues in:
   - [`lobby.spec.ts`](../tests/e2e/lobby.spec.ts)
   - [`form.spec.ts`](../tests/e2e/form.spec.ts)
   - [`race.spec.ts`](../tests/e2e/race.spec.ts)
   - [`full-flow.spec.ts`](../tests/e2e/full-flow.spec.ts)

### Phase 3: Add New Test Coverage
5. Create [`accessibility.spec.ts`](../tests/e2e/accessibility.spec.ts) - WCAG compliance
6. Create [`visual-regression.spec.ts`](../tests/e2e/visual-regression.spec.ts) - screenshot tests
7. Create [`performance.spec.ts`](../tests/e2e/performance.spec.ts) - load times, animations
8. Create [`edge-cases.spec.ts`](../tests/e2e/edge-cases.spec.ts) - error scenarios

### Phase 4: Documentation
9. Create testing guidelines document
10. Update README with test instructions

## Expected Outcome

After implementation:
- ✅ All 66 existing tests pass reliably
- ✅ 30+ new tests added (accessibility, visual regression, performance, edge cases)
- ✅ 90%+ test coverage across all screens
- ✅ Consistent, maintainable test code using data-testid selectors
- ✅ Comprehensive documentation for running and maintaining tests

## Selector Changes Summary

| Old Selector | New Selector | Location |
|--------------|---------------|----------|
| `button:has-text("Start Race")` | `[data-testid="start-race-button"]` | Form.tsx |
| `button:has-text("Back")` | `[data-testid="back-button"]` | Form.tsx, RaceView.tsx |
| `button:has-text("Start Race 🏁")` | `[data-testid="start-race-button"]` | Form.tsx |
| `button:has-text("← Back")` | `[data-testid="back-button"]` | RaceView.tsx |

## New Test Files

### accessibility.spec.ts (15 tests)
- Heading hierarchy
- ARIA labels
- Keyboard navigation
- Focus management
- Screen reader compatibility

### visual-regression.spec.ts (12 tests)
- Screenshot all screens
- Compare against baselines
- Test responsive layouts

### performance.spec.ts (8 tests)
- Page load times
- Navigation performance
- Memory leak detection
- Animation performance

### edge-cases.spec.ts (10 tests)
- No races available
- Corrupted data
- Rapid switching
- Race interruption
- Browser refresh during race

## Implementation Priority

**High Priority** (Fixes existing broken tests):
1. Update test-utils.ts selectors
2. Add data-testid attributes
3. Fix existing test files

**Medium Priority** (Improves coverage):
4. Create ResultsPage page object
5. Create new test files

**Low Priority** (Documentation):
6. Create testing guidelines

## Files to Modify

### Existing Files (9)
- tests/helpers/test-utils.ts
- src/App.tsx
- src/components/lobby/Lobby.tsx
- src/components/form/Form.tsx
- src/components/race/RaceView.tsx
- tests/e2e/lobby.spec.ts
- tests/e2e/form.spec.ts
- tests/e2e/race.spec.ts
- tests/e2e/full-flow.spec.ts

### New Files (5)
- tests/helpers/page-objects/ResultsPage.ts
- tests/e2e/accessibility.spec.ts
- tests/e2e/visual-regression.spec.ts
- tests/e2e/performance.spec.ts
- tests/e2e/edge-cases.spec.ts

## Next Steps

Review this plan and approve to proceed with implementation. The work will be done in phases, with each phase tested before moving to the next.

**Total Changes**: 9 file modifications + 5 new files = 14 files total

Would you like me to proceed with the implementation?
