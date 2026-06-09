import React, { useCallback, useRef, useImperativeHandle } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import {
  BottomSheetModal,
  BottomSheetTextInput,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import type { Database } from "../../../shared/types/database.types";

type TaskFrequency = Database["public"]["Enums"]["task_frequency"];

export interface CreateTaskInput {
  title: string;
  due_date: string;
  frequency: TaskFrequency;
  custom_days?: number[];
  subtasks: { title: string }[];
}

export interface CreateTaskSheetRef {
  present: () => void;
}

interface CreateTaskSheetProps {
  defaultDate: string;
  onSubmit: (data: CreateTaskInput) => void;
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

  useImperativeHandle(ref, () => ({
    present: () => {
      bottomSheetRef.current?.present();
    },
  }));

  const { control, handleSubmit, watch, setValue, formState } = useForm<CreateTaskInput>({
    defaultValues: {
      title: "",
      due_date: defaultDate,
      frequency: "once" as TaskFrequency,
      custom_days: [],
      subtasks: [],
    },
    mode: "onSubmit",
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
      setValue("custom_days", next, { shouldValidate: false });
    },
    [setValue, watch],
  );

  const handleSave = useCallback(
    (data: CreateTaskInput) => {
      onSubmit(data);
      bottomSheetRef.current?.dismiss();
    },
    [onSubmit],
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
        <Text className="text-lg font-semibold text-foreground mb-4">
          Create Task
        </Text>

        {/* Title Input */}
        <Controller
          control={control}
          name="title"
          rules={{ required: true, minLength: 1 }}
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <View className="mb-4">
              <BottomSheetTextInput
                placeholder="Task title"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                className="bg-muted rounded-lg px-4 py-3 text-foreground text-base"
                placeholderTextColor="#9CA3AF"
              />
              {error && (
                <Text className="text-destructive text-xs mt-1">
                  Title is required
                </Text>
              )}
            </View>
          )}
        />

        {/* Due Date (display only) */}
        <View className="flex-row items-center gap-2 mb-4">
          <MaterialIcons name="calendar-today" size={18} color="#9CA3AF" />
          <Text className="text-muted-foreground text-sm">{defaultDate}</Text>
        </View>

        {/* Frequency Selector */}
        <Text className="text-sm font-medium text-foreground mb-2">Frequency</Text>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {FREQUENCY_OPTIONS.map((opt) => {
            const isSelected = frequency === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                onPress={() =>
                  setValue("frequency", opt.value, { shouldValidate: false })
                }
                className={`px-3 py-1.5 rounded-full ${
                  isSelected ? "bg-primary" : "bg-muted"
                }`}
                accessibilityRole="button"
                accessibilityLabel={`Frequency ${opt.label}`}
                accessibilityState={{ selected: isSelected }}
              >
                <Text
                  className={`text-sm font-medium ${
                    isSelected ? "text-primary-foreground" : "text-muted-foreground"
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
            <Text className="text-sm font-medium text-foreground mb-2">
              Select days
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
                      isSelected ? "bg-primary" : "bg-muted"
                    }`}
                    accessibilityRole="button"
                    accessibilityLabel={`Day ${label}`}
                    accessibilityState={{ selected: isSelected }}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        isSelected
                          ? "text-primary-foreground"
                          : "text-muted-foreground"
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
          <Text className="text-sm font-medium text-foreground mb-2">
            Subtasks
          </Text>
          {fields.map((field, index) => (
            <View key={field.id} className="flex-row items-center gap-2 mb-2">
              <Controller
                control={control}
                name={`subtasks.${index}.title`}
                rules={{ required: true, minLength: 1 }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <BottomSheetTextInput
                    placeholder="Subtask title"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    className="flex-1 bg-muted rounded-lg px-3 py-2 text-foreground text-sm"
                    placeholderTextColor="#9CA3AF"
                  />
                )}
              />
              <TouchableOpacity
                onPress={() => remove(index)}
                accessibilityLabel="Remove subtask"
              >
                <MaterialIcons name="close" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity
            onPress={() => append({ title: "" })}
            className="flex-row items-center gap-1 mt-1"
            accessibilityRole="button"
          >
            <MaterialIcons name="add" size={18} color="#3B82F6" />
            <Text className="text-primary text-sm font-medium">
              + Add subtask
            </Text>
          </TouchableOpacity>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSubmit(handleSave)}
          disabled={!formState.isValid && formState.submitCount > 0}
          className={`py-3 rounded-lg items-center ${
            formState.isValid || formState.submitCount === 0 ? "bg-primary" : "bg-muted"
          }`}
          accessibilityRole="button"
          accessibilityLabel="Save task"
        >
          <Text className="text-base font-semibold text-primary-foreground">
            Save
          </Text>
        </TouchableOpacity>
      </BottomSheetView>
    </BottomSheetModal>
  );
}
