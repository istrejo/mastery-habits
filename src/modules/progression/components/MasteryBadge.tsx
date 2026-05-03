import React from 'react';
import { View, Text, type ViewStyle } from 'react-native';
import { useTheme } from '@core/theming';
import { getLevel } from '../utils/getLevel';

interface MasteryBadgeProps {
  score: number;
  style?: ViewStyle;
}

export const MasteryBadge: React.FC<MasteryBadgeProps> = ({ score, style }) => {
  const t = useTheme();
  const level = getLevel(score);

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
          backgroundColor: `${level.color}22`,
          borderWidth: 1,
          borderColor: `${level.color}66`,
          alignSelf: 'flex-start',
        },
        style,
      ]}
    >
      <Text style={{ fontSize: 12 }}>{level.emoji}</Text>
      <Text style={{ fontSize: 11, color: level.color, fontWeight: '600' }}>
        {level.label}
      </Text>
    </View>
  );
};
