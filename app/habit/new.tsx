import { useState } from "react";
import { Text, View, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { MaterialIcons } from "@expo/vector-icons";
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
      {/* TopAppBar */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 24 }}
      >
        <MaterialIcons name="arrow-back" size={20} color={theme.accent.primary} />
        <Text style={{
          color: theme.accent.primary,
          fontSize: theme.typography.scale.labelCaps.fontSize,
          fontFamily: "Inter_600SemiBold",
          letterSpacing: theme.typography.scale.labelCaps.letterSpacing,
          textTransform: "uppercase",
        }}>
          {t("common.back")}
        </Text>
      </TouchableOpacity>

      {/* Header */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{
          color: theme.text.primary,
          fontSize: theme.typography.scale.titleLg.fontSize,
          fontFamily: "Inter_700Bold",
          letterSpacing: theme.typography.scale.titleLg.letterSpacing,
          marginBottom: 4,
        }}>
          {t("new_habit.title")}
        </Text>
        <Text style={{
          color: theme.text.secondary,
          fontSize: theme.typography.scale.bodyMain.fontSize,
        }}>
          {t("new_habit.subtitle")}
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
