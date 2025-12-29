import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Horse } from '@/types';
import { horsesStorage } from '@/utils/localStorage';

interface HorseState {
  horses: Horse[];
  
  // Add horse
  addHorse: (horse: Horse) => void;
  
  // Update horse
  updateHorse: (horseId: string, updates: Partial<Horse>) => void;
  
  // Get horse by ID
  getHorseById: (horseId: string) => Horse | undefined;
  
  // Get horses for race
  getRaceHorses: (count: number) => Horse[];
  
  // Update horse stats after race
  updateHorseStats: (horseId: string, position: number) => void;
  
  // Reset horses
  reset: () => void;
}

export const useHorseStore = create<HorseState>()(
  persist(
    (set, get) => ({
      horses: [],

      addHorse: (horse) => {
        set((state) => ({
          horses: [...state.horses, horse],
        }));
        
        horsesStorage.set(get().horses);
      },

      updateHorse: (horseId, updates) => {
        set((state) => ({
          horses: state.horses.map((horse) =>
            horse.id === horseId ? { ...horse, ...updates } : horse
          ),
        }));
        
        horsesStorage.update(horseId, updates);
      },

      getHorseById: (horseId) => {
        return get().horses.find((horse) => horse.id === horseId);
      },

      getRaceHorses: (count) => {
        const state = get();
        
        // If we don't have enough horses, generate new ones
        if (state.horses.length < count) {
          const needed = count - state.horses.length;
          const newHorses = generateHorses(needed);
          
          set((prevState) => ({
            horses: [...prevState.horses, ...newHorses],
          }));
          
          horsesStorage.set([...state.horses, ...newHorses]);
          
          return [...state.horses, ...newHorses].slice(0, count);
        }
        
        // Shuffle and return first count horses
        const shuffled = [...state.horses].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
      },

      updateHorseStats: (horseId, position) => {
        const horse = get().getHorseById(horseId);
        if (!horse) return;
        
        const newRaceResult = {
          horseId,
          position,
          time: Math.random() * 10 + 50, // Random time between 50-60 seconds
          finalSpeed: horse.topSpeed * (1 - (position - 1) * 0.05),
        };
        
        const newRaceHistory = [...horse.raceHistory, newRaceResult];
        const newTotalRaces = horse.totalRaces + 1;
        const wins = newRaceHistory.filter((r) => r.position === 1).length;
        const newWinRate = wins / newTotalRaces;
        
        get().updateHorse(horseId, {
          raceHistory: newRaceHistory,
          totalRaces: newTotalRaces,
          winRate: newWinRate,
        });
      },

      reset: () => {
        set({ horses: [] });
        horsesStorage.clear();
      },
    }),
    {
      name: 'turf-sprint-horses',
    }
  )
);

// Helper function to generate random horses
function generateHorses(count: number): Horse[] {
  const horseNames = [
    'Thunder Strike', 'Midnight Star', 'Golden Dash', 'Silver Bullet',
    'Storm Runner', 'Lightning Bolt', 'Fire Storm', 'Wind Walker',
    'Shadow Dancer', 'Sun Chaser', 'Moon Walker', 'Crystal Clear',
    'Diamond Dust', 'Emerald Blaze', 'Ruby Red', 'Sapphire Sky',
    'Amber Glow', 'Topaz Trail', 'Pearl Flash', 'Jade Jumper',
  ];
  
  const colors = [
    '#8B4513', '#000000', '#FFFFFF', '#808080', '#D2691E',
    '#F5DEB3', '#A0522D', '#696969', '#2F4F4F', '#8B0000',
  ];
  
  const trackPreferences: Array<'firm' | 'soft' | 'heavy'> = ['firm', 'soft', 'heavy'];
  
  const horses: Horse[] = [];
  
  for (let i = 0; i < count; i++) {
    const nameIndex = Math.floor(Math.random() * horseNames.length);
    const name = `${horseNames[nameIndex]} ${Math.floor(Math.random() * 100)}`;
    horseNames.splice(nameIndex, 1);
    
    horses.push({
      id: `horse-${Date.now()}-${i}`,
      name,
      color: colors[Math.floor(Math.random() * colors.length)],
      topSpeed: Math.floor(Math.random() * 30) + 70, // 70-100
      acceleration: Math.floor(Math.random() * 30) + 70, // 70-100
      stamina: Math.floor(Math.random() * 30) + 70, // 70-100
      consistency: Math.floor(Math.random() * 30) + 70, // 70-100
      trackPreference: trackPreferences[Math.floor(Math.random() * trackPreferences.length)],
      weatherModifier: Math.random() * 0.2 + 0.9, // 0.9-1.1
      raceHistory: [],
      winRate: 0,
      totalRaces: 0,
      spriteConfig: {
        width: 80,
        height: 60,
        color: colors[Math.floor(Math.random() * colors.length)],
      },
    });
  }
  
  return horses;
}
