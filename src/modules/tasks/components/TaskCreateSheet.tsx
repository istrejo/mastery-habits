import React, { useMemo, useRef, useState } from 'react';
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

export interface TaskCreateSheetValues {
  title: string;
  notes?: string | null;
  subtasks: string[];
}

interface TaskCreateSheetProps {
  visible: boolean;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (values: TaskCreateSheetValues) => Promise<void>;
}

export const TaskCreateSheet: React.FC<TaskCreateSheetProps> = ({
  visible,
  submitting = false,
  onClose,
  onSubmit,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const translateY = useRef(new Animated.Value(0)).current;
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [subtaskDraft, setSubtaskDraft] = useState('');

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_event, gesture) => gesture.dy > 12,
        onPanResponderMove: (_event, gesture) => {
          if (gesture.dy > 0) translateY.setValue(gesture.dy);
        },
        onPanResponderRelease: (_event, gesture) => {
          if (gesture.dy > 90) {
            translateY.setValue(0);
            onClose();
            return;
          }
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
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

    await onSubmit({
      title: trimmedTitle,
      notes: notes.trim() || null,
      subtasks: [...subtasks, subtaskDraft]
        .map((item) => item.trim())
        .filter(Boolean),
    });
    reset();
    onClose();
  };

  const commitSubtaskDraft = () => {
    const trimmed = subtaskDraft.trim();
    if (!trimmed) return;
    setSubtasks((current) => [...current, trimmed]);
    setSubtaskDraft('');
  };

  const removeSubtask = (index: number) => {
    setSubtasks((current) => current.filter((_item, i) => i !== index));
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType='slide'
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
                  accessibilityLabel='Add task from top bar'
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
                    {t('tasks.sheet.create')}
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
                  {subtasks.map((subtask, index) => (
                    <View
                      key={`${subtask}-${index}`}
                      testID={`task-sheet-subtask-row-${index}`}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: theme.spacing.stackSm,
                      }}
                    >
                      <TouchableOpacity
                        testID={`task-sheet-subtask-checkbox-${index}`}
                        onPress={() => removeSubtask(index)}
                        activeOpacity={0.82}
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: theme.radius.sm,
                          borderWidth: theme.borderWidth.default,
                          borderColor: theme.text.primary,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      />
                      <Text
                        numberOfLines={1}
                        style={{
                          flex: 1,
                          color: theme.text.primary,
                          fontFamily: 'Lexend_600SemiBold',
                          fontSize: theme.typography.scale.bodyMain.fontSize,
                          lineHeight:
                            theme.typography.scale.bodyMain.lineHeight,
                        }}
                      >
                        {subtask}
                      </Text>
                    </View>
                  ))}
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
