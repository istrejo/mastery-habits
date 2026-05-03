import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { Screen, Card, Skeleton } from "@core/components";
import { useTheme } from "@core/theming";
import { useDateLocale } from "@core/i18n";
import { useHabits, HabitCard } from "@habits/index";
import { isPlannedDay } from "@checkin/index";

function DashboardSkeleton() {
  const theme = useTheme();
  return (
    <View style={{ gap: 12 }}>
      <Card>
        <Skeleton width="40%" height={12} style={{ marginBottom: 8 }} />
        <Skeleton width="30%" height={44} />
      </Card>
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
            <Skeleton width="55%" height={16} />
            <Skeleton width="22%" height={22} borderRadius={theme.radius.pill} />
          </View>
          <Skeleton height={8} style={{ marginBottom: 6 }} />
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Skeleton width="20%" height={12} />
            <Skeleton width="12%" height={12} />
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
      {/* Header */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <View>
          <Text style={{ color: theme.text.tertiary, fontSize: 11, fontWeight: "600", letterSpacing: 1, marginBottom: 2 }}>
            {t("dashboard.app_name")}
          </Text>
          <Text style={{ color: theme.text.secondary, fontSize: 13 }}>
            {todayLabel}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/habit/new")}
          style={{
            backgroundColor: theme.accent.primary,
            width: 40,
            height: 40,
            borderRadius: theme.radius.pill,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: theme.accent.onPrimary, fontSize: 22, lineHeight: 26 }}>+</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <DashboardSkeleton />
      ) : habits.length === 0 ? (
        /* Empty state */
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80 }}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>🌱</Text>
          <Text style={{ color: theme.text.primary, fontSize: 18, fontWeight: "700", marginBottom: 8, textAlign: "center" }}>
            {t("dashboard.empty_title")}
          </Text>
          <Text style={{ color: theme.text.tertiary, fontSize: 14, textAlign: "center", marginBottom: 28, lineHeight: 20 }}>
            {t("dashboard.empty_body")}
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/habit/new")}
            style={{
              backgroundColor: theme.accent.primary,
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: theme.radius.md,
            }}
          >
            <Text style={{ color: theme.accent.onPrimary, fontWeight: "700", fontSize: 15 }}>
              {t("dashboard.create_habit")}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Global score */}
          <Card style={{ marginBottom: 20 }}>
            <Text style={{ color: theme.text.tertiary, fontSize: 11, fontWeight: "600", letterSpacing: 1, marginBottom: 4 }}>
              {t("dashboard.score_avg")}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 8 }}>
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
            {pendingToday.length > 0 && (
              <View style={{
                marginTop: 10,
                paddingTop: 10,
                borderTopWidth: theme.borderWidth.hairline,
                borderTopColor: theme.border.subtle,
              }}>
                <Text style={{ color: theme.text.tertiary, fontSize: 12 }}>
                  {t("dashboard.habits_today", { count: pendingToday.length })}
                </Text>
              </View>
            )}
          </Card>

          {/* Habits list */}
          <Text style={{ color: theme.text.tertiary, fontSize: 11, fontWeight: "600", letterSpacing: 1, marginBottom: 12 }}>
            {t("dashboard.my_habits")}
          </Text>
          <FlatList
            data={habits}
            keyExtractor={(h) => h.id}
            renderItem={({ item }) => (
              <HabitCard
                habit={item}
                onPress={() => router.push(`/habit/${item.id}`)}
              />
            )}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        </>
      )}
    </Screen>
  );
}
