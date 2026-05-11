/* stitch: stats-dashboard */
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { subDays, format } from "date-fns";
import { useTranslation } from "react-i18next";
import { Screen, ProgressBar } from "@core/components";
import { useTheme } from "@core/theming";
import { useHabits } from "@habits/index";
import { isPlannedDay } from "@checkin/index";

function ActivityGrid() {
  const theme = useTheme();
  const { habits } = useHabits();
  const today = new Date();
  const COLS = 10;
  const ROWS = 7;
  const TOTAL = COLS * ROWS;

  const cells = Array.from({ length: TOTAL }, (_, i) => {
    const date = subDays(today, TOTAL - 1 - i);
    const planned = habits.filter((h) => isPlannedDay(h, date)).length;
    const intensity = habits.length > 0 ? planned / habits.length : 0;
    return intensity;
  });

  const cellColor = (intensity: number) => {
    if (intensity === 0) return theme.bg.elevated;
    if (intensity < 0.3) return `${theme.accent.primary}40`;
    if (intensity < 0.6) return `${theme.accent.primary}80`;
    if (intensity < 0.9) return `${theme.accent.primary}BF`;
    return theme.accent.primary;
  };

  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 3 }}>
      {cells.map((intensity, i) => (
        <View
          key={i}
          style={{
            width: 12,
            height: 12,
            borderRadius: theme.radius.sm / 2,
            backgroundColor: cellColor(intensity),
          }}
        />
      ))}
    </View>
  );
}

export default function StatsScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { habits, loading } = useHabits();

  const sorted = [...habits].sort(
    (a, b) => (b.mastery_scores?.score ?? 0) - (a.mastery_scores?.score ?? 0)
  );
  const top3 = sorted.slice(0, 3);

  const avgScore =
    habits.length > 0
      ? habits.reduce((s, h) => s + (h.mastery_scores?.score ?? 0), 0) / habits.length
      : 0;

  const scoreColor =
    avgScore >= 71 ? theme.score.excellent
    : avgScore >= 46 ? theme.score.good
    : avgScore >= 21 ? theme.score.warning
    : theme.score.critical;

  const RANK_COLORS = [theme.accent.primary, theme.text.secondary, theme.text.secondary];

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
          onPress={() => router.push("/habit/new")}
          style={{
            backgroundColor: theme.accent.primary,
            width: 40,
            height: 40,
            borderRadius: theme.radius.md,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: theme.accent.onPrimary, fontSize: 22, fontWeight: "700" }}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={{ gap: theme.spacing.stackLg }}>
        {/* Global Score */}
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
            {t("dashboard.score_avg")}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "baseline", gap: theme.spacing.unit }}>
            <Text style={{
              color: scoreColor,
              fontSize: theme.typography.scale.displayXl.fontSize,
              fontWeight: "900",
              fontFamily: "Inter_900Black",
              letterSpacing: theme.typography.scale.displayXl.letterSpacing,
              lineHeight: theme.typography.scale.displayXl.lineHeight,
              fontVariant: ["tabular-nums"],
            }}>
              {loading ? "--" : avgScore.toFixed(1)}
            </Text>
            <Text style={{
              color: scoreColor,
              fontSize: theme.typography.scale.titleSm.fontSize,
              fontWeight: "700",
              fontFamily: "Inter_700Bold",
            }}>
              {t("common.score_suffix")}
            </Text>
          </View>
          <Text style={{
            color: theme.text.secondary,
            fontSize: theme.typography.scale.bodyMain.fontSize,
            fontFamily: "Inter_400Regular",
          }}>
            {t("dashboard.habits_today", { count: habits.length })}
          </Text>
        </View>

        {/* Top Habits */}
        {top3.length > 0 && (
          <View style={{ gap: theme.spacing.stackMd }}>
            <Text style={{
              color: theme.text.secondary,
              fontSize: theme.typography.scale.labelCaps.fontSize,
              fontFamily: "Inter_600SemiBold",
              letterSpacing: theme.typography.scale.labelCaps.letterSpacing,
              textTransform: "uppercase",
              paddingHorizontal: theme.spacing.unit,
            }}>
              TOP HABITS
            </Text>
            {top3.map((habit, i) => {
              const score = habit.mastery_scores?.score ?? 0;
              const pct = score / 100;
              return (
                <TouchableOpacity
                  key={habit.id}
                  onPress={() => router.push(`/habit/${habit.id}`)}
                  style={{
                    backgroundColor: theme.bg.surfaceAlt,
                    borderColor: theme.border.subtle,
                    borderWidth: theme.borderWidth.default,
                    borderRadius: theme.radius.lg,
                    padding: theme.spacing.marginMobile,
                    gap: theme.spacing.stackSm,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.stackMd }}>
                      <Text style={{
                        color: RANK_COLORS[i],
                        fontSize: theme.typography.scale.titleLg.fontSize,
                        fontWeight: "700",
                        fontFamily: "Inter_700Bold",
                        width: 32,
                      }}>
                        {String(i + 1).padStart(2, "0")}
                      </Text>
                      <Text style={{
                        color: theme.text.primary,
                        fontSize: theme.typography.scale.titleSm.fontSize,
                        fontWeight: "700",
                        fontFamily: "Inter_700Bold",
                      }}>
                        {habit.name}
                      </Text>
                    </View>
                    <Text style={{
                      color: theme.text.primary,
                      fontSize: theme.typography.scale.titleSm.fontSize,
                      fontWeight: "700",
                      fontFamily: "Inter_700Bold",
                      fontVariant: ["tabular-nums"],
                    }}>
                      {score.toFixed(0)}%
                    </Text>
                  </View>
                  <ProgressBar value={score} scoreColor={theme.accent.primary} style={{ opacity: 1 - i * 0.15 }} />
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Activity Grid */}
        <View style={{ gap: theme.spacing.stackMd }}>
          <Text style={{
            color: theme.text.secondary,
            fontSize: theme.typography.scale.labelCaps.fontSize,
            fontFamily: "Inter_600SemiBold",
            letterSpacing: theme.typography.scale.labelCaps.letterSpacing,
            textTransform: "uppercase",
            paddingHorizontal: theme.spacing.unit,
          }}>
            ACTIVITY
          </Text>
          <View style={{
            backgroundColor: theme.bg.surfaceAlt,
            borderColor: theme.border.subtle,
            borderWidth: theme.borderWidth.default,
            borderRadius: theme.radius.lg,
            padding: theme.spacing.marginMobile,
          }}>
            <ActivityGrid />
          </View>
        </View>

        {/* Power Grid link */}
        <TouchableOpacity
          onPress={() => router.push("/habit/grid")}
          style={{
            borderColor: theme.border.default,
            borderWidth: theme.borderWidth.default,
            borderRadius: theme.radius.lg,
            padding: theme.spacing.marginMobile,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text style={{
            color: theme.text.primary,
            fontSize: theme.typography.scale.bodyMain.fontSize,
            fontFamily: "Inter_600SemiBold",
            fontWeight: "600",
          }}>
            POWER GRID
          </Text>
          <Text style={{ color: theme.accent.primary, fontSize: 18 }}>→</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}
