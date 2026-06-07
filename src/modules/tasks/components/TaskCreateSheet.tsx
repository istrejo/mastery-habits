import React, { useEffect, useMemo, useReducer, useRef } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  Pressable,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  withSpring,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@core/theming';
import { useTranslation } from 'react-i18next';
import type { TaskWithHabit } from '../types';

const sheetBase = {
  maxHeight: '86%' as const,
};

const titleInputBase = {
  backgroundColor: 'transparent' as const,
  borderWidth: 0,
  fontFamily: 'Lexend_600SemiBold' as const,
  minHeight: 44,
  paddingHorizontal: 0,
  paddingVertical: 4,
};

const notesInputBase = {
  fontFamily: 'Lexend_400Regular' as const,
  height: 56,
  paddingVertical: 8,
  textAlignVertical: 'top' as const,
};

export interface TaskCreateSheetValues {
  title: string;
  notes?: string | null;
  subtasks: Array<{ title: string; completed: boolean }>;
}

interface TaskCreateSheetProps {
  task?: TaskWithHabit | null;
  visible: boolean;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (values: TaskCreateSheetValues) => Promise<void>;
}

interface SubtaskItem {
  title: string;
  completed: boolean;
}

function SheetTopBar({
  isEditMode,
  canSubmit,
  submitting,
  onClose,
  onSubmit,
}: {
  isEditMode: boolean;
  canSubmit: boolean;
  submitting: boolean;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.stackMd,
      }}
    >
      <Pressable
        testID='task-sheet-close-top'
        onPress={onClose}
        hitSlop={12}
        style={({ pressed }) => [{
          width: 52,
          height: 52,
          borderRadius: theme.radius.pill,
          borderWidth: theme.borderWidth.default,
          borderColor: theme.border.default,
          backgroundColor: theme.bg.surface,
          alignItems: 'center',
          justifyContent: 'center',
        }, { opacity: pressed ? 0.82 : 1 }]}
      >
        <MaterialIcons name='close' size={30} color={theme.text.primary} />
      </Pressable>

      <Pressable
        testID='task-sheet-submit'
        accessibilityLabel={
          isEditMode ? 'Save task from top bar' : 'Add task from top bar'
        }
        onPress={onSubmit}
        disabled={!canSubmit || submitting}
        style={({ pressed }) => [{
          backgroundColor: theme.accent.primary,
          borderRadius: theme.radius.lg,
          paddingHorizontal: theme.spacing.stackMd,
          paddingVertical: theme.spacing.stackSm,
        }, { opacity: !canSubmit || submitting ? 0.5 : pressed ? 0.85 : 1 }]}
      >
        <Text
          style={{
            color: theme.accent.onPrimary,
            fontFamily: 'Lexend_600SemiBold',
            fontSize: theme.typography.scale.bodyMain.fontSize,
          }}
        >
          {t(isEditMode ? 'tasks.sheet.save' : 'tasks.sheet.create')}
        </Text>
      </Pressable>
    </View>
  );
}

