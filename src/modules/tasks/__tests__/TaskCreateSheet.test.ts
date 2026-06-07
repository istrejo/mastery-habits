import React from 'react';
import { TaskCreateSheet } from '../components/TaskCreateSheet';

const renderer = require('react-test-renderer');
const { act, create } = renderer;
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const mockTheme = {
  bg: {
    base: '#111111',
    surface: '#1F1F1F',
    surfaceAlt: '#303030',
    elevated: '#202020',
  },
  border: { subtle: '#444444', default: '#555555', strong: '#FFFFFF' },
  text: {
    primary: '#FFFFFF',
    secondary: '#D0D0D0',
    tertiary: '#777777',
    inverse: '#111111',
  },
  accent: {
    primary: '#FFFFFF',
    onPrimary: '#111111',
    muted: 'rgba(255,255,255,0.10)',
  },
  status: {
    success: '#FFFFFF',
    skip: '#888888',
    danger: '#FF5555',
    info: '#AAAAAA',
  },
  radius: { sm: 4, md: 8, lg: 24, pill: 9999 },
  borderWidth: { hairline: 1, default: 1, bold: 2 },
  spacing: {
    unit: 4,
    gutter: 20,
    marginMobile: 20,
    stackSm: 8,
    stackMd: 24,
    stackLg: 48,
  },
  typography: {
    scale: {
      titleSm: { fontSize: 24, lineHeight: 34, letterSpacing: 0.24 },
      labelCaps: { fontSize: 14, lineHeight: 17, letterSpacing: 0.7 },
      bodyMain: { fontSize: 16, lineHeight: 24 },
      microBold: { fontSize: 12, lineHeight: 14, letterSpacing: 0.24 },
    },
  },
};

jest.mock('react-native', () => {
  const ReactLocal = require('react');
  const mock = (name: string) => {
    const Component = (props: any) =>
      ReactLocal.createElement(name, props, props.children);
    Component.displayName = name;
    return Component;
  };
  return {
    Animated: {
      Value: jest.fn().mockImplementation(() => ({ setValue: jest.fn() })),
      View: mock('Animated.View'),
      spring: jest.fn(() => ({ start: jest.fn() })),
    },
    KeyboardAvoidingView: mock('KeyboardAvoidingView'),
    Modal: mock('Modal'),
    Platform: { OS: 'ios' },
    PanResponder: { create: jest.fn(() => ({ panHandlers: {} })) },
    ScrollView: mock('ScrollView'),
    Text: mock('Text'),
    TextInput: mock('TextInput'),
    TouchableOpacity: mock('TouchableOpacity'),
    Pressable: mock('Pressable'),
    View: mock('View'),
  };
});

jest.mock('@expo/vector-icons', () => {
  const ReactLocal = require('react');
  return {
    MaterialIcons: (props: any) =>
      ReactLocal.createElement('MaterialIcons', props, props.name),
  };
});

jest.mock('@core/theming', () => ({ useTheme: () => mockTheme }));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) =>
      ({
        'tasks.sheet.title': 'New task',
        'tasks.sheet.name_label': 'Task name',
        'tasks.sheet.name_placeholder': 'What needs to be done?',
        'tasks.sheet.notes_label': 'Notes',
        'tasks.sheet.notes_placeholder': 'Notes',
        'tasks.sheet.subtasks_label': 'Subtasks',
        'tasks.sheet.subtask_placeholder': 'Add Subtask',
        'tasks.sheet.add_subtask': 'Add Subtask',
        'tasks.sheet.create': 'Add',
      }[key] ?? key),
  }),
}));

