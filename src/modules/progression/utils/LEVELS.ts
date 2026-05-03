import type { Level } from '../types';

export const LEVELS: readonly Level[] = [
  { key: 'seed',    label: 'Seed',    emoji: '🌱', min: 0,  max: 20  },
  { key: 'sprout',  label: 'Sprout',  emoji: '🌿', min: 21, max: 45  },
  { key: 'tree',    label: 'Tree',    emoji: '🌳', min: 46, max: 70  },
  { key: 'forest',  label: 'Forest',  emoji: '🌲', min: 71, max: 90  },
  { key: 'ancient', label: 'Ancient', emoji: '🗿', min: 91, max: 100 },
] as const;