function SubtasksSection({
  subtasks,
  editingIndex,
  editingText,
  subtaskDraft,
  onToggleCompleted,
  onStartEdit,
  onSaveEdit,
  onDelete,
  onCommitDraft,
  onEditingTextChange,
  onSubtaskDraftChange,
}: {
  subtasks: SubtaskItem[];
  editingIndex: number | null;
  editingText: string;
  subtaskDraft: string;
  onToggleCompleted: (index: number) => void;
  onStartEdit: (index: number) => void;
  onSaveEdit: () => void;
  onDelete: (index: number) => void;
  onCommitDraft: () => void;
  onEditingTextChange: (text: string) => void;
  onSubtaskDraftChange: (text: string) => void;
}) {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <View style={{ gap: theme.spacing.stackSm }}>
      <Text
        style={{
          color: theme.text.secondary,
          fontSize: theme.typography.scale.labelCaps.fontSize,
          fontFamily: 'Lexend_600SemiBold',
          textTransform: 'uppercase',
        }}
      >
        {t('tasks.sheet.subtasks_label')}
      </Text>
      {subtasks.map((subtask, index) => {
        const isEditing = editingIndex === index;
        return (
          <View
            key={`${subtask.title}-${index}`}
            testID={`task-sheet-subtask-row-${index}`}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: theme.spacing.stackSm,
            }}
          >
            <Pressable
              testID={`task-sheet-subtask-checkbox-${index}`}
              onPress={() => onToggleCompleted(index)}
              style={({ pressed }) => [{
                width: 24,
                height: 24,
                borderRadius: theme.radius.sm,
                borderWidth: theme.borderWidth.default,
                borderColor: theme.text.primary,
                backgroundColor: subtask.completed
                  ? theme.accent.primary
                  : 'transparent',
                alignItems: 'center',
                justifyContent: 'center',
              }, { opacity: pressed ? 0.82 : 1 }]}
            >
              {subtask.completed && (
                <MaterialIcons
                  name='check'
                  size={18}
                  color={theme.accent.onPrimary}
                />
              )}
            </Pressable>
            {isEditing ? (
              <TextInput
                testID={`task-sheet-subtask-edit-input-${index}`}
                value={editingText}
                onChangeText={onEditingTextChange}
                onBlur={onSaveEdit}
                onSubmitEditing={onSaveEdit}
                autoFocus
                returnKeyType='done'
                style={{
                  flex: 1,
                  color: theme.accent.primary,
                  fontFamily: 'Lexend_600SemiBold',
                  fontSize: theme.typography.scale.bodyMain.fontSize,
                  lineHeight: theme.typography.scale.bodyMain.lineHeight,
                  paddingVertical: 0,
                }}
              />
            ) : (
              <Pressable
                onPress={() => onStartEdit(index)}
                style={({ pressed }) => [{ flex: 1 }, { opacity: pressed ? 0.82 : 1 }]}
              >
                <Text
                  numberOfLines={1}
                  style={{
                    color: theme.text.primary,
                    fontFamily: 'Lexend_600SemiBold',
                    fontSize: theme.typography.scale.bodyMain.fontSize,
                    lineHeight: theme.typography.scale.bodyMain.lineHeight,
                    textDecorationLine: subtask.completed
                      ? 'line-through'
                      : 'none',
                    opacity: subtask.completed ? 0.6 : 1,
                  }}
                >
                  {subtask.title}
                </Text>
              </Pressable>
            )}
            {isEditing && (
              <Pressable
                testID={`task-sheet-subtask-delete-${index}`}
                onPress={() => {
                  onDelete(index);
                }}
                hitSlop={8}
                style={({ pressed }) => [{
                  padding: 4,
                }, { opacity: pressed ? 0.82 : 1 }]}
              >
                <MaterialIcons
                  name='delete-outline'
                  size={20}
                  color={theme.text.tertiary}
                />
              </Pressable>
            )}
          </View>
        );
      })}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.stackSm,
        }}
      >
        <Pressable
          onPress={onCommitDraft}
          style={({ pressed }) => [{
            width: 24,
            height: 24,
            borderRadius: theme.radius.sm,
            borderWidth: theme.borderWidth.default,
            borderColor: theme.text.tertiary,
            alignItems: 'center',
            justifyContent: 'center',
          }, { opacity: pressed ? 0.82 : 1 }]}
        >
          <MaterialIcons
            name='add'
            size={18}
            color={theme.text.tertiary}
          />
        </Pressable>
        <TextInput
          testID='task-sheet-add-subtask-input'
          value={subtaskDraft}
          onChangeText={onSubtaskDraftChange}
          onSubmitEditing={onCommitDraft}
          onBlur={onCommitDraft}
          placeholder={t('tasks.sheet.add_subtask')}
          placeholderTextColor={theme.text.tertiary}
          returnKeyType='next'
          blurOnSubmit={false}
          style={{
            flex: 1,
            color: theme.text.primary,
            fontFamily: 'Lexend_600SemiBold',
            fontSize: theme.typography.scale.bodyMain.fontSize,
            lineHeight: theme.typography.scale.bodyMain.lineHeight,
            paddingVertical: 0,
          }}
        />
      </View>
    </View>
  );
}

interface TaskFormState {
  title: string;
  notes: string;
  subtasks: Array<{ title: string; completed: boolean }>;
  subtaskDraft: string;
  editingSubtaskIndex: number | null;
  editingSubtaskText: string;
}

type TaskFormAction =
  | { type: 'SET_TITLE'; payload: string }
  | { type: 'SET_NOTES'; payload: string }
  | { type: 'SET_SUBTASKS'; payload: Array<{ title: string; completed: boolean }> }
  | { type: 'SET_SUBTASK_DRAFT'; payload: string }
  | { type: 'SET_EDITING_INDEX'; payload: number | null }
  | { type: 'SET_EDITING_TEXT'; payload: string }
  | { type: 'ADD_SUBTASK'; payload: { title: string; completed: boolean } }
  | { type: 'REMOVE_SUBTASK'; payload: number }
  | { type: 'TOGGLE_COMPLETED'; payload: number }
  | { type: 'UPDATE_SUBTASK_TITLE'; payload: { index: number; title: string } }
  | { type: 'INIT_FROM_TASK'; payload: { title: string; notes: string; subtasks: Array<{ title: string; completed: boolean }> } }
  | { type: 'RESET' };

