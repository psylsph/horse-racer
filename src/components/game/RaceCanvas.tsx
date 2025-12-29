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
  const horseSpritesRef = useRef<Map<string, Graphics>>(new Map());

  useEffect(() => {
    if (!canvasRef.current) return;

    let isMounted = true;

    async function init() {
      console.log('[RaceCanvas] Initializing PixiJS app...');

      const app = new Application();
      appRef.current = app;

      await app.init({
        width,
        height,
        canvas: canvasRef.current!,
        backgroundColor: 0x1a1a2e,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
      });

      if (!isMounted) {
        app.destroy({ removeView: true });
        return;
      }

      console.log('[RaceCanvas] App initialized');

      // Create track background
      createTrackBackground(app, app.stage);

      // Create horse sprites
      if (raceEngine) {
        const sprites = createHorseSprites(app, raceEngine);
        horseSpritesRef.current = sprites;

        // Subscribe to engine updates
        const unsubscribe = raceEngine.addFrameListener((frame) => {
          if (!isMounted) return;

          frame.positions.forEach((pos) => {
            const sprite = horseSpritesRef.current.get(pos.horseId);
            if (sprite) {
              // Update horse X position based on progress (0-1)
              // Track width is screen width minus some padding
              const trackPadding = 100;
              const trackWidth = app.screen.width - trackPadding * 2;
              sprite.x = trackPadding + pos.position * trackWidth;
            }
          });
        });

        return () => {
          unsubscribe();
        };
      }
    }

    const cleanupPromise = init();

    return () => {
      isMounted = false;
      cleanupPromise.then(() => {
        if (appRef.current) {
          console.log('[RaceCanvas] Cleanup: Destroying app...');
          appRef.current.destroy({ removeView: true });
          appRef.current = null;
        }
      });
    };
  }, [width, height, raceEngine]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full block"
      style={{ width, height }}
    />
  );
}

function createTrackBackground(app: Application, stage: Container) {
  const graphics = new Graphics();

  // Draw grass
  graphics.rect(0, 0, app.screen.width, app.screen.height);
  graphics.fill(0x22c55e);

  // Draw track lanes
  const laneHeight = 60;
  const laneCount = 8;
  const startY = (app.screen.height - (laneCount * laneHeight)) / 2;

  for (let i = 0; i < laneCount; i++) {
    const y = startY + i * laneHeight;

    // Lane divider
    graphics.setStrokeStyle({ width: 2, color: 0xffffff, alpha: 0.3 });
    graphics.moveTo(0, y);
    graphics.lineTo(app.screen.width, y);
    graphics.stroke();
  }

  stage.addChild(graphics);
}

function createHorseSprites(app: Application, raceEngine: RaceEngine): Map<string, Graphics> {
  const spriteMap = new Map<string, Graphics>();
  const stage = app.stage;

  const positions = raceEngine.getCurrentPositions();
  const laneHeight = 60;
  const laneCount = 8;
  const startY = (app.screen.height - (laneCount * laneHeight)) / 2;
  const trackPadding = 100;

  positions.forEach((pos, index) => {
    const graphics = new Graphics();
    graphics.roundRect(-30, -20, 60, 40, 5); // Center the horse
    graphics.fill(0xff6b6b);

    // Initial position
    graphics.x = trackPadding + pos.position * (app.screen.width - trackPadding * 2);
    graphics.y = startY + index * laneHeight + laneHeight / 2;

    const text = new Text({
      text: `H${index + 1}`,
      style: {
        fontSize: 12,
        fill: 0xffffff,
      },
    });
    text.anchor.set(0.5);
    text.y = -30;
    graphics.addChild(text);

    stage.addChild(graphics);
    spriteMap.set(pos.horseId, graphics);
  });

  return spriteMap;
}
