import { useState } from "react";
import { View, Text, Alert, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { MaterialIcons } from "@expo/vector-icons";
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
    Alert.alert(t("settings.logout_confirm_title"), t("settings.logout_confirm_body"), [
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
    ]);
  };

  return (
    <Screen scrollable>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: theme.spacing.stackLg }}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.unit }}>
          <MaterialIcons name="arrow-back" size={18} color={theme.text.primary} />
          <Text style={{ color: theme.text.primary, fontSize: theme.typography.scale.microBold.fontSize, fontFamily: "Lexend_600SemiBold", letterSpacing: theme.typography.scale.microBold.letterSpacing, textTransform: "uppercase" }}>
            {t("common.back")}
          </Text>
        </Pressable>
        <Text style={{ color: theme.text.primary, fontSize: theme.typography.scale.labelCaps.fontSize, fontFamily: "Anton_400Regular", textTransform: "uppercase" }}>
          {t("settings.title")}
        </Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={{ gap: theme.spacing.stackMd }}>
        <Card style={{ gap: theme.spacing.stackSm }}>
          <Text style={{ color: theme.text.secondary, fontSize: theme.typography.scale.labelCaps.fontSize, fontFamily: "Lexend_600SemiBold", letterSpacing: theme.typography.scale.labelCaps.letterSpacing, textTransform: "uppercase" }}>
            {t("settings.language_section")}
          </Text>
          <LanguageSelector />
        </Card>
        <ThemePicker />
        <Button label={loggingOut ? t("settings.logging_out") : t("settings.logout")} variant="danger" onPress={handleLogout} disabled={loggingOut} />
      </View>
    </Screen>
  );
}
