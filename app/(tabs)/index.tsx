import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@core/components";
import { useTheme } from "@core/theming";
import { useHabits, HabitCard } from "@habits/index";

export default function DashboardScreen() {
  const t = useTheme();
  const router = useRouter();
  const { habits, loading } = useHabits();

  const avgScore =
    habits.length > 0
      ? habits.reduce((sum, h) => sum + (h.mastery_scores?.score ?? 0), 0) / habits.length
      : 0;

  return (
    <Screen>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <View>
          <Text style={{ color: t.text.tertiary, fontSize: 12, fontWeight: "500", letterSpacing: 1 }}>
            COMMITMENT SCORE
          </Text>
          <Text
            style={{
              color:
                avgScore >= 71
                  ? t.score.excellent
                  : avgScore >= 46
                    ? t.score.good
                    : avgScore >= 21
                      ? t.score.warning
                      : t.score.critical,
              fontSize: 40,
              fontWeight: "800",
              fontFamily: t.typography.displayFontFamily,
              fontVariant: ["tabular-nums"],
            }}
          >
            {avgScore.toFixed(1)}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/habit/new")}
          style={{
            backgroundColor: t.accent.primary,
            width: 44,
            height: 44,
            borderRadius: t.radius.pill,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: t.accent.onPrimary, fontSize: 24, lineHeight: 28 }}>+</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={t.accent.primary} />
      ) : habits.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: t.text.tertiary, fontSize: 15, textAlign: "center", marginBottom: 16 }}>
            Sin hábitos todavía.{"\n"}Creá el primero.
          </Text>
          <TouchableOpacity onPress={() => router.push("/habit/new")}>
            <Text style={{ color: t.accent.primary, fontWeight: "600" }}>+ Nuevo hábito</Text>
          </TouchableOpacity>
        </View>
      ) : (
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
        />
      )}
    </Screen>
  );
}
