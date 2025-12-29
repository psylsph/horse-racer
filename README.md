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

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development

The development server will start at `http://localhost:3000`

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
