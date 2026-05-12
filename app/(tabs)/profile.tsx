import { View, Text, Pressable, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Screen, Skeleton, Card } from "@core/components";
import { useTheme } from "@core/theming";
import { useSessionStore } from "@core/states/session.store";
import { useHabits } from "@habits/index";
import { getLevel } from "@progression/index";

const LEVEL_SCORE: Record<string, number> = { ancient: 100, forest: 80, tree: 58, sprout: 33, seed: 10 };

export default function ProfileScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useSessionStore();
  const { habits, loading } = useHabits();

  const avgScore = habits.length > 0 ? habits.reduce((sum, h) => sum + (h.mastery_scores?.score ?? 0), 0) / habits.length : 0;
  const globalLevel = getLevel(avgScore);
  const displayName = user?.user_metadata?.["display_name"] as string | undefined;
  const email = user?.email ?? "";
  const initials = displayName ? displayName.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase() : email.slice(0, 2).toUpperCase();

  return (
    <Screen scrollable>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: theme.spacing.stackLg }}>
        <Text style={{ color: theme.text.primary, fontSize: theme.typography.scale.microBold.fontSize, fontFamily: "Lexend_600SemiBold", letterSpacing: theme.typography.scale.microBold.letterSpacing, textTransform: "uppercase" }}>
          {t("dashboard.app_name")}
        </Text>
        <TouchableOpacity onPress={() => router.push("/settings")} hitSlop={12} style={{ width: 40, height: 40, borderRadius: theme.radius.pill, alignItems: "center", justifyContent: "center" }}>
          <Ionicons name="settings-outline" size={20} color={theme.text.primary} />
        </TouchableOpacity>
      </View>

      <View style={{ gap: theme.spacing.stackLg }}>
        <Card style={{ alignItems: "center", gap: theme.spacing.stackMd }}>
          <View style={{ width: 96, height: 96, borderRadius: theme.radius.pill, backgroundColor: theme.bg.surfaceAlt, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ color: theme.text.primary, fontSize: theme.typography.scale.titleLg.fontSize, fontFamily: "Anton_400Regular", letterSpacing: theme.typography.scale.titleLg.letterSpacing }}>
              {initials}
            </Text>
          </View>
          <View style={{ alignItems: "center", gap: 4 }}>
            <Text style={{ color: theme.text.primary, fontSize: theme.typography.scale.titleSm.fontSize, lineHeight: theme.typography.scale.titleSm.lineHeight, fontFamily: "Anton_400Regular", letterSpacing: theme.typography.scale.titleSm.letterSpacing, textAlign: "center" }}>
              {displayName ?? "Mastery Athlete"}
            </Text>
            <Text style={{ color: theme.text.secondary, fontSize: theme.typography.scale.bodyMain.fontSize, fontFamily: "Lexend_400Regular", textAlign: "center" }}>
              {email}
            </Text>
          </View>
          <Pressable onPress={() => router.push("/settings")} style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: theme.spacing.unit, borderWidth: theme.borderWidth.default, borderColor: pressed ? theme.border.strong : theme.border.default, borderRadius: theme.radius.md, paddingHorizontal: theme.spacing.stackMd, paddingVertical: theme.spacing.stackSm })}>
            <Text style={{ color: theme.text.primary, fontSize: theme.typography.scale.microBold.fontSize, fontFamily: "Lexend_600SemiBold", letterSpacing: theme.typography.scale.microBold.letterSpacing, textTransform: "uppercase" }}>
              {t("profile.edit")}
            </Text>
            <MaterialIcons name="edit" size={14} color={theme.text.primary} />
          </Pressable>
        </Card>

        <Card style={{ alignItems: "center" }}>
          {loading ? (
            <View style={{ gap: theme.spacing.stackSm, width: "100%" }}>
              <Skeleton width="40%" height={theme.typography.scale.displaySm.fontSize} />
              <Skeleton width="60%" height={theme.typography.scale.bodyMain.fontSize} />
            </View>
          ) : (
            <>
              <Text style={{ color: theme.text.primary, fontSize: theme.typography.scale.displayXl.fontSize, lineHeight: theme.typography.scale.displayXl.lineHeight, fontFamily: "Anton_400Regular", letterSpacing: theme.typography.scale.displayXl.letterSpacing, fontVariant: ["tabular-nums"] }}>
                {avgScore.toFixed(1)}
              </Text>
              <View style={{ borderWidth: theme.borderWidth.default, borderColor: theme.border.strong, borderRadius: theme.radius.pill, paddingHorizontal: theme.spacing.stackMd, paddingVertical: theme.spacing.stackSm, marginTop: theme.spacing.stackSm }}>
                <Text style={{ color: theme.text.primary, fontSize: theme.typography.scale.microBold.fontSize, fontFamily: "Lexend_500Medium", letterSpacing: theme.typography.scale.microBold.letterSpacing, textTransform: "uppercase" }}>
                  {globalLevel.label} Level
                </Text>
              </View>
              <Text style={{ color: theme.text.secondary, fontSize: theme.typography.scale.bodyMain.fontSize, fontFamily: "Lexend_400Regular", marginTop: theme.spacing.stackSm }}>
                {t("profile.habits_count", { count: habits.length })}
              </Text>
            </>
          )}
        </Card>

        {!loading && habits.length > 0 && (
          <View style={{ gap: theme.spacing.stackMd }}>
            <Text style={{ color: theme.text.primary, fontSize: theme.typography.scale.labelCaps.fontSize, fontFamily: "Anton_400Regular", textTransform: "uppercase" }}>
              Habit Levels
            </Text>
            <Card style={{ padding: 0, overflow: "hidden" }}>
              {(["seed", "sprout", "tree", "forest", "ancient"] as const).map((key) => {
                const count = habits.filter((h) => (h.mastery_scores?.level ?? "seed") === key).length;
                const level = getLevel(LEVEL_SCORE[key]!);
                const isActive = globalLevel.key === level.key;
                return (
                  <View key={key} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: theme.spacing.stackMd, borderBottomWidth: key === "ancient" ? 0 : theme.borderWidth.default, borderBottomColor: theme.border.default, borderLeftWidth: isActive ? 4 : 0, borderLeftColor: theme.accent.primary }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.stackSm }}>
                      <Text style={{ fontSize: 18 }}>{level.emoji}</Text>
                      <Text style={{ color: theme.text.primary, fontSize: theme.typography.scale.bodyMain.fontSize, fontFamily: isActive ? "Lexend_600SemiBold" : "Lexend_400Regular" }}>{level.label}</Text>
                    </View>
                    <Text style={{ color: isActive ? theme.text.primary : theme.text.secondary, fontSize: theme.typography.scale.bodyMain.fontSize, fontFamily: "Lexend_600SemiBold" }}>
                      {count} {count === 1 ? "Habit" : "Habits"}
                    </Text>
                  </View>
                );
              })}
            </Card>
          </View>
        )}
      </View>
    </Screen>
  );
}
