import { useState } from "react";
import { View, Text, ActivityIndicator, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { format, subDays } from "date-fns";
import { Screen, Button, Card } from "@core/components";
import { useTheme } from "@core/theming";
import { useHabit, useHabits, HabitForm } from "@habits/index";
import type { HabitInsert } from "@habits/index";
import { useCheckIn, CheckInButton } from "@checkin/index";
import { LevelProgress, MasteryBadge } from "@progression/index";

const DAY_NAMES: Record<number, string> = {
  1: 'Lun', 2: 'Mar', 3: 'Mié', 4: 'Jue', 5: 'Vie', 6: 'Sáb', 7: 'Dom',
};

function CheckInGrid({ checkIns }: { checkIns: { check_date: string; status: string }[] }) {
  const t = useTheme();
  const today = new Date();
  const days = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(today, 29 - i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const record = checkIns.find((c) => c.check_date === dateStr);
    return { dateStr, status: record?.status ?? null };
  });

  const colorForStatus = (status: string | null) => {
    if (status === 'completed') return t.status.success;
    if (status === 'skipped') return t.status.skip;
    if (status === 'missed') return t.status.danger;
    return t.bg.surfaceAlt;
  };

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
      {days.map((d) => (
        <View
          key={d.dateStr}
          style={{
            width: 20,
            height: 20,
            borderRadius: 4,
            backgroundColor: colorForStatus(d.status),
          }}
        />
      ))}
    </View>
  );
}

export default function HabitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const t = useTheme();
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

  const handleUpdate = async (data: HabitInsert) => {
    setSaving(true);
    await updateHabit(data);
    setSaving(false);
    setEditing(false);
  };

  const handleArchive = () => {
    Alert.alert(
      'Archivar hábito',
      '¿Confirmás? El hábito dejará de aparecer en tu lista.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Archivar',
          style: 'destructive',
          onPress: async () => {
            await archiveHabit(id);
            router.replace('/(tabs)');
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <Screen>
        <ActivityIndicator color={t.accent.primary} style={{ marginTop: 40 }} />
      </Screen>
    );
  }

  if (error || !habit) {
    return (
      <Screen>
        <Text style={{ color: t.status.danger }}>{error ?? 'Hábito no encontrado'}</Text>
      </Screen>
    );
  }

  const score = habit.mastery_scores?.score ?? 0;
  const days = habit.frequency_days as number[];

  return (
    <Screen scrollable>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24, gap: 12 }}>
        <Text onPress={() => router.back()} style={{ color: t.accent.primary, fontSize: 15 }}>
          ← Volver
        </Text>
      </View>

      {editing ? (
        <>
          <Text style={{ color: t.text.primary, fontSize: 20, fontWeight: '700', marginBottom: 20 }}>
            Editar hábito
          </Text>
          <HabitForm
            defaultValues={{
              name: habit.name,
              description: habit.description ?? '',
              category: habit.category ?? '',
              frequency_days: days,
            }}
            onSubmit={handleUpdate}
            submitLabel="Guardar cambios"
            loading={saving}
          />
          <Button
            label="Cancelar"
            variant="ghost"
            onPress={() => setEditing(false)}
            style={{ marginTop: 8 }}
          />
        </>
      ) : (
        <>
          {/* Header */}
          <Card style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <Text style={{ color: t.text.primary, fontSize: 22, fontWeight: '800', flex: 1 }}>
                {habit.name}
              </Text>
              <MasteryBadge score={score} style={{ marginLeft: 8 }} />
            </View>
            {habit.description ? (
              <Text style={{ color: t.text.secondary, fontSize: 14, marginBottom: 8 }}>
                {habit.description}
              </Text>
            ) : null}
            {habit.category ? (
              <View style={{
                alignSelf: 'flex-start',
                backgroundColor: t.accent.muted,
                borderRadius: t.radius.sm,
                paddingHorizontal: 8,
                paddingVertical: 2,
              }}>
                <Text style={{ color: t.accent.primary, fontSize: 11, fontWeight: '600' }}>
                  {habit.category}
                </Text>
              </View>
            ) : null}
          </Card>

          {/* Score */}
          <Card style={{ marginBottom: 16 }}>
            <Text style={{ color: t.text.tertiary, fontSize: 11, fontWeight: '600', letterSpacing: 1, marginBottom: 12 }}>
              COMMITMENT SCORE
            </Text>
            <Text style={{
              color: score >= 71 ? t.score.excellent : score >= 46 ? t.score.good : score >= 21 ? t.score.warning : t.score.critical,
              fontSize: 48,
              fontWeight: '800',
              fontVariant: ['tabular-nums'],
              fontFamily: t.typography.displayFontFamily,
              marginBottom: 16,
            }}>
              {score.toFixed(1)}
            </Text>
            <LevelProgress score={score} />
          </Card>

          {/* Check-in */}
          <Card style={{ marginBottom: 16 }}>
            <Text style={{ color: t.text.tertiary, fontSize: 11, fontWeight: '600', letterSpacing: 1, marginBottom: 12 }}>
              HOY
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
          </Card>

          {/* History */}
          <Card style={{ marginBottom: 16 }}>
            <Text style={{ color: t.text.tertiary, fontSize: 11, fontWeight: '600', letterSpacing: 1, marginBottom: 12 }}>
              ÚLTIMOS 30 DÍAS
            </Text>
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 10 }}>
              {[
                { color: t.status.success, label: 'Completado' },
                { color: t.status.skip, label: 'Skip' },
                { color: t.status.danger, label: 'Fallado' },
              ].map((item) => (
                <View key={item.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: item.color }} />
                  <Text style={{ color: t.text.tertiary, fontSize: 11 }}>{item.label}</Text>
                </View>
              ))}
            </View>
            <CheckInGrid checkIns={last30Days} />
          </Card>

          {/* Frequency */}
          <Card style={{ marginBottom: 16 }}>
            <Text style={{ color: t.text.tertiary, fontSize: 11, fontWeight: '600', letterSpacing: 1, marginBottom: 6 }}>
              FRECUENCIA
            </Text>
            <Text style={{ color: t.text.secondary, fontSize: 14 }}>
              {days.map((d) => DAY_NAMES[d]).join(' · ')}
            </Text>
          </Card>

          <Button label="Editar" variant="secondary" onPress={() => setEditing(true)} style={{ marginBottom: 8 }} />
          <Button label="Archivar" variant="danger" onPress={handleArchive} />
        </>
      )}
    </Screen>
  );
}
