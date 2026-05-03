import { useState } from "react";
import { View, Text, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Screen, Card, Button, Skeleton, ThemePicker, LanguagePicker } from "@core/components";
import { useTheme, type MasteryLevel } from "@core/theming";
import { useSessionStore } from "@core/states/session.store";
import { authService } from "@auth/services/auth.service";
import { useHabits } from "@habits/index";
import { getLevel } from "@progression/index";

export default function ProfileScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { user, clear } = useSessionStore();
  const { habits, loading } = useHabits();
  const [loggingOut, setLoggingOut] = useState(false);

  const avgScore =
    habits.length > 0
      ? habits.reduce((sum, h) => sum + (h.mastery_scores?.score ?? 0), 0) / habits.length
      : 0;

  const globalLevel = getLevel(avgScore);

  const scoreColor =
    avgScore >= 71 ? theme.score.excellent
    : avgScore >= 46 ? theme.score.good
    : avgScore >= 21 ? theme.score.warning
    : theme.score.critical;

  const handleLogout = () => {
    Alert.alert(
      t("profile.logout_confirm_title"),
      t("profile.logout_confirm_body"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("profile.logout_exit"),
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

  const displayName = user?.user_metadata?.["display_name"] as string | undefined;
  const email = user?.email ?? "";
  const initials = displayName
    ? displayName.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase()
    : email.slice(0, 2).toUpperCase();

  return (
    <Screen scrollable>
      <Text style={{ color: theme.text.tertiary, fontSize: 11, fontWeight: "600", letterSpacing: 1, marginBottom: 20 }}>
        {t("profile.title")}
      </Text>

      {/* Avatar + identity */}
      <Card style={{ marginBottom: 16, alignItems: "center" }}>
        <View style={{
          width: 72,
          height: 72,
          borderRadius: theme.radius.pill,
          backgroundColor: theme.accent.muted,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 12,
        }}>
          <Text style={{ color: theme.accent.primary, fontSize: 26, fontWeight: "800" }}>
            {initials}
          </Text>
        </View>
        {displayName ? (
          <Text style={{ color: theme.text.primary, fontSize: 18, fontWeight: "700", marginBottom: 4 }}>
            {displayName}
          </Text>
        ) : null}
        <Text style={{ color: theme.text.secondary, fontSize: 14 }}>
          {email}
        </Text>
      </Card>

      {/* Global score */}
      <Card style={{ marginBottom: 16 }}>
        <Text style={{ color: theme.text.tertiary, fontSize: 11, fontWeight: "600", letterSpacing: 1, marginBottom: 12 }}>
          {t("profile.score_global")}
        </Text>
        {loading ? (
          <View style={{ gap: 8 }}>
            <Skeleton width="35%" height={52} />
            <Skeleton width="50%" height={14} />
          </View>
        ) : (
          <>
            <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 8, marginBottom: 8 }}>
              <Text style={{
                color: scoreColor,
                fontSize: 52,
                fontWeight: "800",
                fontFamily: theme.typography.displayFontFamily,
                fontVariant: ["tabular-nums"],
                lineHeight: 60,
              }}>
                {avgScore.toFixed(1)}
              </Text>
              <Text style={{ color: theme.text.tertiary, fontSize: 13, marginBottom: 8 }}>
                {t("common.score_suffix")}
              </Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Text style={{ fontSize: 16 }}>{globalLevel.emoji}</Text>
              <Text style={{ color: theme.level[globalLevel.key as MasteryLevel].fg, fontSize: 13, fontWeight: "600" }}>
                {globalLevel.label}
              </Text>
              <Text style={{ color: theme.text.tertiary, fontSize: 13 }}>
                · {t("profile.habits_count", { count: habits.length })}
              </Text>
            </View>
          </>
        )}
      </Card>

      {/* Stats */}
      {!loading && habits.length > 0 && (
        <Card style={{ marginBottom: 16 }}>
          <Text style={{ color: theme.text.tertiary, fontSize: 11, fontWeight: "600", letterSpacing: 1, marginBottom: 12 }}>
            {t("profile.distribution")}
          </Text>
          {["ancient", "forest", "tree", "sprout", "seed"].map((key) => {
            const count = habits.filter((h) => (h.mastery_scores?.level ?? "seed") === key).length;
            if (count === 0) return null;
            const level = getLevel(key === "ancient" ? 100 : key === "forest" ? 80 : key === "tree" ? 58 : key === "sprout" ? 33 : 10);
            return (
              <View key={key} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <Text style={{ color: theme.level[level.key as MasteryLevel].fg, fontSize: 13 }}>
                  {level.emoji} {level.label}
                </Text>
                <Text style={{ color: theme.text.secondary, fontSize: 13, fontWeight: "600" }}>
                  {count}
                </Text>
              </View>
            );
          })}
        </Card>
      )}

      {/* Theme picker */}
      <Card style={{ marginBottom: 16 }}>
        <Text style={{ color: theme.text.tertiary, fontSize: 11, fontWeight: "600", letterSpacing: 1, marginBottom: 12 }}>
          {t("profile.theme_section")}
        </Text>
        <ThemePicker />
      </Card>

      {/* Language picker */}
      <Card style={{ marginBottom: 16 }}>
        <Text style={{ color: theme.text.tertiary, fontSize: 11, fontWeight: "600", letterSpacing: 1, marginBottom: 12 }}>
          {t("profile.language_section")}
        </Text>
        <LanguagePicker />
      </Card>

      <Button
        label={loggingOut ? t("profile.logging_out") : t("profile.logout")}
        variant="danger"
        onPress={handleLogout}
        disabled={loggingOut}
      />
    </Screen>
  );
}
