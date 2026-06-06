export type LevelKey = 'seed' | 'sprout' | 'tree' | 'forest' | 'ancient';

export interface Level {
  key: LevelKey;
  emoji: string;
  min: number;
  max: number;
}
