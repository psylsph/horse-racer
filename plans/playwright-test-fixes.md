# Playwright Test Issues and Fixes

## Problems Identified

### 1. Selector Mismatches

#### test-utils.ts Issues:
- `SELECTORS.startRaceButton` → `'button:has-text("Start Race")'`
  - **Problem**: Form.tsx button has text "Start Race 🏁" and `data-testid="start-race-button"`
  - **Fix**: Use `[data-testid="start-race-button"]` selector

- `SELECTORS.backButton` → `'button:has-text("Back")'`
  - **Problem**: Actual buttons use "← Back to Lobby" or "← Back"
  - **Fix**: Use more flexible selector or add data-testid to back buttons

- `SELECTORS.progressBar` → `'[data-testid="progress-bar"]'`
  - **Problem**: The `getRaceProgress()` function tries to read `aria-valuenow` attribute
  - **Fix**: Update function to correctly read the aria attribute

- `SELECTORS.raceCanvas` → `'[data-testid="race-canvas"]'`
  - **Problem**: The prop is passed correctly but tests might have timing issues
  - **Fix**: Ensure canvas is rendered before asserting

### 2. Missing data-testid Attributes

#### Components Missing testids:
- **Lobby.tsx**: No data-testid on main container
- **App.tsx**: No data-testid on header, main, footer
- **Form.tsx**: Back button missing data-testid
- **RaceView.tsx**: Back button missing data-testid
- **Results**: No component exists yet (placeholder only)

### 3. Test Code Issues

#### race.spec.ts:
- Line 15: `await page.click('button:has-text("Start Race 🏁")')` - hardcoded emoji selector
- Line 102: `await page.click('button:has-text("← Back")')` - hardcoded arrow selector
- Line 202: `await page.click('button:has-text("← Back")')` - inconsistent selector

#### form.spec.ts:
- Line 92: `await formPage.clickBack()` - uses SELECTORS.backButton which is incorrect

#### full-flow.spec.ts:
- Multiple instances of hardcoded text selectors with emojis and arrows

### 4. Missing Page Objects
- No `ResultsPage` page object exists
- Tests for results screen are minimal and don't use page objects

### 5. Missing Test Coverage
- No dedicated accessibility tests
- No visual regression tests
- No performance tests
- No error handling tests
- No edge case tests
- No mobile-specific tests beyond viewport changes

### 6. Component Implementation Issues

#### RaceCard.tsx:
- Button is disabled when `!isReady` - tests should verify this state

#### Form.tsx:
- Fixed bottom action bar might overlap with footer - test layout

#### RaceView.tsx:
- Progress bar uses `raceProgress * 100` but test expects 0-100 range
- RaceEngine initialization might have timing issues

## Proposed Fixes

### Phase 1: Fix Selectors and Add Test IDs
1. Update test-utils.ts SELECTORS with correct selectors
2. Add data-testid attributes to all interactive elements
3. Update all test files to use consistent selectors

### Phase 2: Create Missing Page Objects
1. Create ResultsPage page object
2. Update existing page objects if needed

### Phase 3: Add Additional Test Files
1. Create accessibility.spec.ts
2. Create visual-regression.spec.ts
3. Create performance.spec.ts
4. Create edge-cases.spec.ts

### Phase 4: Documentation
1. Create testing guidelines document
2. Update README with test instructions

## Selector Mapping

| Current Selector | Should Be | Location |
|----------------|-----------|----------|
| `button:has-text("Start Race")` | `[data-testid="start-race-button"]` | Form.tsx:118 |
| `button:has-text("Back")` | `[data-testid="back-button"]` | Form.tsx:35, RaceView.tsx:98 |
| `button:has-text("Start Race 🏁")` | `[data-testid="start-race-button"]` | Form.tsx:118 |
| `button:has-text("← Back")` | `[data-testid="back-button"]` | RaceView.tsx:98 |

## Test ID Requirements

### Lobby.tsx
```tsx
<div data-testid="lobby-container">
  <h2 data-testid="lobby-title">Upcoming Races</h2>
</div>
```

### App.tsx
```tsx
<header data-testid="app-header">
<main data-testid="app-main">
<footer data-testid="app-footer">
```

### Form.tsx
```tsx
<Button variant="secondary" onClick={handleBack} data-testid="back-button">
```

### RaceView.tsx
```tsx
<Button variant="secondary" onClick={handleBack} data-testid="back-button">
```

## Test File Structure

```
tests/
├── e2e/
│   ├── lobby.spec.ts (existing - needs fixes)
│   ├── form.spec.ts (existing - needs fixes)
│   ├── race.spec.ts (existing - needs fixes)
│   ├── results.spec.ts (existing - needs fixes)
│   ├── full-flow.spec.ts (existing - needs fixes)
│   ├── accessibility.spec.ts (new)
│   ├── visual-regression.spec.ts (new)
│   ├── performance.spec.ts (new)
│   └── edge-cases.spec.ts (new)
├── helpers/
│   ├── test-utils.ts (needs updates)
│   └── page-objects/
│       ├── LobbyPage.ts (existing)
│       ├── FormPage.ts (existing)
│       ├── RacePage.ts (existing)
│       └── ResultsPage.ts (new)
├── global-setup.ts (existing)
└── global-teardown.ts (existing)
```
