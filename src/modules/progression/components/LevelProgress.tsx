import React from 'react';
import { View, Text, type ViewStyle } from 'react-native';
import { useTheme, type MasteryLevel } from '@core/theming';
import { getLevel, getLevelProgress } from '../utils/getLevel';
import { LEVELS } from '../utils/LEVELS';

interface LevelProgressProps {
  score: number;
  style?: ViewStyle;
}

export const LevelProgress: React.FC<LevelProgressProps> = ({ score, style }) => {
  const t = useTheme();
  const level = getLevel(score);
  const progress = getLevelProgress(score);
  const lv = t.level[level.key as MasteryLevel];
  const currentIndex = LEVELS.findIndex((l) => l.key === level.key);
  const nextLevel = currentIndex < LEVELS.length - 1 ? LEVELS[currentIndex + 1] : null;

  return (
    <View style={style}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 6,
        }}
      >
        <Text style={{ fontSize: 12, color: lv.fg, fontWeight: '600' }}>
          {level.emoji} {level.label}
        </Text>
        {nextLevel && (
          <Text style={{ fontSize: 12, color: t.text.tertiary }}>
            {nextLevel.emoji} {nextLevel.label}
          </Text>
        )}
      </View>
      <View
        style={{
          height: 8,
          backgroundColor: t.bg.surfaceAlt,
          borderRadius: t.radius.pill,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            width: `${progress * 100}%`,
            height: '100%',
            backgroundColor: lv.fg,
            borderRadius: t.radius.pill,
          }}
        />
      </View>
      <Text style={{ fontSize: 11, color: t.text.tertiary, marginTop: 4 }}>
        {Math.round(score)}/100
      </Text>
    </View>
  );
};
