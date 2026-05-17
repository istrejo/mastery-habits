import {
  DEFAULT_THEME_ID,
  ENABLED_THEME_IDS,
  THEMES,
  THEMES_BY_MODE,
  getThemeById,
  resolveThemeId,
} from '../theme.config';
import {
  createThemeSelectionState,
  mergeThemeSelectionState,
} from '../theme.state';

describe('theme configuration', () => {
  it('registers the Stitch dark palette with the expected semantic tokens', () => {
    const darkTheme = THEMES['minimal-dark'];

    expect(darkTheme.meta).toMatchObject({
      id: 'minimal-dark',
      name: 'Mastery Habits Dark',
      mode: 'dark',
    });
    expect(darkTheme.bg).toEqual({
      base: '#111111',
      surface: '#1C1C1C',
      surfaceAlt: '#242424',
      elevated: '#1C1C1C',
    });
    expect(darkTheme.text).toEqual({
      primary: '#F0F0F0',
      secondary: '#999999',
      tertiary: '#5C5C5C',
      inverse: '#111111',
    });
    expect(darkTheme.accent).toEqual({
      primary: '#F0F0F0',
      onPrimary: '#111111',
      muted: 'rgba(240, 240, 240, 0.10)',
    });
    expect(darkTheme.activity).toEqual({
      none: '#242424',
      low: '#383838',
      medium: '#555555',
      high: '#A0A0A0',
      veryHigh: '#F0F0F0',
    });
    expect(darkTheme.level.ancient).toEqual({
      fg: '#111111',
      bg: '#F0F0F0',
      border: '#F0F0F0',
    });
  });

  it('keeps the visible theme order stable for the picker list', () => {
    expect(ENABLED_THEME_IDS).toEqual(['minimal-light', 'minimal-dark']);
    expect(THEMES_BY_MODE.light).toEqual(['minimal-light']);
    expect(THEMES_BY_MODE.dark).toEqual(['minimal-dark']);
  });

  it('resolves runtime theme ids with a safe fallback to light', () => {
    expect(resolveThemeId('minimal-light')).toBe('minimal-light');
    expect(resolveThemeId('minimal-dark')).toBe('minimal-dark');
    expect(resolveThemeId('tech-neon')).toBe(DEFAULT_THEME_ID);
    expect(resolveThemeId('unexpected-theme')).toBe(DEFAULT_THEME_ID);
    expect(getThemeById('unexpected-theme').meta.id).toBe('minimal-light');
  });

  it('sanitizes store state when initializing or merging persisted values', () => {
    expect(createThemeSelectionState()).toEqual({ themeId: 'minimal-light' });
    expect(createThemeSelectionState('minimal-dark')).toEqual({
      themeId: 'minimal-dark',
    });
    expect(
      mergeThemeSelectionState({
        themeId: 'tech-neon' as never,
      })
    ).toEqual({ themeId: 'minimal-light' });
    expect(
      mergeThemeSelectionState({
        themeId: 'minimal-dark',
      })
    ).toEqual({ themeId: 'minimal-dark' });
  });
});
