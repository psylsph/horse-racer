# Turf Sprint - Qwen Code Context

## Project Overview

Turf Sprint is a browser-based, 2D side-scrolling horse racing game with an integrated betting simulation. It's built as a client-side only React application using TypeScript, with PixiJS for game rendering, Zustand for state management, and Tailwind CSS for styling. The project is designed to be deployed to Netlify with zero backend infrastructure.

### Key Features
- Real-time race simulation with physics-lite engine and stochastic variance
- Betting system with Win, Place, Show, and Exacta bets with dynamic odds
- Virtual economy with wallet management, daily rewards, and leaderboards
- Modern, minimal UI with smooth animations
- Responsive design that works on desktop and mobile

### Tech Stack
- **Frontend**: React 18 + TypeScript
- **Game Engine**: PixiJS v8
- **Styling**: Tailwind CSS v3
- **State Management**: Zustand
- **Build Tool**: Vite 5
- **Deployment**: Netlify

## Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── game/           # Game-related components
│   ├── lobby/          # Lobby screen components
│   ├── betting/        # Betting system components
│   ├── results/        # Results screen components
│   └── wallet/         # Wallet components
├── game/               # Game engine
│   ├── engine/         # Race simulation logic
│   ├── entities/       # Game entities (horses, track)
│   ├── rendering/      # PixiJS rendering
│   └── audio/          # Sound management
├── stores/             # Zustand state management
│   ├── gameStore.ts
│   ├── bettingStore.ts
│   ├── walletStore.ts
│   └── horseStore.ts
├── utils/              # Utility functions
│   ├── localStorage.ts
│   ├── oddsCalculator.ts
│   └── raceScheduler.ts
├── types/              # TypeScript types
│   └── index.ts
├── hooks/              # Custom React hooks
├── App.tsx
└── main.tsx
```

## Building and Running

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation and Development Commands
```bash
# Install dependencies
npm install

# Start development server (runs on http://localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Configuration Files
- `vite.config.ts`: Vite configuration with React plugin and path aliases
- `tsconfig.json`: TypeScript configuration with path mapping (`@/*` → `./src/*`)
- `tailwind.config.js`: Tailwind CSS configuration with custom colors (turf, gold, crimson) and animations
- `package.json`: Dependencies and scripts

## Core Data Models

### Horse Model
```typescript
interface Horse {
  id: string;
  name: string;
  color: string;
  // Base Stats (0-100)
  topSpeed: number;        // Maximum velocity
  acceleration: number;    // Time to reach top speed
  stamina: number;         // Resistance to fatigue
  consistency: number;     // Reduces variance
  // Performance modifiers
  trackPreference: 'firm' | 'soft' | 'heavy';
  weatherModifier: number;
  // Historical data
  raceHistory: RaceResult[];
  winRate: number;
  totalRaces: number;
  // Visual config
  spriteConfig: SpriteConfig;
}
```

### Race Model
```typescript
interface Race {
  id: string;
  horses: Horse[];
  trackSurface: 'firm' | 'soft' | 'heavy';
  weather: 'clear' | 'rain' | 'muddy';
  distance: number; // in meters
  status: 'scheduled' | 'in-progress' | 'completed';
  startTime: number;
  results?: RaceResult[];
}
```

### Bet Model
```typescript
type BetType = 'win' | 'place' | 'show' | 'exacta';

interface Bet {
  id: string;
  raceId: string;
  type: BetType;
  horseIds: string[]; // 1 for win/place/show, 2 for exacta
  amount: number;
  potentialPayout: number;
  status: 'pending' | 'won' | 'lost';
  placedAt: number;
}
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

## Economy System

### Virtual Currency
- Starting Balance: 1,000 credits
- Daily Reward: 500 credits (every 24 hours)
- Streak Bonus: +50 credits per consecutive day (max +350)
- Minimum Bet: 10 credits
- Maximum Bet: 10,000 credits

### Wallet Model
```typescript
interface Wallet {
  balance: number;
  totalDeposited: number;
  totalWinnings: number;
  totalLosses: number;
  currentStreak: number;
  bestStreak: number;
  lastDailyReward: number | null;
}
```

## State Management

The application uses Zustand for state management with multiple stores:
- `gameStore.ts`: Manages current screen, race, selected horse, betting slip state
- `bettingStore.ts`: Handles betting logic
- `walletStore.ts`: Manages economy and transactions
- `horseStore.ts`: Stores horse data

## Game Flow

The application has multiple screens that users navigate through:
1. **Lobby**: Shows upcoming races and allows access to betting
2. **Form View**: Displays horse stats and race information
3. **Race View**: Shows the live race simulation
4. **Results**: Displays race results and betting outcomes
5. **Photo Finish**: Shows detailed finish results

## Development Conventions

### File Naming
- React components use PascalCase (e.g., `Lobby.tsx`, `RaceView.tsx`)
- Utility functions use camelCase (e.g., `oddsCalculator.ts`)
- Type definitions use PascalCase (e.g., `index.ts`)

### Path Aliases
- Uses `@/*` to reference `./src/*` for cleaner imports

### Styling
- Uses Tailwind CSS utility classes
- Custom color palette with turf, gold, and crimson variants
- Responsive design with mobile-first approach
- Custom animations defined in tailwind.config.js

### Architecture Principles
1. **Single Source of Truth**: Zustand store manages all application state
2. **Event-Driven**: Game engine emits events that update React state
3. **Persistence**: localStorage saves wallet, bet history, and horse statistics
4. **Separation of Concerns**: Game logic (PixiJS) separate from UI (React)

## Race Simulation Algorithm

The race simulation uses a simplified physics model:
- Position updates based on base velocity × surface modifier × weather modifier × stamina_factor
- Stochastic variance algorithm reduces randomness based on horse consistency
- Stamina fade mechanic affects performance in the final 25% of the race

## Betting System

Dynamic odds are calculated based on:
1. Historical win rate (weight: 40%)
2. Current stats vs. field average (weight: 35%)
3. Track/weather conditions (weight: 25%)

Payouts vary by bet type:
- Win: odds × stake
- Place: (odds × 0.5) × stake
- Show: (odds × 0.25) × stake
- Exacta: (odds1 × odds2 × 0.1) × stake

## Important Notes

- This is a virtual currency game with no real-money gambling
- All game logic runs client-side for simplicity
- Data is persisted using localStorage
- The game requires WebGL 2.0 support for the PixiJS rendering engine