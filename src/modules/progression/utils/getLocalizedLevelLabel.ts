import type { LevelKey } from '../types';

type LevelTranslationKey = `levels.${LevelKey}`;
type LevelLabelTranslator = (key: LevelTranslationKey) => string;

export function getLocalizedLevelLabel(levelKey: LevelKey, t: LevelLabelTranslator): string {
  const levelMap = {
    seed: t('levels.seed'),
    sprout: t('levels.sprout'),
    tree: t('levels.tree'),
    forest: t('levels.forest'),
    ancient: t('levels.ancient'),
  } as const;

  return levelMap[levelKey];
}
