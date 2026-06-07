import React, { useMemo, useRef, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@core/theming';
import { Input, Button, Card } from '@core/components';
import { CustomCategoryInput } from './CustomCategoryInput';
import { FrequencySelector } from './FrequencySelector';
import { CategoryPicker } from './CategoryPicker';
import type { HabitInsert } from '../types';
import type { HabitCategoryId } from '../constants/categories';

const formSectionLabelBase = {
  fontFamily: 'Lexend_500Medium' as const,
  textTransform: 'uppercase' as const,
};
import {
  DEFAULT_CREATE_HABIT_CATEGORY,
  DEFAULT_CREATE_HABIT_DAYS,
  findCreateHabitCategoryOption,
  getCreateHabitCategoryOptions,
  getDaysForFrequencyPreset,
  inferFrequencyPreset,
  type CreateHabitCategoryOption,
  type CreateHabitFrequencyPreset,
} from '../utils/createHabitPresets';

export type HabitFormData = {
  name: string;
  description?: string;
  category: HabitCategoryId;
  custom_label?: string;
  custom_emoji?: string;
  frequency_days: number[];
};

interface HabitFormProps {
  defaultValues?: Partial<HabitFormData>;
  onSubmit: (data: HabitInsert) => Promise<void>;
  submitLabel?: string;
  loading?: boolean;
  mode?: 'default' | 'stitch';
}

const CATEGORY_IDS = ['health', 'mind', 'learning', 'productivity', 'nutrition', 'creativity', 'social', 'finance', 'custom'] as const;

const DAY_LABELS: { iso: number; key: `frequency.day_mon` | `frequency.day_tue` | `frequency.day_wed` | `frequency.day_thu` | `frequency.day_fri` | `frequency.day_sat` | `frequency.day_sun` }[] = [
  { iso: 1, key: 'frequency.day_mon' },
  { iso: 2, key: 'frequency.day_tue' },
  { iso: 3, key: 'frequency.day_wed' },
  { iso: 4, key: 'frequency.day_thu' },
  { iso: 5, key: 'frequency.day_fri' },
  { iso: 6, key: 'frequency.day_sat' },
  { iso: 7, key: 'frequency.day_sun' },
];

const FREQUENCY_PRESET_CONFIG: { id: CreateHabitFrequencyPreset; labelKey: string; iconName: keyof typeof MaterialIcons.glyphMap }[] = [
  { id: 'daily', labelKey: 'create_habit.frequency_presets.daily', iconName: 'calendar-today' },
  { id: 'mon-fri', labelKey: 'create_habit.frequency_presets.mon_fri', iconName: 'work-outline' },
  { id: 'custom', labelKey: 'create_habit.frequency_presets.custom', iconName: 'tune' },
];

const SectionLabel: React.FC<{ label: string }> = ({ label }) => (
  <Text
    style={{
      color: '#666666',
      fontSize: 12,
      fontFamily: 'Lexend_600SemiBold',
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      marginBottom: 12,
    }}
  >
    {label}
  </Text>
);

function StitchCategoryGrid({
  options,
  selectedId,
  onSelect,
}: {
  options: CreateHabitCategoryOption[];
  selectedId: HabitCategoryId;
  onSelect: (option: CreateHabitCategoryOption) => void;
}) {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.stackSm }}>
      {options.map((option) => {
        const isSelected = selectedId === option.categoryId;
        return (
          <Pressable
            key={option.categoryId}
            onPress={() => onSelect(option)}
            style={({ pressed }) => [{
              width: '31%',
              minHeight: 78,
              backgroundColor: isSelected ? theme.text.primary : theme.bg.surface,
              borderWidth: theme.borderWidth.default,
              borderColor: isSelected ? theme.text.primary : theme.border.default,
              borderRadius: theme.radius.md,
              paddingHorizontal: 10,
              paddingVertical: 10,
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }, { opacity: pressed ? 0.82 : 1 }]}
          >
            <MaterialIcons
              name={option.iconName as keyof typeof MaterialIcons.glyphMap}
              size={18}
              color={isSelected ? theme.text.inverse : theme.text.primary}
            />
            <Text
              style={{
                color: isSelected ? theme.text.inverse : theme.text.primary,
                textAlign: 'center',
                fontSize: theme.typography.scale.microBold.fontSize,
                fontFamily: 'Lexend_600SemiBold',
                letterSpacing: 0.6,
                textTransform: 'uppercase',
              }}
            >
              {t(option.labelKey as any)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function StitchFrequencyPresets({
  selectedPreset,
  onSelect,
}: {
  selectedPreset: CreateHabitFrequencyPreset;
  onSelect: (preset: CreateHabitFrequencyPreset) => void;
}) {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <View style={{ flexDirection: 'row', gap: theme.spacing.stackSm }}>
      {FREQUENCY_PRESET_CONFIG.map((preset) => {
        const isSelected = selectedPreset === preset.id;
        return (
          <Pressable
            key={preset.id}
            onPress={() => onSelect(preset.id)}
            style={({ pressed }) => [{
              flex: 1,
              backgroundColor: isSelected ? theme.text.primary : theme.bg.surface,
              borderWidth: theme.borderWidth.default,
              borderColor: isSelected ? theme.text.primary : theme.border.default,
              borderRadius: theme.radius.md,
              paddingVertical: 12,
              paddingHorizontal: 10,
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }, { opacity: pressed ? 0.82 : 1 }]}
          >
            <MaterialIcons
              name={preset.iconName}
              size={18}
              color={isSelected ? theme.text.inverse : theme.text.secondary}
            />
            <Text
              style={{
                color: isSelected ? theme.text.inverse : theme.text.primary,
                fontSize: theme.typography.scale.microBold.fontSize,
                fontFamily: 'Lexend_600SemiBold',
                textTransform: 'uppercase',
                letterSpacing: 0.6,
                textAlign: 'center',
              }}
            >
              {t(preset.labelKey as any)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function StitchDayPicker({
  selectedDays,
  active,
  onToggle,
}: {
  selectedDays: number[];
  active: boolean;
  onToggle: (iso: number) => void;
}) {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <View style={{ flexDirection: 'row', gap: theme.spacing.stackSm, opacity: active ? 1 : 0.42 }}>
      {DAY_LABELS.map(({ iso, key }) => {
        const isSelected = selectedDays.includes(iso);
        return (
          <Pressable
            key={iso}
            onPress={() => {
              if (active) onToggle(iso);
            }}
            style={({ pressed }) => [{
              width: 36,
              height: 36,
              borderRadius: theme.radius.pill,
              borderWidth: theme.borderWidth.default,
              borderColor: isSelected ? theme.text.primary : theme.border.default,
              backgroundColor: isSelected ? theme.text.primary : theme.bg.surface,
              alignItems: 'center',
              justifyContent: 'center',
            }, active ? { opacity: pressed ? 0.82 : 1 } : {}]}
          >
            <Text
              style={{
                color: isSelected ? theme.text.inverse : theme.text.secondary,
                fontSize: theme.typography.scale.microBold.fontSize,
                fontFamily: 'Lexend_600SemiBold',
                textTransform: 'uppercase',
              }}
            >
              {t(key)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export const HabitForm: React.FC<HabitFormProps> = ({
  defaultValues,
  onSubmit,
  submitLabel,
  loading = false,
  mode = 'default',
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const stitchMode = mode === 'stitch';
  const initialCategory = defaultValues?.category ?? (stitchMode ? DEFAULT_CREATE_HABIT_CATEGORY : 'health');
  const initialFrequencyDays = defaultValues?.frequency_days ?? (stitchMode ? [...DEFAULT_CREATE_HABIT_DAYS] : [1, 2, 3, 4, 5]);
  const initialFrequencyPreset = inferFrequencyPreset(initialFrequencyDays);
  const [stitchCategory, setStitchCategory] = useState<HabitCategoryId>(initialCategory);
  const [stitchFrequencyPreset, setStitchFrequencyPreset] = useState<CreateHabitFrequencyPreset>(initialFrequencyPreset);
  const lastCustomDaysRef = useRef<number[]>(
    initialFrequencyPreset === 'custom' ? [...initialFrequencyDays].sort((a, b) => a - b) : [1, 2, 3, 4, 5],
  );

  const schema = useMemo(
    () => z
      .object({
        name: z.string().min(1, t('habit_form.error_required')).max(80, t('habit_form.error_name_max')),
        description: z.string().max(300).optional(),
        category: z.enum(CATEGORY_IDS),
        custom_label: z.string().max(30).optional(),
        custom_emoji: z.string().max(8).optional(),
        frequency_days: z.array(z.number().int().min(1).max(7)).min(1, t('habit_form.error_days_min')),
      })
      .refine((data) => data.category !== 'custom' || (!!data.custom_label && !!data.custom_emoji), {
        message: t('create_habit.custom_category_error'),
        path: ['custom_label'],
      }),
    [t]
  );

  const { control, handleSubmit, setValue, formState: { errors } } = useForm<HabitFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      category: initialCategory,
      custom_label: '',
      custom_emoji: '✦',
      frequency_days: [...initialFrequencyDays],
      ...defaultValues,
    },
  });

  const watchedCategory = useWatch({ control, name: 'category' }) ?? initialCategory;
  const watchedCustomLabel = useWatch({ control, name: 'custom_label' }) ?? '';
  const watchedCustomEmoji = useWatch({ control, name: 'custom_emoji' }) ?? '✦';
  const watchedFrequencyDays = useWatch({ control, name: 'frequency_days' }) ?? [...initialFrequencyDays];
  const categoryOptions = useMemo(() => getCreateHabitCategoryOptions(), []);
  const selectedCategoryId = stitchMode ? stitchCategory : watchedCategory;
  const selectedCategoryOption = findCreateHabitCategoryOption(selectedCategoryId);
  const frequencyPreset = stitchMode ? stitchFrequencyPreset : inferFrequencyPreset(watchedFrequencyDays);

  const applyCategory = (option: CreateHabitCategoryOption) => {
    setStitchCategory(option.categoryId);
    setValue('category', option.categoryId, { shouldValidate: true });

    if (option.usesCustomFields) {
      if (!watchedCustomLabel?.trim()) {
        setValue('custom_label', '', { shouldValidate: true });
      }
      if (!watchedCustomEmoji?.trim()) {
        setValue('custom_emoji', '✦', { shouldValidate: true });
      }
      return;
    }

    setValue('custom_label', undefined, { shouldValidate: true });
    setValue('custom_emoji', undefined, { shouldValidate: true });
  };

  const applyFrequencyPreset = (preset: CreateHabitFrequencyPreset) => {
    setStitchFrequencyPreset(preset);
    const nextDays = getDaysForFrequencyPreset(preset, lastCustomDaysRef.current);
    setValue('frequency_days', nextDays, { shouldValidate: true });

    if (preset === 'custom') {
      lastCustomDaysRef.current = nextDays;
    }
  };

  const toggleCustomDay = (iso: number) => {
    setStitchFrequencyPreset('custom');
    const sourceDays = frequencyPreset === 'custom' ? watchedFrequencyDays : lastCustomDaysRef.current;
    const nextDays = sourceDays.includes(iso)
      ? sourceDays.length === 1
        ? sourceDays
        : sourceDays.filter((day) => day !== iso)
      : [...sourceDays, iso].sort((a, b) => a - b);

    lastCustomDaysRef.current = nextDays;
    setValue('frequency_days', nextDays, { shouldValidate: true });
  };

  const handleFormSubmit = (data: HabitFormData) => {
    const selectedCategory = stitchMode ? stitchCategory : data.category;
    const isCustom = selectedCategory === 'custom';

    return onSubmit({
      name: data.name,
      frequency_days: data.frequency_days,
      category: selectedCategory,
      description: data.description || undefined,
      custom_label: isCustom ? (data.custom_label ?? null) : null,
      custom_emoji: isCustom ? (data.custom_emoji ?? null) : null,
    });
  };

  if (!stitchMode) {
    return (
      <Card style={{ gap: theme.spacing.stackMd }}>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, value } }) => (
            <Input label={t('habit_form.name_label')} onChangeText={onChange} value={value} placeholder={t('habit_form.name_placeholder')} error={errors.name?.message} />
          )}
        />

        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, value } }) => (
            <Input label={t('habit_form.description_label')} onChangeText={onChange} value={value ?? ''} placeholder={t('habit_form.description_placeholder')} multiline numberOfLines={3} />
          )}
        />

        <View style={{ gap: theme.spacing.stackSm }}>
          <Text style={{ color: theme.text.secondary, fontSize: theme.typography.scale.microBold.fontSize, fontFamily: 'Lexend_500Medium' }}>
            {t('habit_form.category_label')}
          </Text>
          <Controller
            control={control}
            name="category"
            render={({ field: { onChange, value } }) => (
              <CategoryPicker
                value={value}
                onChange={onChange}
                customLabel={watchedCustomLabel ?? ''}
                customEmoji={watchedCustomEmoji ?? '✨'}
                onCustomChange={({ label, emoji }) => {
                  setValue('custom_label', label, { shouldValidate: true });
                  setValue('custom_emoji', emoji, { shouldValidate: true });
                }}
              />
            )}
          />
          {errors.custom_label ? <Text style={{ color: theme.status.danger, fontSize: 12, fontFamily: 'Lexend_500Medium' }}>{errors.custom_label.message}</Text> : null}
        </View>

        <Controller
          control={control}
          name="frequency_days"
          render={({ field: { onChange, value } }) => <FrequencySelector value={value} onChange={onChange} error={errors.frequency_days?.message} />}
        />

        <Button label={submitLabel ?? t('habit_form.save_default')} onPress={handleSubmit(handleFormSubmit)} loading={loading} style={{ marginTop: theme.spacing.stackSm }} />
      </Card>
    );
  }

  return (
    <View style={{ gap: theme.spacing.stackMd }}>
      <View>
        <SectionLabel label={t('create_habit.sections.identity')} />
        <View style={{ gap: theme.spacing.stackMd }}>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <Input
                label={t('habit_form.name_label')}
                onChangeText={onChange}
                value={value}
                placeholder={t('habit_form.name_placeholder')}
                error={errors.name?.message}
                variant="underline"
              />
            )}
          />

          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, value } }) => (
              <Input
                label={t('habit_form.description_label')}
                onChangeText={onChange}
                value={value ?? ''}
                placeholder={t('habit_form.description_placeholder')}
                multiline
                numberOfLines={3}
              />
            )}
          />
        </View>
      </View>

      <View>
        <SectionLabel label={t('create_habit.sections.category')} />
        <StitchCategoryGrid
          options={categoryOptions}
          selectedId={selectedCategoryOption.categoryId}
          onSelect={applyCategory}
        />

        {selectedCategoryId === 'custom' ? (
          <View style={{ marginTop: theme.spacing.stackMd }}>
            <CustomCategoryInput
              label={watchedCustomLabel ?? ''}
              emoji={watchedCustomEmoji ?? '✦'}
              onChange={({ label, emoji }) => {
                setValue('custom_label', label, { shouldValidate: true });
                setValue('custom_emoji', emoji, { shouldValidate: true });
              }}
            />
            {errors.custom_label ? (
              <Text style={{ color: theme.status.danger, fontSize: 12, fontFamily: 'Lexend_500Medium', marginTop: 6 }}>
                {errors.custom_label.message}
              </Text>
            ) : null}
          </View>
        ) : null}
      </View>

      <View>
        <SectionLabel label={t('create_habit.sections.frequency')} />
        <StitchFrequencyPresets
          selectedPreset={frequencyPreset}
          onSelect={applyFrequencyPreset}
        />

        <Text
          style={[
            formSectionLabelBase,
            {
              color: theme.text.secondary,
              fontSize: theme.typography.scale.microBold.fontSize,
              letterSpacing: theme.typography.scale.microBold.letterSpacing,
              marginTop: theme.spacing.stackMd,
              marginBottom: theme.spacing.stackSm,
              opacity: frequencyPreset === 'custom' ? 1 : 0.7,
            },
          ]}
        >
          {t('create_habit.select_days')}
        </Text>

        <StitchDayPicker
          selectedDays={watchedFrequencyDays}
          active={frequencyPreset === 'custom'}
          onToggle={toggleCustomDay}
        />

        {errors.frequency_days ? (
          <Text style={{ color: theme.status.danger, fontSize: 12, marginTop: 6, fontFamily: 'Lexend_500Medium' }}>
            {errors.frequency_days.message}
          </Text>
        ) : null}
      </View>

      <Button
        label={submitLabel ?? t('habit_form.save_default')}
        onPress={handleSubmit(handleFormSubmit)}
        loading={loading}
        style={{ marginTop: theme.spacing.stackSm }}
      />
    </View>
  );
};
