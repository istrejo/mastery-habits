# Anexo — Theming System (Mastery Habits)

> **Cómo usar este documento:** Este anexo se inyecta en la **Fase 2 (Core module)** del `MASTER_PROMPT.md`. Cuando Claude Code llegue a esa fase, debe leer este anexo antes de generar el Design System y construir los componentes consumiendo tokens del tema activo, no valores hardcodeados.

---

## 1. Filosofía del sistema

- La app soporta **4 temas intercambiables**, no un único modo claro/oscuro.
- Los temas son una **feature de producto** (potencial monetización: 1 tema gratis, 3 premium).
- Cada componente del Design System consume **tokens semánticos** (`bg.surface`, `text.score`, `accent.primary`), nunca colores literales.
- El cambio de tema es **instantáneo** y **persiste** en el `session.store` de Zustand.
- Los temas se definen en `src/modules/core/theming/` y se exponen vía un `ThemeProvider`.

---

## 2. Catálogo de temas

| ID                    | Nombre              | Tier           | Vibe                               | Modo   |
| --------------------- | ------------------- | -------------- | ---------------------------------- | ------ |
| `tech-neon`           | Tech Neon           | Free (default) | Linear/Vercel, datos protagonistas | Oscuro |
| `organic-growth`      | Organic Growth      | Premium        | Crecimiento natural, calma         | Oscuro |
| `minimal-light`       | Minimal Light       | Free           | Apple/Notion, monocromo            | Claro  |
| `brutalist-editorial` | Brutalist Editorial | Premium        | Revista, alto contraste            | Claro  |
| `cyberpunk`           | Cyberpunk           | Premium        | Magenta/cian, energía Blade Runner | Oscuro |
| `terminal-phosphor`   | Terminal Phosphor   | Premium        | Verde fósforo, monospace, CRT      | Oscuro |

**Default:** `tech-neon` (alineado con la decisión inicial del producto).
**Free tier:** `tech-neon`, `minimal-light`. **Premium tier:** los otros 4.

---

## 3. Arquitectura técnica

### 3.1. Estructura de carpetas

```
src/modules/core/theming/
├── types.ts                  # Theme, ThemeTokens, ThemeId
├── tokens.ts                 # Tokens semánticos (interfaz pura)
├── themes/
│   ├── techNeon.theme.ts
│   ├── organicGrowth.theme.ts
│   ├── minimalLight.theme.ts
│   ├── brutalistEditorial.theme.ts
│   ├── cyberpunk.theme.ts
│   └── terminalPhosphor.theme.ts
├── ThemeProvider.tsx         # Context + hook
├── useTheme.ts               # Hook público
├── theme.store.ts            # Zustand: tema activo + persistencia
└── index.ts                  # API pública del submódulo
```

### 3.2. Contrato de tokens (TypeScript)

```ts
// src/modules/core/theming/types.ts
export type ThemeId =
  | 'tech-neon'
  | 'organic-growth'
  | 'minimal-light'
  | 'brutalist-editorial'
  | 'cyberpunk'
  | 'terminal-phosphor';

export type MasteryLevel = 'seed' | 'sprout' | 'tree' | 'forest' | 'ancient';

export interface ThemeTokens {
  // Backgrounds
  bg: {
    base: string; // Fondo de pantalla
    surface: string; // Cards
    surfaceAlt: string; // Cards activas / hover
    elevated: string; // Modales
  };

  // Borders
  border: {
    subtle: string; // 0.5px tenue
    default: string; // 0.5px estándar
    strong: string; // 1.5px brutalist o 1px destacado
  };

  // Text
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string; // Texto sobre fondo de acento
  };

  // Accents (color principal del tema)
  accent: {
    primary: string; // Color héroe (botones, score alto)
    onPrimary: string; // Texto sobre acento
    muted: string; // Versión apagada para fondos
  };

  // Score states
  score: {
    excellent: string; // 71–100
    good: string; // 46–70
    warning: string; // 21–45
    critical: string; // 0–20
  };

  // Mastery levels (uno por nivel)
  level: Record<
    MasteryLevel,
    {
      fg: string; // Texto/icono
      bg: string; // Fondo del badge
      border: string;
    }
  >;

  // Semánticos
  status: {
    success: string; // Check-in completado
    skip: string; // Skip semanal usado
    danger: string; // Día fallado
    info: string;
  };

  // Estilo
  radius: {
    sm: number;
    md: number;
    lg: number;
    pill: number; // 999 normalmente, 0 en brutalist
  };

  borderWidth: {
    hairline: number; // 0.5
    default: number; // 1
    bold: number; // 1.5 brutalist, 1 resto
  };

  typography: {
    displayFontFamily?: string; // Fuente para números héroe (puede ser serif en algunos temas)
    bodyFontFamily?: string;
    numericFeatures: string; // 'tnum' siempre
  };

  // Metadata
  meta: {
    id: ThemeId;
    name: string;
    mode: 'light' | 'dark';
    tier: 'free' | 'premium';
  };
}
```

