import { create } from 'zustand';
import { Bet, BetType, Race, ValidationResult, ECONOMY_CONFIG } from '@/types';
import { betsStorage } from '@/utils/localStorage';

interface BettingState {
  // Current bets
  currentBets: Bet[];

  // Add bet
  addBet: (bet: Omit<Bet, 'id' | 'placedAt'>) => void;

  // Remove bet
  removeBet: (betId: string) => void;

  // Clear all bets
  clearBets: () => void;

  // Validate bet
  validateBet: (bet: Omit<Bet, 'id' | 'placedAt'>, balance: number) => ValidationResult;

  // Calculate potential payout
  calculatePotentialPayout: (betType: BetType, odds: number, amount: number) => number;

  // Update bet status after race
  updateBetStatuses: (raceResults: Race['results']) => void;

  // Get total stake
  getTotalStake: () => number;

  // Get total potential payout
  getTotalPotentialPayout: () => number;
}

export const useBettingStore = create<BettingState>((set, get) => ({
  currentBets: [],

  addBet: (betData) => {
    const bet: Bet = {
      ...betData,
      id: `bet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      placedAt: Date.now(),
    };

    set((state) => ({
      currentBets: [...state.currentBets, bet],
    }));

    // Persist to localStorage
    betsStorage.add(bet);
  },

  removeBet: (betId) => {
    set((state) => ({
      currentBets: state.currentBets.filter((bet) => bet.id !== betId),
    }));
  },

  clearBets: () => {
    set({ currentBets: [] });
  },

  validateBet: (bet, balance) => {
    if (balance < bet.amount) {
      return { valid: false, error: 'Insufficient balance' };
    }

    if (bet.amount < ECONOMY_CONFIG.MIN_BET) {
      return {
        valid: false,
        error: `Minimum bet is ${ECONOMY_CONFIG.MIN_BET} credits`
      };
    }

    if (bet.amount > ECONOMY_CONFIG.MAX_BET) {
      return {
        valid: false,
        error: `Maximum bet is ${ECONOMY_CONFIG.MAX_BET} credits`
      };
    }

    return { valid: true };
  },

  calculatePotentialPayout: (betType, odds, amount) => {
    switch (betType) {
      case 'win':
        return odds * amount;
      case 'place':
        return (odds * 0.5) * amount;
      case 'show':
        return (odds * 0.25) * amount;
      case 'exacta':
        return (odds * 0.1) * amount;
      default:
        return 0;
    }
  },

  updateBetStatuses: (raceResults) => {
    const { currentBets } = get();

    const updatedBets = currentBets.map((bet) => {
      let won = false;

      switch (bet.type) {
        case 'win':
          won = (raceResults?.[0]?.horseId === bet.horseIds[0]) || false;
          break;
        case 'place':
          won = (raceResults?.slice(0, 2).some((r) => r.horseId === bet.horseIds[0])) || false;
          break;
        case 'show':
          won = (raceResults?.slice(0, 3).some((r) => r.horseId === bet.horseIds[0])) || false;
          break;
        case 'exacta':
          won = (
            raceResults?.[0]?.horseId === bet.horseIds[0] &&
            raceResults?.[1]?.horseId === bet.horseIds[1]
          ) || false;
          break;
      }

      return {
        ...bet,
        status: (won ? 'won' : 'lost') as 'won' | 'lost',
      };
    });

    set({ currentBets: updatedBets });

    // Update each bet in storage
    updatedBets.forEach((bet) => {
      betsStorage.update(bet.id, { status: bet.status as 'won' | 'lost' | 'pending' });
    });
  },

  getTotalStake: () => {
    return get().currentBets.reduce((total, bet) => total + bet.amount, 0);
  },

  getTotalPotentialPayout: () => {
    return get().currentBets.reduce(
      (total, bet) => total + bet.potentialPayout,
      0
    );
  },
}));
