/* stitch: today-dashboard */
import { Alert, View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { MaterialIcons } from "@expo/vector-icons";
import { Screen, Card, Skeleton, Button } from "@core/components";
import { useTheme } from "@core/theming";
import { useDateLocale } from "@core/i18n";
import { useHabits, DashboardHabitRow, type DashboardHabitStatus } from "@habits/index";
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

function FloatingAddButton({ onPress }: { onPress: () => void }) {
  const theme = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={{
        position: "absolute",
        right: 24,
        bottom: -5,
        width: 56,
        height: 56,
        borderRadius: theme.radius.pill,
        backgroundColor: theme.text.primary,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000000",
        shadowOpacity: 0.16,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 8 },
        elevation: 6,
      }}
    >
      <MaterialIcons name="add" size={26} color={theme.text.inverse} />
    </TouchableOpacity>
  );
}

export default function DashboardScreen() {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const dateLocale = useDateLocale();
  const router = useRouter();
  const { habits, loading } = useHabits();
  const { completedToday, completeHabit, submittingHabitIds } = useTodayCheckIns();
  const today = new Date();

  const formatStr = i18n.language === "en" ? "EEEE, MMMM d" : "EEEE d 'de' MMMM";
  const todayLabel = format(today, formatStr, { locale: dateLocale });
  const pendingToday = habits.filter((h) => isPlannedDay(h, today));
  const completedCount = pendingToday.filter((h) => completedToday.has(h.id)).length;
  const avgScore = habits.length > 0 ? habits.reduce((sum, h) => sum + (h.mastery_scores?.score ?? 0), 0) / habits.length : 0;
  const nextHabit = pendingToday.find((h) => !completedToday.has(h.id));
  const completedAllToday = completedCount === pendingToday.length && pendingToday.length > 0;
  const activeHabitId = nextHabit?.id;

  const getHabitStatus = (habitId: string): DashboardHabitStatus => {
    if (completedToday.has(habitId)) return "completed";
    if (activeHabitId === habitId) return "active";
    return "pending";
  };

  const handleInlineComplete = async (habitId: string) => {
    if (completedToday.has(habitId) || submittingHabitIds.has(habitId)) return;

    try {
      await completeHabit(habitId);
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown_error";
      Alert.alert("Could not complete habit", message);
    }
  };

  return (
    <Screen contentStyle={{ paddingHorizontal: 0, paddingTop: 0, paddingBottom: 0 }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.marginMobile,
          paddingTop: theme.spacing.stackMd,
          paddingBottom: 140,
        }}
        showsVerticalScrollIndicator={false}
      >
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
          <View style={{ gap: theme.spacing.stackMd }}>
            <Card style={{ minHeight: 240, justifyContent: "space-between" }}>
              <View>
                <Text style={{ color: theme.text.secondary, fontSize: theme.typography.scale.labelCaps.fontSize, lineHeight: theme.typography.scale.labelCaps.lineHeight, fontFamily: "Lexend_600SemiBold", letterSpacing: 1.4, textTransform: "uppercase", marginBottom: 8 }}>
                  Today's Protocol
                </Text>
                <Text style={{ color: theme.text.secondary, fontSize: theme.typography.scale.bodyMain.fontSize, lineHeight: theme.typography.scale.bodyMain.lineHeight, fontFamily: "Lexend_400Regular" }}>
                  {completedAllToday ? "Optimal alignment detected." : t("dashboard.habits_today", { count: pendingToday.length })}
                </Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginTop: theme.spacing.stackLg }}>
                <View>
                  <Text style={{ color: theme.text.primary, fontSize: theme.typography.scale.displayXl.fontSize, lineHeight: theme.typography.scale.displayXl.lineHeight, fontFamily: "Anton_400Regular", letterSpacing: theme.typography.scale.displayXl.letterSpacing, fontVariant: ["tabular-nums"] }}>
                    {avgScore.toFixed(1)}
                  </Text>
                  <Text style={{ color: theme.text.secondary, fontSize: theme.typography.scale.labelCaps.fontSize, lineHeight: theme.typography.scale.labelCaps.lineHeight, fontFamily: "Lexend_600SemiBold", letterSpacing: theme.typography.scale.labelCaps.letterSpacing, textTransform: "uppercase" }}>
                    / 100 Mastery Index
                  </Text>
                </View>
                <View style={{ width: 64, height: 64, borderRadius: theme.radius.pill, borderWidth: 2, borderColor: theme.text.primary, alignItems: "center", justifyContent: "center", position: "relative" }}>
                  <MaterialIcons name="trending-up" size={28} color={theme.text.primary} />
                  <View style={{ position: "absolute", top: 4, left: 4, right: 4, bottom: 4, borderRadius: theme.radius.pill, borderTopWidth: 2, borderRightWidth: 2, borderColor: theme.text.primary, transform: [{ rotate: "45deg" }] }} />
                </View>
              </View>
            </Card>

            <View style={{ flexDirection: "row", gap: theme.spacing.stackSm }}>
              <Card style={{ flex: 1, padding: 16 }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                  <View style={{ flex: 1, paddingRight: theme.spacing.stackSm }}>
                    <Text style={{ color: theme.text.secondary, fontSize: theme.typography.scale.microBold.fontSize, lineHeight: theme.typography.scale.microBold.lineHeight, fontFamily: "Lexend_600SemiBold", letterSpacing: 1.1, textTransform: "uppercase", marginBottom: 4 }}>
                      Environment
                    </Text>
                    <Text style={{ color: theme.text.primary, fontSize: theme.typography.scale.titleSm.fontSize, lineHeight: theme.typography.scale.titleSm.lineHeight, fontFamily: "Anton_400Regular" }}>
                      {todayLabel}
                    </Text>
                  </View>
                  <MaterialIcons name="wb-sunny" size={24} color={theme.text.primary} />
                </View>
              </Card>

              <Card style={{ flex: 1, padding: 16, position: "relative", overflow: "hidden" }}>
                <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" }}>
                  <View style={{ flex: 1, paddingRight: theme.spacing.stackSm }}>
                    <Text style={{ color: theme.text.secondary, fontSize: theme.typography.scale.microBold.fontSize, lineHeight: theme.typography.scale.microBold.lineHeight, fontFamily: "Lexend_600SemiBold", letterSpacing: 1.1, textTransform: "uppercase", marginBottom: 4 }}>
                      Next Block
                    </Text>
                    <Text numberOfLines={1} style={{ color: theme.text.primary, fontSize: theme.typography.scale.titleSm.fontSize, lineHeight: theme.typography.scale.titleSm.lineHeight, fontFamily: "Anton_400Regular" }}>
                      {nextHabit?.name ?? "Recovery"}
                    </Text>
                    {nextHabit?.description ? (
                      <Text numberOfLines={1} style={{ color: theme.text.secondary, fontSize: theme.typography.scale.microBold.fontSize, lineHeight: theme.typography.scale.microBold.lineHeight, fontFamily: "Lexend_400Regular", marginTop: 4 }}>
                        {nextHabit.description}
                      </Text>
                    ) : null}
                  </View>
                  <MaterialIcons name="timer" size={22} color={theme.text.primary} />
                </View>

                {nextHabit ? (
                  <View style={{ position: "absolute", left: 0, bottom: 0, height: 4, width: "32%", backgroundColor: theme.text.primary }} />
                ) : null}
              </Card>
            </View>

            <View style={{ marginTop: theme.spacing.stackSm }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: theme.spacing.stackMd, paddingBottom: theme.spacing.stackSm, borderBottomWidth: theme.borderWidth.default, borderBottomColor: theme.border.default }}>
                <Text style={{ color: theme.text.primary, fontSize: theme.typography.scale.titleSm.fontSize, lineHeight: theme.typography.scale.titleSm.lineHeight, fontFamily: "Anton_400Regular", textTransform: "uppercase" }}>
                  Active Habits
                </Text>
                <Text style={{ color: theme.text.secondary, fontSize: theme.typography.scale.labelCaps.fontSize, lineHeight: theme.typography.scale.labelCaps.lineHeight, fontFamily: "Lexend_600SemiBold", letterSpacing: theme.typography.scale.labelCaps.letterSpacing, textTransform: "uppercase" }}>
                  {completedCount} / {pendingToday.length} Completed
                </Text>
              </View>

              {pendingToday.map((habit) => (
                <DashboardHabitRow
                  key={habit.id}
                  habit={habit}
                  status={getHabitStatus(habit.id)}
                  score={habit.mastery_scores?.score ?? 0}
                  inlineProgressPercent={activeHabitId === habit.id ? 30 : undefined}
                  checkDisabled={completedToday.has(habit.id) || submittingHabitIds.has(habit.id)}
                  submitting={submittingHabitIds.has(habit.id)}
                  onPressRow={() => router.push(`/habit/${habit.id}`)}
                  onPressCheck={() => {
                    void handleInlineComplete(habit.id);
                  }}
                />
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <FloatingAddButton onPress={() => router.push("/habit/new")} />
    </Screen>
  );
}
