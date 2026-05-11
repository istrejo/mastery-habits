import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme, useThemeStore, THEMES, type ThemeId } from '@core/theming';

const THEME_TAGLINES: Record<ThemeId, string> = {
  'tech-neon': 'High Contrast · Default',
  'minimal-light': 'Clean · Minimal',
  'organic-growth': 'Natural · Calm',
  'brutalist-editorial': 'Monochrome · Raw',
  'cyberpunk': 'Neon · Intense',
  'terminal-phosphor': 'Retro · Code',
};

const ALL_THEMES = Object.keys(THEMES) as ThemeId[];

export const ThemePicker: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { themeId, setTheme } = useThemeStore();
  const [premiumModalVisible, setPremiumModalVisible] = useState(false);

  return (
    <>
      {/* Section header */}
      <View style={{
        backgroundColor: theme.bg.surfaceAlt,
        borderColor: theme.border.subtle,
        borderWidth: theme.borderWidth.default,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.marginMobile,
        gap: theme.spacing.stackMd,
      }}>
        <Text style={{
          color: theme.text.secondary,
          fontSize: theme.typography.scale.labelCaps.fontSize,
          fontFamily: 'Inter_600SemiBold',
          letterSpacing: theme.typography.scale.labelCaps.letterSpacing,
          textTransform: 'uppercase',
        }}>
          {t('settings.theme_section')}
        </Text>

        <View style={{ gap: theme.spacing.stackSm }}>
          {ALL_THEMES.map((id) => {
            const themeData = THEMES[id];
            const isActive = themeId === id;
            const isFree = themeData.meta.tier === 'free';
            const tagline = THEME_TAGLINES[id] ?? themeData.meta.name;

            return (
              <TouchableOpacity
                key={id}
                activeOpacity={0.8}
                onPress={() => {
                  if (isFree) {
                    setTheme(id);
                  } else {
                    setPremiumModalVisible(true);
                  }
                }}
                style={{
                  backgroundColor: theme.bg.elevated,
                  borderRadius: theme.radius.lg,
                  borderWidth: isActive ? 2 : theme.borderWidth.default,
                  borderColor: isActive ? theme.accent.primary : theme.border.subtle,
                  padding: theme.spacing.stackMd,
                  gap: theme.spacing.stackMd,
                }}
              >
                {/* Active checkmark */}
                {isActive && (
                  <View style={{ position: 'absolute', top: theme.spacing.stackMd, right: theme.spacing.stackMd }}>
                    <Ionicons name="checkmark-circle" size={28} color={theme.accent.primary} />
                  </View>
                )}

                {/* Theme info */}
                <View style={{ gap: theme.spacing.unit, paddingRight: isActive ? 36 : 0 }}>
                  <Text style={{
                    color: theme.text.primary,
                    fontSize: theme.typography.scale.titleSm.fontSize,
                    fontWeight: '700',
                    fontFamily: 'Inter_700Bold',
                    letterSpacing: theme.typography.scale.titleSm.letterSpacing,
                  }}>
                    {themeData.meta.name}
                    {!isFree ? '  🔒' : ''}
                  </Text>
                  <Text style={{
                    color: theme.text.secondary,
                    fontSize: theme.typography.scale.microBold.fontSize,
                    fontFamily: 'Inter_500Medium',
                    letterSpacing: theme.typography.scale.microBold.letterSpacing,
                    textTransform: 'uppercase',
                  }}>
                    {tagline}
                  </Text>
                </View>

                {/* Color swatches */}
                <View style={{ flexDirection: 'row', gap: theme.spacing.unit }}>
                  {[themeData.bg.base, themeData.accent.primary, themeData.bg.surface].map((color, i) => (
                    <View
                      key={i}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: theme.radius.pill,
                        backgroundColor: color,
                        borderWidth: theme.borderWidth.default,
                        borderColor: theme.border.subtle,
                      }}
                    />
                  ))}
                </View>

                {/* Mini habit card preview */}
                <View style={{
                  backgroundColor: themeData.bg.base,
                  borderRadius: themeData.radius.sm,
                  padding: theme.spacing.stackSm,
                  borderWidth: themeData.borderWidth.default,
                  borderColor: themeData.border.default,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  opacity: 0.8,
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.stackSm }}>
                    <View style={{
                      width: 16,
                      height: 16,
                      borderRadius: themeData.radius.pill,
                      borderWidth: 1,
                      borderColor: themeData.accent.primary,
                    }} />
                    <Text style={{
                      color: themeData.text.primary,
                      fontSize: theme.typography.scale.labelCaps.fontSize,
                      fontFamily: 'Inter_600SemiBold',
                      letterSpacing: theme.typography.scale.labelCaps.letterSpacing,
                    }}>
                      MORNING ROUTINE
                    </Text>
                  </View>
                  <Text style={{
                    color: themeData.accent.primary,
                    fontSize: theme.typography.scale.microBold.fontSize,
                    fontFamily: 'Inter_500Medium',
                  }}>
                    4/5
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
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
          <View style={{
            backgroundColor: theme.bg.elevated,
            borderRadius: theme.radius.lg,
            borderWidth: theme.borderWidth.default,
            borderColor: theme.border.default,
            padding: 24,
            alignItems: 'center',
            gap: 8,
          }}>
            <Text style={{ fontSize: 28 }}>🔒</Text>
            <Text style={{ color: theme.text.primary, fontSize: 18, fontWeight: '700', fontFamily: 'Inter_700Bold' }}>
              {t('theme_picker.coming_soon_title')}
            </Text>
            <Text style={{ color: theme.text.secondary, fontSize: 14, textAlign: 'center', lineHeight: 20, fontFamily: 'Inter_400Regular' }}>
              {t('theme_picker.coming_soon_body')}
            </Text>
            <TouchableOpacity
              onPress={() => setPremiumModalVisible(false)}
              style={{
                marginTop: 8,
                paddingVertical: 10,
                paddingHorizontal: 24,
                borderRadius: theme.radius.md,
                backgroundColor: theme.accent.primary,
              }}
            >
              <Text style={{ color: theme.accent.onPrimary, fontWeight: '700', fontFamily: 'Inter_700Bold', fontSize: 14 }}>
                {t('theme_picker.understood')}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </>
  );
};
