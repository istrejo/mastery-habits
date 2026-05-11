import React from 'react';
import { View, Text, type ViewStyle } from 'react-native';
import { useTheme, type MasteryLevel } from '@core/theming';
import { getLevel } from '../utils/getLevel';

interface MasteryBadgeProps {
  score: number;
  style?: ViewStyle;
}

export const MasteryBadge: React.FC<MasteryBadgeProps> = ({ score, style }) => {
  const t = useTheme();
  const level = getLevel(score);
  const lv = t.level[level.key as MasteryLevel];

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          paddingHorizontal: 10,
          paddingVertical: 5,
          borderRadius: t.radius.pill,
          backgroundColor: lv.bg,
          borderWidth: t.borderWidth.default,
          borderColor: lv.border,
          alignSelf: 'flex-start',
        },
        style,
      ]}
    >
      <Text style={{ fontSize: t.typography.scale.microBold.fontSize }}>{level.emoji}</Text>
      <Text style={{ fontSize: t.typography.scale.microBold.fontSize, color: lv.fg, fontFamily: 'Lexend_600SemiBold', letterSpacing: t.typography.scale.microBold.letterSpacing, textTransform: 'uppercase' }}>
        {level.label}
      </Text>
    </View>
  );
};
