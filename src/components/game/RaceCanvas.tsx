import { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Rect, Line } from 'react-konva';
import { RaceEngine } from '@/game/engine/RaceEngine';
import { Race } from '@/types';
import { HorseEmojiSprite } from './HorseEmojiSprite';

interface RaceCanvasProps {
  raceEngine: RaceEngine | null;
  race?: Race;
}

export function RaceCanvas({ raceEngine, race }: RaceCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [positions, setPositions] = useState<Map<string, number>>(new Map());
  const [finishedHorses, setFinishedHorses] = useState<Set<string>>(new Set());
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          setDimensions({
            width: entry.contentRect.width,
            height: entry.contentRect.height,
          });
        }
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!raceEngine) return;

    let isRunning = true;

    const gameLoop = () => {
      if (!isRunning) return;

      const currentFrame = (raceEngine as any).getCurrentFrame?.();

      if (currentFrame) {
        const newPositions = new Map<string, number>();
        const newFinished = new Set<string>();

        currentFrame.positions.forEach((pos: any) => {
          newPositions.set(pos.horseId, pos.position);
          if (pos.finished) {
            newFinished.add(pos.horseId);
          }
        });

        setPositions(newPositions);
        setFinishedHorses(newFinished);

        if (race && newFinished.size === race.horses.length) {
          isRunning = false;
          return;
        }
      }

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      isRunning = false;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [raceEngine, race]);

  const laneHeight = (dimensions.height - 60) / 6;
  const trackPadding = Math.max(20, Math.min(100, dimensions.width * 0.1));
  const trackWidth = dimensions.width - trackPadding * 2;

  return (
    <div ref={containerRef} className="w-full h-full" data-testid="race-canvas">
      <Stage width={dimensions.width} height={dimensions.height}>
        <Layer>
          <Rect
            x={0}
            y={0}
            width={dimensions.width}
            height={dimensions.height}
            fill="#1a1a2e"
          />
        </Layer>

        <Layer>
          {Array.from({ length: 6 }).map((_, i) => (
            <Line
              key={`lane-${i}`}
              points={[0, 30 + i * laneHeight, dimensions.width, 30 + i * laneHeight]}
              stroke="#ffffff"
              strokeWidth={1}
              opacity={0.3}
            />
          ))}

          <Line
            points={[trackPadding + trackWidth, 30, trackPadding + trackWidth, dimensions.height - 30]}
            stroke="#ffd700"
            strokeWidth={4}
          />
        </Layer>

        <Layer listening={false}>
          {race?.horses.map((horse, index) => {
            const position = positions.get(horse.id) || 0;
            const isFinished = finishedHorses.has(horse.id);

            return (
              <HorseEmojiSprite
                key={horse.id}
                x={trackPadding + position * trackWidth}
                y={30 + index * laneHeight + laneHeight / 2}
                color={horse.color}
                number={index + 1}
                finished={isFinished}
                emoji="🐎"
              />
            );
          })}
        </Layer>
      </Stage>
    </div>
  );
}
