import React, { useState } from 'react';
import { View, Text, Pressable, Modal, type ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@core/theming';
import { Button } from '@core/components';
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
      <View style={[{ padding: 16, borderRadius: theme.radius.md, backgroundColor: theme.bg.surfaceAlt, borderWidth: theme.borderWidth.default, borderColor: theme.border.default, alignItems: 'center' }, style]}>
        <Text style={{ color: theme.text.secondary, fontSize: theme.typography.scale.microBold.fontSize, fontFamily: 'Lexend_500Medium' }}>
          {t('checkin.not_planned')}
        </Text>
      </View>
    );
  }

  if (alreadyCheckedIn) {
    const isSkipped = todayCheckIn?.status === 'skipped';
    return (
      <View style={[{ padding: 16, borderRadius: theme.radius.md, backgroundColor: theme.bg.surfaceAlt, borderWidth: theme.borderWidth.default, borderColor: isSkipped ? theme.text.secondary : theme.accent.primary, alignItems: 'center' }, style]}>
        <Text style={{ color: isSkipped ? theme.text.secondary : theme.accent.primary, fontSize: theme.typography.scale.bodyMain.fontSize, fontFamily: 'Lexend_600SemiBold' }}>
          {isSkipped ? t('checkin.skip_used') : t('checkin.completed')}
        </Text>
      </View>
    );
  }

  return (
    <>
      <View style={[{ gap: theme.spacing.stackSm }, style]}>
        <Button label={t('checkin.complete_action')} onPress={onComplete} loading={loading} />
        {skipAvailable && <Button label={t('checkin.use_skip')} variant="secondary" onPress={() => setSkipModalVisible(true)} disabled={loading} />}
      </View>

      <Modal visible={skipModalVisible} transparent animationType="fade" onRequestClose={() => setSkipModalVisible(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(17,17,17,0.55)', justifyContent: 'center', padding: 24 }}>
          <View style={{ backgroundColor: theme.bg.surface, borderRadius: theme.radius.lg, borderWidth: theme.borderWidth.default, borderColor: theme.border.default, padding: 24 }}>
            <Text style={{ color: theme.text.primary, fontSize: theme.typography.scale.titleSm.fontSize, lineHeight: theme.typography.scale.titleSm.lineHeight, fontFamily: 'Anton_400Regular', letterSpacing: theme.typography.scale.titleSm.letterSpacing, textTransform: 'uppercase', marginBottom: 8 }}>
              {t('checkin.skip_modal_title')}
            </Text>
            <Text style={{ color: theme.text.secondary, fontSize: theme.typography.scale.bodyMain.fontSize, lineHeight: theme.typography.scale.bodyMain.lineHeight, fontFamily: 'Lexend_400Regular', marginBottom: 24 }}>
              {t('checkin.skip_modal_body')}
            </Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Pressable onPress={() => setSkipModalVisible(false)} style={{ flex: 1, padding: 12, borderRadius: theme.radius.md, borderWidth: theme.borderWidth.default, borderColor: theme.border.default, alignItems: 'center' }}>
                <Text style={{ color: theme.text.secondary, fontFamily: 'Lexend_600SemiBold' }}>{t('common.cancel')}</Text>
              </Pressable>
              <Pressable onPress={async () => { setSkipModalVisible(false); await onSkip(); }} style={{ flex: 1, padding: 12, borderRadius: theme.radius.md, backgroundColor: theme.accent.primary, alignItems: 'center' }}>
                <Text style={{ color: theme.accent.onPrimary, fontFamily: 'Lexend_600SemiBold' }}>{t('common.confirm')}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};
