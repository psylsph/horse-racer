import { Horse, Race, RaceResult, RaceConditions } from '@/types';

/**
 * Race Engine - Simulates horse races using physics-lite model
 */

export interface HorsePosition {
  horseId: string;
  position: number; // 0-1 (percentage of track completed)
  velocity: number;
  stamina: number;
  finished: boolean;
}

export interface RaceFrame {
  time: number;
  positions: HorsePosition[];
  leader: string;
}

export class RaceEngine {
  private race: Race;
  private horses: Map<string, Horse>;
  private positions: Map<string, HorsePosition>;
  private startTime: number;
  private frames: RaceFrame[] = [];
  private isRunning: boolean = false;
  private animationFrame: number | null = null;
  private onFrameUpdate?: (frame: RaceFrame) => void;
  private onComplete?: (results: RaceResult[]) => void;

  constructor(race: Race, onFrameUpdate?: (frame: RaceFrame) => void, onComplete?: (results: RaceResult[]) => void) {
    this.race = race;
    this.horses = new Map(race.horses.map(h => [h.id, h]));
    this.positions = new Map();
    this.startTime = Date.now();
    this.onFrameUpdate = onFrameUpdate;
    this.onComplete = onComplete;
  }

  /**
   * Start the race simulation
   */
  start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.initializePositions();
    this.simulate();
  }

  /**
   * Initialize horse positions at the start line
   */
  private initializePositions(): void {
    this.race.horses.forEach(horse => {
      this.positions.set(horse.id, {
        horseId: horse.id,
        position: 0,
        velocity: 0,
        stamina: horse.stamina,
        finished: false,
      });
    });
  }

  /**
   * Main simulation loop
   */
  private simulate(): void {
    const simulateFrame = () => {
      if (!this.isRunning) return;

      const frame = this.calculateNextFrame();
      this.frames.push(frame);

      if (this.onFrameUpdate) {
        this.onFrameUpdate(frame);
      }

      // Check if all horses have finished
      const allFinished = Array.from(this.positions.values()).every(p => p.finished);
      
      if (allFinished) {
        this.finishRace();
      } else {
        this.animationFrame = requestAnimationFrame(simulateFrame);
      }
    };

    this.animationFrame = requestAnimationFrame(simulateFrame);
  }

  /**
   * Calculate next frame of race
   */
  private calculateNextFrame(): RaceFrame {
    const currentTime = Date.now() - this.startTime;
    const positions = Array.from(this.positions.values());
    
    // Update each horse's position
    positions.forEach(horsePos => {
      if (horsePos.finished) return;

      const horse = this.horses.get(horsePos.horseId)!;
      const conditions: RaceConditions = {
        trackSurface: this.race.trackSurface,
        weather: this.race.weather,
        distance: this.race.distance,
      };

      // Calculate current velocity
      const velocity = this.calculateVelocity(horse, horsePos, conditions);
      
      // Update position (velocity is in pixels per frame, convert to percentage)
      // Increased scale factor for faster races
      const distancePerFrame = velocity * 0.003; 
      horsePos.position += distancePerFrame;
      horsePos.velocity = velocity;

      // Apply stamina drain
      horsePos.stamina = this.applyStaminaDrain(horse, horsePos.position);

      // Check if horse has finished
      if (horsePos.position >= 1) {
        horsePos.position = 1;
        horsePos.finished = true;
      }
    });

    // Find leader
    const leader = positions.reduce((leader, pos) => 
      pos.position > leader.position ? pos : leader
    );

    return {
      time: currentTime,
      positions,
      leader: leader.horseId,
    };
  }

  /**
   * Calculate velocity for a horse at current position
   */
  private calculateVelocity(
    horse: Horse,
    horsePos: HorsePosition,
    conditions: RaceConditions
  ): number {
    // Base performance from stats
    let performance = (horse.topSpeed * 0.4) + (horse.acceleration * 0.3) + (horse.stamina * 0.3);
    
    // Track surface modifier
    const surfaceBonus = this.getSurfaceBonus(horse.trackPreference, conditions.trackSurface);
    performance *= surfaceBonus;
    
    // Weather modifier
    if (conditions.weather === 'rain') {
      performance *= (1 - (0.1 * (1 - horse.stamina / 100)));
    } else if (conditions.weather === 'muddy') {
      performance *= (1 - (0.15 * (1 - horse.acceleration / 100)));
    }
    
    // Stochastic variance (reduced by consistency)
    const varianceRange = 20 * (1 - horse.consistency / 100);
    const randomFactor = (Math.random() - 0.5) * varianceRange;
    
    // Apply variance to performance
    let velocity = performance + randomFactor;
    
    // Apply stamina fade in final 25% of race
    const fadeFactor = this.applyStaminaFade(horse, horsePos.position);
    velocity *= fadeFactor;
    
    // Acceleration phase (first 10% of race)
    if (horsePos.position < 0.1) {
      const accelProgress = horsePos.position / 0.1;
      velocity *= accelProgress;
    }
    
    return Math.max(0, velocity);
  }

  /**
   * Apply stamina fade in final 25% of race
   */
  private applyStaminaFade(horse: Horse, progress: number): number {
    if (progress < 0.75) return 1.0;
    
    const fadeFactor = (progress - 0.75) / 0.25; // 0 to 1
    const staminaDrain = 1 - (horse.stamina / 200); // 0.5 to 1.0
    const fade = 1 - (fadeFactor * staminaDrain * 0.3); // Max 30% fade
    
    return fade;
  }

  /**
   * Apply stamina drain over the race
   */
  private applyStaminaDrain(horse: Horse, progress: number): number {
    // Stamina drains linearly over the race
    const drainRate = 0.3; // 30% stamina drain over full race
    const currentStamina = horse.stamina * (1 - (progress * drainRate));
    
    return currentStamina;
  }

  /**
   * Get surface bonus for horse preference
   */
  private getSurfaceBonus(
    preference: 'firm' | 'soft' | 'heavy',
    surface: 'firm' | 'soft' | 'heavy'
  ): number {
    if (preference === surface) {
      return 1.1; // 10% bonus on preferred surface
    }
    
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
   * Finish the race and calculate results
   */
  private finishRace(): void {
    this.isRunning = false;
    
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }

    // Sort horses by finishing position
    const results: RaceResult[] = Array.from(this.positions.values())
      .sort((a, b) => b.position - a.position)
      .map((pos, index) => ({
        horseId: pos.horseId,
        position: index + 1,
        time: this.frames.length * 16.67, // Approximate time in ms
        finalSpeed: pos.velocity,
      }));

    if (this.onComplete) {
      this.onComplete(results);
    }
  }

  /**
   * Stop the race simulation
   */
  stop(): void {
    this.isRunning = false;
    
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  /**
   * Get current race progress (0-1)
   */
  getProgress(): number {
    const positions = Array.from(this.positions.values());
    if (positions.length === 0) return 0;
    
    const avgPosition = positions.reduce((sum, pos) => sum + pos.position, 0) / positions.length;
    return avgPosition;
  }

  /**
   * Get current positions
   */
  getCurrentPositions(): HorsePosition[] {
    return Array.from(this.positions.values());
  }
}
