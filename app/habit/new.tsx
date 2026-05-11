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
      <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.unit, marginBottom: theme.spacing.stackLg }}>
        <MaterialIcons name="arrow-back" size={18} color={theme.text.primary} />
        <Text style={{ color: theme.text.primary, fontSize: theme.typography.scale.microBold.fontSize, fontFamily: "Lexend_600SemiBold", letterSpacing: theme.typography.scale.microBold.letterSpacing, textTransform: "uppercase" }}>
          {t("common.back")}
        </Text>
      </TouchableOpacity>

      <View style={{ marginBottom: theme.spacing.stackMd }}>
        <Text style={{ color: theme.text.primary, fontSize: theme.typography.scale.titleLg.fontSize, lineHeight: theme.typography.scale.titleLg.lineHeight, fontFamily: "Anton_400Regular", letterSpacing: theme.typography.scale.titleLg.letterSpacing, textTransform: "uppercase", marginBottom: theme.spacing.stackSm }}>
          {t("new_habit.title")}
        </Text>
        <Text style={{ color: theme.text.secondary, fontSize: theme.typography.scale.bodyMain.fontSize, lineHeight: theme.typography.scale.bodyMain.lineHeight, fontFamily: "Lexend_400Regular" }}>
          {t("new_habit.subtitle")}
        </Text>
      </View>

      <HabitForm onSubmit={handleSubmit} submitLabel={t("new_habit.create_button")} loading={loading} />
    </Screen>
  );
}
