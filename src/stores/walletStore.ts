import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Wallet, Transaction, ECONOMY_CONFIG } from '@/types';
import { walletStorage } from '@/utils/localStorage';

interface WalletState extends Wallet {
  // Update balance
  updateBalance: (amount: number) => void;
  
  // Claim daily reward
  claimDailyReward: () => { success: boolean; message: string };
  
  // Check if daily reward is available
  canClaimDailyReward: () => boolean;
  
  // Get time until next reward
  getTimeUntilNextReward: () => number;
  
  // Update streak
  updateStreak: (won: boolean) => void;
  
  // Add transaction
  addTransaction: (transaction: Omit<Transaction, 'id' | 'timestamp'>) => void;
  
  // Reset wallet
  reset: () => void;
}

const initialWallet: Wallet = {
  balance: ECONOMY_CONFIG.STARTING_BALANCE,
  totalDeposited: ECONOMY_CONFIG.STARTING_BALANCE,
  totalWinnings: 0,
  totalLosses: 0,
  currentStreak: 0,
  bestStreak: 0,
  lastDailyReward: null,
};

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      ...initialWallet,

      updateBalance: (amount) => {
        const state = get();
        const newBalance = state.balance + amount;
        
        set({
          balance: newBalance,
          totalWinnings: amount > 0 ? state.totalWinnings + amount : state.totalWinnings,
          totalLosses: amount < 0 ? state.totalLosses + Math.abs(amount) : state.totalLosses,
        });
        
        // Persist to localStorage
        walletStorage.updateBalance(amount);
      },

      claimDailyReward: () => {
        const state = get();
        const now = Date.now();
        
        if (!state.canClaimDailyReward()) {
          const timeLeft = state.getTimeUntilNextReward();
          const hours = Math.floor(timeLeft / (1000 * 60 * 60));
          const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
          return {
            success: false,
            message: `Daily reward available in ${hours}h ${minutes}m`,
          };
        }
        
        // Calculate streak bonus
        let reward = ECONOMY_CONFIG.DAILY_REWARD;
        const lastClaim = state.lastDailyReward;
        
        if (lastClaim) {
          const daysSinceLastClaim = Math.floor(
            (now - lastClaim) / (1000 * 60 * 60 * 24)
          );
          
          if (daysSinceLastClaim <= 2) {
            // Streak bonus: +50 credits per consecutive day (max 7 days = +350)
            const streakBonus = Math.min(state.currentStreak + 1, 7) * 50;
            reward += streakBonus;
          }
        }
        
        set({
          balance: state.balance + reward,
          totalWinnings: state.totalWinnings + reward,
          currentStreak: state.currentStreak + 1,
          bestStreak: Math.max(state.bestStreak, state.currentStreak + 1),
          lastDailyReward: now,
        });
        
        // Persist to localStorage
        walletStorage.updateBalance(reward);
        walletStorage.updateStreak(true);
        
        return {
          success: true,
          message: `Claimed ${reward} credits!`,
        };
      },

      canClaimDailyReward: () => {
        const state = get();
        if (!state.lastDailyReward) return true;
        
        const now = Date.now();
        const timeSinceLastClaim = now - state.lastDailyReward;
        
        return timeSinceLastClaim >= ECONOMY_CONFIG.DAILY_REWARD_COOLDOWN;
      },

      getTimeUntilNextReward: () => {
        const state = get();
        if (!state.lastDailyReward) return 0;
        
        const now = Date.now();
        const timeSinceLastClaim = now - state.lastDailyReward;
        const timeUntilReward = ECONOMY_CONFIG.DAILY_REWARD_COOLDOWN - timeSinceLastClaim;
        
        return Math.max(0, timeUntilReward);
      },

      updateStreak: (won) => {
        const state = get();
        const newStreak = won ? state.currentStreak + 1 : 0;
        
        set({
          currentStreak: newStreak,
          bestStreak: Math.max(state.bestStreak, newStreak),
        });
        
        // Persist to localStorage
        walletStorage.updateStreak(won);
      },

      addTransaction: (transactionData) => {
        const transaction: Transaction = {
          ...transactionData,
          id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
        };
        
        // Note: In a full implementation, we'd store transactions separately
        // For now, we're just updating the wallet balance
        if (transaction.type === 'win') {
          get().updateBalance(transaction.amount);
        } else if (transaction.type === 'loss') {
          get().updateBalance(-transaction.amount);
        }
      },

      reset: () => {
        set(initialWallet);
        walletStorage.set(initialWallet);
      },
    }),
    {
      name: 'turf-sprint-wallet',
    }
  )
);
