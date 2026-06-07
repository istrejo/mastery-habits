/* stitch: stats-dashboard */
import { Fragment } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { MaterialIcons } from '@expo/vector-icons';
import { Screen, ProgressBar, Card } from '@core/components';
import { useTheme } from '@core/theming';
import { resolveCategory } from '@habits/index';
import { useStatsMetrics, type ActivityGridCell } from '@commitment/index';

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const;

const statsHeaderRowBase = {
  flexDirection: 'row' as const,
  justifyContent: 'space-between' as const,
  alignItems: 'center' as const,
};

function chunkCells(cells: ActivityGridCell[]) {
  const rows = Math.ceil(cells.length / 7);
  return Array.from({ length: rows }, (_, rowIndex) =>
    cells.slice(rowIndex * 7, rowIndex * 7 + 7),
  );
}

function getCellColor(cell: ActivityGridCell, theme: ReturnType<typeof useTheme>) {
  switch (cell.intensity) {
    case 'low':
      return theme.activity.low;
    case 'medium':
      return theme.activity.medium;
    case 'high':
      return theme.activity.high;
    case 'veryHigh':
      return theme.activity.veryHigh;
    case 'none':
    default:
      return theme.activity.none;
  }
}

function ActivityGrid({ cells }: { cells: ActivityGridCell[] }) {
  const theme = useTheme();
  const rows = chunkCells(cells);

  return (
    <View style={{ gap: theme.spacing.stackSm }}>
      <View style={{ flexDirection: 'row', gap: theme.spacing.unit * 2 }}>
        {DAY_LABELS.map((label, index) => (
          <Text
            key={`${label}-${index}`}
            style={{
              flex: 1,
              color: theme.text.secondary,
              fontSize: theme.typography.scale.microBold.fontSize,
              fontFamily: 'Lexend_500Medium',
              textAlign: 'center',
            }}
          >
            {label}
          </Text>
        ))}
      </View>

      <View style={{ gap: theme.spacing.unit * 2 }}>
        {rows.map((row, rowIndex) => {
          const placeholders = Math.max(0, 7 - row.length);

          return (
            <View key={`row-${rowIndex}`} style={{ flexDirection: 'row', gap: theme.spacing.unit * 2 }}>
              {row.map((cell) => (
                <View
                  key={cell.dateKey}
                  style={{
                    flex: 1,
                    aspectRatio: 1,
                    borderRadius: theme.radius.sm,
                    backgroundColor: getCellColor(cell, theme),
                    borderWidth: cell.isToday ? theme.borderWidth.default : 0,
                    borderColor: cell.isToday ? theme.border.strong : 'transparent',
                  }}
                />
              ))}
              {Array.from({ length: placeholders }, (_, placeholderIndex) => (
                <View key={`placeholder-${rowIndex}-${placeholderIndex}`} style={{ flex: 1, aspectRatio: 1 }} />
              ))}
            </View>
          );
        })}
      </View>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: theme.spacing.unit * 2,
        }}
      >
        <Text
          style={{
            color: theme.text.secondary,
            fontSize: theme.typography.scale.microBold.fontSize,
            fontFamily: 'Lexend_400Regular',
          }}
        >
          Less
        </Text>
        {['none', 'low', 'high', 'veryHigh'].map((token) => (
          <View
            key={token}
            style={{
              width: 10,
              height: 10,
              borderRadius: 2,
              backgroundColor: getCellColor(
                {
                  dateKey: token,
                  plannedCount: 0,
                  successCount: 0,
                  ratio: 0,
                  intensity: token as ActivityGridCell['intensity'],
                  isToday: false,
                },
                theme,
              ),
            }}
          />
        ))}
        <Text
          style={{
            color: theme.text.secondary,
            fontSize: theme.typography.scale.microBold.fontSize,
            fontFamily: 'Lexend_400Regular',
          }}
        >
          More
        </Text>
      </View>
    </View>
  );
}

function formatCompletionDelta(delta: number | null) {
  if (delta === null) return null;
  if (delta === 0) return 'On par with the previous 7 days';
  return `${delta > 0 ? '+' : ''}${delta} pts vs prev 7d`;
}

function StreakStatCard({
  currentStreak,
  bestStreak,
  loading,
}: {
  currentStreak: number;
  bestStreak: number;
  loading: boolean;
}) {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Card>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: theme.spacing.stackLg,
        }}
      >
        <Text
          style={{
            color: theme.text.secondary,
            fontSize: theme.typography.scale.labelCaps.fontSize,
            fontFamily: 'Lexend_600SemiBold',
            letterSpacing: theme.typography.scale.labelCaps.letterSpacing,
            textTransform: 'uppercase',
          }}
        >
          {t('stats.current_streak')}
        </Text>
        <MaterialIcons
          name='local-fire-department'
          size={18}
          color={theme.text.primary}
        />
      </View>

      <Text
        style={{
          color: theme.text.primary,
          fontSize: theme.typography.scale.displayXl.fontSize,
          lineHeight: theme.typography.scale.displayXl.lineHeight,
          fontFamily: 'Anton_400Regular',
          letterSpacing: theme.typography.scale.displayXl.letterSpacing,
          textTransform: 'uppercase',
          fontVariant: ['tabular-nums'],
        }}
      >
        {loading ? '--' : `${currentStreak} ${t('stats.days')}`}
      </Text>

      <Text
        style={{
          color: theme.text.secondary,
          fontSize: theme.typography.scale.bodyMain.fontSize,
          lineHeight: theme.typography.scale.bodyMain.lineHeight,
          fontFamily: 'Lexend_400Regular',
          marginTop: theme.spacing.unit * 2,
        }}
      >
        {t('stats.best_streak', { count: bestStreak })}
      </Text>
    </Card>
  );
}

