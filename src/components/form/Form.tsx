import { Race, Horse } from '@/types';
import { useGameStore } from '@/stores/gameStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { Badge } from '@/components/ui/Badge';
import { calculateOdds, formatOdds } from '@/utils/oddsCalculator';
import { BettingSlip } from '../betting/BettingSlip';

interface FormProps {
  race: Race;
}

export function Form({ race }: FormProps) {
  const { setCurrentScreen, selectedHorse, setSelectedHorse } = useGameStore();

  const handleHorseSelect = (horse: Horse) => {
    setSelectedHorse(horse);
  };

  const handleStartRace = () => {
    setCurrentScreen('race');
  };

  const handleBack = () => {
    setCurrentScreen('lobby');
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-white">
            Race #{race.id.slice(-4)}
          </h2>
          <p className="text-slate-400 mt-1">
            {race.distance}m • {race.trackSurface} • {race.weather}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleBack} data-testid="back-button">
            ← Back to Lobby
          </Button>
          <Button variant="primary" size="lg" onClick={handleStartRace} data-testid="form-start-race-button">
            Start Race 🏁
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {race.horses.map((horse) => {
          const odds = calculateOdds(horse, race);
          const isSelected = selectedHorse?.id === horse.id;

          return (
            <Card
              key={horse.id}
              variant="elevated"
              onClick={() => handleHorseSelect(horse)}
              className={`hover:border-turf-500 transition-all cursor-pointer ${
                isSelected ? 'border-turf-500 ring-2 ring-turf-400' : ''
              }`}
              data-testid="horse-card"
              data-horse-id={horse.id}
              aria-pressed={isSelected}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-full border-2 border-white/20"
                      style={{ backgroundColor: horse.color }}
                    />
                    <div>
                      <CardTitle className="text-base md:text-lg" data-testid="horse-name">{horse.name}</CardTitle>
                      <p className="text-xs text-slate-400">
                        {horse.totalRaces} races • {Math.round(horse.winRate * 100)}% win rate
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="gold" data-testid="odds-badge">{formatOdds(odds)}</Badge>
                    {isSelected && (
                      <Badge variant="success" data-testid="selected-badge">Selected</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent data-testid="horse-stats">
                <div className="space-y-3">
                  {isSelected ? (
                    <>
                      <div>
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                          <span>Speed</span>
                          <span>{horse.topSpeed}</span>
                        </div>
                        <Progress value={horse.topSpeed} max={100} variant="turf" size="sm" />
                      </div>

                      <div>
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                          <span>Acceleration</span>
                          <span>{horse.acceleration}</span>
                        </div>
                        <Progress value={horse.acceleration} max={100} variant="turf" size="sm" />
                      </div>

                      <div>
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                          <span>Stamina</span>
                          <span>{horse.stamina}</span>
                        </div>
                        <Progress value={horse.stamina} max={100} variant="turf" size="sm" />
                      </div>

                      <div>
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                          <span>Consistency</span>
                          <span>{horse.consistency}</span>
                        </div>
                        <Progress value={horse.consistency} max={100} variant="turf" size="sm" />
                      </div>

                      <div className="pt-2 border-t border-slate-700">
                        <p className="text-xs text-slate-400">
                          Prefers: <span className="text-white capitalize">{horse.trackPreference}</span> track
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-slate-400">
                        {horse.totalRaces} races • {Math.round(horse.winRate * 100)}% win rate
                      </div>
                      <div className="hidden md:block">
                        <div className="text-xs text-slate-400 pt-2 border-t border-slate-700">
                          Prefers: <span className="text-white capitalize">{horse.trackPreference}</span> track
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <BettingSlip raceId={race.id} horses={race.horses} />
    </div>
  );
}
