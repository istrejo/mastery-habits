import React from 'react';
import { ErrorBoundary } from '../components/ErrorBoundary';

const renderer = require('react-test-renderer');
const { act, create } = renderer;
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const mockTheme = {
  bg: { base: '#FAFAFA', surface: '#FFFFFF', surfaceAlt: '#F4F4F4', elevated: '#FFFFFF' },
  border: { subtle: '#E5E5E5', default: '#E5E5E5', strong: '#111111' },
  text: { primary: '#111111', secondary: '#666666', tertiary: '#A3A3A3', inverse: '#FFFFFF' },
  accent: { primary: '#111111', onPrimary: '#FFFFFF', muted: 'rgba(17,17,17,0.10)' },
  score: { excellent: '#111111', good: '#111111', warning: '#666666', critical: '#BA1A1A' },
  level: {
    seed: { fg: '#666666', bg: '#F4F4F4', border: '#E5E5E5' },
    sprout: { fg: '#111111', bg: '#F4F4F4', border: '#E5E5E5' },
    tree: { fg: '#111111', bg: '#F4F4F4', border: '#E5E5E5' },
    forest: { fg: '#111111', bg: '#F4F4F4', border: '#111111' },
    ancient: { fg: '#FFFFFF', bg: '#111111', border: '#111111' },
  },
  status: { success: '#111111', skip: '#666666', danger: '#BA1A1A', info: '#666666' },
  activity: { none: '#F4F4F4', low: '#D8D8D8', medium: '#9A9A9A', high: '#555555', veryHigh: '#111111' },
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
  return {
    View: mock('View'),
    Text: mock('Text'),
    ScrollView: mock('ScrollView'),
    TouchableOpacity: mock('TouchableOpacity'),
    Pressable: mock('Pressable'),
    ActivityIndicator: mock('ActivityIndicator'),
  };
});

jest.mock('@expo/vector-icons', () => {
  const ReactLocal = require('react');
  return {
    MaterialIcons: (props: any) => ReactLocal.createElement('MaterialIcons', props, props.name),
  };
});

jest.mock('@core/theming', () => ({
  useTheme: () => mockTheme,
}));

jest.mock('@core/components', () => {
  const ReactLocal = require('react');
  return {
    Button: (props: any) => ReactLocal.createElement('Button', props, props.children),
  };
});

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'errors.boundary_title': 'Something broke',
        'errors.boundary_message': 'The app hit an unexpected error. Your data is safe — try reloading.',
        'errors.boundary_reload': 'Reload',
      };
      return map[key] ?? key;
    },
  }),
}));

const Bomb: React.FC<{ shouldThrow: boolean }> = ({ shouldThrow }) => {
  if (shouldThrow) throw new Error('boom');
  return React.createElement('Safe', null, 'child-rendered');
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders children when there is no error', () => {
    let tree: any;
    act(() => {
      tree = create(
        React.createElement(
          ErrorBoundary,
          null,
          React.createElement(Bomb, { shouldThrow: false }),
        ),
      );
    });

    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('child-rendered');
    expect(json).not.toContain('Something broke');
  });

  it('renders the fallback when a child throws', () => {
    let tree: any;
    act(() => {
      tree = create(
        React.createElement(
          ErrorBoundary,
          null,
          React.createElement(Bomb, { shouldThrow: true }),
        ),
      );
    });

    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Something broke');
    expect(json).toContain('Reload');
    expect(json).not.toContain('child-rendered');
  });

  it('calls onError with the error and component info', () => {
    const onError = jest.fn();
    act(() => {
      create(
        React.createElement(
          ErrorBoundary,
          { onError },
          React.createElement(Bomb, { shouldThrow: true }),
        ),
      );
    });

    expect(onError).toHaveBeenCalledTimes(1);
    const [error, info] = onError.mock.calls[0]!;
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toBe('boom');
    expect(info).toHaveProperty('componentStack');
  });

  it('recovers when the child stops throwing after retry', () => {
    let setShouldThrow: ((value: boolean) => void) | null = null;

    const Wrapper: React.FC = () => {
      const [shouldThrow, _setShouldThrow] = React.useState(true);
      setShouldThrow = _setShouldThrow;
      return React.createElement(
        ErrorBoundary,
        null,
        React.createElement(Bomb, { shouldThrow }),
      );
    };

    let tree: any;
    act(() => {
      tree = create(React.createElement(Wrapper));
    });

    let json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Something broke');

    act(() => {
      setShouldThrow?.(false);
    });

    json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Something broke');

    act(() => {
      tree.update(
        React.createElement(
          ErrorBoundary,
          { key: 'fresh' },
          React.createElement(Bomb, { shouldThrow: false }),
        ),
      );
    });

    json = JSON.stringify(tree.toJSON());
    expect(json).toContain('child-rendered');
    expect(json).not.toContain('Something broke');
  });
});
