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
    <Screen
      scrollable
      contentStyle={{
        paddingTop: theme.spacing.stackSm,
        paddingBottom: theme.spacing.stackLg,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: theme.spacing.stackMd,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center" }}
        >
          <MaterialIcons name="arrow-back" size={18} color={theme.text.primary} />
        </TouchableOpacity>

        <Text
          style={{
            color: theme.text.primary,
            fontSize: theme.typography.scale.titleSm.fontSize,
            lineHeight: theme.typography.scale.titleSm.lineHeight,
            fontFamily: "Anton_400Regular",
            letterSpacing: theme.typography.scale.titleSm.letterSpacing,
            textTransform: "uppercase",
          }}
        >
          {t("new_habit.title")}
        </Text>

        <View style={{ width: 40 }} />
      </View>

      <HabitForm onSubmit={handleSubmit} submitLabel={t("new_habit.create_button")} loading={loading} mode="stitch" />
    </Screen>
  );
}
