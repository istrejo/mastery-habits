import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@core/theming';
import { useTranslation } from 'react-i18next';
import type { TaskWithHabit } from '../types';

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

export const TaskCreateSheet: React.FC<TaskCreateSheetProps> = ({
  task,
  visible,
  submitting = false,
  onClose,
  onSubmit,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const translateY = useRef(new Animated.Value(600)).current;
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [subtasks, setSubtasks] = useState<
    Array<{ title: string; completed: boolean }>
  >([]);
  const [subtaskDraft, setSubtaskDraft] = useState('');
  const [editingSubtaskIndex, setEditingSubtaskIndex] = useState<number | null>(
    null
  );
  const [editingSubtaskText, setEditingSubtaskText] = useState('');
  const isEditMode = !!task;

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 90,
      }).start();
    } else {
      translateY.setValue(600);
    }
  }, [visible, translateY]);

  useEffect(() => {
    if (task && visible) {
      setTitle(task.title);
      setNotes(task.description || '');
      setSubtasks(
        (task.task_subtasks ?? []).map((st) => ({
          title: st.title,
          completed: st.status === 'completed',
        }))
      );
      setSubtaskDraft('');
    } else if (!visible) {
      setTitle('');
      setNotes('');
      setSubtasks([]);
      setSubtaskDraft('');
    }
  }, [task, visible]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_event, gesture) => gesture.dy > 12,
        onPanResponderMove: (_event, gesture) => {
          if (gesture.dy > 0) translateY.setValue(gesture.dy);
        },
        onPanResponderRelease: (_event, gesture) => {
          if (gesture.dy > 90) {
            translateY.setValue(600);
            onClose();
            return;
          }
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            damping: 20,
            stiffness: 90,
          }).start();
        },
      }),
    [onClose, translateY]
  );

  const reset = () => {
    setTitle('');
    setNotes('');
    setSubtasks([]);
    setSubtaskDraft('');
  };

  const handleSubmit = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle || submitting) return;

    const allSubtasks = [...subtasks];
    const trimmedDraft = subtaskDraft.trim();
    if (trimmedDraft) {
      allSubtasks.push({ title: trimmedDraft, completed: false });
    }

    await onSubmit({
      title: trimmedTitle,
      notes: notes.trim() || null,
      subtasks: allSubtasks,
    });
    if (!isEditMode) {
      reset();
    }
    onClose();
  };

  const commitSubtaskDraft = () => {
    const trimmed = subtaskDraft.trim();
    if (!trimmed) return;
    setSubtasks((current) => [
      ...current,
      { title: trimmed, completed: false },
    ]);
    setSubtaskDraft('');
  };

  const removeSubtask = (index: number) => {
    setSubtasks((current) => current.filter((_item, i) => i !== index));
  };

  const toggleSubtaskCompleted = (index: number) => {
    setSubtasks((current) =>
      current.map((item, i) =>
        i === index ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const startEditingSubtask = (index: number) => {
    setEditingSubtaskIndex(index);
    setEditingSubtaskText(subtasks[index]?.title || '');
  };

  const saveEditingSubtask = () => {
    if (editingSubtaskIndex === null) return;
    const trimmed = editingSubtaskText.trim();
    if (!trimmed) {
      removeSubtask(editingSubtaskIndex);
    } else {
      setSubtasks((current) =>
        current.map((item, i) =>
          i === editingSubtaskIndex ? { ...item, title: trimmed } : item
        )
      );
    }
    setEditingSubtaskIndex(null);
    setEditingSubtaskText('');
  };

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
        <TouchableOpacity
          activeOpacity={1}
          onPress={onClose}
          style={{
            flex: 1,
            justifyContent: 'flex-end',
            backgroundColor: 'rgba(0,0,0,0.42)',
          }}
        >
          <Animated.View
            {...panResponder.panHandlers}
            style={{
              transform: [{ translateY }],
              backgroundColor: theme.bg.elevated,
              borderTopLeftRadius: theme.radius.lg,
              borderTopRightRadius: theme.radius.lg,
              borderColor: theme.border.default,
              borderWidth: theme.borderWidth.default,
              paddingHorizontal: theme.spacing.gutter,
              paddingTop: theme.spacing.stackSm,
              paddingBottom: theme.spacing.stackLg,
              maxHeight: '86%',
            }}
          >
            <TouchableOpacity activeOpacity={1} onPress={() => undefined}>
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

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: theme.spacing.stackMd,
                }}
              >
                <TouchableOpacity
                  testID='task-sheet-close-top'
                  onPress={onClose}
                  hitSlop={12}
                  activeOpacity={0.82}
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: theme.radius.pill,
                    borderWidth: theme.borderWidth.default,
                    borderColor: theme.border.default,
                    backgroundColor: theme.bg.surface,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <MaterialIcons
                    name='close'
                    size={30}
                    color={theme.text.primary}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  testID='task-sheet-submit'
                  accessibilityLabel={
                    isEditMode
                      ? 'Save task from top bar'
                      : 'Add task from top bar'
                  }
                  onPress={handleSubmit}
                  disabled={!title.trim() || submitting}
                  activeOpacity={0.85}
                  style={{
                    backgroundColor: theme.accent.primary,
                    borderRadius: theme.radius.lg,
                    paddingHorizontal: theme.spacing.stackMd,
                    paddingVertical: theme.spacing.stackSm,
                    opacity: !title.trim() || submitting ? 0.5 : 1,
                  }}
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
                </TouchableOpacity>
              </View>

              <ScrollView
                keyboardShouldPersistTaps='handled'
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ gap: theme.spacing.stackSm }}
              >
                <TextInput
                  testID='task-sheet-title-input'
                  value={title}
                  onChangeText={setTitle}
                  placeholder={t('tasks.sheet.name_placeholder')}
                  placeholderTextColor={theme.text.tertiary}
                  style={{
                    backgroundColor: 'transparent',
                    borderWidth: 0,
                    color: theme.text.primary,
                    fontFamily: 'Lexend_600SemiBold',
                    fontSize: theme.typography.scale.titleSm.fontSize,
                    lineHeight: theme.typography.scale.titleSm.lineHeight,
                    minHeight: 44,
                    paddingHorizontal: 0,
                    paddingVertical: 4,
                  }}
                />

                <TextInput
                  testID='task-sheet-notes-input'
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={2}
                  placeholder={t('tasks.sheet.notes_placeholder')}
                  placeholderTextColor={theme.text.tertiary}
                  style={{
                    backgroundColor: theme.bg.surfaceAlt,
                    borderColor: theme.border.default,
                    borderWidth: theme.borderWidth.hairline,
                    borderRadius: theme.radius.md,
                    color: theme.text.primary,
                    fontFamily: 'Lexend_400Regular',
                    fontSize: theme.typography.scale.bodyMain.fontSize,
                    height: 56,
                    paddingHorizontal: theme.spacing.stackMd,
                    paddingVertical: 8,
                    textAlignVertical: 'top',
                  }}
                />

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
                    const isEditing = editingSubtaskIndex === index;
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
                        <TouchableOpacity
                          testID={`task-sheet-subtask-checkbox-${index}`}
                          onPress={() => toggleSubtaskCompleted(index)}
                          activeOpacity={0.82}
                          style={{
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
                          }}
                        >
                          {subtask.completed && (
                            <MaterialIcons
                              name='check'
                              size={18}
                              color={theme.accent.onPrimary}
                            />
                          )}
                        </TouchableOpacity>
                        {isEditing ? (
                          <TextInput
                            testID={`task-sheet-subtask-edit-input-${index}`}
                            value={editingSubtaskText}
                            onChangeText={setEditingSubtaskText}
                            onBlur={saveEditingSubtask}
                            onSubmitEditing={saveEditingSubtask}
                            autoFocus
                            returnKeyType='done'
                            style={{
                              flex: 1,
                              color: theme.accent.primary,
                              fontFamily: 'Lexend_600SemiBold',
                              fontSize:
                                theme.typography.scale.bodyMain.fontSize,
                              lineHeight:
                                theme.typography.scale.bodyMain.lineHeight,
                              paddingVertical: 0,
                            }}
                          />
                        ) : (
                          <TouchableOpacity
                            onPress={() => startEditingSubtask(index)}
                            activeOpacity={0.82}
                            style={{ flex: 1 }}
                          >
                            <Text
                              numberOfLines={1}
                              style={{
                                color: theme.text.primary,
                                fontFamily: 'Lexend_600SemiBold',
                                fontSize:
                                  theme.typography.scale.bodyMain.fontSize,
                                lineHeight:
                                  theme.typography.scale.bodyMain.lineHeight,
                                textDecorationLine: subtask.completed
                                  ? 'line-through'
                                  : 'none',
                                opacity: subtask.completed ? 0.6 : 1,
                              }}
                            >
                              {subtask.title}
                            </Text>
                          </TouchableOpacity>
                        )}
                        {isEditing && (
                          <TouchableOpacity
                            testID={`task-sheet-subtask-delete-${index}`}
                            onPress={() => {
                              removeSubtask(index);
                              setEditingSubtaskIndex(null);
                              setEditingSubtaskText('');
                            }}
                            activeOpacity={0.82}
                            hitSlop={8}
                            style={{
                              padding: 4,
                            }}
                          >
                            <MaterialIcons
                              name='delete-outline'
                              size={20}
                              color={theme.text.tertiary}
                            />
                          </TouchableOpacity>
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
                    <TouchableOpacity
                      onPress={commitSubtaskDraft}
                      activeOpacity={0.82}
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: theme.radius.sm,
                        borderWidth: theme.borderWidth.default,
                        borderColor: theme.text.tertiary,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <MaterialIcons
                        name='add'
                        size={18}
                        color={theme.text.tertiary}
                      />
                    </TouchableOpacity>
                    <TextInput
                      testID='task-sheet-add-subtask-input'
                      value={subtaskDraft}
                      onChangeText={setSubtaskDraft}
                      onSubmitEditing={commitSubtaskDraft}
                      onBlur={commitSubtaskDraft}
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
              </ScrollView>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
};