---

## 4. Definición de los 4 temas

### 4.1. Tech Neon (default)

```ts
export const techNeonTheme: ThemeTokens = {
  bg: {
    base: '#0a0a0a',
    surface: '#18181b',
    surfaceAlt: '#27272a',
    elevated: '#1f1f23',
  },
  border: {
    subtle: 'rgba(39, 39, 42, 0.6)',
    default: '#27272a',
    strong: '#3f3f46',
  },
  text: {
    primary: '#f4f4f5',
    secondary: '#a1a1aa',
    tertiary: '#71717a',
    inverse: '#0a0a0a',
  },
  accent: {
    primary: '#4ade80',
    onPrimary: '#0a0a0a',
    muted: '#052e16',
  },
  score: {
    excellent: '#4ade80',
    good: '#60a5fa',
    warning: '#fbbf24',
    critical: '#ef4444',
  },
  level: {
    seed: { fg: '#a3a3a3', bg: '#1f1f23', border: '#3f3f46' },
    sprout: { fg: '#fbbf24', bg: '#422006', border: '#92400e' },
    tree: { fg: '#60a5fa', bg: '#172554', border: '#1e3a8a' },
    forest: { fg: '#4ade80', bg: '#052e16', border: '#166534' },
    ancient: { fg: '#c084fc', bg: '#2e1065', border: '#6b21a8' },
  },
  status: {
    success: '#4ade80',
    skip: '#fbbf24',
    danger: '#ef4444',
    info: '#60a5fa',
  },
  radius: { sm: 6, md: 10, lg: 12, pill: 999 },
  borderWidth: { hairline: 0.5, default: 1, bold: 1 },
  typography: { numericFeatures: 'tnum' },
  meta: { id: 'tech-neon', name: 'Tech Neon', mode: 'dark', tier: 'free' },
};
```

### 4.2. Organic Growth

```ts
export const organicGrowthTheme: ThemeTokens = {
  bg: {
    base: '#1a2418',
    surface: '#243023',
    surfaceAlt: '#2a3528',
    elevated: '#2f3b2d',
  },
  border: {
    subtle: 'rgba(61, 74, 58, 0.5)',
    default: '#3d4a3a',
    strong: '#556b52',
  },
  text: {
    primary: '#e8e2d5',
    secondary: '#c5d0bd',
    tertiary: '#8a9583',
    inverse: '#1a2418',
  },
  accent: {
    primary: '#87a96b', // Verde musgo
    onPrimary: '#1a2418',
    muted: 'rgba(135, 169, 107, 0.2)',
  },
  score: {
    excellent: '#87a96b',
    good: '#a3b18a',
    warning: '#d4a373', // Tierra
    critical: '#bc6c25',
  },
  level: {
    seed: { fg: '#c5d0bd', bg: '#2a3528', border: '#3d4a3a' },
    sprout: {
      fg: '#d4a373',
      bg: 'rgba(212, 163, 115, 0.15)',
      border: '#a07956',
    },
    tree: { fg: '#a3b18a', bg: 'rgba(163, 177, 138, 0.15)', border: '#6b7d56' },
    forest: {
      fg: '#87a96b',
      bg: 'rgba(135, 169, 107, 0.18)',
      border: '#5a7a42',
    },
    ancient: {
      fg: '#e9c46a',
      bg: 'rgba(233, 196, 106, 0.15)',
      border: '#b8954f',
    },
  },
  status: {
    success: '#87a96b',
    skip: '#d4a373',
    danger: '#bc6c25',
    info: '#a3b18a',
  },
  radius: { sm: 8, md: 14, lg: 18, pill: 999 },
  borderWidth: { hairline: 0.5, default: 1, bold: 1 },
  typography: {
    displayFontFamily: 'Georgia', // Serif para números héroe
    numericFeatures: 'tnum',
  },
  meta: {
    id: 'organic-growth',
    name: 'Organic Growth',
    mode: 'dark',
    tier: 'premium',
  },
};
```

