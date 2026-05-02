import { useState } from "react";
import { View, Text, ActivityIndicator, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Screen, Button, Card } from "@core/components";
import { useTheme } from "@core/theming";
import { useHabit, useHabits, HabitForm } from "@habits/index";
import type { HabitInsert } from "@habits/index";
import type { MasteryLevel } from "@core/theming";

const LEVEL_LABELS: Record<MasteryLevel, string> = {
  seed: '🌱 Seed',
  sprout: '🌿 Sprout',
  tree: '🌳 Tree',
  forest: '🌲 Forest',
  ancient: '🗿 Ancient',
};

const DAY_NAMES: Record<number, string> = {
  1: 'Lun', 2: 'Mar', 3: 'Mié', 4: 'Jue', 5: 'Vie', 6: 'Sáb', 7: 'Dom',
};

export default function HabitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const t = useTheme();
  const router = useRouter();
  const { habit, loading, error, updateHabit } = useHabit(id);
  const { archiveHabit } = useHabits();
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
  const level = (habit.mastery_scores?.level ?? 'seed') as MasteryLevel;
  const levelTokens = t.level[level];
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
          <Card style={{ marginBottom: 16 }}>
            <Text style={{ color: t.text.primary, fontSize: 22, fontWeight: '800', marginBottom: 4 }}>
              {habit.name}
            </Text>
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

          <Card style={{ marginBottom: 16 }}>
            <Text style={{ color: t.text.tertiary, fontSize: 11, fontWeight: '600', letterSpacing: 1, marginBottom: 8 }}>
              COMMITMENT SCORE
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 10, marginBottom: 12 }}>
              <Text style={{
                color: score >= 71 ? t.score.excellent : score >= 46 ? t.score.good : score >= 21 ? t.score.warning : t.score.critical,
                fontSize: 48,
                fontWeight: '800',
                fontVariant: ['tabular-nums'],
                fontFamily: t.typography.displayFontFamily,
              }}>
                {score.toFixed(1)}
              </Text>
              <View style={{
                backgroundColor: levelTokens.bg,
                borderColor: levelTokens.border,
                borderWidth: t.borderWidth.default,
                borderRadius: t.radius.pill,
                paddingHorizontal: 10,
                paddingVertical: 4,
                marginBottom: 8,
              }}>
                <Text style={{ color: levelTokens.fg, fontSize: 12, fontWeight: '700' }}>
                  {LEVEL_LABELS[level]}
                </Text>
              </View>
            </View>
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
