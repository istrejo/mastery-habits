# ============================================================

# MASTER PROMPT — UI MIGRATION CON STITCH MCP

# Proyecto Stitch: Mastery Habits Tracker

# Project ID: 17054801401337424439

# Rama trabajo: feat/stitch-ui-migration

# Rama destino: dev

# ============================================================

## ROL Y CONTEXTO

Actúas como arquitecto frontend senior.
Tu misión es migrar la UI de esta aplicación
usando el MCP de Stitch como fuente de verdad
del diseño.

El proyecto de diseño en Stitch ya existe y
está siendo utilizado activamente. Las vistas
del proyecto actual también ya existen.

Principio fundamental:
NUNCA reescribas una vista desde cero.
SIEMPRE modifica lo que ya existe para
adaptarlo al diseño de Stitch.
La lógica, rutas, servicios y estado
deben permanecer intactos.

El proyecto de diseño en Stitch es:
Título : Mastery Habits Tracker
ID : 17054801401337424439

## REGLA DE TRABAJO — OBLIGATORIA

NUNCA implementes código sin que yo apruebe
explícitamente la fase en curso.
Cada fase termina con un bloque ⚠️ STOP.
Espera que yo escriba algo como:
"✅ Aprobado, continúa con la Fase X"
Si no recibes esa confirmación, detente.

## PASO 0 — RAMA DE TRABAJO (ejecutar primero)

ANTES de cualquier análisis o código:

git checkout dev
git pull origin dev
git checkout -b feat/stitch-ui-migration

Confirma la rama creada y el hash del commit
base antes de continuar.

## PASO 1 — DESCARGA DE ASSETS DE STITCH

Usa el MCP de Stitch para obtener imágenes
y código de las siguientes pantallas.
Si el MCP no resuelve un asset, usa curl -L
sobre la URL hosteada que devuelva el MCP.

Pantallas a descargar:

## Design Tokens / Sistema de diseño

asset-stub-assets-208f2aaa173e40a7bafa0e603ba8d1c2-1778506142061
asset-stub-assets-00334a8ee8d148b6bb37ea92922333b8-1778505998073

## Pantallas dark (tema principal)

Login : 47dfbfa79e5d4cb1ba5709df0105e05b
Today Dashboard: 4d8af5e5a2194e1b8e4aaff30a80d618
Register : a65721334de5488aaa9e61337f166c56
Power Grid : 1acde434081141659cf880bbb4683096
Stats Dashboard: e0f05f2d26894f2d89b9c8fe83c55c3b
Profile : 982721159650405a8a041dd3faec80e4

## Pantallas light (tema alternativo)

Today Dashboard: 0be7da39e94444028b5025288048f531
Stats Dashboard: 5e880946d0a249a89b194f206292c0ef
Power Grid : 6bf1a9e88cc24f82a46348fe6b92c8b4

## Selector de tema

Theme Selector : 7cead585bae64e2995e5f748616af3a4

Guarda imágenes en: ./stitch-assets/
Guarda código/specs en: ./stitch-specs/

⚠️ STOP — Confirma que todos los assets
se descargaron correctamente. Muestra
la lista de archivos obtenidos y cualquier
error. Espera mi aprobación.

## FASE 1 — ANÁLISIS DE COMPATIBILIDAD

(Solo tras aprobación del Paso 1)

Con los assets descargados, genera un reporte
estructurado con estas secciones:

### A. SISTEMA DE DISEÑO — Tokens extraídos

Analiza los 2 assets de Design System y extrae:

- Paleta de colores (dark + light)
- Escala tipográfica (familias, tamaños, pesos)
- Espaciado y grid
- Radios de borde, sombras, iconografía
- Variables del tema (dark/light switching)

Para cada token indica:
¿Existe en el proyecto actual? sí/no
Nombre actual vs nombre Stitch
Delta de valor
Impacto: ALTO / MEDIO / BAJO

### B. INVENTARIO DE VISTAS EXISTENTES

El proyecto ya tiene vistas implementadas.
Para cada pantalla de Stitch, localiza el
archivo o componente existente en el proyecto
y documenta qué debe cambiar:

Login / Register → archivo(s) existente(s)?
Today Dashboard → archivo(s) existente(s)?
Stats Dashboard → archivo(s) existente(s)?
Power Grid → archivo(s) existente(s)?
Profile → archivo(s) existente(s)?
Theme Selector → archivo(s) existente(s)?

Por cada vista indica qué se modifica:
🔴 Cambios estructurales mayores (markup)
🟡 Cambios de estilos y tokens solamente
🟢 Solo actualización de variables CSS

Si una vista no existe en el proyecto actual,
márcala como NUEVA y no la crees hasta que
yo lo apruebe explícitamente.

### C. THEMING DARK / LIGHT

El diseño tiene dos temas completos.
Analiza si el proyecto ya tiene un mecanismo
de theming. Si existe, documenta cómo funciona
y propón cómo extenderlo para Stitch.
Si no existe, propón la estrategia antes de
implementar nada.

### D. RIESGOS Y BREAKING CHANGES

- Cambios estructurales que pueden romper
  la funcionalidad existente
- Dependencias de terceros afectadas
- Impacto en accesibilidad (a11y)
- Estimación de esfuerzo por área (horas)

### E. PLAN DE FASES PROPUESTO

Basándote en el análisis, propón el orden
de modificación. Considera estas áreas:

1. Tokens y variables globales
2. Theming dark/light
3. Componentes base compartidos
4. Auth (Login / Register)
5. Today Dashboard
6. Stats Dashboard + Power Grid
7. Profile
8. Theme Selector

