import React, { useCallback, useRef, useImperativeHandle } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import {
  BottomSheetModal,
  BottomSheetTextInput,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useThemeColors } from "../../../core/theme/useThemeColors";
import type { Database } from "../../../shared/types/database.types";

type TaskFrequency = Database["public"]["Enums"]["task_frequency"];

const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  due_date: z.string(),
  frequency: z.enum(["once", "daily", "weekly", "custom"]).default("once"),
  custom_days: z.array(z.number().min(1).max(7)).optional(),
  subtasks: z.array(z.object({ title: z.string().min(1) })).default([]),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export interface CreateTaskSheetRef {
  present: () => void;
}

interface CreateTaskSheetProps {
  defaultDate: string;
  onSubmit: (data: CreateTaskInput) => Promise<void> | void;
  onClose: () => void;
  ref?: React.Ref<CreateTaskSheetRef>;
}

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];
const FREQUENCY_OPTIONS: { label: string; value: TaskFrequency }[] = [
  { label: "Once", value: "once" },
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Custom", value: "custom" },
];

export function CreateTaskSheet({
  defaultDate,
  onSubmit,
  onClose,
  ref,
}: CreateTaskSheetProps) {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const themeColors = useThemeColors();

  useImperativeHandle(ref, () => ({
    present: () => {
      setSubmitError(null);
      bottomSheetRef.current?.present();
    },
  }));

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
    reset,
  } = useForm<CreateTaskInput>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: "",
      due_date: defaultDate,
      frequency: "once" as TaskFrequency,
      custom_days: [],
      subtasks: [],
    },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "subtasks",
  });

  const frequency = watch("frequency");
  const customDays: number[] = (watch("custom_days") as number[]) ?? [];

  const toggleCustomDay = useCallback(
    (day: number) => {
      const current = watch("custom_days") ?? [];
      const next = current.includes(day)
        ? current.filter((d) => d !== day)
        : [...current, day].sort();
      setValue("custom_days", next, { shouldValidate: true });
    },
    [setValue, watch],
  );

  const handleSave = useCallback(
    async (data: CreateTaskInput) => {
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        await onSubmit(data);
        bottomSheetRef.current?.dismiss();
        reset();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to create task";
        setSubmitError(message);
        // Sheet stays open on error
      } finally {
        setIsSubmitting(false);
      }
    },
    [onSubmit, reset],
  );

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={["70%"]}
      onDismiss={onClose}
      enablePanDownToClose
    >
      <BottomSheetView className="px-6 py-4">
        {/* Title */}
        <Text className="text-lg font-semibold text-on-surface mb-4">
          New Task
        </Text>

        {/* Title Input */}
        <Controller
          control={control}
          name="title"
          render={({
            field: { onChange, onBlur, value },
            fieldState: { error },
          }) => (
            <View className="mb-4">
              <BottomSheetTextInput
                placeholder="Task title"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                className="bg-surface-container rounded-lg px-4 py-3 text-on-surface text-base"
                placeholderTextColor={themeColors['--color-on-surface-variant']}
              />
              {error && (
                <Text className="text-error text-xs mt-1">
                  {error.message || "Title is required"}
                </Text>
              )}
            </View>
          )}
        />

        {/* Due Date (display only) */}
        <View className="flex-row items-center gap-2 mb-4">
          <MaterialIcons
            name="calendar-today"
            size={18}
            color={themeColors['--color-on-surface-variant']}
          />
          <Text className="text-on-surface-variant text-sm">{defaultDate}</Text>
        </View>

        {/* Frequency Selector */}
        <Text className="text-sm font-medium text-on-surface mb-2">
          Repeat Frequency
        </Text>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {FREQUENCY_OPTIONS.map((opt) => {
            const isSelected = frequency === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                onPress={() =>
                  setValue("frequency", opt.value, { shouldValidate: true })
                }
                className={`px-3 py-1.5 rounded-full ${
                  isSelected ? "bg-primary" : "bg-surface-container"
                }`}
                accessibilityRole="button"
                accessibilityLabel={`Frequency ${opt.label}`}
                accessibilityState={{ selected: isSelected }}
              >
                <Text
                  className={`text-sm font-medium ${
                    isSelected ? "text-on-primary" : "text-on-surface-variant"
                  }`}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Custom Days Selector */}
        {frequency === "custom" && (
          <View className="mb-4">
            <Text className="text-sm font-medium text-on-surface mb-2">
              Custom Days
            </Text>
            <View className="flex-row gap-2">
              {DAY_LABELS.map((label, i) => {
                const dayNum = i + 1; // 1=Mon, 7=Sun
                const isSelected = customDays.includes(dayNum);
                return (
                  <TouchableOpacity
                    key={dayNum}
                    onPress={() => toggleCustomDay(dayNum)}
                    className={`w-9 h-9 rounded-full items-center justify-center ${
                      isSelected ? "bg-primary" : "bg-surface-container"
                    }`}
                    accessibilityRole="button"
                    accessibilityLabel={`Day ${label}`}
                    accessibilityState={{ selected: isSelected }}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        isSelected ? "text-on-primary" : "text-on-surface-variant"
                      }`}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Subtasks */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-on-surface mb-2">
            Subtasks
          </Text>
          {fields.map((field, index) => (
            <View key={field.id} className="flex-row items-center gap-2 mb-2">
              <Controller
                control={control}
                name={`subtasks.${index}.title`}
                render={({
                  field: { onChange, onBlur, value },
                  fieldState: { error },
                }) => (
                  <View className="flex-1">
                    <BottomSheetTextInput
                      placeholder="Subtask title"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      className="bg-surface-container rounded-lg px-3 py-2 text-on-surface text-sm"
                placeholderTextColor={themeColors['--color-on-surface-variant']}
                    />
                    {error && (
                      <Text className="text-error text-xs mt-1">
                        {error.message}
                      </Text>
                    )}
                  </View>
                )}
              />
              <TouchableOpacity
                onPress={() => remove(index)}
                accessibilityLabel="Remove subtask"
              >
                <MaterialIcons
                  name="close"
                  size={20}
                  color={themeColors['--color-on-surface-variant']}
                />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity
            onPress={() => append({ title: "" })}
            className="flex-row items-center gap-1 mt-1"
            accessibilityRole="button"
          >
            <MaterialIcons name="add" size={18} color={themeColors['--color-primary']} />
            <Text className="text-primary text-sm font-medium">
              Add subtask
            </Text>
          </TouchableOpacity>
        </View>

        {/* Error message */}
        {submitError && (
          <Text className="text-error text-sm mb-3">{submitError}</Text>
        )}

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSubmit(handleSave)}
          disabled={!isValid || isSubmitting}
          className={`py-3 rounded-lg items-center ${
            isValid && !isSubmitting ? "bg-primary" : "bg-surface-container"
          }`}
          accessibilityRole="button"
          accessibilityLabel="Save task"
        >
          <Text
            className={`text-base font-semibold ${
              isValid && !isSubmitting
                ? "text-on-primary"
                : "text-on-surface-variant"
            }`}
          >
            {isSubmitting ? "Saving..." : "Save"}
          </Text>
        </TouchableOpacity>
      </BottomSheetView>
    </BottomSheetModal>
  );
}