### 4.3. Minimal Light

```ts
export const minimalLightTheme: ThemeTokens = {
  bg: {
    base: '#fafaf9',
    surface: '#ffffff',
    surfaceAlt: '#f5f5f4',
    elevated: '#ffffff',
  },
  border: {
    subtle: '#e7e5e4',
    default: '#e7e5e4',
    strong: '#d6d3d1',
  },
  text: {
    primary: '#1c1917',
    secondary: '#57534e',
    tertiary: '#a8a29e',
    inverse: '#ffffff',
  },
  accent: {
    primary: '#1c1917', // Negro tinta
    onPrimary: '#ffffff',
    muted: '#f5f5f4',
  },
  score: {
    excellent: '#1c1917',
    good: '#57534e',
    warning: '#a8a29e',
    critical: '#dc2626',
  },
  level: {
    seed: { fg: '#78716c', bg: '#f5f5f4', border: '#e7e5e4' },
    sprout: { fg: '#57534e', bg: '#f5f5f4', border: '#d6d3d1' },
    tree: { fg: '#44403c', bg: '#f5f5f4', border: '#a8a29e' },
    forest: { fg: '#292524', bg: '#f5f5f4', border: '#78716c' },
    ancient: { fg: '#1c1917', bg: '#1c1917', border: '#1c1917' },
  },
  status: {
    success: '#1c1917',
    skip: '#a8a29e',
    danger: '#dc2626',
    info: '#57534e',
  },
  radius: { sm: 6, md: 10, lg: 14, pill: 999 },
  borderWidth: { hairline: 0.5, default: 1, bold: 1 },
  typography: { numericFeatures: 'tnum' },
  meta: {
    id: 'minimal-light',
    name: 'Minimal Light',
    mode: 'light',
    tier: 'free',
  },
};
```

### 4.4. Brutalist Editorial

```ts
export const brutalistEditorialTheme: ThemeTokens = {
  bg: {
    base: '#f4f0e8',
    surface: '#f4f0e8',
    surfaceAlt: '#ebe6da',
    elevated: '#ffffff',
  },
  border: {
    subtle: '#000000',
    default: '#000000',
    strong: '#000000',
  },
  text: {
    primary: '#000000',
    secondary: '#1c1917',
    tertiary: '#44403c',
    inverse: '#f4f0e8',
  },
  accent: {
    primary: '#ff5722',
    onPrimary: '#ffffff',
    muted: '#ffd0c2',
  },
  score: {
    excellent: '#ff5722',
    good: '#fbbf24',
    warning: '#fb923c',
    critical: '#dc2626',
  },
  level: {
    seed: { fg: '#000', bg: '#ebe6da', border: '#000' },
    sprout: { fg: '#000', bg: '#fbbf24', border: '#000' },
    tree: { fg: '#000', bg: '#fb923c', border: '#000' },
    forest: { fg: '#fff', bg: '#ff5722', border: '#000' },
    ancient: { fg: '#fff', bg: '#000', border: '#000' },
  },
  status: {
    success: '#ff5722',
    skip: '#fbbf24',
    danger: '#dc2626',
    info: '#0066cc',
  },
  radius: { sm: 0, md: 0, lg: 0, pill: 0 }, // Sin radius — brutalismo
  borderWidth: { hairline: 1.5, default: 1.5, bold: 2 }, // Bordes gruesos siempre
  typography: {
    displayFontFamily: 'Georgia',
    numericFeatures: 'tnum',
  },
  meta: {
    id: 'brutalist-editorial',
    name: 'Brutalist Editorial',
    mode: 'light',
    tier: 'premium',
  },
};
```