function CompletionStatCard({
  percent,
  deltaLabel,
  fallbackLabel,
  loading,
}: {
  percent: number;
  deltaLabel: string | null;
  fallbackLabel: string;
  loading: boolean;
}) {
  const theme = useTheme();

  return (
    <Card>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: theme.spacing.stackMd,
        }}
      >
        <Text
          style={{
            color: theme.text.secondary,
            fontSize: theme.typography.scale.labelCaps.fontSize,
            fontFamily: 'Lexend_600SemiBold',
            letterSpacing: theme.typography.scale.labelCaps.letterSpacing,
            textTransform: 'uppercase',
          }}
        >
          Completion
        </Text>
        <MaterialIcons name='check-circle' size={18} color={theme.text.primary} />
      </View>

      <View style={{ gap: theme.spacing.stackSm }}>
        <Text
          style={{
            color: theme.text.primary,
            fontSize: theme.typography.scale.titleLg.fontSize,
            lineHeight: theme.typography.scale.titleLg.lineHeight,
            fontFamily: 'Anton_400Regular',
            fontVariant: ['tabular-nums'],
          }}
        >
          {loading ? '--%' : `${percent}%`}
        </Text>
        <ProgressBar value={loading ? 0 : percent} />
        <Text
          style={{
            color: theme.text.secondary,
            fontSize: theme.typography.scale.microBold.fontSize,
            lineHeight: theme.typography.scale.microBold.lineHeight,
            fontFamily: 'Lexend_400Regular',
          }}
        >
          {loading ? 'Loading completion trend...' : deltaLabel ?? fallbackLabel}
        </Text>
      </View>
    </Card>
  );
}

function TopHabitsList({
  entries,
}: {
  entries: Array<{
    habit: { id: string; name: string; category: string; custom_emoji?: string | null; custom_label?: string | null };
    currentStreak: number;
  }>;
}) {
  const theme = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  if (entries.length === 0) return null;

  return (
    <View style={{ gap: theme.spacing.stackSm }}>
      <Text
        style={{
          color: theme.text.primary,
          fontSize: theme.typography.scale.titleSm.fontSize,
          lineHeight: theme.typography.scale.titleSm.lineHeight,
          fontFamily: 'Anton_400Regular',
          letterSpacing: theme.typography.scale.titleSm.letterSpacing,
          textTransform: 'uppercase',
        }}
      >
        {t('stats.top_habits')}
      </Text>

      <View
        style={{
          backgroundColor: theme.bg.surface,
          borderColor: theme.border.default,
          borderWidth: theme.borderWidth.default,
          borderRadius: theme.radius.lg,
          overflow: 'hidden',
        }}
      >
        {entries.map((entry, index) => {
          const { habit, currentStreak } = entry;
          const category = resolveCategory(habit as any);
          const isLast = index === entries.length - 1;

          return (
            <Fragment key={habit.id}>
              <Pressable
                onPress={() => router.push(`/habit/${habit.id}`)}
                style={({ pressed }) => [{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingHorizontal: theme.spacing.stackMd,
                  paddingVertical: theme.spacing.stackSm + theme.spacing.unit,
                }, { opacity: pressed ? 0.82 : 1 }]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.stackMd, flex: 1 }}>
                  <Text
                    style={{
                      width: 28,
                      color: theme.text.secondary,
                      fontSize: theme.typography.scale.titleSm.fontSize,
                      lineHeight: theme.typography.scale.titleSm.lineHeight,
                      fontFamily: 'Anton_400Regular',
                    }}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </Text>
                  <View style={{ flex: 1 }}>
                    <Text
                      numberOfLines={1}
                      style={{
                        color: theme.text.primary,
                        fontSize: theme.typography.scale.labelCaps.fontSize,
                        lineHeight: theme.typography.scale.bodyMain.lineHeight,
                        fontFamily: 'Lexend_600SemiBold',
                      }}
                    >
                      {habit.name}
                    </Text>
                    <Text
                      numberOfLines={1}
                      style={{
                        color: theme.text.secondary,
                        fontSize: theme.typography.scale.microBold.fontSize,
                        lineHeight: theme.typography.scale.microBold.lineHeight,
                        fontFamily: 'Lexend_400Regular',
                      }}
                    >
                      {category.label}
                    </Text>
                  </View>
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: theme.spacing.unit,
                    backgroundColor: theme.bg.surfaceAlt,
                    paddingHorizontal: theme.spacing.stackSm,
                    paddingVertical: theme.spacing.unit,
                    borderRadius: theme.radius.pill,
                  }}
                >
                  <MaterialIcons name='repeat' size={16} color={theme.text.primary} />
                  <Text
                    style={{
                      color: theme.text.primary,
                      fontSize: theme.typography.scale.microBold.fontSize,
                      lineHeight: theme.typography.scale.microBold.lineHeight,
                      fontFamily: 'Lexend_600SemiBold',
                    }}
                  >
                    {`${currentStreak} ${t('stats.days')}`}
                  </Text>
                </View>
              </Pressable>
              {!isLast && (
                <View
                  style={{
                    height: theme.borderWidth.default,
                    backgroundColor: theme.border.subtle,
                  }}
                />
              )}
            </Fragment>
          );
        })}
      </View>
    </View>
  );
}

