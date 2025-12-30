import { Group, Text, Circle } from 'react-konva';

interface HorseEmojiSpriteProps {
  x: number;
  y: number;
  color: string;
  number: number;
  finished: boolean;
  emoji?: string;
}

export function HorseEmojiSprite({ 
  x, 
  y, 
  color, 
  number, 
  finished,
  emoji = '🐎' 
}: HorseEmojiSpriteProps) {
  return (
    <Group x={x} y={y}>
      <Text
        text={emoji}
        fontSize={40}
        offsetX={20}
        offsetY={20}
        opacity={finished ? 0.6 : 1}
      />

      <Circle
        x={0}
        y={0}
        radius={14}
        fill={color}
        stroke="white"
        strokeWidth={2}
      />
      <Text
        text={`${number}`}
        fontSize={14}
        fontStyle="bold"
        fill="white"
        offsetX={5}
        offsetY={7}
      />
    </Group>
  );
}
