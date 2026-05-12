import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@core/theming';
import { Input, Button, Card } from '@core/components';
import { FrequencySelector } from './FrequencySelector';
import { CategoryPicker } from './CategoryPicker';
import type { HabitInsert } from '../types';
import type { HabitCategoryId } from '../constants/categories';

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
}

const CATEGORY_IDS = ['health', 'mind', 'learning', 'productivity', 'nutrition', 'creativity', 'social', 'finance', 'custom'] as const;

export const HabitForm: React.FC<HabitFormProps> = ({ defaultValues, onSubmit, submitLabel, loading = false }) => {
  const { t } = useTranslation();
  const theme = useTheme();

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
        message: 'Custom requiere label y emoji',
        path: ['custom_label'],
      }),
    [t]
  );

  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<HabitFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      category: 'health',
      custom_label: '',
      custom_emoji: '✨',
      frequency_days: [1, 2, 3, 4, 5],
      ...defaultValues,
    },
  });

  const watchedCustomLabel = watch('custom_label');
  const watchedCustomEmoji = watch('custom_emoji');

  const handleFormSubmit = (data: HabitFormData) => {
    const isCustom = data.category === 'custom';
    onSubmit({
      name: data.name,
      frequency_days: data.frequency_days,
      category: data.category,
      description: data.description || undefined,
      custom_label: isCustom ? (data.custom_label ?? null) : null,
      custom_emoji: isCustom ? (data.custom_emoji ?? null) : null,
    });
  };

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
        {errors.custom_label && <Text style={{ color: theme.status.danger, fontSize: 12, fontFamily: 'Lexend_500Medium' }}>{errors.custom_label.message}</Text>}
      </View>

      <Controller
        control={control}
        name="frequency_days"
        render={({ field: { onChange, value } }) => <FrequencySelector value={value} onChange={onChange} error={errors.frequency_days?.message} />}
      />

      <Button label={submitLabel ?? t('habit_form.save_default')} onPress={handleSubmit(handleFormSubmit)} loading={loading} style={{ marginTop: theme.spacing.stackSm }} />
    </Card>
  );
};
