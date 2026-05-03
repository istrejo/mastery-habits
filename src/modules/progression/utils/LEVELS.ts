import type { Level } from '../types';

export const LEVELS: readonly Level[] = [
  { key: 'seed',    label: 'Seed',    emoji: '🌱', min: 0,  max: 20,  color: '#86efac' },
  { key: 'sprout',  label: 'Sprout',  emoji: '🌿', min: 21, max: 45,  color: '#4ade80' },
  { key: 'tree',    label: 'Tree',    emoji: '🌳', min: 46, max: 70,  color: '#16a34a' },
  { key: 'forest',  label: 'Forest',  emoji: '🌲', min: 71, max: 90,  color: '#15803d' },
  { key: 'ancient', label: 'Ancient', emoji: '🗿', min: 91, max: 100, color: '#166534' },
] as const;
