import { useEffect, useRef, useState } from 'react';
import { Application, Graphics, Text, Container, Sprite, Texture, Assets } from 'pixi.js';
import { RaceEngine } from '@/game/engine/RaceEngine';

interface RaceCanvasProps {
  raceEngine: RaceEngine | null;
}

export function RaceCanvas({ raceEngine }: RaceCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<Application | null>(null);
  const horseSpritesRef = useRef<Map<string, Container>>(new Map());
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
        return;
      }

      // Add a small delay to ensure DOM is ready
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
          antialias: false, // Disable antialias to avoid shader issues
          resolution: 1, // Use fixed resolution to avoid issues
        });

        if (!isMounted) {
          app.destroy({ removeView: true });
          return;
        }

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
    
    if (!app || !raceEngineRef.current || !isAppInitialized) {
      return;
    }

    const engine = raceEngineRef.current;

    // Subscribe to engine updates
    const unsubscribe = engine.addFrameListener(async (frame) => {
      const trackPadding = 100;
      const trackWidth = app.screen.width - trackPadding * 2;
      
      // Create horse sprites on first frame update if not already created
      if (horseSpritesRef.current.size === 0 && frame.positions.length > 0) {
        const sprites = await createHorseSprites(app, engine);
        horseSpritesRef.current = sprites;
      }
      
      // Update sprite positions
      frame.positions.forEach((pos) => {
        const horseContainer = horseSpritesRef.current.get(pos.horseId);
        if (horseContainer) {
          horseContainer.x = trackPadding + pos.position * trackWidth;
        }
      });
    });

    unsubscribeRef.current = unsubscribe;

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
  const laneCount = 6;
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

/**
 * Generate an SVG string for a horse
 */
function generateHorseSVG(color: string): string {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 80" width="100" height="80">
      <!-- Body -->
      <ellipse cx="50" cy="45" rx="35" ry="20" fill="${color}" />
      <!-- Head -->
      <ellipse cx="85" cy="30" rx="15" ry="12" fill="${color}" />
      <!-- Neck -->
      <path d="M 75 40 Q 80 35 85 30 L 75 45 Z" fill="${color}" />
      <!-- Ear -->
      <path d="M 80 20 L 85 15 L 90 20 Z" fill="${color}" />
      <!-- Eye -->
      <circle cx="90" cy="28" r="2" fill="#000000" />
      <!-- Front leg -->
      <rect x="70" y="55" width="8" height="20" rx="3" fill="${color}" />
      <!-- Front leg 2 -->
      <rect x="80" y="55" width="8" height="20" rx="3" fill="${color}" />
      <!-- Back leg -->
      <rect x="20" y="55" width="8" height="20" rx="3" fill="${color}" />
      <!-- Back leg 2 -->
      <rect x="30" y="55" width="8" height="20" rx="3" fill="${color}" />
      <!-- Tail -->
      <path d="M 15 45 Q 5 50 8 60 Q 10 55 15 50" fill="${color}" />
      <!-- Mane -->
      <path d="M 70 25 Q 75 20 80 22 Q 78 28 75 30 Q 72 28 70 25" fill="${color}" />
    </svg>
  `;
}

  /**
   * Convert SVG string to PixiJS Texture
   */
  async function svgToTexture(svg: string): Promise<Texture> {
    // Convert SVG to base64 data URL
    const base64 = btoa(svg);
    const url = `data:image/svg+xml;base64,${base64}`;

    // Load texture from URL
    const texture = await Assets.load<Texture>(url);

    return texture;
  }

/**
 * Generate a color for a horse based on its index
 */
function getHorseColor(index: number): string {
  const colors = [
    '#8B4513', // Saddle Brown
    '#000000', // Black
    '#FFFFFF', // White
    '#808080', // Gray
    '#D2691E', // Chocolate
    '#F5DEB3', // Wheat
    '#A0522D', // Sienna
    '#696969', // Dim Gray
  ];
  return colors[index % colors.length];
}

async function createHorseSprites(app: Application, raceEngine: RaceEngine): Promise<Map<string, Container>> {
  const spriteMap = new Map<string, Container>();
  const stage = app.stage;

  const positions = raceEngine.getCurrentPositions();
  const laneHeight = 60;
  const laneCount = 6;
  const startY = (app.screen.height - (laneCount * laneHeight)) / 2;
  const trackPadding = 100;

  for (const [index, pos] of positions.entries()) {
    // Generate SVG for this horse
    const horseColor = getHorseColor(index);
    const svgString = generateHorseSVG(horseColor);
    const texture = await svgToTexture(svgString);
    
    // Create a Container to hold both the sprite and text
    const horseContainer = new Container();
    
    const sprite = new Sprite(texture);
    
    // Scale the sprite to fit in the lane
    const targetWidth = 80;
    const targetHeight = 60;
    sprite.width = targetWidth;
    sprite.height = targetHeight;
    
    // Set anchor to center for easier positioning
    sprite.anchor.set(0.5);
    sprite.x = 0;
    sprite.y = 0;

    // Add horse number label
    const text = new Text({
      text: `H${index + 1}`,
      style: {
        fontSize: 14,
        fill: 0xffffff,
        fontWeight: 'bold',
      },
    });
    text.anchor.set(0.5);
    text.x = 0;
    text.y = -targetHeight / 2 - 15;

    // Add both sprite and text to the container
    horseContainer.addChild(sprite);
    horseContainer.addChild(text);

    // Initial position
    horseContainer.x = trackPadding + pos.position * (app.screen.width - trackPadding * 2);
    horseContainer.y = startY + index * laneHeight + laneHeight / 2;

    stage.addChild(horseContainer);
    spriteMap.set(pos.horseId, horseContainer);
  }

  return spriteMap;
}
