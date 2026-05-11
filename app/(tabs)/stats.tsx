/* stitch: stats-dashboard */
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { subDays } from "date-fns";
import { useTranslation } from "react-i18next";
import { MaterialIcons } from "@expo/vector-icons";
import { Screen, ProgressBar, Card } from "@core/components";
import { useTheme } from "@core/theming";
import { useHabits, resolveCategory } from "@habits/index";
import { isPlannedDay } from "@checkin/index";
import { useGlobalStreak } from "@commitment/index";

function ActivityGrid() {
  const theme = useTheme();
  const { habits } = useHabits();
  const today = new Date();
  const WEEKS = 10;
  const DAYS = 7;
  const TOTAL = WEEKS * DAYS;

  const cells = Array.from({ length: TOTAL }, (_, i) => {
    const date = subDays(today, TOTAL - 1 - i);
    const planned = habits.filter((h) => isPlannedDay(h, date)).length;
    const intensity = habits.length > 0 ? planned / habits.length : 0;
    return { intensity, isToday: i === TOTAL - 1 };
  });

  const cellColor = (intensity: number) => {
    if (intensity === 0) return theme.bg.surfaceAlt;
    if (intensity < 0.3) return '#D8D8D8';
    if (intensity < 0.6) return '#9A9A9A';
    if (intensity < 0.9) return '#555555';
    return theme.accent.primary;
  };

  return (
    <View style={{ gap: theme.spacing.stackSm }}>
      <View style={{ flexDirection: "row", gap: 5, justifyContent: "center" }}>
        {Array.from({ length: WEEKS }, (_, weekIdx) => (
          <View key={weekIdx} style={{ flexDirection: "column", gap: 5 }}>
            {Array.from({ length: DAYS }, (_, dayIdx) => {
              const { intensity, isToday } = cells[weekIdx * DAYS + dayIdx]!;
              return (
                <View key={dayIdx} style={{ width: 14, height: 14, borderRadius: 2, backgroundColor: cellColor(intensity), borderWidth: isToday ? 1.5 : 0, borderColor: theme.accent.primary }} />
              );
            })}
          </View>
        ))}
      </View>
      <View style={{ flexDirection: "row", justifyContent: "flex-end", alignItems: "center", gap: 4 }}>
        <Text style={{ color: theme.text.secondary, fontSize: 10, fontFamily: "Lexend_400Regular" }}>Less</Text>
        {[theme.bg.surfaceAlt, '#D8D8D8', '#9A9A9A', theme.accent.primary].map((c) => <View key={c} style={{ width: 8, height: 8, borderRadius: 1, backgroundColor: c }} />)}
        <Text style={{ color: theme.text.secondary, fontSize: 10, fontFamily: "Lexend_400Regular" }}>More</Text>
      </View>
    </View>
  );
}

