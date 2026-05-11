import { useState } from "react";
import { View, Text, Alert, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Screen, Card, Button, ThemePicker, LanguageSelector } from "@core/components";
import { useTheme } from "@core/theming";
import { useSessionStore } from "@core/states/session.store";
import { authService } from "@auth/services/auth.service";

export default function SettingsScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { clear } = useSessionStore();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      t("settings.logout_confirm_title"),
      t("settings.logout_confirm_body"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("settings.logout_exit"),
          style: "destructive",
          onPress: async () => {
            setLoggingOut(true);
            await authService.signOut();
            clear();
            router.replace("/(auth)/login");
          },
        },
      ]
    );
  };

  return (
    <Screen scrollable>
      {/* TopAppBar */}
      <View style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: theme.spacing.stackMd,
      }}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Text style={{
            color: theme.accent.primary,
            fontSize: theme.typography.scale.bodyMain.fontSize,
            fontFamily: "Inter_600SemiBold",
            fontWeight: "600",
          }}>
            ← {t("common.back")}
          </Text>
        </TouchableOpacity>
        <Text style={{
          color: theme.text.primary,
          fontSize: theme.typography.scale.labelCaps.fontSize,
          fontWeight: "600",
          fontFamily: "Inter_600SemiBold",
          letterSpacing: theme.typography.scale.labelCaps.letterSpacing,
          textTransform: "uppercase",
        }}>
          {t("settings.title")}
        </Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={{ gap: theme.spacing.stackMd }}>
        {/* Language */}
        <View style={{
          backgroundColor: theme.bg.surfaceAlt,
          borderColor: theme.border.subtle,
          borderWidth: theme.borderWidth.default,
          borderRadius: theme.radius.lg,
          padding: theme.spacing.marginMobile,
          gap: theme.spacing.stackSm,
        }}>
          <Text style={{
            color: theme.text.secondary,
            fontSize: theme.typography.scale.labelCaps.fontSize,
            fontFamily: "Inter_600SemiBold",
            letterSpacing: theme.typography.scale.labelCaps.letterSpacing,
            textTransform: "uppercase",
          }}>
            {t("settings.language_section")}
          </Text>
          <LanguageSelector />
        </View>

        {/* Theme */}
        <ThemePicker />

        {/* Logout */}
        <Button
          label={loggingOut ? t("settings.logging_out") : t("settings.logout")}
          variant="danger"
          onPress={handleLogout}
          disabled={loggingOut}
        />
      </View>
    </Screen>
  );
}
