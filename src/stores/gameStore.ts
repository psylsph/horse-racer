import { create } from 'zustand';
import { GameScreen, Race, Horse } from '@/types';

interface GameState {
  // Current screen
  currentScreen: GameScreen;
  setCurrentScreen: (screen: GameScreen) => void;
  
  // Current race
  currentRace: Race | null;
  setCurrentRace: (race: Race | null) => void;
  
  // Selected horse
  selectedHorse: Horse | null;
  setSelectedHorse: (horse: Horse | null) => void;
  
  // Betting slip
  isBettingSlipOpen: boolean;
  toggleBettingSlip: () => void;
  openBettingSlip: () => void;
  closeBettingSlip: () => void;
  
  // Race progress
  raceProgress: number;
  setRaceProgress: (progress: number) => void;
  
  // Reset
  reset: () => void;
}

const initialState = {
  currentScreen: 'lobby' as GameScreen,
  currentRace: null,
  selectedHorse: null,
  isBettingSlipOpen: false,
  raceProgress: 0,
};

export const useGameStore = create<GameState>((set) => ({
  ...initialState,

  setCurrentScreen: (screen) => set({ currentScreen: screen }),

  setCurrentRace: (race) => set({ currentRace: race }),

  setSelectedHorse: (horse) => set({ selectedHorse: horse }),

  toggleBettingSlip: () => set((state) => ({ isBettingSlipOpen: !state.isBettingSlipOpen })),

  openBettingSlip: () => set({ isBettingSlipOpen: true }),

  closeBettingSlip: () => set({ isBettingSlipOpen: false }),

  setRaceProgress: (progress) => set({ raceProgress: progress }),

  reset: () => set(initialState),
}));
