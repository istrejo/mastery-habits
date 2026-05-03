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
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: t.radius.pill,
          backgroundColor: lv.bg,
          borderWidth: t.borderWidth.default,
          borderColor: lv.border,
          alignSelf: 'flex-start',
        },
        style,
      ]}
    >
      <Text style={{ fontSize: 12 }}>{level.emoji}</Text>
      <Text style={{ fontSize: 11, color: lv.fg, fontWeight: '600' }}>
        {level.label}
      </Text>
    </View>
  );
};
