import React from 'react';
import { View, Text, type ViewStyle } from 'react-native';
import { useTheme, type MasteryLevel } from '@core/theming';
import { getLevel, getLevelProgress } from '../utils/getLevel';
import { LEVELS } from '../utils/LEVELS';
import { ProgressBar } from '@core/components';
import { getLocalizedLevelLabel } from '../utils/getLocalizedLevelLabel';
import { useTranslation } from 'react-i18next';

interface LevelProgressProps {
  score: number;
  style?: ViewStyle;
}

export const LevelProgress: React.FC<LevelProgressProps> = ({ score, style }) => {
  const t = useTheme();
  const { t: translate } = useTranslation();
  const level = getLevel(score);
  const progress = getLevelProgress(score);
  const lv = t.level[level.key as MasteryLevel];
  const currentIndex = LEVELS.findIndex((l) => l.key === level.key);
  const nextLevel = currentIndex < LEVELS.length - 1 ? LEVELS[currentIndex + 1] : null;
  const levelLabel = getLocalizedLevelLabel(level.key, translate);
  const nextLevelLabel = nextLevel ? getLocalizedLevelLabel(nextLevel.key, translate) : null;

  return (
    <View style={style}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: t.spacing.stackSm }}>
        <Text style={{ fontSize: t.typography.scale.microBold.fontSize, color: lv.fg, fontFamily: 'Lexend_600SemiBold', letterSpacing: t.typography.scale.microBold.letterSpacing, textTransform: 'uppercase' }}>
          {level.emoji} {levelLabel}
        </Text>
        {nextLevel ? (
          <Text style={{ fontSize: t.typography.scale.microBold.fontSize, color: t.text.tertiary, fontFamily: 'Lexend_500Medium', letterSpacing: t.typography.scale.microBold.letterSpacing, textTransform: 'uppercase' }}>
            {nextLevel.emoji} {nextLevelLabel}
          </Text>
        ) : null}
      </View>
      <ProgressBar value={progress} max={1} scoreColor={lv.fg} />
      <Text style={{ fontSize: t.typography.scale.microBold.fontSize, color: t.text.tertiary, marginTop: 6, fontFamily: 'Lexend_400Regular' }}>
        {Math.round(score)}/100
      </Text>
    </View>
  );
};
