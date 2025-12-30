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
        scaleX={-1}
        opacity={finished ? 0.6 : 1}
      />
 
      <Circle
        x={35}
        y={-15}
        radius={12}
        fill={color}
        stroke="white"
        strokeWidth={2}
      />
      <Text
        text={`${number}`}
        fontSize={12}
        fontStyle="bold"
        fill="white"
        x={35}
        y={-15}
        offsetX={4}
        offsetY={6}
      />
    </Group>
  );
}
