import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { Screen, Skeleton, Card } from "@core/components";
import { useTheme, type MasteryLevel } from "@core/theming";
import { useSessionStore } from "@core/states/session.store";
import { useHabits } from "@habits/index";
import { getLevel, MasteryLevelIcon } from "@progression/index";

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
  const levelRows = (["seed", "sprout", "tree", "forest", "ancient"] as const)
    .map((key) => {
      const count = habits.filter((h) => (h.mastery_scores?.level ?? "seed") === key).length;
      const level = getLevel(LEVEL_SCORE[key]!);
      return { key, count, level };
    })
    .filter(({ count }) => count > 0);

  return (
    <Screen
      scrollable
      contentStyle={{
        paddingTop: 0,
        paddingHorizontal: 0,
        paddingBottom: theme.spacing.stackLg,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: theme.spacing.marginMobile,
          paddingVertical: theme.spacing.stackSm,
          borderBottomWidth: theme.borderWidth.default,
          borderBottomColor: theme.border.default,
        }}
      >
        <Text
          style={{
            color: theme.text.primary,
            fontSize: 12,
            fontFamily: "Lexend_600SemiBold",
            letterSpacing: 0.7,
            textTransform: "uppercase",
          }}
        >
          {t("dashboard.app_name")}
        </Text>
        <Pressable
          onPress={() => router.push("/settings")}
          hitSlop={12}
          style={({ pressed }) => ({
            width: 32,
            height: 32,
            borderRadius: theme.radius.pill,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: pressed ? theme.bg.surfaceAlt : "transparent",
          })}
        >
          <Ionicons name="settings-outline" size={20} color={theme.text.primary} />
        </Pressable>
      </View>

      <View
        style={{
          paddingHorizontal: theme.spacing.marginMobile,
          paddingTop: theme.spacing.stackLg,
          gap: theme.spacing.stackLg,
        }}
      >
        <View style={{ alignItems: "center", gap: theme.spacing.stackMd }}>
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: theme.radius.pill,
              backgroundColor: theme.bg.surfaceAlt,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
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
        </View>

        <Card style={{ alignItems: "center", paddingVertical: theme.spacing.stackLg }}>
          {loading ? (
            <View style={{ gap: theme.spacing.stackSm, width: "100%", alignItems: "center" }}>
              <Skeleton width="50%" height={theme.typography.scale.displaySm.fontSize} />
              <Skeleton width="36%" height={28} />
            </View>
          ) : (
            <>
              <Text style={{ color: theme.text.primary, fontSize: theme.typography.scale.displaySm.fontSize, lineHeight: theme.typography.scale.displaySm.lineHeight, fontFamily: "Anton_400Regular", letterSpacing: theme.typography.scale.displaySm.letterSpacing, fontVariant: ["tabular-nums"] }}>
                {avgScore.toFixed(1)}
              </Text>
              <View style={{ borderWidth: theme.borderWidth.default, borderColor: theme.border.strong, borderRadius: theme.radius.pill, paddingHorizontal: 12, paddingVertical: 4 }}>
                <Text style={{ color: theme.text.primary, fontSize: 12, fontFamily: "Lexend_500Medium", letterSpacing: 0.6, textTransform: "uppercase" }}>
                  {globalLevel.label} Level
                </Text>
              </View>
            </>
          )}
        </Card>

        {!loading && levelRows.length > 0 && (
          <View style={{ gap: theme.spacing.stackMd }}>
            <Text
              style={{
                color: theme.text.secondary,
                fontSize: theme.typography.scale.labelCaps.fontSize,
                fontFamily: "Lexend_600SemiBold",
                letterSpacing: theme.typography.scale.labelCaps.letterSpacing,
                textTransform: "uppercase",
                paddingBottom: theme.spacing.stackSm,
                borderBottomWidth: theme.borderWidth.default,
                borderBottomColor: theme.border.default,
              }}
            >
              {t("profile.levels_section")}
            </Text>
            <View>
              {levelRows.map(({ key, count, level }, index) => {
                const isActive = globalLevel.key === level.key;
                return (
                  <View
                    key={key}
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingVertical: theme.spacing.stackMd,
                      paddingHorizontal: theme.spacing.stackSm,
                      marginHorizontal: -theme.spacing.stackSm,
                      borderBottomWidth: index === levelRows.length - 1 ? 0 : theme.borderWidth.default,
                      borderBottomColor: theme.border.default,
                    }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.stackMd }}>
                      <MasteryLevelIcon level={key as MasteryLevel} size={20} />
                      <Text style={{ color: theme.text.primary, fontSize: 18, lineHeight: 28, fontFamily: isActive ? "Lexend_500Medium" : "Lexend_400Regular" }}>{level.label}</Text>
                    </View>
                    <Text style={{ color: theme.text.secondary, fontSize: theme.typography.scale.labelCaps.fontSize, fontFamily: "Lexend_600SemiBold", letterSpacing: theme.typography.scale.labelCaps.letterSpacing }}>
                      {t("profile.habits_count", { count })}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </View>
    </Screen>
  );
}
