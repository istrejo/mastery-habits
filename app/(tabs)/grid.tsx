/* stitch: power-grid */
import { Text, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { Screen, Card } from '@core/components';
import { useTheme } from '@core/theming';
import {
  usePowerGridMonth,
  getPowerGridCellPalette,
  type PowerGridDayCell,
} from '@checkin/index';

type MetricIcon = React.ComponentProps<typeof MaterialIcons>['name'];

function MetricCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: MetricIcon;
}) {
  const theme = useTheme();

  return (
    <Card
      style={{
        padding: theme.spacing.stackSm,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <View>
        <Text
          style={{
            color: theme.text.secondary,
            fontSize: 12,
            fontFamily: 'Lexend_600SemiBold',
            textTransform: 'uppercase',
            letterSpacing: 1,
          }}
        >
          {label}
        </Text>
        <Text
          style={{
            color: theme.text.primary,
            fontSize: 18,
            fontFamily: 'Lexend_600SemiBold',
            marginTop: 4,
          }}
        >
          {value}
        </Text>
      </View>

      <MaterialIcons name={icon} size={28} color={theme.accent.primary} />
    </Card>
  );
}

function LegendItem({
  label,
  fill,
  border,
}: {
  label: string;
  fill: string;
  border?: string;
}) {
  const theme = useTheme();

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View
        style={{
          width: 12,
          height: 12,
          borderRadius: theme.radius.pill,
          backgroundColor: fill,
          borderWidth: border ? theme.borderWidth.default : 0,
          borderColor: border,
        }}
      />
      <Text
        style={{
          color: theme.text.secondary,
          fontSize: theme.typography.scale.microBold.fontSize,
          fontFamily: 'Lexend_600SemiBold',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function PowerScaleBar() {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
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
  );
}

function CellContent({ cell }: { cell: PowerGridDayCell }) {
  const theme = useTheme();

  if (cell.state === 'active') {
    return (
      <Text style={{ fontSize: 28, textAlign: 'center' }}>{cell.icon ?? '⚡'}</Text>
    );
  }

  if (cell.state === 'missed') {
    return (
      <MaterialIcons
        name='close'
        size={28}
        color={theme.text.tertiary}
      />
    );
  }

  if (cell.state === 'today') {
    return (
      <MaterialIcons
        name='add-circle-outline'
        size={28}
        color={theme.accent.primary}
      />
    );
  }

  return <View style={{ height: 28 }} />;
}

function PowerGridCalendar({
  days,
  monthLabel,
  rangeLabel,
  canGoNext,
  goPrevWindow,
  goNextWindow,
}: {
  days: PowerGridDayCell[];
  monthLabel: string;
  rangeLabel: string;
  canGoNext: boolean;
  goPrevWindow: () => void;
  goNextWindow: () => void;
}) {
  const theme = useTheme();
  const router = useRouter();

  return (
    <Card style={{ gap: theme.spacing.stackMd }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <View style={{ gap: 4 }}>
          <Text
            style={{
              color: theme.text.primary,
              fontSize: theme.typography.scale.labelCaps.fontSize,
              fontFamily: 'Anton_400Regular',
              textTransform: 'uppercase',
            }}
          >
            {monthLabel}
          </Text>
          <Text
            style={{
              color: theme.text.secondary,
              fontSize: theme.typography.scale.microBold.fontSize,
              fontFamily: 'Lexend_400Regular',
              textTransform: 'uppercase',
            }}
          >
            {rangeLabel}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', gap: theme.spacing.stackSm }}>
          <Pressable
            onPress={goPrevWindow}
            hitSlop={8}
            style={({ pressed }) => [{
              width: 32,
              height: 32,
              borderRadius: theme.radius.sm,
              borderWidth: theme.borderWidth.default,
              borderColor: theme.accent.primary,
              alignItems: 'center',
              justifyContent: 'center',
            }, { opacity: pressed ? 0.2 : 1 }]}
          >
            <MaterialIcons
              name='chevron-left'
              size={20}
              color={theme.accent.primary}
            />
          </Pressable>

          <Pressable
            onPress={goNextWindow}
            disabled={!canGoNext}
            hitSlop={8}
            style={({ pressed }) => [{
              width: 32,
              height: 32,
              borderRadius: theme.radius.sm,
              borderWidth: theme.borderWidth.default,
              borderColor: theme.accent.primary,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: canGoNext ? 1 : 0.35,
            }, canGoNext ? { opacity: pressed ? 0.2 : 1 } : {}]}
          >
            <MaterialIcons
              name='chevron-right'
              size={20}
              color={theme.accent.primary}
            />
          </Pressable>
        </View>
      </View>

      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: theme.spacing.stackSm,
        }}
      >
        {days.map((cell) => {
          const palette = getPowerGridCellPalette(cell, theme);
          const isPressable = cell.state === 'active' && !!cell.habitId;

          return (
            <Pressable
              key={cell.date}
              disabled={!isPressable}
              onPress={() => {
                if (cell.habitId) router.push(`/habit/${cell.habitId}`);
              }}
              style={({ pressed }) => [{
                width: '48.5%',
                aspectRatio: 1,
                backgroundColor: palette.backgroundColor,
                borderColor: palette.borderColor,
                borderStyle: palette.borderStyle,
                borderWidth:
                  cell.state === 'today'
                    ? theme.borderWidth.bold
                    : theme.borderWidth.default,
                borderRadius: theme.radius.md,
                padding: theme.spacing.stackSm,
                alignItems: 'center',
                justifyContent: 'space-between',
                opacity: palette.opacity,
                position: 'relative',
              }, isPressable ? { opacity: (palette.opacity ?? 1) * (pressed ? 0.82 : 1) } : {}]}
            >
              {cell.state === 'today' ? (
                <View
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: 14,
                    height: 14,
                    backgroundColor: theme.accent.primary,
                    borderBottomLeftRadius: theme.radius.sm,
                  }}
                />
              ) : null}

              <Text
                style={{
                  color: palette.textColor,
                  fontSize: theme.typography.scale.microBold.fontSize,
                  fontFamily: 'Lexend_600SemiBold',
                  fontVariant: ['tabular-nums'],
                  opacity: palette.dayOpacity,
                }}
              >
                {cell.dayNumber}
              </Text>

              <CellContent cell={cell} />

              <View style={{ height: 12 }} />
            </Pressable>
          );
        })}
      </View>
    </Card>
  );
}

export default function PowerGridScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const {
    monthLabel,
    rangeLabel,
    days,
    completionRate,
    totalPower,
    currentStreak,
    hasHabits,
    loading,
    canGoNext,
    goPrevWindow,
    goNextWindow,
  } = usePowerGridMonth();

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
        <Pressable
          onPress={() => router.push('/habit/new')}
          hitSlop={12}
          style={({ pressed }) => [{
            width: 40,
            height: 40,
            borderRadius: theme.radius.pill,
            alignItems: 'center',
            justifyContent: 'center',
          }, { opacity: pressed ? 0.2 : 1 }]}
        >
          <MaterialIcons name='add' size={22} color={theme.text.primary} />
        </Pressable>
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
          {t('power_grid.description')}
        </Text>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.stackSm,
            flexWrap: 'wrap',
          }}
        >
          <LegendItem
            label={t('power_grid.legend_active')}
            fill={theme.accent.primary}
          />
          <LegendItem
            label={t('power_grid.legend_empty')}
            fill={theme.bg.surfaceAlt}
            border={theme.border.default}
          />
        </View>
      </View>

      {loading ? null : !hasHabits ? (
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
          <PowerGridCalendar
            days={days}
            monthLabel={monthLabel}
            rangeLabel={rangeLabel}
            canGoNext={canGoNext}
            goPrevWindow={goPrevWindow}
            goNextWindow={goNextWindow}
          />

          <View style={{ gap: theme.spacing.stackSm }}>
            <MetricCard
              label={t('stats.current_streak')}
              value={`${currentStreak} ${t('stats.days')}`}
              icon='local-fire-department'
            />
            <MetricCard
              label={t('power_grid.completion_rate')}
              value={`${completionRate}%`}
              icon='pie-chart'
            />
            <MetricCard
              label={t('power_grid.total_power')}
              value={totalPower.toLocaleString()}
              icon='battery-charging-full'
            />
          </View>

          <PowerScaleBar />
        </View>
      )}
    </Screen>
  );
}
