import { Race } from '@/types';
import { useGameStore } from '@/stores/gameStore';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';

interface ResultsViewProps {
  race: Race;
}

export function ResultsView({ race }: ResultsViewProps) {
  const { setCurrentScreen } = useGameStore();

  const handleBackToLobby = () => {
    setCurrentScreen('lobby');
  };

  if (!race.results || race.results.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 data-testid="results-title" className="font-display text-4xl font-bold mb-4">
          Results
        </h2>
        <p className="text-slate-400 text-lg">
          No results available
        </p>
        <Button variant="primary" onClick={handleBackToLobby} className="mt-8">
          Back to Lobby
        </Button>
      </div>
    );
  }

  const winner = race.results[0];
  const second = race.results[1];
  const third = race.results[2];

  const getHorseName = (horseId: string) => {
    const horse = race.horses.find((h) => h.id === horseId);
    return horse?.name || 'Unknown';
  };

  const getHorseColor = (horseId: string) => {
    const horse = race.horses.find((h) => h.id === horseId);
    return horse?.color || '#000000';
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 data-testid="results-title" className="font-display text-4xl font-bold">
            Results - Race #{race.id.slice(-4)}
          </h2>
          <p className="text-slate-400">
            {race.distance}m • {race.trackSurface} • {race.weather}
          </p>
        </div>
        <Button variant="secondary" onClick={handleBackToLobby} data-testid="back-button">
          Back to Lobby
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {winner && (
          <Card variant="elevated" className="border-gold-500 border-4">
            <CardContent className="text-center">
              <div className="text-6xl mb-4">🥇</div>
              <h3 className="text-2xl font-bold text-gold-400 mb-2">1st Place</h3>
              <div
                className="w-24 h-24 rounded-full border-4 border-gold-600 mx-auto mb-4"
                style={{ backgroundColor: getHorseColor(winner.horseId) }}
              />
              <p className="text-white text-lg font-semibold">
                {getHorseName(winner.horseId)}
              </p>
              <div className="space-y-2 mt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Time:</span>
                  <span className="text-white font-mono">{(winner.time / 1000).toFixed(2)}s</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Speed:</span>
                  <span className="text-white font-mono">{winner.finalSpeed.toFixed(1)} km/h</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {second && (
          <Card variant="elevated" className="border-slate-400 border-4">
            <CardContent className="text-center">
              <div className="text-6xl mb-4">🥈</div>
              <h3 className="text-2xl font-bold text-slate-300 mb-2">2nd Place</h3>
              <div
                className="w-16 h-16 rounded-full border-2 border-slate-500 mx-auto mb-4"
                style={{ backgroundColor: getHorseColor(second.horseId) }}
              />
              <p className="text-white text-lg">
                {getHorseName(second.horseId)}
              </p>
            </CardContent>
          </Card>
        )}

        {third && (
          <Card variant="elevated" className="border-orange-700 border-4">
            <CardContent className="text-center">
              <div className="text-6xl mb-4">🥉</div>
              <h3 className="text-2xl font-bold text-orange-400 mb-2">3rd Place</h3>
              <div
                className="w-16 h-16 rounded-full border-2 border-orange-600 mx-auto mb-4"
                style={{ backgroundColor: getHorseColor(third.horseId) }}
              />
              <p className="text-white text-lg">
                {getHorseName(third.horseId)}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <Card variant="elevated">
        <CardContent>
          <h3 className="text-xl font-bold text-white mb-4">Full Results</h3>
          <div className="space-y-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-2 px-4 text-slate-400">Pos</th>
                  <th className="text-left py-2 px-4 text-slate-400">Horse</th>
                  <th className="text-left py-2 px-4 text-slate-400">Time</th>
                  <th className="text-left py-2 px-4 text-slate-400">Speed</th>
                </tr>
              </thead>
              <tbody>
                {race.results.map((result) => (
                  <tr key={result.horseId} className="border-b border-slate-700">
                    <td className="py-3 px-4">
                      <Badge variant="default">{result.position}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-full border border-white/20"
                          style={{ backgroundColor: getHorseColor(result.horseId) }}
                        />
                        <span className="text-white">{getHorseName(result.horseId)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-white font-mono">
                      {(result.time / 1000).toFixed(2)}s
                    </td>
                    <td className="py-3 px-4 text-white font-mono">
                      {result.finalSpeed.toFixed(1)} km/h
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
