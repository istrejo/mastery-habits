import React, { useState } from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import { useTranslation } from 'react-i18next';
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
  const theme = useTheme();
  const { t } = useTranslation();
  const { themeId, setTheme } = useThemeStore();
  const [premiumModalVisible, setPremiumModalVisible] = useState(false);

  const renderCard = (id: ThemeId) => {
    const themeData = THEMES[id];
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
          borderRadius: theme.radius.md,
          borderWidth: isActive ? theme.borderWidth.bold : theme.borderWidth.hairline,
          borderColor: isActive ? theme.accent.primary : theme.border.default,
          overflow: 'hidden',
          opacity: pressed ? 0.85 : 1,
        })}
      >
        {/* Mini preview */}
        <View style={{ backgroundColor: themeData.bg.base, padding: 10, gap: 6 }}>
          <View style={{
            backgroundColor: themeData.bg.surface,
            borderRadius: themeData.radius.sm,
            padding: 8,
            borderWidth: themeData.borderWidth.hairline,
            borderColor: themeData.border.default,
            gap: 4,
          }}>
            <View style={{ width: 28, height: 4, borderRadius: themeData.radius.pill, backgroundColor: themeData.accent.primary }} />
            <View style={{ width: 40, height: 3, borderRadius: themeData.radius.pill, backgroundColor: themeData.text.secondary, opacity: 0.5 }} />
            <View style={{ width: 20, height: 3, borderRadius: themeData.radius.pill, backgroundColor: themeData.text.tertiary, opacity: 0.4 }} />
          </View>
        </View>

        {/* Label row */}
        <View style={{
          backgroundColor: theme.bg.surface,
          paddingHorizontal: 10,
          paddingVertical: 8,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTopWidth: theme.borderWidth.hairline,
          borderTopColor: theme.border.subtle,
        }}>
          <Text style={{ color: theme.text.primary, fontSize: 12, fontWeight: '600' }}>
            {themeData.meta.name}
          </Text>
          <View style={{
            paddingHorizontal: 6,
            paddingVertical: 2,
            borderRadius: theme.radius.pill,
            backgroundColor: isFree ? theme.accent.muted : `${theme.status.info}22`,
          }}>
            <Text style={{
              fontSize: 9,
              fontWeight: '700',
              color: isFree ? theme.accent.primary : theme.status.info,
              letterSpacing: 0.5,
            }}>
              {isFree ? t('theme_picker.badge_free') : t('theme_picker.badge_premium')}
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
            borderRadius: theme.radius.pill,
            backgroundColor: theme.accent.primary,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Text style={{ fontSize: 9, color: theme.accent.onPrimary, fontWeight: '800' }}>✓</Text>
          </View>
        )}

        {!isFree && (
          <View style={{
            position: 'absolute',
            top: 6,
            left: 6,
            width: 16,
            height: 16,
            borderRadius: theme.radius.pill,
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
        <Text style={{ color: theme.text.tertiary, fontSize: 11, fontWeight: '600', letterSpacing: 1 }}>
          {t('theme_picker.free_tier')}
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {FREE_THEMES.map(renderCard)}
        </View>

        {/* Divider */}
        <View style={{ height: theme.borderWidth.hairline, backgroundColor: theme.border.subtle, marginVertical: 4 }} />

        {/* Premium tier */}
        <Text style={{ color: theme.text.tertiary, fontSize: 11, fontWeight: '600', letterSpacing: 1 }}>
          {t('theme_picker.premium_tier')}
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
              backgroundColor: theme.bg.elevated,
              borderRadius: theme.radius.lg,
              borderWidth: theme.borderWidth.default,
              borderColor: theme.border.default,
              padding: 24,
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Text style={{ fontSize: 28 }}>🔒</Text>
            <Text style={{ color: theme.text.primary, fontSize: 18, fontWeight: '700' }}>
              {t('theme_picker.coming_soon_title')}
            </Text>
            <Text style={{ color: theme.text.secondary, fontSize: 14, textAlign: 'center', lineHeight: 20 }}>
              {t('theme_picker.coming_soon_body')}
            </Text>
            <Pressable
              onPress={() => setPremiumModalVisible(false)}
              style={{
                marginTop: 8,
                paddingVertical: 10,
                paddingHorizontal: 24,
                borderRadius: theme.radius.md,
                backgroundColor: theme.accent.primary,
              }}
            >
              <Text style={{ color: theme.accent.onPrimary, fontWeight: '700', fontSize: 14 }}>
                {t('theme_picker.understood')}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
};
