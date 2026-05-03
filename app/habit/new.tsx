import { useState } from "react";
import { Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Screen } from "@core/components";
import { useTheme } from "@core/theming";
import { useHabits, HabitForm } from "@habits/index";
import type { HabitInsert } from "@habits/index";

export default function NewHabitScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
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
          style={{ color: theme.accent.primary, fontSize: 15 }}
        >
          {t("common.back")}
        </Text>
        <Text style={{ color: theme.text.primary, fontSize: 20, fontWeight: "700" }}>
          {t("new_habit.title")}
        </Text>
      </View>

      <HabitForm
        onSubmit={handleSubmit}
        submitLabel={t("new_habit.create_button")}
        loading={loading}
      />
    </Screen>
  );
}
