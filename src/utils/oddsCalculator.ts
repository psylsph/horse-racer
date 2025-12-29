import { Horse, Race } from '@/types';

/**
 * Calculate odds for a horse based on multiple factors
 * Returns decimal odds (e.g., 2.5 = 2.5x return)
 */
export function calculateOdds(horse: Horse, race: Race): number {
  // Win rate factor (40% weight)
  const winRateFactor = horse.winRate;
  
  // Stats factor (35% weight) - compare horse to field average
  const statsFactor = compareStatsToField(horse, race.horses);
  
  // Conditions factor (25% weight) - track and weather
  const conditionsFactor = assessConditions(horse, race);
  
  // Combine factors
  const probability = (winRateFactor * 0.4) + (statsFactor * 0.35) + (conditionsFactor * 0.25);
  
  // Convert probability to decimal odds (minimum 1.01)
  const odds = Math.max(1.01, 1 / probability);
  
  // Round to 2 decimal places
  return Math.round(odds * 100) / 100;
}

/**
 * Compare horse stats to the field average
 * Returns a normalized score (0-1)
 */
function compareStatsToField(horse: Horse, horses: Horse[]): number {
  const avgTopSpeed = horses.reduce((sum, h) => sum + h.topSpeed, 0) / horses.length;
  const avgAcceleration = horses.reduce((sum, h) => sum + h.acceleration, 0) / horses.length;
  const avgStamina = horses.reduce((sum, h) => sum + h.stamina, 0) / horses.length;
  
  // Calculate relative performance
  const speedScore = horse.topSpeed / avgTopSpeed;
  const accelScore = horse.acceleration / avgAcceleration;
  const staminaScore = horse.stamina / avgStamina;
  
  // Weighted average
  return (speedScore * 0.4 + accelScore * 0.3 + staminaScore * 0.3) / 1.5;
}

/**
 * Assess how well horse performs under current conditions
 * Returns a normalized score (0-1)
 */
function assessConditions(horse: Horse, race: Race): number {
  let score = 1.0;
  
  // Track surface bonus
  const surfaceBonus = getSurfaceBonus(horse.trackPreference, race.trackSurface);
  score *= surfaceBonus;
  
  // Weather modifier
  if (race.weather === 'rain') {
    // Rain reduces performance, especially for low stamina horses
    const weatherPenalty = 1 - (0.1 * (1 - horse.stamina / 100));
    score *= weatherPenalty;
  } else if (race.weather === 'muddy') {
    // Muddy conditions affect acceleration more
    const mudPenalty = 1 - (0.15 * (1 - horse.acceleration / 100));
    score *= mudPenalty;
  }
  
  return score;
}

/**
 * Get surface bonus for horse preference
 */
function getSurfaceBonus(
  preference: 'firm' | 'soft' | 'heavy',
  surface: 'firm' | 'soft' | 'heavy'
): number {
  if (preference === surface) {
    return 1.1; // 10% bonus on preferred surface
  }
  
  // Penalty for non-preferred surfaces
  const penalties: Record<string, number> = {
    'firm-firm': 1.0,
    'firm-soft': 0.95,
    'firm-heavy': 0.9,
    'soft-firm': 0.95,
    'soft-soft': 1.0,
    'soft-heavy': 0.95,
    'heavy-firm': 0.9,
    'heavy-soft': 0.95,
    'heavy-heavy': 1.0,
  };
  
  return penalties[`${preference}-${surface}`] || 1.0;
}

/**
 * Calculate implied probability from odds
 */
export function oddsToProbability(odds: number): number {
  return 1 / odds;
}

/**
 * Format odds for display (e.g., "2.50", "10.00")
 */
export function formatOdds(odds: number): string {
  return odds.toFixed(2);
}

/**
 * Calculate payout for a bet
 */
export function calculatePayout(
  betType: 'win' | 'place' | 'show' | 'exacta',
  odds: number,
  amount: number
): number {
  switch (betType) {
    case 'win':
      return odds * amount;
    case 'place':
      return (odds * 0.5) * amount;
    case 'show':
      return (odds * 0.25) * amount;
    case 'exacta':
      return (odds * 0.1) * amount;
    default:
      return 0;
  }
}

/**
 * Calculate exacta odds for two horses
 */
export function calculateExactaOdds(horse1: Horse, horse2: Horse, race: Race): number {
  const odds1 = calculateOdds(horse1, race);
  const odds2 = calculateOdds(horse2, race);
  
  // Exacta odds are higher than individual odds
  return (odds1 * odds2) / 2;
}
