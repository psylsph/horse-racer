// Horse Types
export type TrackSurface = 'firm' | 'soft' | 'heavy';
export type Weather = 'clear' | 'rain' | 'muddy';

export interface Horse {
  id: string;
  name: string;
  color: string;
  // Base Stats (0-100)
  topSpeed: number;
  acceleration: number;
  stamina: number;
  consistency: number;
  
  // Performance
  trackPreference: TrackSurface;
  weatherModifier: number;
  
  // Historical
  raceHistory: RaceResult[];
  winRate: number;
  totalRaces: number;
  
  // Visual
  spriteConfig: SpriteConfig;
}

export interface SpriteConfig {
  width: number;
  height: number;
  color: string;
  pattern?: string;
}

// Race Types
export interface Race {
  id: string;
  horses: Horse[];
  trackSurface: TrackSurface;
  weather: Weather;
  distance: number;
  status: 'scheduled' | 'in-progress' | 'completed';
  startTime: number;
  results?: RaceResult[];
}

export interface RaceResult {
  horseId: string;
  position: number;
  time: number;
  finalSpeed: number;
}

export interface RaceConditions {
  trackSurface: TrackSurface;
  weather: Weather;
  distance: number;
}

// Betting Types
export type BetType = 'win' | 'place' | 'show' | 'exacta';

export interface Bet {
  id: string;
  raceId: string;
  type: BetType;
  horseIds: string[];
  amount: number;
  potentialPayout: number;
  status: 'pending' | 'won' | 'lost';
  placedAt: number;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

// Wallet Types
export interface Wallet {
  balance: number;
  totalDeposited: number;
  totalWinnings: number;
  totalLosses: number;
  currentStreak: number;
  bestStreak: number;
  lastDailyReward: number | null;
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'win' | 'loss' | 'daily_reward';
  amount: number;
  timestamp: number;
  description: string;
}

// User Progress Types
export interface UserProgress {
  level: number;
  experience: number;
  achievements: Achievement[];
  statistics: UserStatistics;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlockedAt: number;
  icon: string;
}

export interface UserStatistics {
  totalBets: number;
  winRate: number;
  profit: number;
  favoriteBetType: BetType;
  racesWatched: number;
}

// Game State Types
export type GameScreen = 'lobby' | 'form' | 'race' | 'results' | 'photo-finish';

export interface GameState {
  currentScreen: GameScreen;
  currentRace: Race | null;
  selectedHorse: Horse | null;
  isBettingSlipOpen: boolean;
}

// Leaderboard Types
export interface LeaderboardEntry {
  rank: number;
  playerName: string;
  profit: number;
  winRate: number;
  streak: number;
}

// Economy Constants
export const ECONOMY_CONFIG = {
  STARTING_BALANCE: 1000,
  DAILY_REWARD: 500,
  DAILY_REWARD_COOLDOWN: 24 * 60 * 60 * 1000, // 24 hours
  MIN_BET: 10,
  MAX_BET: 10000,
} as const;
