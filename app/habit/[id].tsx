import { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { format, subDays } from "date-fns";
import { useTranslation } from "react-i18next";
import { MaterialIcons } from "@expo/vector-icons";
import { Screen, Button } from "@core/components";
import { useTheme } from "@core/theming";
import { useHabit, useHabits, HabitForm, CategoryBadge } from "@habits/index";
import type { HabitInsert } from "@habits/index";
import type { HabitCategoryId } from "@habits/constants/categories";
import { useCheckIn, CheckInButton } from "@checkin/index";
import { LevelProgress, MasteryBadge } from "@progression/index";

function CheckInGrid({ checkIns }: { checkIns: { check_date: string; status: string }[] }) {
  const theme = useTheme();
  const today = new Date();
  const days = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(today, 29 - i);
    const dateStr = format(date, "yyyy-MM-dd");
    const record = checkIns.find((c) => c.check_date === dateStr);
    return { dateStr, status: record?.status ?? null };
  });

  const colorForStatus = (status: string | null) => {
    if (status === "completed") return theme.status.success;
    if (status === "skipped") return theme.status.skip;
    if (status === "missed") return theme.status.danger;
    return theme.bg.surfaceAlt;
  };

  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.unit }}>
      {days.map((d) => (
        <View
          key={d.dateStr}
          style={{
            width: theme.spacing.gutter,
            height: theme.spacing.gutter,
            borderRadius: theme.radius.sm,
            backgroundColor: colorForStatus(d.status),
          }}
        />
      ))}
    </View>
  );
}

