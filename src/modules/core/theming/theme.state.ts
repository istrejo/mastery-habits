import { DEFAULT_THEME_ID, resolveThemeId, type EnabledThemeId } from './theme.config';

export interface ThemeSelectionState {
  themeId: EnabledThemeId;
}

export const createThemeSelectionState = (
  themeId: unknown = DEFAULT_THEME_ID
): ThemeSelectionState => ({
  themeId: resolveThemeId(themeId),
});

export const mergeThemeSelectionState = (
  persistedState?: Partial<ThemeSelectionState>,
  currentState: ThemeSelectionState = createThemeSelectionState()
): ThemeSelectionState => ({
  ...currentState,
  ...createThemeSelectionState(persistedState?.themeId),
});
