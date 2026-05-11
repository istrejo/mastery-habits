import React, { useState } from 'react';
import { View, Text, Pressable, Modal, type ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@core/theming';
import type { CheckInRecord } from '../services/checkin.service';

interface CheckInButtonProps {
  canCheckIn: boolean;
  alreadyCheckedIn: boolean;
  todayCheckIn: CheckInRecord | null;
  skipAvailable: boolean;
  loading: boolean;
  onComplete: () => Promise<void>;
  onSkip: () => Promise<void>;
  style?: ViewStyle;
}

export const CheckInButton: React.FC<CheckInButtonProps> = ({
  canCheckIn,
  alreadyCheckedIn,
  todayCheckIn,
  skipAvailable,
  loading,
  onComplete,
  onSkip,
  style,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [skipModalVisible, setSkipModalVisible] = useState(false);

  if (!canCheckIn) {
    return (
      <View
        style={[
          {
            padding: 16,
            borderRadius: theme.radius.md,
            backgroundColor: theme.bg.surfaceAlt,
            alignItems: 'center',
          },
          style,
        ]}
      >
        <Text style={{ color: theme.text.tertiary, fontSize: theme.typography.scale.microBold.fontSize, fontFamily: 'Inter_500Medium' }}>
          {t('checkin.not_planned')}
        </Text>
      </View>
    );
  }

  if (alreadyCheckedIn) {
    const isSkipped = todayCheckIn?.status === 'skipped';
    return (
      <View
        style={[
          {
            padding: 16,
            borderRadius: theme.radius.md,
            backgroundColor: isSkipped ? `${theme.status.skip}22` : `${theme.status.success}22`,
            borderWidth: theme.borderWidth.default,
            borderColor: isSkipped ? theme.status.skip : theme.status.success,
            alignItems: 'center',
          },
          style,
        ]}
      >
        <Text style={{ color: isSkipped ? theme.status.skip : theme.status.success, fontSize: theme.typography.scale.bodyMain.fontSize, fontFamily: 'Inter_700Bold' }}>
          {isSkipped ? t('checkin.skip_used') : t('checkin.completed')}
        </Text>
      </View>
    );
  }

  return (
    <>
      <View style={[{ gap: 8 }, style]}>
        <Pressable
          onPress={onComplete}
          disabled={loading}
          style={({ pressed }) => ({
            backgroundColor: pressed ? `${theme.status.success}cc` : theme.status.success,
            padding: 16,
            borderRadius: theme.radius.md,
            alignItems: 'center',
            opacity: loading ? 0.6 : 1,
          })}
        >
          <Text style={{ color: theme.text.inverse, fontSize: theme.typography.scale.bodyMain.fontSize, fontFamily: 'Inter_700Bold' }}>
            {t('checkin.complete_action')}
          </Text>
        </Pressable>

        {skipAvailable && (
          <Pressable
            onPress={() => setSkipModalVisible(true)}
            disabled={loading}
            style={({ pressed }) => ({
              backgroundColor: pressed ? `${theme.status.skip}22` : 'transparent',
              padding: 12,
              borderRadius: theme.radius.md,
              borderWidth: theme.borderWidth.default,
              borderColor: theme.status.skip,
              alignItems: 'center',
              opacity: loading ? 0.6 : 1,
            })}
          >
            <Text style={{ color: theme.status.skip, fontSize: theme.typography.scale.bodyMain.fontSize, fontFamily: 'Inter_600SemiBold' }}>
              {t('checkin.use_skip')}
            </Text>
          </Pressable>
        )}
      </View>

      <Modal
        visible={skipModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSkipModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: '#00000080', justifyContent: 'center', padding: 24 }}>
          <View style={{ backgroundColor: theme.bg.surface, borderRadius: theme.radius.lg, padding: 24 }}>
            <Text style={{ color: theme.text.primary, fontSize: theme.typography.scale.titleSm.fontSize, fontFamily: 'Inter_700Bold', letterSpacing: theme.typography.scale.titleSm.letterSpacing, marginBottom: 8 }}>
              {t('checkin.skip_modal_title')}
            </Text>
            <Text style={{ color: theme.text.secondary, fontSize: theme.typography.scale.bodyMain.fontSize, marginBottom: 24 }}>
              {t('checkin.skip_modal_body')}
            </Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Pressable
                onPress={() => setSkipModalVisible(false)}
                style={{ flex: 1, padding: 12, borderRadius: theme.radius.md, borderWidth: theme.borderWidth.default, borderColor: theme.border.default, alignItems: 'center' }}
              >
                <Text style={{ color: theme.text.secondary, fontWeight: '600' }}>{t('common.cancel')}</Text>
              </Pressable>
              <Pressable
                onPress={async () => {
                  setSkipModalVisible(false);
                  await onSkip();
                }}
                style={{ flex: 1, padding: 12, borderRadius: theme.radius.md, backgroundColor: theme.status.skip, alignItems: 'center' }}
              >
                <Text style={{ color: theme.text.inverse, fontWeight: '700' }}>{t('common.confirm')}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};
