import type { Level } from '../types';

export const LEVELS: readonly Level[] = [
  { key: 'seed',    emoji: '🌱', min: 0,  max: 20  },
  { key: 'sprout',  emoji: '🌿', min: 21, max: 45  },
  { key: 'tree',    emoji: '🌳', min: 46, max: 70  },
  { key: 'forest',  emoji: '🌲', min: 71, max: 90  },
  { key: 'ancient', emoji: '🗿', min: 91, max: 100 },
] as const;
