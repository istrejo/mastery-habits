import { useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetTextInput,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../../../shared/ui/Button";
import { useCreateTask } from "../hooks/useCreateTask";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  priority: z.enum(["low", "medium", "high"]),
  subtaskTitles: z.array(z.string().min(1)).optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  sheetRef: React.RefObject<BottomSheetModal | null>;
  defaultDate: string;
  userId: string;
  onSuccess: () => void;
}

const SNAP_POINTS = ["65%"];

const PRIORITY_OPTIONS: Array<{ label: string; value: "low" | "medium" | "high" }> = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
];

export function CreateTaskSheet({ sheetRef, defaultDate, userId, onSuccess }: Props) {
  const { mutate: createTask, isPending } = useCreateTask(userId, defaultDate);

  const [subtaskInputs, setSubtaskInputs] = useState<{ id: string; value: string }[]>([]);
  const subtaskRefs = useRef<(TextInput | null)[]>([]);
  const subtaskCounter = useRef(0);

  const { control, handleSubmit, reset, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      priority: "medium",
      subtaskTitles: [],
    },
  });

  const titleValue = watch("title");

  function handleAddSubtaskRow() {
    const newId = `sub-${subtaskCounter.current++}`;
    setSubtaskInputs((prev) => [...prev, { id: newId, value: "" }]);
    setTimeout(() => {
      const nextIndex = subtaskInputs.length;
      subtaskRefs.current[nextIndex]?.focus();
    }, 100);
  }

  function handleRemoveSubtask(index: number) {
    setSubtaskInputs((prev) => prev.filter((_, i) => i !== index));
    subtaskRefs.current = subtaskRefs.current.filter((_, i) => i !== index);
  }

  function handleSubtaskChange(index: number, value: string) {
    setSubtaskInputs((prev) => {
      const next = [...prev];
      next[index] = { id: next[index]!.id, value };
      return next;
    });
  }

  function handleClose() {
    sheetRef.current?.dismiss();
  }

  function onSubmit(values: FormValues) {
    const validSubtasks = subtaskInputs
      .map((s) => s.value.trim())
      .filter((s) => s.length > 0);

    createTask(
      {
        title: values.title.trim(),
        priority: values.priority,
        subtaskTitles: validSubtasks.length > 0 ? validSubtasks : undefined,
      },
      {
        onSuccess: () => {
          reset();
          setSubtaskInputs([]);
          handleClose();
          onSuccess();
        },
      }
    );
  }

  function handleSheetDismiss() {
    reset();
    setSubtaskInputs([]);
  }

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={SNAP_POINTS}
      enablePanDownToClose
      onDismiss={handleSheetDismiss}
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
        />
      )}
    >
      <BottomSheetView className="flex-1 px-4 pb-8">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-on-surface font-semibold text-lg">New Task</Text>
          <Pressable
            onPress={handleClose}
            className="px-3 py-1 active:opacity-60"
            accessibilityLabel="Close"
            accessibilityRole="button"
          >
            <Text className="text-primary text-sm">Cancel</Text>
          </Pressable>
        </View>

        {/* Title field */}
        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, onBlur, value } }) => (
            <BottomSheetTextInput
              placeholder="Task title"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              returnKeyType="done"
              className="border border-outline rounded px-3 py-2.5 text-on-surface text-base mb-1"
              placeholderTextColor="#434655"
              autoFocus
            />
          )}
        />
        {errors.title && (
          <Text className="text-error text-xs mb-2">{errors.title.message}</Text>
        )}

        {/* Priority selector */}
        <View className="mt-4 mb-4">
          <Text className="text-on-surface-variant text-xs font-medium uppercase tracking-wider mb-2">
            Priority
          </Text>
          <Controller
            control={control}
            name="priority"
            render={({ field: { onChange, value } }) => (
              <View className="flex-row gap-2">
                {PRIORITY_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt.value}
                    onPress={() => onChange(opt.value)}
                    className={`px-4 py-1.5 rounded-full border active:opacity-70 ${
                      value === opt.value
                        ? "bg-secondary border-secondary"
                        : "bg-transparent border-outline"
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        value === opt.value
                          ? "text-on-secondary"
                          : "text-on-surface"
                      }`}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          />
        </View>

        {/* Subtasks */}
        <View className="mb-4">
          <Text className="text-on-surface-variant text-xs font-medium uppercase tracking-wider mb-2">
            Sub-tasks
          </Text>

          {subtaskInputs.map((item, index) => (
            <View key={item.id} className="flex-row items-center gap-2 mb-2">
              <TextInput
                ref={(el) => {
                  subtaskRefs.current[index] = el;
                }}
                value={item.value}
                onChangeText={(text) => handleSubtaskChange(index, text)}
                placeholder={`Sub-task ${index + 1}`}
                returnKeyType="done"
                className="flex-1 border border-outline rounded px-3 py-2 text-on-surface text-sm"
                placeholderTextColor="#434655"
              />
              <Pressable
                onPress={() => handleRemoveSubtask(index)}
                className="w-8 h-8 items-center justify-center rounded-full active:bg-surface-variant"
                accessibilityLabel="Remove sub-task"
              >
                <Text className="text-on-surface-variant text-lg leading-none">×</Text>
              </Pressable>
            </View>
          ))}

          <Pressable
            onPress={handleAddSubtaskRow}
            className="flex-row items-center gap-1 py-1 active:opacity-60"
          >
            <Text className="text-secondary text-sm">+ Add sub-task</Text>
          </Pressable>
        </View>

        {/* Save button */}
        <View className="mt-auto">
          {isPending ? (
            <ActivityIndicator size="small" className="py-3" />
          ) : (
            <Button
              label="Save Task"
              onPress={handleSubmit(onSubmit)}
              variant="primary"
              fullWidth
              disabled={!titleValue || titleValue.trim().length === 0 || isPending}
            />
          )}
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}
