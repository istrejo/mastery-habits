import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../theming/ThemeProvider';
import { useSyncStore } from '../states/sync.store';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

export const SyncIndicator: React.FC = () => {
  const theme = useTheme();
  const { isSyncing, pendingCount } = useSyncStore();
  const { isOnline } = useNetworkStatus();

  if (!isOnline && pendingCount > 0) {
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: theme.radius.pill,
          backgroundColor: theme.bg.surfaceAlt,
        }}
      >
        <MaterialIcons name="cloud-off" size={14} color={theme.text.secondary} />
        <Text
          style={{
            color: theme.text.secondary,
            fontSize: theme.typography.scale.microBold.fontSize,
            fontFamily: 'Lexend_600SemiBold',
          }}
        >
          {pendingCount}
        </Text>
      </View>
    );
  }

  if (isSyncing) {
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          paddingHorizontal: 8,
          paddingVertical: 4,
        }}
      >
        <ActivityIndicator size="small" color={theme.text.secondary} />
      </View>
    );
  }

  return null;
};
