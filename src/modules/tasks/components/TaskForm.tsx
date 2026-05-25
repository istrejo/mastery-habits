import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTheme } from '@core/theming';
import { useTranslation } from 'react-i18next';
import { taskValidationSchema, type TaskFormValues } from '../utils/taskValidationSchema';

interface HabitOption {
  id: string;
  name: string;
}

interface TaskFormProps {
  defaultValues?: Partial<TaskFormValues>;
  habitId?: string;
  habitOptions?: HabitOption[];
  onSubmit: (values: TaskFormValues) => Promise<void>;
  submitting?: boolean;
}

export const TaskForm: React.FC<TaskFormProps> = ({
  defaultValues,
  habitId,
  habitOptions = [],
  onSubmit,
  submitting = false,
}) => {
  const t = useTheme();
  const { t: i18n } = useTranslation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskValidationSchema),
    defaultValues: { habit_id: habitId ?? null, ...defaultValues },
  });

  const fieldStyle = {
    backgroundColor: t.bg.surfaceAlt,
    borderColor: t.border.default,
    borderWidth: t.borderWidth.default,
    borderRadius: t.radius.md,
    padding: t.spacing.stackMd,
    color: t.text.primary,
    fontSize: t.typography.scale.bodyMain.fontSize,
    fontFamily: 'Lexend_400Regular',
  };

  const labelStyle = {
    color: t.text.secondary,
    fontSize: t.typography.scale.labelCaps.fontSize,
    fontFamily: 'Lexend_500Medium',
    marginBottom: 4,
  };

  const errorStyle = {
    color: t.status.danger,
    fontSize: t.typography.scale.microBold.fontSize,
    marginTop: 4,
  };

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: t.spacing.stackMd, padding: t.spacing.gutter }}>
      <View>
        <Text style={labelStyle}>{i18n('tasks.form.title_label')}</Text>
        <Controller
          control={control}
          name="title"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder={i18n('tasks.form.title_placeholder')}
              placeholderTextColor={t.text.tertiary}
              style={fieldStyle}
            />
          )}
        />
        {errors.title && <Text style={errorStyle}>{errors.title.message}</Text>}
      </View>

      <View>
        <Text style={labelStyle}>{i18n('tasks.form.description_label')}</Text>
        <Controller
          control={control}
          name="description"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              value={value ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              multiline
              numberOfLines={3}
              placeholder={i18n('tasks.form.description_label')}
              placeholderTextColor={t.text.tertiary}
              style={[fieldStyle, { height: 80, textAlignVertical: 'top' }]}
            />
          )}
        />
      </View>

      <View>
        <Text style={labelStyle}>{i18n('tasks.form.due_date_label')}</Text>
        <Controller
          control={control}
          name="due_date"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              value={value ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={t.text.tertiary}
              style={fieldStyle}
              keyboardType="numbers-and-punctuation"
            />
          )}
        />
      </View>

      {habitOptions.length > 0 ? (
        <View>
          <Text style={labelStyle}>{i18n('tasks.form.habit_label')}</Text>
          <Controller
            control={control}
            name="habit_id"
            render={({ field: { value, onChange } }) => (
              <View style={{ gap: t.spacing.stackSm }}>
                <TouchableOpacity
                  onPress={() => onChange(null)}
                  activeOpacity={0.8}
                  style={{
                    borderColor: value ? t.border.default : t.text.primary,
                    borderWidth: value ? t.borderWidth.default : t.borderWidth.bold,
                    borderRadius: t.radius.md,
                    padding: t.spacing.stackSm,
                    backgroundColor: value ? 'transparent' : t.bg.surfaceAlt,
                  }}
                >
                  <Text style={{ color: t.text.primary, fontFamily: 'Lexend_500Medium' }}>
                    {i18n('tasks.form.habit_none')}
                  </Text>
                </TouchableOpacity>

                {habitOptions.map((habit) => {
                  const selected = value === habit.id;
                  return (
                    <TouchableOpacity
                      key={habit.id}
                      onPress={() => onChange(habit.id)}
                      activeOpacity={0.8}
                      style={{
                        borderColor: selected ? t.text.primary : t.border.default,
                        borderWidth: selected ? t.borderWidth.bold : t.borderWidth.default,
                        borderRadius: t.radius.md,
                        padding: t.spacing.stackSm,
                        backgroundColor: selected ? t.bg.surfaceAlt : 'transparent',
                      }}
                    >
                      <Text style={{ color: t.text.primary, fontFamily: 'Lexend_500Medium' }}>
                        {habit.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          />
        </View>
      ) : null}

      <TouchableOpacity
        onPress={handleSubmit(onSubmit)}
        disabled={submitting}
        activeOpacity={0.8}
        style={{
          backgroundColor: t.accent.primary,
          borderRadius: t.radius.md,
          padding: t.spacing.stackMd,
          alignItems: 'center',
          opacity: submitting ? 0.6 : 1,
          marginTop: t.spacing.stackMd,
        }}
      >
        <Text style={{ color: t.accent.onPrimary, fontFamily: 'Lexend_600SemiBold', fontSize: 15 }}>
          {i18n('tasks.form.submit_create')}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};
