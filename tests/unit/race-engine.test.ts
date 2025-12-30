import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { RaceEngine } from '@/game/engine/RaceEngine';
import { Horse, Race } from '@/types';

describe('RaceEngine', () => {
  let race: Race;
  let horses: Horse[];
  let engine: RaceEngine;

  beforeEach(() => {
    vi.useFakeTimers();
    // Create test horses with known stats
    horses = [
      {
        id: 'horse-1',
        name: 'Test Horse 1',
        color: '#8B4513',
        topSpeed: 90,
        acceleration: 85,
        stamina: 90,
        consistency: 80,
        trackPreference: 'firm',
        weatherModifier: 1.0,
        raceHistory: [],
        winRate: 0,
        totalRaces: 0,
        spriteConfig: { width: 80, height: 60, color: '#8B4513' },
      },
      {
        id: 'horse-2',
        name: 'Test Horse 2',
        color: '#000000',
        topSpeed: 85,
        acceleration: 90,
        stamina: 85,
        consistency: 90,
        trackPreference: 'soft',
        weatherModifier: 0.95,
        raceHistory: [],
        winRate: 0,
        totalRaces: 0,
        spriteConfig: { width: 80, height: 60, color: '#000000' },
      },
      {
        id: 'horse-3',
        name: 'Test Horse 3',
        color: '#FFFFFF',
        topSpeed: 80,
        acceleration: 80,
        stamina: 95,
        consistency: 85,
        trackPreference: 'heavy',
        weatherModifier: 1.05,
        raceHistory: [],
        winRate: 0,
        totalRaces: 0,
        spriteConfig: { width: 80, height: 60, color: '#FFFFFF' },
      },
    ];

    race = {
      id: 'test-race-001',
      horses,
      trackSurface: 'firm',
      weather: 'clear',
      distance: 1200,
      status: 'scheduled',
      startTime: Date.now(),
    };
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Initialization', () => {
    it('should initialize with all horses', () => {
      engine = new RaceEngine(race);
      
      const positions = engine.getCurrentPositions();
      expect(positions).toHaveLength(3);
      expect(positions[0].horseId).toBe('horse-1');
      expect(positions[1].horseId).toBe('horse-2');
      expect(positions[2].horseId).toBe('horse-3');
    });

    it('should initialize horses at position 0', () => {
      engine = new RaceEngine(race);
      
      const positions = engine.getCurrentPositions();
      positions.forEach(pos => {
        expect(pos.position).toBe(0);
        expect(pos.velocity).toBe(0);
        expect(pos.finished).toBe(false);
      });
    });

    it('should initialize stamina from horse stats', () => {
      engine = new RaceEngine(race);
      
      const positions = engine.getCurrentPositions();
      expect(positions[0].stamina).toBe(90);
      expect(positions[1].stamina).toBe(85);
      expect(positions[2].stamina).toBe(95);
    });
  });

  describe('Race Execution', () => {
    it('should start race simulation', () => {
      let onFrameUpdateCalled = false;
      
      engine = new RaceEngine(
        race,
        () => { onFrameUpdateCalled = true; },
        () => {}
      );
      
      engine.start();

      // Advance time to trigger animation frame
      vi.advanceTimersByTime(16);

      expect(onFrameUpdateCalled).toBe(true);
      engine.stop();
    });

    it('should update horse positions over time', () => {
      const frames: any[] = [];
      
      engine = new RaceEngine(
        race,
        (frame) => { frames.push(frame); },
        () => {}
      );
      
      engine.start();
      
      // Wait a moment for some frames
      setTimeout(() => {
        engine.stop();
        
        expect(frames.length).toBeGreaterThan(0);
        
        // Check that positions have increased
        const lastFrame = frames[frames.length - 1];
        const hasMoved = lastFrame.positions.some((p: any) => p.position > 0);
        expect(hasMoved).toBe(true);
      }, 100);
    });

    it('should identify a leader during race', () => {
      let leader: string | null = null;
      
      engine = new RaceEngine(
        race,
        (frame) => { leader = frame.leader; },
        () => {}
      );
      
      engine.start();
      
      // Wait a moment
      setTimeout(() => {
        engine.stop();
        expect(leader).toBeTruthy();
        expect(['horse-1', 'horse-2', 'horse-3']).toContain(leader);
      }, 100);
    });

    it('should stop race simulation', () => {
      engine = new RaceEngine(race);
      engine.start();
      
      engine.stop();
      
      const positions = engine.getCurrentPositions();
      expect(positions).toBeDefined();
      expect(positions).toHaveLength(3);
    });
  });

  describe('Progress Tracking', () => {
    it('should track progress from 0 to 100', () => {
      let maxProgress = 0;
      
      engine = new RaceEngine(
        race,
        (frame) => {
          const progress = frame.positions[0]?.position || 0;
          if (progress > maxProgress) {
            maxProgress = progress;
          }
        },
        () => {}
      );
      
      engine.start();
      
      // Wait for race to progress
      setTimeout(() => {
        engine.stop();
        expect(maxProgress).toBeGreaterThan(0);
        expect(maxProgress).toBeLessThanOrEqual(1);
      }, 200);
    });

    it('should return progress percentage', () => {
      engine = new RaceEngine(race);
      
      const progress = engine.getProgress();
      expect(progress).toBeGreaterThanOrEqual(0);
      expect(progress).toBeLessThanOrEqual(1);
    });
  });

  describe('Velocity Calculation', () => {
    it('should calculate velocity based on horse stats', () => {
      engine = new RaceEngine(
        race,
        (frame) => {
          const positions = frame.positions;
          positions.forEach(pos => {
            // Velocity should be based on horse stats
            expect(pos.velocity).toBeGreaterThan(0);
            expect(pos.velocity).toBeLessThan(200); // Upper bound
          });
          engine.stop();
        },
        () => {}
      );
      
      engine.start();
    });

    it('should apply surface bonuses', () => {
      // Horse 1 prefers firm, race is on firm
      const firmRace: Race = { ...race, trackSurface: 'firm' };
      engine = new RaceEngine(firmRace);
      
      // Get first frame velocities
      let velocities: number[] = [];
      engine = new RaceEngine(
        firmRace,
        (frame) => {
          velocities = frame.positions.map((p: any) => p.velocity);
          engine.stop();
        },
        () => {}
      );
      
      engine.start();

      // Advance time to trigger animation frame
      vi.advanceTimersByTime(16);

      expect(velocities[0]).toBeGreaterThan(0);
    });

    it('should apply weather modifiers', () => {
      const rainRace: Race = { ...race, weather: 'rain' };
      engine = new RaceEngine(rainRace);
      
      engine.start();
      
      // Let it run briefly
      setTimeout(() => {
        engine.stop();
        // Rain should affect velocity (lower in most cases)
        const positions = engine.getCurrentPositions();
        const avgVelocity = positions.reduce((sum, p: any) => sum + p.velocity, 0) / 3;
        expect(avgVelocity).toBeGreaterThan(0);
      }, 100);
    });
  });

  describe('Stamina Management', () => {
    it('should drain stamina during race', () => {
      let initialStamina: number | null = null;
      let finalStamina: number | null = null;
      
      engine = new RaceEngine(
        race,
        (frame) => {
          const horse1Pos = frame.positions[0];
          if (initialStamina === null) {
            initialStamina = horse1Pos.stamina;
          }
          finalStamina = horse1Pos.stamina;
        },
        () => {}
      );
      
      engine.start();
      
      // Wait for stamina to drain
      setTimeout(() => {
        engine.stop();
        
        expect(initialStamina).toBe(90);
        expect(finalStamina).toBeLessThan(initialStamina!);
      }, 200);
    });

    it('should not let stamina go negative', () => {
      engine = new RaceEngine(race);
      engine.start();
      
      // Wait for significant progress
      setTimeout(() => {
        engine.stop();
        const positions = engine.getCurrentPositions();
        positions.forEach(pos => {
          expect(pos.stamina).toBeGreaterThanOrEqual(0);
        });
      }, 500);
    });
  });

  describe('Race Completion', () => {
    it('should mark horses as finished when they reach 1', () => {
      engine = new RaceEngine(
        race,
        () => {},
        (results) => {
          
          // Check results are valid
          expect(results).toHaveLength(3);
          expect(results[0].position).toBe(1);
          expect(results[1].position).toBe(2);
          expect(results[2].position).toBe(3);
          
          // All horses should be finished
          const positions = engine.getCurrentPositions();
          positions.forEach(pos => {
            expect(pos.finished).toBe(true);
            expect(pos.position).toBe(1);
          });
        }
      );
      
      engine.start();
    });

    it('should call onComplete callback with sorted results', () => {
      let onCompleteCalled = false;
      
      engine = new RaceEngine(
        race,
        () => {},
        (results) => {
          onCompleteCalled = true;
          
          // Results should be sorted by position
          for (let i = 0; i < results.length - 1; i++) {
            expect(results[i].position).toBeLessThan(results[i + 1].position);
          }
          
          // Each result should have required fields
          results.forEach(result => {
            expect(result.horseId).toBeTruthy();
            expect(result.position).toBeGreaterThan(0);
            expect(result.time).toBeGreaterThan(0);
            expect(result.finalSpeed).toBeGreaterThanOrEqual(0);
          });
        }
      );
      
      engine.start();
      
      setTimeout(() => {
        expect(onCompleteCalled).toBe(true);
      }, 10000);
    });

    it('should stop animation after completion', () => {
      let framesAfterComplete = 0;
      let completeCalled = false;
      
      engine = new RaceEngine(
        race,
        () => {
          if (completeCalled) {
            framesAfterComplete++;
          }
        },
        () => {
          completeCalled = true;
          
          // Wait a moment to ensure no more frames
          setTimeout(() => {
            expect(framesAfterComplete).toBe(0);
          }, 100);
        }
      );
      
      engine.start();
    });
  });

  describe('Error Handling', () => {
    it('should handle empty horse array', () => {
      const emptyRace: Race = { ...race, horses: [] };
      
      expect(() => {
        new RaceEngine(emptyRace);
      }).not.toThrow();
    });

    it('should handle single horse', () => {
      const singleHorseRace: Race = {
        ...race,
        horses: [horses[0]]
      };
      
      engine = new RaceEngine(singleHorseRace);
      
      const positions = engine.getCurrentPositions();
      expect(positions).toHaveLength(1);
    });

    it('should handle no callbacks', () => {
      expect(() => {
        new RaceEngine(race);
      }).not.toThrow();
      
      engine = new RaceEngine(race);
      expect(() => {
        engine.start();
      }).not.toThrow();
      
      engine.stop();
    });
  });
});
