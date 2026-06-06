import React from 'react';
import { Toast } from '../components/Toast';

const renderer = require('react-test-renderer');
const { act, create } = renderer;
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const mockTheme = {
  bg: { base: '#FAFAFA', surface: '#FFFFFF', surfaceAlt: '#F4F4F4', elevated: '#FFFFFF' },
  border: { subtle: '#E5E5E5', default: '#E5E5E5', strong: '#111111' },
  text: { primary: '#111111', secondary: '#666666', tertiary: '#A3A3A3', inverse: '#FFFFFF' },
  accent: { primary: '#111111', onPrimary: '#FFFFFF', muted: 'rgba(17,17,17,0.10)' },
  score: { excellent: '#111', good: '#111', warning: '#666', critical: '#BA1A1A' },
  level: {
    seed: { fg: '#666', bg: '#F4F4F4', border: '#E5E5E5' },
    sprout: { fg: '#111', bg: '#F4F4F4', border: '#E5E5E5' },
    tree: { fg: '#111', bg: '#F4F4F4', border: '#E5E5E5' },
    forest: { fg: '#111', bg: '#F4F4F4', border: '#111' },
    ancient: { fg: '#FFF', bg: '#111', border: '#111' },
  },
  status: { success: '#22C55E', skip: '#666', danger: '#BA1A1A', info: '#666' },
  activity: { none: '#F4F4F4', low: '#D8D8D8', medium: '#9A9A9A', high: '#555', veryHigh: '#111' },
  radius: { sm: 4, md: 8, lg: 12, pill: 9999 },
  borderWidth: { hairline: 1, default: 1, bold: 2 },
  spacing: { unit: 4, gutter: 20, marginMobile: 20, stackSm: 8, stackMd: 24, stackLg: 48 },
  typography: {
    displayFontFamily: 'Anton_400Regular',
    bodyFontFamily: 'Lexend_400Regular',
    numericFeatures: 'tnum',
    scale: {
      displayXl: { fontSize: 64, fontWeight: '400', lineHeight: 82, letterSpacing: 1.28 },
      displaySm: { fontSize: 40, fontWeight: '400', lineHeight: 54, letterSpacing: 0.8 },
      titleLg: { fontSize: 32, fontWeight: '400', lineHeight: 44, letterSpacing: 0.64 },
      titleSm: { fontSize: 24, fontWeight: '400', lineHeight: 34, letterSpacing: 0.24 },
      labelCaps: { fontSize: 14, fontWeight: '600', lineHeight: 17, letterSpacing: 0.7 },
      bodyMain: { fontSize: 16, fontWeight: '400', lineHeight: 24, letterSpacing: 0 },
      microBold: { fontSize: 12, fontWeight: '500', lineHeight: 14, letterSpacing: 0.24 },
    },
  },
  categoryColors: {
    green: { fg: '#111', bg: '#fff', border: '#111' },
    violet: { fg: '#111', bg: '#fff', border: '#111' },
    blue: { fg: '#111', bg: '#fff', border: '#111' },
    yellow: { fg: '#111', bg: '#fff', border: '#111' },
    orange: { fg: '#111', bg: '#fff', border: '#111' },
    pink: { fg: '#111', bg: '#fff', border: '#111' },
    cyan: { fg: '#111', bg: '#fff', border: '#111' },
    emerald: { fg: '#111', bg: '#fff', border: '#111' },
    neutral: { fg: '#111', bg: '#fff', border: '#111' },
  },
  meta: { id: 'minimal-light', name: 'Minimal Light', mode: 'light', tier: 'free' },
};

jest.mock('react-native', () => {
  const ReactLocal = require('react');
  const mock = (name: string) => {
    const Component = (props: any) => ReactLocal.createElement(name, props, props.children);
    Component.displayName = name;
    return Component;
  };
  const AnimatedView = (props: any) => ReactLocal.createElement('AnimatedView', props, props.children);
  AnimatedView.displayName = 'AnimatedView';
  const AnimatedMock: any = {
    View: AnimatedView,
    Value: class {
      private val: number;
      constructor(v: number) { this.val = v; }
      setValue(v: number) { this.val = v; }
    },
    timing: () => ({ start: (cb?: () => void) => cb?.() }),
    parallel: (anims: unknown[]) => ({
      start: (cb?: () => void) => {
        (anims as { start: (cb?: () => void) => void }[]).forEach((a) => a.start?.());
        cb?.();
      },
    }),
  };
  return {
    View: mock('View'),
    Text: mock('Text'),
    Animated: AnimatedMock,
  };
});

jest.mock('@core/theming', () => ({
  useTheme: () => mockTheme,
}));

describe('Toast', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders nothing when message is null', () => {
    let tree: any;
    act(() => {
      tree = create(React.createElement(Toast, { message: null }));
    });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toBe('null');
  });

  it('renders the message when provided', () => {
    let tree: any;
    act(() => {
      tree = create(React.createElement(Toast, { message: 'something went wrong' }));
    });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('something went wrong');
    expect(json).toContain('⚠');
  });

  it('uses the success icon and color for variant="success"', () => {
    let tree: any;
    act(() => {
      tree = create(React.createElement(Toast, { message: 'all good', variant: 'success' }));
    });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('✓');
    expect(json).toContain('all good');
  });

  it('uses the info icon for variant="info"', () => {
    let tree: any;
    act(() => {
      tree = create(React.createElement(Toast, { message: 'just so you know', variant: 'info' }));
    });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('ℹ');
  });

  it('calls onHide after the duration elapses', () => {
    const onHide = jest.fn();
    act(() => {
      create(React.createElement(Toast, { message: 'transient', duration: 1000, onHide }));
    });

    expect(onHide).not.toHaveBeenCalled();
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(onHide).toHaveBeenCalledTimes(1);
  });

  it('clears the timer when the message changes', () => {
    const onHide = jest.fn();
    let setProps: ((p: object) => void) | null = null;
    const Wrapper: React.FC = () => {
      const [msg, setMsg] = React.useState<string | null>('first');
      setProps = () => setMsg('second');
      return React.createElement(Toast, { message: msg, duration: 1000, onHide });
    };
    act(() => {
      create(React.createElement(Wrapper));
    });

    act(() => {
      jest.advanceTimersByTime(500);
    });
    act(() => {
      setProps?.({});
    });
    act(() => {
      jest.advanceTimersByTime(600);
    });
    expect(onHide).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(onHide).toHaveBeenCalledTimes(1);
  });
});
