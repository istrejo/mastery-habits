/* stitch: power-grid */
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { Screen, Card } from '@core/components';
import { useTheme } from '@core/theming';
import { useHabits, resolveCategory } from '@habits/index';
import { useGlobalStreak } from '@commitment/index';

type Tier = 'high' | 'mediumHigh' | 'medium' | 'low' | 'dead';

function getTier(score: number): Tier {
  if (score >= 71) return 'high';
  if (score >= 46) return 'mediumHigh';
  if (score >= 21) return 'medium';
  if (score > 0) return 'low';
  return 'dead';
}

export default function PowerGridScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { habits, loading } = useHabits();
  const { current } = useGlobalStreak();

  const sorted = [...habits].sort(
    (a, b) => (b.mastery_scores?.score ?? 0) - (a.mastery_scores?.score ?? 0)
  );
  const avgScore =
    habits.length > 0
      ? habits.reduce((sum, h) => sum + (h.mastery_scores?.score ?? 0), 0) /
        habits.length
      : 0;
  const totalPower = habits.reduce(
    (sum, h) => sum + Math.round(h.mastery_scores?.score ?? 0),
    0
  );

  const cellStyleFor = (tier: Tier) => {
    switch (tier) {
      case 'high':
        return {
          bg: theme.accent.primary,
          border: theme.accent.primary,
          fg: theme.accent.onPrimary,
          opacity: 1,
        };
      case 'mediumHigh':
        return {
          bg: theme.activity.high,
          border: theme.activity.high,
          fg: theme.text.primary,
          opacity: 1,
        };
      case 'medium':
        return {
          bg: theme.bg.surfaceAlt,
          border: theme.border.default,
          fg: theme.text.primary,
          opacity: 0.9,
        };
      case 'low':
        return {
          bg: theme.bg.surface,
          border: theme.border.default,
          fg: theme.text.secondary,
          opacity: 0.55,
        };
      case 'dead':
        return {
          bg: theme.bg.surface,
          border: theme.border.default,
          fg: theme.text.tertiary,
          opacity: 0.25,
        };
    }
  };

  return (
    <Screen scrollable>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: theme.spacing.stackMd,
        }}
      >
        <Text
          style={{
            color: theme.text.primary,
            fontSize: theme.typography.scale.microBold.fontSize,
            fontFamily: 'Lexend_600SemiBold',
            letterSpacing: theme.typography.scale.microBold.letterSpacing,
            textTransform: 'uppercase',
          }}
        >
          {t('dashboard.app_name')}
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/habit/new')}
          hitSlop={12}
          style={{
            width: 40,
            height: 40,
            borderRadius: theme.radius.pill,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MaterialIcons name='add' size={22} color={theme.text.primary} />
        </TouchableOpacity>
      </View>

      <View
        style={{
          gap: theme.spacing.stackSm,
          marginBottom: theme.spacing.stackMd,
        }}
      >
        <Text
          style={{
            color: theme.text.primary,
            fontSize: theme.typography.scale.titleLg.fontSize,
            lineHeight: theme.typography.scale.titleLg.lineHeight,
            fontFamily: 'Anton_400Regular',
            letterSpacing: theme.typography.scale.titleLg.letterSpacing,
            textTransform: 'uppercase',
          }}
        >
          {t('power_grid.title')}
        </Text>
        <Text
          style={{
            color: theme.text.secondary,
            fontSize: theme.typography.scale.bodyMain.fontSize,
            lineHeight: theme.typography.scale.bodyMain.lineHeight,
            fontFamily: 'Lexend_400Regular',
          }}
        >
          Your daily discipline mapped. Solid cells represent high-impact
          habits. Grey cells indicate missed opportunities. Maintain the
          unbroken chain.
        </Text>
      </View>

      {loading ? null : habits.length === 0 ? (
        <Card>
          <Text
            style={{
              color: theme.text.secondary,
              fontFamily: 'Lexend_400Regular',
              textAlign: 'center',
            }}
          >
            {t('power_grid.empty')}
          </Text>
        </Card>
      ) : (
        <View style={{ gap: theme.spacing.stackMd }}>
          <Card style={{ gap: theme.spacing.stackMd }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  color: theme.text.primary,
                  fontSize: theme.typography.scale.labelCaps.fontSize,
                  fontFamily: 'Anton_400Regular',
                  textTransform: 'uppercase',
                }}
              >
                October
              </Text>
              <Text
                style={{
                  color: theme.text.secondary,
                  fontSize: theme.typography.scale.microBold.fontSize,
                  fontFamily: 'Lexend_500Medium',
                  textTransform: 'uppercase',
                }}
              >
                {habits.length} Active
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: theme.spacing.stackSm,
              }}
            >
              {sorted.map((habit, index) => {
                const score = habit.mastery_scores?.score ?? 0;
                const { emoji } = resolveCategory(habit);
                const style = cellStyleFor(getTier(score));
                return (
                  <TouchableOpacity
                    key={habit.id}
                    onPress={() => router.push(`/habit/${habit.id}`)}
                    activeOpacity={0.82}
                    style={{
                      width: '30.7%',
                      aspectRatio: 1,
                      backgroundColor: style.bg,
                      borderColor: style.border,
                      borderWidth: theme.borderWidth.default,
                      borderRadius: theme.radius.md,
                      padding: theme.spacing.stackSm,
                      justifyContent: 'space-between',
                    }}
                  >
                    <Text
                      style={{
                        color: style.fg,
                        fontSize: theme.typography.scale.microBold.fontSize,
                        fontFamily: 'Lexend_600SemiBold',
                        fontVariant: ['tabular-nums'],
                      }}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </Text>
                    <Text
                      style={{
                        fontSize: 24,
                        textAlign: 'center',
                        opacity: style.opacity,
                      }}
                    >
                      {emoji}
                    </Text>
                    <Text
                      numberOfLines={1}
                      style={{
                        color: style.fg,
                        fontSize: 9,
                        fontFamily: 'Lexend_600SemiBold',
                        textAlign: 'center',
                        textTransform: 'uppercase',
                      }}
                    >
                      {habit.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Card>

          <View style={{ gap: theme.spacing.stackSm }}>
            <Card style={{ padding: theme.spacing.stackSm }}>
              <Text
                style={{
                  color: theme.text.secondary,
                  fontSize: 10,
                  fontFamily: 'Lexend_600SemiBold',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                }}
              >
                Current Streak
              </Text>
              <Text
                style={{
                  color: theme.text.primary,
                  fontSize: 18,
                  fontFamily: 'Lexend_600SemiBold',
                  marginTop: 4,
                }}
              >
                {current} Days
              </Text>
            </Card>
            <Card style={{ padding: theme.spacing.stackSm }}>
              <Text
                style={{
                  color: theme.text.secondary,
                  fontSize: 10,
                  fontFamily: 'Lexend_600SemiBold',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                }}
              >
                Completion Rate
              </Text>
              <Text
                style={{
                  color: theme.text.primary,
                  fontSize: 18,
                  fontFamily: 'Lexend_600SemiBold',
                  marginTop: 4,
                }}
              >
                {Math.round(avgScore)}%
              </Text>
            </Card>
            <Card style={{ padding: theme.spacing.stackSm }}>
              <Text
                style={{
                  color: theme.text.secondary,
                  fontSize: 10,
                  fontFamily: 'Lexend_600SemiBold',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                }}
              >
                Total Power
              </Text>
              <Text
                style={{
                  color: theme.text.primary,
                  fontSize: 18,
                  fontFamily: 'Lexend_600SemiBold',
                  marginTop: 4,
                }}
              >
                {totalPower.toLocaleString()}
              </Text>
            </Card>
          </View>

          <Card style={{ gap: theme.spacing.stackSm }}>
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between' }}
            >
              <Text
                style={{
                  color: theme.text.secondary,
                  fontSize: theme.typography.scale.microBold.fontSize,
                  fontFamily: 'Lexend_600SemiBold',
                  textTransform: 'uppercase',
                }}
              >
                {t('power_grid.low_energy')}
              </Text>
              <Text
                style={{
                  color: theme.text.primary,
                  fontSize: theme.typography.scale.microBold.fontSize,
                  fontFamily: 'Lexend_600SemiBold',
                  textTransform: 'uppercase',
                }}
              >
                {t('power_grid.full_power')}
              </Text>
            </View>
            <LinearGradient
              colors={[
                theme.bg.surface,
                theme.bg.surfaceAlt,
                theme.accent.primary,
              ]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={{
                height: 10,
                borderRadius: theme.radius.pill,
                borderWidth: theme.borderWidth.default,
                borderColor: theme.border.default,
              }}
            />
          </Card>
        </View>
      )}
    </Screen>
  );
}
