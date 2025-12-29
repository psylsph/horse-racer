# Turf Sprint 🏇

A browser-based, 2D side-scrolling horse racing game with an integrated betting simulation.

## Features

- 🎮 **Real-time Race Simulation**: Physics-lite engine with stochastic variance
- 💰 **Betting System**: Win, Place, Show, and Exacta bets with dynamic odds
- 🏆 **Virtual Economy**: Wallet management with daily rewards and leaderboards
- 🎨 **Avant-Garde UI**: Modern, minimal design with smooth animations
- 📱 **Responsive**: Works on desktop and mobile

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Game Engine**: PixiJS v8
- **Styling**: Tailwind CSS v3
- **State Management**: Zustand
- **Build Tool**: Vite 5
- **Deployment**: Netlify

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Install Playwright browsers (required for testing)
npm run test:install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development

The development server will start at `http://localhost:3000`

## Testing

This project uses Playwright for end-to-end testing.

### Running Tests

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

### Test Structure

```
tests/
├── e2e/                    # End-to-end tests
│   ├── lobby.spec.ts       # Lobby screen tests
│   ├── form.spec.ts        # Form screen tests
│   ├── race.spec.ts        # Race screen tests
│   ├── results.spec.ts     # Results screen tests
│   └── full-flow.spec.ts   # Full user flow tests
├── helpers/               # Test helpers and utilities
│   ├── test-utils.ts      # Common test utilities
│   └── page-objects/     # Page object models
│       ├── LobbyPage.ts
│       ├── FormPage.ts
│       └── RacePage.ts
├── global-setup.ts        # Global test setup
└── global-teardown.ts     # Global test teardown
```

### Test Coverage

The test suite covers:
- **Lobby Screen**: Race card rendering, navigation, race selection
- **Form Screen**: Horse stats display, odds calculation, race details
- **Race Screen**: Race simulation, progress tracking, race completion
- **Results Screen**: Results display
- **Full Flow**: Complete user journeys from lobby to results
- **Responsive Design**: Testing across different viewport sizes
- **Accessibility**: ARIA attributes and semantic HTML
- **State Management**: localStorage persistence and state transitions

### Writing New Tests

1. Create a new test file in `tests/e2e/`
2. Import test utilities from `../helpers/test-utils`
3. Use page objects from `../helpers/page-objects/`
4. Follow the existing test patterns and naming conventions

Example:

```typescript
import { test, expect } from '@playwright/test';
import { clearLocalStorage, waitForAppLoad } from '../helpers/test-utils';

test('should do something', async ({ page }) => {
  await clearLocalStorage(page);
  await page.goto('/');
  await waitForAppLoad(page);
  
  // Your test assertions here
});
```

### Debugging Tests

- Use `npm run test:debug` to run tests with Playwright's inspector
- Use `npm run test:ui` to run tests with a visual interface
- Check `test-results/` for screenshots and videos of failed tests
- View the HTML report with `npm run test:report`

## Project Structure

```
src/
├── components/          # React components
│   ├── ui/           # Reusable UI components
│   ├── game/         # Game-related components
│   ├── lobby/        # Lobby screen components
│   ├── betting/      # Betting system components
│   ├── results/      # Results screen components
│   └── wallet/       # Wallet components
├── game/             # Game engine
│   ├── engine/       # Race simulation logic
│   ├── entities/     # Game entities (horses, track)
│   ├── rendering/    # PixiJS rendering
│   └── audio/       # Sound management
├── stores/           # Zustand state management
│   ├── gameStore.ts
│   ├── bettingStore.ts
│   ├── walletStore.ts
│   └── horseStore.ts
├── utils/            # Utility functions
│   ├── localStorage.ts
│   ├── oddsCalculator.ts
│   └── raceScheduler.ts
├── types/            # TypeScript types
│   └── index.ts
├── hooks/            # Custom React hooks
├── App.tsx
└── main.tsx
```

## Game Mechanics

### Horse Stats

- **Top Speed**: Maximum velocity on straightaways
- **Acceleration**: How quickly the horse reaches top speed
- **Stamina**: Affects the "fade" factor in the final 25% of the track
- **Consistency**: Reduces the range of random variance in performance

### Race Conditions

- **Track Surface**: Firm, Soft, or Heavy
- **Weather**: Clear, Rain, or Muddy

### Bet Types

- **Win**: Horse must finish 1st
- **Place**: Horse must finish 1st or 2nd
- **Show**: Horse must finish 1st, 2nd, or 3rd
- **Exacta**: Predict 1st and 2nd place in exact order

## Economy

- Starting Balance: 1,000 credits
- Daily Reward: 500 credits (every 24 hours)
- Streak Bonus: +50 credits per consecutive day (max +350)
- Minimum Bet: 10 credits
- Maximum Bet: 10,000 credits

## License

MIT License - feel free to use this project for learning or as a base for your own projects.

## Disclaimer

This game uses virtual currency only. No real-money gambling is involved.
