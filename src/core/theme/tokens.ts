export const lightTheme = {
  // Primary
  '--color-primary': '#004ac6',
  '--color-on-primary': '#ffffff',
  '--color-primary-container': '#2563eb',
  '--color-on-primary-container': '#eeefff',
  '--color-primary-fixed': '#dbe1ff',
  '--color-primary-fixed-dim': '#b4c5ff',
  '--color-on-primary-fixed': '#00174b',
  '--color-on-primary-fixed-variant': '#003ea8',
  '--color-inverse-primary': '#b4c5ff',
  // Secondary
  '--color-secondary': '#006c49',
  '--color-on-secondary': '#ffffff',
  '--color-secondary-container': '#6cf8bb',
  '--color-on-secondary-container': '#00714d',
  '--color-secondary-fixed': '#6ffbbe',
  '--color-secondary-fixed-dim': '#4edea3',
  '--color-on-secondary-fixed': '#002113',
  '--color-on-secondary-fixed-variant': '#005236',
  // Tertiary
  '--color-tertiary': '#784b00',
  '--color-on-tertiary': '#ffffff',
  '--color-tertiary-container': '#996100',
  '--color-on-tertiary-container': '#ffeedd',
  '--color-tertiary-fixed': '#ffddb8',
  '--color-tertiary-fixed-dim': '#ffb95f',
  '--color-on-tertiary-fixed': '#2a1700',
  '--color-on-tertiary-fixed-variant': '#653e00',
  // Surface
  '--color-surface': '#f8f9ff',
  '--color-surface-dim': '#cbdbf5',
  '--color-surface-bright': '#f8f9ff',
  '--color-surface-container-lowest': '#ffffff',
  '--color-surface-container-low': '#eff4ff',
  '--color-surface-container': '#e5eeff',
  '--color-surface-container-high': '#dce9ff',
  '--color-surface-container-highest': '#d3e4fe',
  '--color-surface-variant': '#d3e4fe',
  '--color-surface-tint': '#0053db',
  '--color-on-surface': '#0b1c30',
  '--color-on-surface-variant': '#434655',
  '--color-inverse-surface': '#213145',
  '--color-inverse-on-surface': '#eaf1ff',
  // Background
  '--color-background': '#f8f9ff',
  '--color-on-background': '#0b1c30',
  // Outline
  '--color-outline': '#737686',
  '--color-outline-variant': '#c3c6d7',
  // Error
  '--color-error': '#ba1a1a',
  '--color-on-error': '#ffffff',
  '--color-error-container': '#ffdad6',
  '--color-on-error-container': '#93000a',
} as const;

// Dark theme — stub (same values as light; full dark palette deferred)
export const darkTheme: typeof lightTheme = {
  ...lightTheme,
};
