import { create } from 'zustand';
import { GameScreen, Race, Horse, RaceResult } from '@/types';

interface GameState {
  // Current screen
  currentScreen: GameScreen;
  setCurrentScreen: (screen: GameScreen) => void;

  // Current race
  currentRace: Race | null;
  setCurrentRace: (race: Race | null) => void;
  updateRaceResults: (results: RaceResult[]) => void;

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

  updateRaceResults: (results) => set((state) => ({
    currentRace: state.currentRace ? { ...state.currentRace, results } : null,
  })),

  setSelectedHorse: (horse) => set({ selectedHorse: horse }),

  toggleBettingSlip: () => set((state) => ({ isBettingSlipOpen: !state.isBettingSlipOpen })),

  openBettingSlip: () => set({ isBettingSlipOpen: true }),

  closeBettingSlip: () => set({ isBettingSlipOpen: false }),

  setRaceProgress: (progress) => set({ raceProgress: progress }),

  reset: () => set(initialState),
}));
