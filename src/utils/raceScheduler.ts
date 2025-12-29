import { Race, Horse, TrackSurface, Weather } from '@/types';

let raceCounter = 0;

/**
 * Generate a new race with random conditions
 */
export function generateRace(horses: Horse[]): Race {
  const trackSurfaces: TrackSurface[] = ['firm', 'soft', 'heavy'];
  const weathers: Weather[] = ['clear', 'rain', 'muddy'];
  
  // Random conditions
  const trackSurface = trackSurfaces[Math.floor(Math.random() * trackSurfaces.length)];
  const weather = weathers[Math.floor(Math.random() * weathers.length)];
  
  // Random distance (1000-2000 meters)
  const distance = Math.floor(Math.random() * 1000) + 1000;
  
  // Start time in 10 seconds
  const startTime = Date.now() + 10000;
  
  return {
    id: `race-${++raceCounter}`,
    horses,
    trackSurface,
    weather,
    distance,
    status: 'scheduled',
    startTime,
  };
}

/**
 * Get time until race starts
 */
export function getTimeUntilRace(race: Race): number {
  return Math.max(0, race.startTime - Date.now());
}

/**
 * Format time remaining for display
 */
export function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return 'Starting soon...';
  
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  
  return `${remainingSeconds}s`;
}

/**
 * Check if race is ready to start
 */
export function isRaceReady(race: Race): boolean {
  return Date.now() >= race.startTime;
}

/**
 * Get race conditions description
 */
export function getRaceConditionsDescription(race: Race): string {
  const surfaceDescriptions: Record<TrackSurface, string> = {
    firm: 'Firm',
    soft: 'Soft',
    heavy: 'Heavy',
  };
  
  const weatherDescriptions: Record<Weather, string> = {
    clear: 'Clear',
    rain: 'Rain',
    muddy: 'Muddy',
  };
  
  return `${surfaceDescriptions[race.trackSurface]} • ${weatherDescriptions[race.weather]} • ${race.distance}m`;
}

/**
 * Generate multiple upcoming races
 */
export function generateUpcomingRaces(horses: Horse[], count: number): Race[] {
  const races: Race[] = [];
  const now = Date.now();
  
  for (let i = 0; i < count; i++) {
    // Shuffle horses for each race
    const shuffledHorses = [...horses].sort(() => Math.random() - 0.5);
    const raceHorses = shuffledHorses.slice(0, 6 + Math.floor(Math.random() * 4)); // 6-10 horses
    
    const race = generateRace(raceHorses);
    
    // Stagger start times (every 2 minutes)
    race.startTime = now + (i * 120000) + 30000;
    
    races.push(race);
  }
  
  return races;
}