export default function HabitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { habit, loading, error, updateHabit } = useHabit(id);
  const { archiveHabit } = useHabits();
  const {
    todayCheckIn,
    last30Days,
    canCheckInToday,
    alreadyCheckedIn,
    skipAvailable,
    loading: checkInLoading,
    markCompleted,
    markSkipped,
  } = useCheckIn(habit ?? null);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const DAY_NAMES: Record<number, string> = {
    1: t("habit_detail.day_mon"),
    2: t("habit_detail.day_tue"),
    3: t("habit_detail.day_wed"),
    4: t("habit_detail.day_thu"),
    5: t("habit_detail.day_fri"),
    6: t("habit_detail.day_sat"),
    7: t("habit_detail.day_sun"),
  };

  const handleUpdate = async (data: HabitInsert) => {
    setSaving(true);
    await updateHabit(data);
    setSaving(false);
    setEditing(false);
  };

  const handleArchive = () => {
    Alert.alert(
      t("habit_detail.archive_title"),
      t("habit_detail.archive_body"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("habit_detail.archive_button"),
          style: "destructive",
          onPress: async () => {
            await archiveHabit(id);
            router.replace("/(tabs)");
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <Screen>
        <ActivityIndicator color={theme.accent.primary} style={{ marginTop: 40 }} />
      </Screen>
    );
  }

  if (error || !habit) {
    return (
      <Screen>
        <Text style={{ color: theme.status.danger }}>{error ?? t("habit_detail.not_found")}</Text>
      </Screen>
    );
  }

  const score = habit.mastery_scores?.score ?? 0;
  const days = habit.frequency_days as number[];

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

      {editing ? (
        <>
          <Text style={{
            color: theme.text.primary,
            fontSize: theme.typography.scale.titleSm.fontSize,
            fontFamily: "Inter_700Bold",
            letterSpacing: theme.typography.scale.titleSm.letterSpacing,
            marginBottom: 20,
          }}>
            {t("habit_detail.edit_title")}
          </Text>
          <HabitForm
            defaultValues={{
              name: habit.name,
              description: habit.description ?? "",
              category: habit.category as HabitCategoryId,
              custom_label: habit.custom_label ?? '',
              custom_emoji: habit.custom_emoji ?? '✨',
              frequency_days: days,
            }}
            onSubmit={handleUpdate}
            submitLabel={t("habit_detail.save_changes")}
            loading={saving}
          />
          <Button
            label={t("common.cancel")}
            variant="ghost"
            onPress={() => setEditing(false)}
            style={{ marginTop: 8 }}
          />
        </>
      ) : (
        <>
          {/* Header */}
          <View style={{
            backgroundColor: theme.bg.surfaceAlt,
            borderWidth: theme.borderWidth.default,
            borderColor: theme.border.subtle,
            borderRadius: theme.radius.lg,
            padding: theme.spacing.marginMobile,
            marginBottom: 16,
          }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <Text style={{
                color: theme.text.primary,
                fontSize: theme.typography.scale.titleSm.fontSize,
                fontFamily: "Inter_700Bold",
                letterSpacing: theme.typography.scale.titleSm.letterSpacing,
                flex: 1,
              }}>
                {habit.name}
              </Text>
              <MasteryBadge score={score} style={{ marginLeft: 8 }} />
            </View>
            {habit.description ? (
              <Text style={{ color: theme.text.secondary, fontSize: theme.typography.scale.bodyMain.fontSize, marginBottom: 8 }}>
                {habit.description}
              </Text>
            ) : null}
            <CategoryBadge habit={habit} size="md" showLabel />
            {habit.category === 'custom' && habit.custom_label === 'Sin categorizar' && (
              <View style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                marginTop: 8,
                padding: 10,
                backgroundColor: theme.bg.surfaceAlt,
                borderLeftWidth: 3,
                borderLeftColor: theme.status.skip,
                borderRadius: theme.radius.sm,
              }}>
                <Text style={{ color: theme.text.secondary, fontSize: theme.typography.scale.microBold.fontSize, flex: 1 }}>
                  💡 {t('custom_category.uncategorized_banner')}
                </Text>
              </View>
            )}
          </View>

          {/* Score */}
          <View style={{
            backgroundColor: theme.bg.surfaceAlt,
            borderWidth: theme.borderWidth.default,
            borderColor: theme.border.subtle,
            borderRadius: theme.radius.lg,
            padding: theme.spacing.marginMobile,
            marginBottom: 16,
          }}>
            <Text style={{
              color: theme.text.tertiary,
              fontSize: theme.typography.scale.labelCaps.fontSize,
              fontFamily: "Inter_600SemiBold",
              letterSpacing: theme.typography.scale.labelCaps.letterSpacing,
              textTransform: "uppercase",
              marginBottom: 12,
            }}>
              {t("habit_detail.commitment_score")}
            </Text>
            <Text style={{
              color: score >= 71 ? theme.score.excellent : score >= 46 ? theme.score.good : score >= 21 ? theme.score.warning : theme.score.critical,
              fontSize: theme.typography.scale.displayXl.fontSize,
              fontFamily: "Inter_900Black",
              letterSpacing: theme.typography.scale.displayXl.letterSpacing,
              lineHeight: theme.typography.scale.displayXl.lineHeight,
              fontVariant: ["tabular-nums"],
              marginBottom: 16,
            }}>
              {score.toFixed(1)}
            </Text>
            <LevelProgress score={score} />
          </View>

          {/* Check-in */}
          <View style={{
            backgroundColor: theme.bg.surfaceAlt,
            borderWidth: theme.borderWidth.default,
            borderColor: theme.border.subtle,
            borderRadius: theme.radius.lg,
            padding: theme.spacing.marginMobile,
            marginBottom: 16,
          }}>
            <Text style={{
              color: theme.text.tertiary,
              fontSize: theme.typography.scale.labelCaps.fontSize,
              fontFamily: "Inter_600SemiBold",
              letterSpacing: theme.typography.scale.labelCaps.letterSpacing,
              textTransform: "uppercase",
              marginBottom: 12,
            }}>
              {t("habit_detail.today_section")}
            </Text>
            <CheckInButton
              canCheckIn={canCheckInToday}
              alreadyCheckedIn={alreadyCheckedIn}
              todayCheckIn={todayCheckIn}
              skipAvailable={skipAvailable}
              loading={checkInLoading}
              onComplete={markCompleted}
              onSkip={markSkipped}
            />
          </View>

          {/* History */}
          <View style={{
            backgroundColor: theme.bg.surfaceAlt,
            borderWidth: theme.borderWidth.default,
            borderColor: theme.border.subtle,
            borderRadius: theme.radius.lg,
            padding: theme.spacing.marginMobile,
            marginBottom: 16,
          }}>
            <Text style={{
              color: theme.text.tertiary,
              fontSize: theme.typography.scale.labelCaps.fontSize,
              fontFamily: "Inter_600SemiBold",
              letterSpacing: theme.typography.scale.labelCaps.letterSpacing,
              textTransform: "uppercase",
              marginBottom: 12,
            }}>
              {t("habit_detail.history_section")}
            </Text>
            <View style={{ flexDirection: "row", gap: 12, marginBottom: 10 }}>
              {[
                { color: theme.status.success, label: t("habit_detail.legend_completed") },
                { color: theme.status.skip, label: t("habit_detail.legend_skip") },
                { color: theme.status.danger, label: t("habit_detail.legend_missed") },
              ].map((item) => (
                <View key={item.label} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: item.color }} />
                  <Text style={{ color: theme.text.tertiary, fontSize: theme.typography.scale.microBold.fontSize }}>{item.label}</Text>
                </View>
              ))}
            </View>
            <CheckInGrid checkIns={last30Days} />
          </View>

          {/* Frequency */}
          <View style={{
            backgroundColor: theme.bg.surfaceAlt,
            borderWidth: theme.borderWidth.default,
            borderColor: theme.border.subtle,
            borderRadius: theme.radius.lg,
            padding: theme.spacing.marginMobile,
            marginBottom: 16,
          }}>
            <Text style={{
              color: theme.text.tertiary,
              fontSize: theme.typography.scale.labelCaps.fontSize,
              fontFamily: "Inter_600SemiBold",
              letterSpacing: theme.typography.scale.labelCaps.letterSpacing,
              textTransform: "uppercase",
              marginBottom: 6,
            }}>
              {t("habit_detail.frequency_section")}
            </Text>
            <Text style={{ color: theme.text.secondary, fontSize: theme.typography.scale.bodyMain.fontSize }}>
              {days.map((d) => DAY_NAMES[d]).join(" · ")}
            </Text>
          </View>

          <Button label={t("habit_detail.edit_button")} variant="secondary" onPress={() => setEditing(true)} style={{ marginBottom: 8 }} />
          <Button label={t("habit_detail.archive_button")} variant="danger" onPress={handleArchive} />
        </>
      )}
    </Screen>
  );
}
