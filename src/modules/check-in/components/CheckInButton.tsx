import React, { useState } from 'react';
import { View, Text, Pressable, Modal, type ViewStyle } from 'react-native';
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
  const t = useTheme();
  const [skipModalVisible, setSkipModalVisible] = useState(false);

  if (!canCheckIn) {
    return (
      <View
        style={[
          {
            padding: 16,
            borderRadius: t.radius.md,
            backgroundColor: t.bg.surfaceAlt,
            alignItems: 'center',
          },
          style,
        ]}
      >
        <Text style={{ color: t.text.tertiary, fontSize: 13 }}>
          No es día planificado
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
            borderRadius: t.radius.md,
            backgroundColor: isSkipped ? `${t.status.skip}22` : `${t.status.success}22`,
            borderWidth: t.borderWidth.default,
            borderColor: isSkipped ? t.status.skip : t.status.success,
            alignItems: 'center',
          },
          style,
        ]}
      >
        <Text style={{ color: isSkipped ? t.status.skip : t.status.success, fontSize: 15, fontWeight: '700' }}>
          {isSkipped ? '⏭ Skip usado hoy' : '✓ Completado hoy'}
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
            backgroundColor: pressed ? `${t.status.success}cc` : t.status.success,
            padding: 16,
            borderRadius: t.radius.md,
            alignItems: 'center',
            opacity: loading ? 0.6 : 1,
          })}
        >
          <Text style={{ color: t.text.inverse, fontSize: 16, fontWeight: '700' }}>
            ✓ Completar hoy
          </Text>
        </Pressable>

        {skipAvailable && (
          <Pressable
            onPress={() => setSkipModalVisible(true)}
            disabled={loading}
            style={({ pressed }) => ({
              backgroundColor: pressed ? `${t.status.skip}22` : 'transparent',
              padding: 12,
              borderRadius: t.radius.md,
              borderWidth: t.borderWidth.default,
              borderColor: t.status.skip,
              alignItems: 'center',
              opacity: loading ? 0.6 : 1,
            })}
          >
            <Text style={{ color: t.status.skip, fontSize: 14, fontWeight: '600' }}>
              ⏭ Usar skip semanal
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
          <View style={{ backgroundColor: t.bg.surface, borderRadius: t.radius.lg, padding: 24 }}>
            <Text style={{ color: t.text.primary, fontSize: 18, fontWeight: '700', marginBottom: 8 }}>
              Usar skip semanal
            </Text>
            <Text style={{ color: t.text.secondary, fontSize: 14, marginBottom: 24 }}>
              Tenés 1 skip por semana ISO. Conta como cumplimiento — no rompe la racha. ¿Confirmás?
            </Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Pressable
                onPress={() => setSkipModalVisible(false)}
                style={{ flex: 1, padding: 12, borderRadius: t.radius.md, borderWidth: t.borderWidth.default, borderColor: t.border.default, alignItems: 'center' }}
              >
                <Text style={{ color: t.text.secondary, fontWeight: '600' }}>Cancelar</Text>
              </Pressable>
              <Pressable
                onPress={async () => {
                  setSkipModalVisible(false);
                  await onSkip();
                }}
                style={{ flex: 1, padding: 12, borderRadius: t.radius.md, backgroundColor: t.status.skip, alignItems: 'center' }}
              >
                <Text style={{ color: t.text.inverse, fontWeight: '700' }}>Confirmar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};
