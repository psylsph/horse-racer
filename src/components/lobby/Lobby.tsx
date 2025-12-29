import { useEffect, useState } from 'react';
import { Race } from '@/types';
import { useGameStore } from '@/stores/gameStore';
import { useHorseStore } from '@/stores/horseStore';
import { generateUpcomingRaces } from '@/utils/raceScheduler';
import { RaceCard } from './RaceCard';

export function Lobby() {
  const { setCurrentScreen, setCurrentRace } = useGameStore();
  const { getRaceHorses } = useHorseStore();
  const [races, setRaces] = useState<Race[]>([]);

  useEffect(() => {
    const horses = getRaceHorses(20);
    const upcomingRaces = generateUpcomingRaces(horses, 5);
    setRaces(upcomingRaces);
  }, [getRaceHorses]);

  const handleSelectRace = (race: Race) => {
    setCurrentRace(race);
    setCurrentScreen('form');
  };

  return (
    <div data-testid="lobby-container" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 data-testid="lobby-title" className="font-display text-3xl font-bold text-white">
            Upcoming Races
          </h2>
          <p className="text-slate-400 mt-1">
            Select a race to view horses and place bets
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="animate-pulse-slow">
            <div className="w-2 h-2 rounded-full bg-turf-500" />
          </div>
          <span className="text-sm text-slate-400">Live</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {races.map((race) => (
          <RaceCard
            key={race.id}
            race={race}
            onSelect={handleSelectRace}
          />
        ))}
      </div>

      {races.length === 0 && (
        <div className="text-center py-20">
          <p className="text-slate-400 text-lg">
            Loading races...
          </p>
        </div>
      )}
    </div>
  );
}
