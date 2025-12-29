import { useState, useEffect } from 'react';
import { Race } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatTimeRemaining, getRaceConditionsDescription } from '@/utils/raceScheduler';

interface RaceCardProps {
  race: Race;
  onSelect: (race: Race) => void;
}

export function RaceCard({ race, onSelect }: RaceCardProps) {
  const [timeUntil, setTimeUntil] = useState(race.startTime - Date.now());
  const [isReady, setIsReady] = useState(Date.now() >= race.startTime);

  useEffect(() => {
    // Update countdown every second
    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = race.startTime - now;
      setTimeUntil(remaining);
      
      if (remaining <= 0 && !isReady) {
        setIsReady(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [race.startTime, isReady]);

  return (
    <Card
      variant="elevated"
      className="hover:border-turf-500 transition-colors cursor-pointer"
      data-testid="race-card"
      data-race-id={race.id}
    >
      <CardHeader className="flex items-start justify-between">
        <div>
          <CardTitle className="text-turf-400">Race #{race.id.slice(-4)}</CardTitle>
          <p className="text-sm text-slate-400 mt-1">
            {getRaceConditionsDescription(race)}
          </p>
        </div>
        <Badge variant={isReady ? 'success' : 'default'}>
          {isReady ? 'Ready' : 'Upcoming'}
        </Badge>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">
              <span className="text-white font-medium">{race.horses.length}</span> horses
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {isReady ? (
                <span className="text-turf-400">Ready to start!</span>
              ) : (
                <>Starts in: <span className="text-gold-400">{formatTimeRemaining(timeUntil)}</span></>
              )}
            </p>
          </div>
          <Button 
            variant="primary" 
            onClick={() => onSelect(race)}
            disabled={!isReady}
          >
            {isReady ? 'View Race' : 'Wait'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
