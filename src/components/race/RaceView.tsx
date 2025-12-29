import { useEffect, useState, useRef } from 'react';
import { Race } from '@/types';
import { useGameStore } from '@/stores/gameStore';
import { useHorseStore } from '@/stores/horseStore';
import { RaceEngine } from '@/game/engine/RaceEngine';
import { RaceCanvas } from '../game/RaceCanvas';
import { Button } from '../ui/Button';
import { Progress } from '../ui/Progress';
import { Badge } from '../ui/Badge';

interface RaceViewProps {
  race: Race;
}

export function RaceView({ race }: RaceViewProps) {
  const { setCurrentScreen } = useGameStore();
  const { updateHorseStats } = useHorseStore();
  
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
        
        // Go to results after a delay
        setTimeout(() => {
          setCurrentScreen('results');
        }, 2000);
      }
    );
    
    setRaceEngine(engine);
  }, [race, setCurrentScreen, updateHorseStats]);

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
      <div className="bg-slate-900 border-b border-slate-800 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-white">
              Race #{race.id.slice(-4)}
            </h2>
            <p className="text-sm text-slate-400">
              {race.distance}m • {race.trackSurface} • {race.weather}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {!isRunning && !isFinished && (
              <Button variant="primary" onClick={handleStartRace}>
                Start Race
              </Button>
            )}
            {isRunning && (
              <div className="flex items-center gap-2 text-turf-400">
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
      <div className="bg-slate-800 border-b border-slate-700 p-2">
        <div className="container mx-auto">
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400 w-20">Progress</span>
            <div className="flex-1">
              <Progress value={raceProgress * 100} max={100} variant="turf" showLabel data-testid="progress-bar" />
            </div>
          </div>
        </div>
      </div>

      {/* Race Canvas */}
      <div className="flex-1 relative" ref={canvasRef}>
        {raceEngine && (
          <RaceCanvas
            width={canvasRef.current?.clientWidth || 800}
            height={canvasRef.current?.clientHeight || 600}
            raceEngine={raceEngine}
            data-testid="race-canvas"
          />
        )}
      </div>

      {/* Race Info Footer */}
      <div className="bg-slate-900 border-t border-slate-800 p-3">
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
