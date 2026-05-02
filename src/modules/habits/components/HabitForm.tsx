import React from 'react';
import { View, Text } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input, Button } from '@core/components';
import { useTheme } from '@core/theming';
import { FrequencySelector } from './FrequencySelector';
import type { HabitInsert } from '../types';

const schema = z.object({
  name: z.string().min(1, 'Requerido').max(80, 'Máximo 80 caracteres'),
  description: z.string().max(300).optional(),
  category: z.string().max(40).optional(),
  frequency_days: z
    .array(z.number().int().min(1).max(7))
    .min(1, 'Seleccioná al menos un día'),
});

export type HabitFormData = z.infer<typeof schema>;

interface HabitFormProps {
  defaultValues?: Partial<HabitFormData>;
  onSubmit: (data: HabitInsert) => Promise<void>;
  submitLabel?: string;
  loading?: boolean;
}

export const HabitForm: React.FC<HabitFormProps> = ({
  defaultValues,
  onSubmit,
  submitLabel = 'Guardar',
  loading = false,
}) => {
  const t = useTheme();

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
            label="Nombre"
            onChangeText={onChange}
            value={value}
            placeholder="Ej: Meditación"
            error={errors.name?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="description"
        render={({ field: { onChange, value } }) => (
          <Input
            label="Descripción (opcional)"
            onChangeText={onChange}
            value={value ?? ''}
            placeholder="¿Para qué querés este hábito?"
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
            label="Categoría (opcional)"
            onChangeText={onChange}
            value={value ?? ''}
            placeholder="Ej: Salud, Mente, Trabajo"
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
        label={submitLabel}
        onPress={handleSubmit(handleFormSubmit)}
        loading={loading}
        style={{ marginTop: 8 }}
      />
    </View>
  );
};
