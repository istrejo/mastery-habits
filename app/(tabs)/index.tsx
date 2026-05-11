/* stitch: today-dashboard */
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { MaterialIcons } from "@expo/vector-icons";
import { Screen, Card, Skeleton, Button, ProgressBar } from "@core/components";
import { useTheme } from "@core/theming";
import { useDateLocale } from "@core/i18n";
import { useHabits, HabitCard } from "@habits/index";
import { isPlannedDay, useTodayCheckIns } from "@checkin/index";

function Header({ onAdd }: { onAdd: () => void }) {
  const theme = useTheme();
  const { t } = useTranslation();
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: theme.spacing.stackMd }}>
      <Text style={{ color: theme.text.primary, fontSize: theme.typography.scale.microBold.fontSize, fontFamily: "Lexend_600SemiBold", letterSpacing: theme.typography.scale.microBold.letterSpacing, textTransform: "uppercase" }}>
        {t("dashboard.app_name")}
      </Text>
      <TouchableOpacity onPress={onAdd} hitSlop={12} style={{ width: 40, height: 40, borderRadius: theme.radius.pill, alignItems: "center", justifyContent: "center" }}>
        <MaterialIcons name="add" size={22} color={theme.text.primary} />
      </TouchableOpacity>
    </View>
  );
}

function DashboardSkeleton() {
  const theme = useTheme();
  return (
    <View style={{ gap: theme.spacing.stackMd }}>
      <Card style={{ minHeight: 142 }}>
        <Skeleton width="55%" height={14} style={{ marginBottom: theme.spacing.stackSm }} />
        <Skeleton width="44%" height={theme.typography.scale.displayXl.fontSize} style={{ marginTop: theme.spacing.stackLg }} />
      </Card>
      {[1, 2, 3].map((i) => <Skeleton key={i} height={94} borderRadius={theme.radius.lg} />)}
    </View>
  );
}

export default function DashboardScreen() {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const dateLocale = useDateLocale();
  const router = useRouter();
  const { habits, loading } = useHabits();
  const { completedToday } = useTodayCheckIns();
  const today = new Date();

  const formatStr = i18n.language === "en" ? "EEEE, MMMM d" : "EEEE d 'de' MMMM";
  const todayLabel = format(today, formatStr, { locale: dateLocale });
  const pendingToday = habits.filter((h) => isPlannedDay(h, today));
  const completedCount = pendingToday.filter((h) => completedToday.has(h.id)).length;
  const avgScore = habits.length > 0 ? habits.reduce((sum, h) => sum + (h.mastery_scores?.score ?? 0), 0) / habits.length : 0;
  const nextHabit = pendingToday.find((h) => !completedToday.has(h.id));

  return (
    <Screen scrollable>
      <Header onAdd={() => router.push("/habit/new")} />

      {loading ? <DashboardSkeleton /> : habits.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingTop: theme.spacing.stackLg * 2 }}>
          <Text style={{ color: theme.text.primary, fontSize: theme.typography.scale.titleLg.fontSize, lineHeight: theme.typography.scale.titleLg.lineHeight, fontFamily: "Anton_400Regular", textAlign: "center", textTransform: "uppercase", marginBottom: theme.spacing.stackSm }}>
            {t("dashboard.empty_title")}
          </Text>
          <Text style={{ color: theme.text.secondary, fontSize: theme.typography.scale.bodyMain.fontSize, lineHeight: theme.typography.scale.bodyMain.lineHeight, fontFamily: "Lexend_400Regular", textAlign: "center", marginBottom: theme.spacing.stackLg }}>
            {t("dashboard.empty_body")}
          </Text>
          <Button label={t("dashboard.create_habit")} onPress={() => router.push("/habit/new")} iconRight="arrow-forward" />
        </View>
      ) : (
        <View style={{ gap: theme.spacing.stackSm }}>
          <Card style={{ minHeight: 142, justifyContent: "space-between" }}>
            <View>
              <Text style={{ color: theme.text.secondary, fontSize: theme.typography.scale.microBold.fontSize, fontFamily: "Lexend_600SemiBold", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 6 }}>
                Today's Protocol
              </Text>
              <Text style={{ color: theme.text.secondary, fontSize: theme.typography.scale.microBold.fontSize, fontFamily: "Lexend_400Regular" }}>
                {completedCount === pendingToday.length && pendingToday.length > 0 ? "Optimal alignment detected." : t("dashboard.habits_today", { count: pendingToday.length })}
              </Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginTop: theme.spacing.stackMd }}>
              <View>
                <Text style={{ color: theme.text.primary, fontSize: theme.typography.scale.displayXl.fontSize, lineHeight: theme.typography.scale.displayXl.lineHeight, fontFamily: "Anton_400Regular", letterSpacing: theme.typography.scale.displayXl.letterSpacing, fontVariant: ["tabular-nums"] }}>
                  {avgScore.toFixed(1)}
                </Text>
                <Text style={{ color: theme.text.secondary, fontSize: theme.typography.scale.microBold.fontSize, fontFamily: "Lexend_500Medium", letterSpacing: theme.typography.scale.microBold.letterSpacing, textTransform: "uppercase" }}>
                  / 100 Mastery Index
                </Text>
              </View>
              <View style={{ width: 54, height: 54, borderRadius: theme.radius.pill, borderWidth: theme.borderWidth.default, borderColor: theme.border.default, alignItems: "center", justifyContent: "center" }}>
                <MaterialIcons name="trending-up" size={22} color={theme.text.primary} />
              </View>
            </View>
          </Card>

          <View style={{ flexDirection: "row", gap: theme.spacing.stackSm }}>
            <Card style={{ flex: 1, padding: theme.spacing.stackSm }}>
              <Text style={{ color: theme.text.secondary, fontSize: 10, fontFamily: "Lexend_600SemiBold", letterSpacing: 1, textTransform: "uppercase" }}>Environment</Text>
              <Text style={{ color: theme.text.primary, fontSize: 16, fontFamily: "Lexend_600SemiBold", marginTop: 4 }}>{todayLabel}</Text>
            </Card>
            <Card style={{ flex: 1, padding: theme.spacing.stackSm }}>
              <Text style={{ color: theme.text.secondary, fontSize: 10, fontFamily: "Lexend_600SemiBold", letterSpacing: 1, textTransform: "uppercase" }}>Next Block</Text>
              <Text numberOfLines={1} style={{ color: theme.text.primary, fontSize: 16, fontFamily: "Lexend_600SemiBold", marginTop: 4 }}>{nextHabit?.name ?? "Recovery"}</Text>
            </Card>
          </View>

          <View style={{ marginTop: theme.spacing.stackSm }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: theme.spacing.stackSm }}>
              <Text style={{ color: theme.text.primary, fontSize: theme.typography.scale.labelCaps.fontSize, fontFamily: "Anton_400Regular", textTransform: "uppercase" }}>
                Active Habits
              </Text>
              <Text style={{ color: theme.text.secondary, fontSize: theme.typography.scale.microBold.fontSize, fontFamily: "Lexend_500Medium", letterSpacing: 1, textTransform: "uppercase" }}>
                {completedCount} / {pendingToday.length} Completed
              </Text>
            </View>
            <ProgressBar value={pendingToday.length ? completedCount : 0} max={Math.max(pendingToday.length, 1)} style={{ marginBottom: theme.spacing.stackMd }} />
            {habits.map((habit) => (
              <HabitCard key={habit.id} habit={habit} completed={completedToday.has(habit.id)} onPress={() => router.push(`/habit/${habit.id}`)} />
            ))}
          </View>
        </View>
      )}
    </Screen>
  );
}