const initialFormState: TaskFormState = {
  title: '',
  notes: '',
  subtasks: [],
  subtaskDraft: '',
  editingSubtaskIndex: null,
  editingSubtaskText: '',
};

function taskFormReducer(state: TaskFormState, action: TaskFormAction): TaskFormState {
  switch (action.type) {
    case 'SET_TITLE':
      return { ...state, title: action.payload };
    case 'SET_NOTES':
      return { ...state, notes: action.payload };
    case 'SET_SUBTASKS':
      return { ...state, subtasks: action.payload };
    case 'SET_SUBTASK_DRAFT':
      return { ...state, subtaskDraft: action.payload };
    case 'SET_EDITING_INDEX':
      return { ...state, editingSubtaskIndex: action.payload };
    case 'SET_EDITING_TEXT':
      return { ...state, editingSubtaskText: action.payload };
    case 'ADD_SUBTASK':
      return { ...state, subtasks: [...state.subtasks, action.payload] };
    case 'REMOVE_SUBTASK':
      return { ...state, subtasks: state.subtasks.filter((_, i) => i !== action.payload) };
    case 'TOGGLE_COMPLETED':
      return {
        ...state,
        subtasks: state.subtasks.map((item, i) =>
          i === action.payload ? { ...item, completed: !item.completed } : item
        ),
      };
    case 'UPDATE_SUBTASK_TITLE':
      return {
        ...state,
        subtasks: state.subtasks.map((item, i) =>
          i === action.payload.index ? { ...item, title: action.payload.title } : item
        ),
      };
    case 'INIT_FROM_TASK':
      return {
        ...initialFormState,
        title: action.payload.title,
        notes: action.payload.notes,
        subtasks: action.payload.subtasks,
      };
    case 'RESET':
      return initialFormState;
    default:
      return state;
  }
}