### 4.5. Cyberpunk

```ts
export const cyberpunkTheme: ThemeTokens = {
  bg: {
    base: '#0d0221', // Violeta noche profundo
    surface: '#1a0635',
    surfaceAlt: '#2d1b4e',
    elevated: '#22094a',
  },
  border: {
    subtle: '#2d1b4e',
    default: '#ff2a6d', // Magenta neón
    strong: '#ff2a6d',
  },
  text: {
    primary: '#f4f4f5',
    secondary: '#05d9e8', // Cian neón
    tertiary: '#9b87c8',
    inverse: '#0d0221',
  },
  accent: {
    primary: '#05d9e8', // Cian protagonista
    onPrimary: '#0d0221',
    muted: 'rgba(5, 217, 232, 0.2)',
  },
  score: {
    excellent: '#05d9e8',
    good: '#d600ff', // Violeta neón
    warning: '#ff9e00',
    critical: '#ff2a6d',
  },
  level: {
    seed: { fg: '#9b87c8', bg: '#1a0635', border: '#2d1b4e' },
    sprout: { fg: '#ff9e00', bg: 'rgba(255, 158, 0, 0.15)', border: '#ff9e00' },
    tree: { fg: '#d600ff', bg: 'rgba(214, 0, 255, 0.15)', border: '#d600ff' },
    forest: { fg: '#05d9e8', bg: 'rgba(5, 217, 232, 0.15)', border: '#05d9e8' },
    ancient: {
      fg: '#ff2a6d',
      bg: 'rgba(255, 42, 109, 0.15)',
      border: '#ff2a6d',
    },
  },
  status: {
    success: '#05d9e8',
    skip: '#ff9e00',
    danger: '#ff2a6d',
    info: '#d600ff',
  },
  radius: { sm: 2, md: 4, lg: 8, pill: 999 }, // Esquinas mínimas
  borderWidth: { hairline: 1, default: 1, bold: 1 }, // Bordes sólidos siempre
  typography: { numericFeatures: 'tnum' },
  meta: { id: 'cyberpunk', name: 'Cyberpunk', mode: 'dark', tier: 'premium' },
};
```

### 4.6. Terminal Phosphor

```ts
export const terminalPhosphorTheme: ThemeTokens = {
  bg: {
    base: '#001100', // Verde-negro CRT
    surface: '#002200',
    surfaceAlt: '#001a00',
    elevated: '#003300',
  },
  border: {
    subtle: '#00aa2a',
    default: '#00ff41', // Verde fósforo
    strong: '#00ff41',
  },
  text: {
    primary: '#00ff41', // Todo el texto en fósforo
    secondary: '#00cc33',
    tertiary: '#008822',
    inverse: '#001100',
  },
  accent: {
    primary: '#00ff41',
    onPrimary: '#001100',
    muted: 'rgba(0, 255, 65, 0.2)',
  },
  score: {
    excellent: '#00ff41',
    good: '#00cc33',
    warning: '#88aa00',
    critical: '#aa0000', // Rojo CRT (única excepción al monocromo)
  },
  level: {
    seed: { fg: '#008822', bg: '#001a00', border: '#00aa2a' },
    sprout: { fg: '#00aa2a', bg: '#001a00', border: '#00cc33' },
    tree: { fg: '#00cc33', bg: '#001a00', border: '#00ff41' },
    forest: { fg: '#00ff41', bg: '#002200', border: '#00ff41' },
    ancient: { fg: '#001100', bg: '#00ff41', border: '#00ff41' }, // Inverso para "maestría"
  },
  status: {
    success: '#00ff41',
    skip: '#88aa00',
    danger: '#aa0000',
    info: '#00cc33',
  },
  radius: { sm: 0, md: 0, lg: 0, pill: 0 }, // Cero radius — terminal puro
  borderWidth: { hairline: 1, default: 1, bold: 1 },
  typography: {
    displayFontFamily: 'Courier New', // Monospace en todo
    bodyFontFamily: 'Courier New',
    numericFeatures: 'tnum',
  },
  meta: {
    id: 'terminal-phosphor',
    name: 'Terminal Phosphor',
    mode: 'dark',
    tier: 'premium',
  },
};
```