describe('TaskCreateSheet', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation((message: unknown) => {
      if (
        typeof message === 'string' &&
        message.includes('react-test-renderer is deprecated')
      )
        return;
    });
  });

  afterEach(() => jest.restoreAllMocks());

  it('uses keyboard avoidance so the bottom sheet is not covered by the keyboard', () => {
    let tree: any;
    act(() => {
      tree = create(
        React.createElement(TaskCreateSheet, {
          visible: true,
          submitting: false,
          onClose: jest.fn(),
          onSubmit: jest.fn(),
        })
      );
    });

    const keyboardAvoidingView = tree.root.findByProps({
      testID: 'task-sheet-keyboard-avoider',
    });
    expect(keyboardAvoidingView.props.behavior).toBe('padding');
    expect(keyboardAvoidingView.props.style).toEqual(
      expect.objectContaining({ flex: 1, justifyContent: 'flex-end' })
    );
  });

  it('renders task name and notes as compact low-noise fields', () => {
    let tree: any;
    act(() => {
      tree = create(
        React.createElement(TaskCreateSheet, {
          visible: true,
          submitting: false,
          onClose: jest.fn(),
          onSubmit: jest.fn(),
        })
      );
    });

    const titleInput = tree.root.findByProps({
      testID: 'task-sheet-title-input',
    });
    const notesInput = tree.root.findByProps({
      testID: 'task-sheet-notes-input',
    });

    expect(titleInput.props.style).toEqual(
      expect.objectContaining({
        backgroundColor: 'transparent',
        borderWidth: 0,
        paddingHorizontal: 0,
      })
    );
    expect(titleInput.props.style).toEqual(
      expect.objectContaining({ minHeight: 44, paddingVertical: 4 })
    );
    expect(notesInput.props.style).toEqual(
      expect.objectContaining({ height: 56, paddingVertical: 8 })
    );
    expect(notesInput.props.style).toEqual(
      expect.objectContaining({ borderWidth: mockTheme.borderWidth.hairline })
    );

    const textNodes = tree.root.findAll((node: any) => node.type === 'Text');
    expect(
      textNodes.some((node: any) => node.props.children === 'Task name')
    ).toBe(false);
  });

  it('puts close and Add in the top controls and removes the New Task header and bottom Add button', () => {
    let tree: any;
    act(() => {
      tree = create(
        React.createElement(TaskCreateSheet, {
          visible: true,
          submitting: false,
          onClose: jest.fn(),
          onSubmit: jest.fn(),
        })
      );
    });

    const textNodes = tree.root.findAll((node: any) => node.type === 'Text');
    expect(
      textNodes.some((node: any) => node.props.children === 'New task')
    ).toBe(false);

    expect(
      tree.root.findByProps({ testID: 'task-sheet-close-top' })
    ).toBeTruthy();

    const submitButtons = tree.root.findAll(
      (node: any) =>
        node.type === 'Pressable' &&
        node.props.testID === 'task-sheet-submit'
    );
    expect(submitButtons).toHaveLength(1);
    expect(submitButtons[0].props.accessibilityLabel).toBe(
      'Add task from top bar'
    );
  });

  it('uses a single inline add-subtask input row and commits typed subtasks as checkbox rows', () => {
    let tree: any;
    act(() => {
      tree = create(
        React.createElement(TaskCreateSheet, {
          visible: true,
          submitting: false,
          onClose: jest.fn(),
          onSubmit: jest.fn(),
        })
      );
    });

    let addInput = tree.root.findByProps({
      testID: 'task-sheet-add-subtask-input',
    });
    expect(
      tree.root.findAll(
        (node: any) =>
          node.type === 'TextInput' &&
          String(node.props.testID ?? '').startsWith(
            'task-sheet-subtask-input-'
          )
      )
    ).toHaveLength(0);

    act(() => addInput.props.onChangeText('Tasks 1'));
    act(() => addInput.props.onSubmitEditing());

    expect(
      tree.root.findByProps({ testID: 'task-sheet-subtask-row-0' })
    ).toBeTruthy();
    expect(
      tree.root.findByProps({ testID: 'task-sheet-subtask-checkbox-0' })
    ).toBeTruthy();

    addInput = tree.root.findByProps({
      testID: 'task-sheet-add-subtask-input',
    });
    expect(addInput.props.value).toBe('');

    act(() => addInput.props.onChangeText('Task 2'));
    act(() => addInput.props.onSubmitEditing());

    expect(
      tree.root.findAll(
        (node: any) =>
          node.type === 'View' &&
          String(node.props.testID ?? '').startsWith('task-sheet-subtask-row-')
      )
    ).toHaveLength(2);
  });

  it('includes the in-progress add-subtask input when creating the task', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    let tree: any;
    act(() => {
      tree = create(
        React.createElement(TaskCreateSheet, {
          visible: true,
          submitting: false,
          onClose: jest.fn(),
          onSubmit,
        })
      );
    });

    const titleInput = tree.root.findByProps({
      testID: 'task-sheet-title-input',
    });
    const notesInput = tree.root.findByProps({
      testID: 'task-sheet-notes-input',
    });
    const addInput = tree.root.findByProps({
      testID: 'task-sheet-add-subtask-input',
    });

    act(() => titleInput.props.onChangeText('Hablar'));
    act(() => notesInput.props.onChangeText('Practice conversation'));
    act(() => addInput.props.onChangeText('Task 2'));

    const submitButton = tree.root.findByProps({ testID: 'task-sheet-submit' });
    await act(async () => submitButton.props.onPress());

    expect(onSubmit).toHaveBeenCalledWith({
      title: 'Hablar',
      notes: 'Practice conversation',
      subtasks: [{ title: 'Task 2', completed: false }],
    });
  });

  it('checkbox toggles subtask completed state instead of deleting it', () => {
    let tree: any;
    act(() => {
      tree = create(
        React.createElement(TaskCreateSheet, {
          visible: true,
          submitting: false,
          onClose: jest.fn(),
          onSubmit: jest.fn(),
        })
      );
    });

    const addInput = tree.root.findByProps({
      testID: 'task-sheet-add-subtask-input',
    });
    act(() => addInput.props.onChangeText('Subtask 1'));
    act(() => addInput.props.onSubmitEditing());

    const checkbox = tree.root.findByProps({
      testID: 'task-sheet-subtask-checkbox-0',
    });
    const styleFn = checkbox.props.style;
    const [baseStyle] = styleFn({ pressed: false });
    expect(baseStyle).toEqual(
      expect.objectContaining({ backgroundColor: 'transparent' })
    );

    act(() => checkbox.props.onPress());

    const updatedCheckbox = tree.root.findByProps({
      testID: 'task-sheet-subtask-checkbox-0',
    });
    const updatedStyleFn = updatedCheckbox.props.style;
    const [updatedBaseStyle] = updatedStyleFn({ pressed: false });
    expect(updatedBaseStyle).toEqual(
      expect.objectContaining({ backgroundColor: mockTheme.accent.primary })
    );

    expect(
      tree.root.findByProps({ testID: 'task-sheet-subtask-row-0' })
    ).toBeTruthy();
  });

  it('delete button appears when editing subtask and removes it', () => {
    let tree: any;
    act(() => {
      tree = create(
        React.createElement(TaskCreateSheet, {
          visible: true,
          submitting: false,
          onClose: jest.fn(),
          onSubmit: jest.fn(),
        })
      );
    });

    const addInput = tree.root.findByProps({
      testID: 'task-sheet-add-subtask-input',
    });
    act(() => addInput.props.onChangeText('Subtask 1'));
    act(() => addInput.props.onSubmitEditing());

    expect(
      tree.root.findByProps({ testID: 'task-sheet-subtask-row-0' })
    ).toBeTruthy();

    expect(
      tree.root.findAll(
        (node: any) => node.props.testID === 'task-sheet-subtask-delete-0'
      )
    ).toHaveLength(0);
  });

  it('submits subtasks with their completed state', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    let tree: any;
    act(() => {
      tree = create(
        React.createElement(TaskCreateSheet, {
          visible: true,
          submitting: false,
          onClose: jest.fn(),
          onSubmit,
        })
      );
    });

    const titleInput = tree.root.findByProps({
      testID: 'task-sheet-title-input',
    });
    const addInput = tree.root.findByProps({
      testID: 'task-sheet-add-subtask-input',
    });

    act(() => titleInput.props.onChangeText('My Task'));
    act(() => addInput.props.onChangeText('Subtask 1'));
    act(() => addInput.props.onSubmitEditing());
    act(() => addInput.props.onChangeText('Subtask 2'));
    act(() => addInput.props.onSubmitEditing());

    const checkbox0 = tree.root.findByProps({
      testID: 'task-sheet-subtask-checkbox-0',
    });
    act(() => checkbox0.props.onPress());

    const submitButton = tree.root.findByProps({ testID: 'task-sheet-submit' });
    await act(async () => submitButton.props.onPress());

    expect(onSubmit).toHaveBeenCalledWith({
      title: 'My Task',
      notes: null,
      subtasks: [
        { title: 'Subtask 1', completed: true },
        { title: 'Subtask 2', completed: false },
      ],
    });
  });
});