export default function StatsScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const {
    globalCurrentStreak,
    globalBestStreak,
    completion30d,
    completionDeltaVsPrevWeek,
    activity30dCells,
    topHabitsByCurrentStreak,
    loading,
  } = useStatsMetrics();

  const completionDeltaLabel = formatCompletionDelta(completionDeltaVsPrevWeek);
  const completionFallbackLabel =
    completion30d.planned === 0
      ? 'No planned days in the last 30 days.'
      : `${completion30d.completed}/${completion30d.planned} successful check-ins`;

  return (
    <Screen scrollable>
      <View
        style={[
          statsHeaderRowBase,
          {
            marginHorizontal: -theme.spacing.marginMobile,
            paddingHorizontal: theme.spacing.marginMobile,
            paddingBottom: theme.spacing.stackSm,
            marginBottom: theme.spacing.stackMd,
            borderBottomWidth: theme.borderWidth.default,
            borderBottomColor: theme.border.subtle,
          },
        ]}
      >
        <Text
          style={{
            color: theme.text.primary,
            fontSize: theme.typography.scale.microBold.fontSize,
            fontFamily: 'Lexend_600SemiBold',
            letterSpacing: theme.typography.scale.labelCaps.letterSpacing,
            textTransform: 'uppercase',
          }}
        >
          {t('dashboard.app_name')}
        </Text>
        <Pressable
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
        </Pressable>
      </View>

      <View style={{ marginBottom: theme.spacing.stackMd, gap: theme.spacing.unit * 2 }}>
        <Text
          style={{
            color: theme.text.primary,
            fontSize: theme.typography.scale.displayXl.fontSize,
            lineHeight: theme.typography.scale.displayXl.lineHeight,
            fontFamily: 'Anton_400Regular',
            letterSpacing: theme.typography.scale.displayXl.letterSpacing,
            textTransform: 'uppercase',
          }}
        >
          Stats
        </Text>
        <Text
          style={{
            color: theme.text.secondary,
            fontSize: theme.typography.scale.bodyMain.fontSize,
            lineHeight: theme.typography.scale.bodyMain.lineHeight,
            fontFamily: 'Lexend_400Regular',
          }}
        >
          Your discipline quantified.
        </Text>
      </View>

      <View style={{ gap: theme.spacing.stackMd }}>
        <StreakStatCard
          currentStreak={globalCurrentStreak}
          bestStreak={globalBestStreak}
          loading={loading}
        />

        <CompletionStatCard
          percent={completion30d.percent}
          deltaLabel={completionDeltaLabel}
          fallbackLabel={completionFallbackLabel}
          loading={loading}
        />

        <Card>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingBottom: theme.spacing.stackSm,
              marginBottom: theme.spacing.stackSm,
              borderBottomWidth: theme.borderWidth.default,
              borderBottomColor: theme.border.subtle,
            }}
          >
            <Text
              style={{
                color: theme.text.primary,
                fontSize: theme.typography.scale.labelCaps.fontSize,
                fontFamily: 'Lexend_600SemiBold',
                letterSpacing: theme.typography.scale.labelCaps.letterSpacing,
                textTransform: 'uppercase',
              }}
            >
              Activity Grid
            </Text>
            <View
              style={{
                backgroundColor: theme.bg.surfaceAlt,
                paddingHorizontal: theme.spacing.stackSm,
                paddingVertical: theme.spacing.unit,
                borderRadius: theme.radius.sm,
              }}
            >
              <Text
                style={{
                  color: theme.text.secondary,
                  fontSize: theme.typography.scale.microBold.fontSize,
                  fontFamily: 'Lexend_500Medium',
                }}
              >
                Last 30 Days
              </Text>
            </View>
          </View>

          <ActivityGrid cells={activity30dCells} />
        </Card>

        <TopHabitsList entries={topHabitsByCurrentStreak} />
      </View>
    </Screen>
  );
}
