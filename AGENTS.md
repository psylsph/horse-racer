# AGENTS.md

## Project Overview
Browser-based 2D horse racing game with betting simulation. React 18 + TypeScript + PixiJS v8, built with Vite, deployed to Netlify (client-side only).

**Tech Stack:** React 18, TypeScript, PixiJS v8, Tailwind CSS v3, Zustand, Vite 5, Playwright (E2E) + Vitest (Unit)

## Essential Commands

### Development
```bash
npm install              # Install dependencies
npm run dev             # Start dev server (http://localhost:3000)
npm run build           # Build for production (runs tsc + vite build)
npm run preview         # Preview production build
npm run lint            # Run ESLint (max 0 warnings)
```

### Testing
```bash
npm test                # Run all Playwright E2E tests
npm run test:install    # Install Playwright browsers
npm run test:headed     # Run tests with visible browser
npm run test:ui         # Run tests with Playwright UI
npm run test:debug      # Run tests in debug mode
npm run test:report     # View test HTML report
npm run test:unit       # Run Vitest unit tests
npm run test:unit:ui   # Run unit tests with UI
npm run test:unit:run   # Run unit tests once
```

### Running Specific Tests
```bash
npx playwright test tests/e2e/lobby.spec.ts          # Specific file
npx playwright test -g "should display lobby"         # By test name
npx playwright test --project=chromium               # Specific browser
npx playwright test --workers=1                      # Serial execution
```

## Code Conventions

### File Naming
- **Components:** PascalCase.tsx (e.g., `Lobby.tsx`, `RaceView.tsx`)
- **Utilities:** camelCase.ts (e.g., `oddsCalculator.ts`, `raceScheduler.ts`)
- **Stores:** camelCase.ts (e.g., `gameStore.ts`, `horseStore.ts`)
- **Test files:** `.spec.ts` for E2E, `.test.ts` for unit tests

### Import Aliases
Use `@/*` path alias for all imports:
```typescript
import { Race } from '@/types';
import { useGameStore } from '@/stores/gameStore';
import { Button } from '@/components/ui/Button';
```

### Component Patterns
- Functional components with hooks only
- Destructure props in function signature
- Add `data-testid` attributes to interactive elements (required for testing)
- Use named exports for components
- Props interface defined before component

```typescript
interface Props {
  title: string;
  onAction: () => void;
}

export function MyComponent({ title, onAction }: Props) {
  const { someState, setState } = useGameStore();

  return (
    <div data-testid="my-component" className="...">
      <Button data-testid="action-button" onClick={onAction}>
        {title}
      </Button>
    </div>
  );
}
```

### State Management (Zustand)
```typescript
interface StoreState {
  value: Type;
  setValue: (value: Type) => void;
  reset: () => void;
}

export const useStore = create<StoreState>((set) => ({
  value: initialValue,
  setValue: (value) => set({ value }),
  reset: () => set(initialState),
}));
```

**Key stores:** `gameStore` (screen navigation), `horseStore` (horse data), `bettingStore` (betting logic), `walletStore` (economy)

### TypeScript
- Strict mode enabled (noUnusedLocals, noUnusedParameters, noFallthroughCasesInSwitch)
- Define types in `src/types/index.ts`
- Use explicit return types for functions
- Prefer interfaces for objects, type aliases for unions/primitives

### Styling (Tailwind CSS)
- Custom colors: `turf-*`, `gold-*`, `crimson-*`
- Mobile-first responsive design
- Custom animations: `animate-pulse-slow`, `animate-slide-in`, `animate-fade-in`, `animate-scale-in`
- Use clsx for conditional classes: `clsx('base-class', condition && 'conditional-class')`

### Error Handling
- Validate user input in stores before state updates
- Try-catch around localStorage operations
- Provide user-friendly error messages in UI
- Never expose sensitive data in errors

## Testing Guidelines

### Critical: Always Use data-testid
All interactive elements must have `data-testid` attributes for reliable Playwright testing. Use kebab-case naming:
- `start-race-button`, `lobby-title`, `race-card`, `finished-badge`, `racing-indicator`

```tsx
<Button data-testid="start-race-button" onClick={handleStart}>
  Start Race
</Button>
```

### Test Structure (AAA Pattern)
```typescript
test('should navigate to form when clicking race card', async ({ page }) => {
  // Arrange
  await page.goto('/');
  await waitForAppLoad(page);

  // Act
  await page.locator('[data-testid="race-card"]').first().click();

  // Assert
  await expect(page.locator('h2:has-text("Race #")')).toBeVisible();
});
```

### Test Utilities
Import from `tests/helpers/test-utils.ts`:
```typescript
import {
  clearLocalStorage,
  waitForAppLoad,
  SELECTORS
} from '../helpers/test-utils';
import { LobbyPage } from '../helpers/page-objects/LobbyPage';
```

### Test Isolation
Always clear state between tests:
```typescript
test.beforeEach(async ({ page }) => {
  await clearLocalStorage(page);
  await page.goto('/');
  await waitForAppLoad(page);
});
```

### Critical: Race Testing Timing
Races are async and require long timeouts:
- Wait for race screen: `page.waitForSelector('[data-testid="race-view"]', { timeout: 5000 })`
- Wait for racing indicator: `expect(page.locator('[data-testid="racing-indicator"]')).toBeVisible({ timeout: 5000 })`
- Wait for completion: `expect(page.locator('[data-testid="finished-badge"]')).toBeVisible({ timeout: 60000 })`
- Wait for results navigation: `page.waitForTimeout(3000)` (2s delay in RaceView + 1s buffer)

## Project Structure
```
src/
├── components/        # React components (ui/, lobby/, game/, form/, race/)
├── game/engine/       # RaceEngine.ts (PixiJS game engine)
├── stores/            # Zustand stores (gameStore, horseStore, bettingStore, walletStore)
├── utils/             # Utilities (localStorage, oddsCalculator, raceScheduler)
├── types/index.ts     # TypeScript type definitions
├── App.tsx            # Root component with screen routing
└── main.tsx           # Entry point
tests/
├── e2e/               # Playwright E2E tests (.spec.ts)
├── helpers/           # test-utils.ts (SELECTORS, helpers), page-objects/
└── unit/              # Vitest unit tests (.test.ts)
```

## Important Gotchas

1. **Race completion timing:** Tests wait up to 60 seconds for race completion
2. **PixiJS strict mode:** RaceCanvas handles React 18 strict mode unmounting with `isStrictModeUnmountRef`
3. **Canvas dimensions:** Must be > 0 for PixiJS initialization; validated in RaceCanvas
4. **Playwright web server:** Auto-starts Vite dev server; reuses existing instances locally
5. **Test timeouts:** Increase for race operations (default 5000ms is too short)
6. **localStorage persistence:** Always clear between tests; horses, wallet, and bets persist

## Running Tests After Changes
1. Run linter: `npm run lint`
2. Run affected tests: `npm test -- -g "lobby"` or `npm test tests/e2e/lobby.spec.ts`
3. Run full suite: `npm test`
4. Check report: `npm run test:report`
5. Run unit tests: `npm run test:unit`
