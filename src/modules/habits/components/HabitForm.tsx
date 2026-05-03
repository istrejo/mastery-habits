import React, { useMemo } from 'react';
import { View } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Input, Button } from '@core/components';
import { FrequencySelector } from './FrequencySelector';
import type { HabitInsert } from '../types';

export type HabitFormData = {
  name: string;
  description?: string;
  category?: string;
  frequency_days: number[];
};

interface HabitFormProps {
  defaultValues?: Partial<HabitFormData>;
  onSubmit: (data: HabitInsert) => Promise<void>;
  submitLabel?: string;
  loading?: boolean;
}

export const HabitForm: React.FC<HabitFormProps> = ({
  defaultValues,
  onSubmit,
  submitLabel,
  loading = false,
}) => {
  const { t } = useTranslation();

  const schema = useMemo(
    () =>
      z.object({
        name: z.string().min(1, t('habit_form.error_required')).max(80, t('habit_form.error_name_max')),
        description: z.string().max(300).optional(),
        category: z.string().max(40).optional(),
        frequency_days: z
          .array(z.number().int().min(1).max(7))
          .min(1, t('habit_form.error_days_min')),
      }),
    [t]
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<HabitFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      category: '',
      frequency_days: [1, 2, 3, 4, 5],
      ...defaultValues,
    },
  });

  const handleFormSubmit = (data: HabitFormData) => {
    const payload: HabitInsert = {
      name: data.name,
      frequency_days: data.frequency_days,
      ...(data.description ? { description: data.description } : {}),
      ...(data.category ? { category: data.category } : {}),
    };
    onSubmit(payload);
  };

  return (
    <View style={{ gap: 16 }}>
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

      <Controller
        control={control}
        name="category"
        render={({ field: { onChange, value } }) => (
          <Input
            label={t('habit_form.category_label')}
            onChangeText={onChange}
            value={value ?? ''}
            placeholder={t('habit_form.category_placeholder')}
          />
        )}
      />

      <Controller
        control={control}
        name="frequency_days"
        render={({ field: { onChange, value } }) => (
          <FrequencySelector
            value={value}
            onChange={onChange}
            error={errors.frequency_days?.message}
          />
        )}
      />

      <Button
        label={submitLabel ?? t('habit_form.save_default')}
        onPress={handleSubmit(handleFormSubmit)}
        loading={loading}
        style={{ marginTop: 8 }}
      />
    </View>
  );
};
