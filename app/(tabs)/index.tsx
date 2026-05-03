import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { format } from "date-fns";
import { Screen, Card, Skeleton } from "@core/components";
import { useTheme } from "@core/theming";
import { useHabits, HabitCard } from "@habits/index";
import { isPlannedDay } from "@checkin/index";

function DashboardSkeleton() {
  const t = useTheme();
  return (
    <View style={{ gap: 12 }}>
      <Card>
        <Skeleton width="40%" height={12} style={{ marginBottom: 8 }} />
        <Skeleton width="30%" height={44} />
      </Card>
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
            <Skeleton width="55%" height={16} />
            <Skeleton width="22%" height={22} borderRadius={t.radius.pill} />
          </View>
          <Skeleton height={8} style={{ marginBottom: 6 }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Skeleton width="20%" height={12} />
            <Skeleton width="12%" height={12} />
          </View>
        </Card>
      ))}
    </View>
  );
}

export default function DashboardScreen() {
  const t = useTheme();
  const router = useRouter();
  const { habits, loading } = useHabits();
  const today = new Date();
  const todayLabel = format(today, "EEEE d 'de' MMMM");

  const avgScore =
    habits.length > 0
      ? habits.reduce((sum, h) => sum + (h.mastery_scores?.score ?? 0), 0) / habits.length
      : 0;

  const scoreColor =
    avgScore >= 71 ? t.score.excellent
    : avgScore >= 46 ? t.score.good
    : avgScore >= 21 ? t.score.warning
    : t.score.critical;

  const pendingToday = habits.filter(
    (h) => isPlannedDay(h, today),
  );

  return (
    <Screen scrollable>
      {/* Header */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <View>
          <Text style={{ color: t.text.tertiary, fontSize: 11, fontWeight: "600", letterSpacing: 1, marginBottom: 2 }}>
            MASTERY HABITS
          </Text>
          <Text style={{ color: t.text.secondary, fontSize: 13 }}>
            {todayLabel}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/habit/new")}
          style={{
            backgroundColor: t.accent.primary,
            width: 40,
            height: 40,
            borderRadius: t.radius.pill,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: t.accent.onPrimary, fontSize: 22, lineHeight: 26 }}>+</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <DashboardSkeleton />
      ) : habits.length === 0 ? (
        /* Empty state */
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80 }}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>🌱</Text>
          <Text style={{ color: t.text.primary, fontSize: 18, fontWeight: "700", marginBottom: 8, textAlign: 'center' }}>
            Empezá tu primer hábito
          </Text>
          <Text style={{ color: t.text.tertiary, fontSize: 14, textAlign: "center", marginBottom: 28, lineHeight: 20 }}>
            Cultivá un Commitment Score.{"\n"}La consistencia crea maestría.
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/habit/new")}
            style={{
              backgroundColor: t.accent.primary,
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: t.radius.md,
            }}
          >
            <Text style={{ color: t.accent.onPrimary, fontWeight: "700", fontSize: 15 }}>
              + Crear hábito
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Global score */}
          <Card style={{ marginBottom: 20 }}>
            <Text style={{ color: t.text.tertiary, fontSize: 11, fontWeight: "600", letterSpacing: 1, marginBottom: 4 }}>
              SCORE PROMEDIO
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8 }}>
              <Text style={{
                color: scoreColor,
                fontSize: 52,
                fontWeight: "800",
                fontFamily: t.typography.displayFontFamily,
                fontVariant: ["tabular-nums"],
                lineHeight: 60,
              }}>
                {avgScore.toFixed(1)}
              </Text>
              <Text style={{ color: t.text.tertiary, fontSize: 13, marginBottom: 8 }}>
                / 100
              </Text>
            </View>
            {pendingToday.length > 0 && (
              <View style={{
                marginTop: 10,
                paddingTop: 10,
                borderTopWidth: t.borderWidth.hairline,
                borderTopColor: t.border.subtle,
              }}>
                <Text style={{ color: t.text.tertiary, fontSize: 12 }}>
                  {pendingToday.length} hábito{pendingToday.length !== 1 ? 's' : ''} planificado{pendingToday.length !== 1 ? 's' : ''} para hoy
                </Text>
              </View>
            )}
          </Card>

          {/* Habits list */}
          <Text style={{ color: t.text.tertiary, fontSize: 11, fontWeight: "600", letterSpacing: 1, marginBottom: 12 }}>
            MIS HÁBITOS
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
