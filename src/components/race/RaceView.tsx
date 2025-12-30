import { useEffect, useState, useRef } from 'react';
import { Race } from '@/types';
import { useGameStore } from '@/stores/gameStore';
import { useHorseStore } from '@/stores/horseStore';
import { useBettingStore } from '@/stores/bettingStore';
import { useWalletStore } from '@/stores/walletStore';
import { RaceEngine } from '@/game/engine/RaceEngine';
import { RaceCanvas } from '../game/RaceCanvas';
import { Button } from '../ui/Button';
import { Progress } from '../ui/Progress';
import { Badge } from '../ui/Badge';

interface RaceViewProps {
  race: Race;
}

export function RaceView({ race }: RaceViewProps) {
  const { setCurrentScreen, updateRaceResults } = useGameStore();
  const { updateHorseStats } = useHorseStore();
  const { settleBets } = useBettingStore();
  const { updateBalance } = useWalletStore();
  
  const [raceEngine, setRaceEngine] = useState<RaceEngine | null>(null);
  const [raceProgress, setRaceProgress] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!race) return;

    // Initialize race engine
    const engine = new RaceEngine(
      race,
      (frame) => {
        // Update race progress
        setRaceProgress(frame.positions[0]?.position || 0);
      },
      (results) => {
        // Race finished
        setIsFinished(true);
        setIsRunning(false);

        // Update horse stats
        results.forEach(result => {
          updateHorseStats(result.horseId, result.position);
        });

        // Settle bets and calculate winnings
        const bettingResult = settleBets(results);

        // Update wallet with winnings
        updateBalance(bettingResult.totalWinnings);

        // Store results in gameStore
        updateRaceResults(results);

        // Go to results after a delay
        setTimeout(() => {
          setCurrentScreen('results');
        }, 2000);
      }
    );
    
    setRaceEngine(engine);

    return () => {
      // Cleanup
    };
    }, [race, setCurrentScreen, updateHorseStats, updateRaceResults, settleBets, updateBalance]);

  const handleStartRace = () => {
    if (raceEngine && !isRunning) {
      raceEngine.start();
      setIsRunning(true);
    }
  };

  const handleBack = () => {
    if (raceEngine) {
      raceEngine.stop();
    }
    setCurrentScreen('form');
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Race Header */}
      <div className="bg-slate-900 border-b border-slate-800 p-3 md:p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl md:text-2xl font-bold text-white">
              Race #{race.id.slice(-4)}
            </h2>
            <p className="text-sm text-slate-400">
              {race.distance}m • {race.trackSurface} • {race.weather}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {!isRunning && !isFinished && (
              <Button variant="primary" onClick={handleStartRace} data-testid="race-start-race-button">
                Start Race
              </Button>
            )}
            {isRunning && (
              <div className="flex items-center gap-2 text-turf-400" data-testid="racing-indicator">
                <div className="animate-spin h-5 w-5 border-2 border-turf-400 border-t-transparent rounded-full" />
                <span>Racing...</span>
              </div>
            )}
            {isFinished && (
              <Badge variant="success" data-testid="finished-badge">Finished!</Badge>
            )}
            <Button variant="secondary" onClick={handleBack} data-testid="back-button">
              ← Back
            </Button>
          </div>
        </div>
      </div>

      {/* Race Progress Bar */}
      <div className="bg-slate-800 border-b border-slate-700 p-1.5 md:p-2">
        <div className="container mx-auto">
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400 w-16 md:w-20">Progress</span>
            <div className="flex-1">
              <Progress value={raceProgress * 100} max={100} variant="turf" showLabel data-testid="progress-bar" />
            </div>
          </div>
        </div>
      </div>

      {/* Race Canvas */}
      <div className="flex-1 relative" ref={canvasRef}>
        <RaceCanvas
          raceEngine={raceEngine}
          race={race}
          data-testid="race-canvas"
        />
      </div>

      {/* Race Info Footer */}
      <div className="bg-slate-900 border-t border-slate-800 p-2 md:p-3">
        <div className="container mx-auto flex items-center justify-between text-sm">
          <div className="text-slate-400">
            <span className="text-white">{race.horses.length}</span> horses competing
          </div>
          <div className="text-slate-400">
            Track: <span className="text-white capitalize">{race.trackSurface}</span>
          </div>
          <div className="text-slate-400">
            Weather: <span className="text-white capitalize">{race.weather}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
