import { useEffect, useRef, useState } from 'react';
import { Application, Graphics, Text, Container } from 'pixi.js';
import { RaceEngine } from '@/game/engine/RaceEngine';

interface RaceCanvasProps {
  raceEngine: RaceEngine | null;
}

export function RaceCanvas({ raceEngine }: RaceCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<Application | null>(null);
  const horseSpritesRef = useRef<Map<string, Graphics>>(new Map());
  const raceEngineRef = useRef<RaceEngine | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const isAppInitializedRef = useRef(false);
  const isStrictModeUnmountRef = useRef(false);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [isAppInitialized, setIsAppInitialized] = useState(false);

  // Update the raceEngine ref whenever the prop changes
  useEffect(() => {
    raceEngineRef.current = raceEngine;
  }, [raceEngine]);

  // Track canvas dimensions using ResizeObserver
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        // Ignore resize to 0x0 (happens during unmount)
        if (width === 0 && height === 0) {
          return;
        }
        setDimensions({ width, height });
      }
    });

    resizeObserver.observe(canvas);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    let isMounted = true;

    async function init() {
      // Ensure dimensions are valid and reasonable
      if (dimensions.width <= 0 || dimensions.height <= 0) {
        console.log('[RaceCanvas] Waiting for valid dimensions...');
        return;
      }

      // Add a small delay to ensure DOM is ready
      await new Promise(resolve => setTimeout(resolve, 100));

      if (!isMounted || !canvasRef.current) {
        return;
      }

      console.log('[RaceCanvas] Initializing PixiJS app with dimensions:', dimensions);
      const app = new Application();
      appRef.current = app;

      try {
        await app.init({
          width: dimensions.width,
          height: dimensions.height,
          canvas: canvasRef.current!,
          backgroundColor: 0x1a1a2e,
          antialias: false, // Disable antialias to avoid shader issues
          resolution: 1, // Use fixed resolution to avoid issues
        });

        if (!isMounted) {
          app.destroy({ removeView: true });
          return;
        }

        console.log('[RaceCanvas] PixiJS app initialized successfully');
        // Create track background
        createTrackBackground(app, app.stage);

        isAppInitializedRef.current = true;
        setIsAppInitialized(true);
      } catch (error) {
        console.error('[RaceCanvas] Failed to initialize PixiJS app:', error);
        // Try to clean up on error
        if (appRef.current) {
          try {
            appRef.current.destroy({ removeView: true });
          } catch (e) {
            console.error('[RaceCanvas] Error during cleanup:', e);
          }
          appRef.current = null;
        }
      }
    }

    const cleanupPromise = init();

    // Only cleanup on actual unmount, not on prop changes
    return () => {
      isMounted = false;
      isStrictModeUnmountRef.current = true;
      
      // Unsubscribe from engine updates if any
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      
      cleanupPromise.then(() => {
        if (appRef.current) {
          appRef.current = null;
        }
        isAppInitializedRef.current = false;
        setIsAppInitialized(false);
      });
      
      // Reset strict mode flag after a short delay to allow remount
      setTimeout(() => {
        isStrictModeUnmountRef.current = false;
      }, 100);
    };
  }, []); // Empty dependency array - only run once on mount

  // Separate effect to handle raceEngine changes without cleanup
  useEffect(() => {
    const app = appRef.current;
    console.log('[RaceCanvas] raceEngine effect - app:', !!app, 'raceEngine:', !!raceEngineRef.current, 'initialized:', isAppInitialized);
    
    if (!app || !raceEngineRef.current || !isAppInitialized) {
      console.log('[RaceCanvas] Cannot setup - missing dependencies');
      return;
    }

    const engine = raceEngineRef.current;
    console.log('[RaceCanvas] Setting up horse sprites');

    // Subscribe to engine updates
    const unsubscribe = engine.addFrameListener((frame) => {
      const trackPadding = 100;
      const trackWidth = app.screen.width - trackPadding * 2;
      
      // Create horse sprites on first frame update if not already created
      if (horseSpritesRef.current.size === 0 && frame.positions.length > 0) {
        console.log('[RaceCanvas] Creating horse sprites on first frame...');
        const sprites = createHorseSprites(app, engine);
        horseSpritesRef.current = sprites;
        console.log('[RaceCanvas] Created', sprites.size, 'horse sprites');
      }
      
      // Update sprite positions
      frame.positions.forEach((pos) => {
        const horseSprite = horseSpritesRef.current.get(pos.horseId);
        if (horseSprite) {
          horseSprite.x = trackPadding + pos.position * trackWidth;
        }
      });
    });

    unsubscribeRef.current = unsubscribe;
    console.log('[RaceCanvas] Subscribed to engine updates');

    return () => {
      unsubscribe();
      unsubscribeRef.current = null;
      horseSpritesRef.current.clear(); // Clear sprites on unmount
    };
  }, [raceEngine, isAppInitialized]); // This effect runs when raceEngine or app initialization changes

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full block"
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
