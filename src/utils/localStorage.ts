import { Wallet, UserProgress, Bet, Horse } from '@/types';

const STORAGE_KEYS = {
  WALLET: 'turf-sprint-wallet',
  USER_PROGRESS: 'turf-sprint-progress',
  BETS: 'turf-sprint-bets',
  HORSES: 'turf-sprint-horses',
} as const;

// Generic storage helpers
export const storage = {
  get<T>(key: string, defaultValue: T): T {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error);
      return defaultValue;
    }
  },

  set<T>(key: string, value: T): void {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error);
    }
  },

  remove(key: string): void {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from localStorage key "${key}":`, error);
    }
  },

  clear(): void {
    try {
      window.localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  },
};

// Wallet storage
export const walletStorage = {
  get(): Wallet {
    return storage.get<Wallet>(STORAGE_KEYS.WALLET, {
      balance: 1000,
      totalDeposited: 1000,
      totalWinnings: 0,
      totalLosses: 0,
      currentStreak: 0,
      bestStreak: 0,
      lastDailyReward: null,
    });
  },

  set(wallet: Wallet): void {
    storage.set(STORAGE_KEYS.WALLET, wallet);
  },

  updateBalance(amount: number): Wallet {
    const wallet = this.get();
    wallet.balance += amount;

    if (amount > 0) {
      wallet.totalWinnings += amount;
    } else {
      wallet.totalLosses += Math.abs(amount);
    }

    this.set(wallet);
    return wallet;
  },

  updateStreak(won: boolean): Wallet {
    const wallet = this.get();

    if (won) {
      wallet.currentStreak += 1;
      if (wallet.currentStreak > wallet.bestStreak) {
        wallet.bestStreak = wallet.currentStreak;
      }
    } else {
      wallet.currentStreak = 0;
    }

    this.set(wallet);
    return wallet;
  },
};

// User progress storage
export const progressStorage = {
  get(): UserProgress {
    return storage.get<UserProgress>(STORAGE_KEYS.USER_PROGRESS, {
      level: 1,
      experience: 0,
      achievements: [],
      statistics: {
        totalBets: 0,
        winRate: 0,
        profit: 0,
        favoriteBetType: 'win',
        racesWatched: 0,
      },
    });
  },

  set(progress: UserProgress): void {
    storage.set(STORAGE_KEYS.USER_PROGRESS, progress);
  },

  addExperience(amount: number): UserProgress {
    const progress = this.get();
    progress.experience += amount;

    // Level up every 1000 experience
    const newLevel = Math.floor(progress.experience / 1000) + 1;
    if (newLevel > progress.level) {
      progress.level = newLevel;
    }

    this.set(progress);
    return progress;
  },

  updateStatistics(win: boolean, profit: number): UserProgress {
    const progress = this.get();
    progress.statistics.totalBets += 1;
    progress.statistics.profit += profit;

    // Update win rate
    const wins = progress.statistics.winRate * (progress.statistics.totalBets - 1) + (win ? 1 : 0);
    progress.statistics.winRate = wins / progress.statistics.totalBets;

    this.set(progress);
    return progress;
  },
};

// Bets storage
export const betsStorage = {
  get(): Bet[] {
    return storage.get<Bet[]>(STORAGE_KEYS.BETS, []);
  },

  set(bets: Bet[]): void {
    storage.set(STORAGE_KEYS.BETS, bets);
  },

  add(bet: Bet): void {
    const bets = this.get();
    bets.push(bet);
    this.set(bets);
  },

  update(betId: string, updates: Partial<Bet>): void {
    const bets = this.get();
    const index = bets.findIndex(b => b.id === betId);
    if (index !== -1) {
      bets[index] = { ...bets[index], ...updates };
      this.set(bets);
    }
  },

  clear(): void {
    storage.remove(STORAGE_KEYS.BETS);
  },
};

// Horses storage
export const horsesStorage = {
  get(): Horse[] {
    return storage.get<Horse[]>(STORAGE_KEYS.HORSES, []);
  },

  set(horses: Horse[]): void {
    storage.set(STORAGE_KEYS.HORSES, horses);
  },

  update(horseId: string, updates: Partial<Horse>): void {
    const horses = this.get();
    const index = horses.findIndex(h => h.id === horseId);
    if (index !== -1) {
      horses[index] = { ...horses[index], ...updates };
      this.set(horses);
    }
  },

  clear(): void {
    storage.remove(STORAGE_KEYS.HORSES);
  },
};

// Export all storage keys for reference
export { STORAGE_KEYS };