---

## 5. ThemeProvider y hook

```ts
// src/modules/core/theming/ThemeProvider.tsx
import React, { createContext, useContext, useMemo } from 'react';
import { useThemeStore } from './theme.store';
import { techNeonTheme } from './themes/techNeon.theme';
import { organicGrowthTheme } from './themes/organicGrowth.theme';
import { minimalLightTheme } from './themes/minimalLight.theme';
import { brutalistEditorialTheme } from './themes/brutalistEditorial.theme';
import { cyberpunkTheme } from './themes/cyberpunk.theme';
import { terminalPhosphorTheme } from './themes/terminalPhosphor.theme';
import type { ThemeId, ThemeTokens } from './types';

const THEMES: Record<ThemeId, ThemeTokens> = {
  'tech-neon': techNeonTheme,
  'organic-growth': organicGrowthTheme,
  'minimal-light': minimalLightTheme,
  'brutalist-editorial': brutalistEditorialTheme,
  'cyberpunk': cyberpunkTheme,
  'terminal-phosphor': terminalPhosphorTheme,
};

const ThemeContext = createContext<ThemeTokens>(techNeonTheme);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const themeId = useThemeStore((s) => s.themeId);
  const theme = useMemo(() => THEMES[themeId], [themeId]);
  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeTokens => useContext(ThemeContext);
```

```ts
// src/modules/core/theming/theme.store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ThemeId } from './types';

interface ThemeState {
  themeId: ThemeId;
  setTheme: (id: ThemeId) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      themeId: 'tech-neon',
      setTheme: (id) => set({ themeId: id }),
    }),
    {
      name: 'mastery-habits-theme',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

---

## 6. Reglas para componentes del Design System

Los componentes en `src/modules/core/components/` consumen tokens vía `useTheme()`. **Prohibido** hardcodear colores o radios.

### Ejemplo correcto:

```tsx
// src/modules/core/components/Card.tsx
import { View, ViewProps } from 'react-native';
import { useTheme } from '@core/theming';

export const Card: React.FC<ViewProps> = ({ style, children, ...rest }) => {
  const t = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: t.bg.surface,
          borderColor: t.border.default,
          borderWidth: t.borderWidth.hairline,
          borderRadius: t.radius.lg,
          padding: 14,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
};
```

### Ejemplo incorrecto (NO HACER):

```tsx
// ❌ Hardcoded — se rompe al cambiar de tema
<View style={{ backgroundColor: '#18181b', borderRadius: 12 }} />
```

### NativeWind (opcional pero recomendado)

Si se usa NativeWind, los tokens se inyectan como CSS variables en `tailwind.config.js` desde el tema activo, regeneradas en runtime mediante un wrapper. Para el MVP es aceptable usar `useTheme()` + `style={...}` directamente. La integración con NativeWind se deja como mejora post-MVP.

---

## 7. Pantalla de selección de tema

Crear pantalla `app/(tabs)/profile.tsx → ThemePicker` que:

- Muestra los **6 temas** como cards previews (mini render del dashboard).
- Indica con badge cuál es `free` y cuál `premium`. Los premium quedan visibles pero "bloqueados" en el MVP — al tocarlos muestran un modal "Próximamente".
- Permite seleccionar entre los 2 temas free: `tech-neon` y `minimal-light`.
- Persiste la selección automáticamente.
- Agrupa visualmente: free arriba, premium abajo con un divider sutil.

---

## 8. Checklist de Definition of Done para temas

- [ ] Cambiar de `tech-neon` a `minimal-light` desde el ThemePicker actualiza toda la UI sin reiniciar la app.
- [ ] Tras cerrar y reabrir la app, el tema seleccionado persiste.
- [ ] Ningún componente del Design System tiene colores hardcodeados (búsqueda de hex en `src/modules/core/components/` debe devolver 0 resultados).
- [ ] Los temas premium aparecen pero están bloqueados con modal.
- [ ] El nivel de maestría (badge) usa los colores correctos en cada tema (no se ve igual el badge "Forest" en Tech Neon que en Brutalist).

---

**Fin del anexo. Integrar en la Fase 2 del `MASTER_PROMPT.md` antes de generar el Design System.**
