import { useState } from "react";
import { View, Text, Alert } from "react-native";
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
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 24, gap: 12 }}>
        <Text
          onPress={() => router.back()}
          style={{ color: theme.accent.primary, fontSize: 15 }}
        >
          {t("common.back")}
        </Text>
        <Text style={{ color: theme.text.primary, fontSize: 20, fontWeight: "700" }}>
          {t("settings.title")}
        </Text>
      </View>

      {/* Language */}
      <Card style={{ marginBottom: 16 }}>
        <Text
          style={{
            color: theme.text.tertiary,
            fontSize: 11,
            fontWeight: "600",
            letterSpacing: 1,
            marginBottom: 12,
          }}
        >
          {t("settings.language_section")}
        </Text>
        <LanguageSelector />
      </Card>

      {/* Theme */}
      <Card style={{ marginBottom: 16 }}>
        <Text
          style={{
            color: theme.text.tertiary,
            fontSize: 11,
            fontWeight: "600",
            letterSpacing: 1,
            marginBottom: 12,
          }}
        >
          {t("settings.theme_section")}
        </Text>
        <ThemePicker />
      </Card>

      {/* Logout */}
      <Button
        label={loggingOut ? t("settings.logging_out") : t("settings.logout")}
        variant="danger"
        onPress={handleLogout}
        disabled={loggingOut}
      />
    </Screen>
  );
}
