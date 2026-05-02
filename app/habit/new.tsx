import { useState } from "react";
import { Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "@core/components";
import { useTheme } from "@core/theming";
import { useHabits, HabitForm } from "@habits/index";
import type { HabitInsert } from "@habits/index";

export default function NewHabitScreen() {
  const t = useTheme();
  const router = useRouter();
  const { createHabit } = useHabits();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: HabitInsert) => {
    setLoading(true);
    const habit = await createHabit(data);
    setLoading(false);
    if (habit) router.replace(`/habit/${habit.id}`);
  };

  return (
    <Screen scrollable>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 24, gap: 12 }}>
        <Text
          onPress={() => router.back()}
          style={{ color: t.accent.primary, fontSize: 15 }}
        >
          ← Volver
        </Text>
        <Text style={{ color: t.text.primary, fontSize: 20, fontWeight: "700" }}>
          Nuevo hábito
        </Text>
      </View>

      <HabitForm
        onSubmit={handleSubmit}
        submitLabel="Crear hábito"
        loading={loading}
      />
    </Screen>
  );
}