export const TaskCreateSheet: React.FC<TaskCreateSheetProps> = ({
  task,
  visible,
  submitting = false,
  onClose,
  onSubmit,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const translateY = useSharedValue(600);
  const [state, dispatch] = useReducer(taskFormReducer, initialFormState);
  const isEditMode = !!task;

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 20, stiffness: 90 });
    } else {
      translateY.value = 600;
    }
  }, [visible, translateY]);

  const prevTaskRef = useRef(task);
  const prevVisibleRef = useRef(visible);

  if (task !== prevTaskRef.current || visible !== prevVisibleRef.current) {
    prevTaskRef.current = task;
    prevVisibleRef.current = visible;
    if (task && visible) {
      dispatch({
        type: 'INIT_FROM_TASK',
        payload: {
          title: task.title,
          notes: task.description || '',
          subtasks: (task.task_subtasks ?? []).map((st) => ({
            title: st.title,
            completed: st.status === 'completed',
          })),
        },
      });
    } else if (!visible) {
      dispatch({ type: 'RESET' });
    }
  }

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .minDistance(12)
        .onUpdate((event) => {
          if (event.translationY > 0) translateY.value = event.translationY;
        })
        .onEnd((event) => {
          if (event.translationY > 90) {
            translateY.value = 600;
            onClose();
            return;
          }
          translateY.value = withSpring(0, { damping: 20, stiffness: 90 });
        }),
    [onClose, translateY]
  );

  const handleSubmit = async () => {
    const trimmedTitle = state.title.trim();
    if (!trimmedTitle || submitting) return;

    const allSubtasks = [...state.subtasks];
    const trimmedDraft = state.subtaskDraft.trim();
    if (trimmedDraft) {
      allSubtasks.push({ title: trimmedDraft, completed: false });
    }

    await onSubmit({
      title: trimmedTitle,
      notes: state.notes.trim() || null,
      subtasks: allSubtasks,
    });
    if (!isEditMode) {
      dispatch({ type: 'RESET' });
    }
    onClose();
  };

  const commitSubtaskDraft = () => {
    const trimmed = state.subtaskDraft.trim();
    if (!trimmed) return;
    dispatch({ type: 'ADD_SUBTASK', payload: { title: trimmed, completed: false } });
    dispatch({ type: 'SET_SUBTASK_DRAFT', payload: '' });
  };

  const removeSubtask = (index: number) => {
    dispatch({ type: 'REMOVE_SUBTASK', payload: index });
  };

  const toggleSubtaskCompleted = (index: number) => {
    dispatch({ type: 'TOGGLE_COMPLETED', payload: index });
  };

  const startEditingSubtask = (index: number) => {
    dispatch({ type: 'SET_EDITING_INDEX', payload: index });
    dispatch({ type: 'SET_EDITING_TEXT', payload: state.subtasks[index]?.title || '' });
  };

  const saveEditingSubtask = () => {
    if (state.editingSubtaskIndex === null) return;
    const trimmed = state.editingSubtaskText.trim();
    if (!trimmed) {
      dispatch({ type: 'REMOVE_SUBTASK', payload: state.editingSubtaskIndex });
    } else {
      dispatch({
        type: 'UPDATE_SUBTASK_TITLE',
        payload: { index: state.editingSubtaskIndex, title: trimmed },
      });
    }
    dispatch({ type: 'SET_EDITING_INDEX', payload: null });
    dispatch({ type: 'SET_EDITING_TEXT', payload: '' });
  };

  const animatedSheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType='none'
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        testID='task-sheet-keyboard-avoider'
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
        style={{ flex: 1, justifyContent: 'flex-end' }}
      >
        <Pressable
          onPress={onClose}
          style={{
            flex: 1,
            justifyContent: 'flex-end',
            backgroundColor: 'rgba(0,0,0,0.42)',
          }}
        >
          <GestureDetector gesture={panGesture}>
            <Animated.View
            style={[
              animatedSheetStyle,
              sheetBase,
              {
                backgroundColor: theme.bg.elevated,
                borderTopLeftRadius: theme.radius.lg,
                borderTopRightRadius: theme.radius.lg,
                borderColor: theme.border.default,
                borderWidth: theme.borderWidth.default,
                paddingHorizontal: theme.spacing.gutter,
                paddingTop: theme.spacing.stackSm,
                paddingBottom: theme.spacing.stackLg,
              },
            ]}
          >
            <Pressable onPress={() => undefined}>
              <View
                style={{
                  alignItems: 'center',
                  marginBottom: theme.spacing.stackMd,
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 4,
                    borderRadius: theme.radius.pill,
                    backgroundColor: theme.border.default,
                  }}
                />
              </View>

              <SheetTopBar
                isEditMode={isEditMode}
                canSubmit={!!state.title.trim()}
                submitting={submitting}
                onClose={onClose}
                onSubmit={handleSubmit}
              />

              <ScrollView
                keyboardShouldPersistTaps='handled'
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ gap: theme.spacing.stackSm }}
              >
                <TextInput
                  testID='task-sheet-title-input'
                  value={state.title}
                  onChangeText={(text) => dispatch({ type: 'SET_TITLE', payload: text })}
                  placeholder={t('tasks.sheet.name_placeholder')}
                  placeholderTextColor={theme.text.tertiary}
                  style={[
                    titleInputBase,
                    {
                      color: theme.text.primary,
                      fontSize: theme.typography.scale.titleSm.fontSize,
                      lineHeight: theme.typography.scale.titleSm.lineHeight,
                    },
                  ]}
                />

                <TextInput
                  testID='task-sheet-notes-input'
                  value={state.notes}
                  onChangeText={(text) => dispatch({ type: 'SET_NOTES', payload: text })}
                  multiline
                  numberOfLines={2}
                  placeholder={t('tasks.sheet.notes_placeholder')}
                  placeholderTextColor={theme.text.tertiary}
                  style={[
                    notesInputBase,
                    {
                      backgroundColor: theme.bg.surfaceAlt,
                      borderColor: theme.border.default,
                      borderWidth: theme.borderWidth.hairline,
                      borderRadius: theme.radius.md,
                      color: theme.text.primary,
                      fontSize: theme.typography.scale.bodyMain.fontSize,
                      paddingHorizontal: theme.spacing.stackMd,
                    },
                  ]}
                />

                <SubtasksSection
                  subtasks={state.subtasks}
                  editingIndex={state.editingSubtaskIndex}
                  editingText={state.editingSubtaskText}
                  subtaskDraft={state.subtaskDraft}
                  onToggleCompleted={toggleSubtaskCompleted}
                  onStartEdit={startEditingSubtask}
                  onSaveEdit={saveEditingSubtask}
                  onDelete={(index) => {
                    dispatch({ type: 'REMOVE_SUBTASK', payload: index });
                    dispatch({ type: 'SET_EDITING_INDEX', payload: null });
                    dispatch({ type: 'SET_EDITING_TEXT', payload: '' });
                  }}
                  onCommitDraft={commitSubtaskDraft}
                  onEditingTextChange={(text) => dispatch({ type: 'SET_EDITING_TEXT', payload: text })}
                  onSubtaskDraftChange={(text) => dispatch({ type: 'SET_SUBTASK_DRAFT', payload: text })}
                />
              </ScrollView>
            </Pressable>
          </Animated.View>
          </GestureDetector>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};
