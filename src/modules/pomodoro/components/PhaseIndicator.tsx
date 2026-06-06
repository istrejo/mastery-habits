import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@core/theming';

interface PhaseIndicatorProps {
  cycleIndex: number;
  cyclesPerRound: number;
}

export const PhaseIndicator: React.FC<PhaseIndicatorProps> = ({ cycleIndex, cyclesPerRound }) => {
  const t = useTheme();

  return (
    <View style={{ flexDirection: 'row', gap: t.spacing.stackSm, justifyContent: 'center' }}>
      {Array.from({ length: cyclesPerRound }, (_, i) => (
        <View
          key={i}
          style={{
            width: 8,
            height: 8,
            borderRadius: t.radius.pill,
            backgroundColor: i < cycleIndex ? t.accent.primary : t.border.default,
          }}
        />
      ))}
    </View>
  );
};
