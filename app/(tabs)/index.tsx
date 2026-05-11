/* stitch: today-dashboard */
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { Screen, Card, Skeleton } from "@core/components";
import { useTheme } from "@core/theming";
import { useDateLocale } from "@core/i18n";
import { useHabits, HabitCard } from "@habits/index";
import { isPlannedDay, useTodayCheckIns } from "@checkin/index";

function DashboardSkeleton() {
  const theme = useTheme();
  return (
    <View style={{ gap: theme.spacing.stackMd }}>
      <Card>
        <Skeleton width="50%" height={theme.typography.scale.labelCaps.fontSize} style={{ marginBottom: theme.spacing.stackSm }} />
        <Skeleton width="35%" height={theme.typography.scale.displayXl.fontSize} style={{ marginBottom: theme.spacing.unit }} />
        <Skeleton width="60%" height={theme.typography.scale.bodyMain.fontSize} />
      </Card>
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: theme.spacing.stackMd }}>
            <Skeleton width="55%" height={theme.typography.scale.bodyMain.fontSize} />
            <Skeleton width="22%" height={20} borderRadius={theme.radius.pill} />
          </View>
          <Skeleton height={3} style={{ marginBottom: theme.spacing.unit }} />
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Skeleton width="20%" height={theme.typography.scale.labelCaps.fontSize} />
            <Skeleton width="12%" height={theme.typography.scale.labelCaps.fontSize} />
          </View>
        </Card>
      ))}
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

  const avgScore =
    habits.length > 0
      ? habits.reduce((sum, h) => sum + (h.mastery_scores?.score ?? 0), 0) / habits.length
      : 0;

  const scoreColor =
    avgScore >= 71 ? theme.score.excellent
    : avgScore >= 46 ? theme.score.good
    : avgScore >= 21 ? theme.score.warning
    : theme.score.critical;

  const pendingToday = habits.filter((h) => isPlannedDay(h, today));

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
          <Text style={{ color: theme.accent.onPrimary, fontSize: 22, lineHeight: 26, fontWeight: "700" }}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Date */}
      <View style={{ marginBottom: theme.spacing.stackLg }}>
        <Text style={{
          color: theme.text.primary,
          fontSize: theme.typography.scale.titleLg.fontSize,
          fontWeight: "700",
          fontFamily: "Inter_700Bold",
          letterSpacing: theme.typography.scale.titleLg.letterSpacing,
          lineHeight: theme.typography.scale.titleLg.lineHeight,
        }}>
          {todayLabel}
        </Text>
      </View>

      {loading ? (
        <DashboardSkeleton />
      ) : habits.length === 0 ? (
        /* Empty state */
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingTop: theme.spacing.stackLg * 2 }}>
          <Text style={{ fontSize: 48, marginBottom: theme.spacing.stackMd }}>🌱</Text>
          <Text style={{
            color: theme.text.primary,
            fontSize: theme.typography.scale.titleSm.fontSize,
            fontWeight: "700",
            fontFamily: "Inter_700Bold",
            marginBottom: theme.spacing.stackSm,
            textAlign: "center",
          }}>
            {t("dashboard.empty_title")}
          </Text>
          <Text style={{
            color: theme.text.secondary,
            fontSize: theme.typography.scale.bodyMain.fontSize,
            fontFamily: "Inter_400Regular",
            lineHeight: theme.typography.scale.bodyMain.lineHeight,
            textAlign: "center",
            marginBottom: theme.spacing.stackLg,
          }}>
            {t("dashboard.empty_body")}
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/habit/new")}
            style={{
              backgroundColor: theme.accent.primary,
              paddingHorizontal: theme.spacing.stackLg / 2,
              paddingVertical: theme.spacing.stackSm * 2,
              borderRadius: theme.radius.md,
            }}
          >
            <Text style={{
              color: theme.accent.onPrimary,
              fontWeight: "700",
              fontFamily: "Inter_700Bold",
              fontSize: theme.typography.scale.bodyMain.fontSize,
            }}>
              {t("dashboard.create_habit")}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ gap: theme.spacing.stackLg }}>
          {/* Score Card */}
          <Card>
            <Text style={{
              color: theme.text.secondary,
              fontSize: theme.typography.scale.labelCaps.fontSize,
              fontWeight: "600",
              fontFamily: "Inter_600SemiBold",
              letterSpacing: theme.typography.scale.labelCaps.letterSpacing,
              textTransform: "uppercase",
              marginBottom: theme.spacing.stackSm,
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
                {avgScore.toFixed(1)}
              </Text>
              <Text style={{
                color: theme.text.secondary,
                fontSize: theme.typography.scale.titleSm.fontSize,
                fontWeight: "700",
                fontFamily: "Inter_700Bold",
              }}>
                {t("common.score_suffix")}
              </Text>
            </View>

            {pendingToday.length > 0 && (
              <Text style={{
                color: theme.text.secondary,
                fontSize: theme.typography.scale.bodyMain.fontSize,
                fontFamily: "Inter_400Regular",
                marginTop: theme.spacing.stackSm,
              }}>
                {t("dashboard.habits_today", { count: pendingToday.length })}
              </Text>
            )}
          </Card>

          {/* Habits section */}
          <View>
            <Text style={{
              color: theme.text.secondary,
              fontSize: theme.typography.scale.labelCaps.fontSize,
              fontWeight: "600",
              fontFamily: "Inter_600SemiBold",
              letterSpacing: theme.typography.scale.labelCaps.letterSpacing,
              textTransform: "uppercase",
              paddingBottom: theme.spacing.unit,
              borderBottomWidth: theme.borderWidth.default,
              borderBottomColor: theme.border.default,
              marginBottom: theme.spacing.stackMd,
            }}>
              {t("dashboard.my_habits")}
            </Text>
            <FlatList
              data={habits}
              keyExtractor={(h) => h.id}
              renderItem={({ item }) => (
                <HabitCard
                  habit={item}
                  completed={completedToday.has(item.id)}
                  onPress={() => router.push(`/habit/${item.id}`)}
                />
              )}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
            />
          </View>
        </View>
      )}
    </Screen>
  );
}
