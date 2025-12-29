import { Race } from '@/types';
import { useGameStore } from '@/stores/gameStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { Badge } from '@/components/ui/Badge';
import { calculateOdds, formatOdds } from '@/utils/oddsCalculator';

interface FormProps {
  race: Race;
}

export function Form({ race }: FormProps) {
  const { setCurrentScreen } = useGameStore();

  const handleStartRace = () => {
    setCurrentScreen('race');
  };

  const handleBack = () => {
    setCurrentScreen('lobby');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-3xl font-bold text-white">
            Race #{race.id.slice(-4)}
          </h2>
          <p className="text-slate-400 mt-1">
            {race.distance}m • {race.trackSurface} • {race.weather}
          </p>
        </div>
        <Button variant="secondary" onClick={handleBack}>
          ← Back to Lobby
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {race.horses.map((horse) => {
          const odds = calculateOdds(horse, race);
          
          return (
            <Card key={horse.id} variant="elevated" className="hover:border-turf-500 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-full border-2 border-white/20"
                      style={{ backgroundColor: horse.color }}
                    />
                    <div>
                      <CardTitle className="text-lg">{horse.name}</CardTitle>
                      <p className="text-xs text-slate-400">
                        {horse.totalRaces} races • {Math.round(horse.winRate * 100)}% win rate
                      </p>
                    </div>
                  </div>
                  <Badge variant="gold">{formatOdds(odds)}</Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
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
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="fixed bottom-16 left-0 right-0 bg-slate-900/95 backdrop-blur-sm border-t border-slate-800 p-4">
        <div className="container mx-auto flex justify-center">
          <Button variant="primary" size="lg" onClick={handleStartRace}>
            Start Race 🏁
          </Button>
        </div>
      </div>
    </div>
  );
}