⚠️ STOP — Entrega el reporte completo
y espera mi aprobación antes de tocar
una sola línea de código.

## FASE 2 — TOKENS Y VARIABLES GLOBALES

(Solo tras aprobación de Fase 1)

- Sincroniza tokens de Stitch al sistema del
  proyecto (CSS custom props / SCSS / tokens.json)
- Modifica los archivos de variables existentes,
  no crees archivos nuevos salvo que sea
  estrictamente necesario y lo justifiques.
- Configura las dos paletas: dark y light
- NO toques componentes ni vistas todavía
- Commit: feat(tokens): sync stitch design tokens

Entrega diff resumido de cambios.

⚠️ STOP — Espera aprobación.

## FASE 3 — SISTEMA DE THEMING DARK/LIGHT

(Solo tras aprobación de Fase 2)

Extiende o adapta el mecanismo de theming
existente según la estrategia aprobada en
Fase 1. No reemplaces el sistema actual,
modifícalo para soportar los temas de Stitch.
Valida que Theme Selector (7cead585...)
pueda integrarse con el mecanismo existente.
Commit: feat(theme): extend dark/light theming system

⚠️ STOP — Espera aprobación.

## FASE 4 — COMPONENTES BASE (átomos)

(Solo tras aprobación de Fase 3)

Modifica los componentes compartidos existentes
para aplicar los tokens de Stitch.
Orden sugerido: Button → Input → Badge →
Icon → Typography → Card.

Por cada componente:

- Modifica los estilos del archivo existente
- Mantén la API pública intacta
  (@Input, @Output, selectores CSS)
- No cambies el nombre ni la ubicación
  del componente
- Agrega comentario: /_ stitch: [nombre] _/
- Un commit atómico por componente

⚠️ STOP — Espera aprobación.

## FASE 5 — AUTH (Login + Register)

(Solo tras aprobación de Fase 4)

Referencia visual obligatoria:
Login 47dfbfa79e5d4cb1ba5709df0105e05b
Register a65721334de5488aaa9e61337f166c56

Modifica los archivos existentes de Login y
Register para adaptarlos al diseño de Stitch.
No toques la lógica de autenticación,
validaciones, ni el manejo de errores.
Solo modifica markup y estilos donde sea
necesario para igualar el diseño.
Commit: feat(auth): apply stitch design to auth screens

⚠️ STOP — Espera aprobación.

## FASE 6 — TODAY DASHBOARD

(Solo tras aprobación de Fase 5)

Referencia visual obligatoria (dark + light):
Dark 4d8af5e5a2194e1b8e4aaff30a80d618
Light 0be7da39e94444028b5025288048f531

Modifica los archivos existentes del dashboard.
Valida que ambos temas se vean correctamente
sin duplicar lógica de negocio.
Commit: feat(dashboard): apply stitch design to today view

⚠️ STOP — Espera aprobación.

## FASE 7 — STATS DASHBOARD + POWER GRID

(Solo tras aprobación de Fase 6)

Referencia visual obligatoria:
Stats dark e0f05f2d26894f2d89b9c8fe83c55c3b
Stats light 5e880946d0a249a89b194f206292c0ef
Grid dark 1acde434081141659cf880bbb4683096
Grid light 6bf1a9e88cc24f82a46348fe6b92c8b4

Modifica los archivos existentes de Stats y
Power Grid. Si Power Grid no existe aún en
el proyecto, detente, notifícame y espera
aprobación explícita antes de crearlo.

⚠️ STOP — Espera aprobación.

## FASE 8 — PROFILE + THEME SELECTOR

(Solo tras aprobación de Fase 7)

Referencia visual obligatoria:
Profile 982721159650405a8a041dd3faec80e4
Theme Selector 7cead585bae64e2995e5f748616af3a4

Modifica los archivos existentes de Profile.
Para Theme Selector: si ya existe un componente
de selección de tema, modifícalo. Si no existe,
notifícame antes de crearlo.
Asegura la integración con el theming de Fase 3.

⚠️ STOP — Espera aprobación.

## FASE FINAL — QA Y MERGE PREP

(Solo tras aprobación de Fase 8)

1. Ejecuta linter y tests existentes. Reporta fallos.
2. Verifica ambos temas en todas las vistas.
3. Genera resumen de todos los commits de la rama.
4. Crea borrador del PR hacia dev con:
   - Descripción de cambios por fase
   - Lista de vistas modificadas con IDs Stitch
   - Checklist de QA completada
5. NO hagas merge. Deja el PR listo para revisión.

## RESTRICCIONES GLOBALES

- Rama de trabajo : feat/stitch-ui-migration
- Rama destino : dev
- NUNCA hagas push directo a main o dev
- NUNCA elimines tests existentes
- NUNCA reescribas una vista desde cero;
  modifica siempre los archivos existentes
- NUNCA cambies la API pública de un componente
  sin advertirlo explícitamente y esperar OK
- NUNCA crees una vista o componente nuevo
  sin notificarlo y recibir aprobación
- NUNCA toques lógica de negocio, servicios,
  estado o rutas; solo markup y estilos
- Commits atómicos en Conventional Commits
- Usa el MCP de Stitch como fuente de verdad.
  No asumas tokens ni medidas de memoria.
- Los IDs de pantalla son la referencia
  canónica, úsalos en cada fase.

## INICIO

Comienza por PASO 0 (rama) y luego
PASO 1 (descarga de assets).
Detente y muéstrame los archivos descargados.
