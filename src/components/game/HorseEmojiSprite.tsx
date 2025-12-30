import { Group, Text, Circle } from 'react-konva';

interface HorseEmojiSpriteProps {
  x: number;
  y: number;
  color: string;
  number: number;
  finished: boolean;
  emoji?: string;
  scale?: number;
}

export function HorseEmojiSprite({ 
  x, 
  y, 
  color, 
  number, 
  finished,
  emoji = '🐎',
  scale,
}: HorseEmojiSpriteProps) {
  const scaleFactor = scale || 1;

  return (
    <Group x={x} y={y}>
      <Text
        text={emoji}
        fontSize={40 * scaleFactor}
        offsetX={20 * scaleFactor}
        offsetY={20 * scaleFactor}
        scaleX={-1}
        opacity={finished ? 0.6 : 1}
      />

      <Circle
        x={35 * scaleFactor}
        y={-15 * scaleFactor}
        radius={12 * scaleFactor}
        fill={color}
        stroke="white"
        strokeWidth={2}
      />
      <Text
        text={`${number}`}
        fontSize={12 * scaleFactor}
        fontStyle="bold"
        fill="white"
        x={35 * scaleFactor}
        y={-15 * scaleFactor}
        offsetX={4 * scaleFactor}
        offsetY={6 * scaleFactor}
      />
    </Group>
  );
}
