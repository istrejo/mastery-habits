import { View, Text, Pressable, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { Screen, Skeleton } from "@core/components";
import { useTheme, type MasteryLevel } from "@core/theming";
import { useSessionStore } from "@core/states/session.store";
import { useHabits } from "@habits/index";
import { getLevel } from "@progression/index";

const LEVEL_SCORE: Record<string, number> = {
  ancient: 100, forest: 80, tree: 58, sprout: 33, seed: 10,
};

export default function ProfileScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useSessionStore();
  const { habits, loading } = useHabits();

  const avgScore =
    habits.length > 0
      ? habits.reduce((sum, h) => sum + (h.mastery_scores?.score ?? 0), 0) / habits.length
      : 0;

  const globalLevel = getLevel(avgScore);

  const displayName = user?.user_metadata?.["display_name"] as string | undefined;
  const email = user?.email ?? "";
  const initials = displayName
    ? displayName.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase()
    : email.slice(0, 2).toUpperCase();

  const cardStyle = {
    backgroundColor: theme.bg.surfaceAlt,
    borderColor: theme.border.subtle,
    borderWidth: theme.borderWidth.default,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.marginMobile,
  } as const;

  return (
    <Screen scrollable>
      {/* TopAppBar */}
      <View style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: theme.spacing.stackMd,
      }}>
        <Text style={{
          color: theme.text.primary,
          fontSize: theme.typography.scale.labelCaps.fontSize,
          fontWeight: "600",
          fontFamily: "Inter_600SemiBold",
          letterSpacing: theme.typography.scale.labelCaps.letterSpacing,
          textTransform: "uppercase",
        }}>
          {t("dashboard.app_name")}
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/settings")}
          hitSlop={12}
          style={{
            width: 40,
            height: 40,
            borderRadius: theme.radius.md,
            borderWidth: theme.borderWidth.default,
            borderColor: theme.border.default,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="settings-outline" size={20} color={theme.accent.primary} />
        </TouchableOpacity>
      </View>

      <View style={{ gap: theme.spacing.stackMd }}>
        {/* Identity card */}
        <View style={[cardStyle, { alignItems: "center", gap: theme.spacing.stackSm }]}>
          <View style={{
            width: 96,
            height: 96,
            borderRadius: theme.radius.pill,
            backgroundColor: theme.bg.elevated,
            borderWidth: 2,
            borderColor: theme.accent.primary,
            alignItems: "center",
            justifyContent: "center",
          }}>
            <Text style={{
              color: theme.accent.primary,
              fontSize: theme.typography.scale.titleLg.fontSize,
              fontWeight: "700",
              fontFamily: "Inter_700Bold",
            }}>
              {initials}
            </Text>
          </View>
          {displayName ? (
            <Text style={{
              color: theme.text.primary,
              fontSize: theme.typography.scale.titleLg.fontSize,
              fontWeight: "700",
              fontFamily: "Inter_700Bold",
              letterSpacing: theme.typography.scale.titleLg.letterSpacing,
            }}>
              {displayName}
            </Text>
          ) : null}
          <Text style={{
            color: theme.text.secondary,
            fontSize: theme.typography.scale.bodyMain.fontSize,
            fontFamily: "Inter_400Regular",
          }}>
            {email}
          </Text>
        </View>

        {/* Global Score */}
        <View style={[cardStyle, { gap: theme.spacing.stackMd }]}>
          <Text style={{
            color: theme.text.secondary,
            fontSize: theme.typography.scale.labelCaps.fontSize,
            fontFamily: "Inter_600SemiBold",
            letterSpacing: theme.typography.scale.labelCaps.letterSpacing,
            textTransform: "uppercase",
          }}>
            {t("profile.score_global")}
          </Text>
          {loading ? (
            <View style={{ gap: theme.spacing.stackSm }}>
              <Skeleton width="35%" height={theme.typography.scale.displayXl.fontSize} />
              <Skeleton width="50%" height={theme.typography.scale.bodyMain.fontSize} />
            </View>
          ) : (
            <View style={{ gap: theme.spacing.stackSm }}>
              <Text style={{
                color: theme.accent.primary,
                fontSize: theme.typography.scale.displayXl.fontSize,
                fontWeight: "900",
                fontFamily: "Inter_900Black",
                letterSpacing: theme.typography.scale.displayXl.letterSpacing,
                lineHeight: theme.typography.scale.displayXl.lineHeight,
                fontVariant: ["tabular-nums"],
              }}>
                {avgScore.toFixed(1)}
              </Text>
              <View style={{
                flexDirection: "row",
                alignItems: "center",
                gap: theme.spacing.unit,
                backgroundColor: theme.bg.elevated,
                paddingHorizontal: theme.spacing.stackSm,
                paddingVertical: theme.spacing.unit,
                borderRadius: theme.radius.sm,
                alignSelf: "flex-start",
              }}>
                <Text style={{ fontSize: 16 }}>{globalLevel.emoji}</Text>
                <Text style={{
                  color: theme.text.primary,
                  fontSize: theme.typography.scale.labelCaps.fontSize,
                  fontFamily: "Inter_600SemiBold",
                  letterSpacing: theme.typography.scale.labelCaps.letterSpacing,
                  textTransform: "uppercase",
                }}>
                  {globalLevel.label}
                </Text>
              </View>
              <Text style={{
                color: theme.text.secondary,
                fontSize: theme.typography.scale.bodyMain.fontSize,
                fontFamily: "Inter_400Regular",
              }}>
                {t("profile.habits_count", { count: habits.length })}
              </Text>
            </View>
          )}
        </View>

        {/* Habit Levels distribution */}
        {!loading && habits.length > 0 && (
          <View style={[cardStyle, { gap: theme.spacing.stackMd }]}>
            <Text style={{
              color: theme.text.secondary,
              fontSize: theme.typography.scale.labelCaps.fontSize,
              fontFamily: "Inter_600SemiBold",
              letterSpacing: theme.typography.scale.labelCaps.letterSpacing,
              textTransform: "uppercase",
            }}>
              {t("profile.distribution")}
            </Text>
            <View style={{ gap: theme.spacing.stackSm }}>
              {["ancient", "forest", "tree", "sprout", "seed"].map((key) => {
                const count = habits.filter((h) => (h.mastery_scores?.level ?? "seed") === key).length;
                if (count === 0) return null;
                const level = getLevel(LEVEL_SCORE[key]!);
                const isActive = globalLevel.key === level.key;
                return (
                  <View
                    key={key}
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      backgroundColor: theme.bg.base,
                      borderRadius: theme.radius.sm,
                      borderWidth: theme.borderWidth.default,
                      borderColor: isActive ? theme.accent.primary : theme.border.subtle,
                      borderLeftWidth: isActive ? 4 : theme.borderWidth.default,
                      borderLeftColor: isActive ? theme.accent.primary : theme.border.subtle,
                      paddingHorizontal: theme.spacing.stackSm,
                      paddingVertical: theme.spacing.stackSm,
                    }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.stackSm }}>
                      <Text style={{ fontSize: 20 }}>{level.emoji}</Text>
                      <Text style={{
                        color: theme.text.primary,
                        fontSize: theme.typography.scale.bodyMain.fontSize,
                        fontFamily: "Inter_400Regular",
                      }}>
                        {level.label}
                      </Text>
                    </View>
                    <Text style={{
                      color: isActive ? theme.accent.primary : theme.text.secondary,
                      fontSize: theme.typography.scale.titleSm.fontSize,
                      fontWeight: "700",
                      fontFamily: "Inter_700Bold",
                    }}>
                      {count}
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