export default function StatsScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { habits } = useHabits();
  const { current: currentStreak, best: bestStreak, loading: streakLoading } = useGlobalStreak();
  const sorted = [...habits].sort((a, b) => (b.mastery_scores?.score ?? 0) - (a.mastery_scores?.score ?? 0));
  const top3 = sorted.slice(0, 3);
  const avgScore = habits.length > 0 ? habits.reduce((sum, h) => sum + (h.mastery_scores?.score ?? 0), 0) / habits.length : 0;

  return (
    <Screen scrollable>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: theme.spacing.stackMd }}>
        <Text style={{ color: theme.text.primary, fontSize: theme.typography.scale.microBold.fontSize, fontFamily: "Lexend_600SemiBold", letterSpacing: theme.typography.scale.microBold.letterSpacing, textTransform: "uppercase" }}>
          {t("dashboard.app_name")}
        </Text>
        <TouchableOpacity onPress={() => router.push("/habit/new")} hitSlop={12} style={{ width: 40, height: 40, borderRadius: theme.radius.pill, alignItems: "center", justifyContent: "center" }}>
          <MaterialIcons name="add" size={22} color={theme.text.primary} />
        </TouchableOpacity>
      </View>

      <View style={{ marginBottom: theme.spacing.stackMd }}>
        <Text style={{ color: theme.text.primary, fontSize: theme.typography.scale.titleLg.fontSize, lineHeight: theme.typography.scale.titleLg.lineHeight, fontFamily: "Anton_400Regular", letterSpacing: theme.typography.scale.titleLg.letterSpacing, textTransform: "uppercase" }}>
          Stats
        </Text>
        <Text style={{ color: theme.text.secondary, fontSize: theme.typography.scale.bodyMain.fontSize, fontFamily: "Lexend_400Regular" }}>Your discipline quantified.</Text>
      </View>

      <View style={{ gap: theme.spacing.stackMd }}>
        <Card>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: theme.spacing.stackMd }}>
            <Text style={{ color: theme.text.secondary, fontSize: theme.typography.scale.microBold.fontSize, fontFamily: "Lexend_600SemiBold", letterSpacing: 1, textTransform: "uppercase" }}>{t("stats.current_streak")}</Text>
            <MaterialIcons name="local-fire-department" size={18} color={theme.text.primary} />
          </View>
          <Text style={{ color: theme.text.primary, fontSize: theme.typography.scale.displaySm.fontSize, lineHeight: theme.typography.scale.displaySm.lineHeight, fontFamily: "Anton_400Regular", letterSpacing: theme.typography.scale.displaySm.letterSpacing, textTransform: "uppercase", fontVariant: ["tabular-nums"] }}>
            {streakLoading ? "--" : currentStreak} {t("stats.days")}
          </Text>
          <Text style={{ color: theme.text.secondary, fontSize: theme.typography.scale.bodyMain.fontSize, lineHeight: theme.typography.scale.bodyMain.lineHeight, fontFamily: "Lexend_400Regular", marginTop: theme.spacing.stackSm }}>
            {t("stats.best_streak", { count: bestStreak })}
          </Text>
        </Card>

        <Card>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: theme.spacing.stackMd }}>
            <Text style={{ color: theme.text.secondary, fontSize: theme.typography.scale.microBold.fontSize, fontFamily: "Lexend_600SemiBold", letterSpacing: 1, textTransform: "uppercase" }}>Completion</Text>
            <MaterialIcons name="check-circle-outline" size={18} color={theme.text.primary} />
          </View>
          <Text style={{ color: theme.text.primary, fontSize: theme.typography.scale.titleLg.fontSize, fontFamily: "Anton_400Regular", fontVariant: ["tabular-nums"] }}>{Math.round(avgScore)}%</Text>
          <ProgressBar value={avgScore} style={{ marginTop: theme.spacing.stackSm }} />
        </Card>

        <Card style={{ gap: theme.spacing.stackMd }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ color: theme.text.secondary, fontSize: theme.typography.scale.microBold.fontSize, fontFamily: "Lexend_600SemiBold", letterSpacing: 1, textTransform: "uppercase" }}>Activity Grid</Text>
            <Text style={{ color: theme.text.secondary, fontSize: 10, fontFamily: "Lexend_500Medium" }}>Last 30 Days</Text>
          </View>
          <ActivityGrid />
        </Card>

        {top3.length > 0 && (
          <View style={{ gap: theme.spacing.stackSm }}>
            <Text style={{ color: theme.text.primary, fontSize: theme.typography.scale.labelCaps.fontSize, fontFamily: "Anton_400Regular", textTransform: "uppercase" }}>{t("stats.top_habits")}</Text>
            {top3.map((habit, i) => {
              const score = habit.mastery_scores?.score ?? 0;
              const category = resolveCategory(habit);
              return (
                <TouchableOpacity key={habit.id} onPress={() => router.push(`/habit/${habit.id}`)} activeOpacity={0.82} style={{ backgroundColor: theme.bg.surface, borderColor: theme.border.default, borderWidth: theme.borderWidth.default, borderRadius: theme.radius.lg, padding: theme.spacing.stackMd, flexDirection: "row", alignItems: "center", gap: theme.spacing.stackMd }}>
                  <Text style={{ color: theme.text.primary, fontSize: theme.typography.scale.titleSm.fontSize, fontFamily: "Anton_400Regular", width: 34 }}>{String(i + 1).padStart(2, "0")}</Text>
                  <View style={{ flex: 1 }}>
                    <Text numberOfLines={1} style={{ color: theme.text.primary, fontSize: 14, fontFamily: "Lexend_600SemiBold" }}>{habit.name}</Text>
                    <Text numberOfLines={1} style={{ color: theme.text.secondary, fontSize: 11, fontFamily: "Lexend_400Regular", marginTop: 2 }}>{category.label}</Text>
                  </View>
                  <Text style={{ color: theme.text.primary, fontSize: 12, fontFamily: "Lexend_600SemiBold" }}>↻ {Math.round(score)} Days</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    </Screen>
  );
}
