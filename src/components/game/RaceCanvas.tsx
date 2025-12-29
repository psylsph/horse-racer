import { useEffect, useRef } from 'react';
import { Application, Graphics, Text, Container } from 'pixi.js';
import { RaceEngine } from '@/game/engine/RaceEngine';

interface RaceCanvasProps {
  width: number;
  height: number;
  raceEngine: RaceEngine | null;
}

export function RaceCanvas({ width, height, raceEngine }: RaceCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<Application | null>(null);
  const stageRef = useRef<Container | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    async function init() {
      console.log('[RaceCanvas] Initializing PixiJS app...');

      // PixiJS v8: Create app and init separately
      const app = new Application();
      appRef.current = app;

      await app.init({
        width,
        height,
        canvas: canvasRef.current || undefined,
        backgroundColor: 0x1a1a2e,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
      });

      console.log('[RaceCanvas] App initialized');

      // In PixiJS v8, the stage might be null initially, so we create our own container
      // Check if app.stage exists, otherwise create a new Container
      const stage = app.stage || new Container();
      if (!app.stage) {
        console.warn('[RaceCanvas] app.stage is null, creating new Container');
        app.stage = stage;
      }

      stageRef.current = stage;
      console.log('[RaceCanvas] Using stage:', stage);

      // Wait a brief moment to ensure stage is ready before adding children
      setTimeout(() => {
        if (stageRef.current) {
          // Create track background
          createTrackBackground(app, stageRef.current);

          // Create horse sprites (placeholders for now)
          if (raceEngine) {
            createHorseSprites(app, raceEngine);
          }
        }
      }, 0);
    }

    init().catch((error) => {
      console.error('[RaceCanvas] Initialization error:', error);
    });

    return () => {
      console.log('[RaceCanvas] Cleanup: Destroying app...');
      // Only destroy if app is initialized
      if (appRef.current && typeof appRef.current.destroy === 'function') {
        console.log('[RaceCanvas] App exists');
        // Cancel any pending timeouts
        // In PixiJS v8, destroy takes an options object
        appRef.current.destroy({ removeView: true });
        appRef.current = null;
        stageRef.current = null;
      }
    };
  }, [width, height, raceEngine]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ width, height }}
    />
  );
}

function createTrackBackground(app: Application, stage: Container) {
  console.log('[createTrackBackground] Starting, app:', app, 'stage:', stage);

  // Check if stage is available before proceeding
  if (!stage) {
    console.error('[createTrackBackground] Stage is null, cannot create background');
    return;
  }

  // Create a simple grass background
  const graphics = new Graphics();

  // Draw grass - PixiJS v8 API
  graphics.rect(0, 0, app.screen.width, app.screen.height);
  graphics.fill(0x22c55e);

  // Draw track lanes
  const laneHeight = 60;
  const laneCount = 8;
  const startY = (app.screen.height - (laneCount * laneHeight)) / 2;

  for (let i = 0; i < laneCount; i++) {
    const y = startY + i * laneHeight;

    // Lane divider - PixiJS v8 API
    graphics.setStrokeStyle({ width: 2, color: 0xffffff, alpha: 0.3 });
    graphics.moveTo(0, y);
    graphics.lineTo(app.screen.width, y);
    graphics.stroke();
  }

  // Add the graphics to the stage after drawing
  stage.addChild(graphics);
  console.log('[createTrackBackground] Graphics added to stage');
}

function createHorseSprites(app: Application, raceEngine: RaceEngine) {
  const stage = app.stage; // Use the app.stage directly
  console.log('[createHorseSprites] Starting, stage:', stage);

  // Check if stage is available before proceeding
  if (!stage) {
    console.error('[createHorseSprites] Stage is null, cannot create horse sprites');
    return;
  }

  const positions = raceEngine.getCurrentPositions();
  const laneHeight = 60;
  const laneCount = 8;
  const startY = (app.screen.height - (laneCount * laneHeight)) / 2;

  positions.forEach((_horsePos, index) => {
    // Create a simple horse sprite (colored rectangle for now) - PixiJS v8 API
    const graphics = new Graphics();
    graphics.roundRect(0, 0, 60, 40, 5);
    graphics.fill(0xff6b6b);

    // Position in lane
    graphics.x = 50;
    graphics.y = startY + index * laneHeight + (laneHeight - 40) / 2;

    // Add horse name
    const text = new Text({
      text: `Horse ${index + 1}`,
      style: {
        fontSize: 12,
        fill: 0xffffff,
      },
    });
    text.x = 0;
    text.y = -15;
    graphics.addChild(text);

    stage.addChild(graphics);
  });
}
