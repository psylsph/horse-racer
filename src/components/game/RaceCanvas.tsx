import { useEffect, useRef, useState, useCallback } from 'react';
import { Application, Graphics, Text, Container, AnimatedSprite, Rectangle, Texture, Assets } from 'pixi.js';
import { RaceEngine } from '@/game/engine/RaceEngine';
import { Race } from '@/types';

interface RaceCanvasProps {
  raceEngine: RaceEngine | null;
  race?: Race;
  'data-testid'?: string;
}

export function RaceCanvas({ raceEngine, race, 'data-testid': dataTestId }: RaceCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<Application | null>(null);
  const horseSpritesRef = useRef<Map<string, Container>>(new Map());
  const raceEngineRef = useRef<RaceEngine | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const isAppInitializedRef = useRef(false);

  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [isAppInitialized, setIsAppInitialized] = useState(false);
  const [horseTexture, setHorseTexture] = useState<Texture | null>(null);
  const [horseFrames, setHorseFrames] = useState<Texture[]>([]);

  // Helper to convert hex color to Uint32 for PixiJS tint
  function parseHexToUint32(hex: string): number {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return (b << 16) | (g << 8) | r;
  }

  // Helper to get horse color from race data
  function getHorseColor(race: Race, horseId: string): string {
    const horse = race.horses.find((h: any) => h.id === horseId);
    return horse?.color || '#888888';
  }

  // Update race engine ref whenever prop changes
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

    const isMounted = true;

    async function init() {
      if (dimensions.width <= 0 || dimensions.height <= 0) {
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 100));

      if (!isMounted || !canvasRef.current) {
        return;
      }

      const app = new Application();
      appRef.current = app;

      try {
        await app.init({
          width: dimensions.width,
          height: dimensions.height,
          canvas: canvasRef.current!,
          backgroundColor: 0x1a1a2e,
          antialias: false,
          resolution: 1,
        });

        if (!isMounted) {
          app.destroy({ removeView: true });
          return;
        }

        // Load AVIF texture
        let texture: Texture | null = null;
        const frames: Texture[] = [];
        try {
          texture = await Assets.load<Texture>('/src/assets/horse.avif');
          console.log('[RaceCanvas] AVIF texture loaded successfully:', texture.width, 'x', texture.height);

          // Extract 2x3 sprite sheet frames (left-to-right, top-to-bottom)
          const frameWidth = texture.width / 2;  // 2 columns
          const frameHeight = texture.height / 3; // 3 rows

          for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 2; col++) {
              const frame = new Texture({
                source: texture.source,
                frame: new Rectangle(
                  col * frameWidth,
                  row * frameHeight,
                  frameWidth,
                  frameHeight
                )
              });
              frames.push(frame);
            }
          }
          console.log('[RaceCanvas] Extracted', frames.length, 'animation frames');
        } catch (error) {
          console.error('[RaceCanvas] Failed to load AVIF:', error);
          console.error('[RaceCanvas] Using colored rectangles as fallback');
        }

        setHorseTexture(texture);
        setHorseFrames(frames);

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

    init();
  }, [dimensions.width, dimensions.height]);

  // Create horse sprites using AVIF texture
  const createHorseSprites = useCallback(async (
    app: Application,
    race: Race,
    texture: Texture | null,
    frames: Texture[]
  ): Promise<Map<string, Container>> => {
    console.log('[RaceCanvas] createHorseSprites called with', frames.length, 'frames');
    const spriteMap = new Map<string, Container>();
    const stage = app.stage;
    const laneHeight = 60;
    const topPadding = 30;
    const startY = topPadding;
    const trackPadding = 100;

    for (let index = 0; index < race.horses.length; index++) {
      const horse = race.horses[index];
      const horseContainer = new Container();

      if (texture) {
        // Get horse color from race data
        const horseColor = getHorseColor(race, horse.id);

        // Create animated sprite from sprite sheet frames
        const animatedSprite = new AnimatedSprite(frames.length > 0 ? frames : [texture]);
        animatedSprite.animationSpeed = 0.15;
        animatedSprite.loop = true;
        animatedSprite.play();
        console.log('[RaceCanvas] AnimatedSprite created for horse', horse.id, 'with', frames.length, 'frames');

        // Apply color tint
        animatedSprite.tint = parseHexToUint32(horseColor);

        // Scale sprite to fit in lane
        const targetWidth = 80;
        const targetHeight = 60;
        animatedSprite.width = targetWidth;
        animatedSprite.height = targetHeight;

        // Set anchor to center
        animatedSprite.anchor.set(0.5);
        animatedSprite.x = 0;
        animatedSprite.y = 0;

        // Add horse number label
        const text = new Text({
          text: `H${index + 1}`,
          style: {
            fontSize: 18,
            fill: 0xffffff,
            fontWeight: 'bold',
          },
        });
        text.anchor.set(0.5);
        text.x = 15;
        text.y = 0;

        horseContainer.addChild(animatedSprite);
        horseContainer.addChild(text);

        // Store animated sprite reference for stopping animation
        (horseContainer as any).animatedSprite = animatedSprite;
      } else {
        // Fallback: colored rectangle if texture fails
        const horseColor = getHorseColor(race, horse.id);
        const graphics = new Graphics();
        graphics.rect(0, 0, 80, 60);
        graphics.fill(parseHexToUint32(horseColor));
        graphics.x = -40;
        graphics.y = -30;
        horseContainer.addChild(graphics);

        // Add horse number label
        const text = new Text({
          text: `H${index + 1}`,
          style: {
            fontSize: 18,
            fill: 0xffffff,
            fontWeight: 'bold',
          },
        });
        text.anchor.set(0.5);
        text.x = 15;
        text.y = 0;
        horseContainer.addChild(text);
      }

      // Initial position
      horseContainer.x = trackPadding;
      horseContainer.y = startY + index * laneHeight + laneHeight / 2;

      stage.addChild(horseContainer);
      spriteMap.set(horse.id, horseContainer);
    }

    return spriteMap;
  }, []);

  function createTrackBackground(app: Application, stage: Container) {
    const graphics = new Graphics();

    // Draw track lanes (no green background)
    const laneHeight = 60;
    const laneCount = 6;
    const topPadding = 30;
    const startY = topPadding;

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

  useEffect(() => {
    const app = appRef.current;

    if (!app || !raceEngineRef.current || !isAppInitialized || !horseTexture || !race) {
      return;
    }

    const engine = raceEngineRef.current;
    console.log('[RaceCanvas] Setting up frame listener, horseFrames:', horseFrames.length);

    // Subscribe to engine updates
    const unsubscribe = engine.addFrameListener(async (frame) => {
      const trackPadding = 100;
      const trackWidth = app.screen.width - trackPadding * 2;

      // Create horse sprites on first frame update if not already created
      if (horseSpritesRef.current.size === 0) {
        console.log('[RaceCanvas] Creating horse sprites for first time');
        const sprites = await createHorseSprites(app, race, horseTexture, horseFrames);
        horseSpritesRef.current = sprites;
        console.log('[RaceCanvas] Horse sprites created:', sprites.size);
      }

      // Update sprite positions
      frame.positions.forEach((pos) => {
        const horseContainer = horseSpritesRef.current.get(pos.horseId);
        if (horseContainer && horseTexture) {
          horseContainer.x = trackPadding + pos.position * trackWidth;

          // Get animated sprite reference
          const animatedSprite = (horseContainer as any).animatedSprite;

          // Stop animation when individual horse finishes
          if (pos.finished && animatedSprite && animatedSprite.playing) {
            animatedSprite.stop();
          }
          // Continue animation while horse is racing and not finished
          else if (!pos.finished && animatedSprite && !animatedSprite.playing) {
            animatedSprite.play();
          }
        }
      });
    });

    unsubscribeRef.current = unsubscribe;

    return () => {
      unsubscribe();
      unsubscribeRef.current = null;
      horseSpritesRef.current.clear();
    };
  }, [raceEngine, isAppInitialized, horseTexture, horseFrames, race, createHorseSprites]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full block"
      data-testid={dataTestId}
    />
  );
}
