import React, { useState } from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import { useTheme, useThemeStore, THEMES, type ThemeId } from '@core/theming';

const FREE_THEMES: ThemeId[] = [
  'tech-neon',
  'minimal-light',
  'organic-growth',
  'brutalist-editorial',
  'cyberpunk',
  'terminal-phosphor',
];
const PREMIUM_THEMES: ThemeId[] = [];

export const ThemePicker: React.FC = () => {
  const t = useTheme();
  const { themeId, setTheme } = useThemeStore();
  const [premiumModalVisible, setPremiumModalVisible] = useState(false);

  const renderCard = (id: ThemeId) => {
    const theme = THEMES[id];
    const isActive = themeId === id;
    const isFree = FREE_THEMES.includes(id);

    return (
      <Pressable
        key={id}
        onPress={() => {
          if (isFree) {
            setTheme(id);
          } else {
            setPremiumModalVisible(true);
          }
        }}
        style={({ pressed }) => ({
          flex: 1,
          minWidth: '45%',
          maxWidth: '48%',
          borderRadius: t.radius.md,
          borderWidth: isActive ? t.borderWidth.bold : t.borderWidth.hairline,
          borderColor: isActive ? t.accent.primary : t.border.default,
          overflow: 'hidden',
          opacity: pressed ? 0.85 : 1,
        })}
      >
        {/* Mini preview */}
        <View style={{ backgroundColor: theme.bg.base, padding: 10, gap: 6 }}>
          <View style={{
            backgroundColor: theme.bg.surface,
            borderRadius: theme.radius.sm,
            padding: 8,
            borderWidth: theme.borderWidth.hairline,
            borderColor: theme.border.default,
            gap: 4,
          }}>
            <View style={{ width: 28, height: 4, borderRadius: theme.radius.pill, backgroundColor: theme.accent.primary }} />
            <View style={{ width: 40, height: 3, borderRadius: theme.radius.pill, backgroundColor: theme.text.secondary, opacity: 0.5 }} />
            <View style={{ width: 20, height: 3, borderRadius: theme.radius.pill, backgroundColor: theme.text.tertiary, opacity: 0.4 }} />
          </View>
        </View>

        {/* Label row */}
        <View style={{
          backgroundColor: t.bg.surface,
          paddingHorizontal: 10,
          paddingVertical: 8,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTopWidth: t.borderWidth.hairline,
          borderTopColor: t.border.subtle,
        }}>
          <Text style={{ color: t.text.primary, fontSize: 12, fontWeight: '600' }}>
            {theme.meta.name}
          </Text>
          <View style={{
            paddingHorizontal: 6,
            paddingVertical: 2,
            borderRadius: t.radius.pill,
            backgroundColor: isFree ? t.accent.muted : `${t.status.info}22`,
          }}>
            <Text style={{
              fontSize: 9,
              fontWeight: '700',
              color: isFree ? t.accent.primary : t.status.info,
              letterSpacing: 0.5,
            }}>
              {isFree ? 'FREE' : 'PREMIUM'}
            </Text>
          </View>
        </View>

        {isActive && (
          <View style={{
            position: 'absolute',
            top: 6,
            right: 6,
            width: 16,
            height: 16,
            borderRadius: t.radius.pill,
            backgroundColor: t.accent.primary,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Text style={{ fontSize: 9, color: t.accent.onPrimary, fontWeight: '800' }}>✓</Text>
          </View>
        )}

        {!isFree && (
          <View style={{
            position: 'absolute',
            top: 6,
            left: 6,
            width: 16,
            height: 16,
            borderRadius: t.radius.pill,
            backgroundColor: 'rgba(0,0,0,0.5)',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Text style={{ fontSize: 9 }}>🔒</Text>
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <>
      <View style={{ gap: 12 }}>
        {/* Free tier */}
        <Text style={{ color: t.text.tertiary, fontSize: 11, fontWeight: '600', letterSpacing: 1 }}>
          GRATIS
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {FREE_THEMES.map(renderCard)}
        </View>

        {/* Divider */}
        <View style={{ height: t.borderWidth.hairline, backgroundColor: t.border.subtle, marginVertical: 4 }} />

        {/* Premium tier */}
        <Text style={{ color: t.text.tertiary, fontSize: 11, fontWeight: '600', letterSpacing: 1 }}>
          PREMIUM
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {PREMIUM_THEMES.map(renderCard)}
        </View>
      </View>

      <Modal
        visible={premiumModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPremiumModalVisible(false)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 32 }}
          onPress={() => setPremiumModalVisible(false)}
        >
          <View
            style={{
              backgroundColor: t.bg.elevated,
              borderRadius: t.radius.lg,
              borderWidth: t.borderWidth.default,
              borderColor: t.border.default,
              padding: 24,
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Text style={{ fontSize: 28 }}>🔒</Text>
            <Text style={{ color: t.text.primary, fontSize: 18, fontWeight: '700' }}>
              Próximamente
            </Text>
            <Text style={{ color: t.text.secondary, fontSize: 14, textAlign: 'center', lineHeight: 20 }}>
              Los temas premium estarán disponibles en la versión completa de Mastery Habits.
            </Text>
            <Pressable
              onPress={() => setPremiumModalVisible(false)}
              style={{
                marginTop: 8,
                paddingVertical: 10,
                paddingHorizontal: 24,
                borderRadius: t.radius.md,
                backgroundColor: t.accent.primary,
              }}
            >
              <Text style={{ color: t.accent.onPrimary, fontWeight: '700', fontSize: 14 }}>
                Entendido
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
};
